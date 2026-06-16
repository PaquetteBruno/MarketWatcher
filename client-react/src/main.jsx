import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
//import './index.css' // 🟢 Ensure there is a dot: './index.css'
import './i18n.js'    // 🟢 Ensure there is a dot: './i18n.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)