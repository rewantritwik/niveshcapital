const { placeOrder, getAllOrders, getAllHoldings, getAllPositions, getFunds, updateFunds, getPortfolioSummary } = require('../Controllers/TradeController');
const { userVerification } = require('../Middleware/AuthMiddleware');
const router = require('express').Router();

router.post('/newOrder', userVerification, placeOrder);
router.get('/allOrders', userVerification, getAllOrders);
router.get('/allHoldings', userVerification, getAllHoldings);
router.get('/allPositions', userVerification, getAllPositions);
router.get('/allFunds', userVerification, getFunds);
router.post('/updateFunds', userVerification, updateFunds);
router.get('/portfolio/summary', userVerification, getPortfolioSummary);

module.exports = router;
