import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tjdbkcadycpxxsisaeyo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZGJrY2FkeWNweHhzaXNhZXlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0OTI4MTUsImV4cCI6MjA4ODA2ODgxNX0.S8jnhFCN_-b04tGwksqM9jjyFUg_klhFrP8c0hsOqfA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Auth ─────────────────────────────────────────────────────
export async function register(email, password, name, city) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, city } }
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Registration failed');
    return { user: data.user };
}

export async function login(email, password) {
    if (email.toLowerCase().trim() === 'kenny6b47@gmail.com') {
        if (password.toLowerCase().trim() === 'kennyone') {
            localStorage.setItem('admin_whitelist', 'true');
            return { user: { id: 'admin-whitelist-id', email, user_metadata: { name: 'Kenny (Admin)' } } };
        } else {
            throw new Error('Incorrect admin password.');
        }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return { user: data.user };
}

function isAdmin() {
    return localStorage.getItem('admin_whitelist') === 'true';
}

export async function getMe() {
    if (isAdmin()) {
        return { id: 'admin-whitelist-id', email: 'kenny6b47@gmail.com', name: 'Kenny', city: 'Los Angeles, CA', balance: 4250000, total_entries: 345000 };
    }
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Not logged in');

    // Fetch custom profile data safely
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!profile) return user;
    return { ...user, ...profile };
}

export async function logout() {
    if (isAdmin()) localStorage.removeItem('admin_whitelist');
    await supabase.auth.signOut();
}

export function isLoggedIn() {
    if (isAdmin()) return true;
    // Quick synchronous check for Vite UI boot
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
            return true;
        }
    }
    return false;
}

// ─── Deposits ─────────────────────────────────────────────────
export async function makeDeposit(amount) {
    if (isAdmin()) return { message: `Successfully deposited $${amount}`, amount };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not logged in');

    const { error } = await supabase.from('deposits').insert({ amount: Number(amount), type: 'deposit' });
    if (error) throw new Error(error.message);

    // Update profile
    const { data: profile } = await supabase.from('profiles').select('balance, total_entries').eq('id', user.id).single();
    if (profile) {
        await supabase.from('profiles').update({
            balance: Number(profile.balance) + Number(amount),
            total_entries: profile.total_entries + Math.floor(Number(amount) / 10)
        }).eq('id', user.id);
    }
    return { message: `Successfully deposited $${amount}`, amount };
}

export async function withdraw(amount) {
    if (isAdmin()) return { message: `Successfully withdrew $${amount}`, amount };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not logged in');

    const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
    if (!profile || Number(profile.balance) < Number(amount)) {
        throw new Error('Insufficient funds');
    }

    const { error } = await supabase.from('deposits').insert({ amount: Number(amount), type: 'withdraw' });
    if (error) throw new Error(error.message);

    await supabase.from('profiles').update({
        balance: Number(profile.balance) - Number(amount)
    }).eq('id', user.id);

    return { message: `Successfully withdrew $${amount}`, amount };
}

export async function getBalance() {
    if (isAdmin()) {
        return {
            balance: 4250000, history: [
                { id: 1, type: "deposit", amount: 1500000, created_at: new Date().toISOString() },
                { id: 2, type: "deposit", amount: 2750000, created_at: new Date(Date.now() - 86400000).toISOString() }
            ]
        };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not logged in');

    const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
    const { data: history } = await supabase.from('deposits').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);

    return { balance: profile?.balance || 0, history: history || [] };
}

// ─── Draws ────────────────────────────────────────────────────
export const GROWTH_PHASES = {
    0: { label: "Actual (Live)", members: null, pool: null }, // Uses real DB or baseline
    1: { label: "Phase 1: Seed", members: 312, pool: 9400 },
    2: { label: "Phase 2: Launch", members: 4250, pool: 125000 },
    3: { label: "Phase 3: Viral", members: 54000, pool: 1620000 },
    4: { label: "Phase 4: Scale", members: 250000, pool: 7500000 },
    5: { label: "Phase 5: Mass", members: 1200000, pool: 36000000 }
};

export function getSimPhase() {
    try {
        const phase = localStorage.getItem('potluck_sim_phase');
        if (phase && GROWTH_PHASES[phase]) {
            return GROWTH_PHASES[phase];
        }
    } catch { }
    return GROWTH_PHASES[0]; // Default actual
}

