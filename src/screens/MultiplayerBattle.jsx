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
import battleMusic  from "../assets/Innocence of a Curious Mind.mp3";
import sfxPyreball  from "../assets/CastSFX/Pyreball Cast.wav";
import sfxWater     from "../assets/CastSFX/Watershot.mp3";
import sfxHealing   from "../assets/CastSFX/Healing.mp3";
import sfxBillowing from "../assets/CastSFX/Billowing.mp3";
import sfxSelfDmg   from "../assets/CastSFX/SelfDMG.mp3";

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
      borderRadius: "12px", padding: "16px 10px 18px", cursor: "pointer",
      display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
      transition: "transform 0.15s, box-shadow 0.15s", width: "100%",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 6px 18px ${tc.border}`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <span style={{ fontSize: "34px", color: spell.type === "heal" ? "#FFFFFF" : undefined }}>{spell.icon}</span>
      <span style={{ fontFamily: "Cinzel", fontSize: "11px", color: "#D4C4A8", letterSpacing: "0.5px", textAlign: "center", lineHeight: 1.5 }}>
        {spell.name}
      </span>
    </button>
  );
}

// ── Watershot ─────────────────────────────────────────────────────────────────
const WATER_DROPS = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2;
  const dist  = 52 + (i % 3) * 26;
  const size  = [12, 9, 6][i % 3];
  return { sx: `${Math.round(Math.cos(angle) * dist)}px`, sy: `${Math.round(Math.sin(angle) * dist)}px`, size, delay: 800 + i * 15 };
});

function WaterShotEffect({ onDone }) {
  useEffect(() => {
    const sfx = new Audio(sfxWater);
    sfx.volume = 0.6;
    sfx.play().catch(() => {});
    return () => { sfx.pause(); sfx.currentTime = 0; };
  }, []);
  useEffect(() => { const t = setTimeout(onDone, 1950); return () => clearTimeout(t); }, [onDone]);
  const flyX = "48vw", flyY = "-36vh";
  const origin = { left: "22%", top: "65%" };
  const impact = { left: "61%", top: "18%" };
  return (
    <>
      <div style={{ position: "absolute", ...origin, zIndex: 20, pointerEvents: "none", "--wfx": flyX, "--wfy": flyY }}>
        {Array.from({ length: 5 }, (_, i) => { const a = (i / 5) * Math.PI * 2; return (
          <div key={i} style={{ position: "absolute", left: Math.round(Math.cos(a) * 28), top: Math.round(Math.sin(a) * 28), width: 10, height: 10, marginLeft: -5, marginTop: -5, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, #CCEEFF, #0099DD 55%, #005588)", boxShadow: "0 0 8px #44CCFF88", animation: `waterOrbFly 0.82s cubic-bezier(0.2,0.1,0.35,1) ${i * 28}ms both` }} />
        ); })}
        <div style={{ position: "absolute", width: 60, height: 60, marginLeft: -30, marginTop: -30, borderRadius: "50%", background: "radial-gradient(circle at 32% 28%, #EEFFFF, #22AADD 34%, #0066AA 66%, #002244)", boxShadow: "0 0 55px #00AAFF, 0 0 22px #44DDFF, inset 0 0 14px rgba(255,255,255,0.55)", animation: "waterOrbFly 0.78s cubic-bezier(0.2,0.1,0.3,1) both" }} />
        <div style={{ position: "absolute", width: 16, height: 16, marginLeft: -22, marginTop: -22, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.95), transparent)", animation: "waterOrbFly 0.78s cubic-bezier(0.2,0.1,0.3,1) both" }} />
      </div>
      <div style={{ position: "absolute", ...impact, width: 160, height: 160, marginLeft: -80, marginTop: -80, borderRadius: "50%", background: "radial-gradient(circle, #FFFFFF 0%, rgba(100,220,255,0.88) 32%, transparent 64%)", pointerEvents: "none", zIndex: 22, opacity: 0, animation: "wsFlash 0.32s ease-out 0.8s forwards" }} />
      <div style={{ position: "absolute", ...impact, width: 105, height: 105, marginLeft: -52, marginTop: -52, borderRadius: "50%", background: "radial-gradient(circle, #EEFFFF 0%, #22CCFF 28%, #0077BB 60%, rgba(0,40,90,0) 100%)", boxShadow: "0 0 65px #00AAFF, 0 0 30px #44DDFF", pointerEvents: "none", zIndex: 21, opacity: 0, animation: "wsBlast 0.68s ease-out 0.8s forwards" }} />
      <div style={{ position: "absolute", ...impact, width: 20, height: 20, marginLeft: -10, marginTop: -10, borderRadius: "50%", border: "4px solid rgba(60,210,255,0.9)", boxShadow: "0 0 12px #00BBFF, inset 0 0 6px rgba(180,240,255,0.35)", pointerEvents: "none", zIndex: 22, opacity: 0, animation: "wsRipple 0.52s ease-out 0.82s forwards" }} />
      <div style={{ position: "absolute", ...impact, width: 20, height: 20, marginLeft: -10, marginTop: -10, borderRadius: "50%", border: "2px solid rgba(30,175,240,0.65)", pointerEvents: "none", zIndex: 22, opacity: 0, animation: "wsRipple 0.58s ease-out 0.97s forwards" }} />
      <div style={{ position: "absolute", ...impact, width: 20, height: 20, marginLeft: -10, marginTop: -10, borderRadius: "50%", border: "1px solid rgba(15,145,215,0.45)", pointerEvents: "none", zIndex: 22, opacity: 0, animation: "wsRipple 0.64s ease-out 1.12s forwards" }} />
      {WATER_DROPS.map((d, i) => (
        <div key={i} style={{ position: "absolute", ...impact, width: d.size, height: d.size, marginLeft: -d.size / 2, marginTop: -d.size / 2, borderRadius: "50%", background: "radial-gradient(circle at 32% 28%, #EEFFFF, #22AADD 55%, #004477)", boxShadow: `0 0 ${d.size}px #00AAFFAA`, pointerEvents: "none", zIndex: 22, opacity: 0, "--sx": d.sx, "--sy": d.sy, animation: `wsSplash 0.68s ease-out ${d.delay}ms forwards` }} />
      ))}
      <div style={{ position: "absolute", ...impact, width: 115, height: 115, marginLeft: -57, marginTop: -57, borderRadius: "50%", background: "radial-gradient(circle, rgba(80,190,255,0.38) 0%, rgba(40,140,220,0.16) 52%, transparent 75%)", filter: "blur(13px)", pointerEvents: "none", zIndex: 19, opacity: 0, animation: "crSmoke 1.1s ease-out 0.88s forwards" }} />
    </>
  );
}

