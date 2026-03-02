import { Router } from 'express';
import pool from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// ─── Create a syndicate ────────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
    try {
        const { name, emoji } = req.body;

        if (!name) return res.status(400).json({ error: 'Syndicate name is required' });

        // Check user isn't already in a syndicate
        const existingQuery = await pool.query(
            'SELECT syndicate_id FROM syndicate_members WHERE user_id = $1',
            [req.user.id]
        );
        if (existingQuery.rows.length > 0) return res.status(400).json({ error: 'You are already in a syndicate. Leave first.' });

        const result = await pool.query(
            'INSERT INTO syndicates (name, emoji, created_by) VALUES ($1, $2, $3) RETURNING id',
            [name, emoji || '🍀', req.user.id]
        );
        const syndicateId = result.rows[0].id;

        // Auto-join the creator
        await pool.query(
            'INSERT INTO syndicate_members (syndicate_id, user_id) VALUES ($1, $2)',
            [syndicateId, req.user.id]
        );

        res.status(201).json({
            id: syndicateId,
            name,
            emoji: emoji || '🍀',
            member_count: 1,
        });
    } catch (err) {
        console.error('Create syndicate error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── Join a syndicate ──────────────────────────────────────────
router.post('/:id/join', authenticate, async (req, res) => {
    try {
        const syndicateId = req.params.id;
        const syndicateQuery = await pool.query('SELECT * FROM syndicates WHERE id = $1', [syndicateId]);
        const syndicate = syndicateQuery.rows[0];

        if (!syndicate) return res.status(404).json({ error: 'Syndicate not found' });

        const existingQuery = await pool.query(
            'SELECT syndicate_id FROM syndicate_members WHERE user_id = $1',
            [req.user.id]
        );
        if (existingQuery.rows.length > 0) return res.status(400).json({ error: 'You are already in a syndicate' });

        const memberCountQuery = await pool.query(
            'SELECT COUNT(*) as c FROM syndicate_members WHERE syndicate_id = $1',
            [syndicateId]
        );
        const memberCount = parseInt(memberCountQuery.rows[0].c, 10);

        if (memberCount >= 10) return res.status(400).json({ error: 'Syndicate is full (max 10)' });

        await pool.query(
            'INSERT INTO syndicate_members (syndicate_id, user_id) VALUES ($1, $2)',
            [syndicateId, req.user.id]
        );

        res.json({ message: `Joined ${syndicate.name}!`, member_count: memberCount + 1 });
    } catch (err) {
        console.error('Join syndicate error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── Get my syndicate ──────────────────────────────────────────
router.get('/mine', authenticate, async (req, res) => {
    try {
        const membershipQuery = await pool.query(
            'SELECT syndicate_id FROM syndicate_members WHERE user_id = $1',
            [req.user.id]
        );
        const membership = membershipQuery.rows[0];

        if (!membership) return res.json(null);

        const syndicateQuery = await pool.query('SELECT * FROM syndicates WHERE id = $1', [membership.syndicate_id]);
        const syndicate = syndicateQuery.rows[0];

        const membersQuery = await pool.query(`
            SELECT u.id, u.name, u.avatar_emoji, u.city,
                   s.current_streak, s.multiplier
            FROM syndicate_members sm
            JOIN users u ON sm.user_id = u.id
            LEFT JOIN streaks s ON u.id = s.user_id
            WHERE sm.syndicate_id = $1
        `, [membership.syndicate_id]);
        const members = membersQuery.rows;

        // Combined entries for current grand draw
        const currentDrawQuery = await pool.query("SELECT id FROM draws WHERE status = 'upcoming' AND type = 'grand' ORDER BY scheduled_at ASC LIMIT 1");
        const currentDraw = currentDrawQuery.rows[0];

        let combinedEntries = 0;
        if (currentDraw) {
            const memberIds = members.map(m => m.id);
            for (const mid of memberIds) {
                const eQuery = await pool.query(
                    'SELECT COALESCE(SUM(total_count), 0) as total FROM entries WHERE user_id = $1 AND draw_id = $2',
                    [mid, currentDraw.id]
                );
                combinedEntries += parseInt(eQuery.rows[0].total || 0, 10);
            }
        }

        res.json({
            ...syndicate,
            members,
            member_count: members.length,
            combined_entries: combinedEntries,
        });
    } catch (err) {
        console.error('Mine syndicate error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── List all syndicates ───────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
    try {
        const syndicatesQuery = await pool.query(`
            SELECT s.*, COUNT(sm.user_id) as member_count
            FROM syndicates s
            LEFT JOIN syndicate_members sm ON s.id = sm.syndicate_id
            GROUP BY s.id
            ORDER BY member_count DESC
            LIMIT 20
        `);

        res.json(syndicatesQuery.rows);
    } catch (err) {
        console.error('Syndicates error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
