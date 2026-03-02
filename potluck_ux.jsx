import { useState, useEffect, useRef } from "react";

const SCREENS = ["splash", "onboard1", "onboard2", "deposit", "home", "draw", "result", "community", "profile"];

const formatCurrency = (n) => "$" + n.toLocaleString();
const formatTime = (s) => {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  return `${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${sec.toString().padStart(2,"0")}`;
};

const WINNER = { name: "Sarah M.", city: "Austin, TX", amount: 47200, avatar: "🎉" };

const FEED = [
  { id:1, type:"win", text:"Maria K. from Chicago just won the Mini Draw!", time:"2m ago", emoji:"🏆" },
  { id:2, type:"near", text:"You were #3,412 out of 84,201 — your best yet!", time:"5m ago", emoji:"⚡" },
  { id:3, type:"pot", text:"The Grand Pot just crossed $2.4M", time:"12m ago", emoji:"💰" },
  { id:4, type:"streak", text:"James T. hit a 20-draw streak — 3x entries unlocked!", time:"1h ago", emoji:"🔥" },
  { id:5, type:"join", text:"1,204 new members joined today", time:"2h ago", emoji:"👥" },
];

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [deposit, setDeposit] = useState(200);
  const [drawActive, setDrawActive] = useState(false);
  const [drawPhase, setDrawPhase] = useState(0);
  const [countdown, setCountdown] = useState(7 * 86400 + 3 * 3600 + 22 * 60 + 14);
  const [particles, setParticles] = useState([]);
  const [ballPos, setBallPos] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (screen === "splash") {
      setTimeout(() => setScreen("onboard1"), 2000);
    }
  }, [screen]);

  useEffect(() => {
    if (screen === "home") {
      intervalRef.current = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [screen]);

  const startDraw = () => {
    setScreen("draw");
    setDrawPhase(0);
    setDrawActive(true);
    let phase = 0;
    const advance = () => {
      phase++;
      setDrawPhase(phase);
      if (phase < 4) setTimeout(advance, phase === 1 ? 2000 : phase === 2 ? 2500 : 1800);
      else { setScreen("result"); setDrawActive(false); spawnParticles(); }
    };
    setTimeout(advance, 1200);
  };

  const spawnParticles = () => {
    const pts = Array.from({length: 60}, (_, i) => ({
      id: i, x: Math.random()*100, delay: Math.random()*1.5,
      color: ["#FFD700","#9B6FFF","#FF6B9D","#4ECDC4","#FF8C42"][i%5],
      size: 6 + Math.random()*8
    }));
    setParticles(pts);
    setTimeout(() => setParticles([]), 4000);
  };

  const go = (s) => setScreen(s);

  const styles = {
    phone: {
      width: 390, height: 844,
      background: "#0D0A1A",
      borderRadius: 44,
      overflow: "hidden",
      position: "relative",
      boxShadow: "0 0 0 10px #1a1528, 0 0 0 12px #2a2040, 0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(139,92,246,0.15)",
      fontFamily: "'DM Sans', sans-serif",
      display: "flex", flexDirection: "column",
      flexShrink: 0,
    },
    statusBar: {
      height: 50, display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: "0 24px",
      fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)",
      flexShrink: 0,
    },
  };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #080612 0%, #110D26 50%, #0D0A1A 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }
        .btn-glow { transition: all 0.2s; }
        .btn-glow:hover { transform: scale(1.02); box-shadow: 0 0 30px rgba(139,92,246,0.5) !important; }
        .btn-glow:active { transform: scale(0.98); }
        .tab-btn { transition: all 0.2s; }
        .tab-btn:hover { opacity: 0.9; }
        .feed-item { transition: all 0.2s; }
        .feed-item:hover { transform: translateX(4px); }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulse-ring { 0%{transform:scale(0.8);opacity:1} 100%{transform:scale(2);opacity:0} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes confetti-fall { 0%{transform:translateY(-20px) rotate(0deg);opacity:1} 100%{transform:translateY(900px) rotate(720deg);opacity:0} }
        @keyframes draw-reveal { 0%{transform:scale(0.5) rotate(-10deg);opacity:0} 60%{transform:scale(1.1) rotate(2deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
        @keyframes number-count { 0%{transform:translateY(20px);opacity:0} 100%{transform:translateY(0);opacity:1} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes glow-pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
        @keyframes bounce-in { 0%{transform:scale(0)} 60%{transform:scale(1.15)} 100%{transform:scale(1)} }
        @keyframes slide-up { 0%{transform:translateY(30px);opacity:0} 100%{transform:translateY(0);opacity:1} }
        @keyframes ticker { 0%{transform:translateX(100%)} 100%{transform:translateX(-100%)} }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, letterSpacing: 4, color: "#9B6FFF", fontWeight: 700, marginBottom: 8, textTransform: "uppercase" }}>Interactive UX Flow</div>
          <div style={{ fontSize: 36, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff" }}>POTLUCK</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Prize-Linked Savings · Mobile App Prototype</div>
        </div>

        {/* Flow indicators */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "center", maxWidth: 600 }}>
          {[
            {id:"splash",label:"Splash"},
            {id:"onboard1",label:"Onboard"},
            {id:"deposit",label:"Deposit"},
            {id:"home",label:"Home"},
            {id:"draw",label:"Draw"},
            {id:"result",label:"Win!"},
            {id:"community",label:"Social"},
            {id:"profile",label:"Profile"},
          ].map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                className="tab-btn"
                onClick={() => go(s.id)}
                style={{
                  padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                  background: screen === s.id ? "linear-gradient(135deg, #7C3AED, #A855F7)" : "rgba(255,255,255,0.06)",
                  color: screen === s.id ? "#fff" : "rgba(255,255,255,0.5)",
                  boxShadow: screen === s.id ? "0 0 20px rgba(139,92,246,0.4)" : "none",
                }}
              >{s.label}</button>
              {i < 7 && <div style={{ width: 12, height: 1, background: "rgba(255,255,255,0.15)" }} />}
            </div>
          ))}
        </div>

        {/* Phone */}
        <div style={styles.phone}>
          {/* Particles */}
          {particles.map(p => (
            <div key={p.id} style={{
              position: "absolute", left: `${p.x}%`, top: -20, width: p.size, height: p.size,
              borderRadius: "50%", background: p.color, zIndex: 999,
              animation: `confetti-fall ${1.5 + Math.random()}s ${p.delay}s ease-in forwards`,
              pointerEvents: "none",
            }} />
          ))}

          {/* Status bar */}
          {screen !== "splash" && (
            <div style={styles.statusBar}>
              <span>9:41</span>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, color: "#9B6FFF", fontWeight: 800 }}>POTLUCK</span>
              <span>●●●</span>
            </div>
          )}

          {/* SPLASH */}
          {screen === "splash" && (
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
              <div style={{ marginTop: 40, display: "flex", gap: 6 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: i === 0 ? "#9B6FFF" : "rgba(255,255,255,0.2)",
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* ONBOARD 1 */}
          {screen === "onboard1" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 28px 40px", overflow: "hidden" }}>
              <div style={{
                flex: 1, borderRadius: 28, background: "linear-gradient(160deg, #2D1B69, #1a0f3a)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: 24, marginBottom: 24, position: "relative", overflow: "hidden",
              }}>
                <div style={{ fontSize: 64, marginBottom: 16, animation: "float 3s ease-in-out infinite" }}>🏦</div>
                <div style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff", textAlign: "center", marginBottom: 12 }}>
                  Safe money.<br/>Lucky you.
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 1.6 }}>
                  Deposit funds into an FDIC-insured account. Withdraw anytime. But your interest goes into a prize pool — and someone wins big every 90 days.
                </div>
                {/* floating pills */}
                <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,215,0,0.15)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 20, padding: "4px 10px", fontSize: 11, color: "#FFD700", fontWeight: 700 }}>FDIC Insured</div>
                <div style={{ position: "absolute", bottom: 16, left: 16, background: "rgba(78,205,196,0.15)", border: "1px solid rgba(78,205,196,0.3)", borderRadius: 20, padding: "4px 10px", fontSize: 11, color: "#4ECDC4", fontWeight: 700 }}>Withdraw anytime</div>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: i===0?24:8, height: 8, borderRadius: 4, background: i===0?"#9B6FFF":"rgba(255,255,255,0.15)" }} />)}
              </div>
              <button className="btn-glow" onClick={() => go("onboard2")} style={{
                padding: "18px", borderRadius: 18, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                color: "#fff", fontSize: 16, fontWeight: 700,
                boxShadow: "0 8px 30px rgba(139,92,246,0.4)",
              }}>Next →</button>
            </div>
          )}

          {/* ONBOARD 2 */}
          {screen === "onboard2" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 28px 40px" }}>
              <div style={{
                flex: 1, borderRadius: 28, background: "linear-gradient(160deg, #1a3a1a, #0a1a0a)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: 24, marginBottom: 24, position: "relative", overflow: "hidden",
              }}>
                <div style={{ fontSize: 64, marginBottom: 16, animation: "float 3s ease-in-out infinite" }}>🔥</div>
                <div style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff", textAlign: "center", marginBottom: 12 }}>
                  The longer you stay,<br/>the luckier you get.
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 1.6, marginBottom: 20 }}>
                  Every draw you don't win builds your streak — and multiplies your entries for next time.
                </div>
                {[
                  { streak: "1 draw", mult: "1×", color: "#9B6FFF" },
                  { streak: "5 draws", mult: "1.5×", color: "#F59E0B" },
                  { streak: "10 draws", mult: "2×", color: "#EF4444" },
                  { streak: "20+ draws", mult: "3×", color: "#FFD700" },
                ].map((s, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    width: "100%", padding: "8px 12px", borderRadius: 10,
                    background: "rgba(255,255,255,0.04)", marginBottom: 6,
                    border: `1px solid ${s.color}22`,
                  }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>🔥 {s.streak}</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.mult} entries</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: i===1?24:8, height: 8, borderRadius: 4, background: i===1?"#9B6FFF":"rgba(255,255,255,0.15)" }} />)}
              </div>
              <button className="btn-glow" onClick={() => go("deposit")} style={{
                padding: "18px", borderRadius: 18, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                color: "#fff", fontSize: 16, fontWeight: 700,
                boxShadow: "0 8px 30px rgba(139,92,246,0.4)",
              }}>Let's Go →</button>
            </div>
          )}

          {/* DEPOSIT */}
          {screen === "deposit" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 28px 40px", overflow: "auto" }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 26, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff" }}>Add to the pot</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Your principal is always yours to take back.</div>
              </div>
              <div style={{
                background: "linear-gradient(135deg, #1a1035, #2D1B69)",
                borderRadius: 24, padding: 24, marginBottom: 20,
                border: "1px solid rgba(139,92,246,0.2)",
              }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Your deposit</div>
                <div style={{ fontSize: 56, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff", textAlign: "center" }}>
                  ${deposit}
                </div>
                <input type="range" min={25} max={2000} step={25} value={deposit}
                  onChange={e => setDeposit(Number(e.target.value))}
                  style={{ width: "100%", marginTop: 16, accentColor: "#9B6FFF" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                  <span>$25</span><span>$2,000</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {[50, 100, 250, 500].map(v => (
                  <button key={v} onClick={() => setDeposit(v)} style={{
                    flex: 1, padding: "10px 0", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700,
                    background: deposit === v ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.06)",
                    color: deposit === v ? "#A855F7" : "rgba(255,255,255,0.4)",
                    border: `1px solid ${deposit === v ? "rgba(139,92,246,0.5)" : "transparent"}`,
                  }}>${v}</button>
                ))}
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 16, marginBottom: 20 }}>
                {[
                  { label: "Your entries this draw", value: `${Math.floor(deposit / 10).toLocaleString()} tickets` },
                  { label: "Your odds (approx.)", value: `1 in ${Math.floor(84201 / (deposit/10)).toLocaleString()}` },
                  { label: "Current pot", value: "$2,412,800" },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{r.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#A855F7" }}>{r.value}</span>
                  </div>
                ))}
              </div>
              <button className="btn-glow" onClick={() => go("home")} style={{
                padding: "18px", borderRadius: 18, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                color: "#fff", fontSize: 16, fontWeight: 700,
                boxShadow: "0 8px 30px rgba(139,92,246,0.4)",
              }}>Join the Pot 🎰</button>
            </div>
          )}

          {/* HOME */}
          {screen === "home" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
              {/* Ticker */}
              <div style={{ background: "rgba(139,92,246,0.1)", padding: "8px 0", overflow: "hidden", borderBottom: "1px solid rgba(139,92,246,0.2)" }}>
                <div style={{ animation: "ticker 12s linear infinite", whiteSpace: "nowrap", fontSize: 12, color: "#A855F7", fontWeight: 600 }}>
                  &nbsp;&nbsp;&nbsp;🏆 Maria K. won $28,400 in Chicago · 💰 Pot just crossed $2.4M · 🔥 4,201 members on 10+ draw streaks · ⚡ Next Mini Draw in 3 days &nbsp;&nbsp;&nbsp;
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
                  <div style={{ fontSize: 42, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff", lineHeight: 1 }}>$2,412,800</div>
                  <div style={{ fontSize: 12, color: "#4ECDC4", marginTop: 4, fontWeight: 600 }}>+$48,200 today</div>
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
                    { label: "Your Entries", value: "2,000", icon: "🎫", color: "#9B6FFF" },
                    { label: "Streak 🔥", value: "7 draws", icon: "🔥", color: "#EF4444" },
                    { label: "Your Odds", value: "1 in 42", icon: "⚡", color: "#F59E0B" },
                    { label: "Deposited", value: "$200", icon: "💰", color: "#4ECDC4" },
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
                    flex: 1, padding: "14px", borderRadius: 16, border: "none", cursor: "pointer",
                    background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                    color: "#fff", fontSize: 14, fontWeight: 700,
                    boxShadow: "0 4px 20px rgba(139,92,246,0.4)",
                  }}>Watch Live Draw ▶</button>
                  <button className="btn-glow" onClick={() => go("community")} style={{
                    padding: "14px 16px", borderRadius: 16, border: "none", cursor: "pointer",
                    background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", fontSize: 14,
                  }}>👥</button>
                  <button className="btn-glow" onClick={() => go("profile")} style={{
                    padding: "14px 16px", borderRadius: 16, border: "none", cursor: "pointer",
                    background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", fontSize: 14,
                  }}>👤</button>
                </div>

                {/* Mini draw */}
                <div style={{
                  background: "linear-gradient(135deg, #1a3a1a, #0f2a0f)",
                  borderRadius: 18, padding: 16, marginBottom: 16,
                  border: "1px solid rgba(78,205,196,0.3)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#4ECDC4", fontWeight: 700, marginBottom: 2 }}>Mini Draw · 3 days</div>
                    <div style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff" }}>$12,400</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>You have 800 entries</div>
                  </div>
                  <div style={{ fontSize: 32 }}>🎯</div>
                </div>
              </div>

              {/* Bottom nav */}
              <div style={{
                display: "flex", background: "rgba(13,10,26,0.95)", padding: "12px 20px 24px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
              }}>
                {[{icon:"🏠",label:"Home",active:true},{icon:"👥",label:"Social",s:"community"},{icon:"🎰",label:"Draw",s:"draw"},{icon:"👤",label:"Profile",s:"profile"}].map((t,i) => (
                  <button key={i} className="tab-btn" onClick={() => t.s && go(t.s)} style={{
                    flex: 1, background: "none", border: "none", cursor: "pointer", padding: 8,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  }}>
                    <span style={{ fontSize: 20 }}>{t.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: t.active ? "#9B6FFF" : "rgba(255,255,255,0.3)" }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DRAW */}
          {screen === "draw" && (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(160deg, #1a0533, #0D0A1A)",
              padding: 32, gap: 20,
            }}>
              {drawPhase === 0 && (
                <div style={{ textAlign: "center", animation: "slide-up 0.5s ease-out" }}>
                  <div style={{ fontSize: 14, color: "#9B6FFF", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>Grand Draw · Q1 2026</div>
                  <div style={{ fontSize: 80, marginBottom: 16, animation: "float 2s ease-in-out infinite" }}>🎰</div>
                  <div style={{ fontSize: 28, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff" }}>$2,412,800</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>84,201 members · Drawing now</div>
                  <div style={{ marginTop: 24, display: "flex", gap: 6, justifyContent: "center" }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{
                        width: 8, height: 8, borderRadius: "50%", background: "#9B6FFF",
                        animation: `pulse-ring 1s ${i*0.3}s ease-out infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
              {drawPhase === 1 && (
                <div style={{ textAlign: "center", animation: "slide-up 0.4s ease-out" }}>
                  <div style={{ fontSize: 14, color: "#F59E0B", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>Mixing the pot...</div>
                  <div style={{ fontSize: 72, animation: "spin-slow 1s linear infinite" }}>🌀</div>
                  <div style={{ marginTop: 20, fontSize: 16, color: "rgba(255,255,255,0.5)" }}>Selecting from 84,201 entries</div>
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
                    boxShadow: "0 0 60px rgba(255,215,0,0.5)",
                    animation: "float 0.8s ease-in-out infinite",
                  }}>❓</div>
                  <div style={{ fontSize: 20, color: "rgba(255,255,255,0.6)" }}>The winner is...</div>
                </div>
              )}
              {drawPhase >= 3 && (
                <div style={{ textAlign: "center", animation: "draw-reveal 0.6s cubic-bezier(.34,1.56,.64,1) both" }}>
                  <div style={{ fontSize: 13, color: "#FFD700", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>🏆 Winner Announced!</div>
                  <div style={{ fontSize: 64, marginBottom: 8 }}>🎉</div>
                  <div style={{ fontSize: 26, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff" }}>{WINNER.name}</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>{WINNER.city}</div>
                  <div style={{ fontSize: 52, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#FFD700", animation: "number-count 0.5s ease-out" }}>
                    {formatCurrency(WINNER.amount)}
                  </div>
                  <button className="btn-glow" onClick={() => { go("result"); spawnParticles(); }} style={{
                    marginTop: 24, padding: "14px 32px", borderRadius: 16, border: "none", cursor: "pointer",
                    background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                    color: "#fff", fontSize: 15, fontWeight: 700,
                  }}>See your results →</button>
                </div>
              )}
            </div>
          )}

          {/* RESULT (near miss) */}
          {screen === "result" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto", padding: "24px 24px 40px" }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 56, marginBottom: 8, animation: "bounce-in 0.4s ease-out" }}>⚡</div>
                <div style={{ fontSize: 24, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff" }}>So close!</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>You were #3,412 out of 84,201</div>
              </div>

              {/* Near miss bar */}
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
                  <span>Your position</span><span>#3,412 / 84,201</span>
                </div>
                <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "4%", background: "linear-gradient(90deg, #9B6FFF, #EF4444)", borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 11, color: "#9B6FFF", marginTop: 6, fontWeight: 600 }}>Top 4% — your best draw yet!</div>
              </div>

              {/* Rewards unlocked */}
              <div style={{ background: "linear-gradient(135deg, #1a1035, #2D1B69)", borderRadius: 20, padding: 20, marginBottom: 16, border: "1px solid rgba(139,92,246,0.3)" }}>
                <div style={{ fontSize: 13, color: "#A855F7", fontWeight: 700, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>🎁 You Unlocked</div>
                {[
                  { icon: "🔥", label: "Streak extended", value: "Now at 8 draws!" },
                  { icon: "🎫", label: "Bonus entries", value: "+200 for next draw" },
                  { icon: "⬆️", label: "Multiplier progress", value: "2 draws to 2× entries" },
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
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Your entries: 2,200 (streak bonus applied)</div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-glow" onClick={() => go("home")} style={{
                  flex: 1, padding: "16px", borderRadius: 16, border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                  color: "#fff", fontSize: 15, fontWeight: 700,
                }}>Back to Home</button>
                <button className="btn-glow" style={{
                  padding: "16px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer",
                  background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 14,
                }}>Share ↗</button>
              </div>
            </div>
          )}

          {/* COMMUNITY */}
          {screen === "community" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
              <div style={{ padding: "16px 20px 0" }}>
                <div style={{ fontSize: 24, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff", marginBottom: 4 }}>Community</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>84,201 members in the pot</div>

                {/* Syndicate card */}
                <div style={{
                  background: "linear-gradient(135deg, #1a3a1a, #0f2a0f)",
                  borderRadius: 20, padding: 18, marginBottom: 16,
                  border: "1px solid rgba(78,205,196,0.3)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#4ECDC4", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Your Syndicate</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginTop: 2 }}>Lucky 7s 🍀</div>
                    </div>
                    <div style={{ background: "rgba(78,205,196,0.15)", padding: "4px 10px", borderRadius: 12, fontSize: 12, color: "#4ECDC4", fontWeight: 700 }}>5 members</div>
                  </div>
                  <div style={{ display: "flex", gap: -8, marginBottom: 12 }}>
                    {["😀","🎯","🔥","⚡","🌟"].map((e, i) => (
                      <div key={i} style={{
                        width: 32, height: 32, borderRadius: "50%", fontSize: 16,
                        background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
                        marginLeft: i > 0 ? -8 : 0, border: "2px solid #0f2a0f",
                      }}>{e}</div>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>Combined entries</span>
                    <span style={{ color: "#4ECDC4", fontWeight: 700 }}>8,400 tickets</span>
                  </div>
                </div>

                {/* Leaderboard */}
                <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1, fontSize: 11 }}>🏆 Streak Leaders</div>
                {[
                  { name: "James T.", streak: 22, mult: "3×", medal: "🥇" },
                  { name: "Priya K.", streak: 18, mult: "3×", medal: "🥈" },
                  { name: "You", streak: 8, mult: "1.5×", medal: "🥉", you: true },
                  { name: "Marcus R.", streak: 6, mult: "1.5×", medal: "" },
                ].map((u, i) => (
                  <div key={i} className="feed-item" style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                    borderRadius: 14, marginBottom: 8,
                    background: u.you ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.03)",
                    border: u.you ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
                  }}>
                    <span style={{ fontSize: 18, width: 24 }}>{u.medal || `${i+1}`}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: u.you ? "#A855F7" : "#fff" }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>🔥 {u.streak} draw streak</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#FFD700" }}>{u.mult}</div>
                  </div>
                ))}

                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1, marginTop: 16 }}>Live Feed</div>
                {FEED.map(f => (
                  <div key={f.id} className="feed-item" style={{
                    display: "flex", gap: 10, padding: "10px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{f.emoji}</span>
                    <div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>{f.text}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{f.time}</div>
                    </div>
                  </div>
                ))}
                <div style={{ height: 20 }} />
              </div>

              {/* Bottom nav */}
              <div style={{
                display: "flex", background: "rgba(13,10,26,0.95)", padding: "12px 20px 24px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
              }}>
                {[{icon:"🏠",label:"Home",s:"home"},{icon:"👥",label:"Social",active:true},{icon:"🎰",label:"Draw",s:"draw"},{icon:"👤",label:"Profile",s:"profile"}].map((t,i) => (
                  <button key={i} className="tab-btn" onClick={() => t.s && go(t.s)} style={{
                    flex: 1, background: "none", border: "none", cursor: "pointer", padding: 8,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  }}>
                    <span style={{ fontSize: 20 }}>{t.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: t.active ? "#9B6FFF" : "rgba(255,255,255,0.3)" }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PROFILE */}
          {screen === "profile" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto", padding: "24px 20px 40px" }}>
              {/* Avatar */}
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: "50%", margin: "0 auto 12px",
                  background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
                  boxShadow: "0 0 30px rgba(139,92,246,0.4)",
                }}>😊</div>
                <div style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff" }}>Alex Rivera</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Member since Jan 2026</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, padding: "4px 12px", borderRadius: 20, background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
                  <span style={{ fontSize: 12, color: "#A855F7", fontWeight: 700 }}>🔥 8-Draw Streak</span>
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
                {[
                  { v: "$200", l: "Deposited" },
                  { v: "2,200", l: "Entries" },
                  { v: "1 in 38", l: "Odds" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#9B6FFF" }}>{s.v}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* Achievements */}
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Badges</div>
              <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                {[
                  { icon: "🌟", label: "Early Member", earned: true },
                  { icon: "🔥", label: "7-Day Streak", earned: true },
                  { icon: "👥", label: "Syndicate", earned: true },
                  { icon: "💰", label: "Top 5%", earned: false },
                  { icon: "🏆", label: "Winner", earned: false },
                ].map((b, i) => (
                  <div key={i} style={{
                    textAlign: "center", padding: "10px 12px", borderRadius: 14,
                    background: b.earned ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${b.earned ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.06)"}`,
                    opacity: b.earned ? 1 : 0.4, minWidth: 60,
                  }}>
                    <div style={{ fontSize: 24 }}>{b.icon}</div>
                    <div style={{ fontSize: 10, color: b.earned ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)", marginTop: 4 }}>{b.label}</div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              {[
                { icon: "💸", label: "Withdraw Principal", sub: "$200 available instantly" },
                { icon: "⬆️", label: "Increase Deposit", sub: "More deposits = more entries" },
                { icon: "🔗", label: "Refer a Friend", sub: "+50 entries per referral" },
              ].map((a, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                  background: "rgba(255,255,255,0.04)", borderRadius: 16, marginBottom: 10,
                  border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer",
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
          )}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", maxWidth: 500 }}>
          {[
            { color: "#9B6FFF", label: "Core screens" },
            { color: "#4ECDC4", label: "Social features" },
            { color: "#FFD700", label: "Draw moments" },
          ].map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