// ── Pyreball ──────────────────────────────────────────────────────────────────
const FIRE_TRAIL = [
  { d: 16, size: 58, opa: 0.88, blur: 1 }, { d: 32, size: 46, opa: 0.72, blur: 2 },
  { d: 47, size: 34, opa: 0.55, blur: 3 }, { d: 60, size: 24, opa: 0.38, blur: 4 },
  { d: 72, size: 15, opa: 0.22, blur: 5 }, { d: 82, size:  9, opa: 0.12, blur: 6 },
];
const FIRE_EMBERS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  const dist  = 55 + (i % 3) * 32;
  const size  = [13, 9, 6][i % 3];
  return { ex: `${Math.round(Math.cos(angle) * dist)}px`, ey: `${Math.round(Math.sin(angle) * dist)}px`, size, delay: 750 + i * 16 };
});

function FireballEffect({ onDone }) {
  useEffect(() => {
    const sfx = new Audio(sfxPyreball);
    sfx.volume = 0.6;
    sfx.play().catch(() => {});
    return () => { sfx.pause(); sfx.currentTime = 0; };
  }, []);
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);
  const flyX = "44vw", flyY = "-42vh";
  const origin = { left: "20%", top: "68%" };
  const impact = { left: "64%", top: "18%" };
  const fx = parseFloat(flyX), fy = parseFloat(flyY);
  const fmag = Math.hypot(fx, fy) || 1;
  const back = { x: -fx / fmag, y: -fy / fmag };
  return (
    <>
      <div style={{ position: "absolute", ...origin, zIndex: 20, pointerEvents: "none", "--wfx": flyX, "--wfy": flyY }}>
        <div style={{ position: "relative", animation: "fireballFly 0.76s cubic-bezier(0.15,0,0.35,1) both" }}>
          {FIRE_TRAIL.map((tr, i) => (
            <div key={i} style={{ position: "absolute", left: back.x * tr.d, top: back.y * tr.d, width: tr.size, height: tr.size, marginLeft: -tr.size / 2, marginTop: -tr.size / 2, borderRadius: "50%", background: `radial-gradient(circle at 40% 35%, rgba(255,240,170,${tr.opa}), rgba(255,110,0,${tr.opa * 0.8}) 48%, rgba(200,30,0,0))`, filter: `blur(${tr.blur}px)`, animation: `fireFlicker ${0.2 + i * 0.04}s ease-in-out ${i * 30}ms infinite` }} />
          ))}
          <div style={{ position: "absolute", width: 110, height: 110, marginLeft: -55, marginTop: -55, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,130,0,0.55), rgba(255,50,0,0.15) 55%, transparent 75%)", filter: "blur(7px)", animation: "fireFlicker 0.3s ease-in-out infinite" }} />
          <div style={{ position: "absolute", width: 76, height: 76, marginLeft: -38, marginTop: -38, borderRadius: "50%", background: "radial-gradient(circle at 38% 35%, #FFFFFF, #FFE060 16%, #FF8C00 46%, #CC2000 76%)", boxShadow: "0 0 65px #FF5500, 0 0 30px #FFAA00, 0 0 12px #FFFF88", animation: "fireFlicker 0.21s ease-in-out 50ms infinite" }} />
          <div style={{ position: "absolute", width: 36, height: 36, marginLeft: -18, marginTop: -18, borderRadius: "50%", background: "radial-gradient(circle, #FFFFFF, rgba(255,240,180,0))", animation: "fireFlicker 0.14s ease-in-out 20ms infinite" }} />
        </div>
      </div>
      <div style={{ position: "absolute", ...impact, width: 190, height: 190, marginLeft: -95, marginTop: -95, borderRadius: "50%", background: "radial-gradient(circle, #FFFFFF 0%, rgba(255,230,120,0.9) 32%, transparent 65%)", pointerEvents: "none", zIndex: 22, opacity: 0, animation: "crImpactFlash 0.38s ease-out 0.76s forwards" }} />
      <div style={{ position: "absolute", ...impact, width: 150, height: 150, marginLeft: -75, marginTop: -75, borderRadius: "50%", background: "radial-gradient(circle, #FFF8A0 0%, #FF9900 26%, #FF3300 56%, rgba(140,20,0,0) 100%)", boxShadow: "0 0 90px #FF5500, 0 0 44px #FF9900", pointerEvents: "none", zIndex: 21, opacity: 0, animation: "crBlastBurst 0.72s ease-out 0.76s forwards" }} />
      <div style={{ position: "absolute", ...impact, width: 24, height: 24, marginLeft: -12, marginTop: -12, borderRadius: "50%", border: "5px solid rgba(255,175,55,0.95)", boxShadow: "0 0 18px #FF8800, inset 0 0 8px rgba(255,210,110,0.5)", pointerEvents: "none", zIndex: 22, opacity: 0, animation: "crBlastRing 0.52s ease-out 0.78s forwards" }} />
      <div style={{ position: "absolute", ...impact, width: 24, height: 24, marginLeft: -12, marginTop: -12, borderRadius: "50%", border: "3px solid rgba(255,100,20,0.7)", pointerEvents: "none", zIndex: 22, opacity: 0, animation: "crBlastRing 0.58s ease-out 0.93s forwards" }} />
      {FIRE_EMBERS.map((e, i) => (
        <div key={i} style={{ position: "absolute", ...impact, width: e.size, height: e.size, marginLeft: -e.size / 2, marginTop: -e.size / 2, borderRadius: "50%", background: "radial-gradient(circle, #FFEE88, #FF6600 70%)", boxShadow: `0 0 ${e.size * 1.5}px #FF8800`, pointerEvents: "none", zIndex: 22, "--ex": e.ex, "--ey": e.ey, opacity: 0, animation: `crEmber 0.72s ease-out ${e.delay}ms forwards` }} />
      ))}
      <div style={{ position: "absolute", ...impact, width: 130, height: 130, marginLeft: -65, marginTop: -65, borderRadius: "50%", background: "radial-gradient(circle, rgba(90,45,10,0.55) 0%, rgba(60,28,5,0.28) 52%, transparent 78%)", filter: "blur(14px)", pointerEvents: "none", zIndex: 19, opacity: 0, animation: "crSmoke 1.1s ease-out 0.88s forwards" }} />
    </>
  );
}

