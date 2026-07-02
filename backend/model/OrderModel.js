const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId:    { type: String, required: true, index: true },
  name:      { type: String, required: true },
  mode:      { type: String, enum: ['BUY', 'SELL'], required: true },
  qty:       { type: Number, required: true, min: 1 },
  price:     { type: Number, required: true, min: 0.01 },
  total:     { type: Number, required: true },
  status:    { type: String, default: 'Executed' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", OrderSchema);
