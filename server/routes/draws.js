import { Router } from 'express';
import pool from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// ─── Helpers ───────────────────────────────────────────────────
function getStreakMultiplier(streak) {
    if (streak >= 20) return 3.0;
    if (streak >= 10) return 2.0;
    if (streak >= 5) return 1.5;
    return 1.0;
}

// ─── Get current draws ────────────────────────────────────────
router.get('/current', authenticate, async (req, res) => {
    try {
        const drawsQuery = await pool.query(
            "SELECT * FROM draws WHERE status IN ('upcoming', 'live') ORDER BY scheduled_at ASC"
        );
        const draws = drawsQuery.rows;

        const result = [];

        for (const draw of draws) {
            // Total pot — sum of all deposits across all users (simulating interest-based pool)
            const totalDepositsQuery = await pool.query(
                "SELECT COALESCE(SUM(CASE WHEN type='deposit' THEN amount ELSE -amount END), 0) as total FROM deposits"
            );
            const totalDeposits = parseFloat(totalDepositsQuery.rows[0].total || 0);

            // User's entries for this draw
            const userEntriesQuery = await pool.query(
                'SELECT COALESCE(SUM(total_count), 0) as total FROM entries WHERE user_id = $1 AND draw_id = $2',
                [req.user.id, draw.id]
            );
            const userEntries = parseInt(userEntriesQuery.rows[0].total || 0, 10);

            // Total entries across all users
            const totalEntriesQuery = await pool.query(
                'SELECT COALESCE(SUM(total_count), 0) as total FROM entries WHERE draw_id = $1',
                [draw.id]
            );
            const totalEntries = parseInt(totalEntriesQuery.rows[0].total || 0, 10);

            // Member count
            const memberCountQuery = await pool.query('SELECT COUNT(*) as c FROM users');
            const memberCount = parseInt(memberCountQuery.rows[0].c, 10);

            // Countdown in seconds
            const scheduledAt = new Date(draw.scheduled_at);
            const now = new Date();
            const countdownSecs = Math.max(0, Math.floor((scheduledAt - now) / 1000));

            const prizePool = draw.prize_pool > 0 ? parseFloat(draw.prize_pool) : totalDeposits * 0.048 * 0.65;

            result.push({
                ...draw,
                prize_pool: prizePool,
                countdown_seconds: countdownSecs,
                user_entries: userEntries,
                total_entries: totalEntries,
                member_count: memberCount,
                user_odds: totalEntries > 0
                    ? `1 in ${Math.max(1, Math.round(totalEntries / Math.max(1, userEntries)))}`
                    : 'N/A',
            });
        }

        res.json(result);
    } catch (err) {
        console.error('Draws error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── Get draw result ──────────────────────────────────────────
router.get('/:id/result', authenticate, async (req, res) => {
    try {
        const drawQuery = await pool.query('SELECT * FROM draws WHERE id = $1', [req.params.id]);
        const draw = drawQuery.rows[0];
        if (!draw) return res.status(404).json({ error: 'Draw not found' });

        let winner = null;
        if (draw.winner_user_id) {
            const winnerQuery = await pool.query('SELECT id, name, city, avatar_emoji FROM users WHERE id = $1', [draw.winner_user_id]);
            winner = winnerQuery.rows[0];
        }

        // User's position (simulated ranking based on entry count)
        const userEntriesQuery = await pool.query(
            'SELECT COALESCE(SUM(total_count), 0) as total FROM entries WHERE user_id = $1 AND draw_id = $2',
            [req.user.id, draw.id]
        );
        const userEntries = parseInt(userEntriesQuery.rows[0].total || 0, 10);

        const totalEntrantsQuery = await pool.query(
            'SELECT COUNT(DISTINCT user_id) as c FROM entries WHERE draw_id = $1',
            [draw.id]
        );
        const totalEntrants = parseInt(totalEntrantsQuery.rows[0].c, 10);

        // Approximate position: higher entries = lower position number (better)
        const betterThanUserQuery = await pool.query(`
            SELECT COUNT(DISTINCT user_id) as c FROM entries 
            WHERE draw_id = $1 AND user_id != $2 
            GROUP BY user_id 
            HAVING SUM(total_count) > $3
        `, [draw.id, req.user.id, userEntries]);

        const position = betterThanUserQuery.rows.length + 1;

        res.json({
            draw,
            winner,
            user_result: {
                position,
                total_entrants: totalEntrants,
                entries: userEntries,
                is_winner: draw.winner_user_id === req.user.id,
                percentile: totalEntrants > 0 ? Math.round((position / totalEntrants) * 100) : 0,
            },
        });
    } catch (err) {
        console.error('Result error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── Execute a draw (Admin) ──────────────────────────────────
router.post('/:id/execute', authenticate, async (req, res) => {
    try {
        const drawQuery = await pool.query('SELECT * FROM draws WHERE id = $1', [req.params.id]);
        const draw = drawQuery.rows[0];

        if (!draw) return res.status(404).json({ error: 'Draw not found' });
        if (draw.status === 'completed') return res.status(400).json({ error: 'Draw already completed' });

        // Get all entries for this draw with total counts
        const allEntriesQuery = await pool.query(`
            SELECT user_id, SUM(total_count) as total 
            FROM entries WHERE draw_id = $1 
            GROUP BY user_id
        `, [draw.id]);
        const allEntries = allEntriesQuery.rows;

        if (allEntries.length === 0) {
            return res.status(400).json({ error: 'No entries in this draw' });
        }

        // Weighted random selection
        const totalTickets = allEntries.reduce((sum, e) => sum + parseInt(e.total, 10), 0);
        let random = Math.random() * totalTickets;
        let winnerId = allEntries[0].user_id;

        for (const entry of allEntries) {
            random -= parseInt(entry.total, 10);
            if (random <= 0) {
                winnerId = entry.user_id;
                break;
            }
        }

        // Update draw
        await pool.query(`
            UPDATE draws SET status = 'completed', completed_at = CURRENT_TIMESTAMP, 
            winner_user_id = $1, winning_amount = $2 WHERE id = $3
        `, [winnerId, draw.prize_pool, draw.id]);

        // Update streaks for all participants
        for (const entry of allEntries) {
            if (entry.user_id === winnerId) {
                // Winner streak resets
                await pool.query(
                    'UPDATE streaks SET current_streak = 0, multiplier = 1.0, last_draw_id = $1 WHERE user_id = $2',
                    [draw.id, entry.user_id]
                );
            } else {
                // Non-winners: increment streak
                const streakQuery = await pool.query('SELECT * FROM streaks WHERE user_id = $1', [entry.user_id]);
                const streak = streakQuery.rows[0];
                const currentStreak = streak ? parseInt(streak.current_streak, 10) : 0;
                const bestStreak = streak ? parseInt(streak.best_streak, 10) : 0;

                const newStreak = currentStreak + 1;
                const newBest = Math.max(newStreak, bestStreak);
                const newMult = getStreakMultiplier(newStreak);

                await pool.query(
                    'UPDATE streaks SET current_streak = $1, best_streak = $2, multiplier = $3, last_draw_id = $4 WHERE user_id = $5',
                    [newStreak, newBest, newMult, draw.id, entry.user_id]
                );
            }
        }

        // Create feed event
        const winnerQuery = await pool.query('SELECT name, city FROM users WHERE id = $1', [winnerId]);
        const winner = winnerQuery.rows[0];

        await pool.query(
            "INSERT INTO feed_events (type, text, emoji, user_id) VALUES ('win', $1, '🏆', $2)",
            [`${winner.name} from ${winner.city} just won $${parseFloat(draw.prize_pool).toLocaleString()} in the ${draw.type === 'grand' ? 'Grand' : 'Mini'} Draw!`, winnerId]
        );

        // Seed next draw
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + (draw.type === 'grand' ? 90 : 30));
        await pool.query(
            "INSERT INTO draws (type, prize_pool, status, scheduled_at) VALUES ($1, 0, 'upcoming', $2)",
            [draw.type, nextDate.toISOString()]
        );

        res.json({
            message: `Draw complete! Winner: ${winner.name}`,
            winner: { id: winnerId, name: winner.name, city: winner.city, amount: parseFloat(draw.prize_pool) },
            next_draw_scheduled: nextDate.toISOString(),
        });
    } catch (err) {
        console.error('Execute draw error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
