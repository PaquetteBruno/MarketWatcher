import AboutPage from "../AboutPage/AboutPage";
import { useTranslation } from "react-i18next";

function PageFooter({
  debugLog,
  showConsole,
  setShowConsole,
  isAboutOpen,
  setIsAboutOpen,
  handleCoffeeDonation,
}) {
  const { t } = useTranslation();
  return (
    <div>
      <hr
        style={{ height: "1px", backgroundColor: "#22262d", border: "none" }}
      />
      <div
        style={{
          marginTop: "20px",
          display: "block",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div style={{ textAlign: "left" }}>
            <button
              onClick={() => setIsAboutOpen(true)}
              style={{
                marginRight: "20px",
                background: "#21262d",
                color: "#8b949e",
                border: "1px solid #30363d",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              {t("ABOUT")}
            </button>
          </div>

          <div style={{ textAlign: "right" }}>
            <button
              onClick={() => setShowConsole(!showConsole)}
              style={{
                background: "#21262d",
                color: "#8b949e",
                border: "1px solid #30363d",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              {showConsole ? "Hide Console" : "Show Console"}
            </button>
          </div>
        </div>

        <div
          style={{
            marginTop: "30px",
            borderTop: "1px solid #21262d",
            paddingTop: "30px",
            display: showConsole ? "block" : "none",
          }}
        >
          <h3 style={{ textAlign: "left", color: "#ffffff" }}>
            🖥️ System Console Logger
          </h3>
          <textarea
            readOnly
            value={debugLog}
            style={{
              width: "100%",
              height: "140px",
              background: "#010409",
              color: "#7cfc00",
              padding: "16px",
              fontFamily: "monospace",
              fontSize: "12px",
              border: "1px solid #21262d",
              borderRadius: "6px",
              resize: "none",
            }}
          />
        </div>
      </div>

      {isAboutOpen && (
        <div onClick={() => setIsAboutOpen(false)}>
          <AboutPage handleCoffeeDonation={handleCoffeeDonation} />;
        </div>
      )}
    </div>
  );
}
export default PageFooter;
