import { useState, useEffect, useRef } from "react";
import * as api from "./api";
import { publicClient, getWalletClient, CONTRACTS, ABIs } from "./web3/client";
import { parseUnits, formatUnits } from "viem";

// Savings Components
import SavingsHome from "./savings/SavingsHome";
import AssetDetails from "./savings/AssetDetails";
import AssetsPage from "./savings/AssetsPage";
import GoalDetails from "./savings/GoalDetails";
import SettingsPage from "./savings/SettingsPage";
import TransactionsPage from "./savings/TransactionsPage";

import { getAccounts } from "./plaid/plaidApi";

let globalCurrency = "USD";
let globalRate = 1.0;
const SYMBOLS = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'C$', AUD: 'A$' };

export const setGlobalCurrency = (code, rate) => {
    globalCurrency = code || "USD";
    globalRate = rate || 1.0;
};

const INITIAL_ASSETS = [
    { id: 1, icon: "₿", name: "Cold Storage (10 BTC)", value: 850000.00, change: +0.0, bg_image: "https://images.unsplash.com/photo-1549488497-236b28292d8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", type: "crypto" },
    { id: 2, icon: "✈️", name: "Travel Fund", value: 22375.00, change: +0.8, bg_image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", type: "savings" },
    { id: 3, icon: "🛍️", name: "Luxury Card", value: 41109.30, change: -1.2, bg_image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", type: "credit" },
    { id: 4, icon: "📈", name: "S&P 500 Index", value: 58487.40, change: +0.0, bg_image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", type: "stock" },
];

export const formatCurrency = (n) => {
    const val = Number(n) * globalRate;
    const exact = val % 1 !== 0;
    return (SYMBOLS[globalCurrency] || '$') + val.toLocaleString('en-US', {
        minimumFractionDigits: exact ? 2 : 0,
        maximumFractionDigits: 2
    });
};
const formatTime = (s) => {
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};

/* =============================================
   AUTH SCREEN
============================================= */
function AuthScreen({ onAuth }) {
    const [mode, setMode] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setError("");
        setLoading(true);
        try {
            let data;
            if (mode === "register") {
                data = await api.register(email, password, name, city);
            } else {
                data = await api.login(email, password);
            }
            onAuth(data.user);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "40px 28px", overflow: "auto" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{
                    width: 72, height: 72, borderRadius: "50%", margin: "0 auto 16px",
                    background: "linear-gradient(135deg, #FFD54F, #FFB300)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 0 40px rgba(255,213,79,0.5)",
                }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 2a3 3 0 0 0-3 3v2.83a8.9 8.9 0 0 0-2 1.17H3.17A3 3 0 0 0 2 11c0 1.66 1.34 3 3 3h4.62c.08.7.25 1.38.5 2.03v2.8c0 1.66 1.34 3 3 3 1.66 0 3-1.34 3-3v-2.8a8.9 8.9 0 0 0 2-1.17L20.83 15A3 3 0 0 0 22 12c0-1.66-1.34-3-3-3h-4.62a8.9 8.9 0 0 0-.5-2.03v-2.8A3 3 0 0 0 11 2z" />
                        <path d="M12 12v10M12 12l8.66-5M12 12L3.34 7" />
                    </svg>
                </div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#fff" }}>POTLUCK</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                    {mode === "login" ? "Welcome back to the pot" : "Join the pot today"}
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                {mode === "register" && (
                    <>
                        <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
                            style={inputStyle} />
                        <input placeholder="City (optional)" value={city} onChange={e => setCity(e.target.value)}
                            style={inputStyle} />
                    </>
                )}
                <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                    style={inputStyle} />
                <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                    style={inputStyle} onKeyDown={e => e.key === "Enter" && handleSubmit()} />

                {error && (
                    <div style={{ color: "#EF4444", fontSize: 13, textAlign: "center", padding: "8px 12px", background: "rgba(239,68,68,0.1)", borderRadius: 10 }}>
                        {error}
                    </div>
                )}

                <button className="btn-glow" onClick={handleSubmit} disabled={loading} style={{
                    padding: "18px", borderRadius: 18, border: "none",
                    background: "linear-gradient(135deg, #FFD54F, #FFB300)",
                    color: "#000", fontSize: 16, fontWeight: 700,
                    boxShadow: "0 8px 30px rgba(255,213,79,0.4)",
                    opacity: loading ? 0.7 : 1,
                    marginTop: 8,
                }}>{loading ? "..." : mode === "login" ? "Log In" : "Create Account"}</button>

                <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} style={{
                    background: "none", border: "none", color: "#FFD54F", fontSize: 14,
                    cursor: "pointer", marginTop: 8, textAlign: "center",
                }}>
                    {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                </button>
            </div>
        </div>
    );
}

const inputStyle = {
    padding: "16px", borderRadius: 14, border: "1px solid rgba(255,213,79,0.2)",
    background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 15,
    outline: "none", fontFamily: "'DM Sans', sans-serif",
};

/* =============================================
   NOTIFICATION BELL (top-right corner)
============================================= */
function NotifBell({ count = 3, onClick }) {
    return (
        <div onClick={onClick} style={{
            position: "relative", width: 40, height: 40, borderRadius: "50%",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {count > 0 && (
                <div style={{
                    position: "absolute", top: 2, right: 2, width: 16, height: 16,
                    borderRadius: "50%", background: "#EF4444", fontSize: 9, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "2px solid #080808", color: "#fff",
                }}>{count}</div>
            )}
        </div>
    );
}

function GlobalHeader({ onNotifClick }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 8px", flexShrink: 0, zIndex: 10 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "#FFD54F", letterSpacing: -0.5 }}>POTLUCK</div>
            <NotifBell onClick={onNotifClick} />
        </div>
    );
}

/* =============================================
   BOTTOM NAV — Unified 5-Tab
============================================= */
function BottomNav({ screen, go }) {
    const tabs = [
        {
            id: "home", label: "Pot", icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
            )
        },
        {
            id: "savings", label: "Money", icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
            )
        },
        {
            id: "rewards", label: "Rewards", icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="7"></circle>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                </svg>
            )
        },
        {
            id: "community", label: "Community", icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
            )
        },
        {
            id: "profile", label: "Profile", icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            )
        },
    ];

    return (
        <div style={{
            display: "flex", background: "rgba(15,15,15,0.95)",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            padding: "8px 8px 28px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0,
        }}>
            {tabs.map(t => {
                const active = screen === t.id;
                return (
                    <button key={t.id} className="tab-btn" onClick={() => go(t.id)} style={{
                        flex: 1, background: "none", border: "none", padding: "6px 0",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                        color: active ? "#FFD54F" : "rgba(255,255,255,0.3)",
                        position: "relative",
                    }}>
                        {t.icon}
                        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: 0.5 }}>{t.label}</span>
                        {active && <div style={{
                            position: "absolute", bottom: 0, width: 4, height: 4,
                            borderRadius: "50%", background: "#FFD54F",
                            boxShadow: "0 0 8px #FFD54F",
                        }} />}
                    </button>
                );
            })}
        </div>
    );
}


