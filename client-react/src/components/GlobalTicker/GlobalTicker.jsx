/**
 * GlobalTicker
 *
 * Responsibility:
 * Displays the scrolling market ticker.
 *
 * Receives:
 * - globalData
 *
 * Does NOT:
 * - Fetch data
 * - Authenticate users
 * - Manage application state
 */

function GlobalTicker({ globalData }) {
  return (
    <div className="marquee-container">
      <div className="marquee-track">
        {globalData.map((global, index) => {
          const isPos =
            global.price_change && !global.price_change.startsWith("-");
          //const flStatus = priceFlashing[global.symbol];
          const mBg = "transparent";
          return (
            <div
              key={`orig-${global.symbol}-${index}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: mBg,
                padding: "4px 8px",
                borderRadius: "4px",
                transition: "background 0.2s",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              <span style={{ color: "#8b949e" }}>{global.name}:</span>
              <span style={{ color: "#ffffff", fontFamily: "monospace" }}>
                $
                {parseFloat(global.price || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
              <span
                style={{
                  color: isPos ? "#3fb950" : "#f85149",
                  fontFamily: "monospace",
                }}
              >
                {global.price_change}
              </span>
            </div>
          );
        })}

        {/* DUPLICATE PASS FOR SEAMLESS INFINITE LOOP EFFECT */}
        {globalData.map((global, index) => {
          const isPos =
            global.price_change && !global.price_change.startsWith("-");
          const mBg = "transparent";
          return (
            <div
              key={`dup-${global.symbol}-${index}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: mBg,
                padding: "4px 8px",
                borderRadius: "4px",
                transition: "background 0.2s",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              <span style={{ color: "#8b949e" }}>{global.name}:</span>
              <span style={{ color: "#ffffff", fontFamily: "monospace" }}>
                $
                {parseFloat(global.price || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
              <span
                style={{
                  color: isPos ? "#3fb950" : "#f85149",
                  fontFamily: "monospace",
                }}
              >
                {global.price_change}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GlobalTicker;
