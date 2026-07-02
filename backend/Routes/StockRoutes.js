const { getAllStocks, getStockPrice, getStockPrices, getIndices } = require('../Controllers/StockController');
const router = require('express').Router();

router.get('/allStocks', getAllStocks);
router.get('/stockPrice/:symbol', getStockPrice);
router.get('/stockPrices', getStockPrices);
router.get('/indices', getIndices);

module.exports = router;
