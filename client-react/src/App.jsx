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
import portfolioService from "./services/portfolioService.js";
import searchService from "./services/searchService.js";
import authService from "./services/authService.js";
import googleService from "./services/googleService.js";

function App() {
  const t = (key) => i18n.t(key);
  const timerRef = useRef(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [portfolioAssets, setPortfolioAssets] = useState([]);
  const [globalData, setGlobalData] = useState([]);
  const [showConsole, setShowConsole] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResultsArray, setSearchResultsArray] = useState([]);
  const [searchMessage, setSearchMessage] = useState("");
  const [debugLog, setDebugLog] = useState("");
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("mw_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem("mw_token") || null;
  });
  const [activePortfolio, setActivePortfolio] = useState(() => {
    const savedUser = localStorage.getItem("mw_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const active = parsed.portfolios?.find((p) => p.selected === 1);
      return active ? active.id : 1;
    }
    return 0;
  });

  useEffect(() => {
    const initGoogle = () => {
      if (window.google && (!token || !user)) {
        window.google.accounts.id.initialize({
          client_id:
            "607204517221-liol36qcu1b51u42a69gid0fthokfvvc.apps.googleusercontent.com",
          callback: async (resObj) => {
            setAuthError("");
            try {
              const data = await googleService.google(
                JSON.stringify({ idToken: resObj.credential }),
              );

              if (!data.ok) {
                throw new Error(data.error || "Verification rejected.");
              }

              localStorage.setItem("mw_token", data.token);
              localStorage.setItem("mw_user", JSON.stringify(data.user));
              setToken(data.token);
              setUser(data.user);
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
  }, [user, token]);

  // First page load
  useEffect(() => {
    //if (!user || !token) return; ----- I Need to know where to put this so It checks everytime instead of putting it everywhere.

    const displayGlobalData = async () => {
      try {
        const data = await globalService.getGlobalData(token);

        setGlobalData(data);
      } catch (error) {
        console.error("Failed to fetch global data:", error);
      }
    };

    displayGlobalData();
  }, [token]);

  const handleLangChange = (lng) => {
    i18n.changeLanguage(lng);
    setActivePortfolio(activePortfolio);
  };

  const fetchPortfolioAssets = useCallback(async () => {
    const assets = await portfolioService.getPortfolioAssets(
      token,
      activePortfolio,
    );
    setPortfolioAssets(assets);
  }, [token, activePortfolio]);

  const handlePortfolioChange = async (portfolio_id) => {
    portfolioService.updateSelected(portfolio_id, token);
    setActivePortfolio(portfolio_id);
  };

  const handleNewPortfolio = async () => {
    window.alert("New Portfolio");
  };

  useEffect(() => {
    const initFetch = async () => {
      await fetchPortfolioAssets();
    };
    initFetch();

    return;
  }, [user, token, fetchPortfolioAssets]);

  const handleInputChange = async (text) => {
    setSearchQuery(text);
    setSearchMessage("");

    if (text.trim().length < 3) {
      setSearchResultsArray([]);
      return;
    }

    const data = searchService.search(text);
    setSearchResultsArray(data || []);
  };

  const handleSelectAsset = async (asset, user) => {
    setSearchResultsArray([]);
    setSearchQuery("");

    try {
      await portfolioService.addPortfolioAsset(
        user.portfolioId,
        asset.symbol,
        asset.name,
        asset.asset_type,
        asset.price,
        asset.price_change,
      );

      setSearchMessage(
        `[${asset.symbol}] ${asset.name} was added successfully.`,
      );

      fetchPortfolioAssets();
    } catch (error) {
      setSearchMessage(`Error trying to add asset: ${error.message}`);
    }
  };

  const removeAssetFromPortfolio = async (symbol) => {
    if (!symbol || !user) return;

    if (!window.confirm(`Remove ${symbol}?`)) return;
    try {
      await portfolioService.deletePortfolioAsset(activePortfolio, symbol);

      fetchPortfolioAssets();
    } catch (error) {
      setDebugLog(`Removal Failure: ${error.message}`);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const response = authService.register(username, email, password);
      if (!response.ok) {
        throw new Error(response.error || "Rejected.");
      }
      setIsRegistering(false);
      setPassword("");
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
        throw new Error(response.error || "Block.");
      }

      localStorage.setItem("mw_token", response.token);
      localStorage.setItem("mw_user", JSON.stringify(response.user));

      setToken(response.token);
      setUser(response.user);

      setActivePortfolio(
        response.user.portfolios.find((p) => p.selected === 1).id,
      );
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("mw_token");
    localStorage.removeItem("mw_user");

    setToken(null);
    setUser(null);
    setPortfolioAssets([]);
    setGlobalData([]);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setSearchQuery("");
    setSearchResultsArray([]);
    setSearchMessage("");
    setDebugLog("Session terminated safely.");
  };

  const onRefresh = () => {
    fetchPortfolioAssets();
  };

  const handleCoffeeDonation = () => {
    const paypalMeUrl = "https://paypal.me/BrunoPaquette";
    window.open(paypalMeUrl, "_blank", "noopener,noreferrer");
  };

  if (!token || !user) {
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
        username={user?.username}
        handleSignOut={handleSignOut}
        handleLangChange={handleLangChange}
        currentLang={i18n.language || "en"}
        t={t}
      />

      <div className="app-container">
        <GlobalTicker globalData={globalData} />

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
                user={user}
                searchQuery={searchQuery}
                searchResultsArray={searchResultsArray}
                searchMessage={searchMessage}
                handleInputChange={handleInputChange}
                handleSelectAsset={handleSelectAsset}
                t={t}
              />
            </div>
            <Portfolios
              user={user}
              handlePortfolioChange={handlePortfolioChange}
              handleNewPortfolio={handleNewPortfolio}
              activePortfolio={activePortfolio}
            />
            <AssetList
              portfolioAssets={portfolioAssets}
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