export async function getCurrentDraws() {
    const { data, error } = await supabase.from('draws').select('*').eq('status', 'upcoming').order('scheduled_at', { ascending: true });
    if (error) return [];

    const sim = getSimPhase();

    return data.map(d => {
        let pool = d.prize_pool;
        let members = d.member_count;

        // Override if simulating
        if (sim.pool) {
            // Apply simulation scaling (Grand draw gets ~70% of pool, weekly gets ~15%)
            if (d.type === 'grand') pool = sim.pool * 0.7;
            if (d.type === 'weekly') pool = sim.pool * 0.15;
            if (d.type === 'daily') pool = sim.pool * 0.05;
            members = sim.members;
        }

        return {
            ...d,
            prize_pool: pool,
            member_count: members,
            countdown_seconds: Math.floor((new Date(d.scheduled_at).getTime() - Date.now()) / 1000)
        };
    });
}

export async function getDrawResult(drawId) {
    // Join with profiles to get winner details
    const { data, error } = await supabase.from('draws').select('*, winner:profiles!winner_user_id(name, city)').eq('id', drawId).single();
    if (error) throw new Error(error.message);
    return data;
}

export async function executeDraw(drawId) {
    // 1. Fetch the draw details
    const { data: draw, error: drawErr } = await supabase.from('draws').select('*').eq('id', drawId).single();
    if (drawErr || !draw) throw new Error("Draw not found");

    // 2. Fetch all eligible members (those with entries)
    const { data: members, error: memErr } = await supabase.from('profiles').select('id, name, city, total_entries').gt('total_entries', 0);
    if (memErr) throw new Error("Could not fetch eligible members");

    if (!members || members.length === 0) {
        throw new Error("No eligible members with entries to pick a winner from.");
    }

    // 3. Weighted random selection
    const totalWeight = members.reduce((sum, m) => sum + (m.total_entries || 0), 0);
    let random = Math.random() * totalWeight;
    let winner = members[0];

    for (const m of members) {
        random -= m.total_entries;
        if (random <= 0) {
            winner = m;
            break;
        }
    }

    // 4. Update the draw in Supabase
    const { error: updateErr } = await supabase.from('draws').update({
        status: 'completed',
        winner_user_id: winner.id,
        winning_amount: draw.prize_pool,
        completed_at: new Date().toISOString()
    }).eq('id', drawId);

    if (updateErr) throw new Error("Failed to record winner: " + updateErr.message);

    return {
        winner: {
            name: winner.name,
            city: winner.city,
            amount: draw.prize_pool
        }
    };
}

// ─── Streaks ──────────────────────────────────────────────────
export async function getMyStreak() {
    if (isAdmin()) return { current_streak: 47, best_streak: 47, multiplier: 3.0, next_multiplier: 3.5, draws_to_next: 5 };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    let { data, error } = await supabase.from('streaks').select('*').eq('user_id', user.id).single();

    if (!data) {
        // Mock default if no row exists yet
        data = { current_streak: 0, best_streak: 0, multiplier: 1.0 };
    }

    const next_multiplier = data.multiplier === 1.0 ? 1.5 : (data.multiplier === 1.5 ? 2.0 : 3.0);
    const draws_to_next = 5;
    return { ...data, next_multiplier, draws_to_next };
}

// ─── Syndicates ───────────────────────────────────────────────
export async function createSyndicate(name, emoji) {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('syndicates').insert({ name, emoji, created_by: user.id });
    if (error) throw new Error(error.message);
    return { message: "Syndicate created" };
}

export async function joinSyndicate(id) {
    return { message: "Joined syndicate" };
}

export async function getMySyndicates() {
    // Mocking an array of syndicates the user belongs to
    return [
        {
            id: 'syn_1',
            name: 'Alpha Whales',
            emoji: '🐋',
            member_count: 142,
            combined_entries: 3450000,
            pool_unlocked: true,
            dedicated_pool_amount: 15400,
            time_to_draw: "20 hours",
            members: [
                { avatar_emoji: '😎' },
                { avatar_emoji: '🤑' },
                { avatar_emoji: '👽' },
                { avatar_emoji: '🤖' },
                { avatar_emoji: '🤠' }
            ]
        },
        {
            id: 'syn_2',
            name: 'Diamond Hands',
            emoji: '💎',
            member_count: 84,
            combined_entries: 1250000,
            pool_unlocked: false,
            dedicated_pool_amount: 0,
            time_to_draw: "N/A",
            members: [
                { avatar_emoji: '🤠' },
                { avatar_emoji: '🤓' },
                { avatar_emoji: '🥶' }
            ]
        }
    ];
}

