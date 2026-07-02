const StockModel = require('../model/StockModel');

const STOCK_SEED_DATA = [
  {
    symbol: 'RELIANCE', companyName: 'Reliance Industries', currentPrice: 2456.20,
    previousClose: 2420.00, openPrice: 2430.00, dayHigh: 2470.00, dayLow: 2415.00,
    sector: 'Energy', marketCap: '16.6T', volume: 4521000
  },
  {
    symbol: 'TCS', companyName: 'Tata Consultancy Services', currentPrice: 3840.50,
    previousClose: 3800.00, openPrice: 3810.00, dayHigh: 3860.00, dayLow: 3795.00,
    sector: 'IT', marketCap: '13.9T', volume: 1230000
  },
  {
    symbol: 'INFY', companyName: 'Infosys Ltd', currentPrice: 1562.80,
    previousClose: 1580.00, openPrice: 1575.00, dayHigh: 1580.00, dayLow: 1555.00,
    sector: 'IT', marketCap: '6.5T', volume: 3450000
  },
  {
    symbol: 'HDFCBANK', companyName: 'HDFC Bank Ltd', currentPrice: 1642.10,
    previousClose: 1600.00, openPrice: 1610.00, dayHigh: 1650.00, dayLow: 1605.00,
    sector: 'Banking', marketCap: '12.4T', volume: 2890000
  },
  {
    symbol: 'ICICIBANK', companyName: 'ICICI Bank Ltd', currentPrice: 954.30,
    previousClose: 920.00, openPrice: 930.00, dayHigh: 960.00, dayLow: 925.00,
    sector: 'Banking', marketCap: '6.7T', volume: 5670000
  },
  {
    symbol: 'AXISBANK', companyName: 'Axis Bank Ltd', currentPrice: 1020.15,
    previousClose: 1030.00, openPrice: 1025.00, dayHigh: 1035.00, dayLow: 1015.00,
    sector: 'Banking', marketCap: '3.1T', volume: 3210000
  },
  {
    symbol: 'SBIN', companyName: 'State Bank of India', currentPrice: 612.40,
    previousClose: 600.00, openPrice: 605.00, dayHigh: 618.00, dayLow: 600.00,
    sector: 'Banking', marketCap: '5.4T', volume: 8900000
  },
  {
    symbol: 'WIPRO', companyName: 'Wipro Ltd', currentPrice: 482.90,
    previousClose: 500.00, openPrice: 495.00, dayHigh: 498.00, dayLow: 480.00,
    sector: 'IT', marketCap: '2.5T', volume: 2340000
  },
  {
    symbol: 'BHARTIARTL', companyName: 'Bharti Airtel Ltd', currentPrice: 1120.00,
    previousClose: 1100.00, openPrice: 1108.00, dayHigh: 1128.00, dayLow: 1102.00,
    sector: 'Telecom', marketCap: '6.2T', volume: 1890000
  },
  {
    symbol: 'HINDUNILVR', companyName: 'Hindustan Unilever', currentPrice: 2540.20,
    previousClose: 2500.00, openPrice: 2510.00, dayHigh: 2548.00, dayLow: 2505.00,
    sector: 'FMCG', marketCap: '5.9T', volume: 980000
  },
  {
    symbol: 'ITC', companyName: 'ITC Ltd', currentPrice: 435.50,
    previousClose: 430.00, openPrice: 432.00, dayHigh: 438.00, dayLow: 428.00,
    sector: 'FMCG', marketCap: '5.4T', volume: 7650000
  },
  {
    symbol: 'KOTAKBANK', companyName: 'Kotak Mahindra Bank', currentPrice: 1756.30,
    previousClose: 1740.00, openPrice: 1745.00, dayHigh: 1762.00, dayLow: 1738.00,
    sector: 'Banking', marketCap: '3.4T', volume: 1230000
  },
  {
    symbol: 'LT', companyName: 'Larsen & Toubro', currentPrice: 3245.60,
    previousClose: 3200.00, openPrice: 3210.00, dayHigh: 3258.00, dayLow: 3198.00,
    sector: 'Infrastructure', marketCap: '4.5T', volume: 890000
  },
  {
    symbol: 'MARUTI', companyName: 'Maruti Suzuki India', currentPrice: 10456.00,
    previousClose: 10300.00, openPrice: 10350.00, dayHigh: 10480.00, dayLow: 10320.00,
    sector: 'Automobile', marketCap: '3.1T', volume: 340000
  },
  {
    symbol: 'BAJFINANCE', companyName: 'Bajaj Finance Ltd', currentPrice: 6823.45,
    previousClose: 6750.00, openPrice: 6770.00, dayHigh: 6845.00, dayLow: 6745.00,
    sector: 'Finance', marketCap: '4.1T', volume: 560000
  },
  {
    symbol: '^NSEI', companyName: 'NIFTY 50', currentPrice: 23456.75,
    previousClose: 23100.00, openPrice: 23200.00, dayHigh: 23500.00, dayLow: 23150.00,
    sector: 'Index', marketCap: '', volume: 0
  },
  {
    symbol: '^BSESN', companyName: 'SENSEX', currentPrice: 77890.25,
    previousClose: 77200.00, openPrice: 77400.00, dayHigh: 77950.00, dayLow: 77300.00,
    sector: 'Index', marketCap: '', volume: 0
  }
];




