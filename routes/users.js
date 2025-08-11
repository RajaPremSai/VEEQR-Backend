const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/userController');

router.post('/register', ctrl.register);
router.get('/profile', protect, authorize('USER', 'ADMIN', 'MANAGER'), ctrl.getProfile);
router.get('/profile/email/:email', protect, authorize('MANAGER', 'ADMIN'), ctrl.getProfileByEmail);

router.post('/vehicles', protect, authorize('USER'), ctrl.addVehicle);
router.get('/vehicles', protect, authorize('USER'), ctrl.getMyVehicles);
router.put('/vehicles/:vehicleId', protect, authorize('USER'), ctrl.updateMyVehicle);
router.delete('/vehicles/:vehicleId', protect, authorize('USER'), ctrl.deleteMyVehicle);

router.get('/logs', protect, authorize('USER'), ctrl.getMyLogs);
router.get('/announcements', protect, authorize('USER', 'SECURITY_GUARD', 'MANAGER', 'ADMIN'), ctrl.getAnnouncements);

module.exports = router; 