import { fetchPermits } from './api';

async function main() {
  const data = await fetchPermits(3, 0);
  console.log(JSON.stringify(data, null, 2));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});