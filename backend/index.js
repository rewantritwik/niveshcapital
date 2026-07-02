require('dotenv').config();
global.simulationPaused = false;
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');

const authRoute = require('./Routes/AuthRoutes');
const tradeRoute = require('./Routes/TradeRoutes');
const stockRoute = require('./Routes/StockRoutes');
const { seedStocks, startPriceSimulation, resetDailyPrices, startIntradayRecenter } = require('./utils/priceSimulator');
const { seedDemoUser } = require('./utils/seedUser');

const PORT = process.env.PORT || 3005;
const app = express();


app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://niveshcapital.vercel.app',          // ← fixed
    'https://niveshcapital-dashboard.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: { ...req.query },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
});
app.use(mongoSanitize());


app.use('/', authRoute);
app.use('/', tradeRoute);
app.use('/', stockRoute);

app.get('/', (req, res) => res.send('NiveshCapital API running!'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});


const localUri = 'mongodb://127.0.0.1:27017/Nivesh';

async function connectDB(uri, isFallback = false) {
  try {
    await mongoose.connect(uri);
    console.log(`DB connected (${isFallback ? 'Local' : 'Atlas'})`);

    await seedStocks();
    await seedDemoUser();
    startPriceSimulation();
    await resetDailyPrices();
    startIntradayRecenter();

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error(`DB connection failed (${isFallback ? 'Local' : 'Atlas'}):`, err.message);
    if (!isFallback) {
      console.log('Trying local fallback...');
      await connectDB(localUri, true);
    } else {
      console.error('Both connections failed. Exiting.');
      process.exit(1);
    }
  }
}

connectDB(process.env.MONGO_URL);