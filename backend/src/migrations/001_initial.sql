-- 001_initial.sql
-- Create enums, tables, indexes, triggers, and RLS policies

-- ── Category enum ──────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE vehicle_category AS ENUM (
    'sedan', 'suv', 'truck', 'coupe', 'convertible',
    'hatchback', 'van', 'wagon', 'electric', 'hybrid'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Users table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  refresh_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- ── Vehicles table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  category vehicle_category NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_category ON vehicles (category);
CREATE INDEX IF NOT EXISTS idx_vehicles_make_model ON vehicles (make, model);
CREATE INDEX IF NOT EXISTS idx_vehicles_price ON vehicles (price);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON vehicles (created_at);

-- ── Updated-at trigger ─────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Row Level Security ─────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies: users ────────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can read own data" ON users;
  CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (id = auth.uid());
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can read all users" ON users;
  CREATE POLICY "Admins can read all users" ON users
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can insert users" ON users;
  CREATE POLICY "Admins can insert users" ON users
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own data" ON users;
  CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (id = auth.uid());
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can delete users" ON users;
  CREATE POLICY "Admins can delete users" ON users
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- ── RLS Policies: vehicles ─────────────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can view vehicles" ON vehicles;
  CREATE POLICY "Authenticated users can view vehicles" ON vehicles
    FOR SELECT USING (auth.role() = 'authenticated');
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can insert vehicles" ON vehicles;
  CREATE POLICY "Admins can insert vehicles" ON vehicles
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can update vehicles" ON vehicles;
  CREATE POLICY "Admins can update vehicles" ON vehicles
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can delete vehicles" ON vehicles;
  CREATE POLICY "Admins can delete vehicles" ON vehicles
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- ── Purchase policy: any authenticated user can purchase ──
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can purchase vehicles" ON vehicles;
  CREATE POLICY "Users can purchase vehicles" ON vehicles
    FOR UPDATE USING (auth.role() = 'authenticated')
    WITH CHECK (
      auth.role() = 'authenticated'
      AND quantity >= 0
    );
EXCEPTION WHEN undefined_object THEN NULL;
END $$;
