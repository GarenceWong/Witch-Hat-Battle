import { NavBar } from "../components/UI.jsx";

export default function ModeSelect({ onNav }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top, #1E0A30 0%, #0D0916 40%, #1A1210 100%)",
      color: "#F5E6D3",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Cormorant Garamond, serif",
    }}>
      <NavBar onBack={() => onNav("landing")} title="Choose Your Path" />

      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        gap: "48px",
      }}>
        <p style={{
          fontFamily: "Cormorant Garamond", fontSize: "20px",
          color: "#8B7355", fontStyle: "italic", textAlign: "center",
          margin: 0,
        }}>
          Will you duel Brimmed Cap Iguin, or cross sigils against a fellow apprentice?
        </p>

        <div style={{
          display: "flex",
          gap: "32px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}>

          {/* Single Player */}
          <div
            onClick={() => onNav("characters", "solo")}
            style={{
              width: 280,
              borderRadius: "20px",
              padding: "40px 32px",
              textAlign: "center",
              cursor: "pointer",
              background: "linear-gradient(160deg, rgba(90,44,126,0.18), rgba(10,6,20,0.95))",
              border: "1px solid rgba(201,169,110,0.25)",
              boxShadow: "0 0 0 rgba(201,169,110,0)",
              transition: "all 0.3s",
              animation: "fadeIn 0.5s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.border = "1px solid rgba(201,169,110,0.6)";
              e.currentTarget.style.boxShadow = "0 0 40px rgba(201,169,110,0.12)";
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.border = "1px solid rgba(201,169,110,0.25)";
              e.currentTarget.style.boxShadow = "0 0 0 rgba(201,169,110,0)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "20px", lineHeight: 1 }}>🎩</div>
            <div style={{
              fontFamily: "Cinzel", fontSize: "20px",
              color: "#F5E6D3", marginBottom: "12px", letterSpacing: "2px",
            }}>
              Solo
            </div>
            <div style={{
              fontFamily: "Cinzel", fontSize: "10px",
              color: "#C9A96E", letterSpacing: "3px", marginBottom: "20px",
            }}>
              SINGLE PLAYER
            </div>
            <p style={{
              fontFamily: "Cormorant Garamond", fontSize: "16px",
              color: "#8B7355", fontStyle: "italic", lineHeight: 1.7, margin: 0,
            }}>
              Pick your witch and duel Brimmed Cap Iguin.
            </p>
          </div>

          {/* Multiplayer */}
          <div
            onClick={() => onNav("multiplayer", "vs")}
            style={{
              width: 280,
              borderRadius: "20px",
              padding: "40px 32px",
              textAlign: "center",
              cursor: "pointer",
              background: "linear-gradient(160deg, rgba(139,26,26,0.18), rgba(10,6,20,0.95))",
              border: "1px solid rgba(139,26,26,0.25)",
              boxShadow: "0 0 0 rgba(139,26,26,0)",
              transition: "all 0.3s",
              animation: "fadeIn 0.7s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.border = "1px solid rgba(139,26,26,0.6)";
              e.currentTarget.style.boxShadow = "0 0 40px rgba(139,26,26,0.15)";
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.border = "1px solid rgba(139,26,26,0.25)";
              e.currentTarget.style.boxShadow = "0 0 0 rgba(139,26,26,0)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "20px", lineHeight: 1 }}>⚔</div>
            <div style={{
              fontFamily: "Cinzel", fontSize: "20px",
              color: "#F5E6D3", marginBottom: "12px", letterSpacing: "2px",
            }}>
              Versus
            </div>
            <div style={{
              fontFamily: "Cinzel", fontSize: "10px",
              color: "#CC6666", letterSpacing: "3px", marginBottom: "20px",
            }}>
              MULTIPLAYER
            </div>
            <p style={{
              fontFamily: "Cormorant Garamond", fontSize: "16px",
              color: "#8B7355", fontStyle: "italic", lineHeight: 1.7, margin: 0,
            }}>
              Challenge another apprentice in real-time sigil duels.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
