import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { fetchAllPermits } from './api';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function fakeRecords(start: number, count: number) {
  return Array.from({ length: count }, (_, i) => ({ permitnumber: `BP-${start + i}` }));
}

function mockPagedApi(total: number) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = new URL(String(input));
    const offset = Number(url.searchParams.get('offset'));
    const limit = Number(url.searchParams.get('limit'));
    const count = Math.max(0, Math.min(limit, total - offset));
    return jsonResponse({ total_count: total, results: fakeRecords(offset, count) });
  });
}

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fetchAllPermits', () => {
  it('pages through all records', async () => {
    const fetchMock = mockPagedApi(250);

    const { totalCount, records } = await fetchAllPermits('2018');

    expect(totalCount).toBe(250);
    expect(records).toHaveLength(250);
    expect(fetchMock).toHaveBeenCalledTimes(3); // 100 + 100 + 50
    expect(records[0]?.permitnumber).toBe('BP-0');
    expect(records[249]?.permitnumber).toBe('BP-249');
  });

  it('sends year filter, fixed ordering, and page size', async () => {
    const fetchMock = mockPagedApi(10);

    await fetchAllPermits('2018');

    const url = new URL(String(fetchMock.mock.calls[0]![0]));
    expect(url.searchParams.get('where')).toBe('issueyear="2018"');
    expect(url.searchParams.get('order_by')).toBe('permitnumber');
    expect(url.searchParams.get('limit')).toBe('100');
  });

  it('retries after a server error and then succeeds', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementationOnce(async () => jsonResponse({ error: 'boom' }, 500))
      .mockImplementation(async () =>
        jsonResponse({ total_count: 1, results: fakeRecords(0, 1) }),
      );

    const { records } = await fetchAllPermits('2018');

    expect(records).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not retry on a client error (400)', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => jsonResponse({ message: 'bad limit' }, 400));

    await expect(fetchAllPermits('2018')).rejects.toThrow(/HTTP 400/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('gives up after 3 failed attempts', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => jsonResponse({ error: 'down' }, 503));

    await expect(fetchAllPermits('2018')).rejects.toThrow(/HTTP 503/);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  }, 10_000);
});
