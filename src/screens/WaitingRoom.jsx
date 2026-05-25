import { useEffect, useState } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "../firebase.js";
import { btnStyle } from "../components/UI.jsx";

export default function WaitingRoom({ roomCode, playerRole, onNav }) {
  const [room, setRoom]       = useState(null);
  const [copied, setCopied]   = useState(false);

  // Listen to room changes in real-time
  useEffect(() => {
    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsub = onValue(roomRef, snap => {
      if (snap.exists()) setRoom(snap.val());
    });
    return () => unsub();
  }, [roomCode]);

  // When both players are present, host can start — move to character select
  useEffect(() => {
    if (!room) return;
    if (room.status === "character_select") {
      onNav("characters");
    }
  }, [room]);

  const handleStart = async () => {
    await set(ref(db, `rooms/${roomCode}/status`), "character_select");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hostConnected  = !!room?.host;
  const guestConnected = !!room?.guest;
  const bothReady      = hostConnected && guestConnected;

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top, #1E0A30 0%, #0D0916 40%, #1A1210 100%)",
      color: "#F5E6D3",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "Cormorant Garamond, serif",
      gap: "36px", padding: "40px 24px",
    }}>

      <div style={{ textAlign: "center" }}>
        <div style={{
          fontFamily: "Cinzel", fontSize: "11px", color: "#6B5A3E",
          letterSpacing: "4px", marginBottom: "14px",
        }}>
          WAITING ROOM
        </div>
        <div style={{
          fontFamily: "Uncial Antiqua", fontSize: "36px", color: "#C9A96E",
        }}>
          Share the Code
        </div>
      </div>

      {/* Room code display */}
      <div style={{
        background: "rgba(6,3,14,0.88)",
        border: "1px solid rgba(201,169,110,0.25)",
        borderRadius: "18px", padding: "32px 48px",
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: "Cinzel", fontSize: "11px", color: "#6B5A3E",
          letterSpacing: "3px", marginBottom: "16px",
        }}>
          ROOM CODE
        </div>
        <div style={{
          fontFamily: "Cinzel", fontSize: "52px", color: "#F5E6D3",
          letterSpacing: "12px", marginBottom: "20px",
          textShadow: "0 0 30px rgba(201,169,110,0.3)",
        }}>
          {roomCode}
        </div>
        <button
          onClick={handleCopy}
          style={{
            background: "transparent",
            border: "1px solid rgba(201,169,110,0.25)",
            borderRadius: "8px", padding: "10px 24px",
            fontFamily: "Cinzel", fontSize: "11px",
            color: copied ? "#77CC88" : "#8B7355",
            cursor: "pointer", letterSpacing: "2px",
            transition: "all 0.2s",
          }}
        >
          {copied ? "✓ COPIED" : "COPY CODE"}
        </button>
      </div>

      {/* Player status */}
      <div style={{
        display: "flex", gap: "20px",
      }}>
        {[
          { label: "Host", connected: hostConnected, isYou: playerRole === "host" },
          { label: "Guest", connected: guestConnected, isYou: playerRole === "guest" },
        ].map(({ label, connected, isYou }) => (
          <div key={label} style={{
            width: 160, padding: "20px 16px",
            background: "rgba(6,3,14,0.88)",
            border: `1px solid ${connected ? "rgba(119,204,136,0.3)" : "rgba(255,255,255,0.06)"}`,
            borderRadius: "14px", textAlign: "center",
            transition: "all 0.4s",
          }}>
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>
              {connected ? "🧙" : "👤"}
            </div>
            <div style={{
              fontFamily: "Cinzel", fontSize: "12px",
              color: connected ? "#77CC88" : "#4A3A28",
              letterSpacing: "1px", marginBottom: "4px",
            }}>
              {label} {isYou && "(You)"}
            </div>
            <div style={{
              fontFamily: "Cormorant Garamond", fontSize: "13px",
              color: connected ? "#77CC88" : "#4A3A28",
              fontStyle: "italic",
            }}>
              {connected ? "Connected" : "Waiting..."}
            </div>
          </div>
        ))}
      </div>

      {/* Status message */}
      <div style={{
        fontFamily: "Cormorant Garamond", fontSize: "18px",
        color: "#8B7355", fontStyle: "italic", textAlign: "center",
        animation: "pulse 2s infinite",
      }}>
        {bothReady
          ? playerRole === "host"
            ? "Both apprentices are ready. Begin the duel!"
            : "Waiting for the host to start..."
          : "Waiting for opponent to join..."}
      </div>

      {/* Host start button — only shows when both connected */}
      {playerRole === "host" && bothReady && (
        <button
          onClick={handleStart}
          style={{
            ...btnStyle,
            padding: "18px 48px",
            fontSize: "16px", letterSpacing: "2px",
          }}
        >
          Begin Duel ⚔
        </button>
      )}

      <button
        onClick={() => onNav("modeselect")}
        style={{
          background: "none", border: "none",
          color: "#4A3A28", fontFamily: "Cormorant Garamond",
          fontSize: "16px", cursor: "pointer", fontStyle: "italic",
          textDecoration: "underline",
        }}
      >
        Leave room
      </button>
    </div>
  );
}
