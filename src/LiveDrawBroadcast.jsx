import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONFIG (Defaults now handled as props in component) ──────────────────────────────────

// ─── PHASES ──────────────────────────────────────────────────
const P = { PRE: "pre", COUNTDOWN: "countdown", HASH: "hash", VERIFY: "verify", RESOLVE: "resolve", WINNER: "winner", REPLAY: "replay" };

// ─── FAKE BLOCK HASH (reveals char by char) ───────────────────
const SEED_HASH = "0x7f3a9b2c1e8d4f560a3c7b2e9f1d8a4c7b3e2f8a1d6c9e4b7a2f5e8d1c4b7a0f3e6";

// ─── LIVE CHAT FEED ───────────────────────────────────────────
const CHAT_POOL = [
  { u: "moon_hunter", m: "LFG LFG LFG 🚀", hype: 3 },
  { u: "defi_dan", m: "47 draw streak riding rn 🔥", hype: 2 },
  { u: "alpha_whale_99", m: "ALPHA WHALES IN THE CHAT 🐋", hype: 3 },
  { u: "crypto_sarah", m: "my heart is POUNDING", hype: 2 },
  { u: "savings_king", m: "principal is SAFU either way 🙏", hype: 1 },
  { u: "wagmi_wendy", m: "3.45M tickets let's gooo", hype: 2 },
  { u: "lucky_leo", m: "2.4 million dollar moment 👀", hype: 3 },
  { u: "zen_hodl", m: "on-chain proof = unbeatable", hype: 1 },
  { u: "potluck_fan", m: "AAAAAAAAAAAAAAAA", hype: 3 },
  { u: "defi_dreamer", m: "this is what banking should be", hype: 1 },
  { u: "syndicate_sam", m: "Alpha Whales 142 strong 💪", hype: 2 },
  { u: "moon_hunter", m: "HASH INCOMING 🔐", hype: 3 },
  { u: "crypto_sarah", m: "watching from Tokyo rn!!!", hype: 2 },
  { u: "nft_nick", m: "VERIFIABLE. TRUSTLESS. LFG.", hype: 2 },
  { u: "lucky_leo", m: "I CAN'T BREATHE", hype: 3 },
  { u: "hash_queen", m: "block 19,847,203 is THE one", hype: 2 },
  { u: "wagmi_wendy", m: "WINNER WINNER 🏆🏆🏆", hype: 3 },
  { u: "zen_hodl", m: "verify it yourself: chain.link/vrf", hype: 1 },
];

// ─── PARTICLES ────────────────────────────────────────────────
function Particles({ active }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active || !ref.current) return;
    const c = ref.current, ctx = c.getContext("2d");
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    const colors = ["#D4AF37", "#F0CC5A", "#fff", "#FFD700", "#FFF8DC", "#A08020"];
    let pts = Array.from({ length: 220 }, () => ({
      x: Math.random() * c.width, y: -20,
      vx: (Math.random() - .5) * 7, vy: Math.random() * 5 + 2,
      size: Math.random() * 10 + 3, color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360, rs: (Math.random() - .5) * 9,
      life: 1, decay: Math.random() * .006 + .002,
      shape: Math.random() > .5 ? "rect" : "circle"
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts = pts.filter(p => p.life > 0);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += .1; p.rot += p.rs; p.life -= p.decay;
        ctx.save(); ctx.globalAlpha = p.life; ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      });
      if (pts.length > 0) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [active]);
  if (!active) return null;
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 100 }} />;
}

// ─── BROADCAST CLOCK ─────────────────────────────────────────
function BroadcastClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  return <span style={{ fontFamily: "monospace", fontSize: 12, color: "#C8C0A8", letterSpacing: 2 }}>
    {t.toLocaleTimeString("en-US", { hour12: false })} UTC
  </span>;
}

// ─── VIEWER COUNTER ───────────────────────────────────────────
function Viewers() {
  const [v, setV] = useState(87_412);
  useEffect(() => { const i = setInterval(() => setV(c => c + Math.floor(Math.random() * 12) - 4), 1800); return () => clearInterval(i); }, []);
  return <span style={{ color: "#EF4444", fontFamily: "monospace", fontSize: 12, fontWeight: "bold" }}>{v.toLocaleString()}</span>;
}

