import { useState, useRef, useEffect } from "react";
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

// ── Battle log ────────────────────────────────────────────────────────────────
function BattleLog({ log }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [log]);
  return (
    <div ref={ref} style={{
      flex: 1, minHeight: 0, overflowY: "auto", padding: "8px 12px",
      background: "rgba(6,3,14,0.6)", borderRadius: "10px",
      border: "1px solid rgba(201,169,110,0.07)",
    }}>
      {log.map((l, i, arr) => (
        <div key={i} style={{
          fontFamily: "Cormorant Garamond", fontSize: "14px", lineHeight: "1.7",
          color: i === arr.length - 1 ? "#D4C4A8" : "#5A4A34",
          transition: "color 0.3s",
        }}>{l}</div>
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
}) {
  const [playerDmg,       setPlayerDmg]       = useState(null);
  const [enemyDmg,        setEnemyDmg]        = useState(null);
  const [playerShaking,   setPlayerShaking]   = useState(false);
  const [enemyShaking,    setEnemyShaking]    = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const ch        = CHARACTERS.find((c) => c.id === selectedChar);
  const enemyChar = { id: "brimhat", name: "Brimhat Sorcerer", color: ENEMY_DATA.color };

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

  const handleSpellCast = (accuracy) => {
    const spell    = SPELLS.find((s) => s.id === selectedSpell);
    const powerMod = ch.id === "agott" ? 1.15 : 1;

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
      } else if (spell.type === "defense") {
        const shieldMod = ch.id === "richeh" ? 1.2 : 1;
        const shield = Math.round(spell.baseShield * mult * shieldMod);
        setPlayerShield((prev) => prev + shield);
        triggerDmg("player", shield, "shield");
        setBattleLog((prev) => [...prev, `${spell.icon} ${spell.name} grants ${shield} shield! (${accuracy}%)`]);
      } else if (spell.type === "heal") {
        const healMod = ch.id === "tetia" ? 1.3 : 1;
        const heal = Math.round(spell.baseHeal * mult * healMod);
        setPlayerHP((prev) => Math.min(ch.hp, prev + heal));
        triggerDmg("player", heal, "heal");
        setBattleLog((prev) => [...prev, `${spell.icon} ${spell.name} heals ${heal} HP! (${accuracy}%)`]);
      }
    }

    setCastingPhase(false);
    setSelectedSpell(null);

    setTimeout(() => {
      setEnemyHP((prev) => {
        if (prev <= 0) { setResult("win"); onNav("result"); return prev; }

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
              setBattleLog((prev) => [
                ...prev,
                `🔮 Brimhat casts ${eSpell.name} for ${dmg}!` + (absorbed > 0 ? ` [${absorbed} absorbed]` : ""),
              ]);
              return Math.max(0, prevShield - absorbed);
            });
          } else {
            setBattleLog((prev) => [...prev, `🔮 Brimhat raises a ward.`]);
          }

          setTurnCount((tc) => tc + 1);
          setEnemyTurnActive(false);
          setTurn("player");
        }, 1400);

        return prev;
      });
    }, 300);
  };

  const isEnemyActive  = turn === "enemy" || enemyTurnActive;
  const isPlayerActive = turn === "player" && !enemyTurnActive && !castingPhase;
  const castingSpell   = selectedSpell ? SPELLS.find((s) => s.id === selectedSpell) : null;

  return (
    <div style={{
      height: "100vh",
      background: "transparent",
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
        {/* Back arrow */}
        <button
          onClick={() => setShowExitConfirm(true)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#6B5A3E", fontSize: "20px", padding: "0 16px 0 0",
            lineHeight: 1, transition: "color 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#C9A96E"}
          onMouseLeave={e => e.currentTarget.style.color = "#6B5A3E"}
        >
          ←
        </button>

        {/* Turn status — centered */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{
            fontFamily: "Cinzel", fontSize: "13px", letterSpacing: "3px",
            color: isEnemyActive ? "#8B1A1A" : castingPhase ? ch.color : "#C9A96E",
            transition: "color 0.5s",
          }}>
            TURN {turnCount} &nbsp;·&nbsp;{" "}
            {isEnemyActive
              ? "ENEMY CASTING..."
              : castingPhase && castingSpell
              ? `CASTING ${castingSpell.name.toUpperCase()}`
              : "YOUR MOVE"}
          </div>
        </div>

        {/* Spacer to balance the arrow */}
        <div style={{ width: 52 }} />
      </div>

      {/* ── Exit confirmation modal ── */}
      {showExitConfirm && (
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
            <div style={{
              fontFamily: "Cinzel", fontSize: "20px",
              color: "#F5E6D3", marginBottom: "12px",
            }}>
              Flee the Battle?
            </div>
            <div style={{
              fontFamily: "Cormorant Garamond", fontSize: "17px",
              color: "#8B7355", fontStyle: "italic", marginBottom: "32px", lineHeight: 1.6,
            }}>
              Your progress will be lost. The Brimhat Sorcerer wins by default.
            </div>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
              <button
                onClick={() => setShowExitConfirm(false)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(201,169,110,0.3)",
                  borderRadius: "8px", padding: "12px 28px",
                  fontFamily: "Cinzel", fontSize: "13px",
                  color: "#8B7355", cursor: "pointer",
                  letterSpacing: "1px", transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#C9A96E"; e.currentTarget.style.color = "#C9A96E"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(201,169,110,0.3)"; e.currentTarget.style.color = "#8B7355"; }}
              >
                Stay
              </button>
              <button
                onClick={() => onNav("landing")}
                style={{
                  background: "rgba(139,26,26,0.25)",
                  border: "1px solid rgba(139,26,26,0.5)",
                  borderRadius: "8px", padding: "12px 28px",
                  fontFamily: "Cinzel", fontSize: "13px",
                  color: "#CC4444", cursor: "pointer",
                  letterSpacing: "1px", transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(139,26,26,0.45)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(139,26,26,0.25)"; }}
              >
                Flee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Arena: 2×2 Pokémon layout ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 1, minHeight: 0 }}>

        {/* Subtle mid-ground line */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "1px",
          background: "linear-gradient(to right, transparent, rgba(201,169,110,0.10), transparent)",
          pointerEvents: "none",
        }} />

        {/* ── Top row: battle log (left) + enemy (right) ── */}
        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>

          {/* Battle log — top left, no box */}
          <div style={{
            width: "38%", padding: "18px 12px 10px 28px",
            display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden",
            gap: "10px",
          }}>
            <div style={{
              fontFamily: "Cinzel", fontSize: "11px", color: "#6B5A3E",
              letterSpacing: "3px",
            }}>
              BATTLE LOG
            </div>
            <div style={{ flex: 1, minHeight: 0, overflowY: "hidden" }}>
              {battleLog.slice(-6).map((l, i, arr) => (
                <div key={i} style={{
                  fontFamily: "Cormorant Garamond", fontSize: "18px", lineHeight: "1.8",
                  color: i === arr.length - 1 ? "#D4C4A8" : "#5A4A34",
                  transition: "color 0.3s",
                }}>{l}</div>
              ))}
            </div>
          </div>

          {/* Enemy side — top right, character left of HP bar */}
          <div style={{
            flex: 1, display: "flex", flexDirection: "row",
            alignItems: "flex-start", justifyContent: "flex-end",
            padding: "20px 300px 0 0", gap: "16px",
            minHeight: 0, overflow: "hidden",
          }}>
            {/* Enemy character — left of HP card, bottom-aligned */}
            <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "flex-end" }}>
              <img
                src={ENEMY_IMG}
                alt="Brimhat Sorcerer"
                onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                style={{
                  maxHeight: "300px", width: "auto",
                  transform: "scaleX(-1)",
                  filter: `drop-shadow(0 0 28px ${ENEMY_DATA.color}99) brightness(0.75) sepia(0.4) hue-rotate(-15deg)`,
                  animation: enemyShaking ? "shake 0.45s ease" : isEnemyActive ? "enemyCast 1.6s infinite" : "none",
                  pointerEvents: "none",
                }}
              />
              <div style={{
                display: "none", alignItems: "flex-end", justifyContent: "center",
                fontSize: "120px", lineHeight: 1,
                filter: `drop-shadow(0 0 28px ${ENEMY_DATA.color}88)`,
                animation: enemyShaking ? "shake 0.45s ease" : isEnemyActive ? "enemyCast 1.6s infinite" : "none",
              }}>🧙</div>
            </div>

            {/* HP Card */}
            <HPCard
              name="Brimhat Sorcerer"
              hp={enemyHP} maxHP={ENEMY_DATA.hp} shield={0}
              color={ENEMY_DATA.color}
              dmg={enemyDmg}
              isCasting={isEnemyActive}
              isShaking={enemyShaking}
              style={{ minWidth: 340 }}
            />
          </div>
        </div>

        {/* ── Bottom row: player char (left) + player HP + spells (right) ── */}
        <div style={{ flex: 1, display: "flex", minHeight: 0, position: "relative" }}>

          {/* Player character — bottom left */}
          <div style={{
            flex: 1, display: "flex", alignItems: "flex-end",
            justifyContent: "flex-start", padding: "0 0 0 340px",
            minHeight: 0,
          }}>
            <img
              src={CHAR_IMAGES[selectedChar]}
              alt={ch.name}
              style={{
                maxHeight: "120%", width: "auto",
                filter: `drop-shadow(0 0 32px ${ch.color}77)`,
                animation: playerShaking ? "shake 0.45s ease" : "none",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Player HP + action area — absolutely positioned near character */}
          <div style={{
            position: "absolute", bottom: 80, left: "36%",
            width: 460, display: "flex", flexDirection: "column",
            gap: "12px",
          }}>
            <HPCard
              name={ch.name}
              hp={playerHP} maxHP={playerMaxHP} shield={playerShield}
              color={ch.color}
              dmg={playerDmg}
              isCasting={castingPhase && !!selectedSpell}
              isShaking={playerShaking}
            />

            {/* Action container */}
            {turn === "player" && !enemyTurnActive && !castingPhase ? (
              <div style={{
                background: "rgba(6,3,14,0.88)",
                border: "1px solid rgba(201,169,110,0.14)",
                borderRadius: "14px",
                padding: "14px 16px",
                backdropFilter: "blur(8px)",
              }}>
                <div style={{
                  fontFamily: "Cinzel", fontSize: "9px", color: "#6B5A3E",
                  letterSpacing: "3px", marginBottom: "10px", textAlign: "center",
                }}>
                  CHOOSE YOUR SPELL
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${Math.min(loadout.length, 4)}, 1fr)`,
                  gap: "8px",
                }}>
                  {loadout.map((spId) => {
                    const sp = SPELLS.find((s) => s.id === spId);
                    return (
                      <SpellBtn
                        key={sp.id} spell={sp}
                        onClick={() => { setSelectedSpell(sp.id); setCastingPhase(true); }}
                      />
                    );
                  })}
                </div>
              </div>
            ) : !castingPhase ? (
              <div style={{
                background: "rgba(6,3,14,0.88)",
                border: "1px solid rgba(139,26,26,0.25)",
                borderRadius: "14px",
                padding: "18px 16px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
              }}>
                <div style={{ fontSize: "30px", animation: "enemyCast 1.6s infinite" }}>🔮</div>
                <div style={{
                  fontFamily: "Cormorant Garamond", fontSize: "15px",
                  color: "#A89070", fontStyle: "italic",
                }}>
                  The Brimhat Sorcerer draws their glyph...
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Sigil casting overlay ── */}
      {castingPhase && castingSpell && (
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
            <div style={{
              fontFamily: "Cinzel", fontSize: "13px", color: ch.color,
              letterSpacing: "3px", marginBottom: "4px",
            }}>
              CASTING — {castingSpell.name.toUpperCase()}
            </div>
            <SigilCanvas
              spell={castingSpell}
              onComplete={handleSpellCast}
              characterBonus={ch.id === "coco"}
            />
          </div>
        </div>
      )}

    </div>
  );
}
