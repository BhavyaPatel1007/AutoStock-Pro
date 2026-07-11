const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
}).options({ stripUnknown: true });

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
}).options({ stripUnknown: true });

const registerSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
}).options({ stripUnknown: true });

module.exports = { loginSchema, refreshSchema, registerSchema };