// ── Billowing Collection ───────────────────────────────────────────────────────
const CLOUD_PUFFS = [
  { size: 52, ox: -58, oy: -28, delay: 0 }, { size: 42, ox: 22, oy: -62, delay: 80 },
  { size: 48, ox:  64, oy:  -8, delay: 160 }, { size: 36, ox: 42, oy: 42, delay: 50 },
  { size: 50, ox: -32, oy:  52, delay: 200 }, { size: 40, ox: -68, oy: 18, delay: 120 },
  { size: 32, ox:  10, oy: -32, delay: 260 }, { size: 44, ox: -22, oy: -52, delay: 310 },
];

function CloudShieldEffect({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "absolute", left: "30%", top: "54%", zIndex: 15, pointerEvents: "none" }}>
      {CLOUD_PUFFS.map((puff, i) => (
        <div key={i} style={{ position: "absolute", left: `${puff.ox}px`, top: `${puff.oy}px`, width: `${puff.size}px`, height: `${Math.round(puff.size * 0.65)}px`, borderRadius: "50%", background: "radial-gradient(ellipse at 40% 35%, rgba(255,255,255,0.95), rgba(200,225,255,0.75) 50%, rgba(150,200,255,0.25))", boxShadow: `0 0 ${Math.round(puff.size * 0.4)}px rgba(180,220,255,0.55), inset 0 0 ${Math.round(puff.size * 0.3)}px rgba(255,255,255,0.35)`, animation: `cloudPuff 1.5s ease-out ${puff.delay}ms both` }} />
      ))}
    </div>
  );
}

