const router = require('express').Router();
const userController = require('./user.controller');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const { ROLES } = require('../../shared/constants/roles');
const { createUserSchema, updateUserSchema } = require('./user.validation');

router.use(authenticate);

router
  .route('/')
  .get(authorize(ROLES.ADMIN), userController.list)
  .post(authorize(ROLES.ADMIN), validate(createUserSchema), userController.create);

router
  .route('/:id')
  .get(authorize(ROLES.ADMIN), userController.getById)
  .patch(authorize(ROLES.ADMIN), validate(updateUserSchema), userController.update)
  .delete(authorize(ROLES.ADMIN), userController.remove);

module.exports = router;