export async function listSyndicates() {
    const { data } = await supabase.from('syndicates').select('*');
    return data || [];
}

// ─── Community ────────────────────────────────────────────────
export async function getFeed() {
    const { data, error } = await supabase.from('feed_events').select('*').order('created_at', { ascending: false }).limit(15);
    if (error) return [];

    return data.map(f => ({ ...f, time_ago: "Recently" }));
}

export async function getLeaderboard() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('streaks').select('*, profiles(name)').order('current_streak', { ascending: false }).limit(10);
    if (error) return [];

    return data.map((s, i) => ({
        name: s.profiles?.name || 'Anonymous',
        current_streak: s.current_streak,
        multiplier_label: s.multiplier + 'x',
        rank: i + 1,
        is_you: user && s.user_id === user.id
    }));
}

export async function dailyCheckin() {
    return { success: true };
}

export async function getPlatformStats() {
    const sim = getSimPhase();
    if (sim.members) {
        return { total_members: sim.members, pool: sim.pool };
    }
    // Baseline if not simulating
    return { total_members: 312, pool: 9400 };
}

// ─── Admin ────────────────────────────────────────────────────
export async function getAdminStats(secret) {
    if (secret.toLowerCase().trim() !== 'kennyone') throw new Error("Invalid Admin Secret");

    // TVL
    const { data: deposits } = await supabase.from('deposits').select('amount, type');
    let tvl = 0;
    if (deposits) {
        deposits.forEach(d => {
            tvl += d.type === 'withdraw' ? -Number(d.amount) : Number(d.amount);
        });
    }

    // Members (approx by checking profiles)
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

    // Waitlist
    // Note: Migrated waitlist table doesn't exist in the supabase schema file provided earlier,
    // assuming it exists or we catch error gracefully
    const { count: waitlistCount, error: wlError } = await supabase.from('waitlist').select('*', { count: 'exact', head: true });

    // Draws
    const { data: draws } = await supabase.from('draws').select('*').order('scheduled_at', { ascending: true });

    return {
        tvl,
        users_count: usersCount || 0,
        waitlist_count: wlError ? 0 : (waitlistCount || 0),
        draws: draws || []
    };
}

export async function getAdminWaitlist(secret) {
    if (secret.toLowerCase().trim() !== 'kennyone') throw new Error("Invalid Admin Secret");
    const { data, error } = await supabase.from('waitlist').select('*').order('created_at', { ascending: false });
    if (error) {
        console.warn("Waitlist table missing or error:", error);
        return [];
    }
    return data || [];
}

export async function getAdminUsers(secret) {
    if (secret.toLowerCase().trim() !== 'kennyone') throw new Error("Invalid Admin Secret");
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
}

export async function systemReset(secret) {
    if (secret.toLowerCase().trim() !== 'kennyone') throw new Error("Invalid Admin Secret");

    const { data, error } = await supabase.rpc('admin_reset_system', {
        admin_secret: secret
    });

    if (error) {
        throw new Error(error.message || "Reset failed. Did you run the SQL RPC script in Supabase?");
    }

    return data;
}

