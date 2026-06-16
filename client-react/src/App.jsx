import { useState, useEffect, useRef } from 'react'
import i18n from './i18n.js'

// 📜 PERSONALIZED TRADING TERMINAL ABOUT VIEW & PAYPAL INTEGRATION
function AboutPageView() {
  const handleCoffeeDonation = () => {
    
    const paypalMeUrl = "https://paypal.me/BrunoPaquette"; 
    window.open(paypalMeUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '30px', color: '#c9d1d9', lineHeight: '1.6', marginTop: '20px' }}>
      <h2 style={{ color: '#58a6ff', marginTop: '0', borderBottom: '1px solid #21262d', paddingBottom: '10px' }}>
        📈 About Market Watcher
      </h2>
      <p>
        Welcome to <strong>Market Watcher</strong>, a personal multi-user real-time trading dashboard built 
        to aggregate financial movements across the global economy. 
      </p>
      
      <h3 style={{ color: '#f0883e', marginTop: '25px' }}>🚀 System Core Specifications</h3>
      <ul style={{ paddingLeft: '20px' }}>
        <li><strong>Frontend Architecture:</strong> React SPA powered by Vite's ultra-fast hot-reloading development compiler.</li>
        <li><strong>Backend Controller:</strong> Node.js & Express framework executing secure REST API communication lines.</li>
        <li><strong>Data Synchronization:</strong> Live market evaluation engines driven by the Yahoo Finance API.</li>
        <li><strong>Relational Storage:</strong> Scalable local MySQL database management caching historical parameters.</li>
        <li><strong>Access Security:</strong> Encrypted local user credentials (via bcrypt) combined with secure Google Single Sign-On (SSO).</li>
      </ul>

      <p style={{ marginTop: '20px' }}>
        This application was engineered as an educational environment to master advanced full-stack integration patterns, 
        state caching loops, real-time animation hooks, and secure third-party authentication middleware layers.
      </p>

      {/* ☕ INTEGRATED LIVE PAYPAL LINK & DYNAMIC QR CODE CONTAINER */}
      <div style={{ marginTop: '35px', paddingTop: '25px', borderTop: '1px solid #21262d', textAlign: 'center', background: '#0d1117', padding: '25px', borderRadius: '6px', border: '1px solid #21262d' }}>
        <p style={{ fontSize: '14px', color: '#8b949e', margin: '0 0 20px 0' }}>
          If Market Watcher helped you in any way or you just enjoyed it, consider supporting my server costs!
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          {/* The Yellow Clickable PayPal Gate Button */}
          <button
            onClick={handleCoffeeDonation}
            style={{
              background: '#ffc439', 
              color: '#003087',      
              border: 'none',
              borderRadius: '25px',   
              padding: '12px 28px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
              transition: 'transform 0.2s, background-color 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#ffe194'; e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#ffc439'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            ☕ Buy me a coffee via PayPal
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
            <span style={{ fontSize: '12px', color: '#8b949e', fontStyle: 'italic' }}>— or scan to donate on mobile —</span>
            {/* 📱 Relational Local QR Code Anchor Container */}
            <img 
              src="/public/paypal-qr.png" 
              alt="PayPal Donation QR Code" 
              style={{ 
                width: '140px', 
                height: '140px', 
                borderRadius: '8px', 
                border: '4px solid #fff', // Clean white boundary frame so code scanners can read it perfectly against dark mode
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                background: '#fff'
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

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
        margin: '40px auto 10px auto', 
        padding: '15px', 
        background: '#161b22', 
        border: '1px dashed #30363d', 
        borderRadius: '8px', 
        width: '100%', 
        textAlign: 'center',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      <span style={{ display: 'block', fontSize: '10px', color: '#8b949e', marginBottom: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
        Advertisement
      </span>

      <ins 
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="pub-1158075273498343"
        data-ad-slot="7260832859"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}

const LanguageSelector = ({ user, handleSignOut, currentTab, setActiveTab }) => {
  const currentLang = i18n.language || 'en';
  const t = (key) => i18n.t(key);

  const handleLangChange = (lng) => {
    i18n.changeLanguage(lng);
    setActiveTab(activeTab); // Force dynamic layout text update on click
  };

  return (
    <div 
      style={{ 
        position: 'absolute', // Fixed pins it relative to the window, completely ignoring inner div spaces
        top: '15px', 
        right: '10px', 
        zIndex: 999999, // 👈 HIGHER INTENSITY LAYER GAIN: Forces flags over your global banner completely
        display: 'flex', 
        gap: '12px', 
        padding: '0px 14px', 
        boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
        alignItems: 'center'
      }}
    >

      {/* 🇺🇸 English Selector Button */}
      <img 
        src="https://flagcdn.com/32x24/us.webp" 
        alt="English"
        title="English"
        onClick={() => handleLangChange('en')}
        style={{ 
          width: '24px', 
          height: '16px', 
          borderRadius: '2px',
          cursor: 'pointer',
          opacity: currentLang === 'en' ? 1 : 0.75, // 👈 BRIGHTER STANDBY OPACITY (0.55 instead of 0.3)
          transform: currentLang === 'en' ? 'scale(1.15)' : 'scale(1)',
          transition: 'opacity 0.2s, transform 0.2s',
          boxShadow: currentLang === 'en' ? '0 0 8px rgba(88,166,255,0.6)' : 'none'
        }}
        onMouseEnter={(e) => { if (currentLang !== 'en') e.currentTarget.style.opacity = '0.85'; }}
        onMouseLeave={(e) => { if (currentLang !== 'en') e.currentTarget.style.opacity = '0.55'; }}
      />

      {/* 🇫🇷 French Selector Button */}
      <img 
        src="https://flagcdn.com/32x24/fr.webp" 
        alt="Français"
        title="Français"
        onClick={() => handleLangChange('fr')}
        style={{ 
          width: '24px', 
          height: '16px', 
          borderRadius: '2px',
          cursor: 'pointer',
          opacity: currentLang === 'fr' ? 1 : 0.75, // 👈 BRIGHTER STANDBY OPACITY
          transform: currentLang === 'fr' ? 'scale(1.15)' : 'scale(1)',
          transition: 'opacity 0.2s, transform 0.2s',
          boxShadow: currentLang === 'fr' ? '0 0 8px rgba(88,166,255,0.6)' : 'none'
        }}
        onMouseEnter={(e) => { if (currentLang !== 'fr') e.currentTarget.style.opacity = '0.85'; }}
        onMouseLeave={(e) => { if (currentLang !== 'fr') e.currentTarget.style.opacity = '0.55'; }}
      />

      {/* 🇪🇸 Spanish Selector Button */}
      <img 
        src="https://flagcdn.com/32x24/es.webp" 
        alt="Español"
        title="Español"
        onClick={() => handleLangChange('es')}
        style={{ 
          width: '24px', 
          height: '16px', 
          borderRadius: '2px',
          cursor: 'pointer',
          opacity: currentLang === 'es' ? 1 : 0.75, // 👈 BRIGHTER STANDBY OPACITY
          transform: currentLang === 'es' ? 'scale(1.15)' : 'scale(1)',
          transition: 'opacity 0.2s, transform 0.2s',
          boxShadow: currentLang === 'es' ? '0 0 8px rgba(88,166,255,0.6)' : 'none'
        }}
        onMouseEnter={(e) => { if (currentLang !== 'es') e.currentTarget.style.opacity = '0.85'; }}
        onMouseLeave={(e) => { if (currentLang !== 'es') e.currentTarget.style.opacity = '0.55'; }}
      />
        <span style={{ fontSize: '13px', color: '#8b949e',marginLeft:'10px', marginTop: '0px' }}>
          {t('LOG_IN_AS')} <strong style={{color: '#58a6ff'}}>{user?.username || 'Guest'}</strong>            &nbsp;&nbsp;&nbsp;
        </span>
        <button onClick={handleSignOut} style={{background: 'transparent', color: '#58a6ff', border: '1px solid #58a6ff', padding: '3px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>{t('SIGN_OUT')}</button>
      </div>
  );
};

function App() {
  const t = (key) => i18n.t(key);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('portfolio');
  const [marketData, setMarketData] = useState([]);
  const [globalData, setGlobalData] = useState([]);
  const [priceFlashing, setPriceFlashing] = useState({});
  const [showConsole, setShowConsole] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResultsArray, setSearchResultsArray] = useState([]); 
  const [searchMessage, setSearchMessage] = useState('');
  const [debugLog, setDebugLog] = useState('Waiting for session initialization...');

  const [refreshInterval, setRefreshInterval] = useState(15); 
  const [countdown, setCountdown] = useState(15);

  const prevMarketPricesRef = useRef({});
  const prevglobalPricesRef = useRef({});
  const timerRef = useRef(null);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('mw_token');
    const savedUser = localStorage.getItem('mw_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    const initGoogle = () => {
      if (window.google && (!savedToken || !savedUser)) {
        google.accounts.id.initialize({
          client_id: "607204517221-liol36qcu1b51u42a69gid0fthokfvvc.apps.googleusercontent.com",
          callback: async (resObj) => {
            setAuthError('');
            try {
              const res = await fetch('http://localhost:5000/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: resObj.credential })
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'Verification rejected.');
              localStorage.setItem('mw_token', data.token);
              localStorage.setItem('mw_user', JSON.stringify(data.user));
              setToken(data.token);
              setUser(data.user);
            } catch (err) { setAuthError(err.message); }
          }
        });
        google.accounts.id.renderButton(document.getElementById("googleBtnAnchor"), { theme: "outline", size: "large", width: "340" });
      }
    };
    if (window.google) {
      initGoogle();
    }
    else { 
      window.addEventListener('load', initGoogle); return () => window.removeEventListener('load', initGoogle); 
    }
  }, [token]);

  const fetchMarketData = async () => {
    if (!user || !token || activeTab === 'about') return;

    try {
      const endpoint = activeTab === 'portfolio' ? `http://localhost:5000/api/watchlist/user/${user.id}` : `http://localhost:5000/api/markets/${activeTab}`;
      const response = await fetch(endpoint, { method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      const json = await response.json();
      const nextMarketData = json.data || [];

      const globalResponse = await fetch('http://localhost:5000/api/markets/global', { method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      const globalJson = await globalResponse.json();
      const nextglobalData = globalJson.data || [];

      let newFlashes = { ...priceFlashing };
      nextMarketData.forEach(asset => {
        const oldPrice = prevMarketPricesRef.current[asset.symbol];
        if (oldPrice !== undefined && asset.price !== oldPrice) newFlashes[asset.symbol] = asset.price > oldPrice ? 'up' : 'down';
        prevMarketPricesRef.current[asset.symbol] = asset.price;
      });
      nextglobalData.forEach(global => {
        const oldPrice = prevglobalPricesRef.current[global.symbol];
        if (oldPrice !== undefined && global.price !== oldPrice) newFlashes[global.symbol] = global.price > oldPrice ? 'up' : 'down';
        prevglobalPricesRef.current[global.symbol] = global.price;
      });

      setMarketData(nextMarketData);
      setGlobalData(nextglobalData);
      setPriceFlashing(newFlashes);

      setTimeout(() => {
        setPriceFlashing(prev => {
          let resetFlashes = { ...prev };
          nextMarketData.forEach(a => delete resetFlashes[a.symbol]);
          nextglobalData.forEach(m => delete resetFlashes[m.symbol]);
          return resetFlashes;
        });
      }, 800);
      setDebugLog(`Auto-Sync Completed: ${new Date().toLocaleTimeString()}`);
    } catch (error) { 
      setDebugLog(`Refresh Failure: ${error.message}`); 
    }
  };

  useEffect(() => {
    if (!user || !token) return;

    fetchMarketData();
    setCountdown(refreshInterval);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          fetchMarketData(); 
          return refreshInterval; 
        }
        return prevCount - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerRef.current);

  }, [activeTab, user, token, refreshInterval]);

  const handleInputChange = async (text) => {
    setSearchQuery(text);

    if (text.trim().length < 3) {
      setSearchResultsArray([]); 
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/search?query=${text}`);

      if (!response.ok) throw new Error('Search failed.');

      const data = await response.json();

      setSearchResultsArray(data || []);

    } catch (error) {
      console.warn("Autodiscovery pipeline throttled:", error.message);
    }
  };

  const handleSelectAsset = async (selectedAsset) => {
    if (!user) return;

    setSearchMessage(`Adding ${selectedAsset.symbol} to your database workspace...`);
    setSearchResultsArray([]); 
    setSearchQuery('');

    try {
      const quoteRes = await fetch(`http://localhost:5000/api/search?query=${selectedAsset.symbol}`);
      const quoteData = await quoteRes.json();
      const targetAsset = quoteData.length > 0 ? quoteData[0] : selectedAsset;

      await fetch('http://localhost:5000/api/watchlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          symbol: targetAsset.symbol,
          name: targetAsset.name,
          exchange: targetAsset.exchange || 'NASDAQGS',
          price: targetAsset.price || 0.00,
          price_change: targetAsset.price_change || '0.00%'
        })
      });
      setSearchMessage(`[${targetAsset.symbol}] ${targetAsset.name} was added successfully.`);
      fetchMarketData();
    } catch (error) {
      setSearchMessage(`Error trying to add asset: ${error.message}`);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); 
    setAuthError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: authUsername, email: authEmail, password: authPassword }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Rejected.');
      alert(data.message); setIsRegistering(false); setAuthPassword('');
    } catch (err) { setAuthError(err.message); }
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setAuthError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: authEmail, password: authPassword }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Block.');
      localStorage.setItem('mw_token', data.token); localStorage.setItem('mw_user', JSON.stringify(data.user));
      setToken(data.token); setUser(data.user); setActiveTab('portfolio');
    } catch (err) { setAuthError(err.message); }
  };

  const handleSignOut = () => {
    localStorage.removeItem('mw_token'); localStorage.removeItem('mw_user');

    setToken(null); 
    setUser(null); 
    setMarketData([]); 
    setGlobalData([]);

    prevMarketPricesRef.current = {}; prevglobalPricesRef.current = {};

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setSearchQuery(''); setSearchResultsArray([]); setSearchMessage('');
    setDebugLog('Session terminated safely.');
  };

  const handleRemoveFromWatchlist = async (sym) => {
    if (!window.confirm(`Remove ${sym}?`)) return;
    try {
      await fetch('http://localhost:5000/api/watchlist/remove', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id, symbol: sym }) });
      fetchMarketData();
    } catch (error) { setDebugLog(`Removal Failure: ${error.message}`); }
  };

  const cellStyle = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };

  if (!token || !user) {
    return (
      <div style={{ backgroundColor: '#0d1117', color: '#c9d1d9', fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box', gap: '20px' }}>

        <div style={{ background: '#161b22', border: '1px solid #21262d', width: '100%', maxWidth: '400px', padding: '40px 30px', borderRadius: '10px' }}>
          <header style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ color: '#ffffff', margin: '0 0 10px 0', fontSize: '28px' }}>📈 {t('TITLE')}</h1>
            <p style={{ color: '#8b949e', margin: 0, fontSize: '14px' }}>{isRegistering ? t('CREATE_ACCOUNT') : t('LOGIN_METHOD')}</p>
          </header>
          <form onSubmit={isRegistering ? handleRegister : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isRegistering && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', color: '#8b949e' }}>{t('USERNAME')}</label>
                <input type="text" placeholder="developer_bruno" value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} required style={{ padding: '12px', background: '#010409', color: '#fff', border: '1px solid #21262d', borderRadius: '6px' }} />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: '#8b949e' }}>{t('EMAIL')}</label>
              <input type="email" placeholder="bruno@example.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required style={{ padding: '12px', background: '#010409', color: '#fff', border: '1px solid #21262d', borderRadius: '6px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: '#8b949e' }}>{t('PASSWORD')}</label>
              <input type="password" placeholder="••••••••••••" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required style={{ padding: '12px', background: '#010409', color: '#fff', border: '1px solid #21262d', borderRadius: '6px' }} />
            </div>
            {authError && <p style={{ color: '#f85149', margin: 0, fontSize: '13px' }}>⚠️ {authError}</p>}
            <button type="submit" style={{ padding: '12px', background: '#238636', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{isRegistering ? t('REGISTER_ACCOUNT') : t('SIGN_IN')}</button>
          </form>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '20px', borderTop: '1px solid #21262d', paddingTop: '20px', alignItems: 'center' }}>
            <div id="googleBtnAnchor" style={{ width: '340px', display: 'flex', justifyContent: 'center', minHeight: '40px' }}></div>
          </div>
          <footer style={{ marginTop: '25px', textAlign: 'center', fontSize: '13px', color: '#8b949e' }}>
            {isRegistering ? t('HAVE_ACCOUNT') : t('NEW_USER')} <button onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); }} style={{ background: 'transparent', border: 'none', color: '#58a6ff', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>{isRegistering ? t('SIGN_IN') : t('CREATE_ACCOUNT')}</button>
          </footer>
        </div>
      </div>
    );
  }

  // 📈 MAIN TRADING TERMINAL LAYOUT INTERFACE
  return (
    
    <div style={{ backgroundColor: '#0d1117', color: '#c9d1d9', fontFamily: 'sans-serif', minHeight: '100vh', padding: '30px 20px 40px 20px', boxSizing: 'border-box' }}>
      {globalData.length > 0 && (
        <div style={{ background: '#161b22', borderBottom: '1px solid #21262d', margin: '0 -20px 30px -20px', padding: '2px 2px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '40px', fontSize: '13px', fontWeight: '600' }}>
          {globalData.map((global) => {
            const isPos = global.price_change && global.price_change.startsWith('+');
            const flStatus = priceFlashing[global.symbol];
            const mBg = flStatus === 'up' ? 'rgba(63, 185, 80, 0.25)' : flStatus === 'down' ? 'rgba(248, 81, 73, 0.25)' : 'transparent';
            return (
              <div key={global.symbol} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: mBg, padding: '4px 8px', borderRadius: '4px', transition: 'background 0.2s' }}>
                <span style={{ color: '#8b949e' }}>{global.name}:</span>
                <span style={{ color: flStatus === 'up' ? '#58a6ff' : flStatus === 'down' ? '#ff7b72' : '#ffffff', fontFamily: 'monospace' }}>${parseFloat(global.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span style={{ color: isPos ? '#3fb950' : '#f85149', fontFamily: 'monospace' }}>{global.price_change}</span>
              </div>
            );
          })}
        </div>
      )}
      <LanguageSelector 
        user={user} 
        handleSignOut={handleSignOut} 
        currentTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <header style={{ marginBottom: '10px', borderBottom: '1px solid #21262d', paddingBottom: '0px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: '#ffffff', margin: '0 0 5px 0', fontSize: '24px' }}>📈 {t('TITLE')}</h1>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px', background: '#161b22', padding: '6px 12px', borderRadius: '6px', border: '1px solid #21262d', width: 'fit-content' }}>
          <span style={{ fontSize: '12px', color: '#8b949e', fontWeight: '500' }}>⏱️</span>
          <select 
            value={refreshInterval} 
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            style={{ background: '#010409', color: '#58a6ff', border: '1px solid #30363d', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', outline: 'none' }}
          >
            <option value={5}>5 sec</option>
            <option value={15}>15 sec</option>
            <option value={30}>30 sec</option>
            <option value={60}>60 sec</option>
          </select>
          <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#7cfc00', fontWeight: 'bold', marginLeft: '5px' }}>
            {countdown}s
          </span>
        </div>

          </div>
        </header>

        {/* 🔍 SEARCH ASSETS CONTAINER */}
        <div style={{ background: '#161b22', border: '1px solid #21262d', padding: '10px', borderRadius: '8px', marginBottom: '10px', position: 'relative' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input 
              type="text" 
              placeholder={t('SEARCH_PLACEHOLDER')} 
              value={searchQuery} 
              onChange={(e) => handleInputChange(e.target.value)} 
              style={{ width: '100%', padding: '12px', background: '#010409', color: '#fff', border: '1px solid #21262d', borderRadius: '6px', boxSizing: 'border-box', fontSize: '14px' }} 
            />

            {/* Dynamic Autocomplete Options Box */}
            {searchResultsArray.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#161b22', border: '1px solid #30363d', borderRadius: '6px', marginTop: '5px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                {searchResultsArray.map((asset) => (
                  <div 
                    key={asset.symbol} 
                    onClick={() => handleSelectAsset(asset)}
                    style={{ padding: '12px 16px', borderBottom: '1px solid #21262d', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#21262d'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div>
                      <span style={{ fontWeight: 'bold', color: '#fff', marginRight: '10px' }}>{asset.symbol}</span>
                      <span style={{ color: '#8b949e', fontSize: '13px' }}>— {asset.name}</span>
                    </div>
                    <span style={{ fontSize: '11px', background: '#30363d', color: '#58a6ff', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {asset.exchange}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {searchMessage && <p style={{ textAlign:'center', color: '#58a6ff', marginTop: '10px', fontSize: '13px' }}>{searchMessage}</p>}
        </div>

        {/* Tab Menu Navigation Loop */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '5px', marginTop: '10px', background: '#161b22', padding: '8px', borderRadius: '8px', border: '1px solid #21262d' }}>
          {['portfolio', 'nasdaq', 'nyse', 'crypto', 'about'].map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', background: activeTab === t ? '#21262d' : 'transparent', color: activeTab === t ? '#58a6ff' : '#8b949e', border: 'none', borderRadius: '6px', cursor: 'pointer', textTransform: 'uppercase', fontSize: '12px', fontWeight: activeTab === t ? '600' : '500' }}>
              {t === 'portfolio' ? '⭐ My Watchlist' : t === 'crypto' ? 'Crypto' : t === 'about' ? 'ℹ️ About' : t}
            </button>
          ))}
        </div>

        {/* RENDERING INTERFACE GATES */}
        {activeTab === 'about' ? (
          <AboutPageView />
        ) : (
          <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '10px', padding: '10px 20px', marginBottom: '40px', overflowX: 'auto' }}>
            {marketData.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #30363d', color: '#8b949e', fontSize: '13px' }}>
                    <th style={{ padding: '12px 12px', width: '15%' }}>SYMBOL</th>
                    <th style={{ padding: '12px 12px', width: '35%' }}>NAME</th>
                    <th style={{ padding: '12px 12px', width: '20%' }}>EXCHANGE</th>
                    <th style={{ padding: '12px 12px', width: '15%' }}>PRICE</th>
                    <th style={{ padding: '12px 12px', width: '10%', textAlign: 'right' }}>CHANGE</th>
                    <th style={{ padding: '12px 12px', width: '5%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {marketData.map((asset) => {
                    const isPos = asset.price_change && asset.price_change.startsWith('+');
                    const flStatus = priceFlashing[asset.symbol];
                    const rBg = flStatus === 'up' ? 'rgba(63, 185, 80, 0.15)' : flStatus === 'down' ? 'rgba(248, 81, 73, 0.15)' : 'transparent';
                    return (
                      <tr key={asset.symbol} style={{ borderBottom: '1px solid #21262d',  fontSize: '14px', background: rBg, transition: 'background 0.2s' }}>
                        <td style={{ ...cellStyle, padding: '6px 12px', fontWeight: '500', color: '#ffffff' }}>{asset.symbol}</td>
                        <td style={{ ...cellStyle, padding: '6px 12px', color: '#c9d1d9' }} title={asset.name}>{asset.name}</td>
                        <td style={{ ...cellStyle, padding: '6px 12px', color: '#8b949e', fontSize: '12px', textTransform: 'uppercase' }}>{asset.exchange || activeTab}</td>
                        <td style={{ ...cellStyle, padding: '6px 12px', color: flStatus === 'up' ? '#58a6ff' : flStatus === 'down' ? '#ff7b72' : '#ffffff', fontFamily: 'monospace' }}>${parseFloat(asset.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td style={{ ...cellStyle, padding: '6px 12px', color: isPos ? '#3fb950' : '#f85149', fontWeight: '700', fontFamily: 'monospace', textAlign: 'right' }}>{asset.price_change}</td>
                        <td style={{ padding: '6px 12px', textAlign: 'center' }}><button onClick={() => handleRemoveFromWatchlist(asset.symbol)} style={{ background: 'transparent', color: '#8b949e', border: 'none', cursor: 'pointer', padding: 0 }} title="Remove">🗑️</button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '30px 10px', textAlign: 'center', color: '#8b949e' }}>Nothing to display.</div>
            )}
          </div>
        )}

        <div style={{ textAlign: 'right', marginTop: '40px' }}><button onClick={() => setShowConsole(!showConsole)} style={{ background: '#21262d', color: '#8b949e', border: '1px solid #30363d', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>{showConsole ? 'Hide Console' : 'Show Console'}</button></div>
        <div style={{ marginTop: '30px', borderTop: '1px solid #21262d', paddingTop: '30px', display: showConsole ? 'block' : 'none' }}>
          <h3>🖥️ System Console Logger</h3>
          <textarea readOnly value={debugLog} style={{ width: '100%', height: '140px', background: '#010409', color: '#7cfc00', padding: '16px', fontFamily: 'monospace', fontSize: '12px', border: '1px solid #21262d', borderRadius: '6px', resize: 'none' }} />
        </div>

        {/* 💰 Google AdSense Responsive Space Banner */}
        <GoogleAdBanner />

      </div>
    </div>
  );
}

export default App;
