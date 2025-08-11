const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  logId: { type: String },
  securityGuardId: { type: String, required: true },
  vehicleNumber: { type: String, required: true, trim: true },
  timeIn: { type: Date },
  timeOut: { type: Date },
  gateNumber: { type: String, required: true },
}, { timestamps: true });

logSchema.index({ vehicleNumber: 1, createdAt: -1 });
logSchema.index({ gateNumber: 1, createdAt: -1 });
logSchema.index({ securityGuardId: 1, createdAt: -1 });

module.exports = mongoose.model('Log', logSchema); 