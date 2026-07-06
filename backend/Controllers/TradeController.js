const mongoose = require('mongoose');
const OrderModel = require('../model/OrderModel');
const HoldingModel = require('../model/HoldingModel');
const PositionModel = require('../model/PositionModel');
const FundsModel = require('../model/FundsModel');
const StockModel = require('../model/StockModel');
const { DISPLAY_TO_SYMBOL } = require('../utils/symbolMap');

async function initFunds(userId) {
  let fundsDoc = await FundsModel.findOne({ userId });
  if (!fundsDoc) {
    fundsDoc = new FundsModel({ userId });
    await fundsDoc.save();
  }
  return fundsDoc;
}

module.exports.placeOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    const { name, qty, price, mode } = req.body;

    if (!name || qty === undefined || price === undefined || !mode) {
      return res.status(400).json({ message: "Missing required order fields" });
    }

    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ message: "Quantity must be a positive integer" });
    }

    if (price <= 0) {
      return res.status(400).json({ message: "Price must be greater than zero" });
    }

    if (mode !== 'BUY' && mode !== 'SELL') {
      return res.status(400).json({ message: "Mode must be 'BUY' or 'SELL'" });
    }

    
    const upperName = String(name).trim().toUpperCase();
    const dbSymbol = DISPLAY_TO_SYMBOL[upperName] || upperName;

    
    let stock = await StockModel.findOne({ symbol: dbSymbol });
    if (!stock) {
      stock = await StockModel.findOne({
        symbol: { $regex: new RegExp(`^${dbSymbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
    }

    if (!stock) {
      const allStocks = await StockModel.find({}, { symbol: 1, _id: 0 });

      return res.status(404).json({
        message: `Stock not found: ${dbSymbol}`,
        availableSymbols: allStocks.map(s => s.symbol)
      });
    }

    const fundsDoc = await initFunds(userId);
    const cost = parseFloat((qty * price).toFixed(2));

    const newOrder = new OrderModel({
      userId,
      name: stock.symbol,
      mode,
      qty,
      price,
      total: cost,
      status: 'Executed'
    });

    if (mode === 'BUY') {
      if (fundsDoc.available < cost) {
        return res.status(400).json({ message: `Insufficient funds. Available: ₹${fundsDoc.available.toFixed(2)}, Required: ₹${cost.toFixed(2)}` });
      }

      await newOrder.save({ session });

      
      let holding = await HoldingModel.findOne({ userId, name: stock.symbol }).session(session);
      if (holding) {
        const totalQty = holding.qty + qty;
        const totalValue = (holding.qty * holding.avg) + cost;
        holding.avg = parseFloat((totalValue / totalQty).toFixed(2));
        holding.qty = totalQty;
        await holding.save({ session });
      } else {
        await HoldingModel.create([{ userId, name: stock.symbol, qty, avg: price }], { session });
      }

      
      let position = await PositionModel.findOne({ userId, name: stock.symbol }).session(session);
      if (position) {
        const totalQty = position.qty + qty;
        const totalValue = (position.qty * position.avg) + cost;
        position.avg = parseFloat((totalValue / totalQty).toFixed(2));
        position.qty = totalQty;
        await position.save({ session });
      } else {
        await PositionModel.create([{ userId, name: stock.symbol, qty, avg: price, product: 'CNC' }], { session });
      }

      fundsDoc.available = parseFloat((fundsDoc.available - cost).toFixed(2));
      fundsDoc.totalInvested = parseFloat((fundsDoc.totalInvested + cost).toFixed(2));
      await fundsDoc.save({ session });

      await session.commitTransaction();
      return res.status(200).json({ message: "Order placed successfully", order: newOrder, updatedFunds: fundsDoc.available });

    } else if (mode === 'SELL') {
      let holding = await HoldingModel.findOne({ userId, name: stock.symbol }).session(session);

      if (!holding || holding.qty < qty) {
        return res.status(400).json({ message: `Insufficient shares. You own ${holding ? holding.qty : 0} shares of ${stock.symbol}` });
      }

      const avgAtSell = holding.avg;
      const proceeds = cost; 
      const realizedPnL = parseFloat(((price - avgAtSell) * qty).toFixed(2));

      await newOrder.save({ session });

      
      holding.qty -= qty;
      if (holding.qty === 0) {
        await HoldingModel.deleteOne({ _id: holding._id }, { session });
      } else {
        await holding.save({ session });
      }

      
      let position = await PositionModel.findOne({ userId, name: stock.symbol }).session(session);
      if (position) {
        position.qty -= qty;
        if (position.qty <= 0) {
          await PositionModel.deleteOne({ _id: position._id }, { session });
        } else {
          await position.save({ session });
        }
      }

      fundsDoc.available = parseFloat((fundsDoc.available + proceeds).toFixed(2));
      fundsDoc.totalInvested = parseFloat((fundsDoc.totalInvested - (avgAtSell * qty)).toFixed(2));
      fundsDoc.realizedPnL = parseFloat((fundsDoc.realizedPnL + realizedPnL).toFixed(2));
      await fundsDoc.save({ session });

      await session.commitTransaction();
      return res.status(200).json({ message: "Order placed successfully", order: newOrder, realizedPnL, updatedFunds: fundsDoc.available });
    }

  } catch (err) {
    console.error(err);

    try {
      await session.abortTransaction();
    } catch (e) {
      console.error("Abort transaction error:", e);
    }

    return res.status(500).json({
      success: false,
      message: err.message,
      error: String(err)
    });
  } finally {
    session.endSession();
  }
};

module.exports.getAllOrders = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const orders = await OrderModel.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await OrderModel.countDocuments({ userId });

    res.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.getAllHoldings = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    const holdings = await HoldingModel.find({ userId, qty: { $gt: 0 } });

    const names = holdings.map(h => h.name);
    const stocks = await StockModel.find({ symbol: { $in: names } });

    const pricesMap = {};
    stocks.forEach(s => {
      pricesMap[s.symbol] = { currentPrice: s.currentPrice, changePercent: s.changePercent };
    });

    const enrichedHoldings = holdings.map(h => {
      const livePrice = pricesMap[h.name]?.currentPrice || h.avg;
      const changePercent = pricesMap[h.name]?.changePercent || 0;
      const currentValue = parseFloat((livePrice * h.qty).toFixed(2));
      const investedValue = parseFloat((h.avg * h.qty).toFixed(2));
      const pnl = parseFloat((currentValue - investedValue).toFixed(2));
      const pnlPercent = parseFloat((((livePrice - h.avg) / h.avg) * 100).toFixed(2));

      return {
        name: h.name,
        qty: h.qty,
        avg: h.avg,
        livePrice,
        currentValue,
        investedValue,
        pnl,
        pnlPercent,
        dayChange: parseFloat(changePercent.toFixed(2))
      };
    });

    res.json(enrichedHoldings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.getAllPositions = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    const positions = await PositionModel.find({ userId, qty: { $gt: 0 } });

    const names = positions.map(p => p.name);
    const stocks = await StockModel.find({ symbol: { $in: names } });

    const pricesMap = {};
    stocks.forEach(s => {
      pricesMap[s.symbol] = { currentPrice: s.currentPrice, changePercent: s.changePercent };
    });

    const enrichedPositions = positions.map(p => {
      const livePrice = pricesMap[p.name]?.currentPrice || p.avg;
      const changePercent = pricesMap[p.name]?.changePercent || 0;
      const currentValue = parseFloat((livePrice * p.qty).toFixed(2));
      const investedValue = parseFloat((p.avg * p.qty).toFixed(2));
      const pnl = parseFloat((currentValue - investedValue).toFixed(2));
      const pnlPercent = parseFloat((((livePrice - p.avg) / p.avg) * 100).toFixed(2));

      return {
        name: p.name,
        qty: p.qty,
        avg: p.avg,
        product: p.product,
        livePrice,
        currentValue,
        investedValue,
        pnl,
        pnlPercent,
        dayChange: parseFloat(changePercent.toFixed(2))
      };
    });

    res.json(enrichedPositions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

async function getFundsData(userId) {
  const fundsDoc = await initFunds(userId);
  const holdings = await HoldingModel.find({ userId, qty: { $gt: 0 } });

  let unrealizedPnL = 0;
  let currentPortfolioValue = 0;

  if (holdings.length > 0) {
    const names = holdings.map(h => h.name);
    const stocks = await StockModel.find({ symbol: { $in: names } });
    const pricesMap = {};
    stocks.forEach(s => {
      pricesMap[s.symbol] = s.currentPrice;
    });

    unrealizedPnL = holdings.reduce((acc, h) => {
      const livePrice = pricesMap[h.name] || h.avg;
      return acc + ((livePrice - h.avg) * h.qty);
    }, 0);

    currentPortfolioValue = holdings.reduce((acc, h) => {
      const livePrice = pricesMap[h.name] || h.avg;
      return acc + (livePrice * h.qty);
    }, 0);
  }

  return {
    available: fundsDoc.available,
    openingBalance: fundsDoc.openingBalance,
    totalInvested: fundsDoc.totalInvested,
    realizedPnL: fundsDoc.realizedPnL,
    totalPayin: fundsDoc.totalPayin || 0,
    totalPayout: fundsDoc.totalPayout || 0,
    unrealizedPnL: parseFloat(unrealizedPnL.toFixed(2)),
    currentPortfolioValue: parseFloat(currentPortfolioValue.toFixed(2)),
    totalPnL: parseFloat((fundsDoc.realizedPnL + unrealizedPnL).toFixed(2)),
    portfolioReturn: fundsDoc.openingBalance > 0
      ? parseFloat((((fundsDoc.realizedPnL + unrealizedPnL) / fundsDoc.openingBalance) * 100).toFixed(2))
      : 0,
    transactions: fundsDoc.transactions || []
  };
}

module.exports.getFunds = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    const fundsData = await getFundsData(userId);
    res.json(fundsData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateFunds = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    const { amount, type } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than zero."
      })
    }
    if (!['add', 'withdraw'].includes(type)) {
      return res.status(400).json({
        message: "Type must be 'add' or 'withdraw'."
      })
    }

    const fundsDoc = await initFunds(userId)

    if (type === 'withdraw') {
      if (amount > fundsDoc.available) {
        return res.status(400).json({
          message: `Cannot withdraw ₹${amount}. Available balance: ₹${fundsDoc.available.toFixed(2)}`
        })
      }
      fundsDoc.available = parseFloat((fundsDoc.available - amount).toFixed(2))
      fundsDoc.totalPayout = parseFloat(
        ((fundsDoc.totalPayout || 0) + amount).toFixed(2)
      )
      
      if (!fundsDoc.transactions) fundsDoc.transactions = [];
      fundsDoc.transactions.push({ amount, type, date: new Date() })
    }

    if (type === 'add') {
      fundsDoc.available = parseFloat((fundsDoc.available + amount).toFixed(2))
      fundsDoc.totalPayin = parseFloat(
        ((fundsDoc.totalPayin || 0) + amount).toFixed(2)
      )
      
      if (!fundsDoc.transactions) fundsDoc.transactions = [];
      fundsDoc.transactions.push({ amount, type, date: new Date() })
    }

    await fundsDoc.save()

    return res.status(200).json({
      message: type === 'add'
        ? `₹${amount} added successfully`
        : `₹${amount} withdrawn successfully`,
      funds: fundsDoc
    })

  } catch (err) {
    console.error('updateFunds error:', err.message)
    return res.status(500).json({
      message: 'Failed to update funds: ' + err.message
    })
  }
}

module.exports.getPortfolioSummary = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    // Fetch holdings, funds, and order count in parallel (single DB round-trip each)
    const [holdings, fundsDoc, ordersCount] = await Promise.all([
      HoldingModel.find({ userId, qty: { $gt: 0 } }),
      initFunds(userId),
      OrderModel.countDocuments({ userId })
    ]);

    // Fetch live prices for held stocks
    const names = holdings.map(h => h.name);
    const stocks = names.length > 0
      ? await StockModel.find({ symbol: { $in: names } })
      : [];
    const pricesMap = {};
    stocks.forEach(s => { pricesMap[s.symbol] = s.currentPrice; });

    // Enrich holdings with live prices
    let unrealizedPnL = 0;
    let currentPortfolioValue = 0;

    const enrichedHoldings = holdings.map(h => {
      const livePrice = pricesMap[h.name] || h.avg;
      const currentValue = parseFloat((livePrice * h.qty).toFixed(2));
      const investedValue = h.avg * h.qty;
      const pnl = parseFloat((currentValue - investedValue).toFixed(2));

      unrealizedPnL += (livePrice - h.avg) * h.qty;
      currentPortfolioValue += livePrice * h.qty;

      return { name: h.name, qty: h.qty, avg: h.avg, livePrice, currentValue, pnl };
    });

    unrealizedPnL = parseFloat(unrealizedPnL.toFixed(2));
    currentPortfolioValue = parseFloat(currentPortfolioValue.toFixed(2));
    const totalPnL = parseFloat((fundsDoc.realizedPnL + unrealizedPnL).toFixed(2));

    // Build funds result inline (no second getFundsData call)
    const fundsResult = {
      available: fundsDoc.available,
      openingBalance: fundsDoc.openingBalance,
      totalInvested: fundsDoc.totalInvested,
      realizedPnL: fundsDoc.realizedPnL,
      totalPayin: fundsDoc.totalPayin || 0,
      totalPayout: fundsDoc.totalPayout || 0,
      unrealizedPnL,
      currentPortfolioValue,
      totalPnL,
      portfolioReturn: fundsDoc.openingBalance > 0
        ? parseFloat(((totalPnL / fundsDoc.openingBalance) * 100).toFixed(2))
        : 0,
    };

    const topHoldings = enrichedHoldings
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, 5);

    res.json({
      funds: fundsResult,
      holdingsCount: enrichedHoldings.length,
      ordersCount,
      topHoldings
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};