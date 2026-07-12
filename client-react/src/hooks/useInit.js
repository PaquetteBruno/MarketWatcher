import { useCallback } from "react";

export default function useInit(auth, global, portfolio) {
  const load = useCallback(async () => {
    console.log(auth.token, auth.user);

    await global.loadGlobalData(auth.token);

    const portfolioId = await portfolio.loadActivePortfolio(
      auth.token,
      auth.user.id,
    );

    await portfolio.loadAssets(auth.token, portfolioId);

    console.log("Loading application...");
  }, [auth.token, auth.user?.id]);

  return load;
}
