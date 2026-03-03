import React from 'react';
import '../SavingsStyles.css';
import { GlassPanel } from './Common';

export const AssetCard = ({ icon, label, value, bgImage, onClick }) => (
    <GlassPanel className="asset-card" onClick={onClick}>
        <div className="asset-bg" style={{ backgroundImage: `url(${bgImage})` }}></div>
        <div className="asset-gradient"></div>
        <div className="asset-content">
            <div className="asset-icon">{icon}</div>
        </div>
        <div className="asset-info">
            <div className="asset-label">{label}</div>
            <div className="asset-value">{value}</div>
        </div>
    </GlassPanel>
);

export const GoalCard = ({ title, description, bgImage, onClick }) => (
    <GlassPanel className="focus-card" onClick={onClick}>
        <img src={bgImage} alt={title} className="focus-bg" />
        <div className="focus-overlay">
            <div className="focus-text" style={{ color: 'white' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>{title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '200px', lineHeight: '1.4' }}>
                    {description}
                </p>
            </div>
            <div className="focus-action">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </div>
        </div>
    </GlassPanel>
);

export const TransactionItem = ({ icon, title, subtitle, amount, status, isPositive }) => (
    <div className="tx-item">
        <div className="tx-left">
            <div className={`tx-icon ${isPositive ? 'text-green' : ''}`}>{icon}</div>
            <div className="tx-details">
                <h4>{title}</h4>
                <span>{subtitle}</span>
            </div>
        </div>
        <div className="tx-amount">
            <div className={isPositive ? 'text-green' : ''}>{amount}</div>
            <div className="tx-status">{status}</div>
        </div>
    </div>
);
