function AboutPage({ setIsAboutOpen, handleCoffeeDonation }) {
  return (
    <div
      onClick={() => setIsAboutOpen(false)} // Clicking the dark background backdrop closes it
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(1, 4, 9, 0.8)", // Clean dimmed glass layer
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        padding: "10px",
        boxSizing: "border-box",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the card
        style={{
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "780px",
          padding: "10px 5px 25px 25px",
          position: "relative",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5)",
          boxSizing: "border-box",
          animation: "fadeIn 0.2s ease-out",
        }}
      >
        <div
          style={{
            color: "#c9d1d9",
            fontSize: "14.5px",
            lineHeight: "1.6",
            display: "flex",
            flexDirection: "column",
            gap: "12px", // Slightly larger gap for readability
            maxHeight: "600px", // 🌟 Caps the height so it doesn't leak out of the screen
            overflowY: "auto", // 🌟 Automatically adds a scrollbar when content overflows
            paddingRight: "18px", // Gutter space so text doesn't touch the scrollbar
            textAlign: "left",
          }}
        >
          <h2
            style={{
              color: "#58a6ff",
              marginTop: "0",
              borderBottom: "1px solid #21262d",
              paddingBottom: "0px",
              textAlign: "center",
            }}
          >
            About Market Watcher
          </h2>
          <p style={{ marginTop: "-15px" }}>
            Welcome to <strong>Market Watcher</strong>, a personal multi-user
            real-time trading dashboard built to aggregate financial movements
            across the global economy.
          </p>

          <h3
            style={{
              color: "#f0883e",
              marginTop: "-15px",
              marginBottom: "-15px",
            }}
          >
            🚀 System Core Specifications
          </h3>
          <ul style={{ paddingLeft: "20px" }}>
            <li>
              <strong>Frontend Architecture:</strong> React SPA powered by
              Vite's ultra-fast hot-reloading development compiler.
            </li>
            <li>
              <strong>Backend Controller:</strong> Node.js & Express framework
              executing secure REST API communication lines.
            </li>
            <li>
              <strong>Data Synchronization:</strong> Live market evaluation
              engines driven by the Yahoo Finance API.
            </li>
            <li>
              <strong>Relational Storage:</strong> Scalable local MySQL database
              management caching historical parameters.
            </li>
            <li>
              <strong>Access Security:</strong> Encrypted local user credentials
              (via bcrypt) combined with secure Google Single Sign-On (SSO).
            </li>
          </ul>

          <p style={{ marginTop: "-5px" }}>
            This application was engineered as an educational environment to
            master advanced full-stack integration patterns, state caching
            loops, real-time animation hooks, and secure third-party
            authentication middleware layers.
          </p>

          {/* ☕ INTEGRATED LIVE PAYPAL LINK & DYNAMIC QR CODE CONTAINER */}
          <div
            style={{
              marginTop: "5px",
              paddingTop: "25px",
              borderTop: "1px solid #21262d",
              textAlign: "center",
              background: "#0d1117",
              padding: "25px",
              borderRadius: "6px",
              border: "1px solid #21262d",
            }}
          >
            <p
              style={{
                fontSize: "14px",
                color: "#8b949e",
                margin: "0 0 20px 0",
              }}
            >
              If Market Watcher helped you in any way or you just enjoyed it,
              consider supporting my server costs!
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
              }}
            >
              {/* The Yellow Clickable PayPal Gate Button */}
              <button
                onClick={handleCoffeeDonation}
                style={{
                  background: "#ffc439",
                  color: "#003087",
                  border: "none",
                  borderRadius: "25px",
                  padding: "5px 28px",
                  fontSize: "15px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
                  transition: "transform 0.2s, background-color 0.2s",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#ffe194";
                  e.currentTarget.style.transform = "scale(1.03)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#ffc439";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                ☕ Buy me a coffee via PayPal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
