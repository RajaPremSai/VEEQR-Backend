const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const UniversityVehicle = require('../models/UniversityVehicle');
const Gate = require('../models/Gate');
const Announcement = require('../models/Announcement');
const Log = require('../models/Log');
const Vehicle = require('../models/Vehicle');
const { exportLogsCsv, exportLogsPdf } = require('../utils/export');
const SecurityGuard = require('../models/SecurityGuard');

// Users
exports.createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ user: { ...user.toObject(), password: undefined } });
});
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ users });
});
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
});
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
});
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ success: true });
});

// University Vehicles
exports.createUniVehicle = asyncHandler(async (req, res) => {
  const doc = await UniversityVehicle.create(req.body);
  res.status(201).json({ vehicle: doc });
});
exports.getUniVehicles = asyncHandler(async (req, res) => {
  const docs = await UniversityVehicle.find().sort({ createdAt: -1 });
  res.json({ vehicles: docs });
});
exports.getUniVehicle = asyncHandler(async (req, res) => {
  const doc = await UniversityVehicle.findById(req.params.vehicleId);
  if (!doc) return res.status(404).json({ message: 'Vehicle not found' });
  res.json({ vehicle: doc });
});
exports.updateUniVehicle = asyncHandler(async (req, res) => {
  const doc = await UniversityVehicle.findByIdAndUpdate(req.params.vehicleId, req.body, { new: true });
  if (!doc) return res.status(404).json({ message: 'Vehicle not found' });
  res.json({ vehicle: doc });
});
exports.deleteUniVehicle = asyncHandler(async (req, res) => {
  const doc = await UniversityVehicle.findByIdAndDelete(req.params.vehicleId);
  if (!doc) return res.status(404).json({ message: 'Vehicle not found' });
  res.json({ success: true });
});

// Gates
exports.createGate = asyncHandler(async (req, res) => {
  const gate = await Gate.create(req.body);
  res.status(201).json({ gate });
});
exports.getGates = asyncHandler(async (req, res) => {
  const gates = await Gate.find().sort({ gateNumber: 1 });
  res.json({ gates });
});
exports.getGate = asyncHandler(async (req, res) => {
  const gate = await Gate.findById(req.params.gateId);
  if (!gate) return res.status(404).json({ message: 'Gate not found' });
  res.json({ gate });
});
exports.deleteGate = asyncHandler(async (req, res) => {
  const gate = await Gate.findByIdAndDelete(req.params.gateId);
  if (!gate) return res.status(404).json({ message: 'Gate not found' });
  res.json({ success: true });
});

// Announcements
exports.createAnnouncement = asyncHandler(async (req, res) => {
  const ann = await Announcement.create(req.body);
  res.status(201).json({ announcement: ann });
});
exports.getAnnouncements = asyncHandler(async (req, res) => {
  const anns = await Announcement.find().sort({ createdAt: -1 });
  res.json({ announcements: anns });
});
exports.deleteAnnouncement = asyncHandler(async (req, res) => {
  const ann = await Announcement.findByIdAndDelete(req.params.id);
  if (!ann) return res.status(404).json({ message: 'Announcement not found' });
  res.json({ success: true });
});

// Logs and export
exports.getLogs = asyncHandler(async (req, res) => {
  const { vehicleNumber, ownerName, date, gate, export: exportType } = req.query;
  const filter = {};
  if (vehicleNumber) filter.vehicleNumber = vehicleNumber;
  if (gate) filter.gateNumber = gate;
  if (date) {
    const d = new Date(date);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    filter.createdAt = { $gte: d, $lt: next };
  }

  // Owner name filter -> resolve vehicleNumbers first
  if (ownerName) {
    const nameRegex = new RegExp(ownerName, 'i');
    const matchedUsers = await User.find({
      $or: [
        { firstName: nameRegex },
        { middleName: nameRegex },
        { lastName: nameRegex },
      ]
    }).select('_id');
    const matchedUserIds = matchedUsers.map(u => u._id);

    const matchedVehicles = await Vehicle.find({
      $or: [
        { vehicleOwner: nameRegex },
        { ownerUserId: { $in: matchedUserIds } }
      ]
    }).select('vehicleNumber');

    const numbers = matchedVehicles.map(v => v.vehicleNumber);
    if (numbers.length === 0) {
      return res.json({ logs: [] });
    }
    filter.vehicleNumber = filter.vehicleNumber
      ? filter.vehicleNumber
      : { $in: numbers };
  }

  const logs = await Log.find(filter).sort({ createdAt: -1 }).lean();

  if (exportType === 'csv') {
    const csv = exportLogsCsv(logs);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="logs.csv"');
    return res.send(csv);
  }
  if (exportType === 'pdf') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="logs.pdf"');
    return require('../utils/export').exportLogsPdf(logs, res);
  }

  res.json({ logs });
});

// ============ Security Guards Management ============
exports.createSecurityGuard = asyncHandler(async (req, res) => {
  const { firstName, middleName, lastName, empNumber, email, password, contactNumber, securityGuardId, assignedGates } = req.body;
  const guard = await SecurityGuard.create({
    firstName,
    middleName,
    lastName,
    empNumber,
    email,
    password,
    contactNumber,
    securityGuardId,
    assignedGates: assignedGates || []
  });
  res.status(201).json({ guard: { ...guard.toObject(), password: undefined } });
});

exports.getSecurityGuards = asyncHandler(async (req, res) => {
  const guards = await SecurityGuard.find().populate('assignedGates').sort({ createdAt: -1 });
  res.json({ guards });
});

exports.getSecurityGuard = asyncHandler(async (req, res) => {
  const guard = await SecurityGuard.findById(req.params.guardId).populate('assignedGates');
  if (!guard) return res.status(404).json({ message: 'Security guard not found' });
  res.json({ guard });
});

exports.updateSecurityGuard = asyncHandler(async (req, res) => {
  const { guardId } = req.params;
  const updates = req.body;
  const guard = await SecurityGuard.findById(guardId).select('+password');
  if (!guard) return res.status(404).json({ message: 'Security guard not found' });

  // Assign updatable fields
  const fields = ['firstName', 'middleName', 'lastName', 'empNumber', 'email', 'contactNumber', 'securityGuardId', 'assignedGates'];
  fields.forEach((f) => {
    if (updates[f] !== undefined) guard[f] = updates[f];
  });

  // Handle password change to trigger hashing
  if (updates.password) {
    guard.password = updates.password;
  }

  await guard.save();
  const sanitized = guard.toObject();
  delete sanitized.password;
  res.json({ guard: sanitized });
});

exports.deleteSecurityGuard = asyncHandler(async (req, res) => {
  const guard = await SecurityGuard.findByIdAndDelete(req.params.guardId);
  if (!guard) return res.status(404).json({ message: 'Security guard not found' });
  res.json({ success: true });
}); 