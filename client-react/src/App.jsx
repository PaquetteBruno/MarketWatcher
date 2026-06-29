import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import i18n from "./i18n.js";
import GlobalTicker from "./components/GlobalTicker/GlobalTicker";
import UserBar from "./components/UserBar/UserBar";
import PageHeader from "./components/PageHeader/PageHeader";
import SideBar from "./components/SideBar/SideBar";
import SearchBar from "./components/SearchBar/SearchBar";
import NavigationTabs from "./components/NavigationTabs/NavigationTabs";
import AboutPage from "./components/AboutPage/AboutPage";

// 💰 PRODUCTION-GRADE GOOGLE ADSENSE INSOLATED SPA BANNER MODULE
function GoogleAdBanner() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.warn("GOOGLE_ADSENSE_ERROR", error.message);
    }
  }, []);

  return (
    <div
      style={{
        margin: "40px auto 10px auto",
        padding: "15px",
        background: "#161b22",
        border: "1px dashed #30363d",
        borderRadius: "8px",
        width: "100%",
        textAlign: "center",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          display: "block",
          fontSize: "10px",
          color: "#8b949e",
          marginBottom: "10px",
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}
      >
        Advertisement
      </span>

      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="pub-1158075273498343"
        data-ad-slot="7260832859"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}

function App() {
  const t = (key) => i18n.t(key);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("mw_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem("mw_token") || null;
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [authUsername, setAuthUsername] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState("portfolio");
  const [marketData, setMarketData] = useState([]);
  const [globalData, setGlobalData] = useState([]);
  //const [priceFlashing, setPriceFlashing] = useState({});
  const [showConsole, setShowConsole] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResultsArray, setSearchResultsArray] = useState([]);
  const [searchMessage, setSearchMessage] = useState("");
  const [debugLog, setDebugLog] = useState(
    "Waiting for session initialization...",
  );
  const prevMarketPricesRef = useRef({});
  const prevglobalPricesRef = useRef({});
  const timerRef = useRef(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  //Google
  useEffect(() => {
    const initGoogle = () => {
      if (window.google && (!token || !user)) {
        window.google.accounts.id.initialize({
          client_id:
            "607204517221-liol36qcu1b51u42a69gid0fthokfvvc.apps.googleusercontent.com",
          callback: async (resObj) => {
            setAuthError("");
            try {
              const res = await fetch("http://localhost:5000/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken: resObj.credential }),
              });
              const data = await res.json();
              if (!res.ok)
                throw new Error(data.error || "Verification rejected.");
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

  // This hook runs automatically on the first load of the page
  useEffect(() => {
    const displayGlobalData = async () => {
      try {
        const globalResponse = await fetch("http://localhost:5000/api/global", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const globalJson = await globalResponse.json();
        setGlobalData(globalJson.data || []);
      } catch (error) {
        console.error("Failed to fetch global data:", error);
      }
    };

    // Only run the fetch if a token is available
    if (token) {
      displayGlobalData();
    }
  }, [token]); // Triggers when the page loads or if the token changes

  const handleLangChange = (lng) => {
    i18n.changeLanguage(lng);
    setActiveTab(setActiveTab);
  };

  const fetchMarketData = useCallback(async () => {
    if (!user || !token || activeTab === "about") return;

    try {
      const endpoint = `http://localhost:5000/api/portfolio/${user.portfolioId}`;
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const json = await response.json();
      const nextMarketData = json.data || [];

      setMarketData(nextMarketData);

      setDebugLog(`Auto-Sync Completed: ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      setDebugLog(`Refresh Failure: ${error.message}`);
    }
  }, [user, activeTab, token]);

  useEffect(() => {
    if (!user || !token) return;

    // Move the initial fetch inside an asynchronous immediate execution block
    const initFetch = async () => {
      await fetchMarketData();
    };
    initFetch();

    return;
  }, [user, token, fetchMarketData]);

  // ⏱️ Independent Auto-Refresh Loop (Every 60 Seconds)
  useEffect(() => {
    if (!token || !user) return;

    const refreshInterval = setInterval(() => {
      fetchMarketData();
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, [token, user, fetchMarketData]);

  const handleInputChange = async (text) => {
    setSearchQuery(text);
    setSearchMessage("");

    if (text.trim().length < 3) {
      setSearchResultsArray([]);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/search?query=${text}`,
      );

      if (!response.ok) throw new Error("Search failed.");

      const data = await response.json();

      setSearchResultsArray(data || []);
    } catch (error) {
      console.warn("Autodiscovery pipeline throttled:", error.message);
    }
  };

  const handleNavigationTabChange = async (portfolio) => {
    console.log(portfolio);
  };

  const handleSelectAsset = async (asset, user) => {
    setSearchResultsArray([]);
    setSearchQuery("");

    if (!asset || !user) return;

    try {
      await fetch("http://localhost:5000/api/portfolio/add-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolio_id: user.portfolioId,
          symbol: asset.symbol,
          name: asset.name,
          type: asset.asset_type,
          price: asset.price,
          price_change: asset.price_change,
        }),
      });

      setSearchMessage(
        `[${asset.symbol}] ${asset.name} was added successfully.`,
      );
      fetchMarketData();
    } catch (error) {
      setSearchMessage(`Error trying to add asset: ${error.message}`);
    }
  };

  const removeAssetFromPortfolio = async (sym) => {
    if (!sym || !user) return;

    if (!window.confirm(`Remove ${sym}?`)) return;
    try {
      window.alert("portfolio_Id: " + user.portfolioId + ", symbol: " + sym);
      await fetch("http://localhost:5000/api/portfolio/remove-asset", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolio_id: user.id, symbol: sym }),
      });
      fetchMarketData();
    } catch (error) {
      setDebugLog(`Removal Failure: ${error.message}`);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: authUsername,
          email: authEmail,
          password: authPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rejected.");
      setIsRegistering(false);
      setAuthPassword("");
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Block.");
      localStorage.setItem("mw_token", data.token);
      localStorage.setItem("mw_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setActiveTab("portfolio");
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("mw_token");
    localStorage.removeItem("mw_user");

    setToken(null);
    setUser(null);
    setMarketData([]);
    setGlobalData([]);

    prevMarketPricesRef.current = {};
    prevglobalPricesRef.current = {};

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setSearchQuery("");
    setSearchResultsArray([]);
    setSearchMessage("");
    setDebugLog("Session terminated safely.");
  };

  const cellStyle = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const onRefresh = () => {
    fetchMarketData();
  };

  const handleCoffeeDonation = () => {
    const paypalMeUrl = "https://paypal.me/BrunoPaquette";
    window.open(paypalMeUrl, "_blank", "noopener,noreferrer");
  };

  // REGISTRATION SECTION
  if (!token || !user) {
    return (
      <div
        style={{
          backgroundColor: "#0d1117",
          color: "#c9d1d9",
          fontFamily: "sans-serif",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          boxSizing: "border-box",
          gap: "20px",
        }}
      >
        <div
          style={{
            background: "#161b22",
            border: "1px solid #21262d",
            width: "100%",
            maxWidth: "400px",
            padding: "40px 30px",
            borderRadius: "10px",
          }}
        >
          <header style={{ textAlign: "center", marginBottom: "30px" }}>
            <h1
              style={{
                color: "#ffffff",
                margin: "0 0 10px 0",
                fontSize: "28px",
              }}
            >
              📈 {t("TITLE")}
            </h1>
            <p style={{ color: "#8b949e", margin: 0, fontSize: "14px" }}>
              {isRegistering ? t("CREATE_ACCOUNT") : t("LOGIN_METHOD")}
            </p>
          </header>
          <form
            onSubmit={isRegistering ? handleRegister : handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {isRegistering && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label style={{ fontSize: "13px", color: "#8b949e" }}>
                  {t("USERNAME")}
                </label>
                <input
                  type="text"
                  placeholder="developer_bruno"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  required
                  style={{
                    padding: "12px",
                    background: "#010409",
                    color: "#fff",
                    border: "1px solid #21262d",
                    borderRadius: "6px",
                  }}
                />
              </div>
            )}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label style={{ fontSize: "13px", color: "#8b949e" }}>
                {t("EMAIL")}
              </label>
              <input
                type="email"
                placeholder="bruno@example.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
                style={{
                  padding: "12px",
                  background: "#010409",
                  color: "#fff",
                  border: "1px solid #21262d",
                  borderRadius: "6px",
                }}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label style={{ fontSize: "13px", color: "#8b949e" }}>
                {t("PASSWORD")}
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
                style={{
                  padding: "12px",
                  background: "#010409",
                  color: "#fff",
                  border: "1px solid #21262d",
                  borderRadius: "6px",
                }}
              />
            </div>
            {authError && (
              <p style={{ color: "#f85149", margin: 0, fontSize: "13px" }}>
                ⚠️ {authError}
              </p>
            )}
            <button
              type="submit"
              style={{
                padding: "12px",
                background: "#238636",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {isRegistering ? t("REGISTER_ACCOUNT") : t("SIGN_IN")}
            </button>
          </form>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "20px",
              borderTop: "1px solid #21262d",
              paddingTop: "20px",
              alignItems: "center",
            }}
          >
            <div
              id="googleBtnAnchor"
              style={{
                width: "340px",
                display: "flex",
                justifyContent: "center",
                minHeight: "40px",
              }}
            ></div>
          </div>
          <footer
            style={{
              marginTop: "25px",
              textAlign: "center",
              fontSize: "13px",
              color: "#8b949e",
            }}
          >
            {isRegistering ? t("HAVE_ACCOUNT") : t("NEW_USER")}{" "}
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthError("");
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#58a6ff",
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
              }}
            >
              {isRegistering ? t("SIGN_IN") : t("CREATE_ACCOUNT")}
            </button>
          </footer>
        </div>
      </div>
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
            <NavigationTabs
              user={user}
              handleNavigationTabChange={handleNavigationTabChange}
            />
            <div
              style={{
                background: "#161b22",
                border: "1px solid #21262d",
                borderRadius: "10px",
                padding: "10px 20px",
                marginBottom: "40px",
                overflowX: "auto",
              }}
            >
              {marketData.length > 0 ? (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                    tableLayout: "fixed",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid #30363d",
                        color: "#8b949e",
                        fontSize: "13px",
                      }}
                    >
                      <th style={{ padding: "12px 12px", width: "15%" }}>
                        {t("SYMBOL")}
                      </th>
                      <th style={{ padding: "12px 12px", width: "35%" }}>
                        {t("NAME")}
                      </th>
                      <th style={{ padding: "12px 12px", width: "20%" }}>
                        {t("TYPE")}
                      </th>
                      <th style={{ padding: "12px 12px", width: "15%" }}>
                        {t("PRICE")}
                      </th>
                      <th
                        style={{
                          padding: "12px 12px",
                          width: "10%",
                          textAlign: "right",
                        }}
                      >
                        {t("CHANGE")}
                      </th>
                      <th style={{ padding: "12px 12px", width: "5%" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketData.map((asset) => {
                      const isPos =
                        asset.price_change &&
                        !asset.price_change.startsWith("-");
                      const rBg = "transparent";
                      return (
                        <tr
                          key={asset.symbol}
                          style={{
                            borderBottom: "1px solid #21262d",
                            fontSize: "14px",
                            background: rBg,
                            transition: "background 0.2s",
                          }}
                        >
                          <td
                            style={{
                              ...cellStyle,
                              padding: "6px 12px",
                              fontWeight: "500",
                              color: "#ffffff",
                            }}
                          >
                            {asset.symbol}
                          </td>
                          <td
                            style={{
                              ...cellStyle,
                              padding: "6px 12px",
                              color: "#c9d1d9",
                            }}
                            title={asset.name}
                          >
                            {asset.name}
                          </td>
                          <td
                            style={{
                              ...cellStyle,
                              padding: "6px 12px",
                              color: "#8b949e",
                              fontSize: "12px",
                              textTransform: "uppercase",
                            }}
                          >
                            {asset.type || activeTab}
                          </td>
                          <td
                            style={{
                              ...cellStyle,
                              padding: "6px 12px",
                              color: "#ffffff",
                              fontFamily: "monospace",
                            }}
                          >
                            $
                            {parseFloat(asset.price || 0).toLocaleString(
                              undefined,
                              { minimumFractionDigits: 2 },
                            )}
                          </td>
                          <td
                            style={{
                              ...cellStyle,
                              padding: "6px 12px",
                              color: isPos ? "#3fb950" : "#f85149",
                              fontWeight: "700",
                              fontFamily: "monospace",
                              textAlign: "right",
                            }}
                          >
                            {asset.price_change}
                          </td>
                          <td
                            style={{
                              padding: "6px 12px",
                              textAlign: "center",
                            }}
                          >
                            <button
                              onClick={() =>
                                removeAssetFromPortfolio(asset.symbol)
                              }
                              style={{
                                background: "transparent",
                                color: "#8b949e",
                                border: "none",
                                cursor: "pointer",
                                padding: 0,
                              }}
                              title="Remove"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div
                  style={{
                    padding: "30px 10px",
                    textAlign: "center",
                    color: "#8b949e",
                  }}
                >
                  Nothing to display.
                </div>
              )}
            </div>
            )
          </div>
          <div style={{ width: "30%", fontSize: "24px" }}>
            <SideBar smallIcon="📋" title={t("Informations")}></SideBar>
          </div>
        </div>

        <div
          style={{ textAlign: "right", marginTop: "20px", display: "block" }}
        >
          <button
            onClick={() => setShowConsole(!showConsole)}
            style={{
              background: "#21262d",
              color: "#8b949e",
              border: "1px solid #30363d",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            {showConsole ? "Hide " : "Show Console"}
          </button>

          <button
            onClick={() => setIsAboutOpen(true)}
            style={{
              background: "transparent",
              color: "#58a6ff",
              border: "1px solid #58a6ff",
              padding: "3px 8px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: "600",
            }}
          >
            About Me
          </button>
        </div>
        <div
          style={{
            marginTop: "30px",
            borderTop: "1px solid #21262d",
            paddingTop: "30px",
            display: showConsole ? "block" : "none",
          }}
        >
          <h3>🖥️ System Console Logger</h3>
          <textarea
            readOnly
            value={debugLog}
            style={{
              width: "100%",
              height: "140px",
              background: "#010409",
              color: "#7cfc00",
              padding: "16px",
              fontFamily: "monospace",
              fontSize: "12px",
              border: "1px solid #21262d",
              borderRadius: "6px",
              resize: "none",
            }}
          />
        </div>
        {isAboutOpen && (
          <div
            onClick={() => setIsAboutOpen(false)} // Clicking the dark background backdrop closes it
          >
            <AboutPage handleCoffeeDonation={handleCoffeeDonation} />;
          </div>
        )}

        {/* 💰 Google AdSense Responsive Space Banner */}
        <GoogleAdBanner />
      </div>
    </div>
  );
}

export default App;
