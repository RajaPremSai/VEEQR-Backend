const asyncHandler = require('../middleware/asyncHandler');
const { signPayload, verifySignature } = require('../utils/signature');
const { generateQrPng } = require('../utils/qrcode');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Log = require('../models/Log');
const Announcement = require('../models/Announcement');
const SecurityGuard = require('../models/SecurityGuard'); // Added import for SecurityGuard

exports.register = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ user: { ...user.toObject(), password: undefined } });
});

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ profile: user });
});

exports.getProfileByEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
});

exports.addVehicle = asyncHandler(async (req, res) => {
  const { vehicleNumber, vehicleType, vehicleModelName, vehicleImages, vehicleOwner, driverName, driverMobileNumber } = req.body;

  const payload = JSON.stringify({ vehicleNumber });
  const signature = signPayload(payload, process.env.QR_SECRET || 'qr_secret');

  const fileSafe = vehicleNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
  const imageUrl = await generateQrPng(JSON.stringify({ payload, signature }), fileSafe);

  const vehicle = await Vehicle.create({
    vehicleNumber,
    vehicleType,
    vehicleModelName,
    vehicleImages,
    vehicleOwner,
    driverName,
    driverMobileNumber,
    empNumber: (await User.findById(req.user.id)).empNumber,
    ownerUserId: req.user.id,
    qr: { payload, signature, imageUrl }
  });

  res.status(201).json({ vehicle });
});

exports.getMyVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ ownerUserId: req.user.id }).sort({ createdAt: -1 });
  res.json({ vehicles });
});

exports.updateMyVehicle = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  const vehicle = await Vehicle.findOneAndUpdate({ _id: vehicleId, ownerUserId: req.user.id }, req.body, { new: true });
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  res.json({ vehicle });
});

exports.deleteMyVehicle = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  const vehicle = await Vehicle.findOneAndDelete({ _id: vehicleId, ownerUserId: req.user.id });
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  res.json({ success: true });
});

exports.getMyLogs = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const myVehicles = await Vehicle.find({ empNumber: user.empNumber });
  const numbers = myVehicles.map(v => v.vehicleNumber);
  const logs = await Log.find({ vehicleNumber: { $in: numbers } }).sort({ createdAt: -1 }).lean();
  
  // Enhance logs with additional information
  const enhancedLogs = await Promise.all(logs.map(async (log) => {
    // Get security guard details
    const guard = await SecurityGuard.findById(log.securityGuardId);
    
    return {
      ...log,
      securityGuardName: guard ? `${guard.firstName} ${guard.lastName}` : 'N/A'
    };
  }));
  
  res.json({ logs: enhancedLogs });
});

exports.getAnnouncements = asyncHandler(async (req, res) => {
  const anns = await Announcement.find().sort({ createdAt: -1 });
  res.json({ announcements: anns });
}); 