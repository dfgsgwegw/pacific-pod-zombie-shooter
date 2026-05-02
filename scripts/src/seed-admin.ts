import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const DB_URL = process.env.DATABASE_URL;
const USERNAME = process.env.ADMIN_USERNAME ?? 'lauda';
const PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin123!';

if (!DB_URL) {
  console.error('ERROR: DATABASE_URL environment variable is required.');
  console.error('Usage: DATABASE_URL="postgresql://..." pnpm --filter @workspace/scripts run seed-admin');
  process.exit(1);
}

const pool = new Pool({ connectionString: DB_URL });

try {
  const hash = await bcrypt.hash(PASSWORD, 10);

  await pool.query(
    `INSERT INTO users (discord_username, password_hash, is_admin)
     VALUES ($1, $2, true)
     ON CONFLICT (discord_username)
     DO UPDATE SET password_hash = $2, is_admin = true`,
    [USERNAME, hash]
  );

  const { rows } = await pool.query(
    'SELECT id, discord_username, is_admin FROM users WHERE discord_username = $1',
    [USERNAME]
  );

  console.log('✓ Admin account ready:');
  console.log(`  username : ${rows[0].discord_username}`);
  console.log(`  password : ${PASSWORD}`);
  console.log(`  is_admin : ${rows[0].is_admin}`);
  console.log(`  id       : ${rows[0].id}`);
} finally {
  await pool.end();
}
