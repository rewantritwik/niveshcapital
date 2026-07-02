# NiveshCapital — Trading Portal

The primary trading application workspace for NiveshCapital. A Zerodha Kite-inspired dashboard tracking real-time metrics, simulated stock prices, holdings, positions, order logs, and funds management.

## Key Features
- **Holdings Overview**: Complete summary of investments showing buy price, current price, and unrealized returns.
- **Positions Panel**: Tracks intraday trade logs and open positions.
- **Order Book**: Structured table with pagination displaying executed mock orders.
- **Funds Ledger**: Visual summary card displaying available margin, total payin/payout, and overall ROI percentage return cards. Includes interactive deposit/withdrawal panels.
- **Watchlist Sidebar**: Collapses on mobile screens. Offers search, select, and buy/sell modal integrations.

## Tech Stack
- **Framework**: React.js
- **Styling**: Tailwind CSS
- **Charts**: Recharts (dynamically scaled using callback ref ResizeObservers)
- **API Client**: Axios

## Getting Started
1. Install package dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```
   *Runs on http://localhost:3002 by default.*
