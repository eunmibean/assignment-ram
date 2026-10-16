import type { RawPermit } from "./transform";

const BASE_URL =
  "https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/issued-building-permits/records";
const TIMEOUT_MS = 10_000; // 10 seconds
const PAGE_SIZE = 100; // max limit per API request
const MAX_RETRIES = 3;

interface ApiResponse {
  total_count: number;
  results: RawPermit[];
}

export interface FetchResult {
  totalCount: number;
  records: RawPermit[];
}

class ClientError extends Error {}
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(offset: number, year: string): Promise<ApiResponse> {
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    offset: String(offset),
    order_by: "permitnumber",
    where: `issueyear="${year}"`,
  });
  const url = `${BASE_URL}?${params.toString()}`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });

      if (!res.ok) {
        const errorMessage = `HTTP ${res.status}: ${await res.text()}`;
        if (res.status >= 400 && res.status < 500) {
          throw new ClientError(errorMessage);
        }
        throw new Error(errorMessage);
      }

      const data = (await res.json()) as ApiResponse;
      if (
        typeof data.total_count !== "number" ||
        !Array.isArray(data.results)
      ) {
        throw new Error("Unexpected response shape");
      }
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (err instanceof ClientError || attempt == MAX_RETRIES) {
        throw new Error(`Request failed at offset ${offset}: ${message}`);
      }
      const delay = 500 * 2 ** (attempt - 1); //500ms, 1s, 2s
      console.warn(
        `Attempt ${attempt} failed (${message}). Retrying in ${delay}ms...`,
      );
      await sleep(delay);
    }
  }
  throw new Error('Unreachable');
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
