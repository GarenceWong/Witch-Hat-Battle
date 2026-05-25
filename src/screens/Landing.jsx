import { btnStyle } from "../components/UI.jsx";
import heroImg from "../assets/hero.jpg";

export default function Landing({ onNav }) {
  return (
    <div style={{
      height: "100vh",
      position: "relative",
      overflow: "hidden",
      fontFamily: "Cormorant Garamond, serif",
      color: "#F5E6D3",
    }}>
      {/* Full-bleed hero image */}
      <img
        src={heroImg}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "60% center",
        }}
      />

      {/* Gradient overlay — dark across center so text reads clearly */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to top, rgba(10,6,18,0.98) 0%, rgba(10,6,18,0.82) 30%, rgba(10,6,18,0.70) 55%, rgba(10,6,18,0.40) 80%, rgba(10,6,18,0.25) 100%)",
      }} />

      {/* Centered text content */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: 0,
        right: 0,
        transform: "translateY(-50%)",
        textAlign: "center",
        padding: "0 28px",
        zIndex: 2,
      }}>
        <div style={{
          fontFamily: "Cinzel",
          fontSize: "11px",
          letterSpacing: "7px",
          color: "#C9A96E",
          textTransform: "uppercase",
          marginBottom: "14px",
          animation: "fadeIn 0.8s ease",
          textShadow: "0 2px 12px rgba(0,0,0,0.9)",
        }}>
          A Fan Tribute To
        </div>

        <h1 style={{
          fontFamily: "Uncial Antiqua",
          fontSize: "clamp(44px, 12vw, 70px)",
          color: "#F5E6D3",
          lineHeight: 1.05,
          marginBottom: "2px",
          animation: "fadeIn 1s ease",
          textShadow: "0 2px 20px rgba(0,0,0,0.8)",
        }}>
          Witch Hat
        </h1>
        <h1 style={{
          fontFamily: "Uncial Antiqua",
          fontSize: "clamp(44px, 12vw, 70px)",
          color: "#C9A96E",
          lineHeight: 1.05,
          marginBottom: "14px",
          animation: "fadeIn 1.2s ease",
          textShadow: "0 2px 20px rgba(0,0,0,0.8)",
        }}>
          Atelier
        </h1>

        <p style={{
          fontFamily: "Cormorant Garamond",
          fontSize: "16px",
          color: "#C4AA88",
          fontStyle: "italic",
          maxWidth: "320px",
          margin: "0 auto 28px",
          lineHeight: 1.7,
          animation: "fadeIn 1.4s ease",
          textShadow: "0 2px 10px rgba(0,0,0,0.9)",
        }}>
          とんがり帽子のアトリエ — In a world where witches guard the secret of magic,
          one girl discovers the truth hidden in ink and glyphs.
        </p>

        <div style={{
          display: "flex",
          gap: "12px",
          flexDirection: "column",
          alignItems: "center",
          animation: "fadeIn 1.6s ease",
        }}>
          <button
            onClick={() => onNav("characters")}
            style={{
              ...btnStyle,
              fontSize: "14px",
              padding: "14px 44px",
              background: "linear-gradient(135deg, #5A2C7E, #3C1820)",
              boxShadow: "0 4px 28px rgba(90,44,126,0.5)",
              letterSpacing: "2px",
            }}
          >
            Enter the Atelier ✦
          </button>
        </div>
      </div>

      {/* Nav — pinned at top */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 3,
        display: "flex",
        justifyContent: "center",
        gap: "28px",
        padding: "18px 0 14px",
        background: "linear-gradient(to bottom, rgba(10,6,18,0.7), transparent)",
      }}>
        {[["landing","Home"],["characters","Play"]].map(([s,l]) => (
          <button
            key={s}
            onClick={() => onNav(s)}
            style={{
              background: "none", border: "none",
              color: "#C9A96E", fontFamily: "Cinzel",
              fontSize: "11px", cursor: "pointer", letterSpacing: "2px",
            }}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}
