# NiveshCapital — Landing Page

The premium public-facing landing page for NiveshCapital, a full-stack stock trading simulator. Built with React.js and styled using a custom PostCSS-Tailwind CSS integration.

## Key Features
- **Live Stock Ticker**: Dynamic banner showcasing simulated stock prices from the API.
- **Market Snapshot**: Interactive preview of NIFTY 50 and SENSEX indices.
- **Top Performers list**: Toggle to inspect current Top Gainers and Top Losers.
- **Interactive Sandbox Demo**: Mock watchlist graph allowing users to simulate portfolio changes directly on the landing page.
- **Modular Sign In / Sign Up**: JWT authentication workflow support.
- **Instant Try Demo Action**: Quick authorization trigger logging into the pre-seeded account.

## Technical Configuration
- **Core Framework**: React.js
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Charts**: Recharts (dynamic ResizeObserver-based scaling)
- **Icons**: Lucide React
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
   *Runs on http://localhost:3001 by default.*

## Integration Notes
Ensure the backend API (port `3005`) is running, as the index updates and demo triggers communicate with it directly.