CREATE DATABASE IF NOT EXISTS market_watcher;
USE market_watcher;

-- 2. Create the Stocks Table (Isolates NASDAQ and NYSE via a market column)
CREATE TABLE IF NOT EXISTS stocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    market VARCHAR(10) NOT NULL, -- Will store 'NASDAQ' or 'NYSE'
    price DECIMAL(10, 2) NOT NULL,
    price_change VARCHAR(10) NOT NULL, -- e.g., '+1.2%' or '-0.4%'
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Create the Crypto Table (Completely separated in its own structure)
CREATE TABLE IF NOT EXISTS crypto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(12, 4) NOT NULL, -- Higher precision for small crypto values
    price_change VARCHAR(10) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Seed initial mock data so our frontend branches have stuff to show
INSERT INTO stocks (symbol, name, market, price, price_change) VALUES
('AAPL', 'Apple Inc.', 'NASDAQ', 175.20, '+1.2%'),
('MSFT', 'Microsoft Corp.', 'NASDAQ', 420.55, '-0.4%'),
('BRK.A', 'Berkshire Hathaway', 'NYSE', 620000.00, '+0.1%'),
('JPM', 'JPMorgan Chase & Co.', 'NYSE', 195.30, '+0.8%')
ON DUPLICATE KEY UPDATE price=VALUES(price), price_change=VALUES(price_change);

INSERT INTO crypto (symbol, name, price, price_change) VALUES
('BTC', 'Bitcoin', 67000.0000, '+4.5%'),
('ETH', 'Ethereum', 3500.2500, '+2.1%')
ON DUPLICATE KEY UPDATE price=VALUES(price), price_change=VALUES(price_change);

