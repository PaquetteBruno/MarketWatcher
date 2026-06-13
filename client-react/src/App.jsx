import { useState, useEffect } from 'react'

function App() {
  // 1. Declare state to track which tab is currently active
  const [activeTab, setActiveTab] = useState('nasdaq');
  
  // 2. Declare state to hold the live data rows from your MySQL database
  const [marketData, setMarketData] = useState([]);

  // 3. Automated Data Fetching Block
  useEffect(() => {
    // This function reaches out to your Node.js backend on Port 5000
    const fetchMarketData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/markets/${activeTab}`);
        const json = await response.json();
        setMarketData(json.data); // Save the database rows into our state array
      } catch (error) {
        console.error("Failed to pull market data from backend:", error);
      }
    };

    fetchMarketData();
  }, [activeTab]); // This tells React: "Every single time the activeTab changes, automatically run this code again!"

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Market Watcher Dashboard</h1>

      {/* 4. Visual Navigation Tabs Buttons Row */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('nasdaq')} 
          style={{ padding: '10px 20px', fontWeight: activeTab === 'nasdaq' ? 'bold' : 'normal', cursor: 'pointer' }}
        >
          NASDAQ
        </button>
        <button 
          onClick={() => setActiveTab('nyse')} 
          style={{ padding: '10px 20px', fontWeight: activeTab === 'nyse' ? 'bold' : 'normal', cursor: 'pointer' }}
        >
          NYSE
        </button>
        <button 
          onClick={() => setActiveTab('crypto')} 
          style={{ padding: '10px 20px', fontWeight: activeTab === 'crypto' ? 'bold' : 'normal', cursor: 'pointer' }}
        >
          Crypto Assets
        </button>
      </div>

      {/* 5. Dynamic Data Table Module */}
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th style={{ padding: '10px' }}>Symbol</th>
            <th style={{ padding: '10px' }}>Company/Asset Name</th>
            <th style={{ padding: '10px' }}>Price</th>
            <th style={{ padding: '10px' }}>24h Change</th>
          </tr>
        </thead>
        <tbody>
          {marketData.map((asset) => (
            <tr key={asset.symbol} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>{asset.symbol}</td>
              <td style={{ padding: '10px' }}>{asset.name}</td>
              <td style={{ padding: '10px' }}>${parseFloat(asset.price).toFixed(2)}</td>
              <td style={{ 
                padding: '10px', 
                color: asset.change.startsWith('+') ? 'green' : 'red',
                fontWeight: 'bold' 
              }}>
                {asset.change}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App
