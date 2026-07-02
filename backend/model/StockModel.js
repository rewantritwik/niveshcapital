const mongoose = require("mongoose");

const StockSchema = new mongoose.Schema({
  symbol:        { type: String, required: true, unique: true },
  companyName:   { type: String, required: true },
  currentPrice:  { type: Number, required: true },
  previousClose: { type: Number, required: true },
  openPrice:     { type: Number, required: true },
  dayHigh:       { type: Number, required: true },
  dayLow:        { type: Number, required: true },
  change:        { type: Number, default: 0 },
  changePercent: { type: Number, default: 0 },
  volume:        { type: Number, default: 0 },
  marketCap:     { type: String, default: '' },
  sector:        { type: String, default: '' },
  lastUpdated:   { type: Date, default: Date.now }
});

module.exports = mongoose.model("Stock", StockSchema);
