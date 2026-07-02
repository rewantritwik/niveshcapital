# NiveshCapital — Full Stack Stock Trading Simulator

A full-stack, Zerodha-inspired educational stock trading simulator built using the MERN stack (MongoDB, Express, React, Node.js). 

## Live Demo
- **Landing Page**: http://localhost:3001
- **Trading Dashboard**: http://localhost:3002
- **Backend API**: http://localhost:3005

---

## Directory Structure
```text
niveshcapital/
├── backend/       # Node.js + Express REST API & Simulation Engine
├── Dashboard/     # React.js Professional Trading Portal
└── frontend/      # React.js Premium Brand Landing Page
```

---

## Key Features
- **Real-Time Price Simulation**: Custom server-side engine running every 30 seconds simulating realistic market ticks.
- **Mock Trading**: Buy and sell major NSE equities with a virtual ₹1,00,000 capital.
- **Secure Authentication**: JWT session authorization with strict email verification & password recovery workflows (Nodemailer).
- **Advanced Portfolio Metrics**: Instant P&L calculations (Realized & Unrealized), Overall Return on Investment, and Asset Allocation breakdowns.
- **Multi-User Isolation**: Complete client state and database security ensuring users only access their own orders and assets.
- **Clean Responsive UI**: Modern aesthetics featuring responsive dashboard grids, horizontal table scrolls, and micro-interactions.

---

## Technical Architecture

### Tech Stack
- **Frontend Core**: React.js, Tailwind CSS (PostCSS), Context API, Recharts, Lucide Icons.
- **Backend Core**: Node.js, Express.js, MongoDB Atlas (Mongoose ODM).
- **Security & Utilities**: JWT, Bcrypt.js, Helmet, Express Rate Limit, Nodemailer.

### Database Schema Map
| Collection | Description |
| :--- | :--- |
| **users** | Contains user credentials, verification tokens, and user ID metadata. |
| **stocks** | Stores NIFTY 50, SENSEX, and 15+ NSE equities with their active simulated prices. |
| **orders** | Logs complete transactional records (Buy/Sell) with timestamps. |
| **holdings** | Maintains current open investments and average purchase costs. |
| **positions** | Tracks open intraday/long-term trade positions. |
| **funds** | Manages cash margin balances, deposits/withdrawals, and overall P&L records. |

---

## Price Simulation Engine
The platform operates a self-contained server-side pricing engine. It processes updates every 30 seconds:
- **Tick Range**: Random price changes limited to $\pm 0.15\%$ per tick.
- **Daily Caps**: Hard limits preventing price drift beyond $\pm 5\%$ of the opening price.
- **Market Hours**: Realistic simulations with low volatility triggers outside standard NSE market hours (9:15 AM - 3:30 PM IST).
- **Self-Healing Safeguards**: Checks indices and clamps extreme deviations automatically, correcting anomalies in real-time.
- **Intraday Re-centering**: Automatic midnight reset of opening prices, coupled with intraday re-centering when drift exceeds $4\%$ from the open.

---

## Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- Gmail Account with App Password (for mail routing)

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the environment variables:
   ```bash
   cp .env.example .env
   ```
   Add your database and SMTP credentials:
   ```env
   PORT=3005
   MONGO_URL=your_mongodb_atlas_connection_string
   TOKEN_KEY=your_jwt_secret_key
   REFRESH_TOKEN_KEY=your_jwt_refresh_secret
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_gmail_app_password
   CLIENT_URL=http://localhost:3001
   NODE_ENV=development
   ```
4. Start the backend:
   ```bash
   npm start
   ```

### 2. Landing Page Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm start
   ```
   *Available on [http://localhost:3001](http://localhost:3001).*

### 3. Dashboard Setup
1. Navigate to the Dashboard directory:
   ```bash
   cd ../Dashboard
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm start
   ```
   *Available on [http://localhost:3002](http://localhost:3002).*

---

## Demo Credentials
To bypass registration and test immediately, access the pre-seeded demo user:
- **Email**: `demo@niveshcapital.com`
- **Password**: `Demo@1234`

---

## Disclaimer
**NiveshCapital** is a simulated trading platform built for educational and training purposes only. It uses virtual currency and simulated stock metrics. No real money or actual trades are processed on this application.
