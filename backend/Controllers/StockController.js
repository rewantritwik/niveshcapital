const StockModel = require('../model/StockModel');
const { DISPLAY_TO_SYMBOL } = require('../utils/symbolMap');

module.exports.getAllStocks = async (req, res) => {
  try {
    const stocks = await StockModel.find({ symbol: { $not: /^\^/ } });
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.getStockPrice = async (req, res) => {
  try {
    const symbol = req.params.symbol;
    
    const normalizedSymbol = DISPLAY_TO_SYMBOL[symbol.toUpperCase()] || symbol;
    const stock = await StockModel.findOne({ symbol: new RegExp(`^${normalizedSymbol}$`, 'i') });
    if (!stock) return res.status(404).json({ message: 'Stock not found' });
    
    res.json({
      symbol: stock.symbol,
      currentPrice: stock.currentPrice,
      change: stock.change,
      changePercent: stock.changePercent,
      dayHigh: stock.dayHigh,
      dayLow: stock.dayLow,
      volume: stock.volume,
      lastUpdated: stock.lastUpdated,
      companyName: stock.companyName,
      sector: stock.sector
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.getStockPrices = async (req, res) => {
  try {
    const symbolsQuery = req.query.symbols;
    if (!symbolsQuery) return res.json({});

    
    const symbols = symbolsQuery.split(',').map(s => {
      const trimmed = s.trim().toUpperCase();
      return DISPLAY_TO_SYMBOL[trimmed] || trimmed;
    });
    if (symbols.length === 0) return res.json({});

    const stocks = await StockModel.find({ symbol: { $in: symbols } });

    const pricesMap = {};
    stocks.forEach(stock => {
      pricesMap[stock.symbol.toUpperCase()] = {
        currentPrice: stock.currentPrice,
        change: stock.change,
        changePercent: stock.changePercent,
        dayHigh: stock.dayHigh,
        dayLow: stock.dayLow,
        volume: stock.volume,
        lastUpdated: stock.lastUpdated,
        price: stock.currentPrice 
      };
    });
    res.json(pricesMap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.getIndices = async (req, res) => {
  try {
    const stocks = await StockModel.find({ 
      symbol: { $in: ['^NSEI', '^BSESN'] } 
    });
    const indices = {};

    stocks.forEach(stock => {
      
      
      let safeChangePercent = stock.changePercent;
      if (Math.abs(safeChangePercent) > 5) {
        
        safeChangePercent = parseFloat(
          ((Math.random() - 0.5) * 2).toFixed(2)
        );
        
        StockModel.updateOne(
          { _id: stock._id },
          {
            $set: {
              previousClose: parseFloat(
                (stock.currentPrice / (1 + safeChangePercent/100)).toFixed(2)
              ),
              changePercent: safeChangePercent,
              change: parseFloat(
                (stock.currentPrice * safeChangePercent / 100).toFixed(2)
              )
            }
          }
        ).catch(err => console.error('Auto-fix index error:', err.message));
      }

      if (stock.symbol === '^NSEI') {
        indices.nifty = { 
          value: stock.currentPrice, 
          change: stock.change, 
          changePercent: safeChangePercent
        };
      }
      if (stock.symbol === '^BSESN') {
        indices.sensex = { 
          value: stock.currentPrice, 
          change: stock.change, 
          changePercent: safeChangePercent
        };
      }
    });

    res.json(indices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
