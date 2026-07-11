# AutoStock-Pro

Car Dealership Inventory Management System — a full-stack web application built with Node.js/Express, Supabase PostgreSQL, and React.

## Features

- **Authentication** — Register, Login, JWT access/refresh tokens, logout
- **Vehicle Management** — Browse, search, and filter vehicles by make, model, category, and price range
- **Purchase** — One-click purchase that decrements quantity and records the transaction
- **Restock** — Admin-only restock to add inventory
- **Admin Controls** — Add, edit, and delete vehicles (visible to admin users only)
- **Responsive UI** — Mobile-friendly design with TailwindCSS

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express 4 |
| Database | Supabase PostgreSQL |
| ORM/Client | Supabase JS SDK (service-role, bypasses RLS) |
| Auth | JWT (access + refresh tokens), bcrypt |
| Validation | Joi |
| Testing | Jest + Supertest |
| Frontend | React 18, Vite, TailwindCSS 3, React Router 6 |
| HTTP Client | Axios |

## Project Structure

```
autostock-pro/
├── backend/
│   ├── src/
│   │   ├── config/          # DB client, env vars
│   │   ├── middleware/       # authenticate, authorize, validate, errorHandler
│   │   ├── migrations/       # SQL migration files
│   │   ├── modules/
│   │   │   ├── auth/         # Auth routes, controller, service, repository
│   │   │   └── vehicles/     # Vehicle + purchase routes, controller, service, repos
│   │   ├── routes/           # API v1 route aggregator
│   │   └── shared/           # AppError, constants, utils
│   ├── scripts/              # migrate.js, seed.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios instance with interceptors
│   │   ├── components/       # Layout, Sidebar, UI primitives
│   │   ├── context/          # AuthContext (React Context)
│   │   └── pages/            # Login, Register, Dashboard, Search, VehicleForm
│   └── index.html
└── README.md
```

## Installation

### Prerequisites

- Node.js 18+
- npm
- A Supabase project (free tier works)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run migrate    # Apply database migrations
npm run seed       # Seed sample data
npm run dev        # Start dev server (port 3000)
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev        # Start dev server (port 5173)
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | Environment (development/production) |
| `PORT` | Server port (default: 3000) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SECRET_KEY` | Supabase service_role key |
| `JWT_ACCESS_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiry (default: 15m) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry (default: 7d) |
| `CORS_ORIGIN` | Allowed CORS origin (default: http://localhost:5173) |
| `BCRYPT_SALT_ROUNDS` | bcrypt salt rounds (default: 12) |
| `SUPABASE_DB_PASSWORD` | DB password for direct SQL migrations |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (default: http://localhost:3000/api/v1) |

## Running the Application

1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `cd frontend && npm run dev`
3. Open http://localhost:5173 in your browser

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@autostock.com | Admin123! |
| User | user@autostock.com | User1234! |

## API Documentation

All endpoints are prefixed with `/api/v1`. All routes except auth require a Bearer token in the `Authorization` header.

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register a new user | No |
| POST | `/auth/login` | Login and get tokens | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/logout` | Logout and revoke refresh token | Yes |

### Vehicles

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/vehicles` | List vehicles (paginated, with search/filter) | Yes |
| GET | `/vehicles/search` | Search vehicles (alias) | Yes |
| GET | `/vehicles/:id` | Get vehicle by ID | Yes |
| POST | `/vehicles` | Create vehicle (admin only) | Yes |
| PUT | `/vehicles/:id` | Update vehicle (admin only) | Yes |
| DELETE | `/vehicles/:id` | Delete vehicle (admin only) | Yes |
| POST | `/vehicles/:id/purchase` | Purchase vehicle | Yes |
| POST | `/vehicles/:id/restock` | Restock vehicle (admin only) | Yes |

### Query Parameters for GET /vehicles

| Param | Type | Description |
|-------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Items per page (max: 100, default: 20) |
| `q` | string | Search across make, model, category |
| `make` | string | Filter by exact make |
| `model` | string | Filter by model (ILIKE) |
| `category` | string | Filter by category |
| `minPrice` | number | Minimum price |
| `maxPrice` | number | Maximum price |
| `sortBy` | string | Sort field (make, model, category, price, quantity, created_at) |
| `sortOrder` | string | asc or desc (default: desc) |

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "totalItems": 50, "totalPages": 3 }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## Test Report

**121 tests passing** across 6 test suites:

| Test Suite | Tests | Status |
|-----------|-------|--------|
| Auth Validation | 18 | ✅ All passing |
| Auth Service | 16 | ✅ All passing |
| Auth Routes | 24 | ✅ All passing |
| Vehicle Validation | 18 | ✅ All passing |
| Vehicle Service | 21 | ✅ All passing |
| Vehicle Routes | 24 | ✅ All passing |

Run tests: `cd backend && npm test`

## Screenshots

<!-- Add screenshots here -->

## My AI Usage

This project was developed with assistance from AI tools (opencode / Claude) for code generation, debugging, and optimization. All code was reviewed and tested to meet the assignment requirements.

## Deployment

### Backend

1. Set `NODE_ENV=production` in `.env`
2. Ensure all environment variables are configured
3. Run `npm start` (uses node directly, not nodemon)

### Frontend

1. Run `npm run build` to generate production build in `dist/`
2. Deploy the `dist/` folder to any static host (Vercel, Netlify, etc.)
3. Configure the production API URL via `VITE_API_URL`
