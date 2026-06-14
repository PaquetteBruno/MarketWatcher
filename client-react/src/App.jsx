import { useState, useEffect } from 'react'

function App() {
  // 1. Session & Auth States
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Auth Form Fields
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // 2. Main Terminal States
  const [activeTab, setActiveTab] = useState('portfolio');
  const [marketData, setMarketData] = useState([]);
  const [debugLog, setDebugLog] = useState('Waiting for session initialization...');
  const [showConsole, setShowConsole] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchMessage, setSearchMessage] = useState('');

  // 3. Central Startup Loop: Restores local sessions AND initializes Google Identity Buttons
    // 3. Central Startup Loop: Restores local sessions AND attaches a safe listener for the Google script load
  useEffect(() => {
    const savedToken = localStorage.getItem('mw_token');
    const savedUser = localStorage.getItem('mw_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setDebugLog('Session restored safely from local browser vault storage.');
    } else {
      setDebugLog('No active session token located. Redirecting to terminal secure wall.');
    }

    // Isolated Helper Function to build the Google button once the script is verified as fully loaded in memory
    const initializeGoogleButton = () => {
      /* global google */
      if (window.google && (!savedToken || !savedUser)) {
        google.accounts.id.initialize({
          client_id: "607204517221-liol36qcu1b51u42a69gid0fthokfvvc.apps.googleusercontent.com", // Your exact client ID is locked in!
          callback: async (googleResponse) => {
            setAuthError('');
            try {
              setDebugLog('Forwarding secure Google OIDC token passport to Node.js backend...');
              const res = await fetch('http://localhost:5000/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: googleResponse.credential })
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'Google verification rejected.');

              localStorage.setItem('mw_token', data.token);
              localStorage.setItem('mw_user', JSON.stringify(data.user));
              setToken(data.token);
              setUser(data.user);
            } catch (err) {
              setAuthError(err.message);
            }
          }
        });

        // Instruct Google to compile their official widget right inside your HTML anchor element
        google.accounts.id.renderButton(
          document.getElementById("googleBtnAnchor"),
          { theme: "outline", size: "large", width: "340" }
        );
      }
    };

    // Race Condition Wall: If Google loaded instantly, trigger initialization immediately
    if (window.google) {
      initializeGoogleButton();
    } else {
      // If the external script is still traveling across the internet network, listen for the window to finish compiling it
      window.addEventListener('load', initializeGoogleButton);
      return () => window.removeEventListener('load', initializeGoogleButton);
    }
  }, [token]);


  // Combined Market Data Fetch Routine
  const fetchMarketData = async () => {
    if (!user || !token) return;
    try {
      setDebugLog(`Querying backend endpoints for User Account ID: ${user.id}...`);
      const endpoint = activeTab === 'portfolio' 
        ? `http://localhost:5000/api/watchlist/user/${user.id}` 
        : `http://localhost:5000/api/markets/${activeTab}`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const rawText = await response.text();
        setDebugLog(`Backend error status code: ${response.status}\n\n${rawText}`);
        return;
      }
      const json = await response.json();
      setMarketData(json.data || []);
      setDebugLog(`Success! Standardized data synchronized with ${json.data ? json.data.length : 0} elements.`);
    } catch (error) {
      setDebugLog(`Network Fetch Failure: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, [activeTab, user]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authUsername, email: authEmail, password: authPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Account compilation rejected.');
      alert(data.message);
      setIsRegistering(false);
      setAuthPassword('');
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Authentication credential block.');

      localStorage.setItem('mw_token', data.token);
      localStorage.setItem('mw_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setActiveTab('portfolio');
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('mw_token');
    localStorage.removeItem('mw_user');
    setToken(null);
    setUser(null);
    setMarketData([]);
    setSearchQuery('');
    setSearchResult(null);
    setSearchMessage('');
    setDebugLog('Session context terminated. Security boundaries cleared out safely.');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setSearchMessage('Searching ticker databases...');
    setSearchResult(null);
    try {
      const response = await fetch(`http://localhost:5000/api/search?symbol=${searchQuery}`);
      if (!response.ok) throw new Error('Ticker symbol not recognized.');
      const data = await response.json();
      setSearchResult(data);
      setSearchMessage('');
    } catch (error) {
      setSearchMessage(error.message);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!searchResult || !user) return;
    try {
      const response = await fetch('http://localhost:5000/api/watchlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          symbol: searchResult.symbol,
          name: searchResult.name,
          exchange: searchResult.exchange || 'NASDAQGS',
          price: searchResult.price,
          price_change: searchResult.price_change
        })
      });
      const data = await response.json();
      setSearchMessage(data.message || 'Added successfully!');
      setSearchResult(null);
      setSearchQuery('');
      if (activeTab === 'portfolio') fetchMarketData();
    } catch (error) {
      setSearchMessage(`Failed to save link: ${error.message}`);
    }
  };

  const handleRemoveFromWatchlist = async (symbolToDrop) => {
    const userConfirmed = window.confirm(`Are you sure you want to remove ${symbolToDrop} from your watchlist?`);
    if (!userConfirmed || !user) return;
    try {
      const response = await fetch('http://localhost:5000/api/watchlist/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, symbol: symbolToDrop })
      });
      if (!response.ok) throw new Error('Deletion request failed.');
      fetchMarketData();
    } catch (error) {
      setDebugLog(`Removal Failure: ${error.message}`);
    }
  };

  const cellStyle = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
  // ==========================================
  // 🔐 SECURE WALL: LOGIN / SIGNUP SCREEN INTERFACE
  // ==========================================
  if (!token || !user) {
    return (
      <div style={{ backgroundColor: '#0d1117', color: '#c9d1d9', fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }}>
        <div style={{ background: '#161b22', border: '1px solid #21262d', width: '100%', maxWidth: '400px', padding: '40px 30px', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          <header style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ color: '#ffffff', margin: '0 0 10px 0', fontSize: '28px' }}>📊 MarketWatcher</h1>
            <p style={{ color: '#8b949e', margin: 0, fontSize: '14px' }}>
              {isRegistering ? 'Generate a secure developer terminal account' : 'Sign in to unlock your personalized data matrices'}
            </p>
          </header>

          <form onSubmit={isRegistering ? handleRegister : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isRegistering && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', color: '#8b949e', fontWeight: '500' }}>Username</label>
                <input type="text" placeholder="developer_bruno" value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} required style={{ padding: '12px', background: '#010409', color: '#fff', border: '1px solid #21262d', borderRadius: '6px', fontSize: '14px' }} />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: '#8b949e', fontWeight: '500' }}>Email Address</label>
              <input type="email" placeholder="bruno@example.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required style={{ padding: '12px', background: '#010409', color: '#fff', border: '1px solid #21262d', borderRadius: '6px', fontSize: '14px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: '#8b949e', fontWeight: '500' }}>Password</label>
              <input type="password" placeholder="••••••••••••" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required style={{ padding: '12px', background: '#010409', color: '#fff', border: '1px solid #21262d', borderRadius: '6px', fontSize: '14px' }} />
            </div>

            {authError && <p style={{ color: '#f85149', margin: 0, fontSize: '13px', fontWeight: '600' }}>⚠️ {authError}</p>}

            <button type="submit" style={{ padding: '12px', background: '#238636', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginTop: '10px' }}>
              {isRegistering ? 'Compile & Register Account' : 'Authenticate Security Session'}
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px', borderTop: '1px solid #21262d', paddingTop: '20px', alignItems: 'center' }}>
            <div id="googleBtnAnchor" style={{ width: '100%', minHeight: '40px' }}></div>
            <button onClick={() => alert('Facebook Identity OAuth coming next!')} style={{ padding: '10px', background: '#1877f2', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', maxWidth: '340px' }}>
              📘 Continue with Facebook
            </button>
          </div>

          <footer style={{ marginTop: '25px', textAlign: 'center', fontSize: '13px', color: '#8b949e' }}>
            {isRegistering ? 'Already have a terminal gateway card?' : 'New to this global tracking station?'} {' '}
            <button onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); }} style={{ background: 'transparent', border: 'none', color: '#58a6ff', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontStyle: 'italic' }}>
              {isRegistering ? 'Sign In Here' : 'Create Account Here'}
            </button>
          </footer>
        </div>
      </div>
    );
  }
  // ==========================================
  // 💻 MAIN LIVE TRADING TERMINAL USER INTERFACE
  // ==========================================
  return (
    <div style={{ backgroundColor: '#0d1117', color: '#c9d1d9', fontFamily: 'sans-serif', minHeight: '100vh', padding: '40px 20px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header containing Profile and Sign Out Trigger */}
        <header style={{ marginBottom: '40px', borderBottom: '1px solid #21262d', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: '#ffffff', margin: '0 0 5px 0', fontSize: '32px' }}>
              📊 MarketWatcher <span style={{ fontSize: '16px', color: '#58a6ff' }}>Secure Node</span>
            </h1>
            <p style={{ color: '#8b949e', margin: 0 }}>
              Welcome back, <strong style={{color: '#58a6ff'}}>{user.username}</strong>! (Authenticated Node ID: {user.id})
            </p>
          </div>
          <button 
            onClick={handleSignOut} 
            style={{ 
              background: 'transparent', 
              color: '#58a6ff', 
              border: '1px solid #58a6ff', 
              padding: '8px 16px', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              fontSize: '13px', 
              fontWeight: '600', 
              transition: 'all 0.2s ease' 
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(88, 166, 255, 0.1)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            Sign Out
          </button>
        </header>

        {/* Search Layout Module */}
        <div style={{ background: '#161b22', border: '1px solid #21262d', padding: '24px', borderRadius: '8px', marginBottom: '40px' }}>
          <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px' }}>🔍 Search & Add Assets to Your Account List</h3>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
            <input type="text" placeholder="Type any asset code (e.g. TSLA, NVDA, ETH, AMZN)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1, padding: '12px', background: '#010409', color: '#fff', border: '1px solid #21262d', borderRadius: '6px', fontSize: '14px' }} />
            <button type="submit" style={{ padding: '12px 24px', background: '#238636', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Search</button>
          </form>
          {searchMessage && <p style={{ color: '#58a6ff', marginTop: '15px', marginBottom: 0, fontSize: '14px' }}>{searchMessage}</p>}
          {searchResult && (
            <div style={{ marginTop: '20px', padding: '15px', background: '#21262d', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#fff', fontSize: '18px' }}>{searchResult.symbol}</strong>
                <span style={{ color: '#8b949e', marginLeft: '10px' }}>— {searchResult.name}</span>
                <div style={{ fontSize: '20px', color: '#fff', marginTop: '5px', fontFamily: 'monospace' }}>${searchResult.price}</div>
              </div>
              <button onClick={handleAddToWatchlist} style={{ padding: '10px 20px', background: '#58a6ff', color: '#0d1117', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>➕ Pin to My Personal Dashboard List</button>
            </div>
          )}
        </div>

        {/* Tab Menu Navigation */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '30px', background: '#161b22', padding: '8px', borderRadius: '8px', border: '1px solid #21262d' }}>
          {['portfolio', 'nasdaq', 'nyse', 'crypto', 'macro'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '12px', background: activeTab === tab ? '#21262d' : 'transparent', color: activeTab === tab ? '#58a6ff' : '#8b949e', border: 'none', borderRadius: '6px', cursor: 'pointer', textTransform: 'uppercase', fontSize: '12px', fontWeight: activeTab === tab ? '600' : '500' }}>
              {tab === 'portfolio' ? '⭐ My Watchlist' : tab === 'crypto' ? 'Crypto' : tab === 'macro' ? 'Macro / Forex' : tab}
            </button>
          ))}
        </div>

                {/* Immovable Column Grid Data Sheet */}
        <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '10px', padding: '10px 20px', marginBottom: '40px', overflowX: 'auto' }}>
          {marketData.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #30363d', color: '#8b949e', fontSize: '13px' }}>
                  <th style={{ padding: '16px 12px', fontWeight: '600', width: '15%' }}>SYMBOL</th>
                  <th style={{ padding: '16px 12px', fontWeight: '600', width: '40%' }}>NAME</th>
                  <th style={{ padding: '16px 12px', fontWeight: '600', width: '20%' }}>EXCHANGE</th>
                  <th style={{ padding: '16px 12px', fontWeight: '600', width: '10%' }}>PRICE</th>
                  <th style={{ padding: '16px 12px', fontWeight: '600', width: '10%', textAlign: 'right' }}>CHANGE</th>
                  <th style={{ padding: '16px 12px', fontWeight: '600', width: '5%', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {marketData.map((asset) => {
                  const isPositive = asset.price_change && asset.price_change.startsWith('+');
                  return (
                    <tr key={asset.symbol} style={{ borderBottom: '1px solid #21262d', fontSize: '14px' }}>
                      <td style={{ ...cellStyle, padding: '16px 12px', fontWeight: '700', color: '#ffffff' }}>{asset.symbol}</td>
                      <td style={{ ...cellStyle, padding: '16px 12px', color: '#c9d1d9' }} title={asset.name}>{asset.name}</td>
                      <td style={{ ...cellStyle, padding: '16px 12px', color: '#8b949e', fontSize: '12px', textTransform: 'uppercase' }}>{asset.exchange || activeTab}</td>
                      <td style={{ ...cellStyle, padding: '16px 12px', color: '#ffffff', fontFamily: 'monospace', fontWeight: '600' }}>${parseFloat(asset.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td style={{ ...cellStyle, padding: '16px 12px', color: isPositive ? '#3fb950' : '#f85149', fontWeight: '700', fontFamily: 'monospace', textAlign: 'right' }}>{asset.price_change}</td>
                      <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                        <button onClick={() => handleRemoveFromWatchlist(asset.symbol)} style={{ background: 'transparent', color: '#8b949e', border: 'none', cursor: 'pointer', fontSize: '13px', padding: 0 }} title="Remove from List">🗑️</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '30px 10px', textAlign: 'center', color: '#8b949e' }}>
              <strong style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>Your personal watchlist selection is empty.</strong>
            </div>
          )}
        </div>

        {/* Console Controls */}
        <div style={{ textAlign: 'right', marginTop: '40px' }}>
          <button onClick={() => setShowConsole(!showConsole)} style={{ background: '#21262d', color: '#8b949e', border: '1px solid #30363d', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
            {showConsole ? 'Hide System Console' : 'Show System Console'}
          </button>
        </div>

        {/* System Console Panel */}
        <div style={{ marginTop: '30px', borderTop: '1px solid #21262d', paddingTop: '30px', display: showConsole ? 'block' : 'none' }}>
          <h3 style={{ color: '#ffffff', marginBottom: '10px', fontSize: '16px' }}>🖥️ System Console Logger</h3>
          <textarea readOnly value={debugLog} style={{ width: '100%', height: '140px', background: '#010409', color: '#7cfc00', padding: '16px', fontFamily: 'monospace', fontSize: '12px', border: '1px solid #21262d', borderRadius: '6px', resize: 'none' }} />
        </div>

      </div>
    </div>
  )
}

export default App