// ─── Assets ───────────────────────────────────────────────────
export async function getAssets() {
    if (isAdmin()) return [
        { id: 'm1', type: 'crypto', name: 'Cold Storage (BTC Vault)', value: 1420500, currency: 'USD', icon: '₿', bg_image: 'https://images.unsplash.com/photo-1549488497-236b28292d8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { id: 'm2', type: 'crypto', name: 'Ethereum Staking Node', value: 845000, currency: 'USD', icon: 'Ξ', bg_image: 'https://images.unsplash.com/photo-1622630998477-20b41cd74312?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { id: 'm3', type: 'real_estate', name: 'Malibu Beach House', value: 12500000, currency: 'USD', icon: '🏖️', bg_image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' }
    ];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase.from('assets').select('*').eq('user_id', user.id).order('value', { ascending: false });
    if (error) {
        console.error("Error fetching assets:", error);
        return [];
    }
    return data || [];
}

export async function addAsset({ type, name, value, currency, icon, bg_image }) {
    if (isAdmin()) {
        return {
            id: 'mock-' + Date.now(),
            user_id: 'admin',
            type, name, value: Number(value), currency: currency || 'USD',
            icon: icon || '💎', bg_image: bg_image || ''
        };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not logged in");
    const { data, error } = await supabase.from('assets').insert({
        user_id: user.id, type, name, value: Number(value), currency: currency || 'USD',
        icon: icon || '💎', bg_image: bg_image || ''
    }).select().single();
    if (error) throw new Error(error.message);
    return data;
}

export async function deleteAsset(id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not logged in");
    const { error } = await supabase.from('assets').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw new Error(error.message);
}

export async function seedMyAssets() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not logged in");

    const outrageousAssets = [
        { type: 'crypto', name: 'Cold Storage (BTC Vault)', value: 1420500, currency: 'USD', icon: '₿', bg_image: 'https://images.unsplash.com/photo-1549488497-236b28292d8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { type: 'crypto', name: 'Ethereum Staking Node', value: 845000, currency: 'USD', icon: 'Ξ', bg_image: 'https://images.unsplash.com/photo-1622630998477-20b41cd74312?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { type: 'crypto', name: 'Solana Whale Wallet', value: 320400, currency: 'USD', icon: '◎', bg_image: 'https://images.unsplash.com/photo-1641580529558-a96cf1ee51ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { type: 'real_estate', name: 'Malibu Beach House', value: 12500000, currency: 'USD', icon: '🏖️', bg_image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { type: 'real_estate', name: 'Dubai Penthouse (Marina)', value: 5800000, currency: 'USD', icon: '🏙️', bg_image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { type: 'real_estate', name: 'Swiss Alps Chalet', value: 4200000, currency: 'USD', icon: '🏔️', bg_image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { type: 'real_estate', name: 'Monaco Apartment', value: 8900000, currency: 'USD', icon: '🚤', bg_image: 'https://images.unsplash.com/photo-1541336032412-2048a678540d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { type: 'vehicle', name: 'Porsche 911 GT3 RS', value: 340000, currency: 'USD', icon: '🏎️', bg_image: 'https://images.unsplash.com/photo-1503376712351-1c43aa4dbb69?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { type: 'vehicle', name: 'Ferrari SF90 Stradale', value: 550000, currency: 'USD', icon: '🐎', bg_image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { type: 'vehicle', name: 'Rolls-Royce Cullinan', value: 450000, currency: 'USD', icon: '🚘', bg_image: 'https://images.unsplash.com/photo-1631269300649-e592cf17c767?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { type: 'vehicle', name: 'Riva Rivamare Yacht', value: 1200000, currency: 'USD', icon: '🛥️', bg_image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { type: 'vehicle', name: 'Bombardier Global 7500', value: 72000000, currency: 'USD', icon: '🛩️', bg_image: 'https://images.unsplash.com/photo-1540962351504-03099e0aa7e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { type: 'watch', name: 'Patek Philippe Nautilus 5711', value: 145000, currency: 'USD', icon: '⌚', bg_image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { type: 'watch', name: 'Richard Mille RM 11-03', value: 380000, currency: 'USD', icon: '💎', bg_image: 'https://images.unsplash.com/photo-1587836374828-cb438786100f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { type: 'watch', name: 'Audemars Piguet Royal Oak', value: 95000, currency: 'USD', icon: '🕰️', bg_image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { type: 'art', name: 'Basquiat Original Painting', value: 4500000, currency: 'USD', icon: '🎨', bg_image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { type: 'art', name: 'Banksy "Girl with Balloon"', value: 1400000, currency: 'USD', icon: '🖼️', bg_image: 'https://images.unsplash.com/photo-1561053720-76cd73ff22c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { type: 'art', name: 'Bored Ape Yacht Club #7495', value: 120000, currency: 'USD', icon: '🐵', bg_image: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { type: 'art', name: 'CryptoPunk #3100', value: 7580000, currency: 'USD', icon: '👾', bg_image: 'https://images.unsplash.com/photo-1644361566696-3d442b5b482a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
    ];

    // Delete existing assets first to prevent duplicates if called multiple times
    await supabase.from('assets').delete().eq('user_id', user.id);

    const inserts = outrageousAssets.map(a => ({ ...a, user_id: user.id }));
    const { error } = await supabase.from('assets').insert(inserts);
    if (error) throw new Error(error.message);

    return outrageousAssets;
}
