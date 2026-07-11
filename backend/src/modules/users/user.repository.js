const supabase = require('../../config/database');

const TABLE = 'users';
const SELECT_PUBLIC = 'id, name, email, role, created_at, updated_at';

const count = async () => {
  const { count, error } = await supabase.from(TABLE).select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count;
};

const findAll = async ({ offset, limit }) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT_PUBLIC)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data;
};

const findById = async (id) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT_PUBLIC)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

const findByEmail = async (email) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (error) throw error;
  return data;
};

const create = async (payload) => {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select(SELECT_PUBLIC)
    .single();
  if (error) throw error;
  return data;
};

const update = async (id, payload) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select(SELECT_PUBLIC)
    .single();
  if (error) throw error;
  return data;
};

const remove = async (id) => {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
};

module.exports = { count, findAll, findById, findByEmail, create, update, remove };
