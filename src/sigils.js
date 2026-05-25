/**
 * Generate sigil template points for a given type.
 * Returns array of {x, y} points (null = pen lift) in a 300x300 space.
 */
export function generateSigil(type) {
  const cx = 150;
  const cy = 150;
  const pts = [];

  switch (type) {
    case "circle_cross": {
      // Circle with a cross inside
      for (let i = 0; i <= 40; i++) {
        const a = (i / 40) * Math.PI * 2;
        pts.push({ x: cx + 90 * Math.cos(a), y: cy + 90 * Math.sin(a) });
      }
      pts.push(null); // pen lift
      pts.push({ x: cx, y: cy - 70 }, { x: cx, y: cy + 70 });
      pts.push(null);
      pts.push({ x: cx - 70, y: cy }, { x: cx + 70, y: cy });
      return pts;
    }

    case "spiral": {
      // Outward spiral
      for (let i = 0; i <= 80; i++) {
        const t = i / 80;
        const a = t * Math.PI * 4;
        const r = 20 + t * 80;
        pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
      }
      return pts;
    }

    case "star": {
      // 5-pointed star
      for (let i = 0; i <= 10; i++) {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? 100 : 40;
        pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
      }
      // Close the star
      pts.push({
        x: cx + 100 * Math.cos(-Math.PI / 2),
        y: cy + 100 * Math.sin(-Math.PI / 2),
      });
      return pts;
    }

    case "concentric": {
      // Two concentric circles
      for (let i = 0; i <= 40; i++) {
        const a = (i / 40) * Math.PI * 2;
        pts.push({ x: cx + 50 * Math.cos(a), y: cy + 50 * Math.sin(a) });
      }
      pts.push(null);
      for (let i = 0; i <= 40; i++) {
        const a = (i / 40) * Math.PI * 2;
        pts.push({ x: cx + 90 * Math.cos(a), y: cy + 90 * Math.sin(a) });
      }
      return pts;
    }

    case "triangle_circle": {
      // Circle with inscribed triangle
      for (let i = 0; i <= 40; i++) {
        const a = (i / 40) * Math.PI * 2;
        pts.push({ x: cx + 90 * Math.cos(a), y: cy + 90 * Math.sin(a) });
      }
      pts.push(null);
      const tri = [0, 1, 2, 0].map((i) => {
        const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
        return { x: cx + 70 * Math.cos(a), y: cy + 70 * Math.sin(a) };
      });
      pts.push(...tri);
      return pts;
    }

    case "flower": {
      // 3-petal flower shape
      for (let i = 0; i <= 60; i++) {
        const a = (i / 60) * Math.PI * 2;
        const r = 60 + 30 * Math.cos(a * 3);
        pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
      }
      return pts;
    }

    default:
      return [];
  }
}

/**
 * Calculate accuracy of drawn points vs template.
 * Returns 0-100 score.
 */
export function calcAccuracy(drawn, template) {
  const tPts = template.filter((p) => p !== null);
  if (drawn.length < 10 || tPts.length === 0) return 0;

  let totalDist = 0;
  for (const tp of tPts) {
    let minD = Infinity;
    for (const dp of drawn) {
      const d = Math.hypot(tp.x - dp.x, tp.y - dp.y);
      if (d < minD) minD = d;
    }
    totalDist += minD;
  }

  const avgDist = totalDist / tPts.length;
  const acc = Math.max(0, Math.min(100, 100 - avgDist * 1.2));
  return Math.round(acc);
}
