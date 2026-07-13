import { useCallback } from "react";

export default function useInit(
  token,
  userId,
  loadGlobalData,
  loadActivePortfolio,
  loadAssets,
) {
  const load = useCallback(async () => {
    await loadGlobalData(token);

    const portfolioId = await loadActivePortfolio(token, userId);

    await loadAssets(token, portfolioId);

    console.log("Loading application...");
  }, [token, userId, loadGlobalData, loadActivePortfolio, loadAssets]);

  return load;
}
