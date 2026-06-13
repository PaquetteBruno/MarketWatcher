import { useState, useEffect } from 'react'

function App() {
  const [activeTab, setActiveTab] = useState('nasdaq');
  const [marketData, setMarketData] = useState([]);
  const [debugLog, setDebugLog] = useState('Initiating connection setup...');
  const [showConsole, setShowConsole] = useState(false);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setDebugLog('Reaching across local network to Port 5000...');
        const response = await fetch(`http://localhost:5000/api/markets/${activeTab}`);
        
        if (!response.ok) {
          const rawText = await response.text();
          setDebugLog(`Backend returned an error status code: ${response.status}\n\n${rawText}`);
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

    fetchMarketData();
  }, [activeTab]);

  return (
    <div style={{ 
      backgroundColor: '#0d1117', // Dark navy background
      color: '#c9d1d9', // Soft white/grey text
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif', 
      minHeight: '100vh', 
      padding: '40px 20px',
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <header style={{ marginBottom: '40px', borderBottom: '1px solid #21262d', paddingBottom: '20px' }}>
          <h1 style={{ color: '#ffffff', margin: '0 0 10px 0', fontSize: '32px', fontWeight: '700' }}>
            📊 MarketWatcher <span style={{ fontSize: '16px', color: '#58a6ff', fontWeight: '400' }}>Live Terminal</span>
          </h1>
          <p style={{ color: '#8b949e', margin: 0 }}>Real-time US markets and cryptocurrency tracking engine powered by Node.js & MySQL.</p>
        </header>

        {/* Tab Navigation Menu Row */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '30px', 
          background: '#161b22', 
          padding: '8px', 
          borderRadius: '8px',
          border: '1px solid #21262d'
        }}>
          {['nasdaq', 'nyse', 'crypto'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              style={{ 
                flex: 1,
                padding: '12px 24px', 
                background: activeTab === tab ? '#21262d' : 'transparent', 
                color: activeTab === tab ? '#58a6ff' : '#8b949e', 
                border: 'none',
                borderRadius: '6px',
                fontWeight: '6px',
                fontWeight: activeTab === tab ? '600' : '500', 
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '13px',
                transition: 'all 0.2s ease'
              }}
            >
              {tab === 'crypto' ? 'Crypto Assets' : tab}
            </button>
          ))}
        </div>

        {/* Dynamic Pricing Cards Grid */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: '#ffffff', marginBottom: '20px', fontSize: '18px', borderLeft: '4px solid #58a6ff', paddingLeft: '10px' }}>
            Active Assets Data Stream
          </h3>
          
          {marketData.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              {marketData.map((asset) => {
                const isPositive = asset.change && asset.change.startsWith('+');
                return (
                  <div 
                    key={asset.symbol} 
                    style={{ 
                      background: '#161b22', 
                      border: '1px solid #21262d', 
                      borderRadius: '10px', 
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <span style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', display: 'block' }}>{asset.symbol}</span>
                        <span style={{ fontSize: '13px', color: '#8b949e', marginTop: '4px', display: 'block' }}>{asset.name}</span>
                      </div>
                      <span style={{ 
                        background: isPositive ? 'rgba(46, 160, 67, 0.15)' : 'rgba(248, 81, 73, 0.15)', 
                        color: isPositive ? '#3fb950' : '#f85149', // Neon green vs Crimson Red
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '13px', 
                        fontWeight: '6px',
                        fontWeight: '700'
                      }}>
                        {asset.change}
                      </span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '600', color: '#ffffff', fontFamily: 'monospace' }}>
                      ${parseFloat(asset.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ 
              padding: '24px', 
              background: 'rgba(240, 185, 11, 0.1)', 
              color: '#f0b90b', 
              border: '1px solid rgba(240, 185, 11, 0.2)', 
              borderRadius: '8px',
              fontSize: '14px' 
            }}>
              ⚠️ No live data records currently rendering on screen. Inspect the Console Logger panel below for structural clues.
            </div>
          )}
        </div>

        {/* 🖥️ Visual Diagnostic Console Panel */}
        <div style={{ marginTop: '50px', borderTop: '1px solid #21262d', paddingTop: '30px', display: showConsole ? 'block' : 'none' }}>
          <h3 style={{ color: '#ffffff', marginBottom: '10px', fontSize: '16px' }}>🖥️ System Console Logger</h3>
          <textarea 
            readOnly
            value={debugLog}
            style={{ 
              width: '100%', 
              height: '140px', 
              background: '#010409', 
              color: '#7cfc00', // Neon matrix green code font
              padding: '16px', 
              fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace', 
              fontSize: '12px',
              border: '1px solid #21262d',
              borderRadius: '6px',
              boxSizing: 'border-box',
              resize: 'none',
              lineHeight: '1.6'
            }}
          />
        </div>

      </div>
    </div>
  )
}

export default App
