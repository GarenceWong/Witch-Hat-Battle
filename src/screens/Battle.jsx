import { useState, useRef, useEffect } from "react";
import { ref, set, get, onValue, update } from "firebase/database";
import { db } from "../firebase.js";
import { CHARACTERS, SPELLS, ENEMY_DATA } from "../data.js";
import SigilCanvas from "../components/SigilCanvas.jsx";
import cocoImg   from "../assets/coco.png";
import agottImg  from "../assets/agott.png";
import tetiaImg  from "../assets/tetia.png";
import richehImg from "../assets/richeh.png";
import BattleBackground from "../components/BattleBackground.jsx";

const CHAR_IMAGES = { coco: cocoImg, agott: agottImg, tetia: tetiaImg, richeh: richehImg };
const ENEMY_IMG   = "https://tongari-anime.com/main/assets/img/character/c_stand07.png";

// ── Floating damage number ────────────────────────────────────────────────────
function DmgFloat({ value, type }) {
  const map = {
    dmg:      { color: "#FF5544", prefix: "−" },
    heal:     { color: "#55DD77", prefix: "+" },
    shield:   { color: "#55AADD", prefix: "🛡" },
    backfire: { color: "#FF8800", prefix: "💥" },
  };
  const s = map[type] || map.dmg;
  return (
    <div style={{
      position: "absolute", top: "8%", left: "50%",
      fontFamily: "Cinzel", fontSize: "26px", fontWeight: "bold",
      color: s.color, textShadow: `0 0 12px ${s.color}`,
      animation: "floatDmg 1.1s ease forwards",
      pointerEvents: "none", zIndex: 20, whiteSpace: "nowrap",
    }}>
      {s.prefix}{value}
    </div>
  );
}

