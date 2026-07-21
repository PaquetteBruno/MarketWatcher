import { useCallback } from "react";

export default function useInit(
  token,
  userId,
  loadGlobalData,
  loadActivePortfolio,
  loadPortfolios,
  loadAssets,
) {
  const load = useCallback(async () => {
    await loadGlobalData(token);

    const portfolioId = await loadActivePortfolio(token, userId);

    await loadAssets(token, portfolioId);
    await loadPortfolios(token, userId);
  }, [
    token,
    userId,
    loadGlobalData,
    loadActivePortfolio,
    loadPortfolios,
    loadAssets,
  ]);

  return load;
}
