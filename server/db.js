import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Use DATABASE_URL if available (for production like Railway), otherwise a local dev connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/potluck',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false // SSL is usually required for cloud DBs
});

export const initDB = async () => {
  try {
    // ─── Schema ───────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        city TEXT DEFAULT '',
        avatar_emoji TEXT DEFAULT '😊',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS deposits (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        amount NUMERIC NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('deposit', 'withdraw')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS draws (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL CHECK(type IN ('grand', 'mini')),
        prize_pool NUMERIC DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'live', 'completed')),
        scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
        completed_at TIMESTAMP WITH TIME ZONE,
        winner_user_id INTEGER REFERENCES users(id),
        winning_amount NUMERIC DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        draw_id INTEGER NOT NULL REFERENCES draws(id),
        base_count INTEGER NOT NULL DEFAULT 0,
        multiplier NUMERIC NOT NULL DEFAULT 1.0,
        total_count INTEGER NOT NULL DEFAULT 0,
        source TEXT DEFAULT 'deposit',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS streaks (
        user_id INTEGER PRIMARY KEY REFERENCES users(id),
        current_streak INTEGER DEFAULT 0,
        best_streak INTEGER DEFAULT 0,
        multiplier NUMERIC DEFAULT 1.0,
        last_draw_id INTEGER REFERENCES draws(id)
      );

      CREATE TABLE IF NOT EXISTS syndicates (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        emoji TEXT DEFAULT '🍀',
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS syndicate_members (
        syndicate_id INTEGER NOT NULL REFERENCES syndicates(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (syndicate_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS feed_events (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        text TEXT NOT NULL,
        emoji TEXT DEFAULT '📢',
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS checkins (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        checked_in_at DATE DEFAULT CURRENT_DATE,
        UNIQUE(user_id, checked_in_at)
      );

      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        referral_source TEXT DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ─── Seed initial draws if none exist ──────────────────────────
    const res = await pool.query('SELECT COUNT(*) as c FROM draws');
    const drawCount = parseInt(res.rows[0].c, 10);

    if (drawCount === 0) {
      const now = new Date();

      // Grand Draw — 90 days from now
      const grandDate = new Date(now);
      grandDate.setDate(grandDate.getDate() + 90);

      // Mini Draw — 30 days from now
      const miniDate = new Date(now);
      miniDate.setDate(miniDate.getDate() + 30);

      await pool.query(`
        INSERT INTO draws (type, prize_pool, status, scheduled_at) VALUES ($1, $2, 'upcoming', $3)
      `, ['grand', 2412800, grandDate.toISOString()]);

      await pool.query(`
        INSERT INTO draws (type, prize_pool, status, scheduled_at) VALUES ($1, $2, 'upcoming', $3)
      `, ['mini', 12400, miniDate.toISOString()]);

      console.log('🎰 Seeded initial Grand Draw and Mini Draw into Postgres');
    }

    console.log('📦 Connected to Postgres and initialized schema');
  } catch (err) {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
  }
};

export default pool;
