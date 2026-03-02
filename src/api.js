const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getToken() {
    return localStorage.getItem('potluck_token');
}

function setToken(token) {
    localStorage.setItem('potluck_token', token);
}

function clearToken() {
    localStorage.removeItem('potluck_token');
}

async function request(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

// ─── Auth ─────────────────────────────────────────────────────
export async function register(email, password, name, city) {
    const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, city }),
    });
    setToken(data.token);
    return data;
}

export async function login(email, password) {
    const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return data;
}

export async function getMe() {
    return request('/auth/me');
}

export function logout() {
    clearToken();
}

export function isLoggedIn() {
    return !!getToken();
}

// ─── Deposits ─────────────────────────────────────────────────
export async function makeDeposit(amount) {
    return request('/deposits', {
        method: 'POST',
        body: JSON.stringify({ amount }),
    });
}

export async function withdraw(amount) {
    return request('/deposits/withdraw', {
        method: 'POST',
        body: JSON.stringify({ amount }),
    });
}

export async function getBalance() {
    return request('/deposits/balance');
}

// ─── Draws ────────────────────────────────────────────────────
export async function getCurrentDraws() {
    return request('/draws/current');
}

export async function getDrawResult(drawId) {
    return request(`/draws/${drawId}/result`);
}

export async function executeDraw(drawId) {
    return request(`/draws/${drawId}/execute`, { method: 'POST' });
}

// ─── Streaks ──────────────────────────────────────────────────
export async function getMyStreak() {
    return request('/streaks/me');
}

// ─── Syndicates ───────────────────────────────────────────────
export async function createSyndicate(name, emoji) {
    return request('/syndicates', {
        method: 'POST',
        body: JSON.stringify({ name, emoji }),
    });
}

export async function joinSyndicate(id) {
    return request(`/syndicates/${id}/join`, { method: 'POST' });
}

export async function getMySyndicate() {
    return request('/syndicates/mine');
}

export async function listSyndicates() {
    return request('/syndicates');
}

// ─── Community ────────────────────────────────────────────────
export async function getFeed() {
    return request('/community/feed');
}

export async function getLeaderboard() {
    return request('/community/leaderboard');
}

export async function dailyCheckin() {
    return request('/community/checkin', { method: 'POST' });
}

export async function getPlatformStats() {
    return request('/community/stats');
}
