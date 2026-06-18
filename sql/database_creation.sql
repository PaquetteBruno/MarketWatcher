drop database if exists market_watcher;
create database if not exists market_watcher;
use market_watcher;

create table if not exists users (
    id int auto_increment primary key,
    username varchar(50) not null unique,
    email varchar(100) not null unique,
    password_hash varchar(255) default null,
    auth_provider varchar(20) default 'local',
    avatar_url varchar(255) default null,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp
);

create table if not exists assets (
    id int auto_increment primary key,
    symbol varchar(15) not null unique, -- Added unique to ensure one entry per asset globally
    name varchar(200) not null,
    asset_type varchar(10) not null,    
    price decimal(10 , 2 ) not null,
    price_change varchar(10) not null,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp
);

-- Removed user_portfolio table. Added user_id directly here.
create table if not exists portfolios (
    id int auto_increment primary key,
    user_id int not null,
    name varchar(200) not null,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    foreign key (user_id) references users (id) on delete cascade
);

create table if not exists portfolio_asset (
	id int auto_increment primary key,
    portfolio_id int not null,
    asset_id int not null,
	foreign key (portfolio_id) references portfolios (id) on delete cascade,
    foreign key (asset_id) references assets (id) on delete cascade,
    unique key unique_portfolio_asset (portfolio_id, asset_id) -- Prevents adding same asset twice to one portfolio
);

create table if not exists positions (
	id int auto_increment primary key,
    portfolio_asset_id int not null,
    quantity decimal (36, 18) not null default 0,
    purchase_price decimal (10, 2) not null default 0.00, -- Added missing purchase price field
    created_at timestamp default current_timestamp,
    foreign key (portfolio_asset_id) references portfolio_asset (id) on delete cascade
);

create table if not exists globals (
    id int auto_increment primary key,
    symbol varchar(15) not null unique,
    name varchar(100) not null,
    category varchar(20) not null,
    price decimal(12 , 4 ) not null,
    price_change varchar(10) not null,
    show_on_banner bit default 0,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp
);

insert into globals (symbol, name, category, price, price_change, show_on_banner) 
values
-- 🇺🇸 Americas Core (Essential First Glance)
('^gspc', 's&p 500', 'equity', 0, '+0.00%', 1),
('^ixic', 'nasdaq', 'equity', 0, '+0.00%', 1),
('^dji', 'dow jones', 'equity', 0, '+0.00%', 1),
('^nya', 'nyse composite', 'equity', 0, '+0.00%', 1),
('^rut', 'russell 2000', 'equity', 0, '+0.00%', 1),
('^vix', 'cboe volatility index', 'index', 0, '+0.00%', 1),
('^gsptse', 's&p/tsx composite', 'equity', 0, '+0.00%', 0),

-- 🇪🇺 Europe Core (Essential First Glance)
('^ftse', 'ftse 100', 'equity', 0, '+0.00%', 1),
('^gdaxi', 'dax performance-index', 'equity', 0, '+0.00%', 1),
('^fchi', 'cac 40', 'equity', 0, '+0.00%', 0),
('^stoxx50e', 'euro stoxx 50', 'equity', 0, '+0.00%', 0),

-- 🌏 Asia-Pacific Core (Essential First Glance)
('^n225', 'nikkei 225', 'equity', 0, '+0.00%', 1),
('^hsi', 'hang seng index', 'equity', 0, '+0.00%', 1),
('000001.ss', 'shanghai composite', 'equity', 0, '+0.00%', 0),
('^bsesn', 'bse sensex', 'equity', 0, '+0.00%', 0),
('^axjo', 's&p/asx 200', 'equity', 0, '+0.00%', 0),

-- 🪙 Macro Commodities & Forex (Essential First Glance)
('gc=f', 'gold', 'commodity', 0, '+0.00%', 1),
('cl=f', 'crude oil wti', 'commodity', 0, '+0.00%', 1),
('dx-y.nyb', 'us dollar index', 'forex', 0, '+0.00%', 1),
('usdcad=x', 'usd/cad', 'forex', 0, '+0.00%', 1),
('eurusd=x', 'eur/usd', 'forex', 0, '+0.00%', 1);