async function seedStocks() {
  try {
    for (const stock of STOCK_SEED_DATA) {
      await StockModel.updateOne(
        { symbol: stock.symbol },
        { $setOnInsert: stock },
        { upsert: true }
      );
    }
    console.log('Stock models seeded successfully');
  } catch (err) {
    if (err.code === 11000) {
      console.log('Stocks already exist — skipped');
    } else {
      console.error('Seed error:', err.message);
    }
  }
}




function startPriceSimulation() {
  setInterval(async () => {
    if (global.simulationPaused) return;  
    try {
      const stocks = await StockModel.find({});
      if (stocks.length === 0) return;

      const now = new Date();
      const totalMinutes = now.getHours() * 60 + now.getMinutes();
      const isMarketHours =
        totalMinutes >= (9 * 60 + 15) &&
        totalMinutes <= (15 * 60 + 30);

      const bulkOps = stocks.map(stock => {
        if (global.simulationPaused) return null;

        const isIndex = stock.symbol.startsWith('^');
        const MAX_PERCENT = isIndex ? 1.0 : 8.0;

        let volatility;
        if (!isMarketHours) {
          volatility = 0.0001;
        } else {
          volatility = isIndex ? 0.0008 : 0.0015;
        }

        if (Math.random() < 0.30) {
          return {
            updateOne: {
              filter: { _id: stock._id },
              update: {
                $set: { lastUpdated: new Date() },
                $inc: { volume: isIndex ? 0 : Math.floor(Math.random() * 1000) }
              }
            }
          };
        }

        const lastChange = stock.change || 0;
        const momentum = lastChange > 0 ? 0.1 : lastChange < 0 ? -0.1 : 0;
        const randomFactor = (Math.random() - 0.5) * 2 + momentum;

        const priceChange = stock.currentPrice * volatility * randomFactor;
        const newPrice = parseFloat((stock.currentPrice + priceChange).toFixed(2));
        const maxMove = isIndex ? 0.03 : 0.05;
        const maxPrice = stock.openPrice * (1 + maxMove);
        const minPrice = stock.openPrice * (1 - maxMove);
        const clampedPrice = parseFloat(
          Math.min(Math.max(newPrice, minPrice), maxPrice).toFixed(2)
        );

        let change = parseFloat((clampedPrice - stock.previousClose).toFixed(2));
        let changePercent = parseFloat(
          ((change / stock.previousClose) * 100).toFixed(2)
        );

        
        if (Math.abs(changePercent) > MAX_PERCENT) {
          console.log(
            `⚠️  ${stock.symbol} has bad changePercent: ${changePercent}% — auto-fixing...`
          );
          const fixedVariance = (Math.random() - 0.5) * 0.02;
          const fixedPrevClose = parseFloat(
            (clampedPrice / (1 + fixedVariance)).toFixed(2)
          );
          change = parseFloat((clampedPrice - fixedPrevClose).toFixed(2));
          changePercent = parseFloat(
            ((change / fixedPrevClose) * 100).toFixed(2)
          );

          return {
            updateOne: {
              filter: { _id: stock._id },
              update: {
                $set: {
                  currentPrice: clampedPrice,
                  previousClose: fixedPrevClose,
                  change,
                  changePercent,
                  dayHigh: Math.max(stock.dayHigh, clampedPrice),
                  dayLow: Math.min(stock.dayLow, clampedPrice),
                  lastUpdated: new Date()
                },
                $inc: { volume: isIndex ? 0 : Math.floor(Math.random() * 5000) }
              }
            }
          };
        }

        
        return {
          updateOne: {
            filter: { _id: stock._id },
            update: {
              $set: {
                currentPrice: clampedPrice,
                change,
                changePercent,
                dayHigh: Math.max(stock.dayHigh, clampedPrice),
                dayLow: Math.min(stock.dayLow, clampedPrice),
                lastUpdated: new Date()
              },
              $inc: { volume: isIndex ? 0 : Math.floor(Math.random() * 5000) }
            }
          }
        };
      }).filter(Boolean); 

      if (bulkOps.length > 0) {
        await StockModel.bulkWrite(bulkOps);
        console.log(
          `Prices simulated at ${new Date().toLocaleTimeString()} | ` +
          `Market: ${isMarketHours ? 'OPEN 🟢' : 'CLOSED 🔴'}`
        );
      }
    } catch (err) {
      console.error('Simulation error:', err.message);
    }
  }, 30000);
}













