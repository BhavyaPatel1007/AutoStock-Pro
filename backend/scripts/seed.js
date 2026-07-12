/**
 * Seed script — populates the database with sample data.
 * Run after migration: npm run seed
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const config = require('../src/config/env');

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const CATEGORIES = ['sedan', 'suv', 'truck', 'coupe', 'convertible', 'hatchback', 'van', 'wagon', 'electric', 'hybrid'];

const sampleVehicles = [
  // ── BMW ──
  { make: 'BMW', model: 'M4 Competition', category: 'coupe', price: 79500, quantity: 3 },
  { make: 'BMW', model: 'M3 Competition', category: 'sedan', price: 76500, quantity: 2 },
  { make: 'BMW', model: 'X5', category: 'suv', price: 62500, quantity: 5 },
  { make: 'BMW', model: 'X7', category: 'suv', price: 82500, quantity: 3 },
  { make: 'BMW', model: 'i4', category: 'electric', price: 55400, quantity: 4 },
  { make: 'BMW', model: 'iX', category: 'suv', price: 87500, quantity: 2 },

  // ── Mercedes-Benz ──
  { make: 'Mercedes-Benz', model: 'C-Class', category: 'sedan', price: 46500, quantity: 6 },
  { make: 'Mercedes-Benz', model: 'E-Class', category: 'sedan', price: 58500, quantity: 4 },
  { make: 'Mercedes-Benz', model: 'GLE', category: 'suv', price: 61500, quantity: 5 },
  { make: 'Mercedes-Benz', model: 'GLS', category: 'suv', price: 81500, quantity: 3 },
  { make: 'Mercedes-Benz', model: 'AMG GT', category: 'coupe', price: 119500, quantity: 1 },

  // ── Audi ──
  { make: 'Audi', model: 'A4', category: 'sedan', price: 42500, quantity: 6 },
  { make: 'Audi', model: 'A6', category: 'sedan', price: 57500, quantity: 4 },
  { make: 'Audi', model: 'Q5', category: 'suv', price: 48500, quantity: 5 },
  { make: 'Audi', model: 'Q7', category: 'suv', price: 60500, quantity: 3 },
  { make: 'Audi', model: 'e-tron GT', category: 'electric', price: 104500, quantity: 2 },

  // ── Toyota ──
  { make: 'Toyota', model: 'Land Cruiser', category: 'suv', price: 87500, quantity: 4 },
  { make: 'Toyota', model: 'Camry', category: 'sedan', price: 28400, quantity: 12 },
  { make: 'Toyota', model: 'Corolla', category: 'sedan', price: 22800, quantity: 15 },
  { make: 'Toyota', model: 'Fortuner', category: 'suv', price: 42500, quantity: 5 },
  { make: 'Toyota', model: 'Hilux', category: 'truck', price: 34500, quantity: 8 },
  { make: 'Toyota', model: 'Prius', category: 'hybrid', price: 29500, quantity: 7 },

  // ── Honda ──
  { make: 'Honda', model: 'Civic', category: 'sedan', price: 24800, quantity: 14 },
  { make: 'Honda', model: 'City', category: 'sedan', price: 22500, quantity: 10 },
  { make: 'Honda', model: 'Accord', category: 'sedan', price: 28800, quantity: 8 },
  { make: 'Honda', model: 'CR-V', category: 'suv', price: 32800, quantity: 9 },
  { make: 'Honda', model: 'HR-V', category: 'suv', price: 24800, quantity: 7 },

  // ── Hyundai ──
  { make: 'Hyundai', model: 'Creta', category: 'suv', price: 23500, quantity: 10 },
  { make: 'Hyundai', model: 'Tucson', category: 'suv', price: 29500, quantity: 7 },
  { make: 'Hyundai', model: 'Verna', category: 'sedan', price: 20500, quantity: 8 },
  { make: 'Hyundai', model: 'Ioniq 5', category: 'electric', price: 47500, quantity: 4 },
  { make: 'Hyundai', model: 'Venue', category: 'suv', price: 19500, quantity: 9 },

  // ── Kia ──
  { make: 'Kia', model: 'Seltos', category: 'suv', price: 24500, quantity: 8 },
  { make: 'Kia', model: 'Sonet', category: 'suv', price: 18500, quantity: 10 },
  { make: 'Kia', model: 'EV6', category: 'electric', price: 48500, quantity: 3 },
  { make: 'Kia', model: 'Carnival', category: 'van', price: 35500, quantity: 4 },

  // ── Mahindra ──
  { make: 'Mahindra', model: 'XUV700', category: 'suv', price: 32500, quantity: 6 },
  { make: 'Mahindra', model: 'Scorpio-N', category: 'suv', price: 28500, quantity: 5 },
  { make: 'Mahindra', model: 'Thar', category: 'suv', price: 26500, quantity: 4 },
  { make: 'Mahindra', model: 'BE 6', category: 'electric', price: 39500, quantity: 2 },

  // ── Tata ──
  { make: 'Tata', model: 'Harrier', category: 'suv', price: 28500, quantity: 6 },
  { make: 'Tata', model: 'Safari', category: 'suv', price: 30500, quantity: 5 },
  { make: 'Tata', model: 'Nexon', category: 'suv', price: 18500, quantity: 10 },
  { make: 'Tata', model: 'Curvv EV', category: 'electric', price: 32500, quantity: 3 },
  { make: 'Tata', model: 'Punch', category: 'suv', price: 15500, quantity: 8 },

  // ── Volkswagen ──
  { make: 'Volkswagen', model: 'Polo', category: 'hatchback', price: 22500, quantity: 8 },
  { make: 'Volkswagen', model: 'Virtus', category: 'sedan', price: 24500, quantity: 6 },
  { make: 'Volkswagen', model: 'Taigun', category: 'suv', price: 26500, quantity: 5 },
  { make: 'Volkswagen', model: 'Tiguan', category: 'suv', price: 32500, quantity: 4 },

  // ── Skoda ──
  { make: 'Skoda', model: 'Slavia', category: 'sedan', price: 23500, quantity: 6 },
  { make: 'Skoda', model: 'Kushaq', category: 'suv', price: 25500, quantity: 5 },
  { make: 'Skoda', model: 'Octavia', category: 'sedan', price: 33500, quantity: 4 },
  { make: 'Skoda', model: 'Superb', category: 'sedan', price: 35500, quantity: 3 },

  // ── Ford ──
  { make: 'Ford', model: 'Mustang GT', category: 'coupe', price: 48500, quantity: 4 },
  { make: 'Ford', model: 'Ranger', category: 'truck', price: 38500, quantity: 5 },
  { make: 'Ford', model: 'Everest', category: 'suv', price: 44500, quantity: 3 },

  // ── Chevrolet ──
  { make: 'Chevrolet', model: 'Camaro', category: 'coupe', price: 42500, quantity: 3 },
  { make: 'Chevrolet', model: 'Corvette C8', category: 'coupe', price: 68500, quantity: 2 },
  { make: 'Chevrolet', model: 'Tahoe', category: 'suv', price: 56500, quantity: 4 },

  // ── Nissan ──
  { make: 'Nissan', model: 'GT-R', category: 'coupe', price: 115000, quantity: 1 },
  { make: 'Nissan', model: 'X-Trail', category: 'suv', price: 32500, quantity: 5 },
  { make: 'Nissan', model: 'Patrol', category: 'suv', price: 52500, quantity: 3 },

  // ── Jeep ──
  { make: 'Jeep', model: 'Wrangler', category: 'suv', price: 42500, quantity: 4 },
  { make: 'Jeep', model: 'Compass', category: 'suv', price: 31500, quantity: 6 },
  { make: 'Jeep', model: 'Grand Cherokee', category: 'suv', price: 44500, quantity: 4 },

  // ── Lexus ──
  { make: 'Lexus', model: 'ES', category: 'sedan', price: 42500, quantity: 5 },
  { make: 'Lexus', model: 'RX', category: 'suv', price: 51500, quantity: 4 },
  { make: 'Lexus', model: 'LX', category: 'suv', price: 92500, quantity: 2 },

  // ── Volvo ──
  { make: 'Volvo', model: 'XC60', category: 'suv', price: 49500, quantity: 4 },
  { make: 'Volvo', model: 'XC90', category: 'suv', price: 59500, quantity: 3 },
  { make: 'Volvo', model: 'S90', category: 'sedan', price: 55500, quantity: 3 },

  // ── Porsche ──
  { make: 'Porsche', model: '911 Carrera', category: 'coupe', price: 114500, quantity: 2 },
  { make: 'Porsche', model: 'Cayenne', category: 'suv', price: 82500, quantity: 3 },
  { make: 'Porsche', model: 'Macan', category: 'suv', price: 59500, quantity: 4 },
  { make: 'Porsche', model: 'Taycan', category: 'electric', price: 92500, quantity: 2 },

  // ── Ferrari ──
  { make: 'Ferrari', model: 'SF90 Stradale', category: 'coupe', price: 525000, quantity: 1 },
  { make: 'Ferrari', model: '296 GTB', category: 'coupe', price: 345000, quantity: 1 },

  // ── Lamborghini ──
  { make: 'Lamborghini', model: 'Huracan', category: 'coupe', price: 285000, quantity: 1 },
  { make: 'Lamborghini', model: 'Revuelto', category: 'coupe', price: 610000, quantity: 1 },

  // ── McLaren ──
  { make: 'McLaren', model: '720S', category: 'coupe', price: 315000, quantity: 1 },
  { make: 'McLaren', model: 'Artura', category: 'coupe', price: 245000, quantity: 1 },

  // ── Tesla ──
  { make: 'Tesla', model: 'Model 3', category: 'sedan', price: 41990, quantity: 6 },
  { make: 'Tesla', model: 'Model S', category: 'sedan', price: 79990, quantity: 3 },
  { make: 'Tesla', model: 'Model X', category: 'suv', price: 82990, quantity: 2 },
  { make: 'Tesla', model: 'Model Y', category: 'suv', price: 48990, quantity: 5 },
  { make: 'Tesla', model: 'Cybertruck', category: 'truck', price: 81990, quantity: 2 },

  // ── BYD ──
  { make: 'BYD', model: 'Seal', category: 'sedan', price: 41500, quantity: 4 },
  { make: 'BYD', model: 'Atto 3', category: 'suv', price: 38500, quantity: 3 },

  // ── MG ──
  { make: 'MG', model: 'Hector', category: 'suv', price: 24500, quantity: 6 },
  { make: 'MG', model: 'Astor', category: 'suv', price: 22500, quantity: 5 },
  { make: 'MG', model: 'ZS EV', category: 'electric', price: 32500, quantity: 3 },
  { make: 'MG', model: 'Windsor EV', category: 'electric', price: 37500, quantity: 2 },
];

const seed = async () => {
  console.log('Seeding database ...\n');

  // Check if data already exists
  const { count } = await supabase.from('vehicles').select('*', { count: 'exact', head: true });
  if (count && count > 0) {
    if (process.env.FORCE_SEED === 'true') {
      console.log(`Database has ${count} vehicles. FORCE_SEED=true — clearing and reseeding...`);
      await supabase.from('vehicles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('purchases').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      console.log('  Existing data cleared.');
    } else {
      console.log(`Database already has ${count} vehicles. Skipping seed.`);
      console.log('Run with FORCE_SEED=true to reseed: FORCE_SEED=true npm run seed');
      return;
    }
  }

  // Create admin user (password: Admin123!)
  const adminPass = await bcrypt.hash('Admin123!', 4);
  const { data: admin, error: adminErr } = await supabase
    .from('users')
    .insert({ name: 'Admin User', email: 'admin@autostock.com', password_hash: adminPass, role: 'admin' })
    .select('id, email, role')
    .single();

  if (adminErr) {
    if (adminErr.code === '23505') {
      console.log('Admin user already exists (email unique).');
    } else {
      console.error('Failed to create admin:', adminErr.message);
    }
  } else {
    console.log(`  Admin: ${admin.email} (${admin.role})  [password: Admin123!]`);
  }

  // Create regular user (password: User1234!)
  const userPass = await bcrypt.hash('User1234!', 4);
  const { data: user, error: userErr } = await supabase
    .from('users')
    .insert({ name: 'Test User', email: 'user@autostock.com', password_hash: userPass, role: 'user' })
    .select('id, email, role')
    .single();

  if (userErr && userErr.code !== '23505') {
    console.error('Failed to create regular user:', userErr.message);
  } else if (!userErr) {
    console.log(`  User: ${user.email} (${user.role})  [password: User1234!]`);
  }

  // Insert vehicles
  const { error: vehErr } = await supabase.from('vehicles').insert(sampleVehicles);
  if (vehErr) {
    console.error('Failed to insert vehicles:', vehErr.message);
  } else {
    console.log(`  ${sampleVehicles.length} vehicles inserted`);
  }

  console.log('\nSeed complete.');
  console.log('\nLogin credentials:');
  console.log('  Admin: admin@autostock.com / Admin123!');
  console.log('  User:  user@autostock.com  / User1234!');
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
