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

const SavingsHome = ({ user, onNavigate, assets = [], setAssets, plaidBalance = 0, plaidAccounts = [], loading = false, onRefresh, goals = [], setGoals }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [txs] = useState(INITIAL_TXS); // Transactions still mock for now

    // Dedicated fund states
    const [cardBalance, setCardBalance] = useState(41109.30); // Assuming this is a liability

    const [showTransfer, setShowTransfer] = useState(false);
    const [transferAmount, setTransferAmount] = useState('');
    const [transferTarget, setTransferTarget] = useState('');

    const totalGoalSaved = goals ? goals.reduce((s, g) => s + (g.saved || 0), 0) : 0;
    const totalBalance = assets.reduce((s, a) => s + (a.value || 0), 0) + plaidBalance + totalGoalSaved - cardBalance;

    const handleTransfer = () => {
        const amt = parseFloat(transferAmount);
        if (!amt || amt <= 0 || !transferTarget) return;
        // In a real app, this would hit the API
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
                            {assets.slice(0, 5).map(asset => (
                                <div key={asset.id} onClick={() => onNavigate('asset', asset)} style={{
                                    minWidth: 150, borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                                    background: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%), ${asset.bg_image ? `url(${asset.bg_image})` : '#222'} center/cover`,
                                    padding: '60px 14px 14px', position: 'relative',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                }}>
                                    <div style={{ fontSize: 20, marginBottom: 4 }}>{asset.icon}</div>
                                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{asset.name}</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>${fmt(asset.value)}</div>
                                    {typeof asset.change === 'number' && asset.change !== 0 && (
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
                    {plaidAccounts.length === 0 && (
                        <PlaidLinkButton
                            userId={user?.id || "potluck-user-1"}
                            onSuccess={() => onRefresh && onRefresh()}
                        />
                    )}
                    <LinkedAccounts userId={user?.id || "potluck-user-1"} accounts={plaidAccounts} />
                </section>

                {/* Financial Goals */}
                <section style={{ marginTop: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Goals</span>
                        <span onClick={() => onNavigate('goals_list')} style={{
                            fontSize: 12, color: '#FFD54F', cursor: 'pointer', fontWeight: 600
                        }}>View All</span>
                    </div>

                    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
                        {goals.map(goal => (
                            <div key={goal.id} onClick={() => onNavigate('goal', goal)} style={{
                                minWidth: 240, borderRadius: 16, overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
                                background: `linear-gradient(135deg, rgba(8,8,8,0.4), rgba(8,8,8,0.8)), url(${goal.image}) center/cover`,
                                border: '1px solid rgba(255,255,255,0.08)', padding: 16,
                                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 120,
                            }}>
                                <div style={{ marginBottom: 'auto' }}>
                                    <span style={{
                                        background: 'rgba(129,199,132,0.8)', color: '#000', backdropFilter: 'blur(10px)',
                                        padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800, textTransform: 'uppercase'
                                    }}>Bucket</span>
                                </div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{goal.title}</div>
                                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                                    ${fmt(goal.saved)} / ${fmt(goal.target)}
                                </div>
                                <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden', marginTop: 10 }}>
                                    <div style={{
                                        height: '100%', borderRadius: 3, transition: 'width 0.5s ease',
                                        background: 'linear-gradient(90deg, #4CAF50, #81C784)',
                                        width: `${Math.min(100, (goal.saved / goal.target) * 100)}%`,
                                    }} />
                                </div>
                            </div>
                        ))}
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
                onAssetAdded={(newAsset) => {
                    if (setAssets) setAssets(prev => [newAsset, ...prev]);
                }}
            />
        </div>
    );
};

export default SavingsHome;
