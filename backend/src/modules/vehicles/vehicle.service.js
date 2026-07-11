const vehicleRepo = require('./vehicle.repository');
const purchaseRepo = require('./purchase.repository');
const AppError = require('../../shared/errors/AppError');
const { HTTP_STATUS } = require('../../shared/constants/statusCodes');
const { getPagination, getMeta } = require('../../shared/utils/pagination');

const listVehicles = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const filters = (({ make, model, category, minPrice, maxPrice, search, q }) => ({
    make, model, category, minPrice, maxPrice, search, q,
  }))(query);

  const sortBy = query.sortBy;
  const sortOrder = query.sortOrder;

  const { data, count } = await vehicleRepo.findAll({ offset, limit, filters, sortBy, sortOrder });
  return { vehicles: data, meta: getMeta(count, page, limit) };
};

const getVehicleById = async (id) => {
  const vehicle = await vehicleRepo.findById(id);
  if (!vehicle) throw new AppError('Vehicle not found', HTTP_STATUS.NOT_FOUND, 'VEHICLE_NOT_FOUND');
  return vehicle;
};

const createVehicle = async (payload) => {
  return vehicleRepo.create(payload);
};

const updateVehicle = async (id, payload) => {
  await getVehicleById(id);
  return vehicleRepo.update(id, payload);
};

const deleteVehicle = async (id) => {
  await getVehicleById(id);
  await vehicleRepo.remove(id);
};

const purchaseVehicle = async (id, userId) => {
  const vehicle = await getVehicleById(id);
  if (vehicle.quantity <= 0) {
    throw new AppError('Vehicle out of stock', HTTP_STATUS.BAD_REQUEST, 'OUT_OF_STOCK');
  }
  const updated = await vehicleRepo.update(id, { quantity: vehicle.quantity - 1 });
  await purchaseRepo.create({
    vehicle_id: id,
    user_id: userId,
    type: 'purchase',
    quantity: 1,
    unit_price: vehicle.price,
    total_amount: vehicle.price,
  });
  return updated;
};

const restockVehicle = async (id, quantity, userId) => {
  const vehicle = await getVehicleById(id);
  if (quantity <= 0) {
    throw new AppError('Quantity must be positive', HTTP_STATUS.BAD_REQUEST, 'INVALID_QUANTITY');
  }
  const updated = await vehicleRepo.update(id, { quantity: vehicle.quantity + quantity });
  await purchaseRepo.create({
    vehicle_id: id,
    user_id: userId,
    type: 'restock',
    quantity,
    unit_price: vehicle.price,
    total_amount: vehicle.price * quantity,
  });
  return updated;
};

const getStats = async () => {
  const { data, count } = await vehicleRepo.findAll({ offset: 0, limit: 1000, filters: {} });
  const total = count || 0;
  const lowStock = data.filter((v) => v.quantity <= 2).length;
  const totalValue = data.reduce((sum, v) => sum + v.price * v.quantity, 0);
  const totalVehicles = data.length;
  const avgPrice = totalVehicles > 0
    ? data.reduce((sum, v) => sum + Number(v.price), 0) / totalVehicles
    : 0;
  const outOfStock = data.filter((v) => v.quantity === 0).length;
  return { total, lowStock, outOfStock, totalValue, avgPrice };
};

module.exports = {
  listVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle,
  purchaseVehicle, restockVehicle, getStats,
};
