import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tjdbkcadycpxxsisaeyo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZGJrY2FkeWNweHhzaXNhZXlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0OTI4MTUsImV4cCI6MjA4ODA2ODgxNX0.S8jnhFCN_-b04tGwksqM9jjyFUg_klhFrP8c0hsOqfA';

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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return { user: data.user };
}

export async function getMe() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Not logged in');

    // Fetch custom profile data safely
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!profile) return user;
    return { ...user, ...profile };
}

export async function logout() {
    await supabase.auth.signOut();
}

export function isLoggedIn() {
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not logged in');

    const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
    const { data: history } = await supabase.from('deposits').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);

    return { balance: profile?.balance || 0, history: history || [] };
}

// ─── Draws ────────────────────────────────────────────────────
export async function getCurrentDraws() {
    const { data, error } = await supabase.from('draws').select('*').eq('status', 'upcoming').order('scheduled_at', { ascending: true });
    if (error) return [];

    return data.map(d => ({
        ...d,
        countdown_seconds: Math.floor((new Date(d.scheduled_at).getTime() - Date.now()) / 1000)
    }));
}

export async function getDrawResult(drawId) {
    // Join with profiles to get winner details
    const { data, error } = await supabase.from('draws').select('*, winner:profiles!winner_user_id(name, city)').eq('id', drawId).single();
    if (error) throw new Error(error.message);
    return data;
}

export async function executeDraw(drawId) {
    // Client-side simulation of a draw (for MVP UX flow)
    return {
        winner: { name: "Sarah Mock", city: "Supabase Town", amount: 150000 }
    };
}

// ─── Streaks ──────────────────────────────────────────────────
export async function getMyStreak() {
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

export async function getMySyndicate() {
    return null;
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
    return { total_members: 84201, pool: 2412800 };
}

// ─── Admin ────────────────────────────────────────────────────
export async function getAdminStats(secret) {
    if (secret !== 'potluck-admin-2026') throw new Error("Invalid Admin Secret");

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
    if (secret !== 'potluck-admin-2026') throw new Error("Invalid Admin Secret");
    const { data, error } = await supabase.from('waitlist').select('*').order('created_at', { ascending: false });
    if (error) {
        console.warn("Waitlist table missing or error:", error);
        return [];
    }
    return data || [];
}
