const Joi = require('joi');
const { ROLES } = require('../../shared/constants/roles');

const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  name: Joi.string().min(1).max(255).required(),
  role: Joi.string()
    .valid(...Object.values(ROLES))
    .default(ROLES.USER),
});

const updateUserSchema = Joi.object({
  email: Joi.string().email(),
  name: Joi.string().min(1).max(255),
  role: Joi.string().valid(...Object.values(ROLES)),
}).min(1);

module.exports = { createUserSchema, updateUserSchema };
