import React, { useState, useEffect } from 'react';
import './SavingsStyles.css';
import { getTransactions } from '../plaid/plaidApi';

const MOCK_TRANSACTIONS = [
    {
        date: 'TODAY', items: [
            { icon: '★', title: 'Equinox Membership', subtitle: 'Lifestyle', amount: -950.00 },
            { icon: '₿', title: 'BTC Purchase', subtitle: 'Investment', amount: +3200.00 },
            { icon: '🍽️', title: 'Nobu Malibu', subtitle: 'Lifestyle', amount: -342.00 },
        ]
    },
    {
        date: 'YESTERDAY', items: [
            { icon: '⚡', title: 'DEWA Utility', subtitle: 'Utility', amount: -450.00 },
            { icon: '👟', title: 'Level Shoes', subtitle: 'Lifestyle', amount: -1120.00 },
            { icon: '💰', title: 'Salary Deposit', subtitle: 'Income', amount: +8500.00 },
        ]
    },
    {
        date: 'MAR 1', items: [
            { icon: '🏋️', title: 'Gym Membership', subtitle: 'Lifestyle', amount: -350.00 },
            { icon: '📈', title: 'Staking Reward', subtitle: 'Investment', amount: +139.10 },
            { icon: '🏠', title: 'Rent Payment', subtitle: 'Utility', amount: -3200.00 },
            { icon: '🛍️', title: 'Zara', subtitle: 'Lifestyle', amount: -289.50 },
        ]
    },
    {
        date: 'FEB 28', items: [
            { icon: '✈️', title: 'Delta Airlines', subtitle: 'Travel', amount: -1840.00 },
            { icon: '🏨', title: 'Ritz-Carlton', subtitle: 'Travel', amount: -2100.00 },
            { icon: '💳', title: 'Amazon Prime', subtitle: 'Utility', amount: -14.99 },
        ]
    },
];

const CATEGORY_ICONS = {
    'FOOD_AND_DRINK': '🍽️',
    'TRANSPORTATION': '🚗',
    'TRAVEL': '✈️',
    'GENERAL_MERCHANDISE': '🛍️',
    'ENTERTAINMENT': '🎬',
    'RENT_AND_UTILITIES': '🏠',
    'INCOME': '💰',
    'TRANSFER_IN': '💰',
    'TRANSFER_OUT': '↗️',
    'LOAN_PAYMENTS': '📄',
    'PERSONAL_CARE': '💇',
    'MEDICAL': '💊',
    'GENERAL_SERVICES': '⚙️',
    'GOVERNMENT_AND_NON_PROFIT': '🏛️',
    'Other': '💳',
};

const FILTERS = ['All', 'Lifestyle', 'Investment', 'Utility', 'Travel', 'Income'];

