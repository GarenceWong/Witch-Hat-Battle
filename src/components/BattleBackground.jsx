const bgCSS = `
@keyframes drift1 { 0%{transform:translate(0,0) rotate(0deg);opacity:0.12} 25%{transform:translate(30px,-40px) rotate(90deg);opacity:0.2} 50%{transform:translate(-20px,-80px) rotate(180deg);opacity:0.08} 75%{transform:translate(40px,-30px) rotate(270deg);opacity:0.18} 100%{transform:translate(0,0) rotate(360deg);opacity:0.12} }
@keyframes drift2 { 0%{transform:translate(0,0) rotate(0deg);opacity:0.08} 33%{transform:translate(-40px,20px) rotate(120deg);opacity:0.15} 66%{transform:translate(20px,-30px) rotate(240deg);opacity:0.06} 100%{transform:translate(0,0) rotate(360deg);opacity:0.08} }
@keyframes drift3 { 0%{transform:translate(0,0) rotate(0deg) scale(1)} 50%{transform:translate(-30px,40px) rotate(180deg) scale(1.1)} 100%{transform:translate(0,0) rotate(360deg) scale(1)} }
@keyframes bgPulse1 { 0%,100%{opacity:0.06;transform:scale(1)} 50%{opacity:0.14;transform:scale(1.04)} }
@keyframes bgPulse2 { 0%,100%{opacity:0.04;transform:scale(1)} 50%{opacity:0.1;transform:scale(1.06)} }
@keyframes sparkle { 0%,100%{opacity:0} 20%{opacity:0.8} 40%{opacity:0.2} 60%{opacity:0.9} 80%{opacity:0.1} }
@keyframes riseFade { 0%{transform:translateY(0) scale(1);opacity:0.5} 100%{transform:translateY(-200px) scale(0.3);opacity:0} }
`;

const glyphStyle = {
  position: "absolute",
  borderRadius: "50%",
  border: "1px solid rgba(201,169,110,0.15)",
};

const glyphInnerStyle = {
  position: "absolute",
  borderRadius: "50%",
  border: "1px solid rgba(201,169,110,0.1)",
  top: "15%",
  left: "15%",
  width: "70%",
  height: "70%",
};

const inkWashStyle = {
  position: "absolute",
  borderRadius: "50%",
  filter: "blur(60px)",
};

const particleStyle = {
  position: "absolute",
  width: "2px",
  height: "2px",
  background: "rgba(201,169,110,0.7)",
  borderRadius: "50%",
};

const lineH = {
  position: "absolute",
  top: "50%",
  left: "10%",
  right: "10%",
  height: "1px",
  background: "rgba(201,169,110,0.1)",
};

const lineV = {
  position: "absolute",
  left: "50%",
  top: "10%",
  bottom: "10%",
  width: "1px",
  background: "rgba(201,169,110,0.1)",
};

