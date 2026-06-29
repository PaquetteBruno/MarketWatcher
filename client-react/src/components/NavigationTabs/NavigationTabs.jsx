function NavigationTabs({ user, activeTab, handleNavigationTabChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        marginBottom: "5px",
        marginTop: "10px",
        background: "#161b22",
        padding: "8px",
        borderRadius: "8px",
        border: "1px solid #21262d",
      }}
    >
      {["portfolio"].map((t) => (
        <button
          key={t}
          onClick={() => handleNavigationTabChange(t)}
          style={{
            flex: 1,
            padding: "12px",
            background: activeTab === t ? "#21262d" : "transparent",
            color: activeTab === t ? "#58a6ff" : "#8b949e",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            textTransform: "uppercase",
            fontSize: "12px",
            fontWeight: activeTab === t ? "600" : "500",
          }}
        >
          ⭐ {user?.portfolio_name}
        </button>
      ))}
    </div>
  );
}
export default NavigationTabs;
