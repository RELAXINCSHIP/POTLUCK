import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { initDB } from './db.js';

// Import routes
import authRoutes from './routes/auth.js';
import depositRoutes from './routes/deposits.js';
import drawRoutes from './routes/draws.js';
import streakRoutes from './routes/streaks.js';
import syndicateRoutes from './routes/syndicates.js';
import communityRoutes from './routes/community.js';
import waitlistRoutes from './routes/waitlist.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ────────────────────────────────────────────────
app.use(cors({
    origin: function (origin, callback) {
        callback(null, true); // Reflect origin
    },
    credentials: true,
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const ms = Date.now() - start;
        console.log(`${req.method} ${req.path} ${res.statusCode} ${ms}ms`);
    });
    next();
});

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/streaks', streakRoutes);
app.use('/api/syndicates', syndicateRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/waitlist', waitlistRoutes);

// ─── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), name: 'Potluck API' });
});

// ─── 404 ──────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// ─── Error handler ────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🎰 Potluck API running on port ${PORT}`);
    console.log(`   Health check: /api/health\n`);

    // Initialize DB after server starts so it doesn't block boot
    initDB().catch(err => {
        console.error('❌ Failed to initialize database during startup:', err);
    });
});
