import React, { useState, useEffect, useCallback } from 'react';
import * as api from './api';
import './AdminPage.css';

export default function AdminPage({ onBack }) {
    const [secret, setSecret] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [stats, setStats] = useState(null);
    const [waitlist, setWaitlist] = useState([]);
    const [users, setUsers] = useState([]);
    const [view, setView] = useState('overview'); // 'overview', 'members', 'waitlist'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [actionMessage, setActionMessage] = useState(null);
    const [debugMode, setDebugMode] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(null);

    const refreshData = useCallback(async (forcedSecret) => {
        const s = forcedSecret || secret;
        if (!s) return;

        setLoading(true);
        setError(null);
        try {
            console.log("Admin Syncing...");
            const [statsData, waitlistData, usersData] = await Promise.all([
                api.getAdminStats(s),
                api.getAdminWaitlist(s),
                api.getAdminUsers(s)
            ]);
            setStats(statsData);
            setWaitlist(waitlistData);
            setUsers(usersData);
            setLastRefresh(new Date().toLocaleTimeString());
            console.log("Admin Data Rehydrated:", { users: usersData.length });
            return true;
        } catch (err) {
            console.error("Refresh failed:", err);
            setError("Sync Failed: " + (err.message || "Unknown Error"));
            return false;
        } finally {
            setLoading(false);
        }
    }, [secret]);

    const handleLogin = async (e) => {
        e.preventDefault();
        const success = await refreshData(secret);
        if (success) {
            setIsAuthenticated(true);
        }
    };

    const triggerDraw = async (drawId) => {
        const draw = stats?.draws?.find(d => d.id === drawId);
        const drawName = draw ? `${draw.type.toUpperCase()} ($${draw.prize_pool.toLocaleString()})` : "this draw";

        if (!window.confirm(`Are you sure you want to execute ${drawName}? This will pick a winner from live profiles and close the draw.`)) return;

        setLoading(true);
        setActionMessage(null);
        setError(null);
        try {
            const result = await api.executeDraw(drawId);
            setActionMessage(`✅ Success! Winner: ${result.winner.name} won $${result.winner.amount.toLocaleString()}`);
            await refreshData();
        } catch (err) {
            setError(err.message || 'Failed to execute draw.');
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-login-container">
                <div className="admin-login-box">
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔐</div>
                    <h2>Potluck Admin</h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '24px' }}>Access requires the platform master secret.</p>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            placeholder="••••••••••••"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            className="admin-input-premium"
                            required
                        />
                        {error && <div className="admin-error-box">{error}</div>}
                        <button type="submit" className="admin-btn-premium" disabled={loading}>
                            {loading ? 'Authenticating...' : 'Enter Dashboard'}
                        </button>
                    </form>
                    <button className="admin-back-link" onClick={onBack}>← Back to Site</button>
                </div>
            </div>
        );
    }

    const formatCurrency = (n) => "$" + Number(n).toLocaleString();

    return (
        <div className="admin-dashboard-v3">
            <header className="admin-nav">
                <div className="nav-left">
                    <div className="logo-pill" onClick={() => setView('overview')}>🍀 POTLUCK OS</div>
                    <div className="nav-divider"></div>
                    <div className="view-title">
                        {view === 'overview' && 'System Overview'}
                        {view === 'members' && 'Member Directory'}
                        {view === 'waitlist' && 'Waitlist Details'}
                    </div>
                </div>
                <div className="nav-right">
                    <div className="sync-status">Last Sync: {lastRefresh || 'Pending'}</div>
                    <button onClick={() => refreshData()} className="icon-btn" title="Refresh Data">🔄</button>
                    <button onClick={() => setDebugMode(!debugMode)} className="icon-btn" title="Debug Data">⚙️</button>
                    <button onClick={onBack} className="exit-btn">Exit Portal</button>
                </div>
            </header>

            <main className="admin-content">
                {error && <div className="admin-banner-error">⚠️ {error}</div>}
                {actionMessage && <div className="admin-banner-success">{actionMessage}</div>}

                <section className="stat-cards-row">
                    <div className={`stat-card-premium ${view === 'overview' ? 'active' : ''}`} onClick={() => setView('overview')}>
                        <span className="sc-label">Total Deposits (TVL)</span>
                        <span className="sc-value">{formatCurrency(stats?.tvl || 0)}</span>
                        <div className="sc-bar" style={{ width: '100%', background: '#4ECDC4' }}></div>
                    </div>
                    <div className={`stat-card-premium ${view === 'members' ? 'active' : ''}`} onClick={() => setView('members')}>
                        <span className="sc-label">Active Users</span>
                        <span className="sc-value" style={{ color: '#FCD34D' }}>{stats?.users_count || 0}</span>
                        <div className="sc-bar" style={{ width: Math.min(100, (stats?.users_count || 0) / 10) + '%', background: '#FCD34D' }}></div>
                    </div>
                    <div className={`stat-card-premium ${view === 'waitlist' ? 'active' : ''}`} onClick={() => setView('waitlist')}>
                        <span className="sc-label">Waitlist Signups</span>
                        <span className="sc-value" style={{ color: '#A855F7' }}>{stats?.waitlist_count || 0}</span>
                        <div className="sc-bar" style={{ width: Math.min(100, (stats?.waitlist_count || 0) / 10) + '%', background: '#A855F7' }}></div>
                    </div>
                </section>

                <div className="view-container">
                    {view === 'overview' && (
                        <div className="fade-in-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <h2 className="view-header" style={{ margin: 0 }}>Upcoming Prize Draws</h2>
                                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>Real-time draw execution via smart contract triggers.</div>
                            </div>
                            <div className="draw-grid-premium">
                                {stats?.draws?.filter(d => d.status === 'upcoming').map(draw => (
                                    <div key={draw.id} className="draw-card-premium">
                                        <div className="dc-header">
                                            <span className="dc-tag">{draw.type.toUpperCase()}</span>
                                            <span className="dc-id">#{draw.id.substring(0, 6)}</span>
                                        </div>
                                        <div className="dc-prize">{formatCurrency(draw.prize_pool)}</div>
                                        <div className="dc-meta">
                                            <div>📅 {new Date(draw.scheduled_at).toLocaleDateString()}</div>
                                            <div>👥 {draw.member_count || 0} participants</div>
                                        </div>
                                        <button
                                            className="dc-action-btn"
                                            onClick={() => triggerDraw(draw.id)}
                                            disabled={loading}
                                        >
                                            {loading ? 'Running...' : 'Execute Draw ⚡'}
                                        </button>
                                    </div>
                                ))}
                                {!stats?.draws?.filter(d => d.status === 'upcoming').length && (
                                    <div className="empty-state-v3">No draws found in database.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {view === 'members' && (
                        <div className="fade-in-section">
                            <h2 className="view-header">Member Directory</h2>
                            <div className="premium-table-container">
                                <table className="premium-table">
                                    <thead>
                                        <tr>
                                            <th>Member</th>
                                            <th>Location</th>
                                            <th>Balance</th>
                                            <th>Tickets</th>
                                            <th>Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length > 0 ? users.map(u => (
                                            <tr key={u.id}>
                                                <td>
                                                    <div className="member-cell">
                                                        <div className="m-avatar">{u.avatar_emoji || '👤'}</div>
                                                        <div className="m-info">
                                                            <div className="m-name">{u.name || 'Anonymous'}</div>
                                                            <div className="m-email">{u.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{u.city || '—'}</td>
                                                <td className="m-balance">{formatCurrency(u.balance || 0)}</td>
                                                <td className="m-tickets">{u.total_entries || 0}</td>
                                                <td className="m-date">{new Date(u.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="5" className="empty-table-v3">No active members found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {view === 'waitlist' && (
                        <div className="fade-in-section">
                            <h2 className="view-header">Waitlist Data</h2>
                            <div className="premium-table-container">
                                <table className="premium-table">
                                    <thead>
                                        <tr>
                                            <th>Email</th>
                                            <th>Referral</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {waitlist.length > 0 ? waitlist.map(w => (
                                            <tr key={w.id}>
                                                <td className="m-name">{w.email}</td>
                                                <td>{w.referral_source || 'Organic'}</td>
                                                <td className="m-date">{new Date(w.created_at).toLocaleString()}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="3" className="empty-table-v3">Waitlist is empty.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {debugMode && (
                    <section className="debug-panel">
                        <h3>🔧 Debug Analytics</h3>
                        <div className="debug-grid">
                            <div className="debug-col">
                                <h4>Users State ({users.length})</h4>
                                <pre>{JSON.stringify(users.slice(0, 3), null, 2)}</pre>
                            </div>
                            <div className="debug-col">
                                <h4>Waitlist State ({waitlist.length})</h4>
                                <pre>{JSON.stringify(waitlist.slice(0, 3), null, 2)}</pre>
                            </div>
                            <div className="debug-col">
                                <h4>Stats State</h4>
                                <pre>{JSON.stringify(stats, null, 2)}</pre>
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
