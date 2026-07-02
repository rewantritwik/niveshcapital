const mongoose = require("mongoose");

const FundsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  available: { type: Number, default: 100000 },
  openingBalance: { type: Number, default: 100000 },
  totalInvested: { type: Number, default: 0 },
  realizedPnL: { type: Number, default: 0 },
  totalPayin: { type: Number, default: 0 },
  totalPayout: { type: Number, default: 0 },
  transactions: [
    {
      amount: { type: Number, required: true },
      type: { type: String, enum: ['add', 'withdraw'], required: true },
      date: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model("Funds", FundsSchema);