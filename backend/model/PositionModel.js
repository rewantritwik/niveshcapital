const mongoose = require("mongoose");

const PositionSchema = new mongoose.Schema({
  userId:  { type: String, required: true },
  name:    { type: String, required: true },
  qty:     { type: Number, required: true, min: 0 },
  avg:     { type: Number, required: true },
  product: { type: String, default: 'CNC' }
});

PositionSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Position", PositionSchema);
