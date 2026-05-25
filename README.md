# 🎩 Witch Hat Battle

A fan-made, browser-based spell-drawing battle game inspired by the anime **Witch Hat Atelier (Tongari Boushi no Atelier)**. Draw magical sigils on a canvas to cast spells — just like the apprentice witches of the atelier.

> Unofficial fan project for non-commercial purposes only. Not affiliated with or endorsed by any official rights holder.  
> Witch Hat Atelier © Kamome Shirahama / Kodansha · Anime © Bug Films

---

## 🌟 Features

### Solo Mode — Duel the Brimhat Sorcerer
- Turn-based battle against an AI opponent
- Cast spells by drawing their sigil on a canvas — accuracy determines power
- High accuracy → full effect · Low accuracy (< 30%) → backfire

### Versus Mode — Cross Sigils with a Friend
- Real-time **online multiplayer** via Firebase Realtime Database
- Create a room and share a 6-character code, or join with a friend's code
- Both players draw simultaneously — spells resolve at the same time
- Supports **win**, **lose**, and **draw** outcomes (if both players fall in the same round)

### Character Select
- Choose from **4 playable apprentice witches**: Coco, Agott, Tetia, and Richeh
- Each character has unique **stats, lore, and a passive ability** that affects gameplay
- Full-body character display, face icon selector, and a stat/lore info panel

### Spell Loadout
- Pick **1–4 spells** from the available pool
- Visual spell cards with type badges (ATTACK / DEFENSE / HEAL), difficulty stars, and stat previews
- Bottom loadout bar shows selected spells at a glance

### Battle Screen
- Your witch in the bottom-left, the opponent in the top-right
- **Sigil drawing mechanic**: select a spell, trace its sigil on the canvas
- HP bars, shield tracking, floating damage numbers, and shake animations on hit
- Animated battle background with drifting sigil glyphs, sparkles, and rising embers
- Live **Battle Log** showing the last 6 combat events
- **Versus ready bar**: shows when each player has submitted their cast

### Result Screen
- Victory, defeat, or draw screen with character-specific flavour text
- Options to **Rematch**, pick a **New Witch**, or return to the homepage

---

## 🧙 Characters & Passives

| Character | HP  | Power | Passive |
|-----------|-----|-------|---------|
| **Coco**   | 100 | 10 | Accuracy Bonus — sigil drawings score higher |
| **Agott**  | 85  | 13 | Attack Boost — attack spells deal 15% more damage |
| **Tetia**  | 115 | 8  | Healing Touch — heal spells restore 30% more HP |
| **Richeh** | 95  | 11 | Barrier Craft — shield spells block 20% more damage |

---

## 📜 Spells

Spells are being added one by one, each with a sigil based on the actual WHA source material.

| Spell | Type | Sigil | Difficulty |
|-------|------|-------|------------|
| **Watershot Seal** | Attack (30 DMG) | Outer ring + S-curve + water drop + T-keystones | ★★ |
| **Healing Craft**  | Heal (25 HP)    | Circle + cross + 4 filled dots at cardinal points | ★★ |

The accuracy system scores each drawing on three components:
- **Coverage** (45%) — how much of the template you traced
- **Precision** (35%) — how little you drew outside the template
- **Uniformity** (20%) — whether you covered all parts of the shape, not just one section

---

## 🛠️ Tech Stack

- **Vite** + **React** (functional components, hooks, inline styles)
- **Canvas API** — freehand sigil drawing with multi-component accuracy scoring
- **Firebase Realtime Database** — real-time multiplayer room sync (no backend server)
- Custom CSS keyframe animations (floating glyphs, damage floats, shake, pulse)

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
src/
├── assets/               # Character images + spell sigil reference images
├── components/
│   ├── BattleBackground.jsx   # Animated battle background
│   ├── SigilCanvas.jsx        # Spell drawing canvas + accuracy scoring
│   └── UI.jsx                 # Shared UI (NavBar, btnStyle)
├── screens/
│   ├── Landing.jsx
│   ├── ModeSelect.jsx
│   ├── MultiplayerLobby.jsx   # Create / join a multiplayer room
│   ├── WaitingRoom.jsx        # Wait for opponent to connect
│   ├── CharacterSelect.jsx
│   ├── Loadout.jsx
│   ├── Battle.jsx             # Solo battle vs AI
│   ├── MultiplayerBattle.jsx  # Real-time PvP battle
│   └── Result.jsx
├── App.jsx          # Root with game state and screen routing
├── data.js          # Characters, spells, and enemy data
├── firebase.js      # Firebase app + Realtime Database instance
└── sigils.js        # Sigil point definitions + accuracy algorithm
```

---

## ⚖️ Disclaimer

This is an **unofficial fan project** created for non-commercial, educational purposes.  
All characters, names, and artwork related to *Witch Hat Atelier* are the property of their respective owners.  
Kamome Shirahama / Kodansha · Anime © Bug Films · All rights reserved.

---

*Developed by [Garence Wong](https://github.com/GarenceWong) · Built with [Claude Code](https://claude.ai/code) by Anthropic*
