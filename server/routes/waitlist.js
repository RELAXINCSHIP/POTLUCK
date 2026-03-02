import { Router } from 'express';
import db from '../db.js';

const router = Router();

// POST /api/waitlist — join the waitlist
router.post('/', (req, res) => {
    try {
        const { email, referral_source } = req.body;

        if (!email || !email.includes('@') || !email.includes('.')) {
            return res.status(400).json({ error: 'Please enter a valid email address.' });
        }

        const normalised = email.trim().toLowerCase();

        // Check for duplicate
        const existing = db.prepare('SELECT id FROM waitlist WHERE email = ?').get(normalised);
        if (existing) {
            const count = db.prepare('SELECT COUNT(*) as c FROM waitlist').get().c;
            return res.json({ success: true, duplicate: true, count, message: "You're already on the list! We'll be in touch soon." });
        }

        db.prepare('INSERT INTO waitlist (email, referral_source) VALUES (?, ?)').run(normalised, referral_source || '');

        const count = db.prepare('SELECT COUNT(*) as c FROM waitlist').get().c;
        res.json({ success: true, duplicate: false, count, message: "You're in! Welcome to the Potluck." });
    } catch (err) {
        console.error('Waitlist error:', err);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
});

// GET /api/waitlist/count — public counter for social proof
router.get('/count', (req, res) => {
    try {
        const count = db.prepare('SELECT COUNT(*) as c FROM waitlist').get().c;
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: 'Could not fetch count.' });
    }
});

export default router;
