import { useTranslation } from "react-i18next";

function UserBar({ user, handleSignOut, handleLangChange }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "en";
  return (
    <div
      style={{
        width: "95%",
        maxWidth: "1800px",
        display: "flex",
        margin: "0 auto",
        paddingRight: "35px",
        justifyContent: "flex-end",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "15px",
          zIndex: 999999,
          display: "flex",
          gap: "20px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.5)",
          alignItems: "center",
        }}
      >
        {/* US */}
        <img
          src="https://flagcdn.com/32x24/us.webp"
          alt="English"
          title="English"
          onClick={() => handleLangChange("en")}
          style={{
            width: "24px",
            height: "16px",
            borderRadius: "2px",
            cursor: "pointer",
            opacity: currentLang === "en" ? 1 : 0.75,
            transform: currentLang === "en" ? "scale(1.15)" : "scale(1)",
            transition: "opacity 0.2s, transform 0.2s",
            boxShadow:
              currentLang === "en" ? "0 0 8px rgba(88,166,255,0.6)" : "none",
          }}
          onMouseEnter={(e) => {
            if (currentLang !== "en") e.currentTarget.style.opacity = "0.85";
          }}
          onMouseLeave={(e) => {
            if (currentLang !== "en") e.currentTarget.style.opacity = "0.55";
          }}
        />

        {/* FR */}
        <img
          src="https://flagcdn.com/32x24/fr.webp"
          alt="Français"
          title="Français"
          onClick={() => handleLangChange("fr")}
          style={{
            width: "24px",
            height: "16px",
            borderRadius: "2px",
            cursor: "pointer",
            opacity: currentLang === "fr" ? 1 : 0.75,
            transform: currentLang === "fr" ? "scale(1.15)" : "scale(1)",
            transition: "opacity 0.2s, transform 0.2s",
            boxShadow:
              currentLang === "fr" ? "0 0 8px rgba(88,166,255,0.6)" : "none",
          }}
          onMouseEnter={(e) => {
            if (currentLang !== "fr") e.currentTarget.style.opacity = "0.85";
          }}
          onMouseLeave={(e) => {
            if (currentLang !== "fr") e.currentTarget.style.opacity = "0.55";
          }}
        />

        {/* ES */}
        <img
          src="https://flagcdn.com/32x24/es.webp"
          alt="Español"
          title="Español"
          onClick={() => handleLangChange("es")}
          style={{
            width: "24px",
            height: "16px",
            borderRadius: "2px",
            cursor: "pointer",
            opacity: currentLang === "es" ? 1 : 0.75,
            transform: currentLang === "es" ? "scale(1.15)" : "scale(1)",
            transition: "opacity 0.2s, transform 0.2s",
            boxShadow:
              currentLang === "es" ? "0 0 8px rgba(88,166,255,0.6)" : "none",
          }}
          onMouseEnter={(e) => {
            if (currentLang !== "es") e.currentTarget.style.opacity = "0.85";
          }}
          onMouseLeave={(e) => {
            if (currentLang !== "es") e.currentTarget.style.opacity = "0.55";
          }}
        />
        {user && (
          <>
            <span
              style={{
                fontSize: "13px",
                color: "#8b949e",
                marginLeft: "10px",
                marginRight: "10px",
                marginTop: "0px",
              }}
            >
              <strong style={{ color: "#58a6ff" }}>
                {user?.username || "Guest"}
              </strong>
            </span>
            <button
              onClick={() => {
                console.log("Sign out proxy initiated.");
                if (typeof handleSignOut === "function") {
                  handleSignOut();
                } else {
                  alert(
                    "Error: handleSignOut is not being passed correctly as a function! It is currently: " +
                      typeof handleSignOut,
                  );
                }
              }}
              style={{
                background: "transparent",
                color: "#58a6ff",
                border: "1px solid #58a6ff",
                padding: "3px 8px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: "600",
              }}
            >
              {t("SIGN_OUT")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default UserBar;
