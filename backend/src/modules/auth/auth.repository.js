const supabase = require('../../config/database');

const findByEmail = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, password_hash, name, role, refresh_token')
    .eq('email', email)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

const findById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, role')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

const updateRefreshToken = async (userId, refreshToken) => {
  const { error } = await supabase
    .from('users')
    .update({ refresh_token: refreshToken })
    .eq('id', userId);
  if (error) throw error;
};

const findByRefreshToken = async (token) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, role')
    .eq('refresh_token', token)
    .single();
  if (error) throw error;
  return data;
};

const create = async (payload) => {
  const { data, error } = await supabase
    .from('users')
    .insert(payload)
    .select('id, email, name, role')
    .single();
  if (error) throw error;
  return data;
};

module.exports = { findByEmail, findById, updateRefreshToken, findByRefreshToken, create };
