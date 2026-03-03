import React, { useState, useMemo } from 'react';
import './SavingsStyles.css';
import { formatCurrency } from '../App';

const CATEGORIES = [
    { id: 'all', label: 'All', icon: '💎' },
    { id: 'crypto', label: 'Crypto', icon: '₿' },
    { id: 'stock', label: 'Stocks', icon: '📈' },
    { id: 'cash', label: 'Cash', icon: '🏦' },
    { id: 'credit', label: 'Credit', icon: '💳' },
    { id: 'savings', label: 'Goals', icon: '✈️' },
    { id: 'other', label: 'Other', icon: '✨' },
];

const AssetsPage = ({ onNavigate, assets = [] }) => {
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('value_desc');
    const [search, setSearch] = useState('');

    const filteredAssets = useMemo(() => {
        let list = [...assets];

        // Search
        if (search) {
            list = list.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
        }

        // Filter
        if (filter !== 'all') {
            list = list.filter(a => a.category === filter);
        }

        // Sort
        list.sort((a, b) => {
            if (sort === 'value_desc') return b.value - a.value;
            if (sort === 'value_asc') return a.value - b.value;
            if (sort === 'name') return a.name.localeCompare(b.name);
            return 0;
        });

        return list;
    }, [assets, filter, sort, search]);

    const stats = useMemo(() => {
        const total = filteredAssets.reduce((s, a) => s + (a.value || 0), 0);
        return { total };
    }, [filteredAssets]);

    return (
        <div className="savings-app page-transition">
            <div className="app-container" style={{ paddingBottom: 120 }}>
                {/* Search & Header */}
                <div style={{ marginBottom: 24, marginTop: 20 }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search assets..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 16,
                                padding: '14px 14px 14px 44px',
                                color: '#fff',
                                fontSize: 14,
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                        />
                        <svg
                            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}
                            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
                        >
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                </div>

                {/* Filters */}
                <div style={{
                    display: 'flex',
                    gap: 10,
                    overflowX: 'auto',
                    paddingBottom: 20,
                    scrollbarWidth: 'none',
                    marginRight: -20,
                    paddingRight: 20
                }}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setFilter(cat.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '10px 18px',
                                borderRadius: 100,
                                border: '1px solid',
                                borderColor: filter === cat.id ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)',
                                background: filter === cat.id ? 'rgba(255,213,79,0.1)' : 'rgba(255,255,255,0.03)',
                                color: filter === cat.id ? 'var(--accent-gold)' : 'rgba(255,255,255,0.5)',
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span>{cat.icon}</span> {cat.label}
                        </button>
                    ))}
                </div>

                {/* Sorting & Stats */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                        {filteredAssets.length} Assets · <span style={{ color: '#fff' }}>{formatCurrency(stats.total)}</span>
                    </div>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--accent-gold)',
                            fontSize: 13,
                            fontWeight: 700,
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="value_desc" style={{ background: '#111' }}>Highest Value</option>
                        <option value="value_asc" style={{ background: '#111' }}>Lowest Value</option>
                        <option value="name" style={{ background: '#111' }}>A-Z</option>
                    </select>
                </div>

                {/* Asset List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filteredAssets.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.2)' }}>
                            No assets found matching your criteria.
                        </div>
                    ) : (
                        filteredAssets.map(asset => (
                            <div
                                key={asset.id}
                                onClick={() => onNavigate('asset', asset)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: 16,
                                    borderRadius: 20,
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, background 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                    e.currentTarget.style.transform = 'scale(1.01)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 14,
                                        background: 'rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 22
                                    }}>
                                        {asset.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{asset.name}</div>
                                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'capitalize', marginTop: 2 }}>
                                            {asset.type?.replace('_', ' ')}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: asset.category === 'credit' ? '#EF4444' : '#fff' }}>
                                        {formatCurrency(asset.value)}
                                    </div>
                                    {asset.change !== 0 && (
                                        <div style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: asset.change > 0 ? '#81C784' : '#EF4444',
                                            marginTop: 2
                                        }}>
                                            {asset.change > 0 ? '↑' : '↓'} {Math.abs(asset.change)}%
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssetsPage;
