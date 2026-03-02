import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// ─── Register ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, city } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const existingQuery = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingQuery.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const hash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (email, password_hash, name, city) VALUES ($1, $2, $3, $4) RETURNING id',
            [email.toLowerCase().trim(), hash, name, city || '']
        );

        const userId = result.rows[0].id;

        // Initialize streak record
        await pool.query('INSERT INTO streaks (user_id, current_streak, best_streak, multiplier) VALUES ($1, 0, 0, 1.0)', [userId]);

        // Create feed event
        await pool.query(
            "INSERT INTO feed_events (type, text, emoji, user_id) VALUES ('join', $1, '👥', $2)",
            [`${name} just joined Potluck!`, userId]
        );

        const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.status(201).json({
            token,
            user: { id: userId, email, name, city: city || '', avatar_emoji: '😊' },
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── Login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
        const user = userQuery.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                city: user.city,
                avatar_emoji: user.avatar_emoji,
                created_at: user.created_at,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── Get Current User ──────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
    try {
        const userQuery = await pool.query(
            'SELECT id, email, name, city, avatar_emoji, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        const user = userQuery.rows[0];

        if (!user) return res.status(404).json({ error: 'User not found' });

        const streakQuery = await pool.query('SELECT * FROM streaks WHERE user_id = $1', [req.user.id]);
        const streak = streakQuery.rows[0];

        const balanceQuery = await pool.query(
            "SELECT COALESCE(SUM(CASE WHEN type='deposit' THEN amount ELSE -amount END), 0) as balance FROM deposits WHERE user_id = $1",
            [req.user.id]
        );
        const balance = balanceQuery.rows[0];

        // Get total entries for current upcoming draw
        const currentDrawQuery = await pool.query("SELECT id FROM draws WHERE status = 'upcoming' AND type = 'grand' ORDER BY scheduled_at ASC LIMIT 1");
        const currentDraw = currentDrawQuery.rows[0];

        let totalEntries = 0;
        if (currentDraw) {
            const entryRowQuery = await pool.query('SELECT COALESCE(SUM(total_count), 0) as total FROM entries WHERE user_id = $1 AND draw_id = $2', [req.user.id, currentDraw.id]);
            totalEntries = parseInt(entryRowQuery.rows[0].total, 10);
        }

        res.json({
            ...user,
            streak: streak || { current_streak: 0, best_streak: 0, multiplier: 1.0 },
            balance: parseFloat(balance?.balance || 0),
            total_entries: totalEntries,
        });
    } catch (err) {
        console.error('Me error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
