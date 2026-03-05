import React, { useState, useEffect } from "react";
import * as api from "../api";
import SyndicateDiscover from "./SyndicateDiscover";
import SyndicateDetails from "./SyndicateDetails";
import InteractiveFeed from "./InteractiveFeed";
import CreateSyndicate from "./CreateSyndicate";

export default function CommunityScreen({ go, user, BottomNav }) {
    const [feed, setFeed] = useState([]);
    const [leaders, setLeaders] = useState([]);
    const [syndicates, setSyndicates] = useState([]);
    const [activeSyndicate, setActiveSyndicate] = useState(null);
    const [checkedIn, setCheckedIn] = useState(false);
    const [view, setView] = useState("home"); // "home", "discover", "details", "create"

    useEffect(() => {
        api.getFeed().then(setFeed).catch(() => { });
        api.getLeaderboard().then(setLeaders).catch(() => { });
        api.getMySyndicates().then(setSyndicates).catch(() => { });
    }, []);

    const handleCheckin = async () => {
        try {
            await api.dailyCheckin();
            setCheckedIn(true);
        } catch (err) {
            if (err.message.includes("Already")) setCheckedIn(true);
        }
    };

    if (view === "discover") {
        return (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
                <div style={{ flex: 1, overflow: "auto" }}>
                    <SyndicateDiscover onBack={() => setView("home")} onJoin={(syn) => {
                        setSyndicates(prev => [...prev, {
                            ...syn,
                            member_count: syn.members + 1,
                            members: [{ avatar_emoji: '😎' }, { avatar_emoji: '🥳' }, { avatar_emoji: '👽' }], // Override number with mock array
                            pool_unlocked: false,
                            combined_entries: 12450
                        }]);
                        setView("home");
                    }} />
                </div>
                <BottomNav screen="community" go={go} />
            </div>
        );
    }

    if (view === "details") {
        return (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
                <div style={{ flex: 1, overflow: "auto" }}>
                    <SyndicateDetails syndicate={activeSyndicate} onBack={() => setView("home")} />
                </div>
                <BottomNav screen="community" go={go} />
            </div>
        );
    }

    if (view === "create") {
        return (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
                <div style={{ flex: 1, overflow: "auto" }}>
                    <CreateSyndicate
                        onBack={() => setView("home")}
                        onCreate={(newSyndicate) => {
                            setSyndicates(prev => [...prev, newSyndicate]);
                            setActiveSyndicate(newSyndicate);
                            setView("details");
                        }}
                    />
                </div>
                <BottomNav screen="community" go={go} />
            </div>
        );
    }

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto", minHeight: 0 }}>
            <div style={{ padding: "8px 20px 0", flex: 1, overflow: "auto" }}>

                {/* Daily check-in */}
                <button className="btn-glow" onClick={handleCheckin} disabled={checkedIn} style={{
                    width: "100%", padding: "14px", borderRadius: 16, border: "1px solid rgba(129,199,132,0.3)",
                    background: checkedIn ? "rgba(129,199,132,0.15)" : "linear-gradient(135deg, #0f2a0f, #1a3a1a)",
                    color: checkedIn ? "#81C784" : "#fff", fontSize: 14, fontWeight: 700,
                    marginBottom: 16, cursor: checkedIn ? "default" : "pointer",
                }}>{checkedIn ? "✅ Checked in today! +1 entry" : "📅 Daily Check-in (+1 bonus entry)"}</button>

                {/* My Crew Section (Persistent Actions) */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1 }}>My Crew</div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => setView('discover')} style={{ background: "rgba(255,213,79,0.1)", color: "#FFD54F", border: "1px solid rgba(255,213,79,0.3)", padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Find Crew</button>
                        <button onClick={() => setView('create')} style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Create</button>
                    </div>
                </div>

                {/* Empty State */}
                {syndicates.length === 0 && (
                    <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 20, marginBottom: 16, textAlign: "center", border: "1px dashed rgba(255,255,255,0.1)" }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
                        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>You aren't in a syndicate yet.</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Join a crew to multiply your entries and unlock exclusive private prize pools.</div>
                    </div>
                )}

                {/* Syndicate List */}
                {syndicates.map(syn => (
                    <div key={syn.id} onClick={() => { setActiveSyndicate(syn); setView('details'); }} style={{
                        background: "linear-gradient(135deg, rgba(129,199,132,0.08), rgba(30,30,30,0.6))",
                        borderRadius: 20, padding: 18, marginBottom: 16, cursor: "pointer",
                        border: "1px solid rgba(129,199,132,0.3)", position: 'relative', overflow: 'hidden',
                        transition: "transform 0.1s ease",
                    }} onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"} onMouseUp={e => e.currentTarget.style.transform = "scale(1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                        {syn.pool_unlocked && (
                            <div style={{
                                position: 'absolute', top: 0, right: 0, background: '#FFD54F',
                                color: '#000', fontSize: 10, fontWeight: 800, padding: '4px 12px',
                                borderBottomLeftRadius: 12, textTransform: 'uppercase', letterSpacing: 1
                            }}>🔥 Private Pool Unlocked</div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, marginTop: syn.pool_unlocked ? 12 : 0 }}>
                            <div>
                                <div style={{ fontSize: 12, color: "#81C784", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Syndicate</div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginTop: 2 }}>{syn.name} {syn.emoji}</div>
                            </div>
                            <div style={{ background: "rgba(129,199,132,0.15)", padding: "4px 10px", borderRadius: 12, fontSize: 12, color: "#81C784", fontWeight: 700 }}>
                                {syn.member_count} members
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: -8, marginBottom: 12 }}>
                            {syn.members?.map((m, i) => (
                                <div key={i} style={{
                                    width: 32, height: 32, borderRadius: "50%", fontSize: 16,
                                    background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
                                    marginLeft: i > 0 ? -8 : 0, border: "2px solid #0f2a0f",
                                }}>{m.avatar_emoji}</div>
                            ))}
                        </div>

                        {syn.pool_unlocked ? (
                            <div style={{
                                background: 'rgba(255,213,79,0.05)', borderRadius: 12, padding: 12,
                                border: '1px dashed rgba(255,213,79,0.2)', marginBottom: 12
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 600 }}>Dedicated Syndicate Pool</span>
                                    <span style={{ fontSize: 11, color: '#FFD54F', fontWeight: 700 }}>Draw in {syn.time_to_draw}</span>
                                </div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#FFD54F' }}>
                                    ${syn.dedicated_pool_amount?.toLocaleString() || 0}
                                </div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                                    Only members of {syn.name} are eligible to win this pot. (100+ members required)
                                </div>
                            </div>
                        ) : (
                            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 12, marginBottom: 12 }}>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
                                    Reach <strong style={{ color: '#fff' }}>100 members</strong> to unlock a dedicated prize pool just for your syndicate!
                                </div>
                                <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                    <div style={{ width: `${Math.min(((syn.member_count || 0) / 100) * 100, 100)}% `, height: '100%', background: '#81C784', borderRadius: 2 }}></div>
                                </div>
                            </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                            <span style={{ color: "rgba(255,255,255,0.4)" }}>Combined Grand Draw entries</span>
                            <span style={{ color: "#81C784", fontWeight: 700 }}>{syn.combined_entries?.toLocaleString()} tickets</span>
                        </div>
                    </div>
                ))}

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
                        <span style={{ fontSize: 18, width: 24 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${u.rank} `}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: u.is_you ? "#FFD54F" : "#fff" }}>{u.is_you ? "You" : u.name}</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>🔥 {u.current_streak} draw streak</div>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#FFD700" }}>{u.multiplier_label}</div>
                    </div>
                ))}

                {/* Live Feed */}
                <InteractiveFeed feed={feed} />

                <div style={{ height: 20 }} />
            </div>
            <BottomNav screen="community" go={go} />
        </div>
    );
}
