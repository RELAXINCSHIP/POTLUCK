import React, { useState } from 'react';
import './SavingsStyles.css';
import { formatCurrency } from '../App';

const CHART_PATHS = {
    '1H': 'M0,100 Q30,95 60,98 T120,90 T180,95 T240,92 T342,88',
    '1D': 'M0,120 Q40,110 80,115 T160,95 T240,100 T342,80',
    '1W': 'M0,150 Q50,130 80,140 T160,80 T240,110 T342,40',
    '1M': 'M0,140 Q60,160 100,120 T200,60 T280,90 T342,50',
    '1Y': 'M0,170 Q80,150 120,160 T200,100 T300,40 T342,60',
    'ALL': 'M0,175 Q50,170 100,160 T180,140 T260,80 T342,30',
};

const CHART_FILLS = {
    '1H': 'M0,100 Q30,95 60,98 T120,90 T180,95 T240,92 T342,88 L342,180 L0,180 Z',
    '1D': 'M0,120 Q40,110 80,115 T160,95 T240,100 T342,80 L342,180 L0,180 Z',
    '1W': 'M0,150 Q50,130 80,140 T160,80 T240,110 T342,40 L342,180 L0,180 Z',
    '1M': 'M0,140 Q60,160 100,120 T200,60 T280,90 T342,50 L342,180 L0,180 Z',
    '1Y': 'M0,170 Q80,150 120,160 T200,100 T300,40 T342,60 L342,180 L0,180 Z',
    'ALL': 'M0,175 Q50,170 100,160 T180,140 T260,80 T342,30 L342,180 L0,180 Z',
};

const CHANGES = {
    '1H': { pct: '+0.12%', val: '+$863', color: '#81C784' },
    '1D': { pct: '+1.8%', val: '+$12,952', color: '#81C784' },
    '1W': { pct: '+3.4%', val: '+$23,681', color: '#81C784' },
    '1M': { pct: '+8.7%', val: '+$57,440', color: '#81C784' },
    '1Y': { pct: '+42.3%', val: '+$213,100', color: '#81C784' },
    'ALL': { pct: '+127.5%', val: '+$403,200', color: '#81C784' },
};

const MOCK_TXS = [
    { type: 'in', title: 'Received', sub: 'From External Wallet', btc: '+0.045 BTC', usd: '7,820.40' },
    { type: 'out', title: 'Sent', sub: 'To Exchange', btc: '-0.120 BTC', usd: '20,854.22' },
    { type: 'yield', title: 'Staking Reward', sub: 'Monthly Yield', btc: '+0.0008 BTC', usd: '139.10' },
    { type: 'in', title: 'Received', sub: 'DCA Purchase', btc: '+0.025 BTC', usd: '4,350.00' },
    { type: 'yield', title: 'Staking Reward', sub: 'Weekly Yield', btc: '+0.0002 BTC', usd: '34.78' },
];

