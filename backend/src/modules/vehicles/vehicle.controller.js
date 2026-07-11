const vehicleService = require('./vehicle.service');
const asyncHandler = require('../../shared/utils/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const { HTTP_STATUS } = require('../../shared/constants/statusCodes');

const list = asyncHandler(async (req, res) => {
  const { vehicles, meta } = await vehicleService.listVehicles(req.query);
  sendSuccess(res, { data: vehicles, meta });
});

const search = asyncHandler(async (req, res) => {
  const { vehicles, meta } = await vehicleService.listVehicles(req.query);
  sendSuccess(res, { data: vehicles, meta });
});

const getById = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.getVehicleById(req.params.id);
  sendSuccess(res, { data: vehicle });
});

const create = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.createVehicle(req.body);
  sendSuccess(res, { statusCode: HTTP_STATUS.CREATED, data: vehicle, message: 'Vehicle created' });
});

const update = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
  sendSuccess(res, { data: vehicle, message: 'Vehicle updated' });
});

const remove = asyncHandler(async (req, res) => {
  await vehicleService.deleteVehicle(req.params.id);
  sendSuccess(res, { statusCode: HTTP_STATUS.NO_CONTENT });
});

const purchase = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.purchaseVehicle(req.params.id, req.user.id);
  sendSuccess(res, { data: vehicle, message: 'Vehicle purchased' });
});

const restock = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.restockVehicle(req.params.id, req.body.quantity, req.user.id);
  sendSuccess(res, { data: vehicle, message: 'Vehicle restocked' });
});

const stats = asyncHandler(async (req, res) => {
  const data = await vehicleService.getStats();
  sendSuccess(res, { data });
});

module.exports = { list, search, getById, create, update, remove, purchase, restock, stats };
