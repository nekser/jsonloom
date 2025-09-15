import { applyOperation } from '@/tests/helpers/runner';
import type { JSONObject } from '@/src/types/json';

describe('DateAdd', () => {
  it('adds days to date', () => {
    const input = { d: '2024-03-01' };
    const op = { type: 'DateAdd' as const, config: { path: 'd', amount: 5, unit: 'days' } };
    const result = applyOperation(input, op) as unknown as JSONObject;
    expect(typeof result.d).toBe('string');
    expect((result.d as string)).toMatch(/^2024-03-06T/);
  });
});
