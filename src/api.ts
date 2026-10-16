const BASE_URL =
  'https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/issued-building-permits/records';

export async function fetchPermits(limit = 3, offset = 0): Promise<unknown> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  const res = await fetch(`${BASE_URL}?${params.toString()}`);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }

  return res.json();
}