// ── Pokémon-style HP card ─────────────────────────────────────────────────────
function HPCard({ name, hp, maxHP, shield, color, dmg, isCasting, isShaking, style: extraStyle }) {
  const pct   = Math.max(0, (hp / maxHP) * 100);
  const lowHP = pct < 30;
  return (
    <div style={{
      background: "rgba(6,3,14,0.82)",
      border: `1px solid ${color}40`,
      borderRadius: "14px",
      padding: "14px 20px",
      minWidth: 220,
      ...extraStyle,
      position: "relative",
      backdropFilter: "blur(6px)",
      boxShadow: isCasting ? `0 0 20px ${color}33` : "none",
      transition: "box-shadow 0.4s",
      animation: isShaking ? "shake 0.45s ease" : "none",
    }}>
      {dmg && <DmgFloat key={dmg.key} value={dmg.value} type={dmg.type} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
        <div style={{ fontFamily: "Cinzel", fontSize: "15px", color: "#F5E6D3" }}>{name}</div>
        <div style={{ fontFamily: "Cinzel", fontSize: "12px", color: lowHP ? "#CC4444" : "#6B5A3E" }}>
          {Math.max(0, hp)} / {maxHP}
        </div>
      </div>

      <div style={{
        height: "11px", background: "rgba(0,0,0,0.55)",
        borderRadius: "6px", overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: "6px",
          transition: "width 0.65s ease",
          background: lowHP
            ? "linear-gradient(90deg, #6B1414, #CC2222)"
            : `linear-gradient(90deg, ${color}88, ${color})`,
          boxShadow: !lowHP ? `0 0 8px ${color}55` : "none",
        }} />
      </div>

      {(shield > 0 || isCasting) && (
        <div style={{ display: "flex", gap: "12px", marginTop: "7px", alignItems: "center" }}>
          {shield > 0 && (
            <div style={{ fontFamily: "Cinzel", fontSize: "11px", color: "#88CCDD" }}>🛡 {shield}</div>
          )}
          {isCasting && (
            <div style={{
              fontFamily: "Cinzel", fontSize: "10px", color,
              letterSpacing: "2px", animation: "pulse 1s infinite",
            }}>CASTING...</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Spell button ──────────────────────────────────────────────────────────────
function SpellBtn({ spell, onClick }) {
  const tc = {
    attack:  { bg: "rgba(200,80,60,0.15)",  border: "rgba(200,80,60,0.45)",  val: "#FF8866" },
    defense: { bg: "rgba(80,140,200,0.15)", border: "rgba(80,140,200,0.45)", val: "#88AADD" },
    heal:    { bg: "rgba(80,170,100,0.15)", border: "rgba(80,170,100,0.45)", val: "#77CC88" },
  }[spell.type];

  return (
    <button
      onClick={onClick}
      style={{
        background: tc.bg, border: `1px solid ${tc.border}`,
        borderRadius: "12px", padding: "14px 8px", cursor: "pointer",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
        transition: "transform 0.15s, box-shadow 0.15s", width: "100%",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 6px 18px ${tc.border}`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <span style={{ fontSize: "34px" }}>{spell.icon}</span>
      <span style={{ fontFamily: "Cinzel", fontSize: "13px", color: "#D4C4A8", letterSpacing: "0.5px" }}>
        {spell.name.split(" ")[0]}
      </span>
    </button>
  );
}

// ── Exit confirm modal (shared) ───────────────────────────────────────────────
function ExitModal({ mode, onStay, onFlee }) {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "spellSelect 0.2s ease",
    }}>
      <div style={{
        background: "rgba(8,4,16,0.98)",
        border: "1px solid rgba(201,169,110,0.25)",
        borderRadius: "18px", padding: "40px 48px",
        textAlign: "center", maxWidth: 380,
        boxShadow: "0 0 60px rgba(0,0,0,0.8)",
      }}>
        <div style={{ fontSize: "36px", marginBottom: "16px" }}>⚔</div>
        <div style={{ fontFamily: "Cinzel", fontSize: "20px", color: "#F5E6D3", marginBottom: "12px" }}>
          Flee the Battle?
        </div>
        <div style={{ fontFamily: "Cormorant Garamond", fontSize: "17px", color: "#8B7355", fontStyle: "italic", marginBottom: "32px", lineHeight: 1.6 }}>
          {mode === "vs"
            ? "Your progress will be lost. Your opponent wins by default."
            : "Your progress will be lost. The Brimhat Sorcerer wins by default."}
        </div>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <button onClick={onStay} style={{ background: "transparent", border: "1px solid rgba(201,169,110,0.3)", borderRadius: "8px", padding: "12px 28px", fontFamily: "Cinzel", fontSize: "13px", color: "#8B7355", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#C9A96E"; e.currentTarget.style.color = "#C9A96E"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(201,169,110,0.3)"; e.currentTarget.style.color = "#8B7355"; }}
          >Stay</button>
          <button onClick={onFlee} style={{ background: "rgba(139,26,26,0.25)", border: "1px solid rgba(139,26,26,0.5)", borderRadius: "8px", padding: "12px 28px", fontFamily: "Cinzel", fontSize: "13px", color: "#CC4444", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(139,26,26,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(139,26,26,0.25)"; }}
          >Flee</button>
        </div>
      </div>
    </div>
  );
}

// ── Watershot cast animation ──────────────────────────────────────────────────
const WATER_ORBS = [
  { size: 22, ox: 0,   oy: 0,   delay: 0   },
  { size: 15, ox: -10, oy: 12,  delay: 55  },
  { size: 19, ox: 12,  oy: -8,  delay: 35  },
  { size: 12, ox: -6,  oy: 18,  delay: 95  },
  { size: 20, ox: 6,   oy: -14, delay: 18  },
  { size: 10, ox: -14, oy: 6,   delay: 130 },
  { size: 14, ox: 9,   oy: 14,  delay: 75  },
  { size: 16, ox: -4,  oy: -10, delay: 110 },
];

function WaterShotEffect({ mode, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  }, [onDone]);

  // Solo: player bottom-left → enemy top-right
  // VS:   player left      → opponent right (roughly same height)
  const isSolo = mode !== "vs";
  const flyX   = isSolo ? "48vw" : "62vw";
  const flyY   = isSolo ? "-36vh" : "-6vh";
  const origin = isSolo ? { left: "22%", top: "65%" } : { left: "14%", top: "55%" };
  const impact = isSolo ? { left: "72%", top: "28%" } : { left: "83%", top: "65%" };

  return (
    <>
      {/* Orbs — start at player character, fly toward enemy */}
      <div style={{
        position: "absolute", ...origin,
        zIndex: 15, pointerEvents: "none",
        "--wfx": flyX, "--wfy": flyY,
      }}>
        {WATER_ORBS.map((orb, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${orb.ox}px`, top: `${orb.oy}px`,
            width: `${orb.size}px`, height: `${orb.size}px`,
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, #DDEEFF, #1188DD 50%, #005599)",
            boxShadow: `0 0 ${Math.round(orb.size * 0.6)}px #55CCFF88, inset 0 0 ${Math.round(orb.size * 0.3)}px rgba(255,255,255,0.7)`,
            animation: `waterOrbFly 0.88s cubic-bezier(0.25, 0.1, 0.3, 1) ${orb.delay}ms both`,
          }} />
        ))}
      </div>

      {/* Impact ripple at enemy position — timed to first orb arrival */}
      <div style={{
        position: "absolute", ...impact,
        width: 28, height: 28, marginLeft: -14, marginTop: -14,
        borderRadius: "50%",
        border: "3px solid #55CCFF", boxShadow: "0 0 14px #55CCFF",
        pointerEvents: "none", zIndex: 15,
        animation: "waterImpact 0.55s ease-out 0.90s both",
      }} />
    </>
  );
}

// ── Pyreball burning-fireball animation ──────────────────────────────────────
// Trailing flames stream BEHIND the travel direction (opposite of fly vector).
const FIRE_TRAIL = [
  { d: 12, size: 46, opa: 0.85, blur: 1 },
  { d: 24, size: 36, opa: 0.70, blur: 2 },
  { d: 35, size: 27, opa: 0.55, blur: 3 },
  { d: 45, size: 19, opa: 0.40, blur: 4 },
  { d: 53, size: 12, opa: 0.28, blur: 5 },
];

function FireballEffect({ mode, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1700);
    return () => clearTimeout(t);
  }, [onDone]);

  const isSolo = mode !== "vs";
  const flyX   = isSolo ? "44vw" : "62vw";
  const flyY   = isSolo ? "-42vh" : "-6vh";
  const origin = isSolo ? { left: "20%", top: "68%" } : { left: "14%", top: "55%" };
  const impact = isSolo ? { left: "64%", top: "18%" } : { left: "83%", top: "58%" };

  // Unit vector opposite to travel → tail trails behind the fireball.
  const fx = parseFloat(flyX), fy = parseFloat(flyY);
  const fmag = Math.hypot(fx, fy) || 1;
  const back = { x: -fx / fmag, y: -fy / fmag };

  const fire = "radial-gradient(circle at 40% 35%, #FFF6C8, #FFB100 35%, #FF4400 62%, rgba(170,21,0,0))";

  return (
    <>
      <div style={{
        position: "absolute", ...origin,
        zIndex: 15, pointerEvents: "none",
        "--wfx": flyX, "--wfy": flyY,
      }}>
        {/* whole flaming mass travels together */}
        <div style={{ position: "relative", animation: "fireballFly 0.9s cubic-bezier(0.2,0,0.5,1) both" }}>
          {/* trailing flames behind the head */}
          {FIRE_TRAIL.map((t, i) => (
            <div key={i} style={{
              position: "absolute",
              left: back.x * t.d, top: back.y * t.d,
              width: t.size, height: t.size,
              marginLeft: -t.size / 2, marginTop: -t.size / 2,
              borderRadius: "50%",
              background: `radial-gradient(circle at 40% 35%, rgba(255,240,170,${t.opa}), rgba(255,120,0,${t.opa * 0.8}) 45%, rgba(200,30,0,0))`,
              filter: `blur(${t.blur}px)`,
              animation: `fireFlicker ${0.22 + i * 0.04}s ease-in-out ${i * 35}ms infinite`,
            }} />
          ))}
          {/* soft outer aura */}
          <div style={{
            position: "absolute", width: 84, height: 84, marginLeft: -42, marginTop: -42,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,140,0,0.5), rgba(255,60,0,0.14) 60%, transparent 76%)",
            filter: "blur(4px)",
            animation: "fireFlicker 0.32s ease-in-out infinite",
          }} />
          {/* main flame body */}
          <div style={{
            position: "absolute", width: 56, height: 56, marginLeft: -28, marginTop: -28,
            borderRadius: "50%",
            background: fire,
            boxShadow: "0 0 40px #FF6600, 0 0 16px #FFAA00",
            animation: "fireFlicker 0.26s ease-in-out 50ms infinite",
          }} />
          {/* second flame body (offset, faster) for layered licking */}
          <div style={{
            position: "absolute", width: 40, height: 40, marginLeft: -20, marginTop: -24,
            borderRadius: "50%",
            background: "radial-gradient(circle at 45% 40%, #FFE680, #FF7300 50%, rgba(255,60,0,0))",
            animation: "fireFlicker 0.19s ease-in-out 90ms infinite",
          }} />
          {/* white-hot core */}
          <div style={{
            position: "absolute", width: 22, height: 22, marginLeft: -11, marginTop: -11,
            borderRadius: "50%",
            background: "radial-gradient(circle, #FFFFFF, #FFE89A 60%, rgba(255,200,80,0))",
            animation: "fireFlicker 0.16s ease-in-out 30ms infinite",
          }} />
        </div>
      </div>

      {/* fiery impact burst at Brimhat */}
      <div style={{
        position: "absolute", ...impact,
        width: 60, height: 60, marginLeft: -30, marginTop: -30,
        borderRadius: "50%",
        background: "radial-gradient(circle, #FFEE88 0%, #FF7700 35%, rgba(255,51,0,0.3) 65%, transparent 100%)",
        boxShadow: "0 0 50px #FF6600, 0 0 18px #FFCC00",
        pointerEvents: "none", zIndex: 15,
        animation: "fireImpactBig 0.8s ease-out 0.92s both",
      }} />
    </>
  );
}

