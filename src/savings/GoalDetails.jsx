import React, { useState } from 'react';
import './SavingsStyles.css';

const GoalDetails = ({ onNavigate, goal, setGoals }) => {
    // If goal is undefined (e.g. refreshed on this tab), fallback gracefully
    if (!goal) {
        return (
            <div style={{ padding: 40, textAlign: 'center', color: '#fff' }}>
                <h3>Goal not found</h3>
                <button onClick={() => onNavigate('goals_list')} style={{ padding: '8px 16px', borderRadius: 8 }}>Go Back</button>
            </div>
        );
    }

    const { id, title, saved, target, image } = goal;

    const [topUpAmt, setTopUpAmt] = useState('');
    const [showTopUp, setShowTopUp] = useState(false);
    const [justToppedUp, setJustToppedUp] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(title);
    const [editTarget, setEditTarget] = useState(target);
    const [editImage, setEditImage] = useState(image);

    const pct = Math.min(100, (saved / target) * 100);
    const remaining = Math.max(0, target - saved);
    const fmt = n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const handleTopUp = (amt) => {
        const val = typeof amt === 'number' ? amt : parseFloat(topUpAmt);
        if (!val || val <= 0) return;

        setGoals(prev => prev.map(g => {
            if (g.id === id) {
                return { ...g, saved: Math.min(g.saved + val, g.target) };
            }
            return g;
        }));

        setTopUpAmt('');
        setShowTopUp(false);
        setJustToppedUp(true);
        setTimeout(() => setJustToppedUp(false), 2000);
    };

    const handleSaveEdit = () => {
        setGoals(prev => prev.map(g => {
            if (g.id === id) {
                return { ...g, title: editTitle, target: parseFloat(editTarget), image: editImage };
            }
            return g;
        }));
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this goal?")) {
            setGoals(prev => prev.filter(g => g.id !== id));
            onNavigate('goals_list');
        }
    };

    if (isEditing) {
        return (
            <div className="savings-app page-transition" style={{ padding: '24px', flex: 1, overflow: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div onClick={() => setIsEditing(false)} style={{ cursor: 'pointer', padding: 8 }}>✕</div>
                    <div style={{ fontWeight: 700 }}>Edit Goal</div>
                    <div style={{ width: 32 }}></div>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'block' }}>Goal Name</label>
                        <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: 12, borderRadius: 8, color: '#fff', fontSize: 16 }} />
                    </div>
                    <div>
                        <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'block' }}>Target Amount ($)</label>
                        <input value={editTarget} onChange={e => setEditTarget(e.target.value)} type="number"
                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: 12, borderRadius: 8, color: '#fff', fontSize: 16 }} />
                    </div>
                    <div>
                        <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'block' }}>Cover Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => {
                                const file = e.target.files[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => setEditImage(reader.result);
                                    reader.readAsDataURL(file);
                                }
                            }}
                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: 12, borderRadius: 8, color: '#fff', fontSize: 14 }}
                        />
                        {editImage && <img src={editImage} alt="Preview" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, marginTop: 12 }} />}
                    </div>

                    <button onClick={handleSaveEdit} style={{
                        background: 'linear-gradient(135deg, #FFD54F, #FFB300)', color: '#000', filter: 'none',
                        padding: 16, borderRadius: 12, fontSize: 16, fontWeight: 700, border: 'none', marginTop: 16, cursor: 'pointer'
                    }}>Save Changes</button>

                    <button onClick={handleDelete} style={{
                        background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)',
                        padding: 16, borderRadius: 12, fontSize: 14, fontWeight: 700, marginTop: 8, cursor: 'pointer'
                    }}>Delete Goal</button>
                </div>
            </div>
        );
    }

    return (
        <div className="savings-app page-transition">
            <header className="header-nav" style={{ position: 'relative', zIndex: 10, padding: '24px 24px 0' }}>
                <div className="back-btn" onClick={() => onNavigate('goals_list')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M15 18l-6-6 6-6"></path>
                    </svg>
                </div>
                <div style={{ fontWeight: 600 }}>Goal Details</div>
                <div onClick={() => setIsEditing(true)} style={{ fontSize: 13, fontWeight: 600, color: '#FFD54F', cursor: 'pointer' }}>Edit</div>
            </header>

            <div className="goal-hero">
                <img src={image} alt={title} className="hero-img" />
                <div className="hero-overlay"></div>
            </div>

            <div className="content">
                <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.5px' }}>{title}</h1>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px',
                    borderRadius: 20, background: pct >= 100 ? 'rgba(129,199,132,0.15)' : 'rgba(255,213,79,0.1)',
                    border: `1px solid ${pct >= 100 ? 'rgba(129,199,132,0.3)' : 'rgba(255,213,79,0.2)'}`,
                    marginBottom: 20,
                }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: pct >= 100 ? '#81C784' : '#FFD54F' }}></div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: pct >= 100 ? '#81C784' : '#FFD54F' }}>
                        {pct >= 100 ? '🎉 Goal Complete!' : 'On track · Oct 2024'}
                    </span>
                </div>

                {/* Success Animation */}
                {justToppedUp && (
                    <div style={{
                        textAlign: 'center', padding: 16, marginBottom: 16,
                        background: 'rgba(129,199,132,0.08)', borderRadius: 16,
                        border: '1px solid rgba(129,199,132,0.2)',
                    }}>
                        <div style={{ fontSize: 28, marginBottom: 4 }}>✅</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#81C784' }}>Funds Added!</div>
                    </div>
                )}

                {/* Progress */}
                <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
                        <div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Total Saved</div>
                            <div style={{ fontSize: 24, fontWeight: 700 }}>${fmt(saved)}</div>
                        </div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>/ ${fmt(target)}</div>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                        <div style={{
                            height: '100%', borderRadius: 4,
                            background: 'linear-gradient(90deg, #FFB300, #FFD54F)',
                            width: `${pct}%`, transition: 'width 0.6s ease',
                        }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: '#FFD54F', fontWeight: 600 }}>{pct.toFixed(1)}% complete</span>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>${fmt(remaining)} remaining</span>
                    </div>
                </div>

                {/* Quick Add Buttons */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    {[1000, 5000, 10000, 25000].map(amt => (
                        <button key={amt} onClick={() => handleTopUp(amt)} style={{
                            flex: 1, padding: '10px 0', borderRadius: 12, cursor: 'pointer',
                            background: 'rgba(255,213,79,0.06)', border: '1px solid rgba(255,213,79,0.15)',
                            color: '#FFD54F', fontSize: 11, fontWeight: 700,
                        }}>+${(amt / 1000)}k</button>
                    ))}
                </div>

                {/* Custom Top Up */}
                <button onClick={() => setShowTopUp(!showTopUp)} style={{
                    width: '100%', padding: 14, borderRadius: 14, cursor: 'pointer',
                    background: showTopUp ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg, #FFD54F, #FFB300)',
                    border: showTopUp ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    color: showTopUp ? '#fff' : '#000', fontSize: 14, fontWeight: 700,
                    marginBottom: showTopUp ? 0 : 20,
                }}>{showTopUp ? 'Cancel' : 'Custom Amount'}</button>

                {showTopUp && (
                    <div style={{ padding: '12px 0 20px' }}>
                        <input value={topUpAmt} onChange={e => setTopUpAmt(e.target.value)}
                            placeholder="Enter amount (USD)" type="number" autoFocus
                            style={{
                                width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,213,79,0.2)',
                                borderRadius: 12, padding: '12px 14px', color: '#fff', fontSize: 14,
                                outline: 'none', marginBottom: 10, fontFamily: 'inherit',
                            }} />
                        <button onClick={() => handleTopUp()} style={{
                            width: '100%', padding: 14, borderRadius: 14,
                            background: 'linear-gradient(135deg, #FFD54F, #FFB300)', border: 'none',
                            color: '#000', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                        }}>Add to Goal</button>
                    </div>
                )}

                {/* Timeline */}
                <div style={{ marginBottom: 32 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>Funding Timeline</div>
                    {[
                        { title: 'Monthly Contribution', sub: 'Scheduled for Jun 28', amount: '+$12,500', active: true },
                        { title: 'Bonus Allocation', sub: 'Pending confirmation', amount: 'Est. +$25k', badge: true },
                        { title: 'Final Payment', sub: 'Projected Oct 2024', amount: 'End Goal' },
                    ].map((item, i) => (
                        <div key={i} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '12px 14px', marginBottom: 6,
                            background: item.active ? 'rgba(255,213,79,0.04)' : 'rgba(255,255,255,0.02)',
                            borderRadius: 14, border: `1px solid ${item.active ? 'rgba(255,213,79,0.12)' : 'rgba(255,255,255,0.04)'}`,
                        }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{item.title}</div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{item.sub}</div>
                            </div>
                            {item.badge ? (
                                <div style={{
                                    background: 'rgba(255,213,79,0.1)', color: '#FFD54F',
                                    padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                                }}>{item.amount}</div>
                            ) : (
                                <span style={{ fontSize: 13, fontWeight: 700, color: item.active ? '#81C784' : 'rgba(255,255,255,0.3)' }}>{item.amount}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GoalDetails;