// ─── HASH REVEAL ─────────────────────────────────────────────
function HashReveal({ active, onComplete }) {
  const [revealed, setRevealed] = useState(0);
  const [chunks, setChunks] = useState([]);

  useEffect(() => {
    if (!active) return;
    setRevealed(0);
    setChunks([]);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setRevealed(i);
      // Build chunks of 4 chars for display
      setChunks(SEED_HASH.slice(0, i * 2).match(/.{1,4}/g) || []);
      if (i * 2 >= SEED_HASH.length) {
        clearInterval(interval);
        setTimeout(() => onComplete?.(), 800);
      }
    }, 55);
    return () => clearInterval(interval);
  }, [active]);

  const pct = Math.min((revealed * 2) / SEED_HASH.length * 100, 100);

  return (
    <div style={{ fontFamily: "monospace" }}>
      <div style={{ fontSize: 9, letterSpacing: 4, color: "#6B6550", marginBottom: 8 }}>
        CHAINLINK VRF · BLOCK 19,847,203 · SEED HASH
      </div>
      <div style={{
        background: "#050508", border: "1px solid #1A1A2E", borderRadius: 10,
        padding: "16px 20px", marginBottom: 12, position: "relative", overflow: "hidden",
      }}>
        {/* Scan line */}
        {active && pct < 100 && (
          <div style={{
            position: "absolute", top: 0, bottom: 0,
            left: `${pct}%`, width: 2,
            background: "linear-gradient(180deg, transparent, #00FF41, transparent)",
            boxShadow: "0 0 12px #00FF41",
            transition: "left 0.05s linear",
          }} />
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 10px", lineHeight: 1.8 }}>
          {chunks.map((chunk, i) => (
            <span key={i} style={{
              color: i === chunks.length - 1 && pct < 100 ? "#00FF41" : "#22C55E",
              fontSize: 13, fontWeight: i === chunks.length - 1 ? "bold" : "normal",
              textShadow: i === chunks.length - 1 ? "0 0 8px #00FF41" : "none",
              transition: "all 0.1s",
            }}>{chunk}</span>
          ))}
          {pct < 100 && (
            <span style={{ color: "#00FF41", animation: "blink 0.5s infinite", fontSize: 13 }}>█</span>
          )}
        </div>
      </div>
      {/* Progress */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#6B6550", marginBottom: 6 }}>
        <span>HASH GENERATION {pct.toFixed(0)}%</span>
        <span style={{ color: pct >= 100 ? "#22C55E" : "#D4AF37" }}>{pct >= 100 ? "✓ COMPLETE" : "LIVE..."}</span>
      </div>
      <div style={{ background: "#0A0A0A", borderRadius: 99, height: 4, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: pct >= 100
            ? "linear-gradient(90deg, #22C55E, #00FF41)"
            : "linear-gradient(90deg, #1A4A2A, #22C55E)",
          transition: "width 0.05s linear",
          boxShadow: pct < 100 ? "0 0 8px #22C55E" : "none",
        }} />
      </div>
    </div>
  );
}

// ─── TICKET RESOLUTION ───────────────────────────────────────
function TicketResolution({ active, onComplete, totalTickets, winnerTicket, winnerHash }) {
  const [num, setNum] = useState(0);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!active) { setNum(0); setLocked(false); return; }
    let speed = 25, val = 0;
    const spin = () => {
      val = Math.floor(Math.random() * totalTickets);
      setNum(val);
      speed = Math.min(speed * 1.06, 800);
      if (speed < 800) { setTimeout(spin, speed); }
      else {
        // Final snap to winner
        setTimeout(() => { setNum(winnerTicket); setLocked(true); onComplete?.(); }, 400);
      }
    };
    setTimeout(spin, 200);
  }, [active]);

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 9, letterSpacing: 4, color: "#6B6550", marginBottom: 8, fontFamily: "monospace" }}>
        {locked ? "🔒  WINNING TICKET" : "⚡  RESOLVING HASH → TICKET INDEX"}
      </div>
      <div style={{
        background: locked ? "linear-gradient(135deg,#120D00,#1A1200)" : "#0A0A0A",
        border: `2px solid ${locked ? "#D4AF37" : "#1E1E22"}`,
        borderRadius: 16, padding: "20px 32px",
        boxShadow: locked ? "0 0 80px rgba(212,175,55,0.5), 0 0 160px rgba(212,175,55,0.2)" : "none",
        transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1)",
        position: "relative", overflow: "hidden",
      }}>
        {locked && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse,rgba(212,175,55,0.1),transparent 70%)", pointerEvents: "none" }} />}
        <div style={{
          fontSize: "clamp(36px,6vw,64px)", fontWeight: 900, fontFamily: "monospace",
          letterSpacing: 8, color: locked ? "#D4AF37" : "#fff",
          textShadow: locked ? "0 0 60px rgba(212,175,55,0.9)" : "none",
          transition: "color 0.4s, text-shadow 0.4s",
        }}>
          {String(num).padStart(7, "0")}
        </div>
        {!locked && (
          <div style={{ marginTop: 12, height: 2, background: "linear-gradient(90deg,transparent,#22C55E,transparent)", animation: "scanline 0.4s linear infinite" }} />
        )}
      </div>
      {locked && (
        <div style={{ marginTop: 16, fontFamily: "monospace" }}>
          <div style={{ fontSize: 11, color: "#D4AF37", letterSpacing: 2 }}>
            HASH MOD {totalTickets.toLocaleString()} = TICKET #{winnerTicket.toLocaleString()}
          </div>
          <div style={{ fontSize: 10, color: "#6B6550", marginTop: 4 }}>
            Verifiable at chain.link/vrf · tx: {winnerHash.slice(0, 20)}...
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STAT LOWER THIRD ─────────────────────────────────────────
function LowerThird({ label, value, sub, color = "#D4AF37", visible }) {
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      padding: "0 32px 24px",
      transform: visible ? "translateY(0)" : "translateY(120%)",
      transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
      pointerEvents: "none",
    }}>
      <div style={{
        display: "inline-flex", flexDirection: "column",
        background: "rgba(6,6,8,0.95)", backdropFilter: "blur(12px)",
        borderLeft: `4px solid ${color}`, padding: "12px 20px",
        borderRadius: "0 10px 10px 0",
      }}>
        <span style={{ fontSize: 9, letterSpacing: 3, color: "#6B6550", fontFamily: "monospace" }}>{label}</span>
        <span style={{ fontSize: 22, fontWeight: 900, color, fontFamily: "monospace", lineHeight: 1.2 }}>{value}</span>
        {sub && <span style={{ fontSize: 10, color: "#6B6550", fontFamily: "monospace", marginTop: 2 }}>{sub}</span>}
      </div>
    </div>
  );
}

