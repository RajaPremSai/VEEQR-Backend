const mongoose = require('mongoose');

const gateSchema = new mongoose.Schema({
  gateNumber: { type: String, required: true, unique: true, trim: true },
  gateName: { type: String, required: true, trim: true },
}, { timestamps: true });

gateSchema.index({ gateNumber: 1 });

module.exports = mongoose.model('Gate', gateSchema); 