const router = require('express').Router();
const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/users/user.routes');
const vehicleRoutes = require('../modules/vehicles/vehicle.routes');
const { sendSuccess } = require('../shared/utils/response');

router.get('/health', (req, res) => {
  sendSuccess(res, { message: 'AutoStock-Pro API is running' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vehicles', vehicleRoutes);

module.exports = router;