// ── Healing effect ────────────────────────────────────────────────────────────
const HEAL_SPARKS = Array.from({ length: 18 }, (_, i) => {
  const t  = i / 17;
  const sy = Math.round(-15 - t * 330);
  const sx = Math.round(Math.sin(i * 1.85) * 58);
  return {
    sx, sy,
    hx: `${Math.round(Math.cos(i * 2.6) * 22)}px`,
    hy: `${-(22 + (i % 4) * 13)}px`,
    size: [12, 9, 7, 5][i % 4],
    delay: i * 65,
  };
});

function HealEffect({ onDone }) {
  useEffect(() => {
    const sfx = new Audio(sfxHealing);
    sfx.volume = 0.6;
    sfx.play().catch(() => {});
    const cut = setTimeout(() => { sfx.pause(); }, 900);
    return () => { clearTimeout(cut); sfx.pause(); };
  }, []);
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);
  const anchor = { left: "14%", top: "90%" };
  return (
    <div style={{ position: "absolute", ...anchor, zIndex: 15, pointerEvents: "none" }}>
      <div style={{ position: "absolute", width: 190, height: 420, marginLeft: -95, marginTop: -400, borderRadius: "45%", background: "radial-gradient(ellipse at 50% 60%, rgba(60,210,100,0.42), rgba(30,160,70,0.14) 55%, transparent 78%)", filter: "blur(22px)", opacity: 0, animation: "healBloom 1.7s ease-out forwards" }} />
      <div style={{ position: "absolute", fontFamily: "Cinzel", fontSize: "52px", fontWeight: "bold", color: "#44EE88", textShadow: "0 0 18px #22CC66, 0 0 36px #11AA44", marginLeft: -14, marginTop: -345, opacity: 0, animation: "healFloat 1.6s ease-out forwards" }}>+</div>
      <div style={{ position: "absolute", fontFamily: "Cinzel", fontSize: "32px", fontWeight: "bold", color: "#66FFAA", textShadow: "0 0 12px #33BB66", marginLeft: 34, marginTop: -265, opacity: 0, animation: "healFloat 1.4s ease-out 80ms forwards" }}>+</div>
      <div style={{ position: "absolute", fontFamily: "Cinzel", fontSize: "30px", fontWeight: "bold", color: "#77FFAA", marginLeft: -52, marginTop: -210, opacity: 0, animation: "healFloat 1.4s ease-out 150ms forwards" }}>+</div>
      <div style={{ position: "absolute", fontFamily: "Cinzel", fontSize: "24px", fontWeight: "bold", color: "#99FFCC", marginLeft: 18, marginTop: -145, opacity: 0, animation: "healFloat 1.2s ease-out 220ms forwards" }}>+</div>
      <div style={{ position: "absolute", fontFamily: "Cinzel", fontSize: "20px", fontWeight: "bold", color: "#AAFFDD", marginLeft: -38, marginTop: -80, opacity: 0, animation: "healFloat 1.1s ease-out 300ms forwards" }}>+</div>
      {HEAL_SPARKS.map((s, i) => (
        <div key={i} style={{ position: "absolute", width: s.size, height: s.size, marginLeft: s.sx - s.size / 2, marginTop: s.sy - s.size / 2, borderRadius: "50%", background: "radial-gradient(circle, #CCFFDD, #33CC66 60%)", boxShadow: `0 0 ${s.size * 2}px #44EE88`, "--hx": s.hx, "--hy": s.hy, opacity: 0, animation: `healSparkle 1.1s ease-out ${s.delay}ms forwards` }} />
      ))}
    </div>
  );
}

