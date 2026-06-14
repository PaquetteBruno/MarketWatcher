import { useState, useEffect } from 'react'

function App() {
  // Set default starting view state to 'portfolio' for an empty, clean account experience!
  const [activeTab, setActiveTab] = useState('portfolio');
  const [marketData, setMarketData] = useState([]);
  const [debugLog, setDebugLog] = useState('Initiating connection setup...');
  const [showConsole, setShowConsole] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchMessage, setSearchMessage] = useState('');

  // Combined Fetch Routine
  const fetchMarketData = async () => {
    try {
      setDebugLog('Reaching across local network to Port 5000...');
      
      // Determine endpoint path based on whether user is checking macro indices or their personal portfolio list
      const endpoint = activeTab === 'portfolio' 
        ? `http://localhost:5000/api/watchlist/user/1` // Simulating Logged In User ID: 1
        : `http://localhost:5000/api/markets/${activeTab}`;

      const response = await fetch(endpoint);
      
      if (!response.ok) {
        const rawText = await response.text();
        setDebugLog(`Backend returned an error status code: ${response.status}\n\n${rawText}`);
        setShowConsole(true);
        return;
      }

      const json = await response.json();
      setMarketData(json.data || []);
      setDebugLog(`Success! Received clean JSON data array with ${json.data ? json.data.length : 0} items.`);
    } catch (error) {
      setDebugLog(`Frontend Network Fetch Failure: ${error.message}`);
      setShowConsole(true);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, [activeTab]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setSearchMessage('Searching global ticker databases...');
    setSearchResult(null);

    try {
      const response = await fetch(`http://localhost:5000/api/search?symbol=${searchQuery}`);
      if (!response.ok) throw new Error('Ticker symbol not recognized on any global exchange.');
      
      const data = await response.json();
      setSearchResult(data);
      setSearchMessage('');
    } catch (error) {
      setSearchMessage(error.message);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!searchResult) return;
    setSearchMessage('Linking asset to account table...');

    try {
      const response = await fetch('http://localhost:5000/api/watchlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1, 
          symbol: searchResult.symbol,
          name: searchResult.name,
          exchange: searchResult.exchange,
          price: searchResult.price,
          price_change: searchResult.price_change
        })
      });

      const data = await response.json();
      setSearchMessage(data.message || searchResult.symbol + ' was added successfully to your watchlist!');
      setSearchResult(null);
      setSearchQuery('');
      
      // Force refresh the active portfolio view grid dynamically upon addition!
      if (activeTab === 'portfolio') {
        fetchMarketData();
      }
    } catch (error) {
      setSearchMessage(`Failed to save link: ${error.message}`);
    }
  };

    // Shared Ellipsis Style Rule to keep rows uniform and clip long text safely
  const cellEllipsisStyle = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  return (
    <div style={{ backgroundColor: '#0d1117', color: '#c9d1d9', fontFamily: 'sans-serif', minHeight: '100vh', padding: '40px 20px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ marginBottom: '40px', borderBottom: '1px solid #21262d', paddingBottom: '20px' }}>
          <h1 style={{ color: '#ffffff', margin: '0 0 10px 0', fontSize: '32px' }}>
            📊 MarketWatcher <span style={{ fontSize: '16px', color: '#58a6ff' }}>Account Watchlist Terminal</span>
          </h1>
          <p style={{ color: '#8b949e', margin: 0 }}>Logged in as: <strong style={{color: '#58a6ff'}}>developer_bruno</strong> (User Account Node ID: 1)</p>
        </header>

        {/* Search Layout Module */}
        <div style={{ background: '#161b22', border: '1px solid #21262d', padding: '24px', borderRadius: '8px', marginBottom: '40px' }}>
          <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '15px' }}>🔍 Search & Add Assets to Your Account List</h3>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="Type any asset code (e.g. TSLA, NVDA, ETH, AMZN)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, padding: '12px', background: '#010409', color: '#fff', border: '1px solid #21262d', borderRadius: '6px', fontSize: '14px' }}
            />
            <button type="submit" style={{ padding: '12px 24px', background: '#238636', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              Search
            </button>
          </form>

          {searchMessage && <p style={{ color: '#58a6ff', marginTop: '15px', marginBottom: 0, fontSize: '14px' }}>{searchMessage}</p>}

          {searchResult && (
            <div style={{ marginTop: '20px', padding: '15px', background: '#21262d', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#fff', fontSize: '18px' }}>{searchResult.symbol}</strong>
                <span style={{ color: '#8b949e', marginLeft: '10px' }}>— {searchResult.name}</span>
                <div style={{ fontSize: '20px', color: '#fff', marginTop: '5px', fontFamily: 'monospace' }}>${searchResult.price}</div>
              </div>
              <button onClick={handleAddToWatchlist} style={{ padding: '10px 20px', background: '#58a6ff', color: '#0d1117', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                ➕ Pin to My Personal Dashboard List
              </button>
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

        {/* 📋 IMMOVABLE LOCKED WIDTH COLUMN GRID DATA SHEET */}
        <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '10px', padding: '10px 20px', marginBottom: '40px', overflowX: 'auto' }}>
          {marketData.length > 0 ? (
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              textAlign: 'left', 
              tableLayout: 'fixed' // Crucial: Fixes overall column tracking layout [1]
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #30363d', color: '#8b949e', fontSize: '13px' }}>
                  {/* Explicit widths assigned here set the permanent rules for the entire column layout vertical grid [1] */}
                  <th style={{ padding: '16px 12px', fontWeight: '600', width: '15%' }}>SYMBOL</th>
                  <th style={{ padding: '16px 12px', fontWeight: '600', width: '45%' }}>NAME</th>
                  <th style={{ padding: '16px 12px', fontWeight: '600', width: '20%' }}>EXCHANGE</th>
                  <th style={{ padding: '16px 12px', fontWeight: '600', width: '10%' }}>PRICE</th>
                  <th style={{ padding: '16px 12px', fontWeight: '600', width: '10%', textAlign: 'right' }}>CHANGE</th>
                </tr>
              </thead>
              <tbody>
                {marketData.map((asset) => {
                  const isPositive = asset.change && asset.change.startsWith('+');
                  return (
                    <tr key={asset.symbol} style={{ borderBottom: '1px solid #21262d', fontSize: '14px' }}>
                      
                      <td style={{ ...cellEllipsisStyle, padding: '16px 12px', fontWeight: '700', color: '#ffffff' }}>
                        {asset.symbol}
                      </td>
                      
                      <td style={{ ...cellEllipsisStyle, padding: '16px 12px', color: '#c9d1d9' }} title={asset.name}>
                        {asset.name}
                      </td>
                      
                      <td style={{ ...cellEllipsisStyle, padding: '16px 12px', color: '#8b949e', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {asset.market || activeTab}
                      </td>
                      
                      <td style={{ ...cellEllipsisStyle, padding: '16px 12px', color: '#ffffff', fontFamily: 'monospace', fontWeight: '600' }}>
                        ${parseFloat(asset.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      
                      <td style={{ 
                        ...cellEllipsisStyle,
                        padding: '16px 12px', 
                        color: isPositive ? '#3fb950' : '#f85149', 
                        fontWeight: '700',
                        fontFamily: 'monospace',
                        textAlign: 'right'
                      }}>
                        {asset.price_change}
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

              {/* Debug Console Section Controls */}
        <div style={{ textAlign: 'right', marginTop: '40px' }}>
          <button 
            onClick={() => setShowConsole(!showConsole)} 
            style={{ background: '#21262d', color: '#8b949e', border: '1px solid #30363d', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
          >
            {showConsole ? 'Hide System Console' : 'Show System Console'}
          </button>
        </div>

        {/* System Console Panel */}
        <div style={{ marginTop: '30px', borderTop: '1px solid #21262d', paddingTop: '30px', display: showConsole ? 'block' : 'none' }}>
          <h3 style={{ color: '#ffffff', marginBottom: '10px', fontSize: '16px' }}>🖥️ System Console Logger</h3>
          <textarea 
            readOnly 
            value={debugLog} 
            style={{ 
              width: '100%', 
              height: '140px', 
              background: '#010409', 
              color: '#7cfc00', 
              padding: '16px', 
              fontFamily: 'monospace', 
              fontSize: '12px', 
              border: '1px solid #21262d', 
              borderRadius: '6px', 
              resize: 'none' 
            }} 
          />
        </div>

      </div>
    </div>
  )
}

export default App
