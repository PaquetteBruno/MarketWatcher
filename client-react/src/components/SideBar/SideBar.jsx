import { useTranslation } from "react-i18next";

function SideBar() {
  const { t } = useTranslation();
  return (
    <div>
      <h1
        style={{
          color: "#ffffff",
          margin: "0 0 5px 0",
          fontSize: "24px",
        }}
      >
        📋 {t("SIDEBAR_TITLE")}
      </h1>
    </div>
  );
}
export default SideBar;