// ── Persistent shield aura ────────────────────────────────────────────────────
const SHIELD_CLOUDS = [
  { w: 230, h: 72,  ox:   10, oy: -55, delay: 60,  dur: 4.2, rot:  2,  blur: 10, br: "50% 50% 46% 54% / 60% 58% 42% 40%" },
  { w: 175, h: 60,  ox: -155, oy: -40, delay: 310, dur: 3.8, rot: -8,  blur: 11, br: "42% 58% 52% 48% / 55% 62% 38% 45%" },
  { w: 165, h: 58,  ox:  158, oy: -45, delay: 520, dur: 4.0, rot:  7,  blur: 11, br: "55% 45% 48% 52% / 65% 54% 46% 35%" },
  { w: 140, h: 52,  ox: -210, oy: -25, delay: 180, dur: 3.5, rot: -12, blur: 12, br: "48% 52% 44% 56% / 58% 60% 40% 42%" },
  { w: 132, h: 50,  ox:  205, oy: -30, delay: 640, dur: 3.9, rot:  10, blur: 12, br: "54% 46% 50% 50% / 62% 52% 48% 38%" },
  { w: 205, h: 82,  ox:  -8,  oy:   8, delay: 0,   dur: 3.8, rot: -4,  blur: 6,  br: "52% 48% 44% 56% / 68% 62% 38% 32%" },
  { w: 148, h: 68,  ox: -128, oy:  42, delay: 270, dur: 3.3, rot:  9,  blur: 8,  br: "40% 60% 55% 45% / 55% 48% 52% 38%" },
  { w: 162, h: 62,  ox:  138, oy:  14, delay: 480, dur: 3.6, rot: -11, blur: 7,  br: "58% 42% 38% 62% / 72% 58% 42% 28%" },
  { w: 125, h: 58,  ox: -142, oy: 108, delay: 140, dur: 3.1, rot:  6,  blur: 9,  br: "45% 55% 60% 40% / 60% 44% 56% 40%" },
  { w: 118, h: 54,  ox:  136, oy: 102, delay: 600, dur: 3.5, rot: -7,  blur: 8,  br: "62% 38% 48% 52% / 50% 68% 32% 50%" },
  { w: 188, h: 80,  ox:   20, oy:  84, delay: 520, dur: 3.0, rot:  3,  blur: 5,  br: "48% 52% 42% 58% / 66% 60% 40% 34%" },
  { w: 140, h: 60,  ox:  -72, oy: 195, delay: 360, dur: 3.9, rot: 13,  blur: 9,  br: "35% 65% 52% 48% / 58% 70% 30% 42%" },
  { w: 130, h: 56,  ox:  105, oy: 188, delay: 700, dur: 3.4, rot: -9,  blur: 8,  br: "55% 45% 46% 54% / 74% 50% 50% 26%" },
  { w: 115, h: 50,  ox:   22, oy: 200, delay: 740, dur: 3.2, rot:  5,  blur: 7,  br: "50% 50% 36% 64% / 65% 56% 44% 35%" },
  { w: 100, h: 46,  ox: -178, oy: 170, delay: 420, dur: 3.7, rot: -14, blur: 10, br: "44% 56% 58% 42% / 52% 62% 38% 48%" },
  { w:  92, h: 44,  ox:  168, oy: 155, delay: 200, dur: 3.2, rot:  11, blur: 9,  br: "60% 40% 44% 56% / 68% 46% 54% 32%" },
];

