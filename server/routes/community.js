import { Router } from 'express';
import pool from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// ─── Community feed ────────────────────────────────────────────
router.get('/feed', authenticate, async (req, res) => {
    try {
        const eventsQuery = await pool.query(`
            SELECT fe.*, u.name as user_name, u.avatar_emoji 
            FROM feed_events fe
            LEFT JOIN users u ON fe.user_id = u.id
            ORDER BY fe.created_at DESC 
            LIMIT 30
        `);
        const events = eventsQuery.rows;

        // Add relative time
        const now = new Date();
        const withTime = events.map(e => {
            const created = new Date(e.created_at);
            const diffMs = now - created;
            const diffMins = Math.floor(diffMs / 60000);
            let timeAgo;
            if (diffMins < 1) timeAgo = 'just now';
            else if (diffMins < 60) timeAgo = `${diffMins}m ago`;
            else if (diffMins < 1440) timeAgo = `${Math.floor(diffMins / 60)}h ago`;
            else timeAgo = `${Math.floor(diffMins / 1440)}d ago`;

            return { ...e, time_ago: timeAgo };
        });

        res.json(withTime);
    } catch (err) {
        console.error('Feed error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── Leaderboard (top streakers) ──────────────────────────────
router.get('/leaderboard', authenticate, async (req, res) => {
    try {
        const leadersQuery = await pool.query(`
            SELECT u.id, u.name, u.avatar_emoji, u.city,
                   s.current_streak, s.best_streak, s.multiplier
            FROM streaks s
            JOIN users u ON s.user_id = u.id
            WHERE s.current_streak > 0
            ORDER BY s.current_streak DESC
            LIMIT 20
        `);
        const leaders = leadersQuery.rows;

        // Mark the requesting user
        const result = leaders.map((l, i) => ({
            ...l,
            rank: i + 1,
            is_you: l.id === req.user.id,
            multiplier_label: `${l.multiplier}×`,
        }));

        // If user not in top 20, add them
        const userInList = result.find(r => r.is_you);
        if (!userInList) {
            const userStreakQuery = await pool.query(`
                SELECT u.id, u.name, u.avatar_emoji, u.city,
                       s.current_streak, s.best_streak, s.multiplier
                FROM streaks s JOIN users u ON s.user_id = u.id WHERE u.id = $1
            `, [req.user.id]);
            const userStreak = userStreakQuery.rows[0];

            if (userStreak) {
                const rankQuery = await pool.query('SELECT COUNT(*) as c FROM streaks WHERE current_streak > $1', [userStreak.current_streak]);
                const rank = parseInt(rankQuery.rows[0].c, 10) + 1;
                result.push({
                    ...userStreak,
                    rank,
                    is_you: true,
                    multiplier_label: `${userStreak.multiplier}×`,
                });
            }
        }

        res.json(result);
    } catch (err) {
        console.error('Leaderboard error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── Daily check-in ───────────────────────────────────────────
router.post('/checkin', authenticate, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Check if already checked in today
        const existingQuery = await pool.query(
            'SELECT id FROM checkins WHERE user_id = $1 AND checked_in_at = $2',
            [req.user.id, today]
        );

        if (existingQuery.rows.length > 0) {
            return res.status(400).json({ error: 'Already checked in today!' });
        }

        await pool.query('INSERT INTO checkins (user_id, checked_in_at) VALUES ($1, $2)', [req.user.id, today]);

        // Award 1 bonus entry to each upcoming draw
        const upcomingDrawsQuery = await pool.query("SELECT id FROM draws WHERE status = 'upcoming'");
        for (const draw of upcomingDrawsQuery.rows) {
            await pool.query(
                'INSERT INTO entries (user_id, draw_id, base_count, multiplier, total_count, source) VALUES ($1, $2, 1, 1.0, 1, $3)',
                [req.user.id, draw.id, 'checkin']
            );
        }

        // Count total checkins
        const totalCheckinsQuery = await pool.query('SELECT COUNT(*) as c FROM checkins WHERE user_id = $1', [req.user.id]);
        const totalCheckins = parseInt(totalCheckinsQuery.rows[0].c, 10);

        res.json({
            message: 'Checked in! +1 bonus entry added.',
            total_checkins: totalCheckins,
            bonus_entries: 1,
        });
    } catch (err) {
        console.error('Check-in error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── Platform stats ───────────────────────────────────────────
router.get('/stats', async (req, res) => {
    try {
        const membersQuery = await pool.query('SELECT COUNT(*) as c FROM users');
        const members = parseInt(membersQuery.rows[0].c, 10);

        const depositsQuery = await pool.query(
            "SELECT COALESCE(SUM(CASE WHEN type='deposit' THEN amount ELSE -amount END), 0) as total FROM deposits"
        );
        const totalDeposits = parseFloat(depositsQuery.rows[0].total || 0);

        const streaksQuery = await pool.query('SELECT COUNT(*) as c FROM streaks WHERE current_streak >= 10');
        const activeStreaks = parseInt(streaksQuery.rows[0].c, 10);

        res.json({
            total_members: members,
            total_aum: totalDeposits,
            active_10plus_streaks: activeStreaks,
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
