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
  { make: 'Toyota', model: 'Camry', category: 'sedan', price: 26420, quantity: 15 },
  { make: 'Honda', model: 'CR-V', category: 'suv', price: 31300, quantity: 10 },
  { make: 'Ford', model: 'F-150', category: 'truck', price: 35670, quantity: 8 },
  { make: 'BMW', model: '4 Series', category: 'coupe', price: 46200, quantity: 5 },
  { make: 'Mazda', model: 'MX-5', category: 'convertible', price: 28150, quantity: 3 },
  { make: 'Volkswagen', model: 'Golf', category: 'hatchback', price: 24400, quantity: 12 },
  { make: 'Mercedes', model: 'Sprinter', category: 'van', price: 43200, quantity: 4 },
  { make: 'Subaru', model: 'Outback', category: 'wagon', price: 28820, quantity: 7 },
  { make: 'Tesla', model: 'Model 3', category: 'electric', price: 38990, quantity: 6 },
  { make: 'Toyota', model: 'Prius', category: 'hybrid', price: 27450, quantity: 9 },
  { make: 'Honda', model: 'Accord', category: 'sedan', price: 27295, quantity: 11 },
  { make: 'Jeep', model: 'Wrangler', category: 'suv', price: 35365, quantity: 6 },
  { make: 'Ram', model: '1500', category: 'truck', price: 39600, quantity: 5 },
  { make: 'Porsche', model: '718 Cayman', category: 'coupe', price: 60400, quantity: 2 },
  { make: 'Fiat', model: '500', category: 'hatchback', price: 19500, quantity: 8 },
  { make: 'Nissan', model: 'Leaf', category: 'electric', price: 28400, quantity: 7 },
  { make: 'Hyundai', model: 'Tucson', category: 'suv', price: 27400, quantity: 10 },
  { make: 'Ford', model: 'Mustang', category: 'coupe', price: 30785, quantity: 6 },
  { make: 'Chevrolet', model: 'Tahoe', category: 'suv', price: 54200, quantity: 4 },
  { make: 'Kia', model: 'Soul', category: 'hatchback', price: 20190, quantity: 9 },
];

const seed = async () => {
  console.log('Seeding database ...\n');

  // Check if data already exists
  const { count } = await supabase.from('vehicles').select('*', { count: 'exact', head: true });
  if (count && count > 0) {
    console.log(`Database already has ${count} vehicles. Skipping seed.`);
    console.log('Run with FORCE_SEED=true to reseed: FORCE_SEED=true npm run seed');
    return;
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
