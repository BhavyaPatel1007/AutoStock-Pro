const { readFileSync, readdirSync, existsSync } = require('fs');
const { resolve } = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: resolve(__dirname, '../.env') });

const REF = process.env.SUPABASE_URL?.match(/https?:\/\/(.+)\.supabase\.co/)?.[1];
if (!REF) {
  console.error('Could not extract project ref from SUPABASE_URL');
  process.exit(1);
}

const REGION = 'ap-northeast-1';
const PGPASS = process.env.SUPABASE_DB_PASSWORD;

const migrate = async () => {
  if (!PGPASS) {
    console.error('SUPABASE_DB_PASSWORD not set in backend/.env');
    console.error('');
    console.error('To get the password:');
    console.error('  1. Open https://supabase.com/dashboard/project/' + REF);
    console.error('  2. Go to Project Settings \u2192 Database \u2192 Connection string');
    console.error('  3. Copy the password from the URI and add to backend/.env:');
    console.error('     SUPABASE_DB_PASSWORD=your_password_here');
    console.error('');
    process.exit(1);
  }

  const migrationsDir = resolve(__dirname, '../src/migrations');
  if (!existsSync(migrationsDir)) {
    console.error('Migrations directory not found:', migrationsDir);
    process.exit(1);
  }

  const sqlFiles = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (sqlFiles.length === 0) {
    console.error('No SQL migration files found in', migrationsDir);
    process.exit(1);
  }

  const configs = [
    {
      connectionString: `postgresql://postgres.${REF}:${encodeURIComponent(PGPASS)}@aws-0-${REGION}.pooler.supabase.com:6543/postgres?pgbouncer=true`,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    },
    {
      connectionString: `postgresql://postgres.${REF}:${encodeURIComponent(PGPASS)}@aws-0-${REGION}.pooler.supabase.com:5432/postgres?pgbouncer=true`,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    },
    {
      host: `db.${REF}.supabase.co`,
      port: 5432,
      user: 'postgres',
      password: PGPASS,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    },
  ];

  let client = null;

  for (const cfg of configs) {
    const label = cfg.connectionString
      ? `pooler ${cfg.connectionString.split('@')[1].split('?')[0]}`
      : `direct ${cfg.host}:${cfg.port}`;
    process.stdout.write(`Connecting via ${label} ... `);
    try {
      const c = new Client(cfg);
      await c.connect();
      client = c;
      console.log('OK');
      break;
    } catch (err) {
      console.log(err.message.split('\n')[0]);
    }
  }

  if (!client) {
    console.error('\nCould not connect. Check SUPABASE_DB_PASSWORD and network access.');
    process.exit(1);
  }

  for (const file of sqlFiles) {
    const sqlPath = resolve(migrationsDir, file);
    const sql = readFileSync(sqlPath, 'utf8');
    process.stdout.write(`Applying ${file} ... `);
    try {
      await client.query(sql);
      console.log('OK');
    } catch (err) {
      console.log('FAILED:', err.message);
      await client.end();
      process.exit(1);
    }
  }

  console.log('\nVerifying schema ...');
  const { rows: tables } = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name IN ('users', 'vehicles', 'purchases')
    ORDER BY table_name
  `);

  for (const { table_name } of tables) {
    const { rows: cols } = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [table_name]);
    console.log(`\n  ${table_name}:`);
    for (const c of cols) {
      console.log(`    ${c.column_name}  ${c.data_type}`);
    }
  }

  await client.end();
  console.log('\nMigration complete.');
};

migrate().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
