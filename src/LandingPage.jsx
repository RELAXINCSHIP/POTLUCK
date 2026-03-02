import { useState, useEffect } from 'react';
import './LandingPage.css';

const API = 'http://localhost:3001';

const FAQS = [
    {
        q: "Is my money actually safe?",
        a: "Absolutely. Your principal sits in an FDIC-insured partner bank account. You can withdraw 100% of your deposit at any time — no lock-ups, no penalties."
    },
    {
        q: "How are prizes funded?",
        a: "Instead of earning traditional interest, your deposit's yield goes into a shared prize pool. Think of it as swapping a few dollars of interest for a shot at thousands."
    },
    {
        q: "What are my odds of winning?",
        a: "Odds depend on your deposit size and streak multiplier. More deposits = more entries. The longer you stay, the better your odds get with streak multipliers up to 3×."
    },
    {
        q: "How often are prizes awarded?",
        a: "Mini Draws happen monthly with smaller prizes. The Grand Draw happens every 90 days with the big jackpot. You're automatically entered into both."
    },
    {
        q: "Can I withdraw anytime?",
        a: "Yes — your principal is always yours. Withdraw any amount, any time. You'll only lose the entries associated with the withdrawn amount for the current draw period."
    },
];

export default function LandingPage({ onGoToApp }) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState(null); // { type: 'success'|'error', msg }
    const [loading, setLoading] = useState(false);
    const [waitlistCount, setWaitlistCount] = useState(0);
    const [openFaq, setOpenFaq] = useState(null);

    useEffect(() => {
        fetch(`${API}/api/waitlist/count`)
            .then(r => r.json())
            .then(d => setWaitlistCount(d.count || 0))
            .catch(() => { });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        setStatus(null);
        try {
            const res = await fetch(`${API}/api/waitlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.success) {
                setStatus({ type: 'success', msg: data.message });
                setWaitlistCount(data.count);
                if (!data.duplicate) setEmail('');
            } else {
                setStatus({ type: 'error', msg: data.error });
            }
        } catch {
            setStatus({ type: 'error', msg: 'Could not connect. Please try again.' });
        }
        setLoading(false);
    };

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="landing">
            {/* ─── Navbar ─── */}
            <nav className="navbar">
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="nav-logo">🎰 POTLUCK</div>
                    <ul className="nav-links">
                        <li><a href="#how" onClick={(e) => { e.preventDefault(); scrollTo('how'); }}>How It Works</a></li>
                        <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features'); }}>Features</a></li>
                        <li><a href="#faq" onClick={(e) => { e.preventDefault(); scrollTo('faq'); }}>FAQ</a></li>
                    </ul>
                    <button className="nav-cta" onClick={() => scrollTo('join')}>Join the Waitlist</button>
                </div>
            </nav>

            {/* ─── Hero ─── */}
            <section className="hero">
                <div className="hero-glow" />
                <div className="container">
                    <div className="badge hero-badge fade-in">🎉 Prize-Linked Savings</div>
                    <h1 className="fade-in fade-in-delay-1">
                        Save Money.<br />
                        <span className="gradient-text">It's Your Lucky Day.</span>
                    </h1>
                    <p className="hero-sub fade-in fade-in-delay-2">
                        Your money stays safe in an FDIC-insured account. Your interest goes into a prize pool.
                        Someone wins big every 90 days. Why not you?
                    </p>

                    <form className="hero-form fade-in fade-in-delay-3" onSubmit={handleSubmit} id="join">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? 'Joining...' : 'Join the Potluck 🎰'}
                        </button>
                    </form>

                    {status && (
                        <div className={`hero-message ${status.type}`}>{status.msg}</div>
                    )}

                    <div className="hero-social-proof fade-in fade-in-delay-4">
                        <span className="dot" />
                        <span>{waitlistCount > 0 ? `${waitlistCount.toLocaleString()} people on the waitlist` : 'Be the first to join'}</span>
                        <span style={{ margin: '0 4px' }}>·</span>
                        <span>No spam, ever</span>
                    </div>

                    {/* Pot Counter */}
                    <div className="pot-counter fade-in fade-in-delay-4">
                        <div className="counter-item">
                            <div className="counter-value" style={{ color: '#FFD700' }}>$2.4M</div>
                            <div className="counter-label">Prize Pool</div>
                        </div>
                        <div className="counter-divider" />
                        <div className="counter-item">
                            <div className="counter-value" style={{ color: '#9B6FFF' }}>84,201</div>
                            <div className="counter-label">Members</div>
                        </div>
                        <div className="counter-divider" />
                        <div className="counter-item">
                            <div className="counter-value" style={{ color: '#4ECDC4' }}>$0 Lost</div>
                            <div className="counter-label">From Savings</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── How It Works ─── */}
            <section className="how-it-works" id="how">
                <div className="container">
                    <div className="section-label">How It Works</div>
                    <h2 className="section-title">Three steps to winning</h2>
                    <div className="steps-grid">
                        {[
                            {
                                icon: '🏦',
                                title: 'Deposit & Save',
                                desc: 'Put money into your FDIC-insured Potluck account. Withdraw anytime — your principal is always 100% yours.',
                                color: '#9B6FFF',
                                bg: 'rgba(139,92,246,0.12)',
                            },
                            {
                                icon: '💰',
                                title: 'Pool Grows',
                                desc: "Your deposit earns yield that flows into a shared prize pool. The more people save, the bigger the pot gets.",
                                color: '#FFD700',
                                bg: 'rgba(255,215,0,0.12)',
                            },
                            {
                                icon: '🏆',
                                title: 'Win Big',
                                desc: "Every 90 days, one lucky saver wins the Grand Prize. Monthly Mini Draws keep the excitement going.",
                                color: '#4ECDC4',
                                bg: 'rgba(78,205,196,0.12)',
                            },
                        ].map((step, i) => (
                            <div className="step-card" key={i}>
                                <div className="step-number" style={{ background: step.bg, color: step.color }}>
                                    {i + 1}
                                </div>
                                <div className="step-icon">{step.icon}</div>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Features ─── */}
            <section className="features" id="features">
                <div className="container">
                    <div className="section-label">Why Potluck</div>
                    <h2 className="section-title">Saving should feel exciting</h2>
                    <div className="features-grid">
                        {[
                            { icon: '🛡️', title: 'FDIC Insured', desc: 'Your deposits are held in FDIC-insured partner banks. Zero risk to your principal.', bg: 'rgba(139,92,246,0.12)' },
                            { icon: '⚡', title: 'Instant Withdrawals', desc: 'Pull your money out anytime. No lock-ups, no penalties, no questions asked.', bg: 'rgba(78,205,196,0.12)' },
                            { icon: '🔥', title: 'Streak Multipliers', desc: "The longer you stay, the luckier you get. Build streaks up to 3× entries. Consistency wins.", bg: 'rgba(239,68,68,0.12)' },
                            { icon: '👥', title: 'Syndicates', desc: 'Pool entries with friends. Create a syndicate and boost your collective odds — like a lottery group, but better.', bg: 'rgba(245,158,11,0.12)' },
                            { icon: '🎯', title: 'Near-Miss Rewards', desc: "Didn't win? You still get closer. See your ranking after every draw and unlock bonus entries.", bg: 'rgba(255,215,0,0.12)' },
                            { icon: '📱', title: 'Live Draws', desc: 'Watch the draw happen live in the app. Real-time excitement with confetti, animations, and instant results.', bg: 'rgba(139,92,246,0.12)' },
                        ].map((f, i) => (
                            <div className="feature-card" key={i}>
                                <div className="feature-icon" style={{ background: f.bg }}>{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Testimonials ─── */}
            <section className="testimonials">
                <div className="container">
                    <div className="section-label">What People Are Saying</div>
                    <h2 className="section-title">The smarter way to save</h2>
                    <div className="testimonial-grid">
                        {[
                            {
                                quote: "I used to waste $50/month on lottery tickets. Now I save that money AND still get the thrill. It's genius.",
                                name: 'Maria K.',
                                detail: 'Chicago, IL',
                                avatar: '👩‍💼',
                                bg: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                            },
                            {
                                quote: "My savings account was earning 0.01% interest. Potluck turns that boring interest into a chance at life-changing money.",
                                name: 'James T.',
                                detail: '20-draw streak 🔥',
                                avatar: '🧑‍💻',
                                bg: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                            },
                            {
                                quote: "The streak multiplier is addictive — in a good way. I've never been this motivated to NOT touch my savings.",
                                name: 'Priya K.',
                                detail: 'San Francisco, CA',
                                avatar: '👩‍🔬',
                                bg: 'linear-gradient(135deg, #4ECDC4, #06B6D4)',
                            },
                        ].map((t, i) => (
                            <div className="testimonial-card" key={i}>
                                <div className="testimonial-quote">"{t.quote}"</div>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar" style={{ background: t.bg }}>{t.avatar}</div>
                                    <div>
                                        <div className="testimonial-name">{t.name}</div>
                                        <div className="testimonial-detail">{t.detail}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FAQ ─── */}
            <section className="faq" id="faq">
                <div className="container">
                    <div className="section-label">FAQ</div>
                    <h2 className="section-title">Got questions?</h2>
                    <div className="faq-list">
                        {FAQS.map((faq, i) => (
                            <div className="faq-item" key={i}>
                                <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                    {faq.q}
                                    <span className={`faq-chevron ${openFaq === i ? 'open' : ''}`}>▼</span>
                                </button>
                                <div className={`faq-answer ${openFaq === i ? 'open' : ''}`}>
                                    <p>{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Footer CTA ─── */}
            <section className="footer-cta">
                <div className="container">
                    <div className="footer-cta-box">
                        <div className="glow glow-1" />
                        <div className="glow glow-2" />
                        <h2 style={{ position: 'relative' }}>Ready to Join the Potluck? 🎰</h2>
                        <p style={{ position: 'relative' }}>Your money stays safe. But today could be your lucky day.</p>
                        <form className="hero-form" onSubmit={handleSubmit} style={{ position: 'relative' }}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit" disabled={loading}>
                                {loading ? 'Joining...' : "I'm Feeling Lucky ✨"}
                            </button>
                        </form>
                        {status && (
                            <div className={`hero-message ${status.type}`} style={{ position: 'relative' }}>{status.msg}</div>
                        )}
                    </div>
                </div>
            </section>

            {/* ─── Footer ─── */}
            <footer className="footer">
                <div className="container">
                    <p>© 2026 Potluck · Prize-Linked Savings</p>
                    <div className="footer-links">
                        <a href="#" onClick={e => e.preventDefault()}>Privacy</a>
                        <a href="#" onClick={e => e.preventDefault()}>Terms</a>
                        <a href="#" onClick={e => { e.preventDefault(); onGoToApp?.(); }}>App Preview</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
