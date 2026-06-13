import { useState, useEffect } from 'react'

function App() {
  const [activeTab, setActiveTab] = useState('nasdaq');
  const [marketData, setMarketData] = useState([]);
  const [debugLog, setDebugLog] = useState('Initiating connection setup...');

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setDebugLog('Reaching across local network to Port 5000...');
        
        const response = await fetch(`http://localhost:5000/api/markets/${activeTab}`);
        
        // Safety verification: If the backend hits a hard crash (like a 500 error), catch it safely
        if (!response.ok) {
          const rawText = await response.text();
          setDebugLog(`Backend returned a hard error status code: ${response.status}\n\nRaw Server Response:\n${rawText}`);
          return;
        }

        const json = await response.json();
        
        // Update data array safely or fall back to an empty group
        setMarketData(json.data || []);
        
        // If the backend sent back raw troubleshooting text or HTML, dump it straight into our log state
        if (json.rawDebug) {
          setDebugLog(json.rawDebug);
        } else {
          setDebugLog(`Success! Received clean JSON data array with ${json.data ? json.data.length : 0} items.`);
        }
      } catch (error) {
        setDebugLog(`Frontend Network Fetch Failure: ${error.message}\n\nTip: Double-check that your Node.js backend is actively running on Port 5000 inside your split terminal window panel!`);
      }
    };

    fetchMarketData();
  }, [activeTab]);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Market Watcher Dashboard</h1>

      {/* Navigation Tab Menu Row */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('nasdaq')} style={{ padding: '10px 20px', fontWeight: activeTab === 'nasdaq' ? 'bold' : 'normal', cursor: 'pointer' }}>
          NASDAQ
        </button>
        <button onClick={() => setActiveTab('nyse')} style={{ padding: '10px 20px', fontWeight: activeTab === 'nyse' ? 'bold' : 'normal', cursor: 'pointer' }}>
          NYSE
        </button>
        <button onClick={() => setActiveTab('crypto')} style={{ padding: '10px 20px', fontWeight: activeTab === 'crypto' ? 'bold' : 'normal', cursor: 'pointer' }}>
          Crypto Assets
        </button>
      </div>

      {/* Simple List View (Bypasses fragile table column rendering to prevent screen crashes) */}
      <div style={{ marginBottom: '40px' }}>
        <h3>Active Asset Metrics:</h3>
        {marketData.length > 0 ? (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {marketData.map((asset) => (
              <li key={asset.symbol} style={{ padding: '12px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                <span><strong>{asset.symbol}</strong> — {asset.name}</span>
                <span>${parseFloat(asset.price || 0).toFixed(2)} | <strong style={{ color: asset.change && asset.change.startsWith('+') ? 'green' : 'red' }}>{asset.change}</strong></span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ padding: '20px', background: '#fff3cd', color: '#856404', borderRadius: '4px' }}>
            No data records currently rendering on screen. Inspect the Console Logger panel below for structural clues.
          </p>
        )}
      </div>

      {/* 🖥️ DYNAMIC DIAGNOSTIC RAW CONSOLE PANELS */}
      <div style={{ marginTop: '30px', borderTop: '3px dashed #333', paddingTop: '20px' }}>
        <h3 style={{ color: '#d9534f' }}>🖥️ Server Diagnostic Console Log</h3>
        <p style={{ fontSize: '13px', color: '#666' }}>Displays the raw character streams returning directly from your backend server to bypass terminal truncation:</p>
        <textarea 
          readOnly
          value={debugLog}
          style={{ 
            width: '100%', 
            height: '300px', 
            background: '#1e1e1e', 
            color: '#7cfc00', // Classic terminal matrix green font color
            padding: '15px', 
            fontFamily: 'monospace', 
            fontSize: '12px',
            borderRadius: '4px',
            boxSizing: 'border-box'
          }}
        />
      </div>
    </div>
  )
}

export default App
