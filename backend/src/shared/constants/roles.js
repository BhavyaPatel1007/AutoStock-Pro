const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

const ROLES_HIERARCHY = {
  [ROLES.ADMIN]: 100,
  [ROLES.USER]: 10,
};

module.exports = { ROLES, ROLES_HIERARCHY };
