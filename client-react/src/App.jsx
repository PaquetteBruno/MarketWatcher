import { useState, useEffect, useRef } from 'react'

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('portfolio');
  const [marketData, setMarketData] = useState([]);
  const [macroData, setMacroData] = useState([]);
  const [priceFlashing, setPriceFlashing] = useState({});
  const [showConsole, setShowConsole] = useState(false);
  
  // 🔍 Upgraded Search Engine States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResultsArray, setSearchResultsArray] = useState([]); // Holds dropdown options array
  const [searchMessage, setSearchMessage] = useState('');
  const [debugLog, setDebugLog] = useState('Waiting for session initialization...');

  // Interactive Dynamic Timer & Countdown States
  const [refreshInterval, setRefreshInterval] = useState(15); 
  const [countdown, setCountdown] = useState(15);

  const prevMarketPricesRef = useRef({});
  const prevMacroPricesRef = useRef({});
  const timerRef = useRef(null); 

  useEffect(() => {
    const savedToken = localStorage.getItem('mw_token');
    const savedUser = localStorage.getItem('mw_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    const initGoogle = () => {
      /* global google */
      if (window.google && (!savedToken || !savedUser)) {
        google.accounts.id.initialize({
          client_id: "://googleusercontent.com",
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
    if (window.google) initGoogle();
    else { window.addEventListener('load', initGoogle); return () => window.removeEventListener('load', initGoogle); }
  }, [token]);

  const fetchMarketData = async () => {
    if (!user || !token) return;
    try {
      const endpoint = activeTab === 'portfolio' ? `http://localhost:5000/api/watchlist/user/${user.id}` : `http://localhost:5000/api/markets/${activeTab}`;
      const response = await fetch(endpoint, { method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      const json = await response.json();
      const nextMarketData = json.data || [];

      const macroResponse = await fetch('http://localhost:5000/api/markets/macro', { method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      const macroJson = await macroResponse.json();
      const nextMacroData = macroJson.data || [];

      let newFlashes = { ...priceFlashing };
      nextMarketData.forEach(asset => {
        const oldPrice = prevMarketPricesRef.current[asset.symbol];
        if (oldPrice !== undefined && asset.price !== oldPrice) newFlashes[asset.symbol] = asset.price > oldPrice ? 'up' : 'down';
        prevMarketPricesRef.current[asset.symbol] = asset.price;
      });
      nextMacroData.forEach(macro => {
        const oldPrice = prevMacroPricesRef.current[macro.symbol];
        if (oldPrice !== undefined && macro.price !== oldPrice) newFlashes[macro.symbol] = macro.price > oldPrice ? 'up' : 'down';
        prevMacroPricesRef.current[macro.symbol] = macro.price;
      });

      setMarketData(nextMarketData);
      setMacroData(nextMacroData);
      setPriceFlashing(newFlashes);

      setTimeout(() => {
        setPriceFlashing(prev => {
          let resetFlashes = { ...prev };
          nextMarketData.forEach(a => delete resetFlashes[a.symbol]);
          nextMacroData.forEach(m => delete resetFlashes[m.symbol]);
          return resetFlashes;
        });
      }, 800);
      setDebugLog(`Auto-Sync Completed: ${new Date().toLocaleTimeString()}`);
    } catch (error) { setDebugLog(`Refresh Failure: ${error.message}`); }
  };

   // 🔄 The Intelligent Asynchronous Multi-Interval Tracking Clock Loop
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

  // 🔍 NEW: Asynchronous Typing Discovery Handler (Triggers as you type!)
  const handleInputChange = async (text) => {
    setSearchQuery(text);
    if (text.trim().length < 2) {
      setSearchResultsArray([]); // Wipe the dropdown if the text box is empty
      return;
    }

    try {
      // Direct connection pipeline targeting your upgraded search engine endpoint
      const response = await fetch(`http://localhost:5000/api/search?query=${text}`);
      if (!response.ok) throw new Error('Search failed.');
      const data = await response.json();
      setSearchResultsArray(data || []);
    } catch (error) {
      console.warn("Autodiscovery pipeline throttled:", error.message);
    }
  };

  // ➕ NEW: Relational Pinning Selection Handler (Triggers when clicking a dropdown asset)
  const handleSelectAsset = async (selectedAsset) => {
    if (!user) return;
    setSearchMessage(`Pinning ${selectedAsset.symbol} to your database workspace...`);
    setSearchResultsArray([]); // Cleanly close the dropdown window right away
    setSearchQuery('');

    try {
      // Resolve a direct, fast market price check via Yahoo to seed initial table numbers
      const quoteRes = await fetch(`http://localhost:5000/api/search?query=${selectedAsset.symbol}`);
      const quoteData = await quoteRes.json();
      
      // If a detailed background quote is available, use it. Otherwise, fallback to base properties.
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

      setSearchMessage(`${targetAsset.symbol} successfully pinned to your secure watchlist layout!`);
      fetchMarketData();
    } catch (error) {
      setSearchMessage(`Pinning failure: ${error.message}`);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setAuthError('');
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
    setToken(null); setUser(null); setMarketData([]); setMacroData([]);
    prevMarketPricesRef.current = {}; prevMacroPricesRef.current = {};
    if (timerRef.current) clearInterval(timerRef.current);
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
      <div style={{ backgroundColor: '#0d1117', color: '#c9d1d9', fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }}>
        <div style={{ background: '#161b22', border: '1px solid #21262d', width: '100%', maxWidth: '400px', padding: '40px 30px', borderRadius: '10px' }}>
          <header style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ color: '#ffffff', margin: '0 0 10px 0', fontSize: '28px' }}>📊 Portfolio Manager</h1>
            <p style={{ color: '#8b949e', margin: 0, fontSize: '14px' }}>{isRegistering ? 'Create Account' : 'Choose your sign in method'}</p>
          </header>
          <form onSubmit={isRegistering ? handleRegister : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isRegistering && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', color: '#8b949e' }}>Username</label>
                <input type="text" placeholder="developer_bruno" value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} required style={{ padding: '12px', background: '#010409', color: '#fff', border: '1px solid #21262d', borderRadius: '6px' }} />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: '#8b949e' }}>Email</label>
              <input type="email" placeholder="bruno@example.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required style={{ padding: '12px', background: '#010409', color: '#fff', border: '1px solid #21262d', borderRadius: '6px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: '#8b949e' }}>Password</label>
              <input type="password" placeholder="••••••••••••" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required style={{ padding: '12px', background: '#010409', color: '#fff', border: '1px solid #21262d', borderRadius: '6px' }} />
            </div>
            {authError && <p style={{ color: '#f85149', margin: 0, fontSize: '13px' }}>⚠️ {authError}</p>}
            <button type="submit" style={{ padding: '12px', background: '#238636', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{isRegistering ? 'Register Account' : 'Sign In'}</button>
          </form>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '20px', borderTop: '1px solid #21262d', paddingTop: '20px', alignItems: 'center' }}>
            <div id="googleBtnAnchor" style={{ width: '340px', display: 'flex', justifyContent: 'center', minHeight: '40px' }}></div>
          </div>
          <footer style={{ marginTop: '25px', textAlign: 'center', fontSize: '13px', color: '#8b949e' }}>
            {isRegistering ? 'Have an account?' : 'New user?'} <button onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); }} style={{ background: 'transparent', border: 'none', color: '#58a6ff', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>{isRegistering ? 'Sign In' : 'Create Account'}</button>
          </footer>
        </div>
      </div>
    );
  }

    return (
    <div style={{ backgroundColor: '#0d1117', color: '#c9d1d9', fontFamily: 'sans-serif', minHeight: '100vh', padding: '0 20px 40px 20px', boxSizing: 'border-box' }}>
      {macroData.length > 0 && (
        <div style={{ background: '#161b22', borderBottom: '1px solid #21262d', margin: '0 -20px 30px -20px', padding: '12px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '40px', fontSize: '13px', fontWeight: '600' }}>
          {macroData.map((macro) => {
            const isPos = macro.price_change && macro.price_change.startsWith('+');
            const flStatus = priceFlashing[macro.symbol];
            const mBg = flStatus === 'up' ? 'rgba(63, 185, 80, 0.25)' : flStatus === 'down' ? 'rgba(248, 81, 73, 0.25)' : 'transparent';
            return (
              <div key={macro.symbol} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: mBg, padding: '4px 8px', borderRadius: '4px', transition: 'background 0.2s' }}>
                <span style={{ color: '#8b949e' }}>{macro.name}:</span>
                <span style={{ color: flStatus === 'up' ? '#58a6ff' : flStatus === 'down' ? '#ff7b72' : '#ffffff', fontFamily: 'monospace' }}>${parseFloat(macro.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span style={{ color: isPos ? '#3fb950' : '#f85149', fontFamily: 'monospace' }}>{macro.price_change}</span>
              </div>
            );
          })}
        </div>
      )}
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <header style={{ marginBottom: '40px', borderBottom: '1px solid #21262d', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: '#ffffff', margin: '0 0 5px 0', fontSize: '32px' }}>📊 Portfolio Manager</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', background: '#161b22', padding: '6px 12px', borderRadius: '6px', border: '1px solid #21262d', width: 'fit-content' }}>
              <span style={{ fontSize: '12px', color: '#8b949e', fontWeight: '500' }}>⏱️ Auto-Refresh:</span>
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

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: '#8b949e' }}>Logged in as: <strong style={{color: '#58a6ff'}}>{user.username}</strong>
            &nbsp;&nbsp;
            <button onClick={handleSignOut} style={{background: 'transparent', color: '#58a6ff', border: '1px solid #58a6ff', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }} onMouseEnter={(e) => e.target.style.background = 'rgba(88, 166, 255, 0.1)'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>Sign Out</button>
            </span>
          </div>
        </header>

        {/* 🔍 UPGRADED: AUTOCOMPLETE DISCOVERY DROPDOWN MODULE */}
        <div style={{ background: '#161b22', border: '1px solid #21262d', padding: '24px', borderRadius: '8px', marginBottom: '40px', position: 'relative' }}>
          <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px' }}>🔍 Search Assets</h3>
          <div style={{ position: 'relative', width: '100%' }}>
            <input 
              type="text" 
              placeholder="Type asset symbol or company name (e.g. BTC, Apple, NVDA, Microsoft)" 
              value={searchQuery} 
              onChange={(e) => handleInputChange(e.target.value)} 
              style={{ width: '100%', padding: '12px', background: '#010409', color: '#fff', border: '1px solid #21262d', borderRadius: '6px', boxSizing: 'border-box', fontSize: '14px' }} 
            />

            {/* Floating Autocomplete Dropdown Selection List Box */}
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
          {searchMessage && <p style={{ color: '#58a6ff', marginTop: '15px', marginBottom: 0, fontSize: '13px' }}>{searchMessage}</p>}
        </div>
		
        {/* Tab Menu Navigation */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '30px', background: '#161b22', padding: '8px', borderRadius: '8px', border: '1px solid #21262d' }}>
          {['portfolio', 'nasdaq', 'nyse', 'crypto'].map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', background: activeTab === t ? '#21262d' : 'transparent', color: activeTab === t ? '#58a6ff' : '#8b949e', border: 'none', borderRadius: '6px', cursor: 'pointer', textTransform: 'uppercase', fontSize: '12px', fontWeight: activeTab === t ? '600' : '500' }}>{t === 'portfolio' ? '⭐ My Watchlist' : t === 'crypto' ? 'Crypto' : t}</button>
          ))}
        </div>

        {/* Immovable Column Grid Data Sheet */}
        <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '10px', padding: '10px 20px', marginBottom: '40px', overflowX: 'auto' }}>
          {marketData.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #30363d', color: '#8b949e', fontSize: '13px' }}>
                  <th style={{ padding: '16px 12px', width: '15%' }}>SYMBOL</th>
                  <th style={{ padding: '16px 12px', width: '40%' }}>NAME</th>
                  <th style={{ padding: '16px 12px', width: '20%' }}>EXCHANGE</th>
                  <th style={{ padding: '16px 12px', width: '10%' }}>PRICE</th>
                  <th style={{ padding: '16px 12px', width: '10%', textAlign: 'right' }}>CHANGE</th>
                  <th style={{ padding: '16px 12px', width: '5%' }}></th>
                </tr>
              </thead>
              <tbody>
                {marketData.map((asset) => {
                  const isPos = asset.price_change && asset.price_change.startsWith('+');
                  const flStatus = priceFlashing[asset.symbol];
                  const rBg = flStatus === 'up' ? 'rgba(63, 185, 80, 0.15)' : flStatus === 'down' ? 'rgba(248, 81, 73, 0.15)' : 'transparent';
                  return (
                    <tr key={asset.symbol} style={{ borderBottom: '1px solid #21262d', fontSize: '14px', background: rBg, transition: 'background 0.2s' }}>
                      <td style={{ ...cellStyle, padding: '16px 12px', fontWeight: '700', color: '#ffffff' }}>{asset.symbol}</td>
                      <td style={{ ...cellStyle, padding: '16px 12px', color: '#c9d1d9' }} title={asset.name}>{asset.name}</td>
                      <td style={{ ...cellStyle, padding: '16px 12px', color: '#8b949e', fontSize: '12px', textTransform: 'uppercase' }}>{asset.exchange || activeTab}</td>
                      <td style={{ ...cellStyle, padding: '16px 12px', color: flStatus === 'up' ? '#58a6ff' : flStatus === 'down' ? '#ff7b72' : '#ffffff', fontFamily: 'monospace' }}>${parseFloat(asset.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td style={{ ...cellStyle, padding: '16px 12px', color: isPos ? '#3fb950' : '#f85149', fontWeight: '700', fontFamily: 'monospace', textAlign: 'right' }}>{asset.price_change}</td>
                      <td style={{ padding: '16px 12px', textAlign: 'center' }}><button onClick={() => handleRemoveFromWatchlist(asset.symbol)} style={{ background: 'transparent', color: '#8b949e', border: 'none', cursor: 'pointer', padding: 0 }} title="Remove">🗑️</button></td>
                    </tr>
                  )
                })}

              </tbody>
            </table>
          ) : (
            <div style={{ padding: '30px 10px', textAlign: 'center', color: '#8b949e' }}>Nothing to display.</div>
          )}
        </div>

        <div style={{ textAlign: 'right', marginTop: '40px' }}><button onClick={() => setShowConsole(!showConsole)} style={{ background: '#21262d', color: '#8b949e', border: '1px solid #30363d', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>{showConsole ? 'Hide Console' : 'Show Console'}</button></div>
        <div style={{ marginTop: '30px', borderTop: '1px solid #21262d', paddingTop: '30px', display: showConsole ? 'block' : 'none' }}>
          <h3>🖥️ System Console Logger</h3>
          <textarea readOnly value={debugLog} style={{ width: '100%', height: '140px', background: '#010409', color: '#7cfc00', padding: '16px', fontFamily: 'monospace', fontSize: '12px', border: '1px solid #21262d', borderRadius: '6px', resize: 'none' }} />
        </div>
      </div>
    </div>
  )
}

export default App;
