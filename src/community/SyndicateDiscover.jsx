import React from 'react';

export default function SyndicateDiscover({ onBack, onJoin }) {
    return (
        <div style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <button onClick={onBack} style={{
                    background: "rgba(255,255,255,0.06)", border: "none", color: "#fff",
                    width: 36, height: 36, borderRadius: "50%", display: "flex",
                    alignItems: "center", justifyContent: "center", cursor: "pointer"
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>Join a Syndicate</div>
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 24 }}>
                Team up with friends to unlock exclusive bonus pools and multiply your entries.
            </div>

            {/* Top Public Syndicates Stub */}
            {[
                { name: "Diamond Hands", emoji: "💎", members: 84, needed: 16 },
                { name: "Whale Watchers", emoji: "🐋", members: 42, needed: 58 },
                { name: "Early Birds", emoji: "🌅", members: 95, needed: 5 },
            ].map((syn, i) => (
                <div key={i} style={{
                    background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 16, marginBottom: 12,
                    border: "1px solid rgba(255,255,255,0.06)"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 800 }}>{syn.name} {syn.emoji}</div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{syn.members}/100 members</div>
                        </div>
                        <button onClick={() => onJoin(syn)} style={{
                            background: "linear-gradient(135deg, #1f2937, #111827)",
                            border: "1px solid rgba(255,255,255,0.1)", color: "#fff",
                            padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer"
                        }}>Join +</button>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,213,79,0.7)", fontWeight: 600 }}>
                        {syn.needed} more needed to unlock a private pool!
                    </div>
                </div>
            ))}
        </div>
    );
}
