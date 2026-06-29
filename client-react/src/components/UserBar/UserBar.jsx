/**
 * UserBar
 *
 * Responsibility:
 * Displays the top section of the application.
 *
 * Receives:
 * To be defined.
 *
 * Does NOT:
 * To be defined.
 */

function UserBar({
  username,
  handleSignOut,
  handleLangChange,
  currentLang,
  t,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "0 40px",
      }}
    >
      <div
        style={{
          position: "absolute", // Fixed pins it relative to the window, completely ignoring inner div spaces
          top: "15px",
          right: "41px",
          zIndex: 999999, // 👈 HIGHER INTENSITY LAYER GAIN: Forces flags over your global banner completely
          display: "flex",
          gap: "12px",
          padding: "0px 14px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.5)",
          alignItems: "center",
        }}
      >
        {/* 🇺🇸 English Selector Button */}
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
            opacity: currentLang === "en" ? 1 : 0.75, // 👈 BRIGHTER STANDBY OPACITY (0.55 instead of 0.3)
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

        {/* 🇫🇷 French Selector Button */}
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
            opacity: currentLang === "fr" ? 1 : 0.75, // 👈 BRIGHTER STANDBY OPACITY
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

        {/* 🇪🇸 Spanish Selector Button */}
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
            opacity: currentLang === "es" ? 1 : 0.75, // 👈 BRIGHTER STANDBY OPACITY
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
        <span
          style={{
            fontSize: "13px",
            color: "#8b949e",
            marginLeft: "10px",
            marginTop: "0px",
          }}
        >
          <strong style={{ color: "#58a6ff" }}>{username || "Guest"}</strong>
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
      </div>
    </div>
  );
}

export default UserBar;
