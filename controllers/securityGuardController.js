const asyncHandler = require('../middleware/asyncHandler');
const SecurityGuard = require('../models/SecurityGuard');
const Gate = require('../models/Gate');
const Announcement = require('../models/Announcement');
const Log = require('../models/Log');
const Vehicle = require('../models/Vehicle');
const UniversityVehicle = require('../models/UniversityVehicle'); // Added UniversityVehicle import
const { verifySignature } = require('../utils/signature');

exports.getProfile = asyncHandler(async (req, res) => {
  const guard = await SecurityGuard.findById(req.user.id).populate('assignedGates');
  res.json({ profile: guard });
});

exports.getAssignedGates = asyncHandler(async (req, res) => {
  const guard = await SecurityGuard.findById(req.user.id).populate('assignedGates');
  res.json({ gates: guard?.assignedGates || [] });
});

exports.getAnnouncements = asyncHandler(async (req, res) => {
  const anns = await Announcement.find().sort({ createdAt: -1 });
  res.json({ announcements: anns });
});

exports.getLogs = asyncHandler(async (req, res) => {
  const guard = await SecurityGuard.findById(req.user.id);
  const gateNumbers = (await Gate.find({ _id: { $in: guard.assignedGates } }))
    .map(g => g.gateNumber);
  const logs = await Log.find({ gateNumber: { $in: gateNumbers } }).sort({ createdAt: -1 }).lean();
  
  // Enhance logs with additional information
  const enhancedLogs = await Promise.all(logs.map(async (log) => {
    // Get vehicle details
    const vehicle = await Vehicle.findOne({ vehicleNumber: log.vehicleNumber });
    const uniVehicle = await UniversityVehicle.findOne({ vehicleNumber: log.vehicleNumber });
    
    // Get security guard details
    const logGuard = await SecurityGuard.findById(log.securityGuardId);
    
    return {
      ...log,
      vehicleOwner: vehicle?.vehicleOwner || uniVehicle?.driverName || 'N/A',
      securityGuardName: logGuard ? `${logGuard.firstName} ${logGuard.lastName}` : 'N/A'
    };
  }));
  
  res.json({ logs: enhancedLogs });
});

exports.getLogsByGuard = asyncHandler(async (req, res) => {
  const logs = await Log.find({ securityGuardId: req.params.guardId }).sort({ createdAt: -1 });
  res.json({ logs });
});

exports.addLog = asyncHandler(async (req, res) => {
  const { qrData, vehicleNumber, gateNumber, direction } = req.body; // direction: IN|OUT
  let resolvedVehicleNumber = vehicleNumber;

  if (qrData) {
    try {
      const parsed = JSON.parse(qrData);
      const { payload, signature } = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
      const ok = verifySignature(payload, signature, process.env.QR_SECRET || 'qr_secret');
      if (!ok) return res.status(400).json({ message: 'Invalid QR signature' });
      const p = JSON.parse(payload);
      resolvedVehicleNumber = p.vehicleNumber;
    } catch (e) {
      return res.status(400).json({ message: 'Invalid QR data' });
    }
  }

  if (!resolvedVehicleNumber) return res.status(400).json({ message: 'Vehicle number required' });
  if (!gateNumber) return res.status(400).json({ message: 'Gate number required' });
  if (!['IN', 'OUT'].includes(direction)) return res.status(400).json({ message: 'Invalid direction' });

  // Ensure vehicle exists (either personal or university vehicle number)
  const vehicleExists = await Vehicle.findOne({ vehicleNumber: resolvedVehicleNumber });
  // Could also check UniversityVehicle if needed

  const now = new Date();
  let log;
  if (direction === 'IN') {
    log = await Log.create({
      securityGuardId: req.user.id,
      vehicleNumber: resolvedVehicleNumber,
      timeIn: now,
      gateNumber
    });
  } else {
    // Find latest log without timeOut
    log = await Log.findOne({ vehicleNumber: resolvedVehicleNumber, timeOut: { $exists: false } }).sort({ createdAt: -1 });
    if (log) {
      log.timeOut = now;
      await log.save();
    } else {
      // If not found, create an OUT-only record for auditing
      log = await Log.create({
        securityGuardId: req.user.id,
        vehicleNumber: resolvedVehicleNumber,
        timeOut: now,
        gateNumber
      });
    }
  }

  res.status(201).json({ log });
});

exports.lookupVehicleByNumber = asyncHandler(async (req, res) => {
  const v = await Vehicle.findOne({ vehicleNumber: req.params.vehicleNumber }).populate('ownerUserId', 'firstName lastName email empNumber');
  if (!v) return res.status(404).json({ message: 'Vehicle not found' });
  res.json({ vehicle: v });
}); 