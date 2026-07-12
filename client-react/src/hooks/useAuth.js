import { useState, useCallback } from "react";

export function useAuth() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("mw_user");

    return saved && saved !== "undefined" ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("mw_token");
  });

  const [portfolio, setPortfolio] = useState(() => {
    return JSON.parse(localStorage.getItem("mw_portfolio"));
  });

  const completeLogin = useCallback((userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    setPortfolio(userData.portfolios.find((c) => c.selected === 1));

    localStorage.setItem("mw_user", JSON.stringify(userData));
    localStorage.setItem("mw_token", tokenData);
    localStorage.setItem(
      "mw_portfolio",
      JSON.stringify(userData.portfolios.find((c) => c.selected === 1)),
    );
  }, []);

  const completeLogout = useCallback(() => {
    localStorage.removeItem("mw_token");
    localStorage.removeItem("mw_user");
    localStorage.removeItem("mw_portfolio");

    setUser(null);
    setToken(null);
    setPortfolio(null);
  }, []);

  return {
    user,
    token,
    portfolio,
    completeLogin,
    completeLogout,
  };
}

export default useAuth;
