function Portfolios({ auth, handlePortfolioChange, handleNewPortfolio }) {
  return (
    <div
      style={{
        marginTop: "10px",
        display: "flex",
        background: "#161b22",
        padding: "8px",
        borderRadius: "8px",
        border: "1px solid #21262d",
      }}
    >
      {auth?.user?.portfolios?.map((portfolio) => (
        <button
          key={portfolio.id}
          onClick={() => handlePortfolioChange(portfolio.id)}
          style={{
            flex: 1,
            background:
              portfolio.id === auth.portfolio.id ? "#21262d" : "transparent",
            color: portfolio.id === auth.portfolio.id ? "#58a6ff" : "#8b949e",
            borderRight: "1px solid gray",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: portfolio.id === auth.portfolio.id ? "600" : "500",
          }}
        >
          {portfolio.name}
        </button>
      ))}
      <button
        onClick={() => handleNewPortfolio()}
        style={{
          flex: 1,
          background: "transparent",
          color: "#8b949e",
          borderRight: "1px solid gray",
          borderRadius: "6px",
          cursor: "pointer",
          textTransform: "uppercase",
          fontSize: "34px",
          fontWeight: "500",
        }}
      >
        +
      </button>
    </div>
  );
}
export default Portfolios;