const fmt = (n) => {
    const abs = Math.abs(n);
    return abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const TransactionsPage = ({ user, onNavigate }) => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [dataSource, setDataSource] = useState('mock'); // 'mock' or 'plaid'
    const [plaidTxs, setPlaidTxs] = useState([]);
    const [plaidLoading, setPlaidLoading] = useState(false);
    const [plaidError, setPlaidError] = useState(null);

    // Fetch Plaid transactions when switching to live mode
    useEffect(() => {
        if (dataSource !== 'plaid') return;
        let cancelled = false;
        const fetchPlaidTxs = async () => {
            try {
                setPlaidLoading(true);
                setPlaidError(null);
                const data = await getTransactions(user?.id || 'potluck-user-1');
                if (!cancelled) {
                    if (!data.linked) {
                        setPlaidError('No bank account linked. Link one from the Dashboard first.');
                        setPlaidTxs([]);
                    } else {
                        setPlaidTxs(data.transactions || []);
                    }
                }
            } catch (err) {
                if (!cancelled) setPlaidError(err.message);
            } finally {
                if (!cancelled) setPlaidLoading(false);
            }
        };
        fetchPlaidTxs();
        return () => { cancelled = true; };
    }, [dataSource]);

    // Group Plaid transactions by date
    const groupPlaidTxs = (txs) => {
        const groups = {};
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        for (const tx of txs) {
            let dateLabel = tx.date;
            if (tx.date === today) dateLabel = 'TODAY';
            else if (tx.date === yesterday) dateLabel = 'YESTERDAY';
            else dateLabel = new Date(tx.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();

            if (!groups[dateLabel]) groups[dateLabel] = [];

            const categoryKey = tx.category || 'Other';
            const icon = CATEGORY_ICONS[categoryKey] || CATEGORY_ICONS.Other;

            // Plaid: positive amount = money out (debit), negative = money in (credit)
            const amount = -tx.amount;

            groups[dateLabel].push({
                icon,
                title: tx.name,
                subtitle: categoryKey.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
                amount,
            });
        }
        return Object.entries(groups).map(([date, items]) => ({ date, items }));
    };

    const transactions = dataSource === 'plaid' ? groupPlaidTxs(plaidTxs) : MOCK_TRANSACTIONS;

    const filtered = transactions.map(group => ({
        ...group,
        items: group.items.filter(item => {
            const matchFilter = activeFilter === 'All' || item.subtitle === activeFilter;
            const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());
            return matchFilter && matchSearch;
        })
    })).filter(group => group.items.length > 0);

    const allItems = transactions.flatMap(g => g.items);
    const totalSpend = allItems.reduce((s, t) => s + (t.amount < 0 ? t.amount : 0), 0);
    const totalIncome = allItems.reduce((s, t) => s + (t.amount > 0 ? t.amount : 0), 0);

    return (
        <div className="savings-app page-transition">
            <div className="app-container">
                {/* Header */}
                <header className="header-nav" style={{ padding: 0, margin: '20px 0 20px' }}>
                    <div className="back-btn" onClick={() => onNavigate('home')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '16px' }}>Activity</div>
                    <div style={{ width: '44px' }}></div>
                </header>

                {/* Data Source Toggle */}
                <div style={{
                    display: 'flex', background: 'rgba(255,255,255,0.03)',
                    borderRadius: 12, padding: 3, marginBottom: 12, gap: 0,
                }}>
                    {[
                        { id: 'mock', label: '📊 Mock Data' },
                        { id: 'plaid', label: '🏦 Live (Plaid)' },
                    ].map(src => (
                        <button key={src.id} onClick={() => setDataSource(src.id)} style={{
                            flex: 1, background: dataSource === src.id ? 'rgba(255,213,79,0.12)' : 'none',
                            border: dataSource === src.id ? '1px solid rgba(255,213,79,0.2)' : '1px solid transparent',
                            borderRadius: 10, padding: '8px 0', cursor: 'pointer',
                            fontSize: 12, fontWeight: 700,
                            color: dataSource === src.id ? '#FFD54F' : 'rgba(255,255,255,0.35)',
                            transition: 'all 0.2s', fontFamily: 'inherit',
                        }}>{src.label}</button>
                    ))}
                </div>

                {/* Plaid Status Messages */}
                {dataSource === 'plaid' && plaidLoading && (
                    <div style={{
                        padding: '14px 16px', background: 'rgba(255,213,79,0.06)',
                        border: '1px solid rgba(255,213,79,0.15)', borderRadius: 12,
                        marginBottom: 12, fontSize: 13, color: '#FFD54F',
                        display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                        <span style={{ animation: 'pulse-ring 1s ease infinite' }}>⏳</span>
                        Fetching live transactions from your bank...
                    </div>
                )}
                {dataSource === 'plaid' && plaidError && (
                    <div style={{
                        padding: '14px 16px', background: 'rgba(239,68,68,0.06)',
                        border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12,
                        marginBottom: 12, fontSize: 13, color: '#EF4444',
                    }}>
                        ⚠️ {plaidError}
                    </div>
                )}

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                    <div style={{
                        background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                        borderRadius: 14, padding: '12px 14px',
                    }}>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Spent</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#EF4444', marginTop: 2 }}>-${fmt(Math.abs(totalSpend))}</div>
                    </div>
                    <div style={{
                        background: 'rgba(129,199,132,0.06)', border: '1px solid rgba(129,199,132,0.15)',
                        borderRadius: 14, padding: '12px 14px',
                    }}>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Income</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#81C784', marginTop: 2 }}>+${fmt(totalIncome)}</div>
                    </div>
                </div>

                {/* Search */}
                <div style={{ marginBottom: 12 }}>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="🔍  Search transactions..."
                        style={{
                            width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 12, padding: '10px 14px', color: '#fff', fontSize: 13,
                            outline: 'none', fontFamily: 'inherit',
                        }} />
                </div>

                {/* Filter Tabs */}
                <div style={{
                    display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 12, scrollbarWidth: 'none', marginBottom: 8,
                }}>
                    {FILTERS.map(f => (
                        <button key={f} onClick={() => setActiveFilter(f)} style={{
                            padding: '7px 14px', borderRadius: 20,
                            border: activeFilter === f ? '1px solid rgba(255,213,79,0.4)' : '1px solid rgba(255,255,255,0.06)',
                            background: activeFilter === f ? 'rgba(255,213,79,0.1)' : 'transparent',
                            color: activeFilter === f ? '#FFD54F' : 'rgba(255,255,255,0.4)',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                            fontFamily: 'inherit',
                        }}>{f}</button>
                    ))}
                </div>

                {/* Transaction Groups */}
                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.2)' }}>
                        <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
                        <div style={{ fontSize: 13 }}>
                            {dataSource === 'plaid' && !plaidLoading ? 'No Plaid transactions yet' : 'No transactions found'}
                        </div>
                    </div>
                ) : (
                    filtered.map((group, gi) => (
                        <div key={gi} style={{ marginBottom: 20 }}>
                            <div style={{
                                fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)',
                                textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, paddingLeft: 2,
                            }}>{group.date}</div>
                            {group.items.map((tx, ti) => (
                                <div key={ti} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 10,
                                            background: 'rgba(255,255,255,0.04)', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center', fontSize: 15,
                                        }}>{tx.icon}</div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{tx.title}</div>
                                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{tx.subtitle}</div>
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: 14, fontWeight: 700,
                                        color: tx.amount >= 0 ? '#81C784' : 'rgba(255,255,255,0.7)',
                                    }}>
                                        {tx.amount >= 0 ? '+' : '-'}${fmt(Math.abs(tx.amount))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TransactionsPage;
