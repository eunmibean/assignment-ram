import { describe, it, expect } from 'vitest';
import { parseDate } from './transform';

describe('parseDate', () => {
  it('parses a valid date string', () => {
    expect(parseDate('2026-03-15')).toBe('2026-03-15');
  });

  it('returns null for empty values', () => {
    expect(parseDate('')).toBeNull();
  });
});