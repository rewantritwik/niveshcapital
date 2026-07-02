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
    'niveshcapital.vercel.app',
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

app.get('/createdemo', async (req, res) => {
  try {
    const UserModel = require('./model/UserModel')
    const FundsModel = require('./model/FundsModel')
    const HoldingModel = require('./model/HoldingModel')
    const PositionModel = require('./model/PositionModel')
    const OrderModel = require('./model/OrderModel')

    // Clean up existing demo entries
    await UserModel.deleteMany({ email: 'demo@niveshcapital.com' })
    await UserModel.deleteMany({ userId: 'DEMO001' })
    await FundsModel.deleteMany({ userId: 'DEMO001' })
    await HoldingModel.deleteMany({ userId: 'DEMO001' })
    await PositionModel.deleteMany({ userId: 'DEMO001' })
    await OrderModel.deleteMany({ userId: 'DEMO001' })
    
    await UserModel.create({
      username:    'DemoUser',
      email:       'demo@niveshcapital.com',
      password:    'Demo@1234', // Passed as plaintext so the pre-save hook hashes it once
      userId:      'DEMO001',
      isVerified:  true
    })

    await FundsModel.create({
      userId:        'DEMO001',
      available:     72450.75,
      openingBalance: 100000,
      totalInvested:  27549.25,
      realizedPnL:    312.50
    })

    await HoldingModel.insertMany([
      { userId: 'DEMO001', name: 'RELIANCE',   qty: 5,  avg: 2420.00 },
      { userId: 'DEMO001', name: 'TCS',        qty: 2,  avg: 3810.00 },
      { userId: 'DEMO001', name: 'INFY',       qty: 8,  avg: 1575.00 },
      { userId: 'DEMO001', name: 'HDFCBANK',   qty: 3,  avg: 1610.00 },
      { userId: 'DEMO001', name: 'ICICIBANK',  qty: 10, avg: 945.00  },
      { userId: 'DEMO001', name: 'AXISBANK',   qty: 4,  avg: 1015.00 }
    ])

    await PositionModel.insertMany([
      { userId: 'DEMO001', name: 'RELIANCE',   qty: 5,  avg: 2420.00, product: 'CNC' },
      { userId: 'DEMO001', name: 'TCS',        qty: 2,  avg: 3810.00, product: 'CNC' },
      { userId: 'DEMO001', name: 'INFY',       qty: 8,  avg: 1575.00, product: 'CNC' },
      { userId: 'DEMO001', name: 'HDFCBANK',   qty: 3,  avg: 1610.00, product: 'CNC' },
      { userId: 'DEMO001', name: 'ICICIBANK',  qty: 10, avg: 945.00,  product: 'CNC' },
      { userId: 'DEMO001', name: 'AXISBANK',   qty: 4,  avg: 1015.00, product: 'CNC' }
    ])

    const now = new Date()
    await OrderModel.insertMany([
      { userId: 'DEMO001', name: 'RELIANCE',  mode: 'BUY',  qty: 5,  price: 2420.00, total: 12100.00, status: 'Executed', createdAt: new Date(now - 2*24*60*60*1000) },
      { userId: 'DEMO001', name: 'TCS',       mode: 'BUY',  qty: 2,  price: 3810.00, total: 7620.00,  status: 'Executed', createdAt: new Date(now - 2*24*60*60*1000) },
      { userId: 'DEMO001', name: 'INFY',      mode: 'BUY',  qty: 8,  price: 1575.00, total: 12600.00, status: 'Executed', createdAt: new Date(now - 2*24*60*60*1000) },
      { userId: 'DEMO001', name: 'HDFCBANK',  mode: 'BUY',  qty: 3,  price: 1610.00, total: 4830.00,  status: 'Executed', createdAt: new Date(now - 1*24*60*60*1000) },
      { userId: 'DEMO001', name: 'ICICIBANK', mode: 'BUY',  qty: 10, price: 945.00,  total: 9450.00,  status: 'Executed', createdAt: new Date(now - 1*24*60*60*1000) },
      { userId: 'DEMO001', name: 'AXISBANK',  mode: 'BUY',  qty: 4,  price: 1015.00, total: 4060.00,  status: 'Executed', createdAt: new Date(now - 60*60*1000) },
      { userId: 'DEMO001', name: 'WIPRO',     mode: 'BUY',  qty: 15, price: 477.80,  total: 7167.00,  status: 'Executed', createdAt: new Date(now - 3*24*60*60*1000) },
      { userId: 'DEMO001', name: 'WIPRO',     mode: 'SELL', qty: 15, price: 498.50,  total: 7477.50,  status: 'Executed', createdAt: new Date(now - 2*60*60*1000) }
    ])

    res.json({
      message: 'Demo account created successfully!',
      credentials: {
        email:    'demo@niveshcapital.com',
        password: 'Demo@1234',
        userId:   'DEMO001'
      },
      portfolio: {
        holdings:      6,
        orders:        8,
        availableFunds: 72450.75,
        realizedPnL:    312.50
      }
    })
  } catch (err) {
    console.error('Create demo error:', err)
    res.status(500).json({ message: err.message })
  }
})

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