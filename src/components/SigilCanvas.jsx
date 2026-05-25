import { useState, useRef, useEffect } from "react";
import { generateSigil, calcAccuracy } from "../sigils.js";
import { btnStyle } from "./UI.jsx";

export default function SigilCanvas({ spell, onComplete, characterBonus }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [done, setDone] = useState(false);
  const [accuracy, setAccuracy] = useState(null);
  const template = generateSigil(spell.sigilType);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 300, 300);

    // Parchment background
    ctx.fillStyle = "#F5E6D3";
    ctx.fillRect(0, 0, 300, 300);
    const grad = ctx.createRadialGradient(150, 150, 0, 150, 150, 200);
    grad.addColorStop(0, "rgba(201,167,120,0.05)");
    grad.addColorStop(1, "rgba(160,120,80,0.15)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 300, 300);

    // Draw template guide
    ctx.strokeStyle = "rgba(120,80,40,0.25)";
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    let started = false;
    for (const p of template) {
      if (p === null) {
        ctx.stroke();
        ctx.beginPath();
        started = false;
        continue;
      }
      if (!started) {
        ctx.moveTo(p.x, p.y);
        started = true;
      } else {
        ctx.lineTo(p.x, p.y);
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw user strokes
    const validPoints = points.filter((p) => p !== null);
    if (validPoints.length > 1) {
      ctx.strokeStyle = done
        ? accuracy >= 60
          ? "#2C5E1A"
          : "#8B1A1A"
        : "#1A1A3A";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      let penDown = false;
      for (let i = 0; i < points.length; i++) {
        if (points[i] === null) {
          if (penDown) ctx.stroke();
          ctx.beginPath();
          penDown = false;
          continue;
        }
        if (!penDown) {
          ctx.moveTo(points[i].x, points[i].y);
          penDown = true;
        } else {
          ctx.lineTo(points[i].x, points[i].y);
        }
      }
      if (penDown) ctx.stroke();

      // Glow on success
      if (done && accuracy >= 60) {
        ctx.shadowColor = "#C9A96E";
        ctx.shadowBlur = 15;
        ctx.strokeStyle = "rgba(201,169,110,0.4)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        penDown = false;
        for (let i = 0; i < points.length; i++) {
          if (points[i] === null) {
            if (penDown) ctx.stroke();
            ctx.beginPath();
            penDown = false;
            continue;
          }
          if (!penDown) {
            ctx.moveTo(points[i].x, points[i].y);
            penDown = true;
          } else {
            ctx.lineTo(points[i].x, points[i].y);
          }
        }
        if (penDown) ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    // Accuracy result text
    if (done && accuracy !== null) {
      ctx.fillStyle = accuracy >= 60 ? "#2C5E1A" : "#8B1A1A";
      ctx.font = "bold 28px Cinzel";
      ctx.textAlign = "center";
      ctx.fillText(`${accuracy}%`, 150, 155);
      ctx.font = "14px Cormorant Garamond";
      ctx.fillText(
        accuracy >= 80
          ? "Perfect Cast!"
          : accuracy >= 60
          ? "Spell Cast"
          : "Backfire!",
        150,
        180
      );
    }
  }, [points, done, accuracy, template]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 300 / rect.width;
    const scaleY = 300 / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    if (done) return;
    e.preventDefault();
    setDrawing(true);
    const p = getPos(e);
    setPoints((prev) => [...prev, null, p]);
  };

  const moveDraw = (e) => {
    if (!drawing || done) return;
    e.preventDefault();
    const p = getPos(e);
    setPoints((prev) => [...prev, p]);
  };

  const endDraw = () => {
    if (done) return;
    setDrawing(false);
  };

  const castSpell = () => {
    const validPts = points.filter((p) => p !== null);
    let acc = calcAccuracy(validPts, template);
    if (characterBonus) acc = Math.min(100, acc + 10);
    setAccuracy(acc);
    setDone(true);
    setTimeout(() => onComplete(acc), 1200);
  };

  const resetDraw = () => {
    setPoints([]);
    setDone(false);
    setAccuracy(null);
  };

  const validCount = points.filter((p) => p !== null).length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          color: "#8B7355",
          fontFamily: "Cormorant Garamond",
          fontStyle: "italic",
        }}
      >
        Trace the {spell.name} sigil
      </div>
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        style={{
          border: "2px solid #C9A96E",
          borderRadius: "8px",
          cursor: done ? "default" : "crosshair",
          touchAction: "none",
          maxWidth: "100%",
          width: "min(300px, 80vw)",
          height: "auto",
          aspectRatio: "1",
        }}
        onMouseDown={startDraw}
        onMouseMove={moveDraw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={moveDraw}
        onTouchEnd={endDraw}
      />
      {!done && (
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={resetDraw}
            style={{
              ...btnStyle,
              background: "transparent",
              color: "#8B7355",
              border: "1px solid #C9A96E",
            }}
          >
            Clear
          </button>
          <button
            onClick={castSpell}
            disabled={validCount < 10}
            style={{ ...btnStyle, opacity: validCount < 10 ? 0.4 : 1 }}
          >
            Cast Spell
          </button>
        </div>
      )}
    </div>
  );
}