export default function BattleBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        background: "#1A1210",
        pointerEvents: "none",
      }}
    >
      <style>{bgCSS}</style>


      {/* Base gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 30% 70%, #2A1A12 0%, #1A1210 60%), radial-gradient(ellipse at 70% 30%, #1E1428 0%, transparent 50%)",
        }}
      />

      {/* Ink wash glows */}
      <div
        style={{
          ...inkWashStyle,
          width: "300px",
          height: "300px",
          background: "rgba(74,44,94,0.12)",
          top: "10%",
          left: "5%",
          animation: "bgPulse1 8s ease-in-out infinite",
        }}
      />
      <div
        style={{
          ...inkWashStyle,
          width: "250px",
          height: "250px",
          background: "rgba(139,85,55,0.1)",
          bottom: "10%",
          right: "10%",
          animation: "bgPulse2 10s ease-in-out infinite",
        }}
      />
      <div
        style={{
          ...inkWashStyle,
          width: "200px",
          height: "200px",
          background: "rgba(91,140,122,0.08)",
          top: "40%",
          left: "50%",
          animation: "bgPulse1 12s ease-in-out infinite 2s",
        }}
      />

      {/* Floating sigil glyphs */}
      <div
        style={{
          ...glyphStyle,
          width: "120px",
          height: "120px",
          top: "15%",
          left: "12%",
          animation: "drift1 25s ease-in-out infinite",
        }}
      >
        <div style={glyphInnerStyle} />
        <div style={lineH} />
        <div style={lineV} />
      </div>

      <div
        style={{
          ...glyphStyle,
          width: "80px",
          height: "80px",
          top: "60%",
          right: "15%",
          animation: "drift2 20s ease-in-out infinite 3s",
        }}
      >
        <div style={glyphInnerStyle} />
      </div>

      <div
        style={{
          ...glyphStyle,
          width: "160px",
          height: "160px",
          bottom: "5%",
          left: "30%",
          animation: "drift3 30s ease-in-out infinite 1s",
          borderStyle: "dashed",
        }}
      >
        <div style={{ ...glyphInnerStyle, borderStyle: "dashed" }} />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "40px",
            height: "40px",
            border: "1px solid rgba(201,169,110,0.08)",
            borderRadius: "50%",
            transform: "translate(-50%,-50%)",
          }}
        />
      </div>

      <div
        style={{
          ...glyphStyle,
          width: "60px",
          height: "60px",
          top: "25%",
          right: "30%",
          animation: "drift1 18s ease-in-out infinite 5s",
        }}
      >
        <div style={glyphInnerStyle} />
      </div>

      {/* Triangles */}
      {[
        { top: "20%", right: "22%", anim: "drift2 22s ease-in-out infinite 2s", opacity: 0.5, scale: 1 },
        { bottom: "30%", left: "20%", anim: "drift1 28s ease-in-out infinite 4s", opacity: 0.3, scale: 0.7 },
        { top: "50%", left: "45%", anim: "drift3 24s ease-in-out infinite 6s", opacity: 0.4, scale: 0.5, rotate: 180 },
      ].map((t, i) => (
        <div
          key={`tri-${i}`}
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderLeft: "30px solid transparent",
            borderRight: "30px solid transparent",
            borderBottom: "52px solid rgba(201,169,110,0.06)",
            top: t.top,
            bottom: t.bottom,
            left: t.left,
            right: t.right,
            opacity: t.opacity,
            animation: t.anim,
            transform: `scale(${t.scale})${t.rotate ? ` rotate(${t.rotate}deg)` : ""}`,
          }}
        />
      ))}

      {/* Sparkle particles */}
      {[
        { top: "30%", left: "20%", delay: "0s", dur: "4s" },
        { top: "50%", left: "60%", delay: "1s", dur: "5s" },
        { top: "70%", left: "35%", delay: "2s", dur: "3.5s" },
        { top: "20%", right: "25%", delay: "0.5s", dur: "4.5s" },
        { top: "80%", right: "40%", delay: "3s", dur: "3s" },
        { top: "45%", left: "15%", delay: "1.5s", dur: "5.5s" },
        { top: "65%", right: "20%", delay: "2.5s", dur: "4s" },
        { top: "15%", left: "45%", delay: "3.5s", dur: "3.8s" },
        { top: "55%", left: "80%", delay: "0.8s", dur: "4.2s" },
        { top: "85%", left: "55%", delay: "4s", dur: "5s" },
      ].map((p, i) => (
        <div
          key={`spark-${i}`}
          style={{
            ...particleStyle,
            top: p.top,
            left: p.left,
            right: p.right,
            animation: `sparkle ${p.dur} ease-in-out infinite ${p.delay}`,
          }}
        />
      ))}

      {/* Rising embers */}
      {[
        { top: "90%", left: "25%", size: 3, dur: "6s", delay: "0s" },
        { top: "95%", left: "50%", size: 2, dur: "8s", delay: "2s" },
        { top: "92%", left: "70%", size: 3, dur: "7s", delay: "4s" },
        { top: "88%", left: "40%", size: 2, dur: "9s", delay: "1s" },
        { top: "93%", left: "85%", size: 2, dur: "7.5s", delay: "3s" },
      ].map((e, i) => (
        <div
          key={`ember-${i}`}
          style={{
            ...particleStyle,
            top: e.top,
            left: e.left,
            width: `${e.size}px`,
            height: `${e.size}px`,
            background: `rgba(201,169,110,${0.3 + i * 0.05})`,
            animation: `riseFade ${e.dur} ease-out infinite ${e.delay}`,
          }}
        />
      ))}

      {/* Vignette overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(10,6,4,0.7) 100%)",
        }}
      />

      {/* Subtle parchment texture lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(201,169,110,0.008) 2px, rgba(201,169,110,0.008) 4px)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