function ShieldAura({ active }) {
  return (
    <div style={{ position: "absolute", left: 520, bottom: 160, width: 0, height: 0, pointerEvents: "none", zIndex: 0, opacity: active ? 1 : 0, transition: "opacity 0.75s ease" }}>
      {SHIELD_CLOUDS.map((c, i) => (
        <div key={i} style={{ position: "absolute", left: c.ox - c.w / 2, bottom: c.oy - c.h / 2, width: c.w, height: c.h, borderRadius: c.br, transform: `rotate(${c.rot}deg)`, background: "radial-gradient(ellipse at 48% 36%, rgba(255,240,228,1), rgba(255,210,195,0.92) 50%, rgba(255,175,162,0.55) 75%, rgba(255,150,145,0))", boxShadow: "inset 0 -6px 16px rgba(200,85,65,0.14)", filter: `blur(${c.blur}px)`, animation: `shieldFloat ${c.dur}s ease-in-out ${c.delay}ms infinite` }} />
      ))}
    </div>
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

  const prevBattle    = useRef(null);
  const resolvingRef  = useRef(false);
  const myLastSpell   = useRef(null);

  const [waterEffect, setWaterEffect] = useState(false);
  const [fireEffect,  setFireEffect]  = useState(false);
  const [cloudEffect, setCloudEffect] = useState(false);
  const [healEffect,  setHealEffect]  = useState(false);
  const [muted,       setMuted]       = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio(battleMusic);
    audio.loop = true;
    audio.volume = 0.28;
    audioRef.current = audio;
    const t = setTimeout(() => audio.play().catch(() => {}), 1000);
    return () => { clearTimeout(t); audio.pause(); audio.currentTime = 0; };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

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
        // Trigger cast animation / SFX for the spell I submitted
        const sp = myLastSpell.current;
        if (sp === "watershot_seal")        setWaterEffect(true);
        if (sp === "pyreball_seal")         setFireEffect(true);
        if (sp === "healing_craft")         setHealEffect(true);
        if (sp === "billowing_collection")  Object.assign(new Audio(sfxBillowing), { volume: 0.3 }).play().catch(() => {});
        myLastSpell.current = null;
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
      if (acc < 70) {
        const stat = spell.baseDmg ?? spell.baseShield ?? spell.baseHeal ?? 10;
        const bf   = Math.round(stat * 0.3);
        return { tHP, tSh, sHP: Math.max(0, sHP - bf), sSh, sF: { amt: bf, type: "backfire" }, tF: null, log: `💥 Backfire! ${caster.name} takes ${bf} damage!` };
      }
      const m = acc / 100;
      if (spell.type === "attack") {
        const dmg = Math.round(spell.baseDmg * m * (caster.dmgMult ?? 1));
        const abs = Math.min(tSh, dmg);
        return { tHP: Math.max(0, tHP - (dmg - abs)), tSh: Math.max(0, tSh - abs), sHP, sSh, sF: null, tF: { amt: dmg, type: "dmg" }, log: `${spell.icon} ${caster.name} hits for ${dmg}!${abs ? ` [${abs} absorbed]` : ""}` };
      }
      if (spell.type === "defense") {
        const sh = Math.round(spell.baseShield * m * (caster.shieldMult ?? 1));
        return { tHP, tSh, sHP, sSh: sSh + sh, sF: { amt: sh, type: "shield" }, tF: null, log: `${spell.icon} ${caster.name} gains ${sh} shield!` };
      }
      const heal = Math.round(spell.baseHeal * m * (caster.healMult ?? 1));
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
    if (accuracy < 70) Object.assign(new Audio(sfxSelfDmg), { volume: 0.6 }).play().catch(() => {});
    myLastSpell.current = selectedSpell;
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
        <button onClick={() => setMuted(m => !m)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B5A3E", fontSize: "16px", padding: "0", lineHeight: 1, transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = "#C9A96E"}
          onMouseLeave={e => e.currentTarget.style.color = "#6B5A3E"}
        >{muted ? "🔇" : "🔊"}</button>
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
                    pointerEvents: "none", position: "relative", zIndex: 25,
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

          <ShieldAura active={myShield > 0} />

          {/* Your character — bottom left */}
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "flex-start", padding: "0 0 0 340px", minHeight: 0 }}>
            <img src={CHAR_IMAGES[selectedChar]} alt={ch?.name}
              style={{ maxHeight: "120%", width: "auto", filter: `drop-shadow(0 0 32px ${ch?.color ?? "#888"}77)`, animation: myShaking ? "shake 0.45s ease" : "none", pointerEvents: "none", position: "relative", zIndex: 2 }}
            />
          </div>

          {/* Your HP + action area — absolute, matching solo position */}
          <div style={{ position: "absolute", bottom: 80, left: "36%", width: 460, display: "flex", flexDirection: "column", gap: "12px", zIndex: 3 }}>

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

      {waterEffect && <WaterShotEffect onDone={() => setWaterEffect(false)} />}
      {fireEffect  && <FireballEffect  onDone={() => setFireEffect(false)}  />}
      {healEffect  && <HealEffect      onDone={() => setHealEffect(false)}  />}

      {/* ── Sigil casting overlay ── */}
      {castingPhase && castingSpell && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.78)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, animation: "spellSelect 0.25s ease" }}>
          <div style={{ background: "rgba(6,3,14,0.97)", border: `2px solid ${ch?.color ?? "#888"}66`, borderRadius: "20px", padding: "28px 32px", boxShadow: `0 0 60px ${ch?.color ?? "#888"}33`, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div style={{ fontFamily: "Cinzel", fontSize: "13px", color: ch?.color, letterSpacing: "3px", marginBottom: "4px" }}>
              CASTING — {castingSpell.name.toUpperCase()}
            </div>
            <SigilCanvas spell={castingSpell} onComplete={handleCast} accBonus={ch?.accBonus ?? 0} />
          </div>
        </div>
      )}
    </div>
  );
}
