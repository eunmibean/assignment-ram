import { fetchPermits } from './api';
import { transformPermit, type RawPermit } from './transform';

async function main() {
  const data = (await fetchPermits(3, 0)) as { results: RawPermit[] };
  const permits = data.results.map(transformPermit);
  console.log(JSON.stringify(permits, null, 2));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});