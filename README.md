# 🎩 Witch Hat Battle

A fan-made, browser-based spell-drawing battle game inspired by the anime **Witch Hat Atelier (Tongari Boushi no Atelier)**. Draw magical sigils on a canvas to cast spells and defeat the Brimhat Sorcerer — just like the apprentice witches of the atelier.

> Unofficial fan project for non-commercial purposes only. Not affiliated with or endorsed by any official rights holder.  
> Witch Hat Atelier © Kamome Shirahama / Kodansha · Anime © Bug Films

---

## 🌟 Features

### Fan Page
- **Landing page** with anime-styled hero section and navigation
- **About / World Lore** page introducing the world of Witch Hat Atelier

### Character Select
- Choose from **4 playable apprentice witches**: Coco, Agott, Tetia, and Richeh
- Each character has unique **stats, lore, and a passive ability** that affects gameplay
- Guild Wars-inspired layout: full-body character display, face icon selector, and a stat/lore info panel

### Spell Loadout
- Pick **3–4 spells** from a pool of attack, defense, and heal spells
- Visual spell cards with type badges, difficulty stars, and stat previews
- Bottom loadout bar shows your selected spells at a glance

### Battle Screen
- **Pokémon-inspired layout**: your witch in the bottom-left, the Brimhat Sorcerer in the top-right
- **Sigil drawing mechanic**: click a spell, then draw its sigil on the canvas — accuracy determines spell power
  - High accuracy → full damage/heal/shield
  - Low accuracy (< 30%) → backfire, damages yourself
- **Turn-based combat** with enemy AI that casts spells between your turns
- HP bars, shield tracking, floating damage numbers, and shake animations on hit
- Animated battle background with drifting sigil glyphs, sparkles, and rising embers
- Live **Battle Log** showing the last 6 combat events
- Exit confirmation when trying to flee mid-battle

### Result Screen
- Victory or defeat screen with flavour text per character
- Options to **Rematch**, pick a **New Witch**, or return to the homepage

---

## 🧙 Characters & Passives

| Character | HP  | Passive |
|-----------|-----|---------|
| **Coco**   | 90  | Accuracy Bonus — sigil drawings score higher |
| **Agott**  | 85  | Attack Boost — attack spells deal 15% more damage |
| **Tetia**  | 95  | Healing Touch — heal spells restore 30% more HP |
| **Richeh** | 100 | Barrier Craft — shield spells block 20% more damage |

---

## 🛠️ Tech Stack

- **Vite** + **React** (functional components, hooks)
- **Canvas API** — freehand sigil drawing with accuracy scoring
- **Vanilla CSS** via inline styles — no CSS framework
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
├── assets/          # Character images
├── components/
│   ├── BattleBackground.jsx   # Animated battle background
│   ├── SigilCanvas.jsx        # Spell drawing canvas
│   └── UI.jsx                 # Shared UI components (NavBar, btnStyle)
├── screens/
│   ├── Landing.jsx
│   ├── About.jsx
│   ├── CharacterSelect.jsx
│   ├── Loadout.jsx
│   ├── Battle.jsx
│   └── Result.jsx
├── App.jsx          # Root with game state and screen routing
├── data.js          # Characters, spells, and enemy data
└── sigils.js        # Sigil shape definitions for drawing recognition
```

---

## ⚖️ Disclaimer

This is an **unofficial fan project** created for non-commercial, educational purposes.  
All characters, names, and artwork related to *Witch Hat Atelier* are the property of their respective owners.  
Kamome Shirahama / Kodansha · Anime © Bug Films · All rights reserved.

---

*Developed by [Garence Wong](https://github.com/GarenceWong)*
