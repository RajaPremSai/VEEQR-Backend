const mongoose = require('mongoose');

const universityVehicleSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, unique: true, trim: true },
  vehicleType: { type: String, required: true },
  vehicleModelName: { type: String },
  driverName: { type: String },
  driverMobileNumber: { type: String },
}, { timestamps: true });

universityVehicleSchema.index({ vehicleNumber: 1 });

module.exports = mongoose.model('UniversityVehicle', universityVehicleSchema); 