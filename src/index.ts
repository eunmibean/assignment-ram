import { fetchAllPermits } from './api';
import { Permit, transformPermit } from './transform';
import { upsertPermits, countPermits, closePool, applySchema } from './db';

const YEAR = '2017';
async function main() {
    const { totalCount, records } = await fetchAllPermits(YEAR);

  console.log('fetched records:', totalCount, records.length);
  const permits: Permit[] = [];
  for (const raw of records) {
    const p = transformPermit(raw);
    if (p) permits.push(p);
}
  await applySchema();
  await upsertPermits(permits);

  const dbCount = await countPermits(YEAR);
  console.log(`API total_count: ${totalCount}`);
  console.log(`rows ${YEAR} in DB: ${dbCount}`);

  const isAllInserted = records.length === totalCount && dbCount === permits.length;
  console.log(`All records inserted: ${isAllInserted}`);
  await closePool();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});