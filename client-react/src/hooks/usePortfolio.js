import { useState } from "react";

export function usePortfolio() {
  const [portfolioAssets, setPortfolioAssets] = useState([]);
  const [activePortfolio, setActivePortfolio] = useState((user) => {
    const saved = user;
    if (user && user !== "undefined") {
      const parsed = JSON.parse(saved);
      const active = parsed.portfolios?.find((p) => p.selected === 1);
      return active ? active.id : 1;
    }
    return 0;
  });
  const clear = () => {
    setPortfolioAssets([]);
  };

  return {
    portfolioAssets,
    activePortfolio,
    setActivePortfolio,
    setPortfolioAssets,
    clear,
  };
}

export default usePortfolio;
