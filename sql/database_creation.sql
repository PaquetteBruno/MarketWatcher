DROP DATABASE market_watcher;

CREATE DATABASE IF NOT EXISTS market_watcher;

USE market_watcher;

CREATE TABLE IF NOT EXISTS macro_assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(15) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(20) NOT NULL, -- Stores 'INDEX', 'FOREX', or 'COMMODITY'
    price DECIMAL(12, 4) NOT NULL,
    price_change VARCHAR(10) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    auth_provider VARCHAR(20) DEFAULT 'local', -- 'local', 'google', or 'facebook'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS watchlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    symbol VARCHAR(15) NOT NULL,
    name varchar(200) NOT NULL,
    exchange VARCHAR(10) NOT NULL, -- Will store 'NASDAQQS' or 'NYSE' or 'CRYPTO'
	price DECIMAL(10, 2) NOT NULL,
    price_change VARCHAR(10) NOT NULL, -- e.g., '+1.2%' or '-0.4%'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_asset (user_id, symbol) -- Prevents adding the same asset twice
);

-- 2. Seed initial fallback data rows
INSERT INTO macro_assets (symbol, name, category, price, price_change) VALUES
('^GSPC', 'S&P 500 Index', 'INDEX', 5100.00, '+0.45%'),
('GC=F', 'Gold Futures', 'COMMODITY', 2300.50, '-0.12%'),
('USDCAD=X', 'USD to CAD Exchange Rate', 'FOREX', 1.3600, '+0.05%') as alias
ON DUPLICATE KEY UPDATE price = alias.price;

INSERT INTO users (id, username, email, auth_provider) 
 VALUES (1, 'developer_bruno', 'bruno@example.com', 'local') as alias
 ON DUPLICATE KEY UPDATE username = alias.username ;

select * from watchlists