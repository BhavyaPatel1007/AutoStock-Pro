const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const getMeta = (count, page, limit) => ({
  page,
  limit,
  totalItems: count,
  totalPages: Math.ceil(count / limit),
  hasNextPage: page * limit < count,
  hasPrevPage: page > 1,
});

module.exports = { getPagination, getMeta };
