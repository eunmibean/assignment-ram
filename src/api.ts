const BASE_URL =
  'https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/issued-building-permits/records';
const TIMEOUT_MS = 10_000; // 10 seconds

export async function fetchPermits(limit = 3, offset = 0): Promise<unknown> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  const res = await fetch(`${BASE_URL}?${params.toString()}`,    
                         {signal: AbortSignal.timeout(TIMEOUT_MS)}
                        );     

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }
  return res.json();
}