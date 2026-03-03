import React, { useState, useEffect } from 'react';
import '../SavingsStyles.css';
import { addAsset } from '../../api';

const ASSET_TYPES = [
    { id: 'crypto', label: 'Crypto', icon: '₿' },
    { id: 'real_estate', label: 'Real Estate', icon: '🏠' },
    { id: 'vehicle', label: 'Vehicle', icon: '🏎️' },
    { id: 'watch', label: 'Watch', icon: '⌚' },
    { id: 'art', label: 'Fine Art', icon: '🎨' },
    { id: 'other', label: 'Other', icon: '💎' },
];

const PREDEFINED_ASSETS = {
    crypto: [
        { name: 'Bitcoin (BTC)', icon: '₿', bg_image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=500&auto=format&fit=crop' },
        { name: 'Ethereum (ETH)', icon: 'Ξ', bg_image: 'https://images.unsplash.com/photo-1622630998477-20b41cd74312?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { name: 'Solana (SOL)', icon: '◎', bg_image: 'https://images.unsplash.com/photo-1641580529558-a96cf1ee51ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
    ],
    real_estate: [
        { name: 'Primary Residence', icon: '🏠', bg_image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { name: 'Rental Property', icon: '🏙️', bg_image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { name: 'Vacation Home', icon: '🏝️', bg_image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
    ],
    vehicle: [
        { name: 'Sports Car', icon: '🏎️', bg_image: 'https://images.unsplash.com/photo-1503376712351-1c43aa4dbb69?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { name: 'Luxury SUV', icon: '🚘', bg_image: 'https://images.unsplash.com/photo-1631269300649-e592cf17c767?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { name: 'Yacht / Boat', icon: '🛥️', bg_image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
    ],
    watch: [
        { name: 'Rolex', icon: '⌚', bg_image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { name: 'Patek Philippe', icon: '🕰️', bg_image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { name: 'Audemars Piguet', icon: '💎', bg_image: 'https://images.unsplash.com/photo-1587836374828-cb438786100f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
    ],
    art: [
        { name: 'Fine Art Piece', icon: '🖼️', bg_image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
        { name: 'NFT Collection', icon: '👾', bg_image: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
    ],
    other: [
        { name: 'Custom Asset', icon: '💎', bg_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500&auto=format&fit=crop' }
    ]
};

export const AssetModal = ({ isOpen, onClose, onAssetAdded }) => {
    const [selectedType, setSelectedType] = useState('crypto');
    const [selectedAsset, setSelectedAsset] = useState(PREDEFINED_ASSETS['crypto'][0].name);
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Update selected asset when type changes
    useEffect(() => {
        setSelectedAsset(PREDEFINED_ASSETS[selectedType][0].name);
    }, [selectedType]);

    // Reset when opened
    useEffect(() => {
        if (isOpen) {
            setSelectedType('crypto');
            setValue('');
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) {
            setError("Please enter a valid amount (can be 0).");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const assetDetails = PREDEFINED_ASSETS[selectedType].find(a => a.name === selectedAsset) || PREDEFINED_ASSETS['other'][0];
            const newAsset = await addAsset({
                type: selectedType,
                name: selectedAsset,
                value: numValue,
                currency: 'USD',
                icon: assetDetails.icon,
                bg_image: assetDetails.bg_image
            });
            if (onAssetAdded) onAssetAdded(newAsset);
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{ display: 'flex', zIndex: 999 }} onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="modal-handle" onClick={onClose}></div>

                <div className="modal-header">
                    <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>Add Asset</h2>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>Track exactly what you own. Update values anytime over time.</p>
                </div>

                <div className="input-group" style={{ marginBottom: 20 }}>
                    <label className="input-label" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8, display: 'block', fontWeight: 600 }}>1. Select Category</label>
                    <div className="category-grid" style={{
                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10
                    }}>
                        {ASSET_TYPES.map(type => (
                            <div key={type.id} onClick={() => setSelectedType(type.id)}
                                style={{
                                    border: selectedType === type.id ? '1px solid #FFD54F' : '1px solid rgba(255,255,255,0.1)',
                                    background: selectedType === type.id ? 'rgba(255,213,79,0.1)' : 'rgba(255,255,255,0.03)',
                                    borderRadius: 12, padding: '12px 0', textAlign: 'center', cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}>
                                <div style={{ fontSize: 24, marginBottom: 4 }}>{type.icon}</div>
                                <span style={{ fontSize: 12, fontWeight: 600, color: selectedType === type.id ? '#FFD54F' : '#fff' }}>{type.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="input-group" style={{ marginBottom: 20 }}>
                    <label className="input-label" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8, display: 'block', fontWeight: 600 }}>2. Select specific asset</label>
                    <select value={selectedAsset} onChange={e => setSelectedAsset(e.target.value)} style={{
                        width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 15,
                        outline: 'none', appearance: 'none', fontFamily: 'inherit'
                    }}>
                        {PREDEFINED_ASSETS[selectedType]?.map(asset => (
                            <option key={asset.name} value={asset.name} style={{ background: '#111' }}>{asset.icon} {asset.name}</option>
                        ))}
                    </select>
                </div>

                <div className="input-group" style={{ marginBottom: 24 }}>
                    <label className="input-label" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8, display: 'block', fontWeight: 600 }}>3. Estimated Value</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <span style={{ position: 'absolute', left: 16, fontSize: 20, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>$</span>
                        <input type="number" placeholder="0.00" value={value} onChange={e => setValue(e.target.value)}
                            style={{
                                width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,213,79,0.3)',
                                borderRadius: 12, padding: '14px 16px 14px 40px', color: '#fff', fontSize: 20, fontWeight: 700,
                                outline: 'none', fontFamily: 'inherit'
                            }} />
                    </div>
                </div>

                {error && <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{error}</div>}

                <button onClick={handleSave} disabled={loading} style={{
                    width: '100%', background: 'linear-gradient(135deg, #FFD54F, #FFB300)', border: 'none',
                    borderRadius: 14, padding: 18, fontSize: 16, fontWeight: 700, color: '#000', cursor: 'pointer',
                    opacity: loading ? 0.7 : 1, boxShadow: '0 4px 20px rgba(255,213,79,0.3)'
                }}>
                    {loading ? 'Adding...' : 'Add to Portfolio'}
                </button>
            </div>
        </div>
    );
};
