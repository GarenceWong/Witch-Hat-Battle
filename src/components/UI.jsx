import { useRef, useEffect } from "react";

export const btnStyle = {
  background: "linear-gradient(135deg, #4A2C5E, #2C1810)",
  color: "#F5E6D3",
  border: "none",
  padding: "10px 24px",
  borderRadius: "6px",
  fontFamily: "Cinzel",
  fontSize: "13px",
  cursor: "pointer",
  letterSpacing: "1px",
  transition: "all 0.3s",
};

export const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #1A1210 0%, #2C1810 30%, #1A1210 100%)",
  color: "#F5E6D3",
  display: "flex",
  flexDirection: "column",
  fontFamily: "Cormorant Garamond, serif",
};

export function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export function NavBar({ onBack, title }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "14px 16px",
        borderBottom: "1px solid rgba(201,169,110,0.1)",
      }}
    >
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: "#C9A96E",
          fontSize: "18px",
          cursor: "pointer",
          padding: "4px 8px",
          fontFamily: "Cinzel",
        }}
      >
        ←
      </button>
      <span
        style={{
          flex: 1,
          textAlign: "center",
          fontFamily: "Cinzel",
          fontSize: "15px",
          color: "#C9A96E",
          letterSpacing: "2px",
          textTransform: "uppercase",
        }}
      >
        {title}
      </span>
      <div style={{ width: "32px" }} />
    </div>
  );
}

export function Footer({ onNav }) {
  return (
    <div
      style={{
        borderTop: "1px solid rgba(201,169,110,0.1)",
        padding: "20px",
        textAlign: "center",
        marginTop: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "12px",
        }}
      >
        {[
          ["landing", "Home"],
["characters", "Play"],
        ].map(([s, l]) => (
          <button
            key={s}
            onClick={() => onNav(s)}
            style={{
              background: "none",
              border: "none",
              color: "#8B7355",
              fontFamily: "Cinzel",
              fontSize: "11px",
              cursor: "pointer",
              letterSpacing: "1px",
            }}
          >
            {l}
          </button>
        ))}
      </div>
      <p
        style={{
          fontFamily: "Cormorant Garamond",
          fontSize: "11px",
          color: "#5A4A3A",
          fontStyle: "italic",
        }}
      >
        A fan tribute · Witch Hat Atelier © Kamome Shirahama
      </p>
    </div>
  );
}

export function HPBar({ current, max, color, name }) {
  const pct = Math.max(0, (current / max) * 100);
  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "Cinzel",
          fontSize: "12px",
          color: "#D4C4A8",
          marginBottom: "4px",
        }}
      >
        <span>{name}</span>
        <span>
          {Math.max(0, current)}/{max}
        </span>
      </div>
      <div
        style={{
          height: "10px",
          background: "rgba(0,0,0,0.3)",
          borderRadius: "5px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
            borderRadius: "5px",
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}

export function BattleLog({ log }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [log]);

  return (
    <div
      ref={ref}
      style={{
        maxHeight: "120px",
        overflowY: "auto",
        padding: "8px 12px",
        background: "rgba(44,24,16,0.6)",
        borderRadius: "6px",
        fontSize: "12px",
        fontFamily: "Cormorant Garamond",
        color: "#D4C4A8",
        lineHeight: "1.6",
      }}
    >
      {log.map((l, i) => (
        <div key={i} style={{ opacity: i === log.length - 1 ? 1 : 0.65 }}>
          {l}
        </div>
      ))}
    </div>
  );
}

export function CharAvatar({ char, size = 60, selected }) {
  const initials = char.name[0];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${char.color}, ${char.color}88)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Uncial Antiqua",
        fontSize: size * 0.45,
        color: "#F5E6D3",
        border: selected ? `3px solid #C9A96E` : "3px solid transparent",
        boxShadow: selected ? `0 0 20px ${char.color}66` : "none",
        transition: "all 0.3s",
      }}
    >
      {initials}
    </div>
  );
}
