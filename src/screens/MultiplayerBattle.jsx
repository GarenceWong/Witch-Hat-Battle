import { useState, useRef, useEffect } from "react";
import { ref, set, get, onValue, update } from "firebase/database";
import { db } from "../firebase.js";
import { CHARACTERS, SPELLS } from "../data.js";
import SigilCanvas from "../components/SigilCanvas.jsx";
import cocoImg   from "../assets/coco.png";
import agottImg  from "../assets/agott.png";
import tetiaImg  from "../assets/tetia.png";
import richehImg from "../assets/richeh.png";
import BattleBackground from "../components/BattleBackground.jsx";

const CHAR_IMAGES = { coco: cocoImg, agott: agottImg, tetia: tetiaImg, richeh: richehImg };

// ── Floating damage number ────────────────────────────────────────────────────
function DmgFloat({ value, type }) {
  const map = {
    dmg:      { color: "#FF5544", prefix: "−" },
    heal:     { color: "#55DD77", prefix: "+" },
    shield:   { color: "#55AADD", prefix: "🛡 " },
    backfire: { color: "#FF8800", prefix: "💥 " },
  };
  const s = map[type] || map.dmg;
  return (
    <div style={{
      position: "absolute", top: "8%", left: "50%",
      transform: "translateX(-50%)",
      fontFamily: "Cinzel", fontSize: "26px", fontWeight: "bold",
      color: s.color, textShadow: `0 0 12px ${s.color}`,
      animation: "floatDmg 1.1s ease forwards",
      pointerEvents: "none", zIndex: 20, whiteSpace: "nowrap",
    }}>
      {s.prefix}{value}
    </div>
  );
}

