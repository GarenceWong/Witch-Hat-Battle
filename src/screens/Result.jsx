import { CHARACTERS } from "../data.js";
import { btnStyle } from "../components/UI.jsx";

const pageStyle = {
  minHeight: "100vh",
  background: "radial-gradient(ellipse at top, #1E0A30 0%, #0D0916 40%, #1A1210 100%)",
  color: "#F5E6D3",
  display: "flex",
  flexDirection: "column",
  fontFamily: "Cormorant Garamond, serif",
  justifyContent: "space-between",
};

export default function Result({ result, selectedChar, onRematch, onNewWitch, onNav }) {
  const ch = CHARACTERS.find((c) => c.id === selectedChar);

  return (
    <div style={pageStyle}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          padding: "60px 40px",
          textAlign: "center",
          maxWidth: "640px",
          margin: "0 auto",
          animation: "fadeIn 0.6s ease",
        }}
      >
        <div style={{ fontSize: "120px", marginBottom: "28px", lineHeight: 1 }}>
          {result === "win" ? "✨" : "💀"}
        </div>
        <h2
          style={{
            fontFamily: "Uncial Antiqua",
            fontSize: "64px",
            color: result === "win" ? "#C9A96E" : "#8B1A1A",
            marginBottom: "16px",
            textShadow: result === "win"
              ? "0 0 40px #C9A96E55"
              : "0 0 40px #8B1A1A55",
            animation: "fadeIn 0.8s ease",
          }}
        >
          {result === "win" ? "Victory!" : "Defeated..."}
        </h2>
        <p
          style={{
            fontFamily: "Cormorant Garamond",
            fontSize: "24px",
            color: "#A89070",
            fontStyle: "italic",
            lineHeight: 1.6,
            marginBottom: "48px",
            animation: "fadeIn 1s ease",
          }}
        >
          {result === "win"
            ? `${ch.name}'s glyphs proved stronger. The Brimhat Sorcerer retreats into shadow.`
            : `The Brimhat Sorcerer's magic overwhelmed ${ch.name}. But an apprentice never stops learning.`}
        </p>
        <div
          style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
            animation: "fadeIn 1.2s ease",
          }}
        >
          <button
            onClick={onNewWitch}
            style={{
              ...btnStyle,
              background: "transparent",
              border: "1px solid #C9A96E",
              color: "#C9A96E",
              padding: "18px 36px",
              fontSize: "18px",
              letterSpacing: "2px",
            }}
          >
            New Witch
          </button>
          <button onClick={onRematch} style={{
            ...btnStyle,
            padding: "18px 36px",
            fontSize: "18px",
            letterSpacing: "2px",
          }}>
            Rematch ⚔
          </button>
        </div>
        <button
          onClick={() => onNav("landing")}
          style={{
            background: "none",
            border: "none",
            color: "#8B7355",
            fontFamily: "Cormorant Garamond",
            fontSize: "18px",
            marginTop: "32px",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Return to Homepage
        </button>
      </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "24px 24px 40px", marginTop: "8px" }}>
        <div style={{ fontFamily: "Cinzel", fontSize: "13px", color: "#fff", letterSpacing: "1px", marginBottom: "6px" }}>
          Developed by Garence Wong
        </div>
        <div style={{ fontFamily: "Cormorant Garamond", fontSize: "12px", color: "#fff", lineHeight: 1.7, opacity: 0.55 }}>
          Witch Hat Atelier (Tongari Boushi no Atelier) © Kamome Shirahama / Kodansha · Anime © Bug Films · All rights reserved by their respective owners.
          <br />
          Unofficial fan project for non-commercial purposes only. Not affiliated with or endorsed by any official rights holder.
        </div>
      </div>
    </div>
  );
}
