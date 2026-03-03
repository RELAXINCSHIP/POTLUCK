import React, { useState, useEffect } from 'react';
import './SavingsStyles.css';
import { AssetModal } from './components/Modal';
import PlaidLinkButton from '../plaid/PlaidLinkButton';
import LinkedAccounts from '../plaid/LinkedAccounts';
import { getAssets } from '../api';
import { getAccounts } from '../plaid/plaidApi';

const INITIAL_TXS = [
    { id: 1, icon: "⚡", title: "Utility Bill", subtitle: "Auto-payment", amount: -450.00, time: "2h ago" },
    { id: 2, icon: "★", title: "Investment Yield", subtitle: "Portfolio A", amount: +1240.50, time: "5h ago" },
    { id: 3, icon: "💳", title: "Card Payment", subtitle: "Amazon", amount: -89.99, time: "1d ago" },
    { id: 4, icon: "💰", title: "Salary Deposit", subtitle: "Direct deposit", amount: +8500.00, time: "2d ago" },
    { id: 5, icon: "🍽️", title: "Restaurant", subtitle: "Nobu Malibu", amount: -342.00, time: "3d ago" },
];

const INITIAL_ASSETS = [
    { id: 1, icon: "₿", name: "Cold Storage (10 BTC)", value: 850000.00, change: +0.0, bg_image: "https://images.unsplash.com/photo-1549488497-236b28292d8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" },
    { id: 2, icon: "✈️", name: "Travel Fund", value: 22375.00, change: +0.8, bg_image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" },
    { id: 3, icon: "🛍️", name: "Luxury Card", value: 41109.30, change: -1.2, bg_image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" },
    { id: 4, icon: "📈", name: "S&P 500 Index", value: 58487.40, change: +0.0, bg_image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" },
];

const SavingsHome = ({ onNavigate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [assets, setAssets] = useState(INITIAL_ASSETS);
    const [marketData, setMarketData] = useState(null);
    const [plaidBalance, setPlaidBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [txs] = useState(INITIAL_TXS); // Transactions still mock for now

    // Dedicated fund states
    const [goalSaved, setGoalSaved] = useState(328450);
    const [cardBalance, setCardBalance] = useState(41109.30); // Assuming this is a liability

    const [showTransfer, setShowTransfer] = useState(false);
    const [transferAmount, setTransferAmount] = useState('');
    const [transferTarget, setTransferTarget] = useState('');
    const [plaidRefreshKey, setPlaidRefreshKey] = useState(0);

    // Fetch live market data
    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                const cryptoRes = await fetch('/api/market/crypto').catch(() => null);
                const cryptoData = cryptoRes?.ok ? await cryptoRes.json() : null;

                const stockRes = await fetch('/api/market/stocks').catch(() => null);
                const stockData = stockRes?.ok ? await stockRes.json() : null;

                setMarketData({ crypto: cryptoData, stocks: stockData });
            } catch (err) {
                console.warn("Failed to fetch live market data", err);
            }
        };
        fetchMarketData();
    }, []);

    useEffect(() => {
        let cancelled = false;
        const loadData = async () => {
            try {
                setLoading(true);
                // 1. Fetch Supabase custom assets
                const dbAssets = await getAssets();
                if (!cancelled) setAssets(dbAssets.length > 0 ? dbAssets : INITIAL_ASSETS);

                // 2. Fetch Plaid linked account balances
                const plaidData = await getAccounts('potluck-user-1').catch(() => ({ accounts: [] }));
                if (!cancelled && plaidData.accounts) {
                    let pBal = 0;
                    plaidData.accounts.forEach(acct => {
                        // Depository/Investment = increase net worth
                        if (['depository', 'investment', 'brokerage'].includes(acct.type)) {
                            pBal += acct.balance_current || 0;
                        }
                        // Credit/Loan = decrease net worth
                        else if (['credit', 'loan'].includes(acct.type)) {
                            pBal -= acct.balance_current || 0;
                        }
                    });
                    setPlaidBalance(pBal);
                }
            } catch (err) {
                console.error("Error loading Money Dashboard:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        loadData();
        return () => { cancelled = true; };
    }, [plaidRefreshKey]);

    // Calculate dynamic Net Worth
    // Merge assets with live market data for display
    const displayAssets = assets.map(a => {
        if (a.id === 1 && marketData?.crypto?.bitcoin) {
            return {
                ...a,
                value: marketData.crypto.bitcoin.usd * 10, // 10 BTC
                change: Number(marketData.crypto.bitcoin.usd_24h_change?.toFixed(2) || 0)
            };
        }
        if (a.id === 4 && marketData?.stocks?.SPY) {
            return {
                ...a,
                value: marketData.stocks.SPY.price * 100, // 100 Shares
                change: Number(marketData.stocks.SPY.percent_change?.toFixed(2) || 0)
            };
        }
        return a;
    });

    const totalBalance = displayAssets.reduce((s, a) => s + (a.value || 0), 0) + plaidBalance + goalSaved - cardBalance;

    const handleTransfer = () => {
        const amt = parseFloat(transferAmount);
        if (!amt || amt <= 0 || !transferTarget) return;
        setAssets(prev => prev.map(a =>
            a.name === transferTarget ? { ...a, value: Number(a.value) + amt } : a
        ));
        setTransferAmount('');
        setTransferTarget('');
        setShowTransfer(false);
    };

    const fmt = (n) => n?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00';

    return (
        <div className="savings-app page-transition">
            <div className={`app-container ${isModalOpen ? 'blur-active' : ''}`}>
                <svg style={{ position: 'absolute', top: '-20px', right: '-40px', opacity: 0.1, width: '200px', pointerEvents: 'none', zIndex: -1 }} viewBox="0 0 200 200">
                    <path d="M40,160 C40,160 80,40 160,80 C240,120 180,180 100,100" fill="none" stroke="#FFD54F" strokeWidth="15" strokeLinecap="round"></path>
                </svg>

                {/* Header (Net Worth) */}
                <header style={{ marginTop: '20px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h2 style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>Total Net Worth</h2>
                        <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: -1, fontFamily: "'Syne', sans-serif" }}>
                            ${fmt(totalBalance)}
                        </div>
                        <div style={{ fontSize: 12, color: totalBalance >= 0 ? '#81C784' : '#EF4444', marginTop: 4, fontWeight: 600 }}>
                            {totalBalance === 0 ? 'Start earning today' : (totalBalance > 0 ? '↑ +2.4% this month' : '↓ Net liability')}
                        </div>
                    </div>
                    <button onClick={() => setShowTransfer(!showTransfer)} style={{
                        background: 'linear-gradient(135deg, #FFD54F, #FFB300)', border: 'none',
                        borderRadius: 12, padding: '8px 14px', fontSize: 12, fontWeight: 700,
                        color: '#000', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,213,79,0.3)',
                    }}>
                        {showTransfer ? '✕ Close' : '↗ Transfer'}
                    </button>
                </header>

                {/* Transfer Panel */}
                {showTransfer && (
                    <div style={{
                        background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16,
                        border: '1px solid rgba(255,213,79,0.15)', marginBottom: 20,
                    }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Quick Transfer</div>
                        <input value={transferAmount} onChange={e => setTransferAmount(e.target.value)}
                            placeholder="Amount (USD)" type="number"
                            style={{
                                width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,213,79,0.2)',
                                borderRadius: 10, padding: '10px 12px', color: '#fff', fontSize: 14,
                                outline: 'none', marginBottom: 8, fontFamily: 'inherit',
                            }} />
                        <select value={transferTarget} onChange={e => setTransferTarget(e.target.value)}
                            style={{
                                width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,213,79,0.2)',
                                borderRadius: 10, padding: '10px 12px', color: transferTarget ? '#fff' : 'rgba(255,255,255,0.4)',
                                fontSize: 14, outline: 'none', marginBottom: 10, fontFamily: 'inherit',
                                appearance: 'none',
                            }}>
                            <option value="" style={{ background: '#111' }}>Select destination asset</option>
                            {assets.map(a => <option key={a.id} value={a.name} style={{ background: '#111' }}>{a.icon} {a.name}</option>)}
                        </select>
                        <button onClick={handleTransfer} style={{
                            width: '100%', background: 'linear-gradient(135deg, #FFD54F, #FFB300)', border: 'none',
                            borderRadius: 12, padding: 12, fontSize: 14, fontWeight: 700, color: '#000', cursor: 'pointer',
                        }}>Confirm Transfer</button>
                    </div>
                )}

                {/* Custom Lifestyle Assets */}
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Custom Assets</span>
                        <div onClick={() => setIsModalOpen(true)} style={{
                            width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,213,79,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}>
                            <span style={{ color: '#FFD54F', fontSize: 16, lineHeight: 1 }}>+</span>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ padding: 20, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading assets...</div>
                    ) : assets.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '30px 20px', background: 'rgba(255,255,255,0.02)',
                            borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)'
                        }}>
                            <div style={{ fontSize: 32, marginBottom: 10 }}>💎</div>
                            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>No custom assets yet</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
                                Track your cold storage, real estate, watches, and private equity all in one place.
                            </div>
                            <button onClick={() => setIsModalOpen(true)} style={{
                                background: 'rgba(255,213,79,0.1)', border: '1px solid rgba(255,213,79,0.3)',
                                borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 700,
                                color: '#FFD54F', cursor: 'pointer',
                            }}>
                                + Add Your First Asset
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
                            {displayAssets.map(asset => (
                                <div key={asset.id} onClick={() => onNavigate('asset', asset)} style={{
                                    minWidth: 150, borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                                    background: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%), ${asset.bg_image ? `url(${asset.bg_image})` : '#222'} center/cover`,
                                    padding: '60px 14px 14px', position: 'relative',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                }}>
                                    <div style={{ fontSize: 20, marginBottom: 4 }}>{asset.icon}</div>
                                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{asset.name}</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>${fmt(asset.value)}</div>
                                    {asset.change !== 0 && (
                                        <div style={{
                                            position: 'absolute', top: 12, right: 12,
                                            background: asset.change > 0 ? 'rgba(129,199,132,0.15)' : 'rgba(239,68,68,0.15)',
                                            color: asset.change > 0 ? '#81C784' : '#EF4444',
                                            padding: '4px 8px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                                            backdropFilter: 'blur(10px)',
                                        }}>
                                            {asset.change > 0 ? '+' : ''}{asset.change}%
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ─── Plaid: Link Bank Account ─── */}
                <section style={{ marginTop: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Banking</span>
                        <span style={{
                            fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)',
                            textTransform: 'uppercase', letterSpacing: 1,
                        }}>Powered by Plaid</span>
                    </div>
                    <PlaidLinkButton
                        userId="potluck-user-1"
                        onSuccess={() => setPlaidRefreshKey(k => k + 1)}
                    />
                    <LinkedAccounts userId="potluck-user-1" refreshKey={plaidRefreshKey} />
                </section>

                {/* Travel Fund (Savings Goal) */}
                <section style={{ marginTop: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Travel Fund</span>
                        <span style={{
                            background: 'rgba(129,199,132,0.15)', color: '#81C784',
                            padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase'
                        }}>Savings Bucket</span>
                    </div>
                    <div onClick={() => onNavigate('goal')} style={{
                        borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                        background: 'linear-gradient(135deg, rgba(129,199,132,0.08), rgba(129,199,132,0.02))',
                        border: '1px solid rgba(129,199,132,0.15)', padding: 16,
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Summer in Positano</div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                                    ${fmt(goalSaved)} / $15,000
                                </div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); setGoalSaved(prev => Math.min(prev + 1000, 15000)); }} style={{
                                background: 'rgba(129,199,132,0.15)', border: '1px solid rgba(129,199,132,0.3)',
                                borderRadius: 10, padding: '6px 12px', fontSize: 11, fontWeight: 700,
                                color: '#81C784', cursor: 'pointer',
                            }}>+ $1k</button>
                        </div>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                                height: '100%', borderRadius: 3, transition: 'width 0.5s ease',
                                background: 'linear-gradient(90deg, #4CAF50, #81C784)',
                                width: `${(goalSaved / 15000) * 100}%`,
                            }} />
                        </div>
                    </div>
                </section>

                {/* Luxury Card (Credit Liability) */}
                <section style={{ marginTop: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Luxury Card</span>
                        <span style={{
                            background: 'rgba(239,68,68,0.15)', color: '#EF4444',
                            padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase'
                        }}>Credit Program</span>
                    </div>
                    <div style={{
                        borderRadius: 16, overflow: 'hidden', position: 'relative',
                        background: 'linear-gradient(135deg, #1A1A1A, #000)',
                        border: '1px solid rgba(255,213,79,0.2)', padding: 20,
                    }}>
                        <div style={{ position: 'absolute', top: 20, right: 20, fontSize: 24, opacity: 0.2 }}>💳</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Current Balance</div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: '#EF4444', marginBottom: 16 }}>
                            ${fmt(cardBalance)}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                            <div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Available Credit</div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>${fmt(250000 - cardBalance)}</div>
                            </div>
                            <button onClick={() => setCardBalance(prev => prev + 2500)} style={{
                                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 10, padding: '6px 14px', fontSize: 11, fontWeight: 700,
                                color: '#fff', cursor: 'pointer',
                            }}>Simulate Spend</button>
                        </div>
                    </div>
                </section>

                {/* Recent Activity */}
                <section style={{ marginTop: '24px', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Recent Activity</span>
                        <span style={{ fontSize: 12, color: '#FFD54F', cursor: 'pointer', fontWeight: 600 }}
                            onClick={() => onNavigate('transactions')}>View All</span>
                    </div>
                    {txs.slice(0, 4).map(tx => (
                        <div key={tx.id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    background: 'rgba(255,255,255,0.05)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', fontSize: 16,
                                }}>{tx.icon}</div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{tx.title}</div>
                                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{tx.subtitle} · {tx.time}</div>
                                </div>
                            </div>
                            <div style={{
                                fontSize: 14, fontWeight: 700,
                                color: tx.amount >= 0 ? '#81C784' : '#EF4444',
                            }}>
                                {tx.amount >= 0 ? '+' : ''}{tx.amount < 0 ? '-' : ''}${fmt(Math.abs(tx.amount))}
                            </div>
                        </div>
                    ))}
                </section>
            </div>
            <AssetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAssetAdded={(newAsset) => setAssets(prev => [...prev, newAsset])}
            />
        </div>
    );
};

export default SavingsHome;