/* =============================================
   HOME SCREEN (Live Data)
============================================= */
function HomeScreen({ go, startDraw, user, draws, streak, onNotifClick }) {
    const grandDraw = draws?.find(d => d.type === "grand") || {};
    const miniDraw = draws?.find(d => d.type === "mini") || {};
    const [countdown, setCountdown] = useState(grandDraw.countdown_seconds || 0);

    useEffect(() => {
        setCountdown(grandDraw.countdown_seconds || 0);
        const interval = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
        return () => clearInterval(interval);
    }, [grandDraw.countdown_seconds]);

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
            {/* Ticker */}
            <div style={{ background: "rgba(255,213,79,0.1)", padding: "8px 0", overflow: "hidden", borderBottom: "1px solid rgba(255,213,79,0.2)", flexShrink: 0 }}>
                <div style={{ animation: "ticker 12s linear infinite", whiteSpace: "nowrap", fontSize: 12, color: "#FFD54F", fontWeight: 600 }}>
                    &nbsp;&nbsp;&nbsp;🏆 Welcome {user?.name}! · 💰 Grand Pot: {formatCurrency(grandDraw.prize_pool || 0)} · 🔥 Your streak: {streak?.current_streak || 0} draws · ⚡ {grandDraw.member_count || 0} members in the pot &nbsp;&nbsp;&nbsp;
                </div>
            </div>

            <div style={{ padding: "20px 20px 0", flex: 1, overflow: "auto" }}>
                {/* Grand pot card */}
                <div style={{
                    background: "linear-gradient(135deg, rgba(255,213,79,0.08), rgba(30,30,30,0.6))",
                    borderRadius: 24, padding: 24, marginBottom: 16,
                    border: "1px solid rgba(255,213,79,0.3)",
                    position: "relative", overflow: "hidden",
                }}>
                    <div style={{
                        position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(255,213,79,0.15), transparent)",
                    }} />
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Grand Pot 🏆</div>
                    <div style={{ fontSize: 42, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{formatCurrency(grandDraw.prize_pool || 0)}</div>
                    <div style={{ fontSize: 12, color: "#81C784", marginTop: 4, fontWeight: 600 }}>{grandDraw.member_count || 0} members</div>
                    <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(0,0,0,0.3)", borderRadius: 12 }}>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Draw in</div>
                        <div style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#FFD700" }}>
                            {formatTime(countdown)}
                        </div>
                    </div>
                </div>

                {/* Your stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                    {[
                        { label: "Your Entries", value: (user?.total_entries || 0).toLocaleString(), color: "#FFD54F" },
                        { label: "Streak 🔥", value: `${streak?.current_streak || 0} draws`, color: "#EF4444" },
                        { label: "Your Odds", value: grandDraw.user_odds || "N/A", color: "#F59E0B" },
                        { label: "Deposited", value: formatCurrency(user?.balance || 0), color: "#81C784" },
                    ].map((s, i) => (
                        <div key={i} style={{
                            background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 14,
                            border: `1px solid ${s.color}22`,
                        }}>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{s.label}</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Quick actions */}
                <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                    <button className="btn-glow" onClick={startDraw} style={{
                        flex: 1, padding: "14px", borderRadius: 16, border: "none",
                        background: "linear-gradient(135deg, #FFD54F, #FFB300)",
                        color: "#000", fontSize: 14, fontWeight: 700,
                        boxShadow: "0 4px 20px rgba(255,213,79,0.4)",
                    }}>Watch Live Draw ▶</button>
                    <button className="btn-glow" onClick={() => go("community")} style={{
                        padding: "14px 16px", borderRadius: 16, border: "none",
                        background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", fontSize: 14,
                    }}>👥</button>
                    <button className="btn-glow" onClick={() => go("profile")} style={{
                        padding: "14px 16px", borderRadius: 16, border: "none",
                        background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", fontSize: 14,
                    }}>👤</button>
                </div>

                {/* Mini draw */}
                {miniDraw.id && (
                    <div style={{
                        background: "linear-gradient(135deg, rgba(129,199,132,0.08), rgba(30,30,30,0.6))",
                        borderRadius: 18, padding: 16, marginBottom: 16,
                        border: "1px solid rgba(129,199,132,0.3)",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                        <div>
                            <div style={{ fontSize: 12, color: "#81C784", fontWeight: 700, marginBottom: 2 }}>Mini Draw · {Math.ceil((miniDraw.countdown_seconds || 0) / 86400)} days</div>
                            <div style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff" }}>{formatCurrency(miniDraw.prize_pool || 0)}</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>You have {miniDraw.user_entries || 0} entries</div>
                        </div>
                        <div style={{ fontSize: 32 }}>🎯</div>
                    </div>
                )}
            </div>

            <BottomNav screen="home" go={go} />
        </div>
    );
}

/* =============================================
   DEPOSIT SCREEN (live)
============================================= */
function DepositScreen({ go, onDeposit }) {
    const [deposit, setDeposit] = useState(200);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState("");

    // Fiat/Plaid Additions
    const [method, setMethod] = useState("crypto"); // "crypto" or "fiat"
    const [bankLinked, setBankLinked] = useState(false);
    const [showPlaid, setShowPlaid] = useState(false);
    const [plaidStep, setPlaidStep] = useState(0);
    const [selectedBank, setSelectedBank] = useState(null);

    const handleCryptoDeposit = async () => {
        setLoading(true);
        setError("");
        try {
            const walletClient = await getWalletClient();
            const [account] = await walletClient.getAddresses();

            const depositAmountUnits = parseUnits(deposit.toString(), 6);

            // 1. Approve USDC
            setStep("Approving USDC...");
            const { request: approveReq } = await publicClient.simulateContract({
                address: CONTRACTS.USDC,
                abi: ABIs.USDC,
                functionName: 'approve',
                args: [CONTRACTS.VAULT, depositAmountUnits],
                account
            });
            const approveTx = await walletClient.writeContract(approveReq);
            await publicClient.waitForTransactionReceipt({ hash: approveTx });

            // 2. Deposit into Vault
            setStep("Depositing to Vault...");
            const { request: depositReq } = await publicClient.simulateContract({
                address: CONTRACTS.VAULT,
                abi: ABIs.VAULT,
                functionName: 'deposit',
                args: [depositAmountUnits, account],
                account
            });
            const depositTx = await walletClient.writeContract(depositReq);
            await publicClient.waitForTransactionReceipt({ hash: depositTx });

            // 3. Update traditional DB for UI stats 
            setStep("Updating Profile...");
            await api.makeDeposit(deposit);

            setResult({ message: `Successfully deposited $${deposit} into the vault!` });
            setTimeout(() => { onDeposit(); go("home"); }, 2000);
        } catch (err) {
            console.error(err);
            setResult({ error: err.message || "Transaction failed" });
        }
        setLoading(false);
        setStep("");
    };

    const handleFiatDeposit = async () => {
        setLoading(true);
        setError("");
        setStep("Initiating ACH transfer...");
        try {
            await new Promise(r => setTimeout(r, 1500));
            setStep("Clearing funds...");
            await new Promise(r => setTimeout(r, 1500));
            setStep("Updating Profile...");
            await api.makeDeposit(deposit);
            setResult({ message: `Successfully deposited $${deposit} via Bank Transfer!` });
            setTimeout(() => { onDeposit(); go("home"); }, 2000);
        } catch (err) {
            setResult({ error: err.message || "Transfer failed" });
        }
        setLoading(false);
        setStep("");
    };

    const handleActionClick = () => {
        if (method === "crypto") {
            handleCryptoDeposit();
        } else {
            if (!bankLinked) {
                setShowPlaid(true);
                setPlaidStep(0);
            } else {
                handleFiatDeposit();
            }
        }
    };

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 28px 40px", overflow: "auto", position: "relative" }}>
            {/* Guarantee Skip visibility with absolute pos */}
            {!loading && (
                <button onClick={() => go("home")} style={{
                    position: "absolute", top: 20, right: 24, zIndex: 100,
                    background: "#FFB300", border: "none", color: "#000",
                    fontSize: 12, fontWeight: 800, cursor: "pointer", padding: "8px 16px", borderRadius: 12,
                    boxShadow: "0 4px 15px rgba(255,179,0,0.4)"
                }}>
                    SKIP
                </button>
            )}

            <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 26, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff" }}>Add to the pot</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Your principal is always yours to take back.</div>
            </div>

            {/* Method Toggle */}
            <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 6, marginBottom: 20 }}>
                {["crypto", "fiat"].map(m => (
                    <button key={m} onClick={() => setMethod(m)} style={{
                        flex: 1, padding: "10px", borderRadius: 12, border: "none", cursor: "pointer",
                        background: method === m ? "rgba(255,213,79,0.3)" : "transparent",
                        color: method === m ? "#fff" : "rgba(255,255,255,0.5)",
                        fontWeight: 700, fontSize: 13, textTransform: "capitalize"
                    }}>
                        {m === "crypto" ? "💰 USDC Crypto" : "🏦 Bank (Fiat)"}
                    </button>
                ))}
            </div>

            <div style={{
                background: "linear-gradient(135deg, rgba(30,30,30,0.6), rgba(255,213,79,0.06))",
                borderRadius: 24, padding: 24, marginBottom: 20,
                border: "1px solid rgba(255,213,79,0.2)",
            }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Your deposit</div>
                <div style={{ fontSize: 56, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff", textAlign: "center" }}>${deposit}</div>
                <input type="range" min={25} max={2000} step={25} value={deposit}
                    onChange={e => setDeposit(Number(e.target.value))}
                    style={{ width: "100%", marginTop: 16, accentColor: "#FFD54F" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                    <span>$25</span><span>$2,000</span>
                </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {[50, 100, 250, 500].map(v => (
                    <button key={v} onClick={() => setDeposit(v)} style={{
                        flex: 1, padding: "10px 0", borderRadius: 12, border: `1px solid ${deposit === v ? "rgba(255,213,79,0.5)" : "transparent"}`, cursor: "pointer", fontSize: 13, fontWeight: 700,
                        background: deposit === v ? "rgba(255,213,79,0.3)" : "rgba(255,255,255,0.06)",
                        color: deposit === v ? "#FFD54F" : "rgba(255,255,255,0.4)",
                    }}>${v}</button>
                ))}
            </div>

            {method === "fiat" && bankLinked && (
                <div style={{ background: "rgba(129,199,132,0.1)", borderRadius: 16, padding: 14, marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ background: "#059669", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏦</div>
                    <div>
                        <div style={{ fontSize: 13, color: "#81C784", fontWeight: 700 }}>Chase Checking</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Account ending in •••• 4209</div>
                    </div>
                </div>
            )}

            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 16, marginBottom: 20 }}>
                {[
                    { label: "Your entries this draw", value: `${Math.floor(deposit / 10)} tickets` },
                    { label: "Your odds (approx.)", value: `1 in ${Math.max(1, Math.floor((grandDraw?.member_count || 100) / Math.max(1, deposit / 10))).toLocaleString()}` },
                ].map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{r.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#FFD54F" }}>{r.value}</span>
                    </div>
                ))}
            </div>

            {result && !result.error && (
                <div style={{ background: "rgba(129,199,132,0.1)", border: "1px solid rgba(129,199,132,0.3)", borderRadius: 14, padding: 14, marginBottom: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#81C784" }}>✅ {result.message}</div>
                </div>
            )}
            {result?.error && (
                <div style={{ background: "rgba(239,68,68,0.1)", borderRadius: 14, padding: 14, marginBottom: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 14, color: "#EF4444" }}>{result.error}</div>
                </div>
            )}

            <button className="btn-glow" onClick={handleActionClick} disabled={loading} style={{
                padding: "18px", borderRadius: 18, border: "none",
                background: "linear-gradient(135deg, #FFD54F, #FFB300)",
                color: "#000", fontSize: 16, fontWeight: 700,
                boxShadow: "0 8px 30px rgba(255,213,79,0.4)",
                opacity: loading ? 0.7 : 1,
            }}>
                {loading ? (step || "Processing...") :
                    (method === "fiat" && !bankLinked ? "Link Bank Account 🏦" : "Join the Pot 🎰")}
            </button>

            {/* Plaid Mock Overlay */}
            {showPlaid && (
                <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 100, padding: 20
                }}>
                    <div style={{
                        background: "#fff", width: "100%", borderRadius: 24, padding: 24,
                        color: "#111", fontFamily: "sans-serif", position: "relative"
                    }}>
                        <button onClick={() => setShowPlaid(false)} style={{
                            position: "absolute", top: 16, right: 16, background: "none", border: "none",
                            fontSize: 24, cursor: "pointer", color: "#666"
                        }}>×</button>

                        <div style={{ textAlign: "center", marginBottom: 20 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: "#666", marginBottom: 8 }}>SECURE CONNECTION</div>
                            <div style={{ fontSize: 22, fontWeight: 800 }}>Connect your bank</div>
                            <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>Potluck uses encrypted links. We never see or store your bank credentials.</div>
                        </div>

                        {plaidStep === 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {["Chase", "Bank of America", "Wells Fargo", "Capital One"].map(b => (
                                    <button key={b} onClick={() => { setSelectedBank(b); setPlaidStep(1); }} style={{
                                        padding: "16px", borderRadius: 12, border: "1px solid #e0e0e0",
                                        background: "#f9f9f9", fontSize: 16, fontWeight: 600, textAlign: "left", cursor: "pointer"
                                    }}>🏦 {b}</button>
                                ))}
                            </div>
                        )}

                        {plaidStep === 1 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                <div style={{ fontSize: 16, fontWeight: 700, textAlign: "center", marginBottom: 16 }}>Logging securely into {selectedBank}</div>
                                <input type="text" placeholder="User ID" style={{ padding: 14, borderRadius: 8, border: "1px solid #ccc", fontSize: 16 }} />
                                <input type="password" placeholder="Password" style={{ padding: 14, borderRadius: 8, border: "1px solid #ccc", fontSize: 16 }} />
                                <button onClick={() => {
                                    setPlaidStep(2);
                                    setTimeout(() => {
                                        setBankLinked(true);
                                        setShowPlaid(false);
                                    }, 2000);
                                }} style={{
                                    background: "#111", color: "#fff", padding: 16, borderRadius: 8,
                                    border: "none", fontSize: 16, fontWeight: 700, marginTop: 12, cursor: "pointer"
                                }}>Submit</button>
                            </div>
                        )}

                        {plaidStep === 2 && (
                            <div style={{ textAlign: "center", padding: "40px 0" }}>
                                <div style={{ fontSize: 48, marginBottom: 16, animation: "bounce-in 0.5s ease-out" }}>✅</div>
                                <div style={{ fontSize: 20, fontWeight: 700 }}>Account Linked!</div>
                                <div style={{ fontSize: 14, color: "#666", marginTop: 8 }}>Redirecting back to Potluck...</div>
                            </div>
                        )}

                        <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "#999", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                            <span>🔒 Secured by Plaid API Mock</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* =============================================
   DRAW SCREEN
============================================= */
function DrawScreen({ drawPhase, go, spawnParticles, draws, winner }) {
    const grandDraw = draws?.find(d => d.type === "grand") || {};

    return (
        <div style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(160deg, #111, #080808)", padding: 32, gap: 20,
        }}>
            {drawPhase === 0 && (
                <div style={{ textAlign: "center", animation: "slide-up 0.5s ease-out" }}>
                    <div style={{ fontSize: 14, color: "#FFD54F", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>Grand Draw · Q1 2026</div>
                    <div style={{ fontSize: 80, marginBottom: 16, animation: "float 2s ease-in-out infinite" }}>🎰</div>
                    <div style={{ fontSize: 28, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff" }}>{formatCurrency(grandDraw.prize_pool || 0)}</div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>{grandDraw.member_count || 0} members · Drawing now</div>
                    <div style={{ marginTop: 24, display: "flex", gap: 6, justifyContent: "center" }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFD54F", animation: `pulse-ring 1s ${i * 0.3}s ease-out infinite` }} />
                        ))}
                    </div>
                </div>
            )}
            {drawPhase === 1 && (
                <div style={{ textAlign: "center", animation: "slide-up 0.4s ease-out" }}>
                    <div style={{ fontSize: 14, color: "#F59E0B", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>Mixing the pot...</div>
                    <div style={{ fontSize: 72, animation: "spin-slow 1s linear infinite" }}>🌀</div>
                    <div style={{ marginTop: 20, fontSize: 16, color: "rgba(255,255,255,0.5)" }}>Selecting from {grandDraw.total_entries || 0} entries</div>
                    <div style={{ marginTop: 12, height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, width: "100%", overflow: "hidden" }}>
                        <div style={{ height: "100%", background: "linear-gradient(90deg, #FFB300, #FFD54F, #FFD700)", animation: "shimmer 1s linear infinite", backgroundSize: "200% 100%" }} />
                    </div>
                </div>
            )}
            {drawPhase === 2 && (
                <div style={{ textAlign: "center", animation: "bounce-in 0.5s ease-out" }}>
                    <div style={{ fontSize: 14, color: "#EF4444", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>Almost there...</div>
                    <div style={{
                        width: 120, height: 120, borderRadius: "50%",
                        background: "linear-gradient(135deg, #FFB300, #FFD700)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 48, margin: "0 auto 20px",
                        boxShadow: "0 0 60px rgba(255,215,0,0.5)", animation: "float 0.8s ease-in-out infinite",
                    }}>❓</div>
                    <div style={{ fontSize: 20, color: "rgba(255,255,255,0.6)" }}>The winner is...</div>
                </div>
            )}
            {drawPhase >= 3 && winner && (
                <div style={{ textAlign: "center", animation: "draw-reveal 0.6s cubic-bezier(.34,1.56,.64,1) both" }}>
                    <div style={{ fontSize: 13, color: "#FFD700", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>🏆 Winner Announced!</div>
                    <div style={{ fontSize: 64, marginBottom: 8 }}>🎉</div>
                    <div style={{ fontSize: 26, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff" }}>{winner.name}</div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>{winner.city}</div>
                    <div style={{ fontSize: 52, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#FFD700", animation: "number-count 0.5s ease-out" }}>
                        {formatCurrency(winner.amount)}
                    </div>
                    <button className="btn-glow" onClick={() => { go("result"); spawnParticles(); }} style={{
                        marginTop: 24, padding: "14px 32px", borderRadius: 16, border: "none",
                        background: "linear-gradient(135deg, #FFD54F, #FFB300)",
                        color: "#000", fontSize: 15, fontWeight: 700,
                    }}>See your results →</button>
                </div>
            )}
        </div>
    );
}

/* =============================================
   RESULT SCREEN
============================================= */
function ResultScreen({ go, user, streak }) {
    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto", padding: "24px 24px 40px" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 56, marginBottom: 8, animation: "bounce-in 0.4s ease-out" }}>⚡</div>
                <div style={{ fontSize: 24, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff" }}>So close!</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Better luck next draw — your streak is growing!</div>
            </div>

            {/* Rewards unlocked */}
            <div style={{ background: "linear-gradient(135deg, rgba(30,30,30,0.6), rgba(255,213,79,0.06))", borderRadius: 20, padding: 20, marginBottom: 16, border: "1px solid rgba(255,213,79,0.3)" }}>
                <div style={{ fontSize: 13, color: "#FFD54F", fontWeight: 700, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>🎁 You Unlocked</div>
                {[
                    { icon: "🔥", label: "Streak preserved", value: `Now at ${(streak?.current_streak || 0) + 1} draws!` },
                    { icon: "🎫", label: "Bonus entries", value: "+200 for next draw" },
                    { icon: "⬆️", label: "Multiplier", value: `${streak?.multiplier || 1}× (${streak?.draws_to_next || '?'} draws to next tier)` },
                ].map((r, i) => (
                    <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                        borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                        animation: `slide-up 0.4s ${i * 0.1 + 0.2}s ease-out both`,
                    }}>
                        <span style={{ fontSize: 22 }}>{r.icon}</span>
                        <div>
                            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{r.label}</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{r.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Next draw */}
            <div style={{ background: "rgba(255,215,0,0.06)", borderRadius: 16, padding: 16, marginBottom: 20, border: "1px solid rgba(255,215,0,0.2)", textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Next Grand Draw</div>
                <div style={{ fontSize: 28, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#FFD700" }}>90 days</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Your entries: {user?.total_entries || 0} (streak bonus applied)</div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-glow" onClick={() => go("home")} style={{
                    flex: 1, padding: "16px", borderRadius: 16, border: "none",
                    background: "linear-gradient(135deg, #FFD54F, #FFB300)",
                    color: "#000", fontSize: 15, fontWeight: 700,
                }}>Back to Home</button>
            </div>
        </div>
    );
}

/* =============================================
   COMMUNITY SCREEN (Live Data)
============================================= */
function CommunityScreen({ go, user }) {
    const [feed, setFeed] = useState([]);
    const [leaders, setLeaders] = useState([]);
    const [syndicate, setSyndicate] = useState(null);
    const [checkedIn, setCheckedIn] = useState(false);

    useEffect(() => {
        api.getFeed().then(setFeed).catch(() => { });
        api.getLeaderboard().then(setLeaders).catch(() => { });
        api.getMySyndicate().then(setSyndicate).catch(() => { });
    }, []);

    const handleCheckin = async () => {
        try {
            await api.dailyCheckin();
            setCheckedIn(true);
        } catch (err) {
            if (err.message.includes("Already")) setCheckedIn(true);
        }
    };

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
            <div style={{ padding: "8px 20px 0", flex: 1, overflow: "auto" }}>

                {/* Daily check-in */}
                <button className="btn-glow" onClick={handleCheckin} disabled={checkedIn} style={{
                    width: "100%", padding: "14px", borderRadius: 16, border: "1px solid rgba(129,199,132,0.3)",
                    background: checkedIn ? "rgba(129,199,132,0.15)" : "linear-gradient(135deg, #0f2a0f, #1a3a1a)",
                    color: checkedIn ? "#81C784" : "#fff", fontSize: 14, fontWeight: 700,
                    marginBottom: 16, cursor: checkedIn ? "default" : "pointer",
                }}>{checkedIn ? "✅ Checked in today! +1 entry" : "📅 Daily Check-in (+1 bonus entry)"}</button>

                {/* Syndicate card */}
                {syndicate && (
                    <div style={{
                        background: "linear-gradient(135deg, rgba(129,199,132,0.08), rgba(30,30,30,0.6))",
                        borderRadius: 20, padding: 18, marginBottom: 16,
                        border: "1px solid rgba(129,199,132,0.3)", position: 'relative', overflow: 'hidden'
                    }}>
                        {syndicate.pool_unlocked && (
                            <div style={{
                                position: 'absolute', top: 0, right: 0, background: '#FFD54F',
                                color: '#000', fontSize: 10, fontWeight: 800, padding: '4px 12px',
                                borderBottomLeftRadius: 12, textTransform: 'uppercase', letterSpacing: 1
                            }}>🔥 Private Pool Unlocked</div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, marginTop: syndicate.pool_unlocked ? 12 : 0 }}>
                            <div>
                                <div style={{ fontSize: 12, color: "#81C784", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Your Syndicate</div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginTop: 2 }}>{syndicate.name} {syndicate.emoji}</div>
                            </div>
                            <div style={{ background: "rgba(129,199,132,0.15)", padding: "4px 10px", borderRadius: 12, fontSize: 12, color: "#81C784", fontWeight: 700 }}>
                                {syndicate.member_count} members
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: -8, marginBottom: 12 }}>
                            {syndicate.members?.map((m, i) => (
                                <div key={i} style={{
                                    width: 32, height: 32, borderRadius: "50%", fontSize: 16,
                                    background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
                                    marginLeft: i > 0 ? -8 : 0, border: "2px solid #0f2a0f",
                                }}>{m.avatar_emoji}</div>
                            ))}
                        </div>

                        {syndicate.pool_unlocked ? (
                            <div style={{
                                background: 'rgba(255,213,79,0.05)', borderRadius: 12, padding: 12,
                                border: '1px dashed rgba(255,213,79,0.2)', marginBottom: 12
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 600 }}>Dedicated Syndicate Pool</span>
                                    <span style={{ fontSize: 11, color: '#FFD54F', fontWeight: 700 }}>Draw in {syndicate.time_to_draw}</span>
                                </div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#FFD54F' }}>
                                    ${syndicate.dedicated_pool_amount.toLocaleString()}
                                </div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                                    Only members of {syndicate.name} are eligible to win this pot. (100+ members required)
                                </div>
                            </div>
                        ) : (
                            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
                                    Reach <strong style={{ color: '#fff' }}>100 members</strong> to unlock a dedicated prize pool just for your syndicate!
                                </div>
                                <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                    <div style={{ width: `${Math.min((syndicate.member_count / 100) * 100, 100)}%`, height: '100%', background: '#81C784', borderRadius: 2 }}></div>
                                </div>
                            </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                            <span style={{ color: "rgba(255,255,255,0.4)" }}>Combined Grand Draw entries</span>
                            <span style={{ color: "#81C784", fontWeight: 700 }}>{syndicate.combined_entries?.toLocaleString()} tickets</span>
                        </div>
                    </div>
                )}

                {/* Leaderboard */}
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>🏆 Streak Leaders</div>
                {leaders.length === 0 && (
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: 20 }}>No streaks yet — be the first!</div>
                )}
                {leaders.map((u, i) => (
                    <div key={i} className="feed-item" style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                        borderRadius: 14, marginBottom: 8,
                        background: u.is_you ? "rgba(255,213,79,0.12)" : "rgba(255,255,255,0.03)",
                        border: u.is_you ? "1px solid rgba(255,213,79,0.3)" : "1px solid transparent",
                    }}>
                        <span style={{ fontSize: 18, width: 24 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${u.rank}`}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: u.is_you ? "#FFD54F" : "#fff" }}>{u.is_you ? "You" : u.name}</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>🔥 {u.current_streak} draw streak</div>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#FFD700" }}>{u.multiplier_label}</div>
                    </div>
                ))}

                {/* Live Feed */}
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1, marginTop: 16 }}>Live Feed</div>
                {feed.map(f => (
                    <div key={f.id} className="feed-item" style={{
                        display: "flex", gap: 10, padding: "10px 0",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                    }}>
                        <span style={{ fontSize: 18, flexShrink: 0 }}>{f.emoji}</span>
                        <div>
                            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>{f.text}</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{f.time_ago}</div>
                        </div>
                    </div>
                ))}
                <div style={{ height: 20 }} />
            </div>
            <BottomNav screen="community" go={go} />
        </div>
    );
}

/* =============================================
   PROFILE SCREEN — Fully Editable + Settings
============================================= */
function ProfileScreen({ go, user, streak, onLogout, currency, setCurrency }) {
    const [balance, setBalance] = useState(null);
    const [openSection, setOpenSection] = useState(null);
    const [editing, setEditing] = useState(null);
    const [frozen, setFrozen] = useState(false);

    // Editable fields
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState("+1 (555) 293-8841");
    const [city, setCity] = useState(user?.city || "");
    const [localCurrency, setLocalCurrency] = useState(currency || "USD");
    const [notifs, setNotifs] = useState("All Enabled");
    const [theme, setTheme] = useState("Dark");
    const [lang, setLang] = useState("English");
    const [biometric, setBiometric] = useState(true);
    const [twoFa, setTwoFa] = useState(true);

    useEffect(() => {
        api.getBalance().then(setBalance).catch(() => { });
    }, []);

    const toggleSection = (s) => setOpenSection(openSection === s ? null : s);

    const SPENDING = [
        { icon: "🍽️", label: "Dine", amount: "$12,450" },
        { icon: "🏠", label: "Home", amount: "$8,200" },
        { icon: "👗", label: "Style", amount: "$6,440" },
        { icon: "✈️", label: "Travel", amount: "$4,100" },
        { icon: "🏋️", label: "Health", amount: "$2,800" },
    ];

    const editableInput = (val, setter, placeholder) => (
        <input value={val} onChange={e => setter(e.target.value)} placeholder={placeholder}
            style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,213,79,0.2)",
                borderRadius: 8, padding: "6px 10px", color: "#fff", fontSize: 13,
                outline: "none", width: "100%", fontFamily: "inherit",
            }} />
    );

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
            <div style={{ flex: 1, overflow: "auto", padding: "24px 20px 40px" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <div style={{ fontSize: 20, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff" }}>Profile</div>
                    <NotifBell />
                </div>

                {/* Avatar & Info */}
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: "50%", margin: "0 auto 12px",
                        background: "linear-gradient(135deg, #FFD54F, #FFB300)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
                        boxShadow: "0 0 30px rgba(255,213,79,0.4)",
                    }}>{user?.avatar_emoji || "😊"}</div>
                    <div style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff" }}>{name || user?.name}</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                        Member since {new Date(user?.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </div>
                    {streak?.current_streak > 0 && (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, padding: "4px 12px", borderRadius: 20, background: "rgba(255,213,79,0.15)", border: "1px solid rgba(255,213,79,0.3)" }}>
                            <span style={{ fontSize: 12, color: "#FFD54F", fontWeight: 700 }}>🔥 {streak.current_streak}-Draw Streak</span>
                        </div>
                    )}
                </div>

                {/* Stats grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 24 }}>
                    {[
                        { v: formatCurrency(user?.balance || 0), l: "Deposited" },
                        { v: (user?.total_entries || 0).toLocaleString(), l: "Entries" },
                        { v: `${streak?.multiplier || 1}×`, l: "Multiplier" },
                    ].map((s, i) => (
                        <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 12, textAlign: "center" }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: "#FFD54F" }}>{s.v}</div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{s.l}</div>
                        </div>
                    ))}
                </div>

                {/* Monthly Limit */}
                <div style={{
                    background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 16,
                    border: "1px solid rgba(255,255,255,0.06)", marginBottom: 10,
                    display: "flex", alignItems: "center", gap: 16,
                }}>
                    <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
                        <svg viewBox="0 0 52 52" style={{ width: 52, height: 52, transform: "rotate(-90deg)" }}>
                            <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                            <circle cx="26" cy="26" r="22" fill="none" stroke="#FFD54F" strokeWidth="4"
                                strokeDasharray={`${2 * Math.PI * 22 * 0.7} ${2 * Math.PI * 22 * 0.3}`}
                                strokeLinecap="round" />
                        </svg>
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#FFD54F" }}>70%</div>
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 2 }}>Monthly Limit</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>$14,890.70 remaining of $60,000</div>
                    </div>
                </div>

                {/* Freeze Card */}
                <div onClick={() => setFrozen(!frozen)} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "14px 16px",
                    border: "1px solid rgba(255,255,255,0.06)", marginBottom: 16, cursor: "pointer",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 18 }}>🔒</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Freeze Card</span>
                    </div>
                    <div style={{
                        width: 42, height: 24, borderRadius: 12, padding: 2,
                        background: frozen ? "#FFD54F" : "rgba(255,255,255,0.15)",
                        transition: "background 0.2s",
                    }}>
                        <div style={{
                            width: 20, height: 20, borderRadius: "50%", background: "#fff",
                            transform: frozen ? "translateX(18px)" : "translateX(0)",
                            transition: "transform 0.2s",
                        }} />
                    </div>
                </div>

                {/* Spending Categories */}
                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 16, scrollbarWidth: "none", marginBottom: 8 }}>
                    {SPENDING.map((c, i) => (
                        <div key={i} style={{
                            minWidth: 72, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: 14, padding: "12px 8px", textAlign: "center",
                        }}>
                            <div style={{ fontSize: 18, marginBottom: 4 }}>{c.icon}</div>
                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{c.label}</div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginTop: 2 }}>{c.amount}</div>
                        </div>
                    ))}
                </div>

                {/* === Clickthrough Sections (Editable) === */}

                {/* Personal Details */}
                <SettingsSection icon="👤" title="Personal Details" isOpen={openSection === "personal"} onClick={() => toggleSection("personal")}>
                    <EditRow icon="👤" label="Name" value={name} onChange={setName} editing={editing === "name"} onEdit={() => setEditing("name")} onSave={() => setEditing(null)} />
                    <EditRow icon="📧" label="Email" value={email} onChange={setEmail} editing={editing === "email"} onEdit={() => setEditing("email")} onSave={() => setEditing(null)} />
                    <EditRow icon="📱" label="Phone" value={phone} onChange={setPhone} editing={editing === "phone"} onEdit={() => setEditing("phone")} onSave={() => setEditing(null)} />
                    <EditRow icon="📍" label="Location" value={city} onChange={setCity} editing={editing === "city"} onEdit={() => setEditing("city")} onSave={() => setEditing(null)} />
                    <SettingsRow icon="🆔" label="Member ID" value={user?.id?.slice(0, 8) || "—"} />
                </SettingsSection>

                {/* Preferences */}
                <SettingsSection icon="⚙️" title="Preferences" isOpen={openSection === "prefs"} onClick={() => toggleSection("prefs")}>
                    <SelectRow icon="💸" label="Currency" value={localCurrency} onChange={(c) => { setLocalCurrency(c); setCurrency?.(c); }}
                        options={["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "AED", "SGD", "KRW", "MXN", "BRL", "NGN", "BTC", "ETH", "SOL", "USDC", "USDT"]} />
                    <SelectRow icon="🔔" label="Notifications" value={notifs} onChange={setNotifs}
                        options={["All Enabled", "Essential Only", "Disabled"]} />
                    <SelectRow icon="🌙" label="Theme" value={theme} onChange={setTheme}
                        options={["Dark", "Light"]} />
                    <SelectRow icon="🌐" label="Language" value={lang} onChange={setLang}
                        options={["English", "Spanish", "French", "Japanese", "Arabic"]} />
                </SettingsSection>

                {/* Security */}
                <SettingsSection icon="🔒" title="Security" isOpen={openSection === "security"} onClick={() => toggleSection("security")}>
                    <ToggleRow icon="👤" label="Biometric Login" checked={biometric} onToggle={() => setBiometric(!biometric)} />
                    <SettingsRow icon="🔑" label="Change Passcode" chevron />
                    <ToggleRow icon="📲" label="Two-Factor Auth" checked={twoFa} onToggle={() => setTwoFa(!twoFa)} />
                    <SettingsRow icon="🛡️" label="Active Sessions" value="2 devices" chevron />
                </SettingsSection>

                {/* Quick Actions */}
                <div style={{ marginTop: 16 }}>
                    {/* Admin Growth Simulator */}
                    {user?.email === 'kenny6b47@gmail.com' && (
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFD54F', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 8px 4px' }}>
                                🛠️ Admin: Growth Simulator
                            </div>
                            <div style={{ background: 'rgba(255,213,79,0.05)', padding: 16, borderRadius: 16, border: '1px dashed rgba(255,213,79,0.3)' }}>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>
                                    Test Phase projections
                                </div>
                                <select value={localStorage.getItem('potluck_sim_phase') || '0'} onChange={(e) => {
                                    const p = e.target.value;
                                    localStorage.setItem('potluck_sim_phase', p);
                                    alert(`Simulation Phase set to: ${api.GROWTH_PHASES[p].label}. Reloading dashboard immediately...`);
                                    window.location.reload();
                                }} style={{
                                    width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(255,213,79,0.1)',
                                    border: '1px solid rgba(255,213,79,0.3)', color: '#FFD54F', fontSize: 13,
                                    outline: 'none', appearance: 'none', fontWeight: 600
                                }}>
                                    {Object.entries(api.GROWTH_PHASES).map(([key, val]) => (
                                        <option key={key} value={key} style={{ background: '#111', color: '#fff' }}>
                                            {val.label} {val.members ? `(${val.members.toLocaleString()} users)` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {[
                        { icon: "⬆️", label: "Add More to the Pot", sub: "More deposits = more entries", action: () => go("deposit") },
                        { icon: "🔗", label: "Refer a Friend", sub: "+50 entries per referral", action: () => go("community") },
                        { icon: "🛡️", label: "System Admin", sub: "Platform Management", action: () => window.location.hash = "#/admin" },
                    ].map((a, i) => (
                        <div key={i} className="feed-item" onClick={a.action} style={{
                            display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                            background: "rgba(255,255,255,0.04)", borderRadius: 16, marginBottom: 10,
                            border: "1px solid rgba(255,255,255,0.06)", cursor: a.action ? "pointer" : "default",
                        }}>
                            <span style={{ fontSize: 24 }}>{a.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{a.label}</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{a.sub}</div>
                            </div>
                            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 18 }}>›</span>
                        </div>
                    ))}
                </div>

                {/* Logout */}
                <button onClick={onLogout} style={{
                    width: "100%", padding: "14px", borderRadius: 14, border: "1px solid rgba(239,68,68,0.3)",
                    background: "rgba(239,68,68,0.08)", color: "#EF4444", fontSize: 14, fontWeight: 600,
                    cursor: "pointer", marginTop: 12,
                }}>Log Out</button>
            </div>
            <BottomNav screen="profile" go={go} />
        </div>
    );
}

/* Accordion wrapper */
function SettingsSection({ icon, title, isOpen, onClick, children }) {
    return (
        <div style={{ marginBottom: 10 }}>
            <div onClick={onClick} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px", background: "rgba(255,255,255,0.04)", borderRadius: isOpen ? "16px 16px 0 0" : 16,
                border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer",
                borderBottom: isOpen ? "1px solid rgba(255,255,255,0.03)" : undefined,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{icon}</span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{title}</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"
                    style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s ease" }}>
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </div>
            {isOpen && (
                <div style={{
                    background: "rgba(255,255,255,0.02)", borderRadius: "0 0 16px 16px",
                    border: "1px solid rgba(255,255,255,0.06)", borderTop: "none", padding: "4px 0",
                }}>
                    {children}
                </div>
            )}
        </div>
    );
}

/* Read-only row */
function SettingsRow({ icon, label, value, chevron }) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 15 }}>{icon}</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{label}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {value && <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>{value}</span>}
                {chevron && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>}
            </div>
        </div>
    );
}

/* Editable row — tap to edit inline */
function EditRow({ icon, label, value, onChange, editing, onEdit, onSave }) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 90 }}>
                <span style={{ fontSize: 15 }}>{icon}</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{label}</span>
            </div>
            {editing ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                    <input value={value} onChange={e => onChange(e.target.value)} autoFocus
                        style={{
                            flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,213,79,0.3)",
                            borderRadius: 8, padding: "5px 8px", color: "#fff", fontSize: 13,
                            outline: "none", fontFamily: "inherit",
                        }} />
                    <button onClick={onSave} style={{
                        background: "#FFD54F", border: "none", color: "#000", fontSize: 11,
                        fontWeight: 700, padding: "4px 10px", borderRadius: 6, cursor: "pointer",
                    }}>Save</button>
                </div>
            ) : (
                <div onClick={onEdit} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>{value || "—"}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFD54F" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </div>
            )}
        </div>
    );
}

/* Dropdown select row for preferences */
function SelectRow({ icon, label, value, onChange, options }) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 90 }}>
                <span style={{ fontSize: 15 }}>{icon}</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{label}</span>
            </div>
            <select value={value} onChange={e => onChange(e.target.value)} style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,213,79,0.15)",
                borderRadius: 8, padding: "5px 10px", color: "#FFD54F", fontSize: 12,
                fontWeight: 600, outline: "none", fontFamily: "inherit", cursor: "pointer",
                appearance: "none", paddingRight: 24,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23FFD54F' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
            }}>
                {options.map(o => <option key={o} value={o} style={{ background: "#111", color: "#fff" }}>{o}</option>)}
            </select>
        </div>
    );
}

/* Toggle row for boolean settings */
function ToggleRow({ icon, label, checked, onToggle }) {
    return (
        <div onClick={onToggle} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "11px 16px", cursor: "pointer",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 15 }}>{icon}</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{label}</span>
            </div>
            <div style={{
                width: 38, height: 22, borderRadius: 11, padding: 2,
                background: checked ? "#81C784" : "rgba(255,255,255,0.15)",
                transition: "background 0.2s",
            }}>
                <div style={{
                    width: 18, height: 18, borderRadius: "50%", background: "#fff",
                    transform: checked ? "translateX(16px)" : "translateX(0)",
                    transition: "transform 0.2s",
                }} />
            </div>
        </div>
    );
}


/* =============================================
   REWARDS SCREEN — AMEX-style Benefits
============================================= */
function RewardsScreen({ go, user, streak }) {
    const [claimedBenefits, setClaimedBenefits] = useState({});
    const [activeTab, setActiveTab] = useState("perks");

    const toggleClaim = (id) => setClaimedBenefits(prev => ({ ...prev, [id]: !prev[id] }));

    const achievements = [
        { emoji: "🔥", title: "Hot Streak", desc: "5 consecutive draws", unlocked: (streak?.current_streak || 0) >= 5 },
        { emoji: "💎", title: "Diamond Hands", desc: "Deposit $500+", unlocked: (user?.balance || 0) >= 500 },
        { emoji: "👥", title: "Social Butterfly", desc: "Join a syndicate", unlocked: true },
        { emoji: "🎯", title: "Sharpshooter", desc: "10 draws entered", unlocked: (user?.total_entries || 0) >= 10 },
        { emoji: "🏆", title: "Champion", desc: "Win a draw", unlocked: false },
        { emoji: "⚡", title: "Early Bird", desc: "Deposit within 24h", unlocked: true },
    ];

    const [travelDeals, setTravelDeals] = useState([
        { id: "t1", dest: "Bali, Indonesia", hotel: "The Mulia Resort", orig: 4200, deal: 2940, nights: 5, img: "🏝️", save: "30%" },
        { id: "t2", dest: "Paris, France", hotel: "Le Meurice", orig: 5800, deal: 4060, nights: 4, img: "🗼", save: "30%" },
        { id: "t3", dest: "Tokyo, Japan", hotel: "Aman Tokyo", orig: 6400, deal: 4480, nights: 5, img: "🏯", save: "30%" },
    ]);

    useEffect(() => {
        let isMounted = true;
        fetch('/api/travel/deals')
            .then(res => res.json())
            .then(data => {
                if (isMounted && Array.isArray(data) && data.length > 0) {
                    setTravelDeals(data);
                }
            })
            .catch(err => console.error("Failed to fetch live travel deals:", err));
        return () => { isMounted = false; };
    }, []);

    const memberPerks = [
        { id: "p1", icon: "✈️", title: "Airport Lounge Access", desc: "1,300+ lounges worldwide. Priority Pass included.", tier: "Gold" },
        { id: "p2", icon: "🍽️", title: "Fine Dining Credit", desc: "$200/mo dining credit at partnered restaurants.", tier: "Gold" },
        { id: "p3", icon: "🛍️", title: "Shopping Rewards", desc: "5x points on retail. 2x on everything else.", tier: "All" },
        { id: "p4", icon: "🏨", title: "Hotel Status Match", desc: "Auto Marriott Gold + Hilton Diamond status.", tier: "Platinum" },
        { id: "p5", icon: "🚗", title: "Rental Car Insurance", desc: "Primary CDW coverage on all rentals worldwide.", tier: "All" },
        { id: "p6", icon: "💊", title: "Travel Insurance", desc: "Trip cancellation, delay, medical up to $500k.", tier: "Gold" },
        { id: "p7", icon: "🎭", title: "Entertainment Access", desc: "Pre-sale tickets & VIP experiences at live events.", tier: "Platinum" },
        { id: "p8", icon: "📱", title: "Cell Phone Protection", desc: "Up to $800 coverage for damage/theft.", tier: "All" },
    ];

    const tabs = [
        { id: "perks", label: "Benefits" },
        { id: "travel", label: "Travel" },
        { id: "streak", label: "Streak" },
        { id: "badges", label: "Badges" },
    ];

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
            <div style={{ padding: "8px 20px 0", flex: 1, overflow: "auto" }}>

                {/* Membership Card */}
                <div style={{
                    background: "linear-gradient(135deg, #1a1a1a, #111)",
                    borderRadius: 20, padding: "20px 24px", marginBottom: 16,
                    border: "1px solid rgba(255,213,79,0.2)", position: "relative", overflow: "hidden",
                }}>
                    <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,213,79,0.1), transparent)" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 2, fontWeight: 600 }}>Potluck</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: "#FFD54F", fontFamily: "'Syne', sans-serif", marginTop: 2 }}>GOLD MEMBER</div>
                        </div>
                        <div style={{ fontSize: 28 }}>💳</div>
                    </div>
                    <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
                        <div>
                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1 }}>Points</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>124,500</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1 }}>This Month</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: "#81C784" }}>+8,240</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1 }}>Tier</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: "#FFD54F" }}>{streak?.multiplier || 1}×</div>
                        </div>
                    </div>
                </div>

                {/* Tab Bar */}
                <div style={{ display: "flex", gap: 0, marginBottom: 16, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 3 }}>
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                            flex: 1, background: activeTab === t.id ? "rgba(255,213,79,0.12)" : "none",
                            border: activeTab === t.id ? "1px solid rgba(255,213,79,0.2)" : "1px solid transparent",
                            borderRadius: 10, padding: "8px 0", cursor: "pointer",
                            fontSize: 12, fontWeight: 700, color: activeTab === t.id ? "#FFD54F" : "rgba(255,255,255,0.35)",
                            transition: "all 0.2s",
                        }}>{t.label}</button>
                    ))}
                </div>

                {/* Benefits Tab */}
                {activeTab === "perks" && (
                    <div style={{ marginBottom: 80 }}>
                        {memberPerks.map(p => (
                            <div key={p.id} style={{
                                display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                                background: "rgba(255,255,255,0.03)", borderRadius: 16, marginBottom: 8,
                                border: `1px solid ${claimedBenefits[p.id] ? "rgba(129,199,132,0.2)" : "rgba(255,255,255,0.06)"}`,
                            }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 12, display: "flex",
                                    alignItems: "center", justifyContent: "center", fontSize: 20,
                                    background: claimedBenefits[p.id] ? "rgba(129,199,132,0.1)" : "rgba(255,213,79,0.08)",
                                }}>{p.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{p.title}</div>
                                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{p.desc}</div>
                                </div>
                                <button onClick={() => toggleClaim(p.id)} style={{
                                    background: claimedBenefits[p.id] ? "rgba(129,199,132,0.15)" : "rgba(255,213,79,0.12)",
                                    border: `1px solid ${claimedBenefits[p.id] ? "rgba(129,199,132,0.3)" : "rgba(255,213,79,0.3)"}`,
                                    borderRadius: 8, padding: "5px 10px", fontSize: 10, fontWeight: 700,
                                    color: claimedBenefits[p.id] ? "#81C784" : "#FFD54F", cursor: "pointer",
                                }}>{claimedBenefits[p.id] ? "✓ Active" : "Activate"}</button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Travel Tab */}
                {activeTab === "travel" && (
                    <div style={{ marginBottom: 80 }}>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 12, fontWeight: 500 }}>
                            Exclusive member rates · Book directly in-app
                        </div>
                        {travelDeals.map(d => (
                            <div key={d.id} style={{
                                background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 16, marginBottom: 10,
                                border: `1px solid ${claimedBenefits[d.id] ? "rgba(129,199,132,0.2)" : "rgba(255,255,255,0.06)"}`,
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                            <span style={{ fontSize: 22 }}>{d.img}</span>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{d.dest}</div>
                                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{d.hotel} · {d.nights} nights</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        background: "rgba(129,199,132,0.12)", border: "1px solid rgba(129,199,132,0.3)",
                                        borderRadius: 8, padding: "3px 8px", fontSize: 11, fontWeight: 800, color: "#81C784",
                                    }}>-{d.save}</div>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "line-through" }}>${d.orig.toLocaleString()}</span>
                                        <span style={{ fontSize: 16, fontWeight: 800, color: "#FFD54F" }}>${d.deal.toLocaleString()}</span>
                                    </div>
                                    <button onClick={() => toggleClaim(d.id)} style={{
                                        background: claimedBenefits[d.id] ? "rgba(129,199,132,0.15)" : "linear-gradient(135deg, #FFD54F, #FFB300)",
                                        border: "none", borderRadius: 10, padding: "8px 16px",
                                        fontSize: 12, fontWeight: 700, cursor: "pointer",
                                        color: claimedBenefits[d.id] ? "#81C784" : "#000",
                                    }}>{claimedBenefits[d.id] ? "✓ Booked" : "Book Now"}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Streak Tab */}
                {activeTab === "streak" && (
                    <div style={{ marginBottom: 80 }}>
                        <div style={{
                            background: "linear-gradient(135deg, rgba(255,213,79,0.08), rgba(30,30,30,0.6))",
                            borderRadius: 24, padding: 24, marginBottom: 16,
                            border: "1px solid rgba(255,213,79,0.3)", textAlign: "center",
                        }}>
                            <div style={{ fontSize: 56, marginBottom: 8 }}>🔥</div>
                            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 2, fontWeight: 600, marginBottom: 4 }}>Current Streak</div>
                            <div style={{ fontSize: 48, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#FFD54F" }}>{streak?.current_streak || 0}</div>
                            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>consecutive draws</div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            {[{ draws: 3, mult: "1.5×", color: "#C0C0C0" }, { draws: 5, mult: "2×", color: "#FFD54F" }, { draws: 10, mult: "3×", color: "#FF8C42" }, { draws: 20, mult: "5×", color: "#EF4444" }].map((t, i) => {
                                const reached = (streak?.current_streak || 0) >= t.draws;
                                return (
                                    <div key={i} style={{
                                        flex: 1, background: reached ? `${t.color}15` : "rgba(255,255,255,0.03)",
                                        borderRadius: 16, padding: 14, textAlign: "center",
                                        border: `1px solid ${reached ? `${t.color}40` : "rgba(255,255,255,0.08)"}`,
                                    }}>
                                        <div style={{ fontSize: 18, fontWeight: 800, color: reached ? t.color : "rgba(255,255,255,0.2)" }}>{t.mult}</div>
                                        <div style={{ fontSize: 10, color: reached ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)", marginTop: 4 }}>{t.draws} draws</div>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{
                            background: "linear-gradient(135deg, rgba(129,199,132,0.08), rgba(30,30,30,0.6))",
                            borderRadius: 20, padding: 18, marginTop: 16,
                            border: "1px solid rgba(129,199,132,0.3)",
                        }}>
                            <div style={{ fontSize: 13, color: "#81C784", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>🎫 Bonus Entries</div>
                            {[
                                { action: "Daily Check-in", reward: "+1 entry", done: false },
                                { action: "Refer a Friend", reward: "+50 entries", done: false },
                                { action: "Streak Bonus (5+)", reward: "+200 entries", done: (streak?.current_streak || 0) >= 5 },
                            ].map((b, i) => (
                                <div key={i} style={{
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    padding: "10px 0", borderTop: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                                }}>
                                    <span style={{ fontSize: 14, color: b.done ? "rgba(255,255,255,0.3)" : "#fff", fontWeight: 500, textDecoration: b.done ? "line-through" : "none" }}>{b.action}</span>
                                    <span style={{ fontSize: 13, color: b.done ? "rgba(129,199,132,0.5)" : "#81C784", fontWeight: 700 }}>{b.done ? "✅ Claimed" : b.reward}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Badges Tab */}
                {activeTab === "badges" && (
                    <div style={{ marginBottom: 80 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                            {achievements.map((a, i) => (
                                <div key={i} style={{
                                    background: a.unlocked ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                                    borderRadius: 16, padding: 16, textAlign: "center",
                                    border: `1px solid ${a.unlocked ? "rgba(255,213,79,0.2)" : "rgba(255,255,255,0.06)"}`,
                                    opacity: a.unlocked ? 1 : 0.4,
                                }}>
                                    <div style={{ fontSize: 28, marginBottom: 6 }}>{a.emoji}</div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{a.title}</div>
                                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{a.desc}</div>
                                    {a.unlocked && <div style={{ fontSize: 8, color: "#FFD54F", fontWeight: 700, marginTop: 4 }}>UNLOCKED</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <BottomNav screen="rewards" go={go} />
        </div>
    );
}


/* =============================================
   SPLASH SCREEN
============================================= */
function SplashScreen() {
    return (
        <div style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "#080808", position: "relative", overflow: "hidden",
        }}>
            {/* Ambient glow */}
            <div style={{
                position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)",
                width: 300, height: 300, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,213,79,0.12) 0%, transparent 70%)",
                filter: "blur(40px)",
            }} />
            <div style={{ position: "relative", marginBottom: 32, animation: "scale-in 0.6s ease-out" }}>
                <div style={{
                    width: 110, height: 110, borderRadius: "50%",
                    background: "linear-gradient(135deg, #FFD54F, #FFB300)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    animation: "float 2.5s ease-in-out infinite",
                    boxShadow: "0 0 80px rgba(255,213,79,0.4), 0 0 160px rgba(255,213,79,0.15)",
                }}>
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 2a3 3 0 0 0-3 3v2.83a8.9 8.9 0 0 0-2 1.17H3.17A3 3 0 0 0 2 11c0 1.66 1.34 3 3 3h4.62c.08.7.25 1.38.5 2.03v2.8c0 1.66 1.34 3 3 3 1.66 0 3-1.34 3-3v-2.8a8.9 8.9 0 0 0 2-1.17L20.83 15A3 3 0 0 0 22 12c0-1.66-1.34-3-3-3h-4.62a8.9 8.9 0 0 0-.5-2.03v-2.8A3 3 0 0 0 11 2z" />
                        <path d="M12 12v10M12 12l8.66-5M12 12L3.34 7" />
                    </svg>
                </div>
                <div style={{
                    position: "absolute", inset: -24, borderRadius: "50%",
                    border: "1.5px solid rgba(255,213,79,0.2)",
                    animation: "pulse-ring 2s ease-out infinite",
                }} />
                <div style={{
                    position: "absolute", inset: -44, borderRadius: "50%",
                    border: "1px solid rgba(255,213,79,0.08)",
                    animation: "pulse-ring 2s 0.4s ease-out infinite",
                }} />
            </div>
            <div style={{
                fontFamily: "'Syne', sans-serif", fontSize: 48, fontWeight: 800,
                color: "#fff", letterSpacing: -2, animation: "fade-in 0.8s ease-out 0.3s both",
            }}>POTLUCK</div>
            <div style={{
                fontSize: 14, color: "rgba(255,255,255,0.35)", marginTop: 12, letterSpacing: 3,
                textTransform: "uppercase", fontWeight: 500,
                animation: "fade-in 0.8s ease-out 0.6s both",
            }}>Your money. Your lucky day.</div>
        </div>
    );
}


/* =============================================
   MAIN APP
============================================= */
export default function App() {
    useEffect(() => {
        console.log("POTLUCK V3.0 - SUPABASE ACTIVE");
    }, []);

    const [screen, setScreen] = useState("splash");
    const [savingsScreen, setSavingsScreen] = useState("home");
    const [user, setUser] = useState(null);
    const [draws, setDraws] = useState([]);
    const [streak, setStreak] = useState(null);
    const [drawPhase, setDrawPhase] = useState(0);
    const [winner, setWinner] = useState(null);
    const [particles, setParticles] = useState([]);
    const [step, setStep] = useState("");
    const [showNotifs, setShowNotifs] = useState(false);

    // Global Currency State
    const [currency, setCurrency] = useState("USD");
    const [exchangeRates, setExchangeRates] = useState({ USD: 1.0 });

    useEffect(() => {
        fetch('/api/rates').then(res => res.json()).then(data => {
            if (data.rates) setExchangeRates(data.rates);
        }).catch(() => { });
    }, []);

    // Asset & Market Data State
    const [assets, setAssets] = useState(INITIAL_ASSETS);
    const [marketData, setMarketData] = useState(null);
    const [plaidBalance, setPlaidBalance] = useState(0);
    const [plaidAccounts, setPlaidAccounts] = useState([]);
    const [loadingAssets, setLoadingAssets] = useState(true);

    const refreshAssets = async () => {
        try {
            setLoadingAssets(true);
            // 1. Fetch Supabase custom assets
            const dbAssets = await api.getAssets().catch(() => []);
            setAssets(dbAssets.length > 0 ? dbAssets : INITIAL_ASSETS);

            // 2. Fetch Plaid linked account balances
            const plaidData = await getAccounts('potluck-user-1').catch(() => ({ accounts: [] }));
            if (plaidData.accounts) {
                setPlaidAccounts(plaidData.accounts);
                let pBal = 0;
                plaidData.accounts.forEach(acct => {
                    if (['depository', 'investment', 'brokerage'].includes(acct.type)) {
                        pBal += acct.balance_current || 0;
                    }
                    else if (['credit', 'loan'].includes(acct.type)) {
                        pBal -= acct.balance_current || 0;
                    }
                });
                setPlaidBalance(pBal);
            }

            // 3. Fetch live market data
            const cryptoRes = await fetch('/api/market/crypto').catch(() => null);
            const cryptoData = cryptoRes?.ok ? await cryptoRes.json() : null;
            const stockRes = await fetch('/api/market/stocks').catch(() => null);
            const stockData = stockRes?.ok ? await stockRes.json() : null;
            setMarketData({ crypto: cryptoData, stocks: stockData });

        } catch (err) {
            console.warn("Failed to refresh global assets", err);
        } finally {
            setLoadingAssets(false);
        }
    };

    useEffect(() => {
        if (user) refreshAssets();
    }, [user]);

    // Derived: Merged List of all holdings
    const mergedAssets = [
        ...assets.map(a => {
            let val = a.value;
            let chg = a.change;
            if (a.id === 1 && marketData?.crypto?.bitcoin) {
                val = marketData.crypto.bitcoin.usd * 10;
                chg = Number(marketData.crypto.bitcoin.usd_24h_change?.toFixed(2) || 0);
            }
            if (a.id === 4 && marketData?.stocks?.SPY) {
                val = marketData.stocks.SPY.price * 100;
                chg = Number(marketData.stocks.SPY.percent_change?.toFixed(2) || 0);
            }
            return { ...a, value: val, change: chg, category: a.type || 'other' };
        }),
        ...plaidAccounts.map(pa => {
            let cat = 'cash';
            if (pa.type === 'credit' || pa.type === 'loan') cat = 'credit';
            if (pa.type === 'investment' || pa.type === 'brokerage') cat = 'stock';

            return {
                id: `plaid-${pa.account_id}`,
                name: pa.official_name || pa.name,
                value: pa.balance_current,
                icon: pa.type === 'credit' ? '💳' : '🏦',
                category: cat,
                type: pa.type,
                bg_image: '',
                change: 0
            };
        })
    ];

    useEffect(() => {
        setGlobalCurrency(currency, exchangeRates[currency] || 1.0);
    }, [currency, exchangeRates]);

    // Refresh wrapper to force re-renders when currency changes
    const [refreshKey, setRefreshKey] = useState(0);
    useEffect(() => { setRefreshKey(k => k + 1); }, [currency]);

    // Track active asset for details view
    const [activeAsset, setActiveAsset] = useState(null);

    // Boot sequence
    useEffect(() => {
        const boot = async () => {
            if (api.isLoggedIn()) {
                try {
                    const me = await api.getMe();
                    setUser(me);
                    const d = await api.getCurrentDraws();
                    setDraws(d);
                    const s = await api.getMyStreak();
                    setStreak(s);
                    setScreen("home");
                    console.log("BOOT: Redirecting to HOME");
                } catch {
                    api.logout();
                    setScreen("auth");
                }
            } else {
                setTimeout(() => setScreen("auth"), 2000);
            }
        };
        boot();
    }, []);

    const refreshData = async () => {
        try {
            const me = await api.getMe();
            setUser(me);
            const d = await api.getCurrentDraws();
            setDraws(d);
            const s = await api.getMyStreak();
            setStreak(s);
        } catch { }
    };

    const handleAuth = async (userData) => {
        setUser(userData);
        await refreshData();
        setScreen("home");
    };

    const handleLogout = () => {
        api.logout();
        setUser(null);
        setDraws([]);
        setStreak(null);
        setScreen("auth");
    };

    const startDraw = () => {
        setScreen("draw");
        setDrawPhase(0);
        let phase = 0;
        const advance = async () => {
            phase++;
            setDrawPhase(phase);
            if (phase < 3) {
                setTimeout(advance, phase === 1 ? 2000 : 2500);
            } else if (phase === 3) {
                // Execute the draw on the blockchain
                setStep("Executing Smart Contract Draw...");
                try {
                    const walletClient = await getWalletClient();
                    const [account] = await walletClient.getAddresses();

                    const { request } = await publicClient.simulateContract({
                        address: CONTRACTS.VAULT, // The vault holds the prize pool ref or we can call prize pool directly if we had the ABI
                        abi: ABIs.VAULT,
                        functionName: 'sweepYield', // For demo we sweep yield first
                        account
                    }).catch(() => ({ request: null })); // Ignore if it fails

                    if (request) {
                        const sweepTx = await walletClient.writeContract(request);
                        await publicClient.waitForTransactionReceipt({ hash: sweepTx });
                    }

                    // Now execute the actual draw
                    const { request: drawReq } = await publicClient.simulateContract({
                        address: CONTRACTS.PRIZE_POOL,
                        abi: ABIs.PRIZE_POOL,
                        functionName: 'executeDraw',
                        account
                    }).catch(() => ({ request: null }));

                    if (drawReq) {
                        const drawTx = await walletClient.writeContract(drawReq);
                        await publicClient.waitForTransactionReceipt({ hash: drawTx });
                    }

                    const grandDraw = draws.find(d => d.type === "grand");
                    if (grandDraw) {
                        const result = await api.executeDraw(grandDraw.id);
                        setWinner(result.winner);
                    } else {
                        setWinner({ name: "Sarah M.", city: "Austin, TX", amount: 47200 });
                    }
                } catch (err) {
                    console.error("Draw error", err);
                    // Fallback winner for demo continuity
                    setWinner({ name: "Sarah M.", city: "Austin, TX", amount: 47200 });
                }
                phase = 4;
                setDrawPhase(4);
            }
        };
        setTimeout(advance, 1200);
    };

    const spawnParticles = () => {
        const pts = Array.from({ length: 60 }, (_, i) => ({
            id: i, x: Math.random() * 100, delay: Math.random() * 1.5,
            color: ["#FFD700", "#FFD54F", "#FF6B9D", "#81C784", "#FF8C42"][i % 5],
            size: 6 + Math.random() * 8,
        }));
        setParticles(pts);
        setTimeout(() => setParticles([]), 4000);
    };

    const go = (s) => {
        if (s === "share") s = "community";
        setScreen(s);
        if (s === "home") refreshData();
        if (s === "savings") setSavingsScreen("home");
    };

    const navScreens = [
        { id: "home", label: "Home" },
        { id: "deposit", label: "Deposit" },
        { id: "draw", label: "Draw" },
        { id: "result", label: "Win!" },
        { id: "community", label: "Social" },
        { id: "profile", label: "Profile" },
    ];

    return (
        <div style={{
            width: "100%", maxWidth: "480px", margin: "0 auto", height: "100dvh",
            background: "#080808", position: "relative", overflow: "hidden",
            display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 0 50px rgba(0,0,0,0.5)",
        }}>
            {/* Particles */}
            {particles.map(p => (
                <div key={p.id} style={{
                    position: "absolute", left: `${p.x}%`, top: -20, width: p.size, height: p.size,
                    borderRadius: "50%", background: p.color, zIndex: 999,
                    animation: `confetti-fall ${1.5 + Math.random()}s ${p.delay}s ease-in forwards`,
                    pointerEvents: "none",
                }} />
            ))}

            {/* Screens */}
            {screen === "splash" && <SplashScreen />}
            {screen === "auth" && <AuthScreen onAuth={handleAuth} />}

            {!["splash", "auth"].includes(screen) && (
                <GlobalHeader onNotifClick={() => setShowNotifs(true)} />
            )}

            {screen === "deposit" && <DepositScreen go={go} onDeposit={refreshData} />}
            {screen === "home" && <HomeScreen go={go} startDraw={startDraw} user={user} draws={draws} streak={streak} />}

            {/* Notifications Panel */}
            {showNotifs && (
                <div style={{
                    position: "absolute", inset: 0, zIndex: 1000,
                    background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)",
                    display: "flex", flexDirection: "column",
                    animation: "fade-in 0.3s ease-out",
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "40px 20px 20px" }}>
                        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: 0, fontFamily: "'Syne', sans-serif" }}>Notifications</h2>
                        <button onClick={() => setShowNotifs(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 12, fontWeight: 700, cursor: "pointer" }}>Close</button>
                    </div>
                    <div style={{ flex: 1, overflow: "auto", padding: "0 20px" }}>
                        {[
                            { title: "Weekly Draw Soon!", desc: "The $125k Weekly Draw happens in 4 hours. Good luck!", icon: "🎒", time: "4h remaining" },
                            { title: "Deposit Confirmed", desc: "Your $50 deposit was successful. +5 tickets added!", icon: "🏦", time: "2 days ago" },
                            { title: "Referral Bonus", desc: "Kenny joined using your link! +50 entries received.", icon: "🤝", time: "1 week ago" },
                        ].map((n, i) => (
                            <div key={i} style={{
                                padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.08)", marginBottom: 12,
                                display: "flex", gap: 14,
                            }}>
                                <div style={{ fontSize: 24 }}>{n.icon}</div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{n.title}</div>
                                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{n.desc}</div>
                                    <div style={{ fontSize: 10, color: "#FFD54F", fontWeight: 700, marginTop: 8, textTransform: "uppercase" }}>{n.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {screen === "draw" && <DrawScreen drawPhase={drawPhase} go={go} spawnParticles={spawnParticles} draws={draws} winner={winner} />}

            {/* Money module screens */}
            {screen === "savings" && (() => {
                const handleNav = (s, data = null) => {
                    if (s === 'asset' && data) {
                        setActiveAsset(data);
                    }
                    if (['home', 'savings', 'rewards', 'share', 'profile'].includes(s)) {
                        go(s);
                    } else {
                        setSavingsScreen(s);
                    }
                };

                const subTabs = [
                    { id: "home", label: "Dashboard" },
                    { id: "asset", label: "Assets" },
                    { id: "transactions", label: "Activity" },
                ];

                let content = null;
                if (savingsScreen === "home") content = <SavingsHome onNavigate={handleNav} assets={mergedAssets} plaidBalance={plaidBalance} loading={loadingAssets} onRefresh={refreshAssets} />;
                else if (savingsScreen === "asset_list") content = <AssetsPage onNavigate={handleNav} assets={mergedAssets} onRefresh={refreshAssets} />;
                else if (savingsScreen === "asset") content = <AssetDetails onNavigate={() => setSavingsScreen('asset_list')} asset={activeAsset} />;
                else if (savingsScreen === "goal") content = <GoalDetails onNavigate={handleNav} />;
                else if (savingsScreen === "settings") content = <SettingsPage onNavigate={handleNav} />;
                else if (savingsScreen === "transactions") content = <TransactionsPage onNavigate={handleNav} />;

                return (
                    <>
                        {/* Slim Header Nav */}
                        <div style={{
                            display: "flex", gap: 0,
                            background: "rgba(15,15,15,0.95)",
                            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                            padding: "0 16px", flexShrink: 0,
                        }}>
                            {subTabs.map(t => {
                                const active = savingsScreen === t.id || (t.id === "home" && savingsScreen === "goal");
                                return (
                                    <button key={t.id} onClick={() => {
                                        if (t.id === 'asset') setSavingsScreen('asset_list');
                                        else setSavingsScreen(t.id);
                                    }} style={{
                                        flex: 1, background: "none", border: "none",
                                        padding: "12px 0 10px", cursor: "pointer",
                                        fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
                                        color: active ? "#FFD54F" : "rgba(255,255,255,0.35)",
                                        borderBottom: active ? "2px solid #FFD54F" : "2px solid transparent",
                                        transition: "all 0.2s ease",
                                    }}>
                                        {t.label}
                                    </button>
                                );
                            })}
                        </div>
                        {content}
                        <BottomNav screen="savings" go={go} />
                    </>
                );
            })()}
            {screen === "result" && <ResultScreen go={go} user={user} streak={streak} />}
            {screen === "community" && <CommunityScreen go={go} user={user} />}
            {screen === "rewards" && <RewardsScreen go={go} user={user} streak={streak} />}
            {screen === "profile" && <ProfileScreen go={go} user={user} streak={streak} onLogout={handleLogout} currency={currency} setCurrency={setCurrency} />}
        </div>
    );
}
