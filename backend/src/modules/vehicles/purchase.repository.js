const supabase = require('../../config/database');

const TABLE = 'purchases';
const SELECT = 'id, vehicle_id, user_id, type, quantity, unit_price, total_amount, created_at';

const create = async (payload) => {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select(SELECT)
    .single();
  if (error) throw error;
  return data;
};

const findByVehicleId = async (vehicleId, { offset, limit }) => {
  const { data, error, count } = await supabase
    .from(TABLE)
    .select(SELECT, { count: 'exact' })
    .eq('vehicle_id', vehicleId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return { data, count };
};

module.exports = { create, findByVehicleId };
