let mockResult = { data: null, error: null, count: null };

const chain = {
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  single: jest.fn().mockImplementation(() =>
    Promise.resolve({ data: mockResult.data, error: mockResult.error })
  ),
  maybeSingle: jest.fn().mockImplementation(() =>
    Promise.resolve({ data: mockResult.data, error: mockResult.error })
  ),
};

// Makes the chain thenable for cases where it's awaited directly (e.g. findAll)
chain.then = (resolve) => resolve(mockResult);

const mockSupabase = {
  from: jest.fn(() => chain),
};

module.exports = mockSupabase;
module.exports.__setMockResult = (result) => { mockResult = result; };
module.exports.__resetMocks = () => {
  mockResult = { data: null, error: null, count: null };
  Object.values(chain).forEach((fn) => {
    if (jest.isMockFunction(fn)) fn.mockClear();
  });
  mockSupabase.from.mockClear();
};
