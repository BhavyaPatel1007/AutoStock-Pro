const supabase = require('../../config/database');

const TABLE = 'vehicles';
const SELECT = 'id, make, model, category, price, quantity, created_at, updated_at';

const _buildQuery = (filters, sortBy, sortOrder) => {
  const q = supabase.from(TABLE).select(SELECT, { count: 'exact' });

  if (filters.make) q.eq('make', filters.make);
  if (filters.model) q.ilike('model', `%${filters.model}%`);
  if (filters.category) q.eq('category', filters.category);
  if (filters.minPrice) q.gte('price', filters.minPrice);
  if (filters.maxPrice) q.lte('price', filters.maxPrice);
  if (filters.q) {
    q.or(`make.ilike.*${filters.q}*,model.ilike.*${filters.q}*,category.ilike.*${filters.q}*`);
  }
  if (filters.search) {
    q.or(`make.ilike.*${filters.search}*,model.ilike.*${filters.search}*,category.ilike.*${filters.search}*`);
  }

  const sortColumn = sortBy || 'created_at';
  const ascending = (sortOrder || 'desc') === 'asc';
  q.order(sortColumn, { ascending });

  return q;
};

const findAll = async ({ offset, limit, filters = {}, sortBy, sortOrder }) => {
  let q = _buildQuery(filters, sortBy, sortOrder);
  q = q.range(offset, offset + limit - 1);

  const { data, error, count } = await q;
  if (error) throw error;
  return { data, count };
};

const findById = async (id) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

const create = async (payload) => {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select(SELECT)
    .single();
  if (error) throw error;
  return data;
};

const update = async (id, payload) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select(SELECT)
    .single();
  if (error) throw error;
  return data;
};

const remove = async (id) => {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
};

module.exports = { findAll, findById, create, update, remove };
