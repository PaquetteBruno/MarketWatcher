import { useState } from "react";
import portfolioService from "../services/portfolioService";

export function usePortfolio() {
  const [portfolioAssets, setPortfolioAssets] = useState([]);
  const [activePortfolio, setActivePortfolio] = useState(0);

  const clearAssets = () => {
    setPortfolioAssets([]);
  };

  const loadActivePortfolio = async (token, user_id) => {
    const portfolio = await portfolioService.getActivePortfolio(token, user_id);
    const id = portfolio[0].id;

    setActivePortfolio(id);

    return id;
  };

  const loadAssets = async (token, portfolioId) => {
    const assets = await portfolioService.getPortfolioAssets(
      token,
      portfolioId,
    );

    setPortfolioAssets(assets);
  };

  return {
    portfolioAssets,
    activePortfolio,
    clearAssets,
    loadAssets,
    loadActivePortfolio,
  };
}

export default usePortfolio;
