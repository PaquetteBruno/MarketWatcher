import { useState, useEffect } from "react";
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
  const [showConsole, setShowConsole] = useState(false);
  const [debugLog, setDebugLog] = useState("");
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const auth = useAuth();
  const portfolio = usePortfolio();
  const global = useGlobal();
  const search = useSearch();

  const loadInit = useInit(
    auth.token,
    auth.user?.id,
    global.loadGlobalData,
    portfolio.loadActivePortfolio,
    portfolio.loadPortfolios,
    portfolio.loadAssets,
  );

  console.log("App render");

  useEffect(() => {
    if (!auth.token || !auth.user) return;
    loadInit();
  }, [loadInit, auth.token, auth.user]);

  const handleLangChange = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handlePortfolioChange = async (portfolioId, name, isSelected) => {
    portfolioService.updatePortfolio(auth.token, portfolioId, name, isSelected);
    portfolio.setActivePortfolio(portfolioId);
    portfolio.loadAssets(auth.token, portfolioId);
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

      portfolio.loadAssets(auth.token, portfolio.activePortfolio);
    } catch (error) {
      search.setSearchMessage(`${t("ERROR_ADDING_ASSET")} ${error.message}`);
    }
  };

  const removeAssetFromPortfolio = async (symbol) => {
    try {
      await portfolioService.deletePortfolioAsset(
        portfolio.activePortfolio,
        symbol,
      );

      portfolio.loadAssets(auth.token, portfolio.activePortfolio);
    } catch (error) {
      setDebugLog(`Removal Failure: ${error.message}`);
    }
  };

  const handleSignOut = () => {
    auth.completeLogout();

    portfolio.clearAssets();
    global.clear();
    search.clear();

    setDebugLog("Sign out completed.");
  };

  const onRefresh = () => {
    global.loadGlobalData(localStorage.getItem("mw_token"));
    portfolio.loadAssets(auth.token, portfolio.activePortfolio);
  };

  const handleCoffeeDonation = () => {
    const paypalMeUrl = "https://paypal.me/BrunoPaquette";
    window.open(paypalMeUrl, "_blank", "noopener,noreferrer");
  };

  if (!auth.token || !auth.user) {
    return (
      <div>
        <UserBar
          user={auth.user}
          handleSignOut={handleSignOut}
          handleLangChange={handleLangChange}
        />
        <LoginPage
          auth={auth}
          setActivePortfolio={portfolio.setActivePortfolio}
          onRefresh={onRefresh}
        ></LoginPage>
      </div>
    );
  }

  return (
    <div>
      <UserBar
        user={auth.user}
        handleSignOut={handleSignOut}
        handleLangChange={handleLangChange}
      />
      <div className="app-container">
        <GlobalTicker globalData={global.globalData} />

        <div style={{ display: "flex", gap: "2%", marginTop: "20px" }}>
          <div style={{ width: "calc(70% - 2%)" }}>
            <PageHeader onRefresh={onRefresh} />
            <div className="content-layout">
              <SearchBar
                user={auth.user}
                searchQuery={search.searchQuery}
                searchResults={search.searchResults}
                searchMessage={search.searchMessage}
                handleInputChange={handleInputChange}
                handleSelectAsset={handleSelectAsset}
              />
            </div>
            <Portfolios
              auth={auth}
              portfolio={portfolio}
              handlePortfolioChange={handlePortfolioChange}
            />
            <AssetList
              portfolioAssets={portfolio.portfolioAssets}
              removeAssetFromPortfolio={removeAssetFromPortfolio}
            ></AssetList>
            )
          </div>
          <div style={{ width: "30%", fontSize: "24px" }}>
            <SideBar></SideBar>
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
