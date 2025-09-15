import { applyOperation } from '@/tests/helpers/runner';
import type { JSONObject } from '@/src/types/json';

describe('ParseDate', () => {
  it('parses date and converts to ISO', () => {
    const input = { d: '2024-02-29' };
    const op = { type: 'ParseDate' as const, config: { path: 'd', format: 'YYYY-MM-DD' } };
    const result = applyOperation(input, op) as unknown as JSONObject;
    expect(typeof result.d).toBe('string');
    expect((result.d as string)).toMatch(/^2024-02-29T/);
  });
});
