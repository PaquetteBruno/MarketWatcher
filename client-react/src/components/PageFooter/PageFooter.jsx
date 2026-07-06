import { useEffect } from "react";
import AboutPage from "../AboutPage/AboutPage";

function PageFooter({
  debugLog,
  showConsole,
  setShowConsole,
  isAboutOpen,
  setIsAboutOpen,
  handleCoffeeDonation,
}) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.warn("GOOGLE_ADSENSE_ERROR", error.message);
    }
  }, []);

  return (
    <div>
      <div
        style={{
          margin: "40px auto 10px auto",
          padding: "15px",
          background: "#161b22",
          border: "1px dashed #30363d",
          borderRadius: "8px",
          width: "100%",
          textAlign: "center",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            display: "block",
            fontSize: "10px",
            color: "#8b949e",
            marginBottom: "10px",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          Advertisement
        </span>

        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="pub-1158075273498343"
          data-ad-slot="7260832859"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </div>

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
              About
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
