const {
  createVehicleSchema,
  updateVehicleSchema,
  listQuerySchema,
  restockSchema,
} = require('../vehicle.validation');

describe('Vehicle Validation Schemas', () => {
  describe('createVehicleSchema', () => {
    const valid = { make: 'Toyota', model: 'Camry', category: 'sedan', price: 25000, quantity: 5 };

    it('accepts valid payload', () => {
      const { error } = createVehicleSchema.validate(valid);
      expect(error).toBeUndefined();
    });

    it('rejects missing make', () => {
      const { error } = createVehicleSchema.validate({ ...valid, make: undefined });
      expect(error).toBeDefined();
    });

    it('rejects invalid category', () => {
      const { error } = createVehicleSchema.validate({ ...valid, category: 'invalid' });
      expect(error).toBeDefined();
    });

    it('rejects negative price', () => {
      const { error } = createVehicleSchema.validate({ ...valid, price: -1 });
      expect(error).toBeDefined();
    });

    it('rejects negative quantity', () => {
      const { error } = createVehicleSchema.validate({ ...valid, quantity: -1 });
      expect(error).toBeDefined();
    });

    it('defaults quantity to 1 when omitted', () => {
      const { value, error } = createVehicleSchema.validate({ make: 'Test', model: 'Test', category: 'sedan', price: 100 });
      expect(error).toBeUndefined();
      expect(value.quantity).toBe(1);
    });

    it('strips unknown fields', () => {
      const { value } = createVehicleSchema.validate({ ...valid, extra: 'x' });
      expect(value.extra).toBeUndefined();
    });
  });

  describe('updateVehicleSchema', () => {
    it('accepts partial update with just price', () => {
      const { error } = updateVehicleSchema.validate({ price: 30000 });
      expect(error).toBeUndefined();
    });

    it('rejects empty body', () => {
      const { error } = updateVehicleSchema.validate({});
      expect(error).toBeDefined();
    });

    it('rejects invalid category', () => {
      const { error } = updateVehicleSchema.validate({ category: 'invalid' });
      expect(error).toBeDefined();
    });

    it('strips unknown fields', () => {
      const { value } = updateVehicleSchema.validate({ make: 'Toyota', unknown: 'x' });
      expect(value.unknown).toBeUndefined();
    });
  });

  describe('listQuerySchema', () => {
    it('accepts valid query params', () => {
      const { error } = listQuerySchema.validate({ page: 1, limit: 10, category: 'suv', sortBy: 'price', sortOrder: 'asc' });
      expect(error).toBeUndefined();
    });

    it('rejects invalid sortBy field', () => {
      const { error } = listQuerySchema.validate({ sortBy: 'invalid' });
      expect(error).toBeDefined();
    });

    it('rejects invalid sortOrder', () => {
      const { error } = listQuerySchema.validate({ sortOrder: 'invalid' });
      expect(error).toBeDefined();
    });

    it('rejects page less than 1', () => {
      const { error } = listQuerySchema.validate({ page: 0 });
      expect(error).toBeDefined();
    });

    it('rejects limit greater than 100', () => {
      const { error } = listQuerySchema.validate({ limit: 101 });
      expect(error).toBeDefined();
    });

    it('strips unknown fields', () => {
      const { value } = listQuerySchema.validate({ page: 1, extra: 'x' });
      expect(value.extra).toBeUndefined();
    });
  });

  describe('restockSchema', () => {
    it('accepts valid quantity', () => {
      const { error } = restockSchema.validate({ quantity: 10 });
      expect(error).toBeUndefined();
    });

    it('rejects quantity of 0', () => {
      const { error } = restockSchema.validate({ quantity: 0 });
      expect(error).toBeDefined();
    });

    it('rejects negative quantity', () => {
      const { error } = restockSchema.validate({ quantity: -5 });
      expect(error).toBeDefined();
    });

    it('rejects non-integer quantity', () => {
      const { error } = restockSchema.validate({ quantity: 1.5 });
      expect(error).toBeDefined();
    });

    it('rejects missing quantity', () => {
      const { error } = restockSchema.validate({});
      expect(error).toBeDefined();
    });

    it('strips unknown fields', () => {
      const { value } = restockSchema.validate({ quantity: 5, extra: 'x' });
      expect(value.extra).toBeUndefined();
    });
  });
});
