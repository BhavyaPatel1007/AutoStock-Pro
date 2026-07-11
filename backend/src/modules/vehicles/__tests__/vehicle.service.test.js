process.env.JWT_ACCESS_SECRET = 'test-access-secret-long-enough-for-jwt';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-long-enough-for-jwt';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'test-key';
process.env.SUPABASE_SECRET_KEY = 'test-key';
process.env.BCRYPT_SALT_ROUNDS = '4';
process.env.NODE_ENV = 'test';

jest.mock('../vehicle.repository');
jest.mock('../purchase.repository');

const vehicleRepo = require('../vehicle.repository');
const purchaseRepo = require('../purchase.repository');

const vehicleService = require('../vehicle.service');

describe('Vehicle Service', () => {
  const mockVehicle = {
    id: 'vehicle-1',
    make: 'Toyota',
    model: 'Camry',
    category: 'sedan',
    price: 25000,
    quantity: 5,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listVehicles', () => {
    it('returns paginated vehicles', async () => {
      vehicleRepo.findAll.mockResolvedValue({ data: [mockVehicle], count: 1 });

      const result = await vehicleService.listVehicles({ page: 1, limit: 10 });

      expect(result.vehicles).toHaveLength(1);
      expect(result.meta).toHaveProperty('totalPages');
      expect(result.meta.totalItems).toBe(1);
    });

    it('applies filters and sorting', async () => {
      vehicleRepo.findAll.mockResolvedValue({ data: [], count: 0 });

      await vehicleService.listVehicles({
        page: 1, limit: 10, make: 'Toyota', category: 'sedan',
        sortBy: 'price', sortOrder: 'asc',
      });

      expect(vehicleRepo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({ make: 'Toyota', category: 'sedan' }),
          sortBy: 'price', sortOrder: 'asc',
        })
      );
    });
  });

  describe('getVehicleById', () => {
    it('returns vehicle when found', async () => {
      vehicleRepo.findById.mockResolvedValue(mockVehicle);

      const result = await vehicleService.getVehicleById('vehicle-1');
      expect(result).toEqual(mockVehicle);
    });

    it('throws 404 when not found', async () => {
      vehicleRepo.findById.mockResolvedValue(null);

      await expect(vehicleService.getVehicleById('missing'))
        .rejects.toMatchObject({ statusCode: 404, code: 'VEHICLE_NOT_FOUND' });
    });
  });

  describe('createVehicle', () => {
    it('creates and returns vehicle', async () => {
      vehicleRepo.create.mockResolvedValue(mockVehicle);

      const result = await vehicleService.createVehicle({ make: 'Toyota', model: 'Camry', category: 'sedan', price: 25000 });
      expect(result).toEqual(mockVehicle);
    });
  });

  describe('updateVehicle', () => {
    it('updates and returns vehicle', async () => {
      vehicleRepo.findById.mockResolvedValue(mockVehicle);
      vehicleRepo.update.mockResolvedValue({ ...mockVehicle, price: 30000 });

      const result = await vehicleService.updateVehicle('vehicle-1', { price: 30000 });
      expect(result.price).toBe(30000);
    });

    it('throws 404 when vehicle not found', async () => {
      vehicleRepo.findById.mockResolvedValue(null);

      await expect(vehicleService.updateVehicle('missing', { price: 100 }))
        .rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('deleteVehicle', () => {
    it('deletes existing vehicle', async () => {
      vehicleRepo.findById.mockResolvedValue(mockVehicle);
      vehicleRepo.remove.mockResolvedValue();

      await vehicleService.deleteVehicle('vehicle-1');
      expect(vehicleRepo.remove).toHaveBeenCalledWith('vehicle-1');
    });

    it('throws 404 when not found', async () => {
      vehicleRepo.findById.mockResolvedValue(null);

      await expect(vehicleService.deleteVehicle('missing'))
        .rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('purchaseVehicle', () => {
    it('decrements quantity and records purchase', async () => {
      vehicleRepo.findById.mockResolvedValue(mockVehicle);
      vehicleRepo.update.mockResolvedValue({ ...mockVehicle, quantity: 4 });
      purchaseRepo.create.mockResolvedValue({});

      const result = await vehicleService.purchaseVehicle('vehicle-1', 'user-1');

      expect(result.quantity).toBe(4);
      expect(vehicleRepo.update).toHaveBeenCalledWith('vehicle-1', { quantity: 4 });
      expect(purchaseRepo.create).toHaveBeenCalledWith({
        vehicle_id: 'vehicle-1',
        user_id: 'user-1',
        type: 'purchase',
        quantity: 1,
        unit_price: 25000,
        total_amount: 25000,
      });
    });

    it('throws OUT_OF_STOCK when quantity is 0', async () => {
      vehicleRepo.findById.mockResolvedValue({ ...mockVehicle, quantity: 0 });

      await expect(vehicleService.purchaseVehicle('vehicle-1', 'user-1'))
        .rejects.toMatchObject({ statusCode: 400, code: 'OUT_OF_STOCK' });
    });

    it('throws 404 when vehicle not found', async () => {
      vehicleRepo.findById.mockResolvedValue(null);

      await expect(vehicleService.purchaseVehicle('missing', 'user-1'))
        .rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('restockVehicle', () => {
    it('increments quantity and records restock', async () => {
      vehicleRepo.findById.mockResolvedValue(mockVehicle);
      vehicleRepo.update.mockResolvedValue({ ...mockVehicle, quantity: 15 });
      purchaseRepo.create.mockResolvedValue({});

      const result = await vehicleService.restockVehicle('vehicle-1', 10, 'user-1');

      expect(result.quantity).toBe(15);
      expect(vehicleRepo.update).toHaveBeenCalledWith('vehicle-1', { quantity: 15 });
      expect(purchaseRepo.create).toHaveBeenCalledWith({
        vehicle_id: 'vehicle-1',
        user_id: 'user-1',
        type: 'restock',
        quantity: 10,
        unit_price: 25000,
        total_amount: 250000,
      });
    });

    it('throws INVALID_QUANTITY for non-positive quantity', async () => {
      vehicleRepo.findById.mockResolvedValue(mockVehicle);

      await expect(vehicleService.restockVehicle('vehicle-1', 0, 'user-1'))
        .rejects.toMatchObject({ statusCode: 400, code: 'INVALID_QUANTITY' });
      await expect(vehicleService.restockVehicle('vehicle-1', -5, 'user-1'))
        .rejects.toMatchObject({ statusCode: 400, code: 'INVALID_QUANTITY' });
    });

    it('throws 404 when vehicle not found', async () => {
      vehicleRepo.findById.mockResolvedValue(null);

      await expect(vehicleService.restockVehicle('missing', 5, 'user-1'))
        .rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('getStats', () => {
    it('returns correct stats from vehicles', async () => {
      vehicleRepo.findAll.mockResolvedValue({
        data: [
          { ...mockVehicle, price: 20000, quantity: 5 },
          { price: 30000, quantity: 0 },
          { price: 15000, quantity: 1 },
        ],
        count: 3,
      });

      const stats = await vehicleService.getStats();

      expect(stats.total).toBe(3);
      expect(stats.totalValue).toBe(20000 * 5 + 30000 * 0 + 15000 * 1);
      expect(stats.lowStock).toBe(2);
      expect(stats.outOfStock).toBe(1);
      expect(stats.avgPrice).toBeCloseTo(21666.67, 0);
    });

    it('returns zeros when no vehicles', async () => {
      vehicleRepo.findAll.mockResolvedValue({ data: [], count: 0 });

      const stats = await vehicleService.getStats();

      expect(stats.total).toBe(0);
      expect(stats.totalValue).toBe(0);
      expect(stats.lowStock).toBe(0);
      expect(stats.avgPrice).toBe(0);
    });
  });
});
