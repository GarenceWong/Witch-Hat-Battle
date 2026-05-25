import { useState } from "react";
import { CHARACTERS, ENEMY_DATA } from "./data.js";

import Landing from "./screens/Landing.jsx";
import CharacterSelect from "./screens/CharacterSelect.jsx";
import Loadout from "./screens/Loadout.jsx";
import Battle from "./screens/Battle.jsx";
import Result from "./screens/Result.jsx";

export default function App() {
  const [screen, setScreen] = useState("landing");

  // Game state
  const [selectedChar, setSelectedChar] = useState("coco");
  const [loadout, setLoadout] = useState([]);
  const [playerHP, setPlayerHP] = useState(100);
  const [playerMaxHP, setPlayerMaxHP] = useState(100);
  const [playerShield, setPlayerShield] = useState(0);
  const [enemyHP, setEnemyHP] = useState(100);
  const [turn, setTurn] = useState("player");
  const [selectedSpell, setSelectedSpell] = useState(null);
  const [castingPhase, setCastingPhase] = useState(false);
  const [battleLog, setBattleLog] = useState(["⚔ Battle begins!"]);
  const [enemyTurnActive, setEnemyTurnActive] = useState(false);
  const [result, setResult] = useState(null);
  const [turnCount, setTurnCount] = useState(1);

  const startGame = () => {
    if (!selectedChar || loadout.length < 3) return;
    const ch = CHARACTERS.find((c) => c.id === selectedChar);
    setPlayerHP(ch.hp);
    setPlayerMaxHP(ch.hp);
    setEnemyHP(ENEMY_DATA.hp);
    setPlayerShield(0);
    setTurn("player");
    setSelectedSpell(null);
    setCastingPhase(false);
    setBattleLog(["⚔ The Brimhat Sorcerer challenges you!"]);
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

  const handleRematch = () => {
    startGame();
  };

  const handleNewWitch = () => {
    setLoadout([]);
    setSelectedChar("coco");
    setScreen("characters");
  };

  switch (screen) {
    case "landing":
      return <Landing onNav={setScreen} />;

    case "characters":
      return (
        <CharacterSelect
          selectedChar={selectedChar}
          setSelectedChar={setSelectedChar}
          onNav={setScreen}
        />
      );

    case "loadout":
      return (
        <Loadout
          loadout={loadout}
          toggleLoadout={toggleLoadout}
          onStartGame={startGame}
          onNav={setScreen}
        />
      );

    case "battle":
      return (
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
