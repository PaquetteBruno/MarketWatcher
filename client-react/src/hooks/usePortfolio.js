import { useState, useCallback, useMemo } from "react";
import portfolioService from "../services/portfolioService";

export function usePortfolio() {
  const [portfolioAssets, setPortfolioAssets] = useState([]);
  const [activePortfolio, setActivePortfolio] = useState(0);
  const [portfolios, setPortfolios] = useState([]);
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

  const loadPortfolios = useCallback(async (token, userId) => {
    const portfolios = await portfolioService.getPortfolios(token, userId);

    setPortfolios(portfolios);
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
      portfolios,
      setActivePortfolio,
      setPortfolios,
      clearAssets,
      loadAssets,
      loadActivePortfolio,
      loadPortfolios,
    }),
    [
      portfolioAssets,
      activePortfolio,
      portfolios,
      setActivePortfolio,
      setPortfolios,
      clearAssets,
      loadAssets,
      loadActivePortfolio,
      loadPortfolios,
    ],
  );
}

export default usePortfolio;
