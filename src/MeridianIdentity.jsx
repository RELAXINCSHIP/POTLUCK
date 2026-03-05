export default function MeridianIdentity() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#060608",
      fontFamily: "'Georgia', serif",
      color: "#fff",
      padding: "48px 40px",
    }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-4deg); }
          50% { transform: translateY(-12px) rotate(-4deg); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 40px rgba(212,175,55,0.15); }
          50% { box-shadow: 0 0 80px rgba(212,175,55,0.35); }
        }
        .card-float {
          animation: float 5s ease-in-out infinite, glow 5s ease-in-out infinite;
        }
        .shimmer-text {
          background: linear-gradient(90deg, #A08020 0%, #F0CC5A 40%, #D4AF37 60%, #A08020 100%);
          background-size: 400px 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        .benefit-row:hover { background: rgba(212,175,55,0.06) !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 64 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 6, color: "#6B6550", marginBottom: 8, fontFamily: "Calibri, sans-serif" }}>POTLUCK · CARD DIVISION</div>
          <div style={{ fontSize: 48, fontWeight: "bold", letterSpacing: -1 }}>The <span className="shimmer-text">Meridian</span></div>
          <div style={{ fontSize: 14, color: "#6B6550", marginTop: 8, fontFamily: "Calibri, sans-serif", fontStyle: "italic" }}>Brand Identity System · 2026</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#6B6550", fontFamily: "Calibri, sans-serif" }}>BY INVITATION ONLY</div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#D4AF37", fontFamily: "Calibri, sans-serif", marginTop: 4 }}>MATTE BLACK METAL</div>
        </div>
      </div>

      {/* Main card + brand section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 56 }}>

        {/* Card visual */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0E0E12", borderRadius: 16, padding: "48px 32px", border: "1px solid #1E1E22" }}>
          <div className="card-float" style={{
            width: 340, height: 214,
            background: "linear-gradient(135deg, #0A0A0A 0%, #111111 50%, #0D0D0D 100%)",
            borderRadius: 16,
            border: "1px solid #222",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Top gold line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, #D4AF37, #F0CC5A, #D4AF37, transparent)" }} />
            {/* Bottom gold line */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, #D4AF37, #F0CC5A, #D4AF37, transparent)" }} />

            {/* Subtle texture overlay */}
            <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.008) 2px, rgba(255,255,255,0.008) 4px)", pointerEvents: "none" }} />

            {/* Chip */}
            <div style={{
              position: "absolute", top: 32, left: 28, width: 42, height: 32,
              background: "linear-gradient(135deg, #A08020, #D4AF37, #A08020)",
              borderRadius: 5, border: "0.5px solid #F0CC5A",
            }}>
              <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(0,0,0,0.3)" }} />
              <div style={{ position: "absolute", top: 0, bottom: 0, left: "33%", width: 1, background: "rgba(0,0,0,0.2)" }} />
              <div style={{ position: "absolute", top: 0, bottom: 0, left: "66%", width: 1, background: "rgba(0,0,0,0.2)" }} />
            </div>

            {/* Contactless */}
            <div style={{ position: "absolute", top: 36, right: 28, fontSize: 22, color: "#D4AF37", opacity: 0.7 }}>))))</div>

            {/* Card text */}
            <div style={{ position: "absolute", bottom: 56, left: 28, right: 28 }}>
              <div style={{ fontSize: 8, letterSpacing: 4, color: "#6B6550", marginBottom: 4, fontFamily: "Calibri, sans-serif" }}>POTLUCK</div>
              <div style={{ fontSize: 20, fontWeight: "bold", letterSpacing: 2, color: "#fff", marginBottom: 12 }}>THE MERIDIAN</div>
              <div style={{ fontSize: 13, letterSpacing: 3, color: "#888", fontFamily: "Calibri, sans-serif" }}>•••• •••• •••• 7291</div>
            </div>
            <div style={{ position: "absolute", bottom: 22, left: 28, right: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#6B6550", fontFamily: "Calibri, sans-serif" }}>KENNY ALDRIDGE</div>
              <div style={{ fontSize: 8, letterSpacing: 2, color: "#D4AF37", fontFamily: "Calibri, sans-serif" }}>GOLD MEMBER</div>
            </div>
          </div>

          <div style={{ marginTop: 32, textAlign: "center" }}>
            <div style={{ fontSize: 11, letterSpacing: 5, color: "#D4AF37", fontFamily: "Calibri, sans-serif", marginBottom: 8 }}>THE MERIDIAN</div>
            <div style={{ fontSize: 12, color: "#6B6550", fontFamily: "Calibri, sans-serif" }}>Titanium Core · Matte Black PVD Finish · 18g</div>
          </div>
        </div>

        {/* Brand system */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Name rationale */}
          <div style={{ background: "#0E0E12", borderRadius: 12, padding: 24, border: "1px solid #1E1E22" }}>
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#6B6550", marginBottom: 12, fontFamily: "Calibri, sans-serif" }}>NAME RATIONALE</div>
            <div style={{ fontSize: 22, color: "#D4AF37", marginBottom: 12 }}>The Meridian</div>
            <div style={{ fontSize: 13, color: "#C8C0A8", lineHeight: 1.7, fontFamily: "Calibri, sans-serif" }}>
              A meridian is the highest point — a peak, a turning point, a line that defines where you are. 
              It carries authority without explanation. It signals that the holder has arrived somewhere others haven't. 
              It pairs perfectly with Potluck's luck-meets-prosperity DNA without saying "lottery" out loud.
            </div>
          </div>

          {/* Tiers */}
          <div style={{ background: "#0E0E12", borderRadius: 12, padding: 24, border: "1px solid #1E1E22" }}>
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#6B6550", marginBottom: 16, fontFamily: "Calibri, sans-serif" }}>MEMBERSHIP TIERS</div>
            {[
              { name: "Gold", req: "Deposit $100+", color: "#D4AF37", entries: "1×", card: "Matte Black" },
              { name: "Platinum", req: "Deposit $1,000+", color: "#E8E8E8", entries: "2×", card: "Brushed Titanium" },
              { name: "Obsidian", req: "Invitation only", color: "#A855F7", entries: "3×", card: "Mirror Black" },
            ].map((t, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 0", borderBottom: i < 2 ? "1px solid #1E1E22" : "none"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 32, height: 20, borderRadius: 3, background: i === 0 ? "#1A1200" : i === 1 ? "#181818" : "#0D0010", border: `1px solid ${t.color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 16, height: 8, background: `linear-gradient(90deg, transparent, ${t.color}55, transparent)`, borderRadius: 2 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: "bold", color: t.color }}>{t.name}</div>
                    <div style={{ fontSize: 10, color: "#6B6550", fontFamily: "Calibri, sans-serif" }}>{t.req}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, color: t.color, fontFamily: "Calibri, sans-serif" }}>{t.entries} entries</div>
                  <div style={{ fontSize: 10, color: "#6B6550", fontFamily: "Calibri, sans-serif" }}>{t.card}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Color system */}
          <div style={{ background: "#0E0E12", borderRadius: 12, padding: 24, border: "1px solid #1E1E22" }}>
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#6B6550", marginBottom: 16, fontFamily: "Calibri, sans-serif" }}>BRAND PALETTE</div>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { name: "Obsidian", hex: "#060608", swatch: "#060608", border: "#1E1E22" },
                { name: "Meridian Gold", hex: "#D4AF37", swatch: "#D4AF37", border: "#D4AF37" },
                { name: "Gilt Light", hex: "#F0CC5A", swatch: "#F0CC5A", border: "#F0CC5A" },
                { name: "Smoke", hex: "#C8C0A8", swatch: "#C8C0A8", border: "#C8C0A8" },
                { name: "Vault", hex: "#6B6550", swatch: "#6B6550", border: "#6B6550" },
              ].map((c, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ width: "100%", aspectRatio: "1", borderRadius: 8, background: c.swatch, border: `1px solid ${c.border}`, marginBottom: 6 }} />
                  <div style={{ fontSize: 9, color: "#C8C0A8", fontFamily: "Calibri, sans-serif", lineHeight: 1.4 }}>{c.name}</div>
                  <div style={{ fontSize: 8, color: "#6B6550", fontFamily: "Calibri, sans-serif" }}>{c.hex}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits grid */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: "#6B6550", marginBottom: 24, fontFamily: "Calibri, sans-serif" }}>MERIDIAN GOLD BENEFITS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { icon: "✈", title: "Airport Lounges", sub: "1,300+ worldwide via Priority Pass", tag: "TRAVEL" },
            { icon: "🏨", title: "Hotel Status Match", sub: "Auto Marriott Gold + Hilton Diamond", tag: "LIFESTYLE" },
            { icon: "🍽", title: "Fine Dining Credit", sub: "$200/mo at partner restaurants", tag: "DINING" },
            { icon: "🚗", title: "Rental Car Coverage", sub: "Primary CDW on all rentals worldwide", tag: "PROTECTION" },
            { icon: "🛍", title: "Shopping Rewards", sub: "5× retail · 2× on everything else", tag: "REWARDS" },
            { icon: "🎰", title: "3× Draw Entries", sub: "Gold tier streak multiplier on all pots", tag: "POTLUCK" },
          ].map((b, i) => (
            <div className="benefit-row" key={i} style={{
              background: "#0E0E12", borderRadius: 10, padding: "18px 20px",
              border: "1px solid #1E1E22", display: "flex", gap: 14, alignItems: "flex-start",
              transition: "background 0.2s", cursor: "default",
            }}>
              <div style={{ fontSize: 22, marginTop: 2 }}>{b.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: "bold", color: "#fff" }}>{b.title}</div>
                  <div style={{ fontSize: 7.5, letterSpacing: 2, color: "#D4AF37", fontFamily: "Calibri, sans-serif", background: "#1A1200", border: "0.5px solid #D4AF37", borderRadius: 3, padding: "2px 5px" }}>{b.tag}</div>
                </div>
                <div style={{ fontSize: 11, color: "#6B6550", fontFamily: "Calibri, sans-serif", lineHeight: 1.4 }}>{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voice & messaging */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 48 }}>
        <div style={{ background: "#0E0E12", borderRadius: 12, padding: 28, border: "1px solid #1E1E22" }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: "#6B6550", marginBottom: 20, fontFamily: "Calibri, sans-serif" }}>BRAND VOICE</div>
          {[
            { label: "Tone", val: "Assured. Never boastful. The card doesn't need to explain itself." },
            { label: "Personality", val: "The quiet billionaire, not the Instagram flex. Power through restraint." },
            { label: "Avoid", val: "Words like 'luxury', 'exclusive', 'elite' — show don't tell." },
            { label: "Headline formula", val: '"The only card that gets more powerful the luckier you save."' },
          ].map((v, i) => (
            <div key={i} style={{ display: "flex", gap: 16, paddingBottom: 14, borderBottom: i < 3 ? "1px solid #1E1E22" : "none", marginBottom: i < 3 ? 14 : 0 }}>
              <div style={{ fontSize: 10, color: "#D4AF37", fontFamily: "Calibri, sans-serif", letterSpacing: 1, minWidth: 80, paddingTop: 1 }}>{v.label}</div>
              <div style={{ fontSize: 12, color: "#C8C0A8", fontFamily: "Calibri, sans-serif", lineHeight: 1.6, fontStyle: v.label === "Headline formula" ? "italic" : "normal" }}>{v.val}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#0E0E12", borderRadius: 12, padding: 28, border: "1px solid #1E1E22" }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: "#6B6550", marginBottom: 20, fontFamily: "Calibri, sans-serif" }}>PHYSICAL SPECS</div>
          {[
            { spec: "Material", val: "Titanium core, PVD matte black coating" },
            { spec: "Weight", val: "18g — substantial without being heavy" },
            { spec: "Finish", val: "Sandblasted matte — fingerprint resistant" },
            { spec: "Edges", val: "Micro-beveled, gold PVD highlight" },
            { spec: "Typography", val: "Laser-engraved, not embossed" },
            { spec: "Sound", val: "Satisfying clink on tap-to-pay" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, borderBottom: i < 5 ? "1px solid #1E1E22" : "none", marginBottom: i < 5 ? 12 : 0 }}>
              <div style={{ fontSize: 10, color: "#6B6550", fontFamily: "Calibri, sans-serif", letterSpacing: 1 }}>{s.spec}</div>
              <div style={{ fontSize: 12, color: "#C8C0A8", fontFamily: "Calibri, sans-serif", textAlign: "right", maxWidth: "60%" }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer taglines */}
      <div style={{ borderTop: "1px solid #1E1E22", paddingTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#D4AF37", fontFamily: "Calibri, sans-serif" }}>POTLUCK · THE MERIDIAN</div>
          <div style={{ fontSize: 12, color: "#6B6550", fontFamily: "Calibri, sans-serif", marginTop: 4, fontStyle: "italic" }}>
            "Save your way to a jackpot. Spend like you've already won."
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "#6B6550", fontFamily: "Calibri, sans-serif" }}>potluck.app</div>
          <div style={{ fontSize: 11, color: "#6B6550", fontFamily: "Calibri, sans-serif" }}>© 2026 Potluck · Confidential</div>
        </div>
      </div>
    </div>
  );
}
