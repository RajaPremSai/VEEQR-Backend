const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, unique: true, trim: true },
  vehicleType: { type: String, enum: ['Car', 'Bike', 'Scooter', 'Bus', 'Other'], default: 'Car' },
  vehicleModelName: { type: String, trim: true },
  vehicleImages: [{ type: String }],
  vehicleOwner: { type: String, required: true },
  driverName: { type: String },
  driverMobileNumber: { type: String },
  empNumber: { type: String, required: true },

  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  qr: {
    payload: { type: String, required: true },
    signature: { type: String, required: true },
    imageUrl: { type: String, required: true },
  }
}, { timestamps: true });

vehicleSchema.index({ vehicleNumber: 1 });
vehicleSchema.index({ empNumber: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema); 