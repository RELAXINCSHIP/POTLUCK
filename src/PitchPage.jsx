import { useState, useEffect } from 'react';
import './PitchPage.css';

const API = 'http://localhost:3001';

export default function PitchPage({ onBack }) {
    const [waitlistCount, setWaitlistCount] = useState(0);

    useEffect(() => {
        fetch(`${API}/api/waitlist/count`)
            .then(r => r.json())
            .then(d => setWaitlistCount(d.count || 0))
            .catch(() => { });
    }, []);

    return (
        <div className="pitch">
            <div className="page">
                <button className="back-link" onClick={onBack}>← Back to site</button>

                {/* Header */}
                <div className="pitch-header">
                    <div className="pitch-logo">🎰 POTLUCK</div>
                    <div className="pitch-tagline">Prize-Linked Savings</div>
                    <h1 className="pitch-headline">
                        What if saving money felt like <span className="highlight">winning the lottery?</span>
                    </h1>
                </div>

                {/* Problem */}
                <div className="pitch-section">
                    <div className="pitch-section-label">The Problem</div>
                    <h2>Americans don't save — but they love to gamble</h2>
                    <p>
                        56% of Americans can't cover a $1,000 emergency. Yet they spend over $100 billion a year on lottery tickets —
                        money that's gone forever. Traditional savings accounts offer 0.01% APY, making saving feel pointless.
                        People crave excitement, not spreadsheets.
                    </p>
                    <div className="stat-row">
                        <div className="stat-card">
                            <div className="stat-value" style={{ color: '#EF4444' }}>56%</div>
                            <div className="stat-label">Can't cover $1K emergency</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value" style={{ color: '#FFD700' }}>$100B</div>
                            <div className="stat-label">Spent on lottery / year</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value" style={{ color: '#9B6FFF' }}>0.01%</div>
                            <div className="stat-label">Avg savings APY</div>
                        </div>
                    </div>
                </div>

                {/* Solution */}
                <div className="pitch-section">
                    <div className="pitch-section-label">The Solution</div>
                    <h2>Potluck: Save money. Win prizes. Lose nothing.</h2>
                    <p>
                        Potluck is a prize-linked savings platform. Users deposit money into FDIC-insured accounts.
                        Instead of earning traditional interest, their yield goes into a shared prize pool.
                        Every 90 days, someone wins big. Your principal? Always 100% safe and withdrawable.
                    </p>
                </div>

                {/* How It Works */}
                <div className="pitch-section">
                    <div className="pitch-section-label">How It Works</div>
                    <h2>Simple mechanics, powerful behavior change</h2>
                    <div className="flow-steps">
                        <div className="flow-step">
                            <div className="step-emoji">🏦</div>
                            <div className="step-title">Deposit</div>
                            <div className="step-desc">FDIC-insured savings</div>
                        </div>
                        <div className="flow-arrow">→</div>
                        <div className="flow-step">
                            <div className="step-emoji">📈</div>
                            <div className="step-title">Yield → Pool</div>
                            <div className="step-desc">Interest funds prizes</div>
                        </div>
                        <div className="flow-arrow">→</div>
                        <div className="flow-step">
                            <div className="step-emoji">🎰</div>
                            <div className="step-title">Draw</div>
                            <div className="step-desc">Quarterly + monthly</div>
                        </div>
                        <div className="flow-arrow">→</div>
                        <div className="flow-step">
                            <div className="step-emoji">🏆</div>
                            <div className="step-title">Win</div>
                            <div className="step-desc">Life-changing prizes</div>
                        </div>
                    </div>
                    <p style={{ marginTop: 16 }}>
                        <strong>Streak Multipliers</strong> reward long-term saving — the more consecutive draws you stay in,
                        the more entries you earn (up to 3×). <strong>Syndicates</strong> let friends pool entries together.
                        <strong> Near-miss feedback</strong> keeps engagement high even for non-winners.
                    </p>
                </div>

                {/* Market */}
                <div className="pitch-section">
                    <div className="pitch-section-label">Market Opportunity</div>
                    <h2>A $200B+ intersection</h2>
                    <p>
                        Prize-linked savings sits at the crossroads of the $17.5T US savings market
                        and the $100B+ lottery industry. We're unlocking value where they overlap.
                    </p>
                    <div className="market-bars">
                        <div className="market-bar">
                            <div className="market-bar-label">TAM</div>
                            <div className="market-bar-track">
                                <div className="market-bar-fill" style={{ width: '100%', background: 'linear-gradient(90deg, #7C3AED, #A855F7)' }}>$200B+</div>
                            </div>
                        </div>
                        <div className="market-bar">
                            <div className="market-bar-label">SAM</div>
                            <div className="market-bar-track">
                                <div className="market-bar-fill" style={{ width: '55%', background: 'linear-gradient(90deg, #F59E0B, #FFD700)' }}>$32B</div>
                            </div>
                        </div>
                        <div className="market-bar">
                            <div className="market-bar-label">SOM</div>
                            <div className="market-bar-track">
                                <div className="market-bar-fill" style={{ width: '20%', background: 'linear-gradient(90deg, #4ECDC4, #06B6D4)' }}>$500M</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Business Model */}
                <div className="pitch-section">
                    <div className="pitch-section-label">Business Model</div>
                    <h2>Multiple revenue streams from day one</h2>
                    <div className="revenue-grid">
                        <div className="revenue-card">
                            <h4>💹 Yield Spread</h4>
                            <p>Keep a portion of the interest generated on deposits. At scale, even a small spread generates significant recurring revenue.</p>
                        </div>
                        <div className="revenue-card">
                            <h4>⭐ Premium Tiers</h4>
                            <p>Offer Potluck Gold / Platinum tiers with higher multipliers, exclusive draws, and priority features for a monthly subscription.</p>
                        </div>
                        <div className="revenue-card">
                            <h4>🤝 Partner Prizes</h4>
                            <p>Brands sponsor prize pools in exchange for exposure. Sponsored draws become an ad channel that users actually enjoy.</p>
                        </div>
                        <div className="revenue-card">
                            <h4>📊 Financial Products</h4>
                            <p>Cross-sell savings products, credit cards, and insurance to an engaged user base with demonstrated savings behavior.</p>
                        </div>
                    </div>
                </div>

                {/* Traction */}
                <div className="pitch-section">
                    <div className="pitch-section-label">Early Traction</div>
                    <h2>Momentum is building</h2>
                    <div className="traction-row">
                        <div className="traction-item">
                            <div className="traction-value" style={{ color: '#9B6FFF' }}>{waitlistCount > 0 ? waitlistCount.toLocaleString() : '—'}</div>
                            <div className="traction-label">Waitlist</div>
                        </div>
                        <div className="traction-item">
                            <div className="traction-value" style={{ color: '#FFD700' }}>MVP</div>
                            <div className="traction-label">Product Stage</div>
                        </div>
                        <div className="traction-item">
                            <div className="traction-value" style={{ color: '#4ECDC4' }}>92%</div>
                            <div className="traction-label">Concept Appeal*</div>
                        </div>
                        <div className="traction-item">
                            <div className="traction-value" style={{ color: '#F59E0B' }}>Q2 2026</div>
                            <div className="traction-label">Target Launch</div>
                        </div>
                    </div>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 8 }}>
                        * Based on initial user research and concept testing surveys
                    </p>
                </div>

                {/* The Ask */}
                <div className="ask-box">
                    <div className="pitch-section-label">The Ask</div>
                    <h2>Seed Round</h2>
                    <div className="ask-amount">$2.5M</div>
                    <p>
                        To build out banking partnerships, obtain necessary licenses,
                        scale the engineering team, and acquire our first 50,000 users.
                    </p>
                </div>

                {/* Footer */}
                <div className="pitch-footer">
                    <p>
                        Potluck · Prize-Linked Savings · 2026<br />
                        <a href="mailto:hello@potluck.app">hello@potluck.app</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