// ── HP card ───────────────────────────────────────────────────────────────────
function HPCard({ name, hp, maxHP, shield, color, dmg, isShaking, style: sx }) {
  const pct   = Math.max(0, (hp / maxHP) * 100);
  const lowHP = pct < 30;
  return (
    <div style={{
      background: "rgba(6,3,14,0.82)",
      border: `1px solid ${color}40`,
      borderRadius: "14px", padding: "14px 20px",
      minWidth: 220, position: "relative",
      backdropFilter: "blur(6px)",
      animation: isShaking ? "shake 0.45s ease" : "none",
      ...sx,
    }}>
      {dmg && <DmgFloat key={dmg.key} value={dmg.value} type={dmg.type} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
        <div style={{ fontFamily: "Cinzel", fontSize: "15px", color: "#F5E6D3" }}>{name}</div>
        <div style={{ fontFamily: "Cinzel", fontSize: "12px", color: lowHP ? "#CC4444" : "#6B5A3E" }}>
          {Math.max(0, hp)} / {maxHP}
        </div>
      </div>
      <div style={{ height: "11px", background: "rgba(0,0,0,0.55)", borderRadius: "6px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: "6px",
          transition: "width 0.65s ease",
          background: lowHP ? "linear-gradient(90deg,#6B1414,#CC2222)" : `linear-gradient(90deg,${color}88,${color})`,
          boxShadow: !lowHP ? `0 0 8px ${color}55` : "none",
        }} />
      </div>
      {shield > 0 && (
        <div style={{ fontFamily: "Cinzel", fontSize: "11px", color: "#88CCDD", marginTop: "7px" }}>🛡 {shield}</div>
      )}
    </div>
  );
}

// ── Spell button ──────────────────────────────────────────────────────────────
function SpellBtn({ spell, onClick }) {
  const tc = {
    attack:  { bg: "rgba(200,80,60,0.15)",  border: "rgba(200,80,60,0.45)"  },
    defense: { bg: "rgba(80,140,200,0.15)", border: "rgba(80,140,200,0.45)" },
    heal:    { bg: "rgba(80,170,100,0.15)", border: "rgba(80,170,100,0.45)" },
  }[spell.type];
  return (
    <button onClick={onClick} style={{
      background: tc.bg, border: `1px solid ${tc.border}`,
      borderRadius: "12px", padding: "14px 8px", cursor: "pointer",
      display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
      transition: "transform 0.15s, box-shadow 0.15s", width: "100%",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 6px 18px ${tc.border}`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <span style={{ fontSize: "34px" }}>{spell.icon}</span>
      <span style={{ fontFamily: "Cinzel", fontSize: "13px", color: "#D4C4A8", letterSpacing: "0.5px" }}>
        {spell.name.split(" ")[0]}
      </span>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MultiplayerBattle({ selectedChar, loadout, roomCode, playerRole, setResult, onNav }) {
  const ch = CHARACTERS.find(c => c.id === selectedChar);

  const [selectedSpell,   setSelectedSpell]   = useState(null);
  const [castingPhase,    setCastingPhase]    = useState(false);
  const [myCastSubmitted, setMyCastSubmitted] = useState(false);
  const [showExit,        setShowExit]        = useState(false);
  const [myDmg,           setMyDmg]           = useState(null);
  const [oppDmg,          setOppDmg]          = useState(null);
  const [myShaking,       setMyShaking]       = useState(false);
  const [oppShaking,      setOppShaking]      = useState(false);
  const [battle,          setBattle]          = useState(null);
  const [oppCharId,       setOppCharId]       = useState(null);

  const prevBattle   = useRef(null);
  const resolvingRef = useRef(false);

  const oppChar   = CHARACTERS.find(c => c.id === oppCharId);
  const oppName   = oppChar?.name  ?? "Opponent";
  const oppColor  = oppChar?.color ?? "#8B1A1A";
  const oppMaxHP  = oppChar?.hp    ?? 100;
  const oppImgSrc = oppCharId ? CHAR_IMAGES[oppCharId] : null;

  const myHPKey  = playerRole === "host" ? "hostHP"     : "guestHP";
  const myShKey  = playerRole === "host" ? "hostShield" : "guestShield";
  const oppHPKey = playerRole === "host" ? "guestHP"    : "hostHP";
  const oppShKey = playerRole === "host" ? "guestShield": "hostShield";

  const myHP      = battle?.[myHPKey]  ?? ch?.hp ?? 100;
  const myShield  = battle?.[myShKey]  ?? 0;
  const oppHP     = battle?.[oppHPKey] ?? oppMaxHP;
  const oppShield = battle?.[oppShKey] ?? 0;
  const round     = battle?.turnCount  ?? 1;
  const log       = battle?.log ? Object.values(battle.log) : ["⚔ The duel begins!"];
  const oppHasCast = battle && (playerRole === "host" ? !!battle.guestCast : !!battle.hostCast);

  const triggerFloat = (side, amt, type) => {
    const obj = { value: amt, type, key: Date.now() + Math.random() };
    if (side === "me") {
      setMyDmg(obj); setMyShaking(true);
      setTimeout(() => { setMyDmg(null); setMyShaking(false); }, 1200);
    } else {
      setOppDmg(obj); setOppShaking(true);
      setTimeout(() => { setOppDmg(null); setOppShaking(false); }, 1200);
    }
  };

  // ── Host initialises battle ───────────────────────────────────────────────
  useEffect(() => {
    if (playerRole !== "host") return;
    (async () => {
      const snap = await get(ref(db, `rooms/${roomCode}`));
      const room = snap.val();
      const hChar = CHARACTERS.find(c => c.id === room.host.charId);
      const gChar = CHARACTERS.find(c => c.id === room.guest.charId);
      await set(ref(db, `rooms/${roomCode}/battle`), {
        turnCount: 1,
        log: { 0: "⚔ The duel begins!" },
        hostCharId: room.host.charId,
        guestCharId: room.guest.charId,
        hostHP: hChar.hp, hostMaxHP: hChar.hp, hostShield: 0,
        guestHP: gChar.hp, guestMaxHP: gChar.hp, guestShield: 0,
        hostCast: null, guestCast: null,
        winner: null, lastRound: null,
      });
    })();
  }, []);

  // ── Subscribe to room ─────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onValue(ref(db, `rooms/${roomCode}`), snap => {
      if (!snap.exists()) return;
      const room = snap.val();
      const opp = playerRole === "host" ? room.guest : room.host;
      if (opp?.charId) setOppCharId(opp.charId);
      if (!room.battle) return;

      const b    = room.battle;
      const prev = prevBattle.current;
      prevBattle.current = b;
      setBattle(b);

      // Round resolved: turnCount incremented — always reset, floats are optional
      if (prev && b.turnCount > prev.turnCount) {
        const lr   = b.lastRound;
        const myF  = lr ? (playerRole === "host" ? lr.host  : lr.guest) : null;
        const oppF = lr ? (playerRole === "host" ? lr.guest : lr.host)  : null;
        if (myF)  triggerFloat("me",  myF.amt,  myF.type);
        if (oppF) triggerFloat("opp", oppF.amt, oppF.type);
        setMyCastSubmitted(false);
        setCastingPhase(false);
        setSelectedSpell(null);
      }

      if (b.winner) {
        setResult(b.winner === "draw" ? "draw" : b.winner === playerRole ? "win" : "lose");
        setTimeout(() => onNav("result"), 1200);
      }

      if (playerRole === "host" && b.hostCast && b.guestCast && !b.winner && !resolvingRef.current) {
        resolvingRef.current = true;
        resolveRound(b).finally(() => { resolvingRef.current = false; });
      }
    });
    return () => unsub();
  }, []);

  // ── Resolve round (host only) ─────────────────────────────────────────────
  const resolveRound = async (b) => {
    const hChar  = CHARACTERS.find(c => c.id === b.hostCharId);
    const gChar  = CHARACTERS.find(c => c.id === b.guestCharId);
    const hSpell = SPELLS.find(s => s.id === b.hostCast.spellId);
    const gSpell = SPELLS.find(s => s.id === b.guestCast.spellId);

    let hHP = b.hostHP, hSh = b.hostShield || 0;
    let gHP = b.guestHP, gSh = b.guestShield || 0;
    const logs = [];
    let hostFloat = null, guestFloat = null;

    const apply = (caster, spell, acc, tHP, tSh, sHP, sSh, sMaxHP) => {
      if (acc < 30 && spell.type === "attack") {
        const bf = Math.round(spell.baseDmg * 0.3);
        return { tHP, tSh, sHP: Math.max(0, sHP - bf), sSh, sF: { amt: bf, type: "backfire" }, tF: null, log: `💥 Backfire! ${caster.name} takes ${bf} damage!` };
      }
      if (acc < 30) {
        return { tHP, tSh, sHP, sSh, sF: null, tF: null, log: `${caster.name}'s sigil fades...` };
      }
      const m = acc / 100;
      if (spell.type === "attack") {
        const dmg = Math.round(spell.baseDmg * m * (caster.id === "agott" ? 1.15 : 1));
        const abs = Math.min(tSh, dmg);
        return { tHP: Math.max(0, tHP - (dmg - abs)), tSh: Math.max(0, tSh - abs), sHP, sSh, sF: null, tF: { amt: dmg, type: "dmg" }, log: `${spell.icon} ${caster.name} hits for ${dmg}!${abs ? ` [${abs} absorbed]` : ""}` };
      }
      if (spell.type === "defense") {
        const sh = Math.round(spell.baseShield * m * (caster.id === "richeh" ? 1.2 : 1));
        return { tHP, tSh, sHP, sSh: sSh + sh, sF: { amt: sh, type: "shield" }, tF: null, log: `${spell.icon} ${caster.name} gains ${sh} shield!` };
      }
      const heal = Math.round(spell.baseHeal * m * (caster.id === "tetia" ? 1.3 : 1));
      return { tHP, tSh, sHP: Math.min(sMaxHP, sHP + heal), sSh, sF: { amt: heal, type: "heal" }, tF: null, log: `${spell.icon} ${caster.name} heals ${heal} HP!` };
    };

    const hr = apply(hChar, hSpell, b.hostCast.accuracy, gHP, gSh, hHP, hSh, b.hostMaxHP);
    gHP = hr.tHP; gSh = hr.tSh; hHP = hr.sHP; hSh = hr.sSh;
    if (hr.log) logs.push(hr.log);
    if (hr.sF) hostFloat  = hr.sF;
    if (hr.tF) guestFloat = hr.tF;

    const gr = apply(gChar, gSpell, b.guestCast.accuracy, hHP, hSh, gHP, gSh, b.guestMaxHP);
    hHP = gr.tHP; hSh = gr.tSh; gHP = gr.sHP; gSh = gr.sSh;
    if (gr.log) logs.push(gr.log);
    if (gr.sF && !guestFloat) guestFloat = gr.sF;
    if (gr.tF) hostFloat = gr.tF;

    const winner = (hHP <= 0 && gHP <= 0) ? "draw" : hHP <= 0 ? "guest" : gHP <= 0 ? "host" : null;
    const newLog = [...(b.log ? Object.values(b.log) : []), ...logs]
      .reduce((acc, v, i) => ({ ...acc, [i]: v }), {});

    // Use a sentinel so lastRound is never an empty object that Firebase deletes
    const lastRound = {
      host:  hostFloat  ?? { amt: 0, type: "none" },
      guest: guestFloat ?? { amt: 0, type: "none" },
    };

    await update(ref(db, `rooms/${roomCode}/battle`), {
      hostHP: hHP, hostShield: hSh,
      guestHP: gHP, guestShield: gSh,
      hostCast: null, guestCast: null,
      turnCount: b.turnCount + 1,
      log: newLog,
      lastRound,
      winner: winner || null,
    });
  };

  // ── Submit cast ───────────────────────────────────────────────────────────
  const handleCast = async (accuracy) => {
    await update(ref(db, `rooms/${roomCode}/battle`), {
      [`${playerRole}Cast`]: { spellId: selectedSpell, accuracy },
    });
    setMyCastSubmitted(true);
    setCastingPhase(false);
    setSelectedSpell(null);
  };

  const castingSpell = selectedSpell ? SPELLS.find(s => s.id === selectedSpell) : null;
  const isChoosing   = !myCastSubmitted && !castingPhase && !battle?.winner;

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div style={{
      height: "100vh", background: "transparent",
      display: "flex", flexDirection: "column", overflow: "hidden",
      position: "relative", animation: "arenaFadeIn 0.5s ease",
      fontFamily: "Cormorant Garamond, serif",
    }}>
      <BattleBackground />

      {/* ── Turn bar ── */}
      <div style={{
        flexShrink: 0, padding: "10px 24px",
        borderBottom: "1px solid rgba(201,169,110,0.07)", zIndex: 1,
        display: "flex", alignItems: "center",
      }}>
        <button onClick={() => setShowExit(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B5A3E", fontSize: "20px", padding: "0 16px 0 0", lineHeight: 1, transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = "#C9A96E"}
          onMouseLeave={e => e.currentTarget.style.color = "#6B5A3E"}
        >←</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontFamily: "Cinzel", fontSize: "13px", letterSpacing: "3px", color: "#C9A96E", transition: "color 0.5s" }}>
            ROUND {round} &nbsp;·&nbsp; {
              castingPhase      ? `CASTING ${castingSpell?.name?.toUpperCase() ?? ""}` :
              myCastSubmitted && oppHasCast ? "RESOLVING..." :
              myCastSubmitted   ? "WAITING FOR OPPONENT..." :
              "CHOOSE YOUR SPELL"
            }
          </div>
        </div>
        <div style={{ width: 52 }} />
      </div>

      {/* ── Exit modal ── */}
      {showExit && (
        <div style={{ position: "absolute", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", animation: "spellSelect 0.2s ease" }}>
          <div style={{ background: "rgba(8,4,16,0.98)", border: "1px solid rgba(201,169,110,0.25)", borderRadius: "18px", padding: "40px 48px", textAlign: "center", maxWidth: 380, boxShadow: "0 0 60px rgba(0,0,0,0.8)" }}>
            <div style={{ fontSize: "36px", marginBottom: "16px" }}>⚔</div>
            <div style={{ fontFamily: "Cinzel", fontSize: "20px", color: "#F5E6D3", marginBottom: "12px" }}>Flee the Duel?</div>
            <div style={{ fontFamily: "Cormorant Garamond", fontSize: "17px", color: "#8B7355", fontStyle: "italic", marginBottom: "32px", lineHeight: 1.6 }}>
              Your opponent wins by default.
            </div>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
              <button onClick={() => setShowExit(false)} style={{ background: "transparent", border: "1px solid rgba(201,169,110,0.3)", borderRadius: "8px", padding: "12px 28px", fontFamily: "Cinzel", fontSize: "13px", color: "#8B7355", cursor: "pointer", letterSpacing: "1px" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#C9A96E"; e.currentTarget.style.borderColor = "#C9A96E"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#8B7355"; e.currentTarget.style.borderColor = "rgba(201,169,110,0.3)"; }}
              >Stay</button>
              <button onClick={() => onNav("landing")} style={{ background: "rgba(139,26,26,0.25)", border: "1px solid rgba(139,26,26,0.5)", borderRadius: "8px", padding: "12px 28px", fontFamily: "Cinzel", fontSize: "13px", color: "#CC4444", cursor: "pointer", letterSpacing: "1px" }}>Flee</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Arena: Pokémon-style 2×2 layout ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 1, minHeight: 0 }}>

        {/* ── Top row: battle log (left) + opponent (right) ── */}
        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>

          {/* Battle log — top left */}
          <div style={{ width: "38%", padding: "18px 12px 10px 28px", display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden", gap: "10px" }}>
            <div style={{ fontFamily: "Cinzel", fontSize: "11px", color: "#6B5A3E", letterSpacing: "3px" }}>BATTLE LOG</div>
            <div style={{ flex: 1, minHeight: 0, overflowY: "hidden" }}>
              {log.slice(-6).map((l, i, arr) => (
                <div key={i} style={{ fontFamily: "Cormorant Garamond", fontSize: "18px", lineHeight: "1.8", color: i === arr.length - 1 ? "#D4C4A8" : "#5A4A34", transition: "color 0.3s" }}>{l}</div>
              ))}
            </div>
          </div>

          {/* Opponent — top right */}
          <div style={{ flex: 1, display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "flex-end", padding: "20px 300px 0 0", gap: "16px", minHeight: 0, overflow: "hidden" }}>
            <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "flex-end" }}>
              {oppImgSrc ? (
                <img src={oppImgSrc} alt={oppName}
                  style={{
                    maxHeight: "300px", width: "auto",
                    transform: "scaleX(-1)",
                    filter: `drop-shadow(0 0 28px ${oppColor}88)`,
                    animation: oppShaking ? "shake 0.45s ease" : !oppHasCast && !battle?.winner ? "enemyCast 1.6s infinite" : "none",
                    pointerEvents: "none",
                  }}
                />
              ) : (
                <div style={{ fontSize: "100px", lineHeight: 1, filter: `drop-shadow(0 0 28px ${oppColor}88)` }}>🧙</div>
              )}
            </div>
            <HPCard
              name={oppName} hp={oppHP} maxHP={oppMaxHP} shield={oppShield}
              color={oppColor} dmg={oppDmg} isShaking={oppShaking}
              sx={{ minWidth: 340 }}
            />
          </div>
        </div>

        {/* ── Bottom row: your character (left) + HP + actions (right, absolute) ── */}
        <div style={{ flex: 1, display: "flex", minHeight: 0, position: "relative" }}>

          {/* Your character — bottom left */}
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "flex-start", padding: "0 0 0 340px", minHeight: 0 }}>
            <img src={CHAR_IMAGES[selectedChar]} alt={ch?.name}
              style={{ maxHeight: "120%", width: "auto", filter: `drop-shadow(0 0 32px ${ch?.color ?? "#888"}77)`, animation: myShaking ? "shake 0.45s ease" : "none", pointerEvents: "none" }}
            />
          </div>

          {/* Your HP + action area — absolute, matching solo position */}
          <div style={{ position: "absolute", bottom: 80, left: "36%", width: 460, display: "flex", flexDirection: "column", gap: "12px" }}>

            <HPCard
              name={ch?.name ?? ""} hp={myHP} maxHP={ch?.hp ?? 100} shield={myShield}
              color={ch?.color ?? "#888"} dmg={myDmg} isShaking={myShaking}
            />

            {/* ── Ready bar (vs-only status strip) ── */}
            <div style={{
              display: "flex", gap: "8px",
              background: "rgba(6,3,14,0.75)",
              border: "1px solid rgba(201,169,110,0.10)",
              borderRadius: "10px",
              padding: "8px 14px",
              alignItems: "center",
            }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "7px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: myCastSubmitted ? "#77CC88" : "#4A3A28", boxShadow: myCastSubmitted ? "0 0 6px #77CC88" : "none", transition: "all 0.3s", flexShrink: 0 }} />
                <div style={{ fontFamily: "Cinzel", fontSize: "10px", color: myCastSubmitted ? "#77CC88" : "#6B5A3E", letterSpacing: "1px" }}>
                  YOU {myCastSubmitted ? "✓ READY" : "— CHOOSING"}
                </div>
              </div>
              <div style={{ width: "1px", height: 18, background: "rgba(201,169,110,0.12)" }} />
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "7px", justifyContent: "flex-end" }}>
                <div style={{ fontFamily: "Cinzel", fontSize: "10px", color: oppHasCast ? "#77CC88" : "#6B5A3E", letterSpacing: "1px", textAlign: "right" }}>
                  {oppName.split(" ")[0].toUpperCase()} {oppHasCast ? "✓ READY" : "— CHOOSING"}
                </div>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: oppHasCast ? "#77CC88" : "#4A3A28", boxShadow: oppHasCast ? "0 0 6px #77CC88" : "none", transition: "all 0.3s", flexShrink: 0 }} />
              </div>
            </div>

            {/* ── Action container ── */}
            {isChoosing ? (
              <div style={{ background: "rgba(6,3,14,0.88)", border: "1px solid rgba(201,169,110,0.14)", borderRadius: "14px", padding: "14px 16px", backdropFilter: "blur(8px)" }}>
                <div style={{ fontFamily: "Cinzel", fontSize: "9px", color: "#6B5A3E", letterSpacing: "3px", marginBottom: "10px", textAlign: "center" }}>
                  CHOOSE YOUR SPELL
                </div>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(loadout.length, 4)}, 1fr)`, gap: "8px" }}>
                  {loadout.map(spId => {
                    const sp = SPELLS.find(s => s.id === spId);
                    if (!sp) return null;
                    return <SpellBtn key={sp.id} spell={sp} onClick={() => { setSelectedSpell(sp.id); setCastingPhase(true); }} />;
                  })}
                </div>
              </div>
            ) : !castingPhase && myCastSubmitted && !battle?.winner ? (
              <div style={{ background: "rgba(6,3,14,0.88)", border: `1px solid ${oppHasCast ? "rgba(201,169,110,0.25)" : "rgba(139,26,26,0.25)"}`, borderRadius: "14px", padding: "18px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                {oppHasCast ? (
                  <>
                    <div style={{ fontSize: "28px", animation: "pulse 0.8s infinite" }}>✦</div>
                    <div style={{ fontFamily: "Cormorant Garamond", fontSize: "15px", color: "#C9A96E", fontStyle: "italic" }}>Both spells cast — resolving...</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: "28px", animation: "enemyCast 1.6s infinite" }}>🔮</div>
                    <div style={{ fontFamily: "Cormorant Garamond", fontSize: "15px", color: "#A89070", fontStyle: "italic" }}>{oppName} is drawing their sigil...</div>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Sigil casting overlay ── */}
      {castingPhase && castingSpell && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.78)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, animation: "spellSelect 0.25s ease" }}>
          <div style={{ background: "rgba(6,3,14,0.97)", border: `2px solid ${ch?.color ?? "#888"}66`, borderRadius: "20px", padding: "28px 32px", boxShadow: `0 0 60px ${ch?.color ?? "#888"}33`, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div style={{ fontFamily: "Cinzel", fontSize: "13px", color: ch?.color, letterSpacing: "3px", marginBottom: "4px" }}>
              CASTING — {castingSpell.name.toUpperCase()}
            </div>
            <SigilCanvas spell={castingSpell} onComplete={handleCast} characterBonus={ch?.id === "coco"} />
          </div>
        </div>
      )}
    </div>
  );
}
