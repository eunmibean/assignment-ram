import { pool } from './db';

async function main() {
  const [rows] = await pool.query('SELECT 1 AS ok');
  console.log('DB connected:', rows);
  await pool.end();
}

main().catch((err) => {
  console.error('DB connection failed:', err.message);
  process.exit(1);
});