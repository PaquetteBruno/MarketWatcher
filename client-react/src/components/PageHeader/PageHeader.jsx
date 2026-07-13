import { useTranslation } from "react-i18next";

function PageHeader({ onRefresh }) {
  const { t } = useTranslation();

  return (
    <header
      style={{
        marginBottom: "10px",
        borderBottom: "1px solid #21262d",
        paddingBottom: "0px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <h1
          style={{
            color: "#ffffff",
            margin: "0 0 5px 0",
            fontSize: "24px",
          }}
        >
          📈 {t("TITLE")}
        </h1>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "10px",
        }}
      >
        <button
          onClick={() => onRefresh()}
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
          {t("REFRESH")}
        </button>
      </div>
    </header>
  );
}

export default PageHeader;
