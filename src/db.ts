import 'dotenv/config';
import mysql from 'mysql2/promise';
import type { Permit } from './transform';

import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Apply schema.sql to the database
export async function applySchema(): Promise<void> {
  const sql = await readFile(path.join(__dirname, '..', './src/schema.sql'), 'utf8');
  await pool.query(sql);
}

const BATCH_SIZE = 100;

const COLUMNS = [
  'permit_number',
  'created_date',
  'issue_date',
  'elapsed_days',
  'project_value',
  'type_of_work',
  'address',
  'project_description',
  'permit_category',
  'applicant',
  'property_use',
  'specific_use_category',
  'building_contractor',
  'building_contractor_address',
  'permit_year_month',
  'local_area',
  'latitude',
  'longitude',
] as const;

// Permit 1건 → COLUMNS 순서와 같은 값 배열
function toRow(p: Permit): (string | number | null)[] {
  return [
    p.permitNumber,
    p.createdDate,
    p.issueDate,
    p.elapsedDays,
    p.projectValue,
    p.typeOfWork,
    p.address,
    p.projectDescription,
    p.permitCategory,
    p.applicant,
    p.propertyUse,
    p.specificUseCategory,
    p.buildingContractor,
    p.buildingContractorAddress,
    p.localArea,
    p.latitude,
    p.longitude,
  ];
}

const UPDATE_CLAUSE = COLUMNS.filter((c) => c !== 'permit_number')
  .map((c) => `${c} = VALUES(${c})`)
  .join(', ');

const UPSERT_SQL = `INSERT INTO building_permits (${COLUMNS.join(', ')}) VALUES ? ON DUPLICATE KEY UPDATE ${UPDATE_CLAUSE}`;

export async function upsertPermits(permits: Permit[]): Promise<void> {
  for (let i = 0; i < permits.length; i += BATCH_SIZE) {
    const batch = permits.slice(i, i + BATCH_SIZE).map(toRow);
    await pool.query(UPSERT_SQL, [batch]);
  }
}

export async function countPermits(): Promise<number> {
  const [rows] = await pool.query('SELECT COUNT(*) AS cnt FROM building_permits');
  return Number((rows as { cnt: number }[])[0]?.cnt ?? 0);
}

export async function closePool(): Promise<void> {
  await pool.end();
}