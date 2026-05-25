export const CHARACTERS = [
  {
    id: "coco",
    name: "Coco",
    title: "The Outsider Apprentice",
    hp: 100,
    power: 10,
    color: "#C97B4B",
    desc: "A girl born without magic who discovered the forbidden truth — that anyone can become a witch.",
    passive: "Drawing Prodigy: +10% accuracy bonus",
  },
  {
    id: "agott",
    name: "Agott",
    title: "The Prideful Prodigy",
    hp: 85,
    power: 13,
    color: "#7B68AE",
    desc: "A talented apprentice from a prestigious witch family, driven by pride and hidden insecurity.",
    passive: "Raw Power: +15% spell damage",
  },
  {
    id: "tetia",
    name: "Tetia",
    title: "The Gentle Heart",
    hp: 115,
    power: 8,
    color: "#E8A0BF",
    desc: "A kind-hearted apprentice whose gentle nature belies surprising resilience.",
    passive: "Mending Touch: +30% healing power",
  },
  {
    id: "richeh",
    name: "Richeh",
    title: "The Silent Scholar",
    hp: 95,
    power: 11,
    color: "#5B8C7A",
    desc: "A quiet, observant apprentice who speaks little but sees much.",
    passive: "Arcane Shield: +20% defense spells",
  },
];

export const SPELLS = [
  {
    id: "watershot_seal",
    name: "Watershot Seal",
    type: "attack",
    baseDmg: 30,
    icon: "💧",
    desc: "A water sigil that launches a high-pressure jet at the target",
    difficulty: 2,
    sigilType: "watershot_seal",
  },
  {
    id: "healing_craft",
    name: "Healing Craft",
    type: "heal",
    baseHeal: 25,
    icon: "✚",
    desc: "A forbidden craft that mends the caster's wounds through light and earth",
    difficulty: 2,
    sigilType: "healing_craft",
  },
];

export const ENEMY_DATA = {
  name: "Brimhat Sorcerer",
  hp: 100,
  power: 10,
  color: "#8B1A1A",
  spells: ["watershot_seal"],
};