// ─── MAIN BROADCAST ──────────────────────────────────────────
export default function LiveDrawBroadcast({
  potAmount = "$2,412,800",
  totalTickets = 3_450_000,
  totalMembers = 89_247,
  winnerHash = "0x7f3a9b2c1e8d4f560a3c7b2e9f1d8a4c7b3e2f8a",
  winnerTicket = 2_847_291,
  winnerWallet = "0x4a3F...9c2B",
  winnerName = "alpha_whale_99",
  winnerSyndicate = "Alpha Whales 🐋",
  winnerStreak = 47,
  onExit,
  onExecuteDraw
}) {
  const [phase, setPhase] = useState(P.PRE);
  const [countdown, setCountdown] = useState(10);
  const [chatMsgs, setChatMsgs] = useState([]);
  const [particles, setParticles] = useState(false);
  const [lowerThird, setLowerThird] = useState(null);
  const [hashDone, setHashDone] = useState(false);
  const [ticketDone, setTicketDone] = useState(false);
  const [replayPhase, setReplayPhase] = useState(0);
  const chatIdxRef = useRef(0);
  const chatRef = useRef(null);
  const timerRef = useRef(null);

  // Chat feed
  useEffect(() => {
    const delay = phase === P.HASH || phase === P.VERIFY ? 400 : 900;
    const i = setInterval(() => {
      const msg = CHAT_POOL[chatIdxRef.current % CHAT_POOL.length];
      chatIdxRef.current++;
      setChatMsgs(m => [...m.slice(-30), { ...msg, id: Date.now() }]);
    }, delay);
    return () => clearInterval(i);
  }, [phase]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: 9999, behavior: "smooth" });
  }, [chatMsgs]);

  // Phase auto-advance
  const advance = useCallback((toPhase) => {
    clearTimeout(timerRef.current);
    setPhase(toPhase);
  }, []);

  useEffect(() => {
    if (phase === P.COUNTDOWN) {
      setCountdown(10);
      let c = 10;

      // Execute the actual smart contract immediately when countdown begins
      if (onExecuteDraw) {
        onExecuteDraw().catch(e => console.error("Contract draw error", e));
      }

      const i = setInterval(() => {
        c--;
        setCountdown(c);
        if (c <= 0) { clearInterval(i); setTimeout(() => advance(P.HASH), 600); }
      }, 1000);
      return () => clearInterval(i);
    }
    if (phase === P.HASH) {
      setHashDone(false);
      // Show lower third after 2s
      timerRef.current = setTimeout(() => setLowerThird("block"), 2000);
    }
    if (phase === P.VERIFY) {
      setTicketDone(false);
      timerRef.current = setTimeout(() => setLowerThird("tickets"), 1000);
    }
    if (phase === P.WINNER) {
      setParticles(true);
      setLowerThird("winner");
      setTimeout(() => setParticles(false), 5000);
    }
    if (phase !== P.WINNER) setParticles(false);
    if (phase === P.REPLAY) {
      setReplayPhase(0);
      const stages = [P.HASH, P.VERIFY, P.RESOLVE, P.WINNER];
      let idx = 0;
      const next = () => {
        if (idx < stages.length) { setReplayPhase(idx); idx++; setTimeout(next, 2000); }
      };
      setTimeout(next, 500);
    }
  }, [phase, advance]);

  useEffect(() => {
    if (hashDone && phase === P.HASH) setTimeout(() => advance(P.VERIFY), 600);
  }, [hashDone, phase, advance]);

  useEffect(() => {
    if (ticketDone && phase === P.VERIFY) setTimeout(() => advance(P.RESOLVE), 400);
  }, [ticketDone, phase, advance]);

  useEffect(() => {
    if (phase === P.RESOLVE) setTimeout(() => advance(P.WINNER), 1800);
  }, [phase, advance]);

  const reset = () => {
    setPhase(P.PRE); setHashDone(false); setTicketDone(false);
    setLowerThird(null); setParticles(false); setChatMsgs([]); chatIdxRef.current = 0;
  };

  // ─── RENDER ────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", background: "#06060A", color: "#fff",
      display: "flex", flexDirection: "column", fontFamily: "monospace",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes scanline { from{background-position:-200px 0} to{background-position:200px 0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes countPop { 0%{transform:scale(1.6);opacity:0} 100%{transform:scale(1);opacity:1} }
        @keyframes winnerIn { 0%{opacity:0;transform:scale(0.8) translateY(30px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes goldPulse { 0%,100%{box-shadow:0 0 40px rgba(212,175,55,0.2)} 50%{box-shadow:0 0 100px rgba(212,175,55,0.6),0 0 200px rgba(212,175,55,0.2)} }
        @keyframes rgbShift { 0%{border-color:#EF4444} 33%{border-color:#D4AF37} 66%{border-color:#22C55E} 100%{border-color:#EF4444} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes tickerMove { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .ctrl-btn:hover { background: #1A1200 !important; border-color: #D4AF37 !important; color: #D4AF37 !important; }
        
        @media (max-width: 800px) {
          .layout-grid { display: flex !important; flex-direction: column !important; overflow-y: auto !important; }
          .main-stage { padding: 24px 16px !important; overflow-y: visible !important; min-height: auto !important; }
          .sidebar { border-left: none !important; border-top: 1px solid #1A1A20 !important; overflow-y: visible !important; flex-shrink: 0 !important; }
          .chat-panel { min-height: 280px !important; max-height: 400px !important; }
          .header-stats { display: none !important; }
          .mobile-stack { grid-template-columns: 1fr !important; }
          .winner-card { padding: 24px 20px !important; border-radius: 16px !important; }
        }
      `}</style>

      <Particles active={particles} />

      {/* ── BROADCAST HEADER BAR ── */}
      <div style={{
        background: "rgba(6,6,10,0.98)", borderBottom: "1px solid #1A1A20",
        padding: "10px 24px", display: "flex", alignItems: "center", gap: 20, flexShrink: 0,
      }}>
        {/* LIVE badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#8B0000", padding: "4px 12px", borderRadius: 4 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#EF4444", animation: "pulse 1s infinite" }} />
          <span style={{ fontSize: 11, fontWeight: "bold", letterSpacing: 3, color: "#fff" }}>LIVE</span>
        </div>

        {/* Show title */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: "bold", letterSpacing: 2, color: "#D4AF37" }}>
            POTLUCK GRAND DRAW · Q1 2026
          </div>
          <div style={{ fontSize: 10, color: "#6B6550", marginTop: 1 }}>
            On-Chain Verifiable · Powered by Chainlink VRF · Abstract L2
          </div>
        </div>

        {/* Stats */}
        <div className="header-stats" style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, color: "#6B6550", letterSpacing: 2 }}>WATCHING</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444", animation: "pulse 1s infinite" }} />
              <Viewers />
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, color: "#6B6550", letterSpacing: 2 }}>THE POT</div>
            <div style={{ fontSize: 13, fontWeight: "bold", color: "#D4AF37" }}>{potAmount}</div>
          </div>
          <BroadcastClock />
        </div>
      </div>

      {/* ── TICKER TAPE ── */}
      <div style={{ background: "#08080C", borderBottom: "1px solid #12121A", padding: "6px 0", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ display: "flex", animation: "tickerMove 20s linear infinite", whiteSpace: "nowrap" }}>
          {[...Array(2)].map((_, ri) => (
            <span key={ri}>
              {["🏆  GRAND DRAW LIVE", "💰  POT: " + potAmount, "🎟  " + totalTickets.toLocaleString() + " TOTAL TICKETS", "⚡  " + totalMembers.toLocaleString() + " MEMBERS", "🔐  CHAINLINK VRF VERIFIED", "🐋  ALPHA WHALES · 142 MEMBERS · $15,400 SYNDICATE POT", "📡  STREAMING LIVE · ABSTRACT L2"].map((t, i) => (
                <span key={i} style={{ fontSize: 10, color: "#D4AF37", padding: "0 28px", letterSpacing: 2, opacity: 0.8 }}>
                  {t} <span style={{ color: "#1A1A20" }}>  |  </span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── MAIN STAGE + SIDEBAR ── */}
      <div className="layout-grid" style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 300px", overflow: "hidden" }}>

        {/* ── MAIN STAGE ── */}
        <div className="main-stage" style={{ position: "relative", display: "flex", flexDirection: "column", padding: "32px 40px", gap: 28, overflowY: "auto" }}>

          {/* PRE-SHOW */}
          {phase === P.PRE && (
            <div style={{ animation: "fadeUp 0.5s ease both" }}>
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 10, letterSpacing: 5, color: "#6B6550", marginBottom: 20 }}>TONIGHT'S DRAW</div>
                <div style={{
                  fontSize: "clamp(48px,8vw,80px)", fontWeight: 900, lineHeight: 1,
                  background: "linear-gradient(135deg,#A08020,#F0CC5A,#D4AF37,#A08020)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  marginBottom: 8,
                }}>{potAmount}</div>
                <div style={{ fontSize: 13, color: "#6B6550", marginBottom: 32 }}>
                  {totalTickets.toLocaleString()} tickets · {totalMembers.toLocaleString()} members · provably fair
                </div>
                <div className="mobile-stack" style={{
                  display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12,
                  textAlign: "left", marginBottom: 40, width: "100%", maxWidth: 640, marginInline: "auto",
                }}>
                  {[
                    { label: "Draw Method", val: "Chainlink VRF", sub: "Verifiable Random Function" },
                    { label: "Block Number", val: "19,847,203", sub: "Abstract L2" },
                    { label: "Verification", val: "Public", sub: "Anyone can verify" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "#0E0E12", border: "1px solid #1E1E22", borderRadius: 10, padding: "14px 18px" }}>
                      <div style={{ fontSize: 9, letterSpacing: 2, color: "#6B6550", marginBottom: 6 }}>{s.label}</div>
                      <div style={{ fontSize: 14, fontWeight: "bold", color: "#D4AF37" }}>{s.val}</div>
                      <div style={{ fontSize: 10, color: "#6B6550", marginTop: 2 }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => advance(P.COUNTDOWN)} style={{
                  background: "#D4AF37", color: "#000", border: "none",
                  padding: "16px 40px", borderRadius: 12, fontSize: 14, fontWeight: "bold",
                  letterSpacing: 3, cursor: "pointer", fontFamily: "monospace",
                  boxShadow: "0 8px 32px rgba(212,175,55,0.4)", transition: "all 0.2s",
                }}>▶  START THE DRAW</button>
              </div>
            </div>
          )}

          {/* COUNTDOWN */}
          {phase === P.COUNTDOWN && (
            <div style={{ textAlign: "center", padding: "20px 0", animation: "fadeUp 0.4s ease both" }}>
              <div style={{ fontSize: 10, letterSpacing: 5, color: "#6B6550", marginBottom: 24 }}>DRAW BEGINS IN</div>
              <div key={countdown} style={{
                fontSize: "clamp(100px,18vw,160px)", fontWeight: 900, lineHeight: 1,
                color: countdown <= 3 ? "#EF4444" : "#D4AF37",
                textShadow: countdown <= 3 ? "0 0 60px rgba(239,68,68,0.8)" : "0 0 60px rgba(212,175,55,0.6)",
                animation: "countPop 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
                transition: "color 0.2s,text-shadow 0.2s",
              }}>{countdown}</div>
              {countdown <= 3 && (
                <div style={{ fontSize: 13, color: "#EF4444", letterSpacing: 4, marginTop: 16, animation: "pulse 0.5s infinite" }}>
                  REQUESTING RANDOMNESS...
                </div>
              )}
            </div>
          )}

          {/* HASH GENERATION */}
          {(phase === P.HASH || (phase === P.VERIFY && !ticketDone)) && (
            <div style={{ animation: "fadeUp 0.4s ease both" }}>
              <div style={{ fontSize: 11, letterSpacing: 4, color: "#22C55E", marginBottom: 8 }}>
                ◉  PHASE 1 — GENERATING VERIFIABLE RANDOM SEED
              </div>
              <div style={{ fontSize: 13, color: "#6B6550", marginBottom: 24, lineHeight: 1.7 }}>
                Chainlink VRF has been called on Abstract L2. A cryptographic seed is being generated
                from block data + oracle randomness. <span style={{ color: "#C8C0A8" }}>This hash determines the winner.
                  It cannot be predicted or manipulated — by anyone, including Potluck.</span>
              </div>
              <HashReveal active={phase === P.HASH} onComplete={() => setHashDone(true)} />
              {hashDone && (
                <div style={{ marginTop: 16, padding: "12px 16px", background: "#0A1A00", border: "1px solid #22C55E", borderRadius: 8, animation: "fadeUp 0.4s ease both" }}>
                  <span style={{ fontSize: 11, color: "#22C55E", letterSpacing: 2 }}>
                    ✓  SEED HASH CONFIRMED ON-CHAIN · TX: {winnerHash}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TICKET RESOLUTION */}
          {(phase === P.VERIFY || phase === P.RESOLVE) && (
            <div style={{ animation: "fadeUp 0.4s ease both" }}>
              <div style={{ fontSize: 11, letterSpacing: 4, color: "#D4AF37", marginBottom: 8 }}>
                ◉  PHASE 2 — RESOLVING HASH TO WINNING TICKET
              </div>
              <div style={{ fontSize: 13, color: "#6B6550", marginBottom: 24, lineHeight: 1.7 }}>
                The seed hash is being converted to a ticket index using modular arithmetic.
                <span style={{ color: "#C8C0A8" }}> hash mod {totalTickets.toLocaleString()} = winning ticket number.</span>
              </div>
              <TicketResolution active={phase === P.VERIFY || phase === P.RESOLVE} onComplete={() => setTicketDone(true)} totalTickets={totalTickets} winnerTicket={winnerTicket} winnerHash={winnerHash} />
            </div>
          )}

          {/* WINNER */}
          {phase === P.WINNER && (
            <div style={{ animation: "winnerIn 0.8s cubic-bezier(0.34,1.56,0.64,1) both" }}>
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 10, letterSpacing: 5, color: "#22C55E", marginBottom: 20 }}>🏆  WE HAVE A WINNER</div>

                {/* Winner card */}
                <div className="winner-card" style={{
                  background: "linear-gradient(135deg,#050F05,#0A1A0A)",
                  border: "2px solid #22C55E", borderRadius: 24,
                  padding: "40px 48px", marginBottom: 24,
                  boxShadow: "0 0 80px rgba(34,197,94,0.25),0 0 160px rgba(34,197,94,0.1)",
                  animation: "goldPulse 2s ease infinite",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 30%,rgba(34,197,94,0.08),transparent 60%)", pointerEvents: "none" }} />

                  <div style={{ fontSize: 9, letterSpacing: 4, color: "#22C55E", marginBottom: 10 }}>WALLET ADDRESS</div>
                  <div style={{ fontSize: 16, fontFamily: "monospace", color: "#fff", marginBottom: 20, letterSpacing: 2 }}>
                    {winnerHash}
                  </div>

                  <div className="mobile-stack" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
                    {[
                      { label: "Username", val: winnerName, c: "#fff" },
                      { label: "Syndicate", val: winnerSyndicate, c: "#22C55E" },
                      { label: "Winning Ticket", val: `#${winnerTicket.toLocaleString()}`, c: "#D4AF37" },
                      { label: "Draw Streak", val: `${winnerStreak} draws 🔥`, c: "#EF4444" },
                    ].map((s, i) => (
                      <div key={i} style={{ background: "rgba(0,0,0,0.4)", borderRadius: 10, padding: "14px 18px", textAlign: "left" }}>
                        <div style={{ fontSize: 9, color: "#6B6550", letterSpacing: 2, marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontSize: 16, fontWeight: "bold", color: s.c }}>{s.val}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    fontSize: "clamp(44px,7vw,72px)", fontWeight: 900,
                    background: "linear-gradient(135deg,#A08020,#F0CC5A,#D4AF37)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    marginBottom: 12,
                  }}>{potAmount}</div>
                  <div style={{ fontSize: 12, color: "#22C55E", letterSpacing: 2 }}>
                    TRANSFERRED TO WALLET · ON-CHAIN IN &lt;30 SECONDS
                  </div>
                </div>

                {/* Syndicate share */}
                <div style={{
                  background: "#0A1000", border: "1px solid #1E3A10", borderRadius: 14,
                  padding: "16px 24px", marginBottom: 20,
                }}>
                  <div style={{ fontSize: 9, letterSpacing: 3, color: "#22C55E", marginBottom: 6 }}>
                    SYNDICATE WINNER — ALPHA WHALES 🐋
                  </div>
                  <div style={{ fontSize: 13, color: "#C8C0A8" }}>
                    142 members share the <span style={{ color: "#D4AF37", fontWeight: "bold" }}>$15,400</span> syndicate prize pool.
                    Each member receives <span style={{ color: "#22C55E", fontWeight: "bold" }}>$108.45</span> automatically.
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  {[
                    { label: "📡 Verify On-Chain", bg: "#0A1A00", border: "#22C55E", color: "#22C55E" },
                    { label: "🐦 Share on X", bg: "#000A14", border: "#1DA1F2", color: "#1DA1F2" },
                    { label: "🔁 Watch Replay", bg: "#1A1200", border: "#D4AF37", color: "#D4AF37", action: () => advance(P.REPLAY) },
                    { label: "🚪 Exit Broadcast", bg: "#D4AF37", border: "#D4AF37", color: "#000", action: onExit },
                  ].map((b, i) => (
                    <button key={i} onClick={b.action} style={{
                      background: b.bg, border: `1px solid ${b.border}`, color: b.color,
                      padding: "10px 16px", borderRadius: 10, fontSize: 10, cursor: "pointer",
                      fontFamily: "monospace", letterSpacing: 1, transition: "all 0.2s", fontWeight: b.color === "#000" ? "bold" : "normal",
                    }}>{b.label}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* REPLAY MODE */}
          {phase === P.REPLAY && (
            <div style={{ animation: "fadeUp 0.4s ease both" }}>
              <div style={{ fontSize: 11, letterSpacing: 4, color: "#D4AF37", marginBottom: 20 }}>⏪  INSTANT REPLAY</div>
              {[
                { step: "01", label: "VRF Request", desc: "Chainlink oracle called on Abstract L2 at block 19,847,203", done: replayPhase >= 0, c: "#22C55E" },
                { step: "02", label: "Hash Generated", desc: SEED_HASH.slice(0, 32) + "...", done: replayPhase >= 1, c: "#22C55E" },
                { step: "03", label: "Hash Resolved", desc: `hash mod ${totalTickets.toLocaleString()} = ticket #${winnerTicket.toLocaleString()}`, done: replayPhase >= 2, c: "#D4AF37" },
                { step: "04", label: "Winner Confirmed", desc: `${winnerName} · wallet ${winnerWallet} · ${potAmount} transferred`, done: replayPhase >= 3, c: "#D4AF37" },
              ].map((s, i) => (
                <div key={i} style={{
                  display: "flex", gap: 16, padding: "18px 20px", marginBottom: 10,
                  background: s.done ? "#0A1200" : "#0A0A0A",
                  border: `1px solid ${s.done ? s.c : "#1E1E22"}`,
                  borderRadius: 10, transition: "all 0.5s",
                  opacity: s.done ? 1 : 0.4,
                }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.done ? s.c : "#6B6550", minWidth: 28 }}>{s.step}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: "bold", color: s.done ? "#fff" : "#6B6550", marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: "#6B6550", fontFamily: "monospace" }}>{s.desc}</div>
                  </div>
                  {s.done && <div style={{ marginLeft: "auto", color: s.c, fontSize: 16 }}>✓</div>}
                </div>
              ))}
              <button onClick={reset} style={{
                marginTop: 16, background: "transparent", border: "1px solid #D4AF37", color: "#D4AF37",
                padding: "12px 24px", borderRadius: 10, fontSize: 11, cursor: "pointer", fontFamily: "monospace", letterSpacing: 2,
              }}>↺ RESTART DEMO</button>
            </div>
          )}

          {/* Lower third overlay */}
          <LowerThird
            label="CURRENT BLOCK"
            value="19,847,203"
            sub="Abstract L2 · Chainlink VRF Active"
            color="#22C55E"
            visible={lowerThird === "block"}
          />
          <LowerThird
            label="TOTAL TICKETS IN DRAW"
            value={totalTickets.toLocaleString()}
            sub={`${totalMembers.toLocaleString()} members · ${winnerTicket.toLocaleString()} winning ticket`}
            color="#D4AF37"
            visible={lowerThird === "tickets"}
          />
          <LowerThird
            label="🏆  WINNER"
            value={winnerName}
            sub={`${winnerSyndicate} · Ticket #${winnerTicket.toLocaleString()} · ${potAmount}`}
            color="#22C55E"
            visible={lowerThird === "winner"}
          />
        </div>

        {/* ── SIDEBAR ── */}
        <div className="sidebar" style={{ borderLeft: "1px solid #12121A", display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Your stats */}
          <div style={{ padding: "16px 16px", borderBottom: "1px solid #12121A", flexShrink: 0 }}>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#6B6550", marginBottom: 8 }}>YOUR POSITION</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[
                { l: "Entries", v: "24,500", c: "#D4AF37" },
                { l: "Streak 🔥", v: "47 draws", c: "#EF4444" },
                { l: "Odds", v: "1 in 141", c: "#22C55E" },
                { l: "Multiplier", v: "3×", c: "#A855F7" },
              ].map((s, i) => (
                <div key={i} style={{ background: "#0E0E12", border: "1px solid #1A1A20", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 8, color: "#6B6550", letterSpacing: 1, marginBottom: 2 }}>{s.l}</div>
                  <div style={{ fontSize: 13, fontWeight: "bold", color: s.c }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Phase progress */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #12121A", flexShrink: 0 }}>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#6B6550", marginBottom: 8 }}>DRAW PROGRESS</div>
            {[
              { label: "VRF Request", done: [P.HASH, P.VERIFY, P.RESOLVE, P.WINNER, P.REPLAY].includes(phase) },
              { label: "Hash Generated", done: [P.VERIFY, P.RESOLVE, P.WINNER, P.REPLAY].includes(phase) },
              { label: "Ticket Resolved", done: [P.RESOLVE, P.WINNER, P.REPLAY].includes(phase) },
              { label: "Winner Confirmed", done: [P.WINNER, P.REPLAY].includes(phase) },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                  background: s.done ? "#22C55E" : "#1A1A20",
                  border: `1.5px solid ${s.done ? "#22C55E" : "#2A2A30"}`,
                  boxShadow: s.done ? "0 0 8px rgba(34,197,94,0.5)" : "none",
                  transition: "all 0.4s",
                }} />
                <span style={{ fontSize: 10, color: s.done ? "#C8C0A8" : "#6B6550", transition: "color 0.4s" }}>{s.label}</span>
                {s.done && <span style={{ fontSize: 9, color: "#22C55E", marginLeft: "auto" }}>✓</span>}
              </div>
            ))}
          </div>

          {/* Chat */}
          <div className="chat-panel" style={{ flex: 1, padding: "12px 16px", display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#6B6550", marginBottom: 8, flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444", display: "inline-block", animation: "pulse 1s infinite" }} />
              LIVE CHAT
            </div>
            <div ref={chatRef} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
              {chatMsgs.map((m, i) => (
                <div key={m.id || i} style={{ fontSize: 10, lineHeight: 1.4, animation: "fadeUp 0.3s ease" }}>
                  <span style={{ color: m.hype === 3 ? "#EF4444" : m.hype === 2 ? "#D4AF37" : "#6B6550" }}>{m.u}</span>
                  <span style={{ color: "#2A2A30" }}>: </span>
                  <span style={{ color: "#C8C0A8" }}>{m.m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Demo controls */}
          <div style={{ padding: "10px 14px", borderTop: "1px solid #12121A", flexShrink: 0 }}>
            <div style={{ fontSize: 8, letterSpacing: 3, color: "#6B6550", marginBottom: 6 }}>DEMO · JUMP TO PHASE</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {[
                [P.PRE, "Pre"],
                [P.COUNTDOWN, "Count"],
                [P.HASH, "Hash"],
                [P.VERIFY, "Verify"],
                [P.WINNER, "Winner 🏆"],
                [P.REPLAY, "Replay ⏪"],
              ].map(([ph, label]) => (
                <button key={ph} className="ctrl-btn" onClick={() => {
                  if (ph === P.WINNER) { setParticles(true); setTimeout(() => setParticles(false), 5000); }
                  if (ph === P.HASH) { setHashDone(false); }
                  if (ph === P.VERIFY) { setTicketDone(false); }
                  setLowerThird(ph === P.HASH ? "block" : ph === P.VERIFY ? "tickets" : ph === P.WINNER ? "winner" : null);
                  setPhase(ph);
                }} style={{
                  background: phase === ph ? "#1A1200" : "transparent",
                  border: `1px solid ${phase === ph ? "#D4AF37" : "#1A1A20"}`,
                  color: phase === ph ? "#D4AF37" : "#6B6550",
                  padding: "4px 6px", borderRadius: 4, fontSize: 8, cursor: "pointer",
                  fontFamily: "monospace", letterSpacing: 1, transition: "all 0.15s",
                }}>{label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
