import React, { useState } from 'react';

export default function InteractiveFeed({ feed }) {
    const [reactions, setReactions] = useState({});

    const handleReact = (feedId, type) => {
        setReactions(prev => {
            const current = prev[feedId] || { active: null, count: 0 };
            if (current.active === type) {
                // Toggle off
                return { ...prev, [feedId]: { active: null, count: Math.max(0, current.count - 1) } };
            } else {
                // Switch or turn on
                return { ...prev, [feedId]: { active: type, count: current.active ? current.count : current.count + 1 } };
            }
        });
    };

    if (!feed || feed.length === 0) return <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>No activity yet.</div>;

    return (
        <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1, marginTop: 16 }}>Live Feed</div>
            {feed.map(f => {
                const rx = reactions[f.id] || { active: null, count: Math.floor(Math.random() * 5) }; // Start with random mock likes just for visual effect

                return (
                    <div key={f.id} className="feed-item" style={{
                        display: "flex", gap: 12, padding: "12px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        background: "rgba(255,255,255,0.02)", borderRadius: 16, marginBottom: 8
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.08)",
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0
                        }}>
                            {f.emoji}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, color: "#fff", lineHeight: 1.4, fontWeight: 500 }}>
                                {f.text}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{f.time_ago}</div>

                                {/* Reactions */}
                                <div style={{ display: "flex", gap: 6 }}>
                                    {(rx.count > 0 || rx.active) && (
                                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginRight: 4, display: "flex", alignItems: "center" }}>
                                            {rx.count}
                                        </span>
                                    )}
                                    <button onClick={() => handleReact(f.id, "fire")} style={{
                                        background: rx.active === "fire" ? "rgba(255,167,38,0.2)" : "rgba(255,255,255,0.06)",
                                        border: rx.active === "fire" ? "1px solid rgba(255,167,38,0.4)" : "1px solid transparent",
                                        borderRadius: 20, padding: "4px 8px", fontSize: 14, cursor: "pointer",
                                        transition: "all 0.1s ease",
                                    }}>🔥</button>
                                    <button onClick={() => handleReact(f.id, "party")} style={{
                                        background: rx.active === "party" ? "rgba(100,181,246,0.2)" : "rgba(255,255,255,0.06)",
                                        border: rx.active === "party" ? "1px solid rgba(100,181,246,0.4)" : "1px solid transparent",
                                        borderRadius: 20, padding: "4px 8px", fontSize: 14, cursor: "pointer",
                                        transition: "all 0.1s ease",
                                    }}>🎉</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
