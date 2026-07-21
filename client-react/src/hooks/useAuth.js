import { useState, useCallback } from "react";

export function useAuth() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("mw_user");

    return saved && saved !== "undefined" ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("mw_token");
  });

  const completeLogin = useCallback((userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);

    localStorage.setItem("mw_user", JSON.stringify(userData));
    localStorage.setItem("mw_token", tokenData);
  }, []);

  const updatePortfolios = useCallback(
    (portfolios) => {
      const updatedUser = {
        ...user,
        portfolios,
      };

      setUser(updatedUser);

      localStorage.setItem("mw_user", JSON.stringify(updatedUser));
    },
    [user],
  );

  const completeLogout = useCallback(() => {
    localStorage.removeItem("mw_token");
    localStorage.removeItem("mw_user");

    setUser(null);
    setToken(null);
  }, []);

  return {
    user,
    token,
    completeLogin,
    completeLogout,
    updatePortfolios,
  };
}

export default useAuth;
