import React, { useState, useEffect } from 'react';

const PlaidLinkButton = ({ userId, onSuccess, onExit, style }) => {
    const [showPlaid, setShowPlaid] = useState(false);
    const [plaidStep, setPlaidStep] = useState(0);
    const [selectedBank, setSelectedBank] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (showPlaid && plaidStep === 2) {
            const timer = setTimeout(() => setPlaidStep(3), 2000);
            return () => clearTimeout(timer);
        }
    }, [showPlaid, plaidStep]);

    const handleSuccess = () => {
        setShowPlaid(false);
        localStorage.setItem("mock_bank_linked", "true");
        if (onSuccess) {
            onSuccess({
                institution: { name: selectedBank }
            });
        }
    };

    const handleClose = () => {
        setShowPlaid(false);
        if (onExit) onExit();
    };

    return (
        <div style={{ position: 'relative', width: '100%', ...style }}>
            <button
                onClick={() => {
                    setShowPlaid(true);
                    setPlaidStep(0);
                }}
                disabled={loading}
                style={{
                    width: '100%', padding: '14px 20px', borderRadius: 14,
                    background: loading
                        ? 'rgba(255,255,255,0.04)'
                        : 'linear-gradient(135deg, #FFD54F, #FFB300)',
                    border: loading
                        ? '1px solid rgba(255,255,255,0.08)'
                        : 'none',
                    color: loading ? 'rgba(255,255,255,0.3)' : '#000',
                    fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    boxShadow: loading ? 'none' : '0 4px 20px rgba(255,213,79,0.3)',
                    transition: 'all 0.3s ease',
                }}
            >
                {loading ? (
                    <>
                        <span style={{ animation: 'pulse-ring 1s ease infinite' }}>⏳</span>
                        Connecting to Plaid...
                    </>
                ) : (
                    <>
                        <span style={{ fontSize: 18 }}>🏦</span>
                        Link Bank Account
                    </>
                )}
            </button>

            {/* Plaid Mock Overlay (Portalled or absolute-fixed inside root usually works, using fixed here) */}
            {showPlaid && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 99999, padding: 20
                }}>
                    <div style={{
                        background: "#fff", width: "100%", maxWidth: 400, borderRadius: 24, padding: 24,
                        color: "#111", fontFamily: "sans-serif", position: "relative"
                    }}>
                        <button onClick={handleClose} style={{
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
                                <input type="text" placeholder="User ID" style={{ padding: 14, borderRadius: 12, border: "1px solid #e0e0e0", fontSize: 16 }} />
                                <input type="password" placeholder="Password" style={{ padding: 14, borderRadius: 12, border: "1px solid #e0e0e0", fontSize: 16 }} />
                                <button onClick={() => setPlaidStep(2)} style={{
                                    padding: 16, borderRadius: 12, border: "none", background: "#111", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 8
                                }}>Submit credentials</button>
                            </div>
                        )}

                        {plaidStep === 2 && (
                            <div style={{ textAlign: "center", padding: "20px 0" }}>
                                <div style={{ fontSize: 40, marginBottom: 16, animation: "spin 2s linear infinite" }}>⏳</div>
                                <div style={{ fontSize: 18, fontWeight: 700 }}>Authenticating & linking...</div>
                            </div>
                        )}

                        {plaidStep === 3 && (
                            <div style={{ textAlign: "center", padding: "20px 0" }}>
                                <div style={{ fontSize: 48, marginBottom: 16, color: "#059669" }}>✅</div>
                                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Bank Linked!</div>
                                <div style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>Your {selectedBank} account ending in 4209 is ready.</div>
                                <button onClick={handleSuccess} style={{
                                    width: "100%", padding: 16, borderRadius: 12, border: "none", background: "#111", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer"
                                }}>Continue</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlaidLinkButton;
