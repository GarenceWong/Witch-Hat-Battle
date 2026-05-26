import { useState } from "react";
import { CHARACTERS, ENEMY_DATA } from "./data.js";

import Landing          from "./screens/Landing.jsx";
import ModeSelect       from "./screens/ModeSelect.jsx";
import MultiplayerLobby from "./screens/MultiplayerLobby.jsx";
import WaitingRoom      from "./screens/WaitingRoom.jsx";
import CharacterSelect  from "./screens/CharacterSelect.jsx";
import Loadout          from "./screens/Loadout.jsx";
import Battle             from "./screens/Battle.jsx";
import MultiplayerBattle  from "./screens/MultiplayerBattle.jsx";
import Result           from "./screens/Result.jsx";

export default function App() {
  const [screen, setScreen] = useState("landing");

  // Game mode
  const [mode, setMode] = useState("solo"); // "solo" | "vs"

  // Multiplayer session
  const [roomCode,    setRoomCode]    = useState(null);
  const [playerRole,  setPlayerRole]  = useState(null); // "host" | "guest"

  // Game state
  const [selectedChar,    setSelectedChar]    = useState("coco");
  const [loadout,         setLoadout]         = useState([]);
  const [playerHP,        setPlayerHP]        = useState(100);
  const [playerMaxHP,     setPlayerMaxHP]     = useState(100);
  const [playerShield,    setPlayerShield]    = useState(0);
  const [enemyHP,         setEnemyHP]         = useState(100);
  const [turn,            setTurn]            = useState("player");
  const [selectedSpell,   setSelectedSpell]   = useState(null);
  const [castingPhase,    setCastingPhase]    = useState(false);
  const [battleLog,       setBattleLog]       = useState(["⚔ Battle begins!"]);
  const [enemyTurnActive, setEnemyTurnActive] = useState(false);
  const [result,          setResult]          = useState(null);
  const [turnCount,       setTurnCount]       = useState(1);

  const startGame = () => {
    if (!selectedChar || loadout.length < 1) return;
    const ch = CHARACTERS.find((c) => c.id === selectedChar);
    setPlayerHP(ch.hp);
    setPlayerMaxHP(ch.hp);
    setEnemyHP(ENEMY_DATA.hp);
    setPlayerShield(0);
    setTurn("player");
    setSelectedSpell(null);
    setCastingPhase(false);
    setBattleLog(["⚔ Brimmed Cap Iguin challenges you!"]);
    setEnemyTurnActive(false);
    setResult(null);
    setTurnCount(1);
    setScreen("battle");
  };

  const toggleLoadout = (spellId) => {
    setLoadout((prev) => {
      if (prev.includes(spellId)) return prev.filter((s) => s !== spellId);
      if (prev.length >= 4) return prev;
      return [...prev, spellId];
    });
  };

  const handleRematch = () => { startGame(); };

  const handleNewWitch = () => {
    setLoadout([]);
    setSelectedChar("coco");
    setScreen("characters");
  };

  switch (screen) {
    case "landing":
      return <Landing onNav={setScreen} />;

    case "modeselect":
      return (
        <ModeSelect
          onNav={(s, m) => { if (m) setMode(m); setScreen(s); }}
        />
      );

    case "multiplayer":
      return (
        <MultiplayerLobby
          onNav={setScreen}
          setRoomCode={setRoomCode}
          setPlayerRole={setPlayerRole}
        />
      );

    case "waitingroom":
      return (
        <WaitingRoom
          roomCode={roomCode}
          playerRole={playerRole}
          onNav={setScreen}
        />
      );

    case "characters":
      return (
        <CharacterSelect
          selectedChar={selectedChar}
          setSelectedChar={setSelectedChar}
          onNav={setScreen}
          mode={mode}
          roomCode={roomCode}
          playerRole={playerRole}
        />
      );

    case "loadout":
      return (
        <Loadout
          loadout={loadout}
          toggleLoadout={toggleLoadout}
          onStartGame={startGame}
          onNav={setScreen}
          mode={mode}
          roomCode={roomCode}
          playerRole={playerRole}
        />
      );

    case "battle":
      return mode === "vs" ? (
        <MultiplayerBattle
          selectedChar={selectedChar}
          loadout={loadout}
          roomCode={roomCode}
          playerRole={playerRole}
          setResult={setResult}
          onNav={setScreen}
        />
      ) : (
        <Battle
          selectedChar={selectedChar}
          loadout={loadout}
          playerHP={playerHP}
          setPlayerHP={setPlayerHP}
          playerMaxHP={playerMaxHP}
          playerShield={playerShield}
          setPlayerShield={setPlayerShield}
          enemyHP={enemyHP}
          setEnemyHP={setEnemyHP}
          turn={turn}
          setTurn={setTurn}
          selectedSpell={selectedSpell}
          setSelectedSpell={setSelectedSpell}
          castingPhase={castingPhase}
          setCastingPhase={setCastingPhase}
          battleLog={battleLog}
          setBattleLog={setBattleLog}
          enemyTurnActive={enemyTurnActive}
          setEnemyTurnActive={setEnemyTurnActive}
          turnCount={turnCount}
          setTurnCount={setTurnCount}
          setResult={setResult}
          onNav={setScreen}
        />
      );

    case "result":
      return (
        <Result
          result={result}
          selectedChar={selectedChar}
          onRematch={handleRematch}
          onNewWitch={handleNewWitch}
          onNav={setScreen}
        />
      );

    default:
      return <Landing onNav={setScreen} />;
  }
}