// ── Billowing Collection cloud-shield animation ───────────────────────────────
const CLOUD_PUFFS = [
  { size: 52, ox: -58, oy: -28, delay: 0   },
  { size: 42, ox:  22, oy: -62, delay: 80  },
  { size: 48, ox:  64, oy:  -8, delay: 160 },
  { size: 36, ox:  42, oy:  42, delay: 50  },
  { size: 50, ox: -32, oy:  52, delay: 200 },
  { size: 40, ox: -68, oy:  18, delay: 120 },
  { size: 32, ox:  10, oy: -32, delay: 260 },
  { size: 44, ox: -22, oy: -52, delay: 310 },
];

function CloudShieldEffect({ mode, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  const isSolo = mode !== "vs";
  const anchor = isSolo ? { left: "30%", top: "54%" } : { left: "18%", top: "50%" };

  return (
    <div style={{ position: "absolute", ...anchor, zIndex: 15, pointerEvents: "none" }}>
      {CLOUD_PUFFS.map((puff, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${puff.ox}px`, top: `${puff.oy}px`,
          width:  `${puff.size}px`,
          height: `${Math.round(puff.size * 0.65)}px`,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at 40% 35%, rgba(255,255,255,0.95), rgba(200,225,255,0.75) 50%, rgba(150,200,255,0.25))",
          boxShadow: `0 0 ${Math.round(puff.size * 0.4)}px rgba(180,220,255,0.55), inset 0 0 ${Math.round(puff.size * 0.3)}px rgba(255,255,255,0.35)`,
          animation: `cloudPuff 1.5s ease-out ${puff.delay}ms both`,
        }} />
      ))}
    </div>
  );
}

// ── Main Battle screen ────────────────────────────────────────────────────────
export default function Battle({
  selectedChar, loadout,
  playerHP, setPlayerHP, playerMaxHP,
  playerShield, setPlayerShield,
  enemyHP, setEnemyHP,
  turn, setTurn,
  selectedSpell, setSelectedSpell,
  castingPhase, setCastingPhase,
  battleLog, setBattleLog,
  enemyTurnActive, setEnemyTurnActive,
  turnCount, setTurnCount,
  setResult, onNav,
  mode, roomCode, playerRole,
}) {
  const [playerDmg,       setPlayerDmg]       = useState(null);
  const [enemyDmg,        setEnemyDmg]        = useState(null);
  const [playerShaking,   setPlayerShaking]   = useState(false);
  const [enemyShaking,    setEnemyShaking]    = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [waterEffect,     setWaterEffect]     = useState(false);
  const [fireEffect,      setFireEffect]      = useState(false);
  const [cloudEffect,     setCloudEffect]     = useState(false);

  // VS mode state
  const [vsState,         setVsState]         = useState(null);
  const [oppCharId,       setOppCharId]       = useState(null);
  const [myCastSubmitted, setMyCastSubmitted] = useState(false);
  const prevVsState   = useRef(null);
  const resolvingRef  = useRef(false);

  const ch = CHARACTERS.find(c => c.id === selectedChar);

  const triggerDmg = (side, value, type) => {
    const obj = { value, type, key: Date.now() + Math.random() };
    if (side === "player") {
      setPlayerDmg(obj); setPlayerShaking(true);
      setTimeout(() => { setPlayerDmg(null); setPlayerShaking(false); }, 1200);
    } else {
      setEnemyDmg(obj); setEnemyShaking(true);
      setTimeout(() => { setEnemyDmg(null); setEnemyShaking(false); }, 1200);
    }
  };

  // ── VS: host initialises battle in Firebase ───────────────────────────────
  useEffect(() => {
    if (mode !== "vs" || !roomCode || playerRole !== "host") return;
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
  }, [mode, roomCode, playerRole]);

  // ── VS: subscribe to room ─────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== "vs" || !roomCode) return;
    const unsub = onValue(ref(db, `rooms/${roomCode}`), snap => {
      if (!snap.exists()) return;
      const room = snap.val();
      const opp = playerRole === "host" ? room.guest : room.host;
      if (opp?.charId) setOppCharId(opp.charId);
      if (!room.battle) return;
      const b   = room.battle;
      const prev = prevVsState.current;
      prevVsState.current = b;
      setVsState(b);

      // Show damage floats on round resolution
      if (prev && b.turnCount > prev.turnCount && b.lastRound) {
        const lr       = b.lastRound;
        const myFloat  = playerRole === "host" ? lr.host  : lr.guest;
        const oppFloat = playerRole === "host" ? lr.guest : lr.host;
        if (myFloat)  triggerDmg("player", myFloat.amt,  myFloat.type);
        if (oppFloat) triggerDmg("enemy",  oppFloat.amt, oppFloat.type);
        setMyCastSubmitted(false);
        setCastingPhase(false);
        setSelectedSpell(null);
      }

      if (b.winner) {
        setResult(b.winner === playerRole ? "win" : "lose");
        setTimeout(() => onNav("result"), 1200);
      }

      // Host resolves when both casts are present
      if (playerRole === "host" && b.hostCast && b.guestCast && !b.winner && !resolvingRef.current) {
        resolvingRef.current = true;
        resolveRound(b).finally(() => { resolvingRef.current = false; });
      }
    });
    return () => unsub();
  }, [mode, roomCode, playerRole]);

  // ── VS: resolve round (host only) ─────────────────────────────────────────
  const resolveRound = async (b) => {
    const hChar  = CHARACTERS.find(c => c.id === b.hostCharId);
    const gChar  = CHARACTERS.find(c => c.id === b.guestCharId);
    const hSpell = SPELLS.find(s => s.id === b.hostCast.spellId);
    const gSpell = SPELLS.find(s => s.id === b.guestCast.spellId);
    const hAcc   = b.hostCast.accuracy;
    const gAcc   = b.guestCast.accuracy;

    let hHP = b.hostHP, hSh = b.hostShield || 0;
    let gHP = b.guestHP, gSh = b.guestShield || 0;
    const logs = [];
    let hostFloat = null, guestFloat = null;

    const applySpell = (caster, spell, acc, targetHP, targetSh, selfHP, selfSh, selfMaxHP) => {
      if (acc < 30 && spell.type === "attack") {
        const bf = Math.round(spell.baseDmg * 0.3);
        return { targetHP, targetSh, selfHP: Math.max(0, selfHP - bf), selfSh, selfFloat: { amt: bf, type: "backfire" }, targetFloat: null, log: `💥 Backfire! ${caster.name} takes ${bf} damage!` };
      }
      if (acc < 30) {
        return { targetHP, targetSh, selfHP, selfSh, selfFloat: null, targetFloat: null, log: `${caster.name}'s sigil fades...` };
      }
      const mult = acc / 100;
      if (spell.type === "attack") {
        const pMod = caster.dmgMult ?? 1;
        const dmg  = Math.round(spell.baseDmg * mult * pMod);
        const abs  = Math.min(targetSh, dmg);
        return { targetHP: Math.max(0, targetHP - (dmg - abs)), targetSh: Math.max(0, targetSh - abs), selfHP, selfSh, selfFloat: null, targetFloat: { amt: dmg, type: "dmg" }, log: `${spell.icon} ${caster.name} hits for ${dmg}!${abs ? ` [${abs} absorbed]` : ""}` };
      }
      if (spell.type === "defense") {
        const shMod  = caster.shieldMult ?? 1;
        const shield = Math.round(spell.baseShield * mult * shMod);
        return { targetHP, targetSh, selfHP, selfSh: selfSh + shield, selfFloat: { amt: shield, type: "shield" }, targetFloat: null, log: `${spell.icon} ${caster.name} gains ${shield} shield!` };
      }
      if (spell.type === "heal") {
        const healMod = caster.healMult ?? 1;
        const heal    = Math.round(spell.baseHeal * mult * healMod);
        return { targetHP, targetSh, selfHP: Math.min(selfMaxHP, selfHP + heal), selfSh, selfFloat: { amt: heal, type: "heal" }, targetFloat: null, log: `${spell.icon} ${caster.name} heals ${heal} HP!` };
      }
      return { targetHP, targetSh, selfHP, selfSh, selfFloat: null, targetFloat: null, log: "" };
    };

    // Apply host's spell (host=self, guest=target)
    const hr = applySpell(hChar, hSpell, hAcc, gHP, gSh, hHP, hSh, b.hostMaxHP);
    gHP = hr.targetHP; gSh = hr.targetSh; hHP = hr.selfHP; hSh = hr.selfSh;
    if (hr.log) logs.push(hr.log);
    if (hr.selfFloat)   hostFloat  = hr.selfFloat;
    if (hr.targetFloat) guestFloat = hr.targetFloat;

    // Apply guest's spell (guest=self, host=target)
    const gr = applySpell(gChar, gSpell, gAcc, hHP, hSh, gHP, gSh, b.guestMaxHP);
    hHP = gr.targetHP; hSh = gr.targetSh; gHP = gr.selfHP; gSh = gr.selfSh;
    if (gr.log) logs.push(gr.log);
    if (gr.selfFloat && !guestFloat)  guestFloat = gr.selfFloat;
    if (gr.targetFloat) hostFloat = gr.targetFloat;

    let winner = null;
    if (hHP <= 0 && gHP <= 0) winner = "guest";
    else if (hHP <= 0) winner = "guest";
    else if (gHP <= 0) winner = "host";

    const currentLog = b.log ? Object.values(b.log) : [];
    const newLog = [...currentLog, ...logs].reduce((acc, v, i) => ({ ...acc, [i]: v }), {});

    await update(ref(db, `rooms/${roomCode}/battle`), {
      hostHP: hHP, hostShield: hSh,
      guestHP: gHP, guestShield: gSh,
      hostCast: null, guestCast: null,
      turnCount: b.turnCount + 1,
      log: newLog,
      lastRound: { host: hostFloat || null, guest: guestFloat || null },
      winner: winner || null,
    });
  };

  // ── VS: submit my cast ────────────────────────────────────────────────────
  const handleSpellCastVs = async (accuracy) => {
    if (selectedSpell === "watershot_seal"      && accuracy >= 30) setWaterEffect(true);
    if (selectedSpell === "pyreball_seal"       && accuracy >= 30) setFireEffect(true);
    if (selectedSpell === "billowing_collection" && accuracy >= 30) setCloudEffect(true);
    await update(ref(db, `rooms/${roomCode}/battle`), {
      [`${playerRole}Cast`]: { spellId: selectedSpell, accuracy },
    });
    setMyCastSubmitted(true);
    setCastingPhase(false);
    setSelectedSpell(null);
  };

  // ── Solo: spell cast ──────────────────────────────────────────────────────
  const handleSpellCast = (accuracy) => {
    const spell    = SPELLS.find((s) => s.id === selectedSpell);
    const powerMod = ch.dmgMult ?? 1;

    if (accuracy < 30) {
      const backfire = Math.round(spell.baseDmg * 0.3);
      setPlayerHP((prev) => Math.max(0, prev - backfire));
      triggerDmg("player", backfire, "backfire");
      setBattleLog((prev) => [...prev, `💥 Backfire! Sloppy glyph deals ${backfire} to you!`]);
    } else {
      const mult = accuracy / 100;
      if (spell.type === "attack") {
        const dmg = Math.round(spell.baseDmg * mult * powerMod);
        setEnemyHP((prev) => Math.max(0, prev - dmg));
        triggerDmg("enemy", dmg, "dmg");
        setBattleLog((prev) => [...prev, `${spell.icon} ${spell.name} hits for ${dmg}! (${accuracy}% accuracy)`]);
        if (spell.id === "watershot_seal") setWaterEffect(true);
        if (spell.id === "pyreball_seal")  setFireEffect(true);
      } else if (spell.type === "defense") {
        if (spell.id === "billowing_collection") setCloudEffect(true);
        const shieldMod = ch.shieldMult ?? 1;
        const shield = Math.round(spell.baseShield * mult * shieldMod);
        setPlayerShield((prev) => prev + shield);
        triggerDmg("player", shield, "shield");
        setBattleLog((prev) => [...prev, `${spell.icon} ${spell.name} grants ${shield} shield! (${accuracy}%)`]);
      } else if (spell.type === "heal") {
        const healMod = ch.healMult ?? 1;
        const heal = Math.round(spell.baseHeal * mult * healMod);
        setPlayerHP((prev) => Math.min(ch.hp, prev + heal));
        triggerDmg("player", heal, "heal");
        setBattleLog((prev) => [...prev, `${spell.icon} ${spell.name} heals ${heal} HP! (${accuracy}%)`]);
      }
    }

    setCastingPhase(false);
    setSelectedSpell(null);

    // Capture the new enemy HP synchronously so we don't put side effects
    // inside a state updater (which React may call more than once).
    let newEnemyHP = enemyHP;
    if (accuracy >= 30 && spell.type === "attack") {
      const dmg = Math.round(spell.baseDmg * (accuracy / 100) * powerMod);
      newEnemyHP = Math.max(0, enemyHP - dmg);
    }

    setTimeout(() => {
      if (newEnemyHP <= 0) { setResult("win"); onNav("result"); return; }
      setEnemyTurnActive(true);
      setTurn("enemy");
      setTimeout(() => {
        const eSp    = ENEMY_DATA.spells[Math.floor(Math.random() * ENEMY_DATA.spells.length)];
        const eSpell = SPELLS.find((s) => s.id === eSp);
        const eAcc   = 40 + Math.floor(Math.random() * 45);
        if (eSpell.type === "attack") {
          const dmg = Math.round(eSpell.baseDmg * (eAcc / 100) * (ENEMY_DATA.power / 10));
          setPlayerShield((prevShield) => {
            const absorbed  = Math.min(prevShield, dmg);
            const remaining = dmg - absorbed;
            setPlayerHP((prevHP) => {
              const newHP = Math.max(0, prevHP - remaining);
              if (newHP <= 0) setTimeout(() => { setResult("lose"); onNav("result"); }, 400);
              return newHP;
            });
            triggerDmg("player", dmg, "dmg");
            setBattleLog((prev) => [...prev, `🔮 Brimhat casts ${eSpell.name} for ${dmg}!` + (absorbed > 0 ? ` [${absorbed} absorbed]` : "")]);
            return Math.max(0, prevShield - absorbed);
          });
        } else {
          setBattleLog((prev) => [...prev, `🔮 Brimhat raises a ward.`]);
        }
        setTurnCount((tc) => tc + 1);
        setEnemyTurnActive(false);
        setTurn("player");
      }, 1400);
    }, 300);
  };

  // ── Derived display values ────────────────────────────────────────────────
  const myHPKey  = playerRole === "host" ? "hostHP"     : "guestHP";
  const myShKey  = playerRole === "host" ? "hostShield" : "guestShield";
  const oppHPKey = playerRole === "host" ? "guestHP"    : "hostHP";
  const oppShKey = playerRole === "host" ? "guestShield": "hostShield";

  const oppChar    = mode === "vs" ? CHARACTERS.find(c => c.id === oppCharId) : null;
  const oppName    = mode === "vs" ? (oppChar?.name   ?? "Opponent")        : "Brimhat Sorcerer";
  const oppColor   = mode === "vs" ? (oppChar?.color  ?? "#8B1A1A")         : ENEMY_DATA.color;
  const oppMaxHP   = mode === "vs" ? (oppChar?.hp     ?? 100)               : ENEMY_DATA.hp;
  const oppImgSrc  = mode === "vs" ? (oppCharId ? CHAR_IMAGES[oppCharId] : null) : ENEMY_IMG;

  const displayMyHP     = mode === "vs" ? (vsState?.[myHPKey]  ?? ch?.hp)    : playerHP;
  const displayMyMaxHP  = mode === "vs" ? (ch?.hp ?? 100)                    : playerMaxHP;
  const displayMyShield = mode === "vs" ? (vsState?.[myShKey]  ?? 0)         : playerShield;
  const displayOppHP    = mode === "vs" ? (vsState?.[oppHPKey] ?? oppMaxHP)  : enemyHP;
  const displayOppShield= mode === "vs" ? (vsState?.[oppShKey] ?? 0)         : 0;
  const displayTurnCount= mode === "vs" ? (vsState?.turnCount  ?? 1)         : turnCount;
  const displayLog      = mode === "vs"
    ? (vsState?.log ? Object.values(vsState.log) : ["⚔ The duel begins!"])
    : battleLog;

  const oppHasCast  = mode === "vs" && vsState && (playerRole === "host" ? !!vsState.guestCast : !!vsState.hostCast);
  const castingSpell = selectedSpell ? SPELLS.find(s => s.id === selectedSpell) : null;

  // Solo helpers
  const isEnemyCasting  = turn === "enemy" || enemyTurnActive;
  const isSoloMyTurn    = turn === "player" && !enemyTurnActive && !castingPhase;

  // ── Shared: sigil overlay ─────────────────────────────────────────────────
  const SigilOverlay = () => castingPhase && castingSpell ? (
    <div style={{
      position: "absolute", inset: 0,
      background: "rgba(0,0,0,0.78)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 50, animation: "spellSelect 0.25s ease",
    }}>
      <div style={{
        background: "rgba(6,3,14,0.97)",
        border: `2px solid ${ch.color}66`,
        borderRadius: "20px", padding: "28px 32px",
        boxShadow: `0 0 60px ${ch.color}33`,
        display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
      }}>
        <div style={{ fontFamily: "Cinzel", fontSize: "13px", color: ch.color, letterSpacing: "3px", marginBottom: "4px" }}>
          CASTING — {castingSpell.name.toUpperCase()}
        </div>
        <SigilCanvas
          spell={castingSpell}
          onComplete={mode === "vs" ? handleSpellCastVs : handleSpellCast}
          accBonus={ch.accBonus ?? 0}
        />
      </div>
    </div>
  ) : null;

  // ════════════════════════════════════════════════════════════════════════
  // VS MODE — symmetric fighting-game layout
  // ════════════════════════════════════════════════════════════════════════
  if (mode === "vs") {
    const isChoosing = !myCastSubmitted && !castingPhase && !vsState?.winner;

    return (
      <div style={{
        height: "100vh", background: "transparent",
        display: "flex", flexDirection: "column", overflow: "hidden",
        position: "relative", fontFamily: "Cormorant Garamond, serif",
        animation: "arenaFadeIn 0.5s ease",
      }}>
        <BattleBackground />

        {/* ── Turn bar ── */}
        <div style={{ flexShrink: 0, padding: "10px 24px", borderBottom: "1px solid rgba(201,169,110,0.07)", zIndex: 1, display: "flex", alignItems: "center" }}>
          <button onClick={() => setShowExitConfirm(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B5A3E", fontSize: "20px", padding: "0 16px 0 0", lineHeight: 1, transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#C9A96E"}
            onMouseLeave={e => e.currentTarget.style.color = "#6B5A3E"}
          >←</button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: "Cinzel", fontSize: "13px", letterSpacing: "3px", color: "#C9A96E" }}>
              ROUND {displayTurnCount}
              {myCastSubmitted && !oppHasCast && " · Waiting for opponent..."}
              {myCastSubmitted && oppHasCast  && " · Resolving..."}
              {castingPhase && ` · Casting ${castingSpell?.name ?? ""}...`}
              {isChoosing && " · Choose Your Spell"}
            </div>
          </div>
          <div style={{ width: 52 }} />
        </div>

        {showExitConfirm && <ExitModal mode={mode} onStay={() => setShowExitConfirm(false)} onFlee={() => onNav("landing")} />}

        {/* ── Battle log (top strip) ── */}
        <div style={{ flexShrink: 0, padding: "10px 32px 8px", zIndex: 1, minHeight: 80 }}>
          <div style={{ fontFamily: "Cinzel", fontSize: "10px", color: "#6B5A3E", letterSpacing: "3px", marginBottom: "5px" }}>BATTLE LOG</div>
          {displayLog.slice(-3).map((l, i, arr) => (
            <div key={i} style={{ fontFamily: "Cormorant Garamond", fontSize: "16px", lineHeight: "1.7", color: i === arr.length - 1 ? "#D4C4A8" : "#5A4A34", transition: "color 0.3s" }}>{l}</div>
          ))}
        </div>

        {/* ── Arena ── */}
        <div style={{ flex: 1, display: "flex", position: "relative", zIndex: 1, minHeight: 0 }}>

          {/* Left — YOUR character */}
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "flex-start", minHeight: 0, overflow: "visible" }}>
            <img
              src={CHAR_IMAGES[selectedChar]} alt={ch.name}
              style={{
                maxHeight: "92%", width: "auto", marginLeft: "60px",
                filter: `drop-shadow(0 0 32px ${ch.color}77)`,
                animation: playerShaking ? "shake 0.45s ease" : "none",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Right — OPPONENT character */}
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", minHeight: 0, overflow: "visible" }}>
            {oppImgSrc ? (
              <img
                src={oppImgSrc} alt={oppName}
                style={{
                  maxHeight: "92%", width: "auto", marginRight: "60px",
                  transform: "scaleX(-1)",
                  filter: `drop-shadow(0 0 28px ${oppColor}88)`,
                  animation: enemyShaking ? "shake 0.45s ease" : !oppHasCast ? "enemyCast 1.6s infinite" : "none",
                  pointerEvents: "none",
                }}
              />
            ) : (
              <div style={{ fontSize: "120px", lineHeight: 1, marginRight: "60px", filter: `drop-shadow(0 0 28px ${oppColor}88)`, animation: !oppHasCast ? "enemyCast 1.6s infinite" : "none" }}>🧙</div>
            )}
          </div>

          {/* ── YOUR HP + spell area — absolute bottom-left ── */}
          <div style={{ position: "absolute", bottom: 80, left: 32, width: 420, display: "flex", flexDirection: "column", gap: "12px" }}>
            <HPCard
              name={ch.name}
              hp={displayMyHP} maxHP={displayMyMaxHP} shield={displayMyShield}
              color={ch.color} dmg={playerDmg}
              isCasting={castingPhase && !!selectedSpell} isShaking={playerShaking}
            />

            {/* Spell selection */}
            {isChoosing && (
              <div style={{ background: "rgba(6,3,14,0.88)", border: "1px solid rgba(201,169,110,0.14)", borderRadius: "14px", padding: "14px 16px", backdropFilter: "blur(8px)" }}>
                <div style={{ fontFamily: "Cinzel", fontSize: "9px", color: "#6B5A3E", letterSpacing: "3px", marginBottom: "10px", textAlign: "center" }}>CHOOSE YOUR SPELL</div>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(loadout.length, 4)}, 1fr)`, gap: "8px" }}>
                  {loadout.map(spId => {
                    const sp = SPELLS.find(s => s.id === spId);
                    return <SpellBtn key={sp.id} spell={sp} onClick={() => { setSelectedSpell(sp.id); setCastingPhase(true); }} />;
                  })}
                </div>
              </div>
            )}

            {/* Submitted + waiting */}
            {myCastSubmitted && !vsState?.winner && (
              <div style={{ background: "rgba(6,3,14,0.88)", border: "1px solid rgba(80,170,100,0.3)", borderRadius: "14px", padding: "14px 16px", textAlign: "center" }}>
                <div style={{ fontFamily: "Cormorant Garamond", fontSize: "15px", color: "#77CC88", fontStyle: "italic" }}>
                  {oppHasCast ? "✦ Both ready — resolving..." : "✓ Spell cast! Waiting for opponent..."}
                </div>
              </div>
            )}
          </div>

          {/* ── OPPONENT HP + status — absolute bottom-right ── */}
          <div style={{ position: "absolute", bottom: 80, right: 32, width: 360, display: "flex", flexDirection: "column", gap: "12px" }}>
            <HPCard
              name={oppName}
              hp={displayOppHP} maxHP={oppMaxHP} shield={displayOppShield}
              color={oppColor} dmg={enemyDmg}
              isCasting={false} isShaking={enemyShaking}
              style={{ width: "100%" }}
            />

            {/* Opponent status */}
            {!vsState?.winner && (
              !oppHasCast ? (
                <div style={{ background: "rgba(6,3,14,0.88)", border: "1px solid rgba(139,26,26,0.25)", borderRadius: "14px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px", justifyContent: "center" }}>
                  <div style={{ fontSize: "22px", animation: "enemyCast 1.6s infinite" }}>🔮</div>
                  <div style={{ fontFamily: "Cormorant Garamond", fontSize: "15px", color: "#A89070", fontStyle: "italic" }}>{oppName} is choosing...</div>
                </div>
              ) : (
                <div style={{ background: "rgba(6,3,14,0.88)", border: "1px solid rgba(80,170,100,0.3)", borderRadius: "14px", padding: "12px 16px", textAlign: "center" }}>
                  <div style={{ fontFamily: "Cormorant Garamond", fontSize: "15px", color: "#77CC88", fontStyle: "italic" }}>✓ {oppName} is ready</div>
                </div>
              )
            )}
          </div>
        </div>

        {waterEffect  && <WaterShotEffect   mode="vs" onDone={() => setWaterEffect(false)}  />}
        {fireEffect   && <FireballEffect    mode="vs" onDone={() => setFireEffect(false)}   />}
        {cloudEffect  && <CloudShieldEffect mode="vs" onDone={() => setCloudEffect(false)}  />}
        <SigilOverlay />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // SOLO MODE — Pokémon layout (unchanged)
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div style={{
      height: "100vh", background: "transparent",
      display: "flex", flexDirection: "column", overflow: "hidden",
      position: "relative", animation: "arenaFadeIn 0.5s ease",
      fontFamily: "Cormorant Garamond, serif",
    }}>
      <BattleBackground />

      {/* ── Turn bar ── */}
      <div style={{ flexShrink: 0, padding: "10px 24px", borderBottom: "1px solid rgba(201,169,110,0.07)", zIndex: 1, display: "flex", alignItems: "center" }}>
        <button onClick={() => setShowExitConfirm(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B5A3E", fontSize: "20px", padding: "0 16px 0 0", lineHeight: 1, transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = "#C9A96E"}
          onMouseLeave={e => e.currentTarget.style.color = "#6B5A3E"}
        >←</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontFamily: "Cinzel", fontSize: "13px", letterSpacing: "3px", color: isEnemyCasting ? "#8B1A1A" : castingPhase ? ch.color : "#C9A96E", transition: "color 0.5s" }}>
            TURN {turnCount} &nbsp;·&nbsp;{" "}
            {isEnemyCasting
              ? "ENEMY CASTING..."
              : castingPhase && castingSpell
              ? `CASTING ${castingSpell.name.toUpperCase()}`
              : "YOUR MOVE"}
          </div>
        </div>
        <div style={{ width: 52 }} />
      </div>

      {showExitConfirm && <ExitModal mode={mode} onStay={() => setShowExitConfirm(false)} onFlee={() => onNav("landing")} />}

      {/* ── Arena: 2×2 Pokémon layout ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 1, minHeight: 0 }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(201,169,110,0.10), transparent)", pointerEvents: "none" }} />

        {/* ── Top row ── */}
        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
          {/* Battle log */}
          <div style={{ width: "38%", padding: "18px 12px 10px 28px", display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden", gap: "10px" }}>
            <div style={{ fontFamily: "Cinzel", fontSize: "11px", color: "#6B5A3E", letterSpacing: "3px" }}>BATTLE LOG</div>
            <div style={{ flex: 1, minHeight: 0, overflowY: "hidden" }}>
              {battleLog.slice(-6).map((l, i, arr) => (
                <div key={i} style={{ fontFamily: "Cormorant Garamond", fontSize: "18px", lineHeight: "1.8", color: i === arr.length - 1 ? "#D4C4A8" : "#5A4A34", transition: "color 0.3s" }}>{l}</div>
              ))}
            </div>
          </div>

          {/* Enemy side */}
          <div style={{ flex: 1, display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "flex-end", padding: "20px 300px 0 0", gap: "16px", minHeight: 0, overflow: "hidden" }}>
            <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "flex-end" }}>
              <img src={ENEMY_IMG} alt="Brimhat Sorcerer"
                onError={e => { e.target.style.display = "none"; }}
                style={{
                  maxHeight: "300px", width: "auto", transform: "scaleX(-1)",
                  filter: `drop-shadow(0 0 28px ${ENEMY_DATA.color}99) brightness(0.75) sepia(0.4) hue-rotate(-15deg)`,
                  animation: enemyShaking ? "shake 0.45s ease" : isEnemyCasting ? "enemyCast 1.6s infinite" : "none",
                  pointerEvents: "none",
                }}
              />
            </div>
            <HPCard
              name="Brimhat Sorcerer"
              hp={enemyHP} maxHP={ENEMY_DATA.hp} shield={0}
              color={ENEMY_DATA.color} dmg={enemyDmg}
              isCasting={isEnemyCasting} isShaking={enemyShaking}
              style={{ minWidth: 340 }}
            />
          </div>
        </div>

        {/* ── Bottom row ── */}
        <div style={{ flex: 1, display: "flex", minHeight: 0, position: "relative" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "flex-start", padding: "0 0 0 340px", minHeight: 0 }}>
            <img src={CHAR_IMAGES[selectedChar]} alt={ch.name}
              style={{ maxHeight: "120%", width: "auto", filter: `drop-shadow(0 0 32px ${ch.color}77)`, animation: playerShaking ? "shake 0.45s ease" : "none", pointerEvents: "none" }}
            />
          </div>

          <div style={{ position: "absolute", bottom: 80, left: "36%", width: 460, display: "flex", flexDirection: "column", gap: "12px" }}>
            <HPCard
              name={ch.name}
              hp={playerHP} maxHP={playerMaxHP} shield={playerShield}
              color={ch.color} dmg={playerDmg}
              isCasting={castingPhase && !!selectedSpell} isShaking={playerShaking}
            />
            {isSoloMyTurn ? (
              <div style={{ background: "rgba(6,3,14,0.88)", border: "1px solid rgba(201,169,110,0.14)", borderRadius: "14px", padding: "14px 16px", backdropFilter: "blur(8px)" }}>
                <div style={{ fontFamily: "Cinzel", fontSize: "9px", color: "#6B5A3E", letterSpacing: "3px", marginBottom: "10px", textAlign: "center" }}>CHOOSE YOUR SPELL</div>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(loadout.length, 4)}, 1fr)`, gap: "8px" }}>
                  {loadout.map(spId => {
                    const sp = SPELLS.find(s => s.id === spId);
                    return <SpellBtn key={sp.id} spell={sp} onClick={() => { setSelectedSpell(sp.id); setCastingPhase(true); }} />;
                  })}
                </div>
              </div>
            ) : !castingPhase ? (
              <div style={{ background: "rgba(6,3,14,0.88)", border: "1px solid rgba(139,26,26,0.25)", borderRadius: "14px", padding: "18px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <div style={{ fontSize: "30px", animation: "enemyCast 1.6s infinite" }}>🔮</div>
                <div style={{ fontFamily: "Cormorant Garamond", fontSize: "15px", color: "#A89070", fontStyle: "italic" }}>The Brimhat Sorcerer draws their glyph...</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {waterEffect  && <WaterShotEffect   mode="solo" onDone={() => setWaterEffect(false)}  />}
      {fireEffect   && <FireballEffect    mode="solo" onDone={() => setFireEffect(false)}   />}
      {cloudEffect  && <CloudShieldEffect mode="solo" onDone={() => setCloudEffect(false)}  />}
      <SigilOverlay />
    </div>
  );
}
