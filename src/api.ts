import type { RawPermit } from './transform';

const BASE_URL =
  'https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/issued-building-permits/records';
const TIMEOUT_MS = 10_000; // 10 seconds
const PAGE_SIZE = 100;   // max limit per API request

interface ApiResponse {
  total_count: number;
  results: RawPermit[];
}

export interface FetchResult {
  totalCount: number;
  records: RawPermit[];
}

async function fetchPage(offset: number, year: string): Promise<ApiResponse> {
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    offset: String(offset),
    order_by: 'permitnumber',
    where: `issueyear="${year}"`,
  });

  const res = await fetch(`${BASE_URL}?${params.toString()}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as ApiResponse;
  if (typeof data.total_count !== 'number' || !Array.isArray(data.results)) {
    throw new Error('Unexpected response shape');
  }
  return data;
}

// fetch by year
export async function fetchAllPermits(year: string): Promise<FetchResult> {
  // 1) get first page and check total count
  const first = await fetchPage(0, year);
  const totalCount = first.total_count;
  const records: RawPermit[] = [...first.results];
  console.log(`Fetched ${records.length} / ${totalCount}`);

  // 2) fetch remaining pages if any
  for (let offset = PAGE_SIZE; offset < totalCount; offset += PAGE_SIZE) {
    const page = await fetchPage(offset, year);
    records.push(...page.results);
    console.log(`Fetched ${records.length} / ${totalCount}`);
  }

  return { totalCount, records };
}