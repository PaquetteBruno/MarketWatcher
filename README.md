# 📈 MarketWatcher

> A modern full-stack stock and cryptocurrency watchlist application built with React, Node.js, Express and MySQL.

MarketWatcher is a personal portfolio project created to demonstrate modern full-stack development practices while providing a clean interface for monitoring financial assets.

The application allows users to create an account, manage multiple watchlists (portfolios), search thousands of stocks and cryptocurrencies through Yahoo Finance, and keep track of their favorite assets in real time.

---

## ✨ Features

### Authentication

- Secure user registration
- Secure login
- JWT authentication
- Password encryption using bcrypt
- Google Sign-In (SSO)

### Portfolio Management

- Multiple user portfolios
- Active portfolio selection
- Add assets to portfolios
- Remove assets from portfolios
- Portfolio persistence

### Asset Search

- Live search powered by Yahoo Finance
- Stocks
- ETFs
- Cryptocurrencies
- Company lookup
- Symbol lookup

### Market Data

- Live banner displaying global market assets
- Automatic price refresh
- Price change indicators
- Cached market data stored in MySQL

### Internationalization

Fully translated interface using **react-i18next**

Currently supported languages:

- 🇺🇸 English
- 🇫🇷 French
- 🇪🇸 Spanish

---

# 🏗 Architecture

The project follows a layered architecture separating responsibilities across the frontend and backend.

```
MarketWatcher
│
├── client-react/
│   ├── Components
│   ├── Hooks
│   ├── Services
│   ├── Context
│   └── i18n
│
├── controllers/
├── models/
├── routes/
├── middleware/
├── config/
└── sql/
```

### Frontend

- React 19
- Vite
- Custom Hooks
- Service Layer
- Component-based architecture

### Backend

- Node.js
- Express
- REST API
- MVC architecture

### Database

- MySQL

### External APIs

- Yahoo Finance

---

# 🧠 Design Goals

This project was intentionally written to demonstrate professional software architecture rather than simply "making it work."

Some of the architectural decisions include:

- Separation of concerns
- Service layer abstraction
- Custom React hooks
- Reusable UI components
- Centralized authentication
- MVC backend organization
- Centralized error handling
- Internationalization
- Clean folder structure

---

# 📂 Project Structure

## Frontend

```
src/
│
├── components/
├── hooks/
├── services/
├── context/
├── App.jsx
└── i18n.js
```

## Backend

```
controllers/
models/
routes/
middleware/
config/
server.js
```

---

# 🛠 Technologies

## Frontend

- React
- Vite
- JavaScript (ES6)
- CSS
- react-i18next

## Backend

- Node.js
- Express
- JWT
- bcrypt
- mysql2
- Google OAuth

## Database

- MySQL

## External Services

- Yahoo Finance API

---

# 🚀 Installation

## Clone

```bash
git clone https://github.com/paquettebruno/MarketWatcher.git
```

## 🗄 Database Setup

1. Install MySQL Server.
2. Create an empty database named `MarketWatcher`.
3. Import `sql/database_creation.sql`.
4. Configure the `.env` file.
5. Start the backend.
6. Start the frontend.

This script creates all required tables and initial data.
Only after the database is ready should you start the backend server.

---

## Backend

```bash
npm install
npm run dev
```

Runs on:

```
http://localhost:5000
```

---

## Frontend

```bash
cd client-react

npm install

npm run dev
```

Runs on:

```
http://localhost:5173
```

---

# ⚙ Environment Variables

Create a `.env` file in the backend directory.

Example:

```env
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=

JWT_SECRET=

GOOGLE_CLIENT_ID=
```

---

# 📷 Screenshots

_(Coming soon)_

---

# 🚧 Roadmap

## Version 1.1

- Portfolio creation
- Portfolio rename
- Portfolio deletion

## Future Features

- Position tracking
- Profit/Loss calculations
- Dashboard
- Charts
- Historical performance
- Dark/Light themes
- Mobile responsiveness
- Notifications

---

# 📚 What I Learned

This project was built as a learning exercise to modernize my full-stack development skills.

During development I focused on:

- Modern React architecture
- Custom Hooks
- Service layers
- Express REST APIs
- MVC architecture
- MySQL integration
- Authentication
- Internationalization
- Code organization
- Refactoring large applications into maintainable components

---

# 👨‍💻 Author

**Bruno Paquette**

GitHub:

https://github.com/paquettebruno

---

# License

This project is released under the MIT License.
