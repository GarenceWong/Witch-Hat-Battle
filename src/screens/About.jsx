import { btnStyle, pageStyle, NavBar, Footer } from "../components/UI.jsx";

export default function About({ onNav }) {
  return (
    <div style={pageStyle}>
      <NavBar onBack={() => onNav("landing")} title="The World of Tongari Boushi" />
      <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "32px", animation: "fadeIn 0.6s ease" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎩</div>
          <h2 style={{ fontFamily: "Uncial Antiqua", fontSize: "24px", color: "#F5E6D3", marginBottom: "8px" }}>
            The Magic of Ink
          </h2>
          <p style={{ fontFamily: "Cormorant Garamond", fontSize: "15px", color: "#A89070", fontStyle: "italic" }}>
            Magic is not a gift — it is a craft, drawn with precision and intent.
          </p>
        </div>

        {[
          {
            icon: "🖋️",
            title: "Glyph Magic",
            text: "Every spell begins with a sigil — geometric patterns drawn with enchanted ink. The precision of the glyph determines the spell's power. Sloppy drawing can cause dangerous backfires.",
          },
          {
            icon: "👒",
            title: "The Pointed Hats",
            text: "Witches who guard the secret that anyone can perform magic. They wear pointed hats as a mark of their order, maintaining strict rules about who may learn the craft.",
          },
          {
            icon: "📜",
            title: "The Forbidden Truth",
            text: "The greatest secret of this world: magic is not an innate gift. Anyone who learns to draw glyphs can cast spells. This truth is suppressed to prevent chaos.",
          },
          {
            icon: "⚗️",
            title: "The Atelier",
            text: "Witch workshops where apprentices study under a master. Qifrey's Atelier houses Coco and her fellow apprentices as they learn the art of glyph magic.",
          },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              background: "rgba(201,169,110,0.06)",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "16px",
              borderLeft: "3px solid #C9A96E44",
              animation: "fadeIn 0.6s ease",
              animationDelay: `${0.2 + i * 0.15}s`,
              animationFillMode: "backwards",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span style={{ fontSize: "20px" }}>{item.icon}</span>
              <h3 style={{ fontFamily: "Cinzel", fontSize: "14px", color: "#C9A96E", letterSpacing: "1px" }}>
                {item.title}
              </h3>
            </div>
            <p style={{ fontFamily: "Cormorant Garamond", fontSize: "15px", color: "#A89070", lineHeight: 1.6 }}>
              {item.text}
            </p>
          </div>
        ))}

        <button
          onClick={() => onNav("characters")}
          style={{ ...btnStyle, width: "100%", marginTop: "8px", textAlign: "center" }}
        >
          Meet the Apprentices →
        </button>
      </div>
      <Footer onNav={onNav} />
    </div>
  );
}
