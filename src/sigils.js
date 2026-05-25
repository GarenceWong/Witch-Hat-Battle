/**
 * Generate sigil template points for a given type.
 * Returns array of {x,y} points (null = pen lift) in 300×300 space.
 */
export function generateSigil(type) {
  const cx = 150, cy = 150;
  const pts = [];

  switch (type) {

    // ── Flan Gale: two concentric open arcs (C-shape, opening right) ─────────
    case "gale_arc": {
      for (let i = 0; i <= 60; i++) {
        const a = Math.PI * 0.25 + (i / 60) * Math.PI * 1.5; // 270° arc
        pts.push({ x: cx + 88 * Math.cos(a), y: cy + 88 * Math.sin(a) });
      }
      pts.push(null);
      for (let i = 0; i <= 40; i++) {
        const a = Math.PI * 0.35 + (i / 40) * Math.PI * 1.3; // 234° inner arc
        pts.push({ x: cx + 50 * Math.cos(a), y: cy + 50 * Math.sin(a) });
      }
      return pts;
    }

    // ── Watershot Seal (WHA image): ring + S-curve + water-drop + T-stem
    //    + 8 T-keystones ────────────────────────────────────────────────────
    case "watershot_seal": {
      const R = 82;

      // 1. Outer ring
      for (let i = 0; i <= 56; i++) {
        const a = (i / 56) * Math.PI * 2;
        pts.push({ x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) });
      }
      pts.push(null);

      // 2. S-curve: two smooth semicircles sharing a tangent at the midpoint.
      //    Upper semicircle bows RIGHT; lower semicircle bows LEFT.
      //    Both have radius 9, centres vertically ±9 from cy, axis at cx−8.
      const sCx = cx - 8, sR = 9;
      // Upper arc: centre (sCx, cy−sR), −π/2 → +π/2 through 0 (rightward bow)
      for (let i = 0; i <= 18; i++) {
        const a = -Math.PI / 2 + (i / 18) * Math.PI;
        pts.push({ x: sCx + sR * Math.cos(a), y: (cy - sR) + sR * Math.sin(a) });
      }
      // Lower arc: centre (sCx, cy+sR), −π/2 → −3π/2 through −π (leftward bow)
      for (let i = 0; i <= 18; i++) {
        const a = -Math.PI / 2 - (i / 18) * Math.PI;
        pts.push({ x: sCx + sR * Math.cos(a), y: (cy + sR) + sR * Math.sin(a) });
      }
      pts.push(null);

      // 3. Water-drop (right side of centre, top-aligned with S-curve)
      //    Teardrop: arc from lower-left over top to lower-right, then V to tip
      const ddR = 7, ddCx = cx + 10, ddCy = cy - 9, ddTipY = cy + 5;
      for (let i = 0; i <= 20; i++) {
        const a = (2 * Math.PI / 3) + (i / 20) * (5 * Math.PI / 3);
        pts.push({ x: ddCx + ddR * Math.cos(a), y: ddCy + ddR * Math.sin(a) });
      }
      pts.push({ x: ddCx, y: ddTipY });
      pts.push({ x: ddCx + ddR * Math.cos(2 * Math.PI / 3), y: ddCy + ddR * Math.sin(2 * Math.PI / 3) });
      pts.push(null);

      // 4. Bottom vertical stem + horizontal T-bar (just below centre symbol)
      pts.push({ x: cx + 1, y: cy + 20 }, { x: cx + 1, y: cy + 36 });
      pts.push(null);
      pts.push({ x: cx - 9, y: cy + 36 }, { x: cx + 11, y: cy + 36 });
      pts.push(null);

      // 5. Eight T-keystones: crossbar just outside the ring, stem crosses inward
      for (let k = 0; k < 8; k++) {
        const a  = (k / 8) * Math.PI * 2 - Math.PI / 2; // 0 = 12 o'clock
        const pa = a + Math.PI / 2;
        const L  = 8;
        const barCx = cx + (R + 5) * Math.cos(a);
        const barCy = cy + (R + 5) * Math.sin(a);
        // crossbar (horizontal, outside the ring)
        pts.push({ x: barCx - L * Math.cos(pa), y: barCy - L * Math.sin(pa) });
        pts.push({ x: barCx + L * Math.cos(pa), y: barCy + L * Math.sin(pa) });
        pts.push(null);
        // stem from outside to inside ring
        pts.push({ x: barCx, y: barCy });
        pts.push({ x: cx + (R - 10) * Math.cos(a), y: cy + (R - 10) * Math.sin(a) });
        pts.push(null);
      }

      return pts;
    }

    // ── Galdo Greem: diamond outline with centre tick (legacy) ───────────────
    case "earth_diamond": {
      pts.push(
        { x: cx,      y: cy - 90 },
        { x: cx + 82, y: cy      },
        { x: cx,      y: cy + 90 },
        { x: cx - 82, y: cy      },
        { x: cx,      y: cy - 90 }, // close
      );
      pts.push(null);
      pts.push({ x: cx, y: cy - 28 }, { x: cx, y: cy + 28 }); // centre tick
      return pts;
    }

    // ── Healing Craft: outer ring + cross + 4 filled dots at cardinal points ─
    case "healing_craft": {
      const R = 82;
      const dotR = 10;

      // Outer ring
      for (let i = 0; i <= 56; i++) {
        const a = (i / 56) * Math.PI * 2;
        pts.push({ x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) });
      }
      pts.push(null);

      // Vertical bar of the cross
      pts.push({ x: cx, y: cy - R }, { x: cx, y: cy + R });
      pts.push(null);

      // Horizontal bar of the cross
      pts.push({ x: cx - R, y: cy }, { x: cx + R, y: cy });
      pts.push(null);

      // Four filled dots at top / right / bottom / left intersections
      for (const [dcx, dcy] of [[cx, cy - R], [cx + R, cy], [cx, cy + R], [cx - R, cy]]) {
        for (let i = 0; i <= 14; i++) {
          const a = (i / 14) * Math.PI * 2;
          pts.push({ x: dcx + dotR * Math.cos(a), y: dcy + dotR * Math.sin(a) });
        }
        pts.push(null);
      }

      return pts;
    }

    // ── Lumen Shard: hexagram (two overlapping equilateral triangles) ────────
    case "hex_star": {
      // Triangle pointing up: vertices at -90°, 30°, 150°
      const upAngles   = [-Math.PI / 2, Math.PI / 6, 5 * Math.PI / 6, -Math.PI / 2];
      const downAngles = [ Math.PI / 2, 7 * Math.PI / 6, 11 * Math.PI / 6,  Math.PI / 2];
      pts.push(...upAngles  .map(a => ({ x: cx + 88 * Math.cos(a), y: cy + 88 * Math.sin(a) })));
      pts.push(null);
      pts.push(...downAngles.map(a => ({ x: cx + 88 * Math.cos(a), y: cy + 88 * Math.sin(a) })));
      return pts;
    }

    // ── Eidal Ward: full circle with inscribed upward triangle ───────────────
    case "ward_circle": {
      for (let i = 0; i <= 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        pts.push({ x: cx + 88 * Math.cos(a), y: cy + 88 * Math.sin(a) });
      }
      pts.push(null);
      const triAngles = [-Math.PI / 2, Math.PI / 6, 5 * Math.PI / 6, -Math.PI / 2];
      pts.push(...triAngles.map(a => ({ x: cx + 65 * Math.cos(a), y: cy + 65 * Math.sin(a) })));
      return pts;
    }

    // ── Mending Loop: horizontal ellipse with small centre circle ────────────
    case "mend_oval": {
      for (let i = 0; i <= 56; i++) {
        const a = (i / 56) * Math.PI * 2;
        pts.push({ x: cx + 90 * Math.cos(a), y: cy + 56 * Math.sin(a) });
      }
      pts.push(null);
      for (let i = 0; i <= 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        pts.push({ x: cx + 18 * Math.cos(a), y: cy + 18 * Math.sin(a) });
      }
      return pts;
    }

    // ── Vita Bloom: outer circle with 3-petal rose inside ────────────────────
    case "bloom_rose": {
      for (let i = 0; i <= 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        pts.push({ x: cx + 88 * Math.cos(a), y: cy + 88 * Math.sin(a) });
      }
      pts.push(null);
      for (let i = 0; i <= 120; i++) {
        const t = (i / 120) * Math.PI * 2;
        const r = 52 * Math.abs(Math.cos(1.5 * t));
        pts.push({ x: cx + r * Math.cos(t), y: cy + r * Math.sin(t) });
      }
      return pts;
    }

    // ── Legacy shapes (kept for backwards compat) ────────────────────────────
    case "circle_cross": {
      for (let i = 0; i <= 40; i++) {
        const a = (i / 40) * Math.PI * 2;
        pts.push({ x: cx + 90 * Math.cos(a), y: cy + 90 * Math.sin(a) });
      }
      pts.push(null);
      pts.push({ x: cx, y: cy - 70 }, { x: cx, y: cy + 70 });
      pts.push(null);
      pts.push({ x: cx - 70, y: cy }, { x: cx + 70, y: cy });
      return pts;
    }
    case "spiral": {
      for (let i = 0; i <= 80; i++) {
        const t = i / 80;
        const a = t * Math.PI * 4;
        const r = 20 + t * 80;
        pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
      }
      return pts;
    }
    case "triangle_circle": {
      for (let i = 0; i <= 40; i++) {
        const a = (i / 40) * Math.PI * 2;
        pts.push({ x: cx + 90 * Math.cos(a), y: cy + 90 * Math.sin(a) });
      }
      pts.push(null);
      const tri = [0, 1, 2, 0].map(i => {
        const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
        return { x: cx + 70 * Math.cos(a), y: cy + 70 * Math.sin(a) };
      });
      pts.push(...tri);
      return pts;
    }

    default:
      return [];
  }
}

