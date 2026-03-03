import React, { useState } from 'react';
import './SavingsStyles.css';

const CURRENCIES = [
    { code: 'USD', name: 'US Dollar', symbol: '$', type: 'fiat' },
    { code: 'EUR', name: 'Euro', symbol: '€', type: 'fiat' },
    { code: 'GBP', name: 'British Pound', symbol: '£', type: 'fiat' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', type: 'fiat' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', type: 'fiat' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', type: 'fiat' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', type: 'fiat' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', type: 'fiat' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', type: 'fiat' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', type: 'fiat' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', type: 'fiat' },
    { code: 'KRW', name: 'Korean Won', symbol: '₩', type: 'fiat' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$', type: 'fiat' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', type: 'fiat' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', type: 'fiat' },
    { code: 'BTC', name: 'Bitcoin', symbol: '₿', type: 'crypto' },
    { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', type: 'crypto' },
    { code: 'SOL', name: 'Solana', symbol: '◎', type: 'crypto' },
    { code: 'USDC', name: 'USD Coin', symbol: '$', type: 'crypto' },
    { code: 'USDT', name: 'Tether', symbol: '₮', type: 'crypto' },
];

const SPENDING_CATEGORIES = [
    { icon: '🍽️', label: 'Dine', amount: '12,450' },
    { icon: '🏠', label: 'Home', amount: '8,200' },
    { icon: '👗', label: 'Style', amount: '6,440' },
    { icon: '✈️', label: 'Travel', amount: '4,100' },
    { icon: '🏋️', label: 'Health', amount: '2,800' },
];

const SettingsPage = ({ onNavigate }) => {
    const [currency, setCurrency] = useState('USD');
    const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
    const [user, setUser] = useState(null);
    const selectedCurrency = CURRENCIES.find(c => c.code === currency);

    return (
        <div className="savings-app page-transition">
            <div className="app-container">
                <div className="header-nav" style={{ padding: 0, margin: '20px 0 0' }}>
                    <div className="back-btn" onClick={() => onNavigate('home')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </div>
                    <div style={{ fontWeight: 500 }}>Settings</div>
                    <div style={{ width: '40px' }}></div>
                </div>

                <div className="profile-hero">
                    <div style={{ position: 'relative', marginBottom: '16px' }}>
                        <div className="avatar-large">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                        <div className="tier-badge">BLACK CARD MEMBER</div>
                    </div>
                    <h1 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '4px' }}>{user ? user.name : 'Julian Sterling'}</h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{user ? user.email : 'j.sterling@email.com'}</p>
                </div>

                {/* Personal Details */}
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '24px 0 12px 4px' }}>Personal Details</div>
                <div className="settings-card">
                    <div className="settings-item">
                        <div className="tx-left">
                            <div className="tx-icon" style={{ width: '32px', height: '32px' }}>📱</div>
                            <div style={{ fontSize: '15px', fontWeight: 500 }}>Phone Number</div>
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>+1 (555) 293-8841</div>
                    </div>
                    <div className="settings-item">
                        <div className="tx-left">
                            <div className="tx-icon" style={{ width: '32px', height: '32px' }}>📍</div>
                            <div style={{ fontSize: '15px', fontWeight: 500 }}>Home Address</div>
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '24px 0 12px 4px' }}>Preferences</div>
                <div className="settings-card">
                    <div className="settings-item">
                        <div className="tx-left">
                            <div className="tx-icon" style={{ width: '32px', height: '32px' }}>🔔</div>
                            <div style={{ fontSize: '15px', fontWeight: 500 }}>Notifications</div>
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>All Enabled</div>
                    </div>
                    <div className="settings-item" onClick={() => setShowCurrencyPicker(!showCurrencyPicker)} style={{ cursor: 'pointer' }}>
                        <div className="tx-left">
                            <div className="tx-icon" style={{ width: '32px', height: '32px' }}>💸</div>
                            <div style={{ fontSize: '15px', fontWeight: 500 }}>Currency</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: '14px', fontWeight: 500 }} className="text-gold">{selectedCurrency?.code} ({selectedCurrency?.name})</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2" style={{ transform: showCurrencyPicker ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </div>
                    </div>

                    {/* Currency Picker */}
                    {showCurrencyPicker && (
                        <div style={{ padding: '0 16px 12px' }}>
                            {/* Fiat */}
                            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, padding: '10px 0 6px' }}>Fiat Currencies</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                                {CURRENCIES.filter(c => c.type === 'fiat').map(c => (
                                    <button key={c.code} onClick={() => { setCurrency(c.code); setShowCurrencyPicker(false); }} style={{
                                        background: currency === c.code ? 'rgba(255,213,79,0.12)' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${currency === c.code ? 'rgba(255,213,79,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                        borderRadius: 10, padding: '8px 10px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 6, textAlign: 'left',
                                        color: currency === c.code ? '#FFD54F' : 'rgba(255,255,255,0.6)',
                                        fontSize: 12, fontWeight: 500, transition: 'all 0.15s ease',
                                    }}>
                                        <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{c.symbol}</span>
                                        <span>{c.code}</span>
                                    </button>
                                ))}
                            </div>
                            {/* Crypto */}
                            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, padding: '14px 0 6px' }}>Crypto</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                                {CURRENCIES.filter(c => c.type === 'crypto').map(c => (
                                    <button key={c.code} onClick={() => { setCurrency(c.code); setShowCurrencyPicker(false); }} style={{
                                        background: currency === c.code ? 'rgba(255,213,79,0.12)' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${currency === c.code ? 'rgba(255,213,79,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                        borderRadius: 10, padding: '8px 10px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 6, textAlign: 'left',
                                        color: currency === c.code ? '#FFD54F' : 'rgba(255,255,255,0.6)',
                                        fontSize: 12, fontWeight: 500, transition: 'all 0.15s ease',
                                    }}>
                                        <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{c.symbol}</span>
                                        <span>{c.code}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Monthly Limit Usage */}
                <div className="settings-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
                        <svg viewBox="0 0 56 56" style={{ width: '56px', height: '56px', transform: 'rotate(-90deg)' }}>
                            <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                            <circle cx="28" cy="28" r="24" fill="none" stroke="var(--accent-gold)" strokeWidth="4"
                                strokeDasharray={`${2 * Math.PI * 24 * 0.7} ${2 * Math.PI * 24 * 0.3}`}
                                strokeLinecap="round" />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'var(--accent-gold)' }}>70%</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>Monthly Limit Usage</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>$14,890.70 remaining of $60,000.00 limit</div>
                    </div>
                </div>

                {/* Freeze Card */}
                <div className="settings-card" style={{ marginTop: '12px' }}>
                    <div className="settings-item">
                        <div className="tx-left">
                            <div className="tx-icon" style={{ width: '32px', height: '32px' }}>🔒</div>
                            <div style={{ fontSize: '15px', fontWeight: 500 }}>Freeze Card</div>
                        </div>
                        <div className="toggle"></div>
                    </div>
                </div>

                {/* Spending Categories */}
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '24px 0 12px 4px' }}>Spending Categories</div>
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    overflowX: 'auto',
                    paddingBottom: '16px',
                    scrollbarWidth: 'none',
                }}>
                    {SPENDING_CATEGORIES.map((cat, i) => (
                        <div key={i} style={{
                            minWidth: '80px',
                            background: 'var(--bg-glass)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: 'var(--radius-md)',
                            padding: '14px 10px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '20px' }}>{cat.icon}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 500 }}>{cat.label}</div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{cat.amount}</div>
                        </div>
                    ))}
                </div>

                {/* Security */}
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '24px 0 12px 4px' }}>Security</div>
                <div className="settings-card">
                    <div className="settings-item">
                        <div className="tx-left">
                            <div className="tx-icon" style={{ width: '32px', height: '32px' }}>👤</div>
                            <div style={{ fontSize: '15px', fontWeight: 500 }}>Biometric Login</div>
                        </div>
                        <div className="toggle on"></div>
                    </div>
                    <div className="settings-item">
                        <div className="tx-left">
                            <div className="tx-icon" style={{ width: '32px', height: '32px' }}>🔑</div>
                            <div style={{ fontSize: '15px', fontWeight: 500 }}>Change Passcode</div>
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default SettingsPage;