async function resetDailyPrices() {
  try {
    const stocks = await StockModel.find({});

    
    const badStocks = stocks.filter(s => Math.abs(s.changePercent) > 15);
    
    const zeroStocks = stocks.filter(s => s.changePercent === 0);

    const stocksToFix = [...new Set([...badStocks, ...zeroStocks])]

    if (stocksToFix.length > 0) {
      console.log(`Fixing ${stocksToFix.length} stocks with bad/zero data...`);

      const bulkOps = stocksToFix.map(stock => {
        
        
        const randomVariance = (Math.random() - 0.5) * 0.06
        const newPreviousClose = parseFloat(
          (stock.currentPrice / (1 + randomVariance)).toFixed(2)
        )
        const newChange = parseFloat(
          (stock.currentPrice - newPreviousClose).toFixed(2)
        )
        const newChangePercent = parseFloat(
          ((newChange / newPreviousClose) * 100).toFixed(2)
        )

        return {
          updateOne: {
            filter: { _id: stock._id },
            update: {
              $set: {
                
                
                previousClose: newPreviousClose,
                change: newChange,
                changePercent: newChangePercent
              }
            }
          }
        };
      });

      await StockModel.bulkWrite(bulkOps);
      console.log('Stock data fixed with mixed +/- changes ✅');

      
      const fixed = await StockModel.find({
        _id: { $in: stocksToFix.map(s => s._id) }
      })
      fixed.forEach(s => {
        const arrow = s.changePercent >= 0 ? '↑' : '↓'
        console.log(
          `  ${s.symbol.padEnd(12)} ${arrow} ${s.changePercent >= 0 ? '+' : ''}${s.changePercent}%`
        )
      })

    } else {
      console.log('All stock data looks healthy — no fix needed ✅');
    }

  } catch (err) {
    console.error('Reset error:', err.message);
  }

  
  setInterval(async () => {
    const now = new Date()
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      try {
        const stocks = await StockModel.find({})
        const bulkOps = stocks.map(stock => ({
          updateOne: {
            filter: { _id: stock._id },
            update: {
              $set: {
                
                
                
                previousClose: stock.currentPrice,
                openPrice:     stock.currentPrice,
                dayHigh:       stock.currentPrice,
                dayLow:        stock.currentPrice,
                change:        0,
                changePercent: 0
                
                
              }
            }
          }
        }))
        await StockModel.bulkWrite(bulkOps)
        console.log('Daily prices reset at midnight ✅')
        
        
        
        setTimeout(async () => {
          const freshStocks = await StockModel.find({})
          const tickOps = freshStocks.map(stock => {
            const isIndex = stock.symbol.startsWith('^')
            const variance = (Math.random() - 0.5) * 0.01
            const newPrice  = parseFloat(
              (stock.currentPrice * (1 + variance)).toFixed(2)
            )
            const change    = parseFloat((newPrice - stock.previousClose).toFixed(2))
            const changePct = parseFloat(((change / stock.previousClose) * 100).toFixed(2))
            return {
              updateOne: {
                filter: { _id: stock._id },
                update: {
                  $set: {
                    currentPrice:  newPrice,
                    change,
                    changePercent: changePct,
                    dayHigh:       newPrice,
                    dayLow:        newPrice,
                    lastUpdated:   new Date()
                  }
                }
              }
            }
          })
          await StockModel.bulkWrite(tickOps)
          console.log('Post-midnight initial tick done ✅')
        }, 5000)  

      } catch (err) {
        console.error('Midnight reset error:', err.message)
      }
    }
  }, 60000);
}

function startIntradayRecenter() {
  setInterval(async () => {
    try {
      const stocks = await StockModel.find({})
      const bulkOps = stocks.map(stock => {
        const isIndex = stock.symbol.startsWith('^')
        const distanceFromOpen = Math.abs(
          (stock.currentPrice - stock.openPrice) / stock.openPrice
        )
        
        
        
        if (distanceFromOpen > 0.04) {
          return {
            updateOne: {
              filter: { _id: stock._id },
              update: {
                $set: {
                  
                  
                  openPrice: stock.currentPrice
                }
              }
            }
          }
        }
        return null
      }).filter(Boolean)

      if (bulkOps.length > 0) {
        await StockModel.bulkWrite(bulkOps)
        console.log(`Recentered ${bulkOps.length} stocks that hit boundary`)
      }
    } catch (err) {
      console.error('Recenter error:', err.message)
    }
  }, 3 * 60 * 60 * 1000)  
}

module.exports = {
  STOCK_SEED_DATA,
  seedStocks,
  startPriceSimulation,
  resetDailyPrices,
  startIntradayRecenter
};