/**
 * Calculate drawing accuracy (0–100) using three components:
 *
 *  Coverage   (45%) – what fraction of template points have a drawn point nearby
 *  Precision  (35%) – what fraction of drawn points are actually on the template
 *                     (penalises scribbling outside the shape)
 *  Uniformity (20%) – are all parts of the shape covered, not just some sections
 *                     (penalises drawing only half the sigil)
 */
export function calcAccuracy(drawn, template) {
  const tPts = template.filter(p => p !== null);
  if (drawn.length < 8 || tPts.length === 0) return 0;

  const THRESH = 26;         // px — "close enough to be on-target"
  const SEGMENTS = 10;       // number of sections to check for uniformity

  // ── 1. Coverage ──────────────────────────────────────────────────────────
  let covered = 0;
  for (const tp of tPts) {
    for (const dp of drawn) {
      if (Math.hypot(tp.x - dp.x, tp.y - dp.y) < THRESH) { covered++; break; }
    }
  }
  const coverageScore = covered / tPts.length;

  // ── 2. Precision ─────────────────────────────────────────────────────────
  let onTarget = 0;
  for (const dp of drawn) {
    for (const tp of tPts) {
      if (Math.hypot(tp.x - dp.x, tp.y - dp.y) < THRESH) { onTarget++; break; }
    }
  }
  const precisionScore = onTarget / drawn.length;

  // ── 3. Uniformity ────────────────────────────────────────────────────────
  let segsCovered = 0;
  for (let s = 0; s < SEGMENTS; s++) {
    const lo  = Math.floor((s       / SEGMENTS) * tPts.length);
    const hi  = Math.floor(((s + 1) / SEGMENTS) * tPts.length);
    const seg = tPts.slice(lo, hi);
    const hit = seg.some(tp =>
      drawn.some(dp => Math.hypot(tp.x - dp.x, tp.y - dp.y) < THRESH)
    );
    if (hit) segsCovered++;
  }
  const uniformityScore = segsCovered / SEGMENTS;

  // ── Weighted total ────────────────────────────────────────────────────────
  const raw = 0.45 * coverageScore + 0.35 * precisionScore + 0.20 * uniformityScore;
  return Math.round(raw * 100);
}
