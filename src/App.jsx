import { useState, useEffect, useRef } from "react";
import * as api from "./api";
import { publicClient, getWalletClient, CONTRACTS, ABIs } from "./web3/client";
import { parseUnits, formatUnits } from "viem";

const formatCurrency = (n) => "$" + Number(n).toLocaleString();
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
                    background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 32, boxShadow: "0 0 40px rgba(139,92,246,0.5)",
                }}>🎰</div>
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
                    background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                    color: "#fff", fontSize: 16, fontWeight: 700,
                    boxShadow: "0 8px 30px rgba(139,92,246,0.4)",
                    opacity: loading ? 0.7 : 1,
                    marginTop: 8,
                }}>{loading ? "..." : mode === "login" ? "Log In" : "Create Account"}</button>

                <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} style={{
                    background: "none", border: "none", color: "#A855F7", fontSize: 14,
                    cursor: "pointer", marginTop: 8, textAlign: "center",
                }}>
                    {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                </button>
            </div>
        </div>
    );
}

const inputStyle = {
    padding: "16px", borderRadius: 14, border: "1px solid rgba(139,92,246,0.2)",
    background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 15,
    outline: "none", fontFamily: "'DM Sans', sans-serif",
};

/* =============================================
   BOTTOM NAV
============================================= */
function BottomNav({ screen, go }) {
    const tabs = [
        { icon: "🏠", label: "Home", s: "home" },
        { icon: "👥", label: "Social", s: "community" },
        { icon: "🎰", label: "Draw", s: "draw" },
        { icon: "👤", label: "Profile", s: "profile" },
    ];
    return (
        <div style={{
            display: "flex", background: "rgba(13,10,26,0.95)", padding: "12px 20px 24px",
            borderTop: "1px solid rgba(255,255,255,0.08)", flexShrink: 0,
        }}>
            {tabs.map((t, i) => (
                <button key={i} className="tab-btn" onClick={() => go(t.s)} style={{
                    flex: 1, background: "none", border: "none", padding: 8,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                }}>
                    <span style={{ fontSize: 20 }}>{t.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: screen === t.s ? "#9B6FFF" : "rgba(255,255,255,0.3)" }}>{t.label}</span>
                </button>
            ))}
        </div>
    );
}

