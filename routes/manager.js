const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/managerController');

router.use(protect, authorize('MANAGER'));

// Users
router.post('/users', ctrl.createUser);
router.get('/users', ctrl.getUsers);
router.get('/users/:userId', ctrl.getUser);
router.put('/users/:userId', ctrl.updateUser);
router.delete('/users/:userId', ctrl.deleteUser);

// University Vehicles
router.post('/vehicles', ctrl.createUniVehicle);
router.get('/vehicles', ctrl.getUniVehicles);
router.get('/vehicles/:vehicleId', ctrl.getUniVehicle);
router.put('/vehicles/:vehicleId', ctrl.updateUniVehicle);
router.delete('/vehicles/:vehicleId', ctrl.deleteUniVehicle);

// Gates
router.post('/gates', ctrl.createGate);
router.get('/gates', ctrl.getGates);
router.get('/gates/:gateId', ctrl.getGate);
router.delete('/gates/:gateId', ctrl.deleteGate);

// Announcements
router.post('/announcements', ctrl.createAnnouncement);
router.get('/announcements', ctrl.getAnnouncements);
router.delete('/announcements/:id', ctrl.deleteAnnouncement);

// Logs
router.get('/logs', ctrl.getLogs);

// Security Guards
router.post('/security-guards', ctrl.createSecurityGuard);
router.get('/security-guards', ctrl.getSecurityGuards);
router.get('/security-guards/:guardId', ctrl.getSecurityGuard);
router.put('/security-guards/:guardId', ctrl.updateSecurityGuard);
router.delete('/security-guards/:guardId', ctrl.deleteSecurityGuard);

module.exports = router; 