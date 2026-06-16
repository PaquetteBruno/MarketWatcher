DROP DATABASE IF EXISTS market_watcher;
CREATE DATABASE IF NOT EXISTS market_watcher;
USE market_watcher;

CREATE TABLE IF NOT EXISTS users (
 id INT AUTO_INCREMENT PRIMARY KEY,
 username VARCHAR(50) NOT NULL UNIQUE,
 email VARCHAR(100) NOT NULL UNIQUE,
 password_hash VARCHAR(255) DEFAULT NULL, -- Stores encrypted local passwords. Nullable for OAuth logins.
 auth_provider VARCHAR(20) DEFAULT 'local', -- 'local', 'google', or 'facebook'
 avatar_url VARCHAR(255) DEFAULT NULL, -- Dynamically holds Google/Facebook user profile pictures
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assets (
 id INT AUTO_INCREMENT PRIMARY KEY,
 symbol VARCHAR(15) NOT NULL,
 name VARCHAR(200) NOT NULL,
 exchange VARCHAR(10) NOT NULL, 
 price DECIMAL(10, 2) NOT NULL,
 price_change VARCHAR(10) NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolios (
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT NOT NULL,
 name VARCHAR(200) NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS watchlists (
 id INT AUTO_INCREMENT PRIMARY KEY,
 asset_id INT NOT NULL,
 portfolio_id INT NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
 FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS globals (
 id INT AUTO_INCREMENT PRIMARY KEY,
 symbol VARCHAR(15) NOT NULL UNIQUE,
 name VARCHAR(100) NOT NULL,
 category VARCHAR(20) NOT NULL, -- Stores 'INDEX', 'FOREX', or 'COMMODITY'
 price DECIMAL(12, 4) NOT NULL,
 price_change VARCHAR(10) NOT NULL,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO globals (symbol, name, category, price, price_change) 
VALUES
('^GSPC', 'S&P 500', 'EQUITY', 0, '+0.00%'),
('^IXIC', 'NASDAQ', 'EQUITY', 0, '+0.00%'),
('^DJI', 'DOW Jones', 'EQUITY', 0, '+0.00%'),
('^NYA', 'NYSE', 'EQUITY', 0, '+0.00%'),
('GC=F', 'Gold', 'COMMODITY', 0, '+0.00%'),
('USDCAD=X', 'USD/CAD', 'FOREX', 0, '+0.00%');
