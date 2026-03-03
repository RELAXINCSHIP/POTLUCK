import React, { useState, useEffect } from 'react';
import * as api from './api';
import './AdminPage.css';

export default function AdminPage({ onBack }) {
    const [secret, setSecret] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [stats, setStats] = useState(null);
    const [waitlist, setWaitlist] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [actionMessage, setActionMessage] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const data = await api.getAdminStats(secret);
            setStats(data);
            const wl = await api.getAdminWaitlist(secret);
            setWaitlist(wl);
            setIsAuthenticated(true);
        } catch (err) {
            setError('Invalid Admin Secret');
        }
        setLoading(false);
    };

    const refreshData = async () => {
        try {
            const data = await api.getAdminStats(secret);
            setStats(data);
            const wl = await api.getAdminWaitlist(secret);
            setWaitlist(wl);
        } catch (err) {
            console.error(err);
        }
    };

    const triggerDraw = async (drawId) => {
        if (!window.confirm('Are you sure you want to execute this draw? This cannot be undone.')) return;

        setLoading(true);
        setActionMessage(null);
        try {
            // Note: The executeDraw endpoint currently requires the user to be logged in 
            // as any user with a bearer token. If not logged in, it will fail.
            const result = await api.executeDraw(drawId);
            setActionMessage(`✅ Success! Winner: ${result.winner.name} won $${result.winner.amount.toLocaleString()}`);
            await refreshData();
        } catch (err) {
            setError(err.message || 'Failed to execute draw. Ensure you are logged into the main app first.');
        }
        setLoading(false);
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-login-container">
                <div className="admin-login-box">
                    <h2>🛡️ Admin Portal</h2>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            placeholder="Admin Secret"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            required
                        />
                        {error && <div className="admin-error">{error}</div>}
                        <button type="submit" disabled={loading}>
                            {loading ? 'Authenticating...' : 'Enter'}
                        </button>
                    </form>
                    <button className="admin-back" onClick={onBack}>← Back to Site</button>
                </div>
            </div>
        );
    }

    const formatCurrency = (n) => "$" + Number(n).toLocaleString();

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div>
                    <h1>Potluck OS V1</h1>
                    <span className="admin-badge">Admin Privileges Active</span>
                </div>
                <div>
                    {actionMessage && <span className="admin-success">{actionMessage}</span>}
                    {error && <span className="admin-error">{error}</span>}
                    <button onClick={refreshData} className="refresh-btn">🔄 Refresh</button>
                    <button onClick={onBack} className="logout-btn">Exit</button>
                </div>
            </header>

            <main className="admin-main">
                <section className="admin-metrics">
                    <div className="metric-card">
                        <h3>Total Value Locked (TVL)</h3>
                        <div className="metric-value">{formatCurrency(stats?.tvl || 0)}</div>
                    </div>
                    <div className="metric-card">
                        <h3>Total Active Members</h3>
                        <div className="metric-value">{stats?.users_count || 0}</div>
                    </div>
                    <div className="metric-card">
                        <h3>Waitlist Signups</h3>
                        <div className="metric-value">{stats?.waitlist_count || 0}</div>
                    </div>
                </section>

                <div className="admin-grid">
                    <section className="admin-panel">
                        <h2>🎲 Draw Controls</h2>
                        <div className="draws-list">
                            {stats?.draws?.filter(d => d.status === 'upcoming').map(draw => (
                                <div key={draw.id} className="draw-card">
                                    <div className="draw-info">
                                        <span className="draw-type">{draw.type.toUpperCase()} DRAW</span>
                                        <div className="draw-pool">Pool: {formatCurrency(draw.prize_pool)}</div>
                                        <div className="draw-date">Scheduled: {new Date(draw.scheduled_at).toLocaleDateString()}</div>
                                    </div>
                                    <button
                                        className="trigger-btn"
                                        onClick={() => triggerDraw(draw.id)}
                                        disabled={loading}
                                    >
                                        Execute Now ⚡
                                    </button>
                                </div>
                            ))}
                            {stats?.draws?.filter(d => d.status === 'upcoming').length === 0 && (
                                <div className="no-draws">No upcoming draws.</div>
                            )}
                        </div>
                    </section>

                    <section className="admin-panel table-panel">
                        <h2>📋 Waitlist ({waitlist.length})</h2>
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Email</th>
                                        <th>Created At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {waitlist.map(w => (
                                        <tr key={w.id}>
                                            <td>{w.id}</td>
                                            <td>{w.email}</td>
                                            <td>{new Date(w.created_at).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
