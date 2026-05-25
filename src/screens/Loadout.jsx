import { useState, useEffect } from "react";
import { ref, set, onValue, get } from "firebase/database";
import { db } from "../firebase.js";
import { SPELLS } from "../data.js";
import { btnStyle, NavBar } from "../components/UI.jsx";

const TYPE_COLOR = {
  attack:  { bg: "rgba(200,80,60,0.15)",  border: "rgba(200,80,60,0.5)",  text: "#FF8866", label: "ATTACK"  },
  defense: { bg: "rgba(80,140,200,0.15)", border: "rgba(80,140,200,0.5)", text: "#88AADD", label: "DEFENSE" },
  heal:    { bg: "rgba(80,170,100,0.15)", border: "rgba(80,170,100,0.5)", text: "#77CC88", label: "HEAL"    },
};

function statLabel(sp) {
  if (sp.type === "attack")  return `${sp.baseDmg} DMG`;
  if (sp.type === "defense") return `${sp.baseShield} SHIELD`;
  return `${sp.baseHeal} HEAL`;
}

export default function Loadout({ loadout, toggleLoadout, onStartGame, onNav, mode, roomCode, playerRole }) {
  const [ready,         setReady]         = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);

  useEffect(() => {
    if (mode !== "vs" || !roomCode) return;
    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsub = onValue(roomRef, snap => {
      if (!snap.exists()) return;
      const room = snap.val();
      const opponent = playerRole === "host" ? room.guest : room.host;
      if (opponent) setOpponentReady(!!opponent.loadoutReady);
      if (room.status === "battle") { onNav("battle"); return; }
      // Reactively advance when both are ready (catches any order)
      if (room.host?.loadoutReady && room.guest?.loadoutReady) {
        set(ref(db, `rooms/${roomCode}/status`), "battle");
      }
    });
    return () => unsub();
  }, [mode, roomCode, playerRole]);

  const handleReady = async () => {
    if (mode !== "vs") { onStartGame(); return; }
    const playerPath = `rooms/${roomCode}/${playerRole}`;
    await set(ref(db, `${playerPath}/loadout`), loadout);
    await set(ref(db, `${playerPath}/loadoutReady`), true);
    setReady(true);
    // Either player advances once both are ready
    const snap = await get(ref(db, `rooms/${roomCode}`));
    const room = snap.val();
    if (room.host?.loadoutReady && room.guest?.loadoutReady) {
      await set(ref(db, `rooms/${roomCode}/status`), "battle");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top, #1E0A30 0%, #0D0916 40%, #1A1210 100%)",
      color: "#F5E6D3",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Cormorant Garamond, serif",
    }}>
      <NavBar onBack={() => onNav("characters")} title="Prepare Your Magic" />

      {/* ── Spell grid ── */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 48px 16px",
      }}>
        <p style={{
          fontFamily: "Cormorant Garamond", fontSize: "19px",
          color: "#8B7355", fontStyle: "italic", marginBottom: "24px",
          textAlign: "center",
        }}>
          Choose your spells wisely — each sigil demands precision.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          width: "100%",
          maxWidth: "860px",
        }}>
          {SPELLS.map((sp, i) => {
            const sel = loadout.includes(sp.id);
            const tc = TYPE_COLOR[sp.type];
            const canAdd = !sel && loadout.length >= 4;
            return (
              <div
                key={sp.id}
                onClick={() => !canAdd && toggleLoadout(sp.id)}
                style={{
                  borderRadius: "16px",
                  padding: "24px 16px",
                  cursor: canAdd ? "not-allowed" : "pointer",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                  background: sel ? tc.bg : "rgba(255,255,255,0.03)",
                  border: `2px solid ${sel ? tc.border : "rgba(201,169,110,0.08)"}`,
                  boxShadow: sel ? `0 0 24px ${tc.border}44` : "none",
                  opacity: canAdd ? 0.4 : 1,
                  transition: "all 0.25s",
                  animation: "fadeIn 0.35s ease both",
                  animationDelay: `${i * 0.07}s`,
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 64, height: 64,
                  borderRadius: "14px",
                  background: sel ? tc.border + "33" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${sel ? tc.border : "rgba(255,255,255,0.08)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "32px",
                }}>
                  {sp.icon}
                </div>

                {/* Name */}
                <div style={{ fontFamily: "Cinzel", fontSize: "15px", color: "#F5E6D3" }}>
                  {sp.name}
                </div>

                {/* Type badge */}
                <div style={{
                  fontFamily: "Cinzel", fontSize: "10px",
                  color: tc.text,
                  background: tc.bg,
                  border: `1px solid ${tc.border}`,
                  borderRadius: "4px",
                  padding: "2px 10px",
                  letterSpacing: "1px",
                }}>
                  {tc.label}
                </div>

                {/* Stat + stars */}
                <div style={{ fontFamily: "Cinzel", fontSize: "15px", color: tc.text }}>
                  {statLabel(sp)}
                </div>
                <div style={{ fontSize: "13px", letterSpacing: "1px" }}>
                  {"★".repeat(sp.difficulty)}
                  <span style={{ opacity: 0.2 }}>{"★".repeat(3 - sp.difficulty)}</span>
                </div>

                {sel && (
                  <div style={{ fontFamily: "Cinzel", fontSize: "10px", color: tc.text, letterSpacing: "2px" }}>
                    ✓ EQUIPPED
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom loadout bar ── */}
      <div style={{
        borderTop: "1px solid #2A1A40",
        background: "linear-gradient(to top, rgba(4,2,10,0.98), rgba(10,6,20,0.95))",
        padding: "16px 48px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
      }}>
        <div style={{ fontFamily: "Cinzel", fontSize: "11px", color: "#C9A96E", letterSpacing: "3px" }}>
          LOADOUT — {loadout.length} / 4
        </div>

        <div style={{
          display: "flex",
          gap: "12px",
          width: "100%",
          maxWidth: "860px",
          alignItems: "center",
        }}>
          {/* 4 slots */}
          {[0, 1, 2, 3].map(i => {
            const sp = SPELLS.find(s => s.id === loadout[i]);
            const tc = sp ? TYPE_COLOR[sp.type] : null;
            return (
              <div
                key={i}
                onClick={() => sp && toggleLoadout(sp.id)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  cursor: sp ? "pointer" : "default",
                  background: sp ? tc.bg : "transparent",
                  border: sp
                    ? `1px solid ${tc.border}`
                    : "1.5px dashed rgba(201,169,110,0.18)",
                  minHeight: 52,
                  transition: "all 0.25s",
                }}
              >
                {sp ? (
                  <>
                    <div style={{
                      width: 32, height: 32, flexShrink: 0,
                      borderRadius: "8px",
                      background: tc.border + "22",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "18px",
                    }}>
                      {sp.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "Cinzel", fontSize: "12px", color: "#F5E6D3" }}>
                        {sp.name}
                      </div>
                      <div style={{ fontFamily: "Cinzel", fontSize: "10px", color: tc.text, letterSpacing: "1px" }}>
                        {statLabel(sp)}
                      </div>
                    </div>
                    <div style={{ fontSize: "14px", color: "#4A2A1A", flexShrink: 0 }}>✕</div>
                  </>
                ) : (
                  <div style={{
                    fontFamily: "Cinzel", fontSize: "10px",
                    color: "rgba(201,169,110,0.22)",
                    letterSpacing: "2px",
                    width: "100%", textAlign: "center",
                  }}>
                    SLOT {i + 1}
                  </div>
                )}
              </div>
            );
          })}

          {/* Begin Battle / Ready button */}
          <button
            onClick={handleReady}
            disabled={loadout.length < 1 || (mode === "vs" && ready)}
            style={{
              ...btnStyle,
              flexShrink: 0,
              opacity: loadout.length < 1 || (mode === "vs" && ready) ? 0.35 : 1,
              padding: "14px 28px",
              fontSize: "14px",
              letterSpacing: "2px",
              whiteSpace: "nowrap",
            }}
          >
            {mode === "vs"
              ? ready
                ? opponentReady ? "Starting..." : "Ready ✓"
                : "⚔ Ready Up"
              : "⚔ Begin Battle"}
          </button>
        </div>

        <p style={{
          fontFamily: "Cormorant Garamond", fontSize: "14px",
          color: loadout.length >= 1 ? "#5A4A32" : "#3A2A1A",
          fontStyle: "italic", margin: 0,
        }}>
          {loadout.length < 1
            ? "Select at least one spell to continue"
            : "You are ready."}
        </p>
      </div>
    </div>
  );
}
