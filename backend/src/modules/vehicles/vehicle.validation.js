const Joi = require('joi');

const CATEGORIES = ['sedan', 'suv', 'truck', 'coupe', 'convertible', 'hatchback', 'van', 'wagon', 'electric', 'hybrid'];
const SORT_FIELDS = ['make', 'model', 'category', 'price', 'quantity', 'created_at', 'updated_at'];

const createVehicleSchema = Joi.object({
  make: Joi.string().min(1).max(100).required(),
  model: Joi.string().min(1).max(100).required(),
  category: Joi.string()
    .valid(...CATEGORIES)
    .required(),
  price: Joi.number().positive().precision(2).required(),
  quantity: Joi.number().integer().min(0).default(1),
}).options({ stripUnknown: true });

const updateVehicleSchema = Joi.object({
  make: Joi.string().min(1).max(100),
  model: Joi.string().min(1).max(100),
  category: Joi.string().valid(...CATEGORIES),
  price: Joi.number().positive().precision(2),
  quantity: Joi.number().integer().min(0),
}).min(1).options({ stripUnknown: true });

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  make: Joi.string(),
  model: Joi.string(),
  category: Joi.string().valid(...CATEGORIES),
  minPrice: Joi.number().positive(),
  maxPrice: Joi.number().positive(),
  search: Joi.string(),
  q: Joi.string(),
  sortBy: Joi.string().valid(...SORT_FIELDS),
  sortOrder: Joi.string().valid('asc', 'desc'),
}).options({ stripUnknown: true });

const restockSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
}).options({ stripUnknown: true });

module.exports = {
  createVehicleSchema,
  updateVehicleSchema,
  listQuerySchema,
  restockSchema,
};
