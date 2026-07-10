import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import i18n from "./i18n.js";
import LoginPage from "./components/LoginPage/LoginPage";
import GlobalTicker from "./components/GlobalTicker/GlobalTicker";
import UserBar from "./components/UserBar/UserBar";
import PageHeader from "./components/PageHeader/PageHeader";
import SideBar from "./components/SideBar/SideBar";
import SearchBar from "./components/SearchBar/SearchBar";
import Portfolios from "./components/Portfolio/Portfolio";
import AssetList from "./components/AssetList/AssetList";
import PageFooter from "./components/PageFooter/PageFooter";
import globalService from "./services/globalService";
import portfolioService from "./services/portfolioService";
import searchService from "./services/searchService";
import authService from "./services/authService";
import googleService from "./services/googleService";
import useAuth from "./hooks/useAuth";
import usePortfolio from "./hooks/usePortfolio";
import useGlobal from "./hooks/useGlobal";
import useSearch from "./hooks/useSearch";

function App() {
  const t = (key) => i18n.t(key);
  const timerRef = useRef(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [showConsole, setShowConsole] = useState(false);
  const [debugLog, setDebugLog] = useState("");
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const auth = useAuth();
  const portfolio = usePortfolio();
  const global = useGlobal();
  const search = useSearch();

  useEffect(() => {
    if (auth.token || auth.user) return;

    const initGoogle = () => {
      if (window.google && (!auth.token || !auth.user)) {
        window.google.accounts.id.initialize({
          client_id:
            "607204517221-liol36qcu1b51u42a69gid0fthokfvvc.apps.googleusercontent.com",
          callback: async (resObj) => {
            setAuthError("");
            try {
              const response = await googleService.google(
                JSON.stringify({ idToken: resObj.credential }),
              );

              if (!response.ok) {
                throw new Error(data.error || "Verification rejected.");
              }
              const data = await response.json();
              auth.completeLogin(data.user, data.token);
            } catch (err) {
              setAuthError(err.message);
            }
          },
        });
        window.google.accounts.id.renderButton(
          document.getElementById("googleBtnAnchor"),
          { theme: "outline", size: "large", width: "340" },
        );
      }
    };
    if (window.google) {
      initGoogle();
    } else {
      window.addEventListener("load", initGoogle);
      return () => window.removeEventListener("load", initGoogle);
    }
  }, [auth]);
  // First page load
  useEffect(() => {
    const displayGlobalData = async () => {
      const data = await globalService.getGlobalData(auth.token);
      global.setGlobalData(data);
    };

    displayGlobalData();
  }, [global, auth]);

  const handleLangChange = (lng) => {
    i18n.changeLanguage(lng);
    //portfolio.setActivePortfolio(portfolio.activePortfolio);
  };

  const getPortfolioAssets = useCallback(async () => {
    const assets = await portfolioService.getPortfolioAssets(
      auth.token,
      portfolio.activePortfolio,
    );
    portfolio.setPortfolioAssets(assets);
  }, [auth, portfolio]);

  const handlePortfolioChange = async (portfolio_id) => {
    portfolioService.updateSelected(portfolio_id, auth.token);
    portfolio.setActivePortfolio(portfolio_id);
  };

  const handleNewPortfolio = async () => {
    window.alert("New Portfolio");
  };

  useEffect(() => {
    const initFetch = async () => {
      await getPortfolioAssets();
    };
    initFetch();

    return;
  }, [auth, getPortfolioAssets]);

  const handleInputChange = async (text) => {
    search.setSearchQuery(text);
    search.setSearchMessage("");

    if (text.trim().length < 3) {
      search.setSearchResults([]);
      return;
    }

    const data = await searchService.search(text);
    search.setSearchResults(data || []);
  };

  const handleSelectAsset = async (asset) => {
    search.setSearchResults([]);
    search.setSearchQuery("");

    try {
      await portfolioService.addPortfolioAsset(
        portfolio.activePortfolio,
        asset.symbol,
        asset.name,
        asset.asset_type,
        asset.price,
        asset.price_change,
      );

      search.setSearchMessage(
        `[${asset.symbol}] ${asset.name} was added successfully.`,
      );

      getPortfolioAssets();
    } catch (error) {
      search.setSearchMessage(`Error trying to add asset: ${error.message}`);
    }
  };

  const removeAssetFromPortfolio = async (symbol) => {
    if (!window.confirm(`Remove ${symbol}?`)) return;
    try {
      await portfolioService.deletePortfolioAsset(
        portfolio.activePortfolio,
        symbol,
      );

      getPortfolioAssets();
    } catch (error) {
      setDebugLog(`Removal Failure: ${error.message}`);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const response = authService.register(username, email, password);
      if (response.ok) {
        setIsRegistering(false);
        setPassword("");
      } else {
        setAuthError(response.error || "AUTHENTICATION_FAILED");
      }
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const response = await authService.login(email, password);

      if (!response.ok) {
        throw new Error(response.error || "LOGIN_FAILED");
      }

      auth.completeLogin(response.user, response.token);

      portfolio.setActivePortfolio(
        auth.user.portfolios.find((p) => p.selected === 1).id,
      );
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleSignOut = () => {
    auth.completeLogout();

    portfolio.clear();
    global.clear();
    search.clear();

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setDebugLog("Sign out completed.");
  };

  const onRefresh = () => {
    getPortfolioAssets();
  };

  const handleCoffeeDonation = () => {
    const paypalMeUrl = "https://paypal.me/BrunoPaquette";
    window.open(paypalMeUrl, "_blank", "noopener,noreferrer");
  };

  if (!auth.token || !auth.user) {
    return (
      <LoginPage
        username={username}
        email={email}
        password={password}
        isRegistering={isRegistering}
        setIsRegistering={setIsRegistering}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
        setUsername={setUsername}
        setEmail={setEmail}
        setPassword={setPassword}
        authError={authError}
        setAuthError={setAuthError}
        t={t}
      ></LoginPage>
    );
  }

  return (
    <div>
      <UserBar
        username={auth.user?.username}
        handleSignOut={handleSignOut}
        handleLangChange={handleLangChange}
        currentLang={i18n.language || "en"}
        t={t}
      />

      <div className="app-container">
        <GlobalTicker globalData={global.globalData} />

        <div style={{ display: "flex", gap: "2%", marginTop: "20px" }}>
          <div style={{ width: "calc(70% - 2%)" }}>
            <PageHeader
              smallIcon="📈"
              title={t("TITLE")}
              onRefresh={onRefresh}
              t={t}
            />
            <div className="content-layout">
              <SearchBar
                user={auth.user}
                searchQuery={search.searchQuery}
                searchResults={search.searchResults}
                searchMessage={search.searchMessage}
                handleInputChange={handleInputChange}
                handleSelectAsset={handleSelectAsset}
                t={t}
              />
            </div>
            <Portfolios
              user={auth.user}
              handlePortfolioChange={handlePortfolioChange}
              handleNewPortfolio={handleNewPortfolio}
              activePortfolio={portfolio.activePortfolio}
            />
            <AssetList
              portfolioAssets={portfolio.portfolioAssets}
              removeAssetFromPortfolio={removeAssetFromPortfolio}
              t={t}
            ></AssetList>
            )
          </div>
          <div style={{ width: "30%", fontSize: "24px" }}>
            <SideBar
              smallIcon="📋"
              title={t("Positions (Future update)")}
            ></SideBar>
          </div>
        </div>

        <PageFooter
          debugLog={debugLog}
          showConsole={showConsole}
          setShowConsole={setShowConsole}
          isAboutOpen={isAboutOpen}
          setIsAboutOpen={setIsAboutOpen}
          handleCoffeeDonation={handleCoffeeDonation}
        ></PageFooter>
      </div>
    </div>
  );
}

export default App;
