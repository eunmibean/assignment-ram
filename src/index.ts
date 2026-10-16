import { fetchPermits } from './api';
import { Permit, transformPermit, type RawPermit } from './transform';
import { upsertPermits, countPermits, closePool, applySchema } from './db';

async function main() {
  const data = (await fetchPermits(100, 0)) as { results: RawPermit[] };
  const permits: Permit[] = [];
  for (const raw of data.results) {
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