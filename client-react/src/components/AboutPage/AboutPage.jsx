import { useTranslation } from "react-i18next";

function AboutPage({ setIsAboutOpen, handleCoffeeDonation }) {
  const { t } = useTranslation();
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
            gap: "12px",
            maxHeight: "600px",
            overflowY: "auto",
            paddingRight: "18px",
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
            {t("ABOUT_MARKET_WATCHER")}
          </h2>
          <p style={{ marginTop: "-15px" }}>
            {t("WELCOME_TO")} <strong>{t("MARKET_WATCHER")}</strong>,{" "}
            {t("WELCOME_TO_ENDING")}
          </p>

          <h3
            style={{
              color: "#f0883e",
              marginTop: "-15px",
              marginBottom: "-15px",
            }}
          >
            🚀 {t("SYSTEM_CORE_SPEC")}
          </h3>
          <ul style={{ paddingLeft: "20px" }}>
            <li>
              <strong>{t("FRONTEND_ARCH")}</strong>
              {t("FRONTEND_ARCH_DESC")}
            </li>
            <li>
              <strong>{t("BACKEND_CONT_ARCH")}</strong> {t("BACKEND_CONT_DESC")}
            </li>
            <li>
              <strong>{t("DATA_SYNC")}</strong> {t("DATA_SYNC_DESC")}
            </li>
            <li>
              <strong>{t("RELATIONAL_STORAGE")}</strong>{" "}
              {t("RELATIONAL_STORAGE_DESC")}
            </li>
            <li>
              <strong>{t("ACCESS_SECURITY")}</strong>{" "}
              {t("ACCESS_SECURITY_DESC")}
            </li>
          </ul>

          <p style={{ marginTop: "-5px" }}>{t("ABOUT_FINAL_TEXT")}</p>

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
              {t("IF_MARKET_WATCHER_HELPED")}
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
              }}
            >
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
                ☕ {t("BUY_ME_A_COFFEE")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