const AssetDetails = ({ onNavigate, asset }) => {
    const [tf, setTf] = useState('1W');
    const [showSend, setShowSend] = useState(false);
    const [sendAmt, setSendAmt] = useState('');
    const [sendAddr, setSendAddr] = useState('');
    const [sent, setSent] = useState(false);

    if (!asset) {
        return (
            <div className="savings-app page-transition">
                <div className="app-container" style={{ textAlign: 'center', paddingTop: 100, color: 'rgba(255,255,255,0.4)' }}>
                    Asset not found.
                    <br /><br />
                    <button onClick={() => onNavigate('home')} style={{
                        background: 'rgba(255,255,255,0.1)', border: 'none', padding: '10px 20px',
                        borderRadius: 10, color: '#fff', cursor: 'pointer'
                    }}>Go Back</button>
                </div>
            </div>
        );
    }

    const handleSend = () => {
        if (!sendAmt || !sendAddr) return;
        setSent(true);
        setTimeout(() => { setSent(false); setShowSend(false); setSendAmt(''); setSendAddr(''); }, 2000);
    };

    const change = CHANGES[tf];

    return (
        <div className="savings-app page-transition">
            <div className="app-container">
                <header className="header-nav" style={{ padding: 0, margin: '20px 0 24px' }}>
                    <div className="back-btn" onClick={() => onNavigate('home')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-secondary)' }}>{asset.name}</h1>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', opacity: 0.6, textTransform: 'capitalize' }}>
                            {asset.type?.replace('_', ' ') || 'Asset'} Details
                        </p>
                    </div>
                    <div style={{ width: 44 }}></div>
                </header>

                {/* Balance */}
                <section style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '14px', color: 'var(--accent-gold)', marginBottom: '8px', fontWeight: '500' }}>
                        {asset.icon} {asset.name.split(' (')[0]}
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: '700', letterSpacing: '-1px' }}>
                        {formatCurrency(asset.value)}
                    </div>
                    {asset.change !== undefined && (
                        <div style={{
                            fontSize: 13,
                            color: asset.change > 0 ? '#81C784' : asset.change < 0 ? '#EF4444' : 'rgba(255,255,255,0.4)',
                            fontWeight: 700, marginTop: 4
                        }}>
                            {asset.change > 0 ? '+' : ''}{asset.change}% (24h)
                        </div>
                    )}
                </section>

                {/* Chart */}
                <div className="chart-container" style={{ marginBottom: 8 }}>
                    <svg className="chart-svg" viewBox="0 0 342 180" style={{ transition: 'all 0.3s ease' }}>
                        <defs>
                            <linearGradient id="chart-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{ stopColor: 'var(--accent-gold)', stopOpacity: 0.3 }}></stop>
                                <stop offset="100%" style={{ stopColor: 'var(--accent-gold)', stopOpacity: 0 }}></stop>
                            </linearGradient>
                        </defs>
                        <path fill="url(#chart-grad)" d={CHART_FILLS[tf]} style={{ transition: 'd 0.4s ease' }}></path>
                        <path fill="none" stroke="var(--accent-gold)" strokeWidth="2.5" strokeLinecap="round" d={CHART_PATHS[tf]} style={{ transition: 'd 0.4s ease' }}></path>
                    </svg>
                </div>

                {/* Timeframes */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
                    {Object.keys(CHART_PATHS).map(t => (
                        <button key={t} onClick={() => setTf(t)} style={{
                            flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                            background: tf === t ? 'rgba(255,213,79,0.12)' : 'transparent',
                            color: tf === t ? '#FFD54F' : 'rgba(255,255,255,0.3)',
                            fontSize: 12, fontWeight: 700, transition: 'all 0.2s',
                        }}>{t}</button>
                    ))}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: 20 }}>
                    <button onClick={() => setShowSend(true)} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 14, padding: 14, color: '#fff', fontSize: 14, fontWeight: 600,
                        cursor: 'pointer',
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFD54F" strokeWidth="2.5">
                            <line x1="12" y1="19" x2="12" y2="5"></line>
                            <polyline points="5 12 12 5 19 12"></polyline>
                        </svg>
                        Send
                    </button>
                    <button style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 14, padding: 14, color: '#fff', fontSize: 14, fontWeight: 600,
                        cursor: 'pointer',
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#81C784" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <polyline points="19 12 12 19 5 12"></polyline>
                        </svg>
                        Receive
                    </button>
                </div>

                {/* Send Panel */}
                {showSend && (
                    <div style={{
                        background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16,
                        border: '1px solid rgba(255,213,79,0.15)', marginBottom: 20,
                    }}>
                        {sent ? (
                            <div style={{ textAlign: 'center', padding: 20 }}>
                                <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#81C784' }}>Transaction Sent!</div>
                            </div>
                        ) : (
                            <>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Transfer Asset</div>
                                <input value={sendAddr} onChange={e => setSendAddr(e.target.value)}
                                    placeholder="Destination address / account" style={{
                                        width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,213,79,0.2)',
                                        borderRadius: 10, padding: '10px 12px', color: '#fff', fontSize: 13,
                                        outline: 'none', marginBottom: 8, fontFamily: 'inherit',
                                    }} />
                                <input value={sendAmt} onChange={e => setSendAmt(e.target.value)}
                                    placeholder="Amount" type="number" step="0.001" style={{
                                        width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,213,79,0.2)',
                                        borderRadius: 10, padding: '10px 12px', color: '#fff', fontSize: 13,
                                        outline: 'none', marginBottom: 10, fontFamily: 'inherit',
                                    }} />
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => setShowSend(false)} style={{
                                        flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 10, padding: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                    }}>Cancel</button>
                                    <button onClick={handleSend} style={{
                                        flex: 1, background: 'linear-gradient(135deg, #FFD54F, #FFB300)', border: 'none',
                                        borderRadius: 10, padding: 10, color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                    }}>Confirm Send</button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Recent Activity */}
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Recent Activity</span>
                        <span style={{ fontSize: 12, color: '#FFD54F', cursor: 'pointer', fontWeight: 600 }}
                            onClick={() => onNavigate('transactions')}>View All</span>
                    </div>
                    <div style={{ paddingBottom: 80 }}>
                        {MOCK_TXS.map((tx, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 10,
                                        background: 'rgba(255,255,255,0.05)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                            stroke={tx.type === 'out' ? '#EF4444' : tx.type === 'yield' ? '#FFD54F' : '#81C784'} strokeWidth="3">
                                            {tx.type === 'out' ? (
                                                <><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>
                                            ) : tx.type === 'yield' ? (
                                                <><circle cx="12" cy="12" r="8" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></>
                                            ) : (
                                                <><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></>
                                            )}
                                        </svg>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{tx.title}</div>
                                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{tx.sub}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: tx.type === 'out' ? '#EF4444' : '#81C784' }}>{tx.btc}</div>
                                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>${tx.usd}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AssetDetails;
