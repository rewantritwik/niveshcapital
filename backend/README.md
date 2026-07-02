# NiveshCapital — Backend API

The REST API and simulation engine for NiveshCapital, a full-stack stock trading simulator. Built with Node.js, Express.js, and MongoDB.

## Features
- **JWT Authorization**: Email token confirmation and password resets via Nodemailer.
- **Stock Simulator Engine**: Custom multi-threaded price movements running every 30 seconds.
- **Trade Execution**: Fast order matching for Buy/Sell requests.
- **Ledger & Margin Manager**: Deposits, withdrawals, and margin P&L updates.
- **Rate-Limiting**: Protection against abuse on public authentication routes.
- **Data Sanitization**: Helmet headers, NoSQL query sanitization, and request validators.

## Tech Stack
- Node.js + Express.js
- MongoDB Atlas (Mongoose ODM)
- JWT (jsonwebtoken) & BcryptJS
- Nodemailer (Gmail SMTP integration)
- Express Rate Limit & Mongo Sanitize

## Pricing Simulation Rules
Prices are updated every 30 seconds:
- **Movement Limit**: $\pm 0.15\%$ volatility per tick.
- **Index Guard**: Maximum deviation capped at $\pm 5\%$ of opening price.
- **NSE Trading Hours Bias**: Simulated low volume/flat-pricing outside regular market hours (9:15 AM - 3:30 PM IST).
- **Intraday Re-centering**: Resets open price to current price when stock drifts beyond $4\%$ to maintain active trading bands.

## Setup & Running
1. Install package dependencies:
   ```bash
   npm install
   ```
2. Configure the env:
   ```bash
   cp .env.example .env
   # Add your Atlas connection string and Gmail App Password
   ```
3. Start server:
   ```bash
   npm start
   ```
   *Runs on http://localhost:3005 by default.*

## Environment Variables
- `MONGO_URL` — Database path.
- `TOKEN_KEY` / `REFRESH_TOKEN_KEY` — Cryptographic keys for user sessions.
- `EMAIL_USER` / `EMAIL_PASS` — Mail transporter account.
- `CLIENT_URL` — Domain reference for email redirect link generation.