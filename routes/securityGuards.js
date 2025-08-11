const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/securityGuardController');

router.use(protect, authorize('SECURITY_GUARD'));

router.get('/profile', ctrl.getProfile);
router.get('/gates', ctrl.getAssignedGates);
router.get('/announcements', ctrl.getAnnouncements);

router.get('/logs', ctrl.getLogs);
router.get('/logs/:guardId', ctrl.getLogsByGuard);
router.post('/logs', ctrl.addLog);

router.get('/vehicles/:vehicleNumber', ctrl.lookupVehicleByNumber);

module.exports = router; 