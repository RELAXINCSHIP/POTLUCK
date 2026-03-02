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

async function getUserBalance(userId) {
    const row = await pool.query(
        "SELECT COALESCE(SUM(CASE WHEN type='deposit' THEN amount ELSE -amount END), 0) as balance FROM deposits WHERE user_id = $1",
        [userId]
    );
    return parseFloat(row.rows[0].balance || 0);
}

async function recalcEntries(userId) {
    // Get user's current balance and streak
    const balance = await getUserBalance(userId);
    const streakQuery = await pool.query('SELECT * FROM streaks WHERE user_id = $1', [userId]);
    const streak = streakQuery.rows[0];
    const multiplier = streak ? getStreakMultiplier(streak.current_streak) : 1.0;
    const baseEntries = Math.floor(balance / 10);
    const totalEntries = Math.floor(baseEntries * multiplier);

    // Upsert entries for each upcoming draw
    const upcomingDraws = await pool.query("SELECT id FROM draws WHERE status = 'upcoming'");

    for (const draw of upcomingDraws.rows) {
        const existingQuery = await pool.query('SELECT id FROM entries WHERE user_id = $1 AND draw_id = $2 AND source = $3', [userId, draw.id, 'deposit']);
        const existing = existingQuery.rows[0];

        if (existing) {
            await pool.query(
                'UPDATE entries SET base_count = $1, multiplier = $2, total_count = $3 WHERE id = $4',
                [baseEntries, multiplier, totalEntries, existing.id]
            );
        } else {
            await pool.query(
                'INSERT INTO entries (user_id, draw_id, base_count, multiplier, total_count, source) VALUES ($1, $2, $3, $4, $5, $6)',
                [userId, draw.id, baseEntries, multiplier, totalEntries, 'deposit']
            );
        }
    }

    return { baseEntries, multiplier, totalEntries };
}

// ─── Make a deposit ────────────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount < 25 || amount > 5000) {
            return res.status(400).json({ error: 'Deposit must be between $25 and $5,000' });
        }

        await pool.query(
            'INSERT INTO deposits (user_id, amount, type) VALUES ($1, $2, $3)',
            [req.user.id, amount, 'deposit']
        );

        const { baseEntries, multiplier, totalEntries } = await recalcEntries(req.user.id);
        const balance = await getUserBalance(req.user.id);

        // Feed event for significant deposits
        if (amount >= 500) {
            const userQuery = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.id]);
            const user = userQuery.rows[0];
            await pool.query(
                "INSERT INTO feed_events (type, text, emoji, user_id) VALUES ('pot', $1, '💰', $2)",
                [`${user.name} added to the pot — it's growing!`, req.user.id]
            );
        }

        res.status(201).json({
            balance,
            entries: { base: baseEntries, multiplier, total: totalEntries },
            message: `Deposited $${amount}. You now have ${totalEntries} entries!`,
        });
    } catch (err) {
        console.error('Deposit error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── Withdraw ──────────────────────────────────────────────────
router.post('/withdraw', authenticate, async (req, res) => {
    try {
        const { amount } = req.body;
        const balance = await getUserBalance(req.user.id);

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        if (amount > balance) {
            return res.status(400).json({ error: `Insufficient balance. You have $${balance}` });
        }

        await pool.query(
            'INSERT INTO deposits (user_id, amount, type) VALUES ($1, $2, $3)',
            [req.user.id, amount, 'withdraw']
        );

        // Break streak on withdrawal (per product spec)
        await pool.query(
            'UPDATE streaks SET current_streak = 0, multiplier = 1.0 WHERE user_id = $1',
            [req.user.id]
        );

        const { baseEntries, multiplier, totalEntries } = await recalcEntries(req.user.id);
        const newBalance = await getUserBalance(req.user.id);

        res.json({
            balance: newBalance,
            entries: { base: baseEntries, multiplier, total: totalEntries },
            streak_broken: true,
            message: `Withdrew $${amount}. Your streak has been reset.`,
        });
    } catch (err) {
        console.error('Withdraw error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── Balance + History ─────────────────────────────────────────
router.get('/balance', authenticate, async (req, res) => {
    try {
        const balance = await getUserBalance(req.user.id);
        const historyQuery = await pool.query(
            'SELECT id, amount, type, created_at FROM deposits WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
            [req.user.id]
        );

        res.json({ balance, history: historyQuery.rows });
    } catch (err) {
        console.error('Balance error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
