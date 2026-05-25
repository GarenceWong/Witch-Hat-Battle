import { useState } from "react";
import { ref, set, get } from "firebase/database";
import { db } from "../firebase.js";
import { NavBar, btnStyle } from "../components/UI.jsx";

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function MultiplayerLobby({ onNav, setRoomCode, setPlayerRole }) {
  const [tab, setTab]         = useState("create"); // "create" | "join"
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleCreate = async () => {
    setLoading(true);
    setError("");
    const code = generateRoomCode();
    const playerId = "host_" + Date.now();

    await set(ref(db, `rooms/${code}`), {
      status: "waiting",
      host: { playerId, ready: false, charId: "coco", loadout: [] },
      guest: null,
      battle: null,
      createdAt: Date.now(),
    });

    setRoomCode(code);
    setPlayerRole("host");
    onNav("waitingroom");
    setLoading(false);
  };

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) { setError("Room code must be 6 characters."); return; }

    setLoading(true);
    setError("");

    const snap = await get(ref(db, `rooms/${code}`));
    if (!snap.exists()) {
      setError("Room not found. Check the code and try again.");
      setLoading(false);
      return;
    }

    const room = snap.val();
    if (room.status !== "waiting") {
      setError("This room is no longer available.");
      setLoading(false);
      return;
    }
    if (room.guest) {
      setError("This room is already full.");
      setLoading(false);
      return;
    }

    const playerId = "guest_" + Date.now();
    await set(ref(db, `rooms/${code}/guest`), {
      playerId, ready: false, charId: "coco", loadout: [],
    });
    await set(ref(db, `rooms/${code}/status`), "ready");

    setRoomCode(code);
    setPlayerRole("guest");
    onNav("waitingroom");
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top, #1E0A30 0%, #0D0916 40%, #1A1210 100%)",
      color: "#F5E6D3",
      display: "flex", flexDirection: "column",
      fontFamily: "Cormorant Garamond, serif",
    }}>
      <NavBar onBack={() => onNav("modeselect")} title="Versus Mode" />

      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 24px", gap: "32px",
      }}>

        <p style={{
          fontFamily: "Cormorant Garamond", fontSize: "20px",
          color: "#8B7355", fontStyle: "italic", textAlign: "center", margin: 0,
        }}>
          Create a room and share the code, or enter a code to join a duel.
        </p>

        {/* Tab switcher */}
        <div style={{
          display: "flex", borderRadius: "10px", overflow: "hidden",
          border: "1px solid rgba(201,169,110,0.2)",
        }}>
          {["create", "join"].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); }}
              style={{
                padding: "12px 40px",
                fontFamily: "Cinzel", fontSize: "12px", letterSpacing: "2px",
                cursor: "pointer", border: "none",
                background: tab === t ? "rgba(201,169,110,0.15)" : "transparent",
                color: tab === t ? "#C9A96E" : "#4A3A28",
                transition: "all 0.2s",
              }}
            >
              {t === "create" ? "CREATE ROOM" : "JOIN ROOM"}
            </button>
          ))}
        </div>

        {/* Card */}
        <div style={{
          width: "100%", maxWidth: 400,
          background: "rgba(6,3,14,0.88)",
          border: "1px solid rgba(201,169,110,0.14)",
          borderRadius: "18px", padding: "36px 32px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "20px",
        }}>

          {tab === "create" ? (
            <>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>⚔</div>
                <div style={{
                  fontFamily: "Cinzel", fontSize: "14px", color: "#F5E6D3",
                  marginBottom: "8px",
                }}>
                  Create a New Room
                </div>
                <div style={{
                  fontFamily: "Cormorant Garamond", fontSize: "16px",
                  color: "#8B7355", fontStyle: "italic", lineHeight: 1.6,
                }}>
                  A 6-character room code will be generated. Share it with your opponent to begin the duel.
                </div>
              </div>
              <button
                onClick={handleCreate}
                disabled={loading}
                style={{
                  ...btnStyle,
                  width: "100%", padding: "16px",
                  fontSize: "15px", letterSpacing: "2px",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Creating..." : "Create Room ✦"}
              </button>
            </>
          ) : (
            <>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔑</div>
                <div style={{
                  fontFamily: "Cinzel", fontSize: "14px", color: "#F5E6D3",
                  marginBottom: "8px",
                }}>
                  Join a Room
                </div>
                <div style={{
                  fontFamily: "Cormorant Garamond", fontSize: "16px",
                  color: "#8B7355", fontStyle: "italic", lineHeight: 1.6,
                }}>
                  Enter the 6-character code shared by your opponent.
                </div>
              </div>

              <input
                value={joinCode}
                onChange={e => { setJoinCode(e.target.value.toUpperCase()); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleJoin()}
                maxLength={6}
                placeholder="XXXXXX"
                style={{
                  width: "100%", padding: "16px",
                  fontFamily: "Cinzel", fontSize: "22px",
                  letterSpacing: "8px", textAlign: "center",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(201,169,110,0.2)",
                  borderRadius: "10px", color: "#F5E6D3",
                  outline: "none", boxSizing: "border-box",
                }}
              />

              <button
                onClick={handleJoin}
                disabled={loading || joinCode.length !== 6}
                style={{
                  ...btnStyle,
                  width: "100%", padding: "16px",
                  fontSize: "15px", letterSpacing: "2px",
                  opacity: (loading || joinCode.length !== 6) ? 0.4 : 1,
                }}
              >
                {loading ? "Joining..." : "Join Room →"}
              </button>
            </>
          )}

          {error && (
            <div style={{
              fontFamily: "Cormorant Garamond", fontSize: "15px",
              color: "#CC4444", fontStyle: "italic", textAlign: "center",
            }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
