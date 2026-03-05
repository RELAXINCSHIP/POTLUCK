import React from 'react';

export default function SyndicateDetails({ syndicate, onBack }) {
    if (!syndicate) return null;

    return (
        <div style={{ padding: "0" }}>
            {/* Header */}
            <div style={{
                padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(15,15,15,0.9)", position: "sticky", top: 0, zIndex: 10,
                backdropFilter: "blur(10px)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={onBack} style={{
                        background: "rgba(255,255,255,0.06)", border: "none", color: "#fff",
                        width: 36, height: 36, borderRadius: "50%", display: "flex",
                        alignItems: "center", justifyContent: "center", cursor: "pointer"
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <div>
                        <div style={{ fontSize: 12, color: "#81C784", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Syndicate Hub</div>
                        <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>{syndicate.name} {syndicate.emoji}</div>
                    </div>
                </div>
            </div>

            <div style={{ padding: "20px" }}>
                {/* Stats Block */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 14, textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#FFD54F" }}>{syndicate.member_count}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Members</div>
                    </div>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 14, textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#81C784" }}>{syndicate.combined_entries?.toLocaleString() || 8540}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Combined Entries</div>
                    </div>
                </div>

                {/* Private Pool Status */}
                <div style={{
                    background: syndicate.pool_unlocked ? "rgba(255,213,79,0.08)" : "rgba(255,255,255,0.03)",
                    border: syndicate.pool_unlocked ? "1px solid rgba(255,213,79,0.3)" : "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 16, padding: 16, marginBottom: 24
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>Exclusive Syndicate Pool</div>
                        {syndicate.pool_unlocked && <span style={{ fontSize: 12, color: "#FFD54F", fontWeight: 800 }}>🔓 Unlocked</span>}
                    </div>
                    {syndicate.pool_unlocked ? (
                        <>
                            <div style={{ fontSize: 28, fontWeight: 800, color: "#FFD54F", marginBottom: 4 }}>${syndicate.dedicated_pool_amount.toLocaleString()}</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Only {syndicate.member_count} members eligible for this pot.</div>
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
                                Unlock an exclusive prize pool when your syndicate reaches 100 members.
                            </div>
                            <div style={{ width: "100%", background: "rgba(255,255,255,0.1)", height: 6, borderRadius: 3 }}>
                                <div style={{ width: `${Math.min((syndicate.member_count / 100) * 100, 100)}% `, height: "100%", background: "#81C784", borderRadius: 3 }}></div>
                            </div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6, textAlign: "right" }}>
                                {100 - syndicate.member_count} members remaining
                            </div>
                        </>
                    )}
                </div>

                {/* Member Roster Placeholder */}
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: 12 }}>Roster</div>
                {syndicate.members?.map((m, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                            {m.avatar_emoji}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{m.name || `User ${i + 1}`}</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Joined {i === 0 ? "1 mo ago" : "recently"}</div>
                        </div>
                        {i === 0 && <span style={{ fontSize: 10, background: "rgba(255,213,79,0.15)", color: "#FFD54F", padding: "4px 8px", borderRadius: 8, fontWeight: 800 }}>FOUNDER</span>}
                    </div>
                )) || <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>No members found.</div>}
            </div>
        </div>
    );
}
