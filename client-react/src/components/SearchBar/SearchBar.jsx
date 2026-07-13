import { useTranslation } from "react-i18next";

function SearchBar({
  user,
  searchQuery,
  searchResults,
  searchMessage,
  handleInputChange,
  handleSelectAsset,
}) {
  const { t } = useTranslation();

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        placeholder={t("SEARCH_PLACEHOLDER")}
        value={searchQuery}
        onChange={(e) => handleInputChange(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          background: "#010409",
          color: "#fff",
          border: "1px solid #21262d",
          borderRadius: "6px",
          boxSizing: "border-box",
          fontSize: "14px",
        }}
      />

      {searchResults.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#3a475a",
            border: "1px solid #30363d",
            borderRadius: "6px",
            marginTop: "5px",
            zIndex: 10,
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            overflow: "hidden",
          }}
        >
          {searchResults.map((asset) => (
            <div
              key={asset.symbol}
              onClick={() => handleSelectAsset(asset, user)}
              style={{
                padding: "4px 14px",
                borderBottom: "1px solid #21262d",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#21262d")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <div>
                <span
                  style={{
                    fontWeight: "bold",
                    color: "#fff",
                    marginRight: "10px",
                    fontSize: "14px",
                  }}
                >
                  {asset.symbol}
                </span>
                <span style={{ color: "#b6c5d5", fontSize: "14px" }}>
                  — {asset.name}
                </span>
              </div>
              <span
                style={{
                  fontSize: "14px",
                  color: "#a4c8f1",
                  padding: "3px 8px",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                {asset.asset_type}
              </span>
            </div>
          ))}
        </div>
      )}

      {searchMessage && (
        <p
          style={{
            textAlign: "center",
            color: "#58a6ff",
            marginTop: "10px",
            fontSize: "13px",
          }}
        >
          {searchMessage}
        </p>
      )}
    </div>
  );
}
export default SearchBar;
