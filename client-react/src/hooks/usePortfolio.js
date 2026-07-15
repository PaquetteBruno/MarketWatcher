import { useState, useCallback, useMemo } from "react";
import portfolioService from "../services/portfolioService";

export function usePortfolio() {
  const [portfolioAssets, setPortfolioAssets] = useState([]);
  const [activePortfolio, setActivePortfolio] = useState(0);

  const clearAssets = useCallback(() => {
    setPortfolioAssets([]);
  }, []);

  const loadActivePortfolio = useCallback(async (token, userId) => {
    const portfolioId = await portfolioService.getSelectedPortfolio(
      token,
      userId,
    );

    setActivePortfolio(portfolioId);

    return portfolioId;
  }, []);

  const loadAssets = useCallback(async (token, portfolioId) => {
    const assets = await portfolioService.getPortfolioAssets(
      token,
      portfolioId,
    );

    setPortfolioAssets(assets);
  }, []);

  return useMemo(
    () => ({
      portfolioAssets,
      activePortfolio,
      clearAssets,
      loadAssets,
      loadActivePortfolio,
    }),
    [
      portfolioAssets,
      activePortfolio,
      clearAssets,
      loadAssets,
      loadActivePortfolio,
    ],
  );
}

export default usePortfolio;
