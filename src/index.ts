import { fetchAllPermits } from './api';
import { Permit, transformPermit, type RawPermit } from './transform';
import { upsertPermits, countPermits, closePool, applySchema } from './db';

async function main() {
    const { totalCount, records } = await fetchAllPermits('2017');

  console.log('fetched records:', totalCount, records.length);
  const permits: Permit[] = [];
  for (const raw of records) {
    const p = transformPermit(raw);
    if (p) permits.push(p);
}
  await applySchema();
  await upsertPermits(permits);
  console.log('rows in DB:', await countPermits());
  await closePool();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});