import { useState, useEffect, useRef } from "react";
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
import portfolioService from "./services/portfolioService";
import searchService from "./services/searchService";
import useAuth from "./hooks/useAuth";
import usePortfolio from "./hooks/usePortfolio";
import useGlobal from "./hooks/useGlobal";
import useSearch from "./hooks/useSearch";
import useInit from "./hooks/useInit";

function App() {
  const t = (key) => i18n.t(key);
  const timerRef = useRef(null);

  const [showConsole, setShowConsole] = useState(false);
  const [debugLog, setDebugLog] = useState("");
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const auth = useAuth();
  const portfolio = usePortfolio();
  const global = useGlobal();
  const search = useSearch();
  const loadInit = useInit(auth, global, portfolio);

  console.log("App render");

  useEffect(() => {
    if (!auth.token || !auth.user) return;
    loadInit();
  }, [loadInit, auth.token, auth.user]);

  const handleLangChange = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handlePortfolioChange = async (portfolio_id) => {
    portfolioService.updateSelected(portfolio_id, auth.token);
    portfolio.setActivePortfolio(portfolio_id);
    portfolio.loadAssets(auth.token, portfolio_id);
  };

  const handleNewPortfolio = async () => {
    window.alert("New Portfolio");
  };

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

      portfolio.loadAssets(auth.token);
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

      portfolio.loadAssets(auth.token);
    } catch (error) {
      setDebugLog(`Removal Failure: ${error.message}`);
    }
  };

  const handleSignOut = () => {
    auth.completeLogout();

    portfolio.clearAssets();
    global.clear();
    search.clear();

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setDebugLog("Sign out completed.");
  };

  const onRefresh = () => {
    global.loadGlobalData(localStorage.getItem("mw_token"));
    portfolio.loadAssets(localStorage.getItem("mw_token"));
  };

  const handleCoffeeDonation = () => {
    const paypalMeUrl = "https://paypal.me/BrunoPaquette";
    window.open(paypalMeUrl, "_blank", "noopener,noreferrer");
  };

  if (!auth.token || !auth.user) {
    return (
      <LoginPage
        auth={auth}
        setActivePortfolio={portfolio.setActivePortfolio}
        onRefresh={onRefresh}
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
              auth={auth}
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
      <div
        style={{
          fontSize: "16px",
          color: "white",
          marginTop: "10px",
          marginLeft: "75px",
        }}
      >
        {" "}
        <table
          style={{
            borderCollapse: "collapse",
            lineHeight: "1.5",
            color: "#b4b9c1",
          }}
        >
          <thead
            style={{
              textAlign: "left",
              borderBottom: "1px solid #e1e5eb",
            }}
          >
            <tr>
              <th>Name</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ width: "190px" }}>Active Portfolio :</td>
              <td style={{ width: "1800px", color: "#b4b9c1" }}>
                {portfolio.activePortfolio}
              </td>
            </tr>
            <tr style={{ margintop: "10px" }}>
              <td>Assets : </td>
              <td>{portfolio.portfolioAssets.length}</td>
            </tr>
            <tr style={{ verticalAlign: "top" }}>
              <td>Local storage User :</td>
              <td>{JSON.stringify(auth.user)}</td>
            </tr>
            <tr style={{ verticalAlign: "top" }}>
              <td>Local storage Token :</td>
              <td> {auth.token.substring(0, 20)} ...</td>
            </tr>
            <tr style={{ verticalAlign: "top" }}>
              <td>Local storage Portfolio :</td>
              <td> {JSON.stringify(auth.portfolio)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