/* =============================================
   HOME SCREEN (Live Data)
============================================= */
function HomeScreen({ go, startDraw, user, draws, streak }) {
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
            <div style={{ background: "rgba(139,92,246,0.1)", padding: "8px 0", overflow: "hidden", borderBottom: "1px solid rgba(139,92,246,0.2)", flexShrink: 0 }}>
                <div style={{ animation: "ticker 12s linear infinite", whiteSpace: "nowrap", fontSize: 12, color: "#A855F7", fontWeight: 600 }}>
                    &nbsp;&nbsp;&nbsp;🏆 Welcome {user?.name}! · 💰 Grand Pot: {formatCurrency(grandDraw.prize_pool || 0)} · 🔥 Your streak: {streak?.current_streak || 0} draws · ⚡ {grandDraw.member_count || 0} members in the pot &nbsp;&nbsp;&nbsp;
                </div>
            </div>

            <div style={{ padding: "20px 20px 0", flex: 1, overflow: "auto" }}>
                {/* Grand pot card */}
                <div style={{
                    background: "linear-gradient(135deg, #2D1B69, #1a0f3a)",
                    borderRadius: 24, padding: 24, marginBottom: 16,
                    border: "1px solid rgba(139,92,246,0.3)",
                    position: "relative", overflow: "hidden",
                }}>
                    <div style={{
                        position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(168,85,247,0.3), transparent)",
                    }} />
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Grand Pot 🏆</div>
                    <div style={{ fontSize: 42, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{formatCurrency(grandDraw.prize_pool || 0)}</div>
                    <div style={{ fontSize: 12, color: "#4ECDC4", marginTop: 4, fontWeight: 600 }}>{grandDraw.member_count || 0} members</div>
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
                        { label: "Your Entries", value: (user?.total_entries || 0).toLocaleString(), color: "#9B6FFF" },
                        { label: "Streak 🔥", value: `${streak?.current_streak || 0} draws`, color: "#EF4444" },
                        { label: "Your Odds", value: grandDraw.user_odds || "N/A", color: "#F59E0B" },
                        { label: "Deposited", value: formatCurrency(user?.balance || 0), color: "#4ECDC4" },
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
                        background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                        color: "#fff", fontSize: 14, fontWeight: 700,
                        boxShadow: "0 4px 20px rgba(139,92,246,0.4)",
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
                        background: "linear-gradient(135deg, #1a3a1a, #0f2a0f)",
                        borderRadius: 18, padding: 16, marginBottom: 16,
                        border: "1px solid rgba(78,205,196,0.3)",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                        <div>
                            <div style={{ fontSize: 12, color: "#4ECDC4", fontWeight: 700, marginBottom: 2 }}>Mini Draw · {Math.ceil((miniDraw.countdown_seconds || 0) / 86400)} days</div>
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
                    background: "#7C3AED", border: "none", color: "#fff",
                    fontSize: 12, fontWeight: 800, cursor: "pointer", padding: "8px 16px", borderRadius: 12,
                    boxShadow: "0 4px 15px rgba(124,58,237,0.4)"
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
                        background: method === m ? "rgba(139,92,246,0.3)" : "transparent",
                        color: method === m ? "#fff" : "rgba(255,255,255,0.5)",
                        fontWeight: 700, fontSize: 13, textTransform: "capitalize"
                    }}>
                        {m === "crypto" ? "💰 USDC Crypto" : "🏦 Bank (Fiat)"}
                    </button>
                ))}
            </div>

            <div style={{
                background: "linear-gradient(135deg, #1a1035, #2D1B69)",
                borderRadius: 24, padding: 24, marginBottom: 20,
                border: "1px solid rgba(139,92,246,0.2)",
            }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Your deposit</div>
                <div style={{ fontSize: 56, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff", textAlign: "center" }}>${deposit}</div>
                <input type="range" min={25} max={2000} step={25} value={deposit}
                    onChange={e => setDeposit(Number(e.target.value))}
                    style={{ width: "100%", marginTop: 16, accentColor: "#9B6FFF" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                    <span>$25</span><span>$2,000</span>
                </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {[50, 100, 250, 500].map(v => (
                    <button key={v} onClick={() => setDeposit(v)} style={{
                        flex: 1, padding: "10px 0", borderRadius: 12, border: `1px solid ${deposit === v ? "rgba(139,92,246,0.5)" : "transparent"}`, cursor: "pointer", fontSize: 13, fontWeight: 700,
                        background: deposit === v ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.06)",
                        color: deposit === v ? "#A855F7" : "rgba(255,255,255,0.4)",
                    }}>${v}</button>
                ))}
            </div>

            {method === "fiat" && bankLinked && (
                <div style={{ background: "rgba(78,205,196,0.1)", borderRadius: 16, padding: 14, marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ background: "#059669", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏦</div>
                    <div>
                        <div style={{ fontSize: 13, color: "#4ECDC4", fontWeight: 700 }}>Chase Checking</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Account ending in •••• 4209</div>
                    </div>
                </div>
            )}

            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 16, marginBottom: 20 }}>
                {[
                    { label: "Your entries this draw", value: `${Math.floor(deposit / 10)} tickets` },
                    { label: "Your odds (approx.)", value: `1 in ${Math.max(1, Math.floor(84201 / Math.max(1, deposit / 10))).toLocaleString()}` },
                ].map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{r.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#A855F7" }}>{r.value}</span>
                    </div>
                ))}
            </div>

            {result && !result.error && (
                <div style={{ background: "rgba(78,205,196,0.1)", border: "1px solid rgba(78,205,196,0.3)", borderRadius: 14, padding: 14, marginBottom: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#4ECDC4" }}>✅ {result.message}</div>
                </div>
            )}
            {result?.error && (
                <div style={{ background: "rgba(239,68,68,0.1)", borderRadius: 14, padding: 14, marginBottom: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 14, color: "#EF4444" }}>{result.error}</div>
                </div>
            )}

            <button className="btn-glow" onClick={handleActionClick} disabled={loading} style={{
                padding: "18px", borderRadius: 18, border: "none",
                background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                color: "#fff", fontSize: 16, fontWeight: 700,
                boxShadow: "0 8px 30px rgba(139,92,246,0.4)",
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
            background: "linear-gradient(160deg, #1a0533, #0D0A1A)", padding: 32, gap: 20,
        }}>
            {drawPhase === 0 && (
                <div style={{ textAlign: "center", animation: "slide-up 0.5s ease-out" }}>
                    <div style={{ fontSize: 14, color: "#9B6FFF", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>Grand Draw · Q1 2026</div>
                    <div style={{ fontSize: 80, marginBottom: 16, animation: "float 2s ease-in-out infinite" }}>🎰</div>
                    <div style={{ fontSize: 28, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff" }}>{formatCurrency(grandDraw.prize_pool || 0)}</div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>{grandDraw.member_count || 0} members · Drawing now</div>
                    <div style={{ marginTop: 24, display: "flex", gap: 6, justifyContent: "center" }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#9B6FFF", animation: `pulse-ring 1s ${i * 0.3}s ease-out infinite` }} />
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
                        <div style={{ height: "100%", background: "linear-gradient(90deg, #7C3AED, #A855F7, #FFD700)", animation: "shimmer 1s linear infinite", backgroundSize: "200% 100%" }} />
                    </div>
                </div>
            )}
            {drawPhase === 2 && (
                <div style={{ textAlign: "center", animation: "bounce-in 0.5s ease-out" }}>
                    <div style={{ fontSize: 14, color: "#EF4444", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>Almost there...</div>
                    <div style={{
                        width: 120, height: 120, borderRadius: "50%",
                        background: "linear-gradient(135deg, #7C3AED, #FFD700)",
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
                        background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                        color: "#fff", fontSize: 15, fontWeight: 700,
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
            <div style={{ background: "linear-gradient(135deg, #1a1035, #2D1B69)", borderRadius: 20, padding: 20, marginBottom: 16, border: "1px solid rgba(139,92,246,0.3)" }}>
                <div style={{ fontSize: 13, color: "#A855F7", fontWeight: 700, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>🎁 You Unlocked</div>
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
                    background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                    color: "#fff", fontSize: 15, fontWeight: 700,
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
            <div style={{ padding: "16px 20px 0", flex: 1, overflow: "auto" }}>
                <div style={{ fontSize: 24, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff", marginBottom: 4 }}>Community</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>Together in the pot</div>

                {/* Daily check-in */}
                <button className="btn-glow" onClick={handleCheckin} disabled={checkedIn} style={{
                    width: "100%", padding: "14px", borderRadius: 16, border: "1px solid rgba(78,205,196,0.3)",
                    background: checkedIn ? "rgba(78,205,196,0.15)" : "linear-gradient(135deg, #0f2a0f, #1a3a1a)",
                    color: checkedIn ? "#4ECDC4" : "#fff", fontSize: 14, fontWeight: 700,
                    marginBottom: 16, cursor: checkedIn ? "default" : "pointer",
                }}>{checkedIn ? "✅ Checked in today! +1 entry" : "📅 Daily Check-in (+1 bonus entry)"}</button>

                {/* Syndicate card */}
                {syndicate && (
                    <div style={{
                        background: "linear-gradient(135deg, #1a3a1a, #0f2a0f)",
                        borderRadius: 20, padding: 18, marginBottom: 16,
                        border: "1px solid rgba(78,205,196,0.3)",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                            <div>
                                <div style={{ fontSize: 12, color: "#4ECDC4", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Your Syndicate</div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginTop: 2 }}>{syndicate.name} {syndicate.emoji}</div>
                            </div>
                            <div style={{ background: "rgba(78,205,196,0.15)", padding: "4px 10px", borderRadius: 12, fontSize: 12, color: "#4ECDC4", fontWeight: 700 }}>{syndicate.member_count} members</div>
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
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                            <span style={{ color: "rgba(255,255,255,0.4)" }}>Combined entries</span>
                            <span style={{ color: "#4ECDC4", fontWeight: 700 }}>{syndicate.combined_entries?.toLocaleString()} tickets</span>
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
                        background: u.is_you ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.03)",
                        border: u.is_you ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
                    }}>
                        <span style={{ fontSize: 18, width: 24 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${u.rank}`}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: u.is_you ? "#A855F7" : "#fff" }}>{u.is_you ? "You" : u.name}</div>
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
   PROFILE SCREEN (Live Data)
============================================= */
function ProfileScreen({ go, user, streak, onLogout }) {
    const [balance, setBalance] = useState(null);

    useEffect(() => {
        api.getBalance().then(setBalance).catch(() => { });
    }, []);

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
            <div style={{ flex: 1, overflow: "auto", padding: "24px 20px 40px" }}>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: "50%", margin: "0 auto 12px",
                        background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
                        boxShadow: "0 0 30px rgba(139,92,246,0.4)",
                    }}>{user?.avatar_emoji || "😊"}</div>
                    <div style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff" }}>{user?.name}</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                        Member since {new Date(user?.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </div>
                    {streak?.current_streak > 0 && (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, padding: "4px 12px", borderRadius: 20, background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
                            <span style={{ fontSize: 12, color: "#A855F7", fontWeight: 700 }}>🔥 {streak.current_streak}-Draw Streak</span>
                        </div>
                    )}
                </div>

                {/* Stats grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
                    {[
                        { v: formatCurrency(user?.balance || 0), l: "Deposited" },
                        { v: (user?.total_entries || 0).toLocaleString(), l: "Entries" },
                        { v: `${streak?.multiplier || 1}×`, l: "Multiplier" },
                    ].map((s, i) => (
                        <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 12, textAlign: "center" }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: "#9B6FFF" }}>{s.v}</div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{s.l}</div>
                        </div>
                    ))}
                </div>

                {/* Streak progress */}
                {streak && streak.draws_to_next > 0 && (
                    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 16, marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
                            <span style={{ color: "rgba(255,255,255,0.4)" }}>Next multiplier: {streak.next_multiplier}×</span>
                            <span style={{ color: "#A855F7", fontWeight: 700 }}>{streak.draws_to_next} draws away</span>
                        </div>
                        <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{
                                height: "100%", borderRadius: 3,
                                background: "linear-gradient(90deg, #7C3AED, #A855F7)",
                                width: `${Math.min(100, ((streak.current_streak % (streak.next_multiplier === 1.5 ? 5 : streak.next_multiplier === 2 ? 10 : 20)) / (streak.draws_to_next + (streak.current_streak % 5))) * 100)}%`,
                            }} />
                        </div>
                    </div>
                )}

                {/* Transaction history */}
                {balance?.history?.length > 0 && (
                    <>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Recent Transactions</div>
                        {balance.history.slice(0, 5).map((tx, i) => (
                            <div key={i} style={{
                                display: "flex", justifyContent: "space-between", padding: "10px 12px",
                                background: "rgba(255,255,255,0.03)", borderRadius: 12, marginBottom: 6,
                            }}>
                                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                                    {tx.type === "deposit" ? "💰 Deposit" : "💸 Withdrawal"}
                                </span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: tx.type === "deposit" ? "#4ECDC4" : "#EF4444" }}>
                                    {tx.type === "deposit" ? "+" : "-"}${tx.amount}
                                </span>
                            </div>
                        ))}
                    </>
                )}

// Actions
                <div style={{ marginTop: 16 }}>
                    {[
                        { icon: "⬆️", label: "Add More to the Pot", sub: "More deposits = more entries", action: () => go("deposit") },
                        { icon: "🔗", label: "Refer a Friend", sub: "+50 entries per referral" },
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
                    cursor: "pointer", marginTop: 16,
                }}>Log Out</button>
            </div>
            <BottomNav screen="profile" go={go} />
        </div>
    );
}

/* =============================================
   SPLASH SCREEN (unchanged)
============================================= */
function SplashScreen() {
    return (
        <div style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(160deg, #1a0533 0%, #0D0A1A 100%)",
        }}>
            <div style={{ position: "relative", marginBottom: 24 }}>
                <div style={{
                    width: 100, height: 100, borderRadius: "50%",
                    background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 44, animation: "float 2s ease-in-out infinite",
                    boxShadow: "0 0 60px rgba(139,92,246,0.6)",
                }}>🎰</div>
                <div style={{
                    position: "absolute", inset: -20, borderRadius: "50%",
                    border: "2px solid rgba(139,92,246,0.3)",
                    animation: "pulse-ring 1.5s ease-out infinite",
                }} />
            </div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 42, fontWeight: 800, color: "#fff", letterSpacing: -1 }}>POTLUCK</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>Your money. Your lucky day.</div>
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
    const [user, setUser] = useState(null);
    const [draws, setDraws] = useState([]);
    const [streak, setStreak] = useState(null);
    const [drawPhase, setDrawPhase] = useState(0);
    const [winner, setWinner] = useState(null);
    const [particles, setParticles] = useState([]);
    const [step, setStep] = useState("");

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
            color: ["#FFD700", "#9B6FFF", "#FF6B9D", "#4ECDC4", "#FF8C42"][i % 5],
            size: 6 + Math.random() * 8,
        }));
        setParticles(pts);
        setTimeout(() => setParticles([]), 4000);
    };

    const go = (s) => {
        setScreen(s);
        if (s === "home") refreshData();
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
            background: "#0D0A1A", position: "relative", overflow: "hidden",
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
            {screen === "deposit" && <DepositScreen go={go} onDeposit={refreshData} />}
            {screen === "home" && <HomeScreen go={go} startDraw={startDraw} user={user} draws={draws} streak={streak} />}
            {screen === "draw" && <DrawScreen drawPhase={drawPhase} go={go} spawnParticles={spawnParticles} draws={draws} winner={winner} />}
            {screen === "result" && <ResultScreen go={go} user={user} streak={streak} />}
            {screen === "community" && <CommunityScreen go={go} user={user} />}
            {screen === "profile" && <ProfileScreen go={go} user={user} streak={streak} onLogout={handleLogout} />}
        </div>
    );
}
