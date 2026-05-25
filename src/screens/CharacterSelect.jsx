import { CHARACTERS } from "../data.js";
import { btnStyle, NavBar } from "../components/UI.jsx";
import cocoImg   from "../assets/coco.png";
import agottImg  from "../assets/agott.png";
import tetiaImg  from "../assets/tetia.png";
import richehImg from "../assets/richeh.png";

const CHAR_IMAGES = { coco: cocoImg, agott: agottImg, tetia: tetiaImg, richeh: richehImg };

const ICON_IMAGES = {
  coco:   "https://tongari-anime.com/main/assets/img/character/thumb_c_01.png",
  agott:  "https://tongari-anime.com/main/assets/img/character/thumb_c_03.png",
  tetia:  "https://tongari-anime.com/main/assets/img/character/thumb_c_04.png",
  richeh: "https://tongari-anime.com/main/assets/img/character/thumb_c_05.png",
};

const pageStyle = {
  minHeight: "100vh",
  background: "radial-gradient(ellipse at top, #1E0A30 0%, #0D0916 40%, #1A1210 100%)",
  color: "#F5E6D3",
  display: "flex",
  flexDirection: "column",
  fontFamily: "Cormorant Garamond, serif",
};

export default function CharacterSelect({ selectedChar, setSelectedChar, onNav }) {
  const selected = CHARACTERS.find((c) => c.id === selectedChar);

  return (
    <div style={pageStyle}>
      <NavBar onBack={() => onNav("landing")} title="Choose Your Witch" />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Left decorative panel */}
        <div style={{
          width: 400,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          pointerEvents: "none",
        }}>
          {/* Vertical line */}
          <div style={{
            position: "absolute",
            left: "50%",
            top: "8%",
            bottom: "8%",
            width: "1px",
            background: "linear-gradient(to bottom, transparent, #3D2A5A 20%, #5B3F7A 50%, #3D2A5A 80%, transparent)",
            transform: "translateX(-50%)",
          }} />

          {/* Ornament markers along the line */}
          {[14, 28, 42, 56, 70, 86].map((pct, i) => (
            <div key={i} style={{
              position: "absolute",
              top: `${pct}%`,
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}>
              <div style={{
                color: i % 3 === 0 ? "#7B5EA7" : i % 3 === 1 ? "#C97B4B44" : "#3D2A5A",
                fontSize: i % 3 === 0 ? "18px" : i % 3 === 1 ? "10px" : "14px",
                lineHeight: 1,
                filter: i % 3 === 0 ? "drop-shadow(0 0 6px #7B5EA788)" : "none",
              }}>
                {i % 3 === 0 ? "✦" : i % 3 === 1 ? "◆" : "·"}
              </div>
            </div>
          ))}

          {/* Scattered background runes */}
          {[
            { top: "20%", left: "30%", sym: "᛫", size: 11, opacity: 0.18 },
            { top: "35%", left: "68%", sym: "✧", size: 13, opacity: 0.14 },
            { top: "50%", left: "25%", sym: "⬡", size: 10, opacity: 0.12 },
            { top: "62%", left: "72%", sym: "᛫", size: 9,  opacity: 0.16 },
            { top: "75%", left: "38%", sym: "✦", size: 12, opacity: 0.13 },
            { top: "88%", left: "62%", sym: "◇", size: 11, opacity: 0.15 },
            { top: "12%", left: "60%", sym: "✧", size: 10, opacity: 0.12 },
          ].map(({ top, left, sym, size, opacity }, i) => (
            <div key={i} style={{
              position: "absolute",
              top, left,
              fontSize: `${size}px`,
              color: "#C8A87A",
              opacity,
              fontFamily: "serif",
            }}>{sym}</div>
          ))}
        </div>

        {/* ── Center stage ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 32px" }}>
          <p style={{
            fontFamily: "Cormorant Garamond", fontSize: "19px",
            color: "#8B7355", textAlign: "center",
            margin: "14px 0 0", fontStyle: "italic",
          }}>
            Each apprentice carries a unique gift. Choose wisely.
          </p>

          {/* Full-body character display */}
          <div style={{
            flex: 1,
            position: "relative",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            overflow: "hidden",
          }}>
            {/* Floor glow */}
            {selected && (
              <div style={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "70%",
                height: "35%",
                background: `radial-gradient(ellipse at bottom, ${selected.color}28 0%, transparent 70%)`,
                pointerEvents: "none",
              }} />
            )}

            {CHARACTERS.map(ch => (
              <img
                key={ch.id}
                src={CHAR_IMAGES[ch.id]}
                alt={ch.name}
                style={{
                  position: "absolute",
                  bottom: 0,
                  maxHeight: "95%",
                  width: "auto",
                  opacity: selectedChar === ch.id ? 1 : 0,
                  transform: selectedChar === ch.id
                    ? "scale(1) translateY(0)"
                    : "scale(0.94) translateY(24px)",
                  transition: "opacity 0.35s ease, transform 0.35s ease",
                  filter: `drop-shadow(0 0 28px ${ch.color}80)`,
                  pointerEvents: "none",
                }}
              />
            ))}

            {!selectedChar && (
              <p style={{
                color: "#3A2A18", fontSize: "18px", fontStyle: "italic",
                textAlign: "center", marginBottom: "30%",
              }}>
                Select a witch below
              </p>
            )}
          </div>

          {/* ── Face icon row ── */}
          <div style={{
            display: "flex",
            gap: "14px",
            justifyContent: "center",
            padding: "16px 8px 28px",
          }}>
            {CHARACTERS.map(ch => {
              const isSel = selectedChar === ch.id;
              return (
                <div
                  key={ch.id}
                  onClick={() => setSelectedChar(ch.id)}
                  style={{
                    width: 78,
                    height: 96,
                    borderRadius: "12px",
                    overflow: "hidden",
                    cursor: "pointer",
                    position: "relative",
                    background: `linear-gradient(170deg, ${ch.color}22 0%, #0A0612 100%)`,
                    border: `2px solid ${isSel ? ch.color : ch.color + "35"}`,
                    boxShadow: isSel ? `0 0 20px ${ch.color}55` : "none",
                    transition: "all 0.3s",
                    flexShrink: 0,
                  }}
                >
                  {/* official character portrait thumbnail */}
                  <img
                    src={ICON_IMAGES[ch.id]}
                    alt={ch.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "top center",
                      display: "block",
                      pointerEvents: "none",
                    }}
                  />
                  {/* Name bar */}
                  <div style={{
                    position: "absolute",
                    bottom: 0, left: 0, right: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.88), transparent)",
                    padding: "14px 4px 5px",
                    textAlign: "center",
                    fontFamily: "Cinzel",
                    fontSize: "9px",
                    letterSpacing: "1px",
                    color: isSel ? ch.color : "#8B7355",
                  }}>
                    {ch.name.toUpperCase()}
                  </div>
                  {isSel && (
                    <div style={{
                      position: "absolute", top: 4, right: 4,
                      width: 16, height: 16, borderRadius: "50%",
                      background: ch.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "8px", color: "#0A0612", fontWeight: "bold",
                    }}>✓</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right info panel ── */}
        <div style={{
          width: 360,
          flexShrink: 0,
          marginRight: "40px",
          marginBlock: "14px",
          borderRadius: "16px",
          background: "linear-gradient(160deg, rgba(18,10,32,0.97), rgba(8,4,16,0.97))",
          border: "1px solid #2A1A40",
          padding: "32px 26px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          overflowY: "auto",
        }}>
          {selected ? (
            <>
              {/* Name & title */}
              <div>
                <div style={{
                  fontFamily: "Cinzel", fontSize: "30px",
                  color: "#F5E6D3", marginBottom: "6px",
                }}>
                  {selected.name}
                </div>
                <div style={{
                  fontFamily: "Cormorant Garamond", fontSize: "21px",
                  color: selected.color, fontStyle: "italic",
                }}>
                  {selected.title}
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: "flex", gap: "10px" }}>
                {[["HP", selected.hp], ["PWR", selected.power]].map(([label, val]) => (
                  <div key={label} style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${selected.color}30`,
                    borderRadius: "8px",
                    padding: "10px 8px",
                    textAlign: "center",
                  }}>
                    <div style={{
                      fontFamily: "Cinzel", fontSize: "12px",
                      color: "#6B5A3E", letterSpacing: "1px",
                    }}>{label}</div>
                    <div style={{
                      fontFamily: "Cinzel", fontSize: "26px",
                      color: "#F5E6D3", marginTop: "2px",
                    }}>{val}</div>
                  </div>
                ))}
              </div>

              {/* Description box */}
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${selected.color}22`,
                borderRadius: "10px",
                padding: "14px 16px",
              }}>
                <div style={{
                  fontFamily: "Cinzel", fontSize: "12px",
                  color: "#6B5A3E", letterSpacing: "2px", marginBottom: "12px",
                }}>
                  LORE
                </div>
                <div style={{
                  fontFamily: "Cormorant Garamond", fontSize: "18px",
                  color: "#C8B89A", lineHeight: 1.7,
                }}>
                  {selected.desc}
                </div>
              </div>

              {/* Passive ability box */}
              <div style={{
                flex: 1,
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${selected.color}25`,
                borderRadius: "10px",
                padding: "14px 16px",
              }}>
                <div style={{
                  fontFamily: "Cinzel", fontSize: "12px",
                  color: "#6B5A3E", letterSpacing: "2px", marginBottom: "12px",
                }}>
                  PASSIVE
                </div>
                <div style={{
                  fontFamily: "Cormorant Garamond", fontSize: "24px",
                  color: selected.color, fontStyle: "italic", lineHeight: 1.6,
                }}>
                  ✦ {selected.passive}
                </div>
              </div>

              <button
                onClick={() => onNav("loadout")}
                style={{
                  ...btnStyle,
                  width: "100%",
                  textAlign: "center",
                  padding: "16px",
                  fontSize: "17px",
                  letterSpacing: "2px",
                }}
              >
                Select Spells →
              </button>
            </>
          ) : (
            <div style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2A1E12",
              fontFamily: "Cormorant Garamond",
              fontSize: "18px",
              fontStyle: "italic",
              textAlign: "center",
              lineHeight: 1.7,
              padding: "0 8px",
            }}>
              Choose a witch to reveal their secrets
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
