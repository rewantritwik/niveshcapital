const yahooFinance = require("yahoo-finance2").default;
const NodeCache = require("node-cache");
const symbolMap = require("./symbolMap");


const cache = new NodeCache({ stdTTL: 60 });


async function getLivePrice(symbol) {
  try {
    const cleanSymbol = symbol.trim().toUpperCase();
    
    
    const cached = cache.get(cleanSymbol);
    if (cached) {
      return cached;
    }

    
    const yahooSymbol = symbolMap[cleanSymbol] || `${cleanSymbol.replace(/\s+/g, "")}.NS`;

    
    const quote = await yahooFinance.quote(yahooSymbol);
    if (quote && quote.regularMarketPrice !== undefined) {
      const priceData = {
        price: quote.regularMarketPrice,
        change: quote.regularMarketChangePercent || 0,
      };
      
      
      cache.set(cleanSymbol, priceData);
      return priceData;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching live price for ${symbol}:`, error.message || error);
    return null;
  }
}


async function getLivePrices(symbols) {
  const result = {};
  if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
    return result;
  }

  try {
    const promises = symbols.map(async (symbol) => {
      const data = await getLivePrice(symbol);
      if (data) {
        result[symbol] = data;
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error("Error fetching multiple live prices:", error.message || error);
  }

  return result;
}

module.exports = {
  getLivePrice,
  getLivePrices,
};
