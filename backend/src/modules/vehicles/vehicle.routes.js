const router = require('express').Router();
const vehicleController = require('./vehicle.controller');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const { ROLES } = require('../../shared/constants/roles');
const {
  createVehicleSchema,
  updateVehicleSchema,
  listQuerySchema,
  restockSchema,
} = require('./vehicle.validation');

router.use(authenticate);

router.get('/search', validate(listQuerySchema, 'query'), vehicleController.search);

router.get('/stats', vehicleController.stats);

router
  .route('/')
  .get(validate(listQuerySchema, 'query'), vehicleController.list)
  .post(authorize(ROLES.ADMIN), validate(createVehicleSchema), vehicleController.create);

router.post('/:id/purchase', vehicleController.purchase);
router.post('/:id/restock', authorize(ROLES.ADMIN), validate(restockSchema), vehicleController.restock);

router
  .route('/:id')
  .get(vehicleController.getById)
  .put(authorize(ROLES.ADMIN), validate(updateVehicleSchema), vehicleController.update)
  .delete(authorize(ROLES.ADMIN), vehicleController.remove);

module.exports = router;
