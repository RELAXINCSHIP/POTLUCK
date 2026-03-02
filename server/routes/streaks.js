import { Router } from 'express';
import pool from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// ─── Get my streak ─────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
    try {
        const streakQuery = await pool.query('SELECT * FROM streaks WHERE user_id = $1', [req.user.id]);
        const streak = streakQuery.rows[0];

        if (!streak) {
            return res.json({
                current_streak: 0,
                best_streak: 0,
                multiplier: 1.0,
                next_multiplier: 1.5,
                draws_to_next: 5,
            });
        }

        // Calculate draws until next multiplier tier
        let nextMultiplier, drawsToNext;
        const currentStreak = parseInt(streak.current_streak, 10);

        if (currentStreak < 5) {
            nextMultiplier = 1.5;
            drawsToNext = 5 - currentStreak;
        } else if (currentStreak < 10) {
            nextMultiplier = 2.0;
            drawsToNext = 10 - currentStreak;
        } else if (currentStreak < 20) {
            nextMultiplier = 3.0;
            drawsToNext = 20 - currentStreak;
        } else {
            nextMultiplier = 3.0;
            drawsToNext = 0; // Already at max
        }

        res.json({
            ...streak,
            next_multiplier: nextMultiplier,
            draws_to_next: drawsToNext,
        });
    } catch (err) {
        console.error('Streak error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
