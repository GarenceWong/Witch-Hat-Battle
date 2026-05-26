/**
 * Generate sigil template points for a given type.
 * Returns array of {x,y} points (null = pen lift) in 300×300 space.
 */
export function generateSigil(type) {
  const cx = 150, cy = 150;
  const pts = [];

  // Sample a straight segment into pts every ~gap px (no dead-zones at THRESH_PREC).
  const line = (x0, y0, x1, y1, gap = 4) => {
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / gap));
    for (let s = 0; s <= n; s++) {
      const t = s / n;
      pts.push({ x: x0 + t * (x1 - x0), y: y0 + t * (y1 - y0) });
    }
  };

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
      const R = 125;

      // 1. Outer ring
      for (let i = 0; i <= 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        pts.push({ x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) });
      }
      pts.push(null);

      // 2. Centre S-curve: two stacked ELLIPTICAL arcs — long & slim (sRy=21 →
      //    84px tall, only ±13 bow). Inverted: upper arc bows left, lower bows right.
      const sCx = cx, sRx = 13, sRy = 21;
      for (let i = 0; i <= 28; i++) {
        const a = -Math.PI / 2 + (i / 28) * Math.PI;
        pts.push({ x: sCx - sRx * Math.cos(a), y: (cy - sRy) + sRy * Math.sin(a) });
      }
      for (let i = 0; i <= 28; i++) {
        const a = -Math.PI / 2 - (i / 28) * Math.PI;
        pts.push({ x: sCx - sRx * Math.cos(a), y: (cy + sRy) + sRy * Math.sin(a) });
      }
      pts.push(null);

      // 3. TOP raindrop — round TOP, pointed BOTTOM. Sits in the upper (now
      //    left-bowing) bend, on the right. Skinny bulb (rRx=7,rRy=11); tip down.
      const rRx = 7, rRy = 11, rCx = cx + 13, rCy = cy - 20, rTipY = cy - 2;
      for (let i = 0; i <= 24; i++) {
        const a = (2 * Math.PI / 3) + (i / 24) * (5 * Math.PI / 3);
        pts.push({ x: rCx + rRx * Math.cos(a), y: rCy + rRy * Math.sin(a) });
      }
      pts.push({ x: rCx, y: rTipY });
      pts.push({ x: rCx + rRx * Math.cos(2 * Math.PI / 3), y: rCy + rRy * Math.sin(2 * Math.PI / 3) });
      pts.push(null);

      // 4. BOTTOM flame — pointed TOP, round bottom. Sits in the lower (now
      //    right-bowing) bend, on the left. Skinny bulb (lRx=7,lRy=11); tip up.
      const lRx = 7, lRy = 11, lCx = cx - 13, lCy = cy + 20, lTipY = cy + 2;
      for (let i = 0; i <= 24; i++) {
        const a = -Math.PI / 3 + (i / 24) * (5 * Math.PI / 3);
        pts.push({ x: lCx + lRx * Math.cos(a), y: lCy + lRy * Math.sin(a) });
      }
      pts.push({ x: lCx, y: lTipY });
      pts.push({ x: lCx + lRx * Math.cos(-Math.PI / 3), y: lCy + lRy * Math.sin(-Math.PI / 3) });
      pts.push(null);

      // 5. Bottom vertical stem — starts at cy+54, leaving a clear gap below the S
      //    (S bottom ≈cy+42), down to the 6-o'clock keystone. ~8px steps, no dead-zones.
      for (let i = 0; i <= 4; i++) {
        pts.push({ x: cx, y: cy + 54 + i * 8 });
      }
      pts.push(null);

      // 5b. Second (smaller) crossbar on the bottom T — near the head (the main
      //     6-o'clock bar at ≈cy+95). Placed at cy+84, closer to the head.
      pts.push({ x: cx - 8, y: cy + 84 });
      pts.push({ x: cx,     y: cy + 84 });
      pts.push({ x: cx + 8, y: cy + 84 });
      pts.push(null);

      // 6. Eight T-keystones INSIDE the ring (crossbar at R-30=95, pushed out
      //    toward the ring). Crossbar is the outer cap; stem points inward to R-54.
      for (let k = 0; k < 8; k++) {
        const a  = (k / 8) * Math.PI * 2 - Math.PI / 2; // 0 = 12 o'clock
        const pa = a + Math.PI / 2;
        const L  = 13;
        const barR = R - 30;
        const barCx = cx + barR * Math.cos(a);
        const barCy = cy + barR * Math.sin(a);
        // crossbar (tangent to ring — the outer cap of the T)
        pts.push({ x: barCx - L * Math.cos(pa), y: barCy - L * Math.sin(pa) });
        pts.push({ x: barCx + L * Math.cos(pa), y: barCy + L * Math.sin(pa) });
        pts.push(null);
        // stem from crossbar pointing inward toward centre
        pts.push({ x: barCx, y: barCy });
        pts.push({ x: cx + (R - 54) * Math.cos(a), y: cy + (R - 54) * Math.sin(a) });
        pts.push(null);
      }

      return pts;
    }

    // ── Pyreball Seal (WHA image): ring + triangle-with-rays + stem + 5 arrows ──
    case "pyreball_seal": {
      const R = 125;

      // 1. Outer ring
      for (let i = 0; i <= 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        pts.push({ x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) });
      }
      pts.push(null);

      // 2. Triangle + rays — entire centre group rotated 5° clockwise.
      const tR = 48;
      const rot = 5 * Math.PI / 180;

      // Triangle vertices — base angles offset by rot
      const triV = [
        { x: cx + tR * Math.cos(-Math.PI / 2  + rot), y: cy + tR * Math.sin(-Math.PI / 2  + rot) },
        { x: cx + tR * Math.cos( Math.PI / 6  + rot), y: cy + tR * Math.sin( Math.PI / 6  + rot) },
        { x: cx + tR * Math.cos(5*Math.PI / 6 + rot), y: cy + tR * Math.sin(5*Math.PI / 6 + rot) },
      ];
      for (let e = 0; e < 3; e++) {
        const v0 = triV[e], v1 = triV[(e + 1) % 3];
        line(v0.x, v0.y, v1.x, v1.y);
        pts.push(null);
      }

      // Outward rays from each side midpoint (at distance tR/2 from centre).
      // Unrotated base angles: right=-π/6, left=-5π/6, bottom=π/2 — all shifted by rot.
      const rayLen = 32;
      for (const base of [-Math.PI / 6, -5 * Math.PI / 6, Math.PI / 2]) {
        const a  = base + rot;
        const mx = cx + (tR / 2) * Math.cos(a);
        const my = cy + (tR / 2) * Math.sin(a);
        line(mx, my, mx + Math.cos(a) * rayLen, my + Math.sin(a) * rayLen);
        pts.push(null);
      }

      // 4. Five inward-pointing ARROW glyphs (short shaft + wide forked barbs), 72°
      //    apart starting ~11 o'clock. Barbs are wider (45°) and longer than shaft
      //    so the chevron V dominates, matching the bold arrow marks in the reference.
      const tipR = 76, shaftLen = 30, barbLen = 22;
      const barbSpread = Math.PI / 4; // 45°
      const arrowAngles = [
        -2 * Math.PI / 3 - Math.PI / 7, // shifted anticlockwise ~26° toward 10 o'clock
        -Math.PI / 6,                // 1 o'clock
         Math.PI / 3 - Math.PI / 7,  // bottom-right, shifted up ~26°
         5 * Math.PI / 6,            // 7:30
      ];
      for (let k = 0; k < 4; k++) {
        const a    = arrowAngles[k];
        const tipX = cx + tipR * Math.cos(a);                 // arrowhead point (inner)
        const tipY = cy + tipR * Math.sin(a);
        const shX  = cx + (tipR + shaftLen) * Math.cos(a);    // shaft tail (outer)
        const shY  = cy + (tipR + shaftLen) * Math.sin(a);
        // shaft (outer tail → inner tip)
        line(shX, shY, tipX, tipY);
        pts.push(null);
        // crossbar perpendicular to shaft at the outer tail
        const crossHalf = 12;
        line(shX - Math.sin(a) * crossHalf, shY + Math.cos(a) * crossHalf,
             shX + Math.sin(a) * crossHalf, shY - Math.cos(a) * crossHalf);
        pts.push(null);
        // forked barbs opening outward from tip — wider spread makes the V prominent
        const b1x = tipX + barbLen * Math.cos(a + barbSpread);
        const b1y = tipY + barbLen * Math.sin(a + barbSpread);
        const b2x = tipX + barbLen * Math.cos(a - barbSpread);
        const b2y = tipY + barbLen * Math.sin(a - barbSpread);
        line(b1x, b1y, tipX, tipY);
        line(tipX, tipY, b2x, b2y);
        pts.push(null);
      }

      return pts;
    }

    // ── Billowing Collection (WHA image): ring + 4 thin loops + 4 bowtie marks ─
    case "billowing_collection": {
      const R = 125;

      // 1. Outer ring — 73 pts, ~10.8px spacing → midpoint gap 5.4px < THRESH_PREC ✓
      for (let i = 0; i <= 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        pts.push({ x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) });
      }
      pts.push(null);

      // 2. Centre flower — four THIN elongated loops (one per cardinal axis), each
      //    starting & ending at the centre. Lens loop: lx = (pL/2)(1−cos t) runs
      //    0→pL→0 along the axis; ly = pW·sin t gives the slim perpendicular swell.
      const pL = 32, pW = 8;
      const petalDirs = [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2];
      for (const pa of petalDirs) {
        const ca = Math.cos(pa), sa = Math.sin(pa);
        for (let i = 0; i <= 40; i++) {
          const t  = (i / 40) * Math.PI * 2;
          const lx = (pL / 2) * (1 - Math.cos(t));
          const ly = pW * Math.sin(t);
          pts.push({ x: cx + lx * ca - ly * sa, y: cy + lx * sa + ly * ca });
        }
        pts.push(null);
      }

      // 3. Four bowtie/hourglass marks at cardinal positions (top/right/bottom/left).
      //    Each is two triangles meeting at a central waist, with flat outer caps;
      //    the bowtie axis points radially (waist at the mark centre).
      const posR = 74, halfLen = 15, halfWid = 12;
      const cardAngles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
      for (const a of cardAngles) {
        const scx = cx + posR * Math.cos(a), scy = cy + posR * Math.sin(a);
        const rx = Math.cos(a),  ry = Math.sin(a);   // radial (outward)
        const tx = -Math.sin(a), ty = Math.cos(a);   // tangential
        const oL = { x: scx + halfLen * rx + halfWid * tx, y: scy + halfLen * ry + halfWid * ty }; // outer-left
        const oR = { x: scx + halfLen * rx - halfWid * tx, y: scy + halfLen * ry - halfWid * ty }; // outer-right
        const iL = { x: scx - halfLen * rx + halfWid * tx, y: scy - halfLen * ry + halfWid * ty }; // inner-left
        const iR = { x: scx - halfLen * rx - halfWid * tx, y: scy - halfLen * ry - halfWid * ty }; // inner-right
        // outer triangle: cap (oL→oR) + sides to the centre waist
        line(oL.x, oL.y, oR.x, oR.y);
        line(oR.x, oR.y, scx, scy);
        line(scx, scy, oL.x, oL.y);
        pts.push(null);
        // inner half: just the two diagonals from the waist toward the centre —
        // NO inner cap (that line sat too close to the centre loops).
        line(scx, scy, iL.x, iL.y);
        line(scx, scy, iR.x, iR.y);
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

      // Vertical bar — 17 points at ~10px intervals so no dead-zones
      for (let i = 0; i <= 16; i++) {
        pts.push({ x: cx, y: cy - R + i * (2 * R / 16) });
      }
      pts.push(null);

      // Horizontal bar — 17 points at ~10px intervals
      for (let i = 0; i <= 16; i++) {
        pts.push({ x: cx - R + i * (2 * R / 16), y: cy });
      }
      pts.push(null);

      // Four solid filled dots — rendered as filled arcs by SigilCanvas
      for (const [dcx, dcy] of [[cx, cy - R], [cx + R, cy], [cx, cy + R], [cx - R, cy]]) {
        pts.push({ fill: true, x: dcx, y: dcy, r: dotR });
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
  const tPts = template.flatMap(p => {
    if (p === null) return [];
    if (p.fill) {
      // Expand filled-circle marker into a 3px grid covering the disc
      const grid = [];
      for (let dx = -p.r; dx <= p.r; dx += 3)
        for (let dy = -p.r; dy <= p.r; dy += 3)
          if (dx * dx + dy * dy <= p.r * p.r) grid.push({ x: p.x + dx, y: p.y + dy });
      return grid;
    }
    return [p];
  });
  if (drawn.length < 8 || tPts.length === 0) return 0;

  const THRESH      = 24;  // px — generous window for coverage & uniformity
  const THRESH_PREC = 6;   // px — strict: must be ON the line. R=125 ring interior is
                           // 54% of canvas, but only ~18% is within 6px of the ring —
                           // so filling the ring scores ~18% precision → backfire.
  const SEGMENTS  = 12;
  const CENTRE_R  = 55;   // px from canvas centre — splits ring zone vs centre zone
  const CX = 150, CY = 150;

  const centerPts = tPts.filter(p => Math.hypot(p.x - CX, p.y - CY) <= CENTRE_R);
  const hasCentre = centerPts.length > 5;

  // ── 1. Coverage ──────────────────────────────────────────────────────────
  let covered = 0;
  for (const tp of tPts) {
    for (const dp of drawn) {
      if (Math.hypot(tp.x - dp.x, tp.y - dp.y) < THRESH) { covered++; break; }
    }
  }
  const coverageScore = covered / tPts.length;

  // Centre-zone coverage used for gating
  let covCenterCount = 0;
  if (hasCentre) {
    for (const tp of centerPts) {
      for (const dp of drawn) {
        if (Math.hypot(tp.x - dp.x, tp.y - dp.y) < THRESH) { covCenterCount++; break; }
      }
    }
  }
  const covCenter = hasCentre ? covCenterCount / centerPts.length : 1;

  // ── 2. Precision (tight THRESH_PREC) ─────────────────────────────────────
  // Only drawn points actually ON the template line count. Coloring the whole
  // canvas leaves most strokes far from any template point → low precision → low score.
  let onTarget = 0;
  for (const dp of drawn) {
    for (const tp of tPts) {
      if (Math.hypot(tp.x - dp.x, tp.y - dp.y) < THRESH_PREC) { onTarget++; break; }
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

  // ── 4. Angular coverage (OUTER points only) ──────────────────────────────
  // Build 12 angular sectors from the outer template points (radius > 0.6·maxR
  // — the ring / keystone caps, NOT the compact centre cluster). A straight line
  // touches the ring in only one direction, lighting up ~2–4 sectors; the real
  // sigil's ring spans all 12. Using centre points here would fail — any line
  // through the middle grazes the S/drops, which sit at many angles.
  let maxR = 0;
  for (const tp of tPts) maxR = Math.max(maxR, Math.hypot(tp.x - CX, tp.y - CY));
  const ANG_R = 0.6 * maxR;
  const ASECTORS = 12;
  const secHas = new Array(ASECTORS).fill(false);
  const secHit = new Array(ASECTORS).fill(false);
  for (const tp of tPts) {
    if (Math.hypot(tp.x - CX, tp.y - CY) < ANG_R) continue;
    const ang = Math.atan2(tp.y - CY, tp.x - CX);                 // -π … π
    const idx = Math.floor(((ang + Math.PI) / (2 * Math.PI)) * ASECTORS) % ASECTORS;
    secHas[idx] = true;
    if (!secHit[idx]) {
      for (const dp of drawn) {
        if (Math.hypot(tp.x - dp.x, tp.y - dp.y) < THRESH) { secHit[idx] = true; break; }
      }
    }
  }
  let secCov = 0, secTot = 0;
  for (let s = 0; s < ASECTORS; s++) if (secHas[s]) { secTot++; if (secHit[s]) secCov++; }
  const angular = secTot ? secCov / secTot : 1;

  // ── Weighted total + gates ───────────────────────────────────────────────
  // Precision is multiplicative: it gates coverage + uniformity rather than being
  // just another additive term. This means coloring the whole canvas (high coverage,
  // low precision ~0.20) yields raw ≈ 0.20 → backfire, not a free 65%.
  //
  // Formula: precision × (0.60·coverage + 0.20·uniformity + 0.20)
  //   • perfect trace (P=1, C=1, U=1) → 1.0 → 100
  //   • good trace    (P=0.78, C=0.88, U=0.85) → 0.78×0.908 ≈ 0.71 → ~64 after gates
  //   • full scribble (P=0.20, C=1, U=1) → 0.20×1.0 = 0.20 → 20 (backfire)
  //
  // centreGate: covering only the ring (untouched centre symbol) caps the score.
  // angularGate: ramps 0→1 across angular coverage 0.3→0.9, so a line (~0.3) is
  //   crushed while a full trace (ring covers all sectors → ~1.0) is unaffected.
  const centreGate  = hasCentre ? (0.35 + 0.65 * Math.min(1, covCenter * 2.5)) : 1;
  const angularGate = Math.max(0, Math.min(1, (angular - 0.3) / 0.6));
  const raw = precisionScore * (0.60 * coverageScore + 0.20 * uniformityScore + 0.20);
  return Math.round(raw * centreGate * angularGate * 100);
}
