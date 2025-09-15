import { applyOperation } from '@/tests/helpers/runner';

describe('DateDiff', () => {
  it('computes days diff and writes to sibling path', () => {
    const input = { start: '2024-01-01', end: '2024-01-10' };
    const op = { type: 'DateDiff' as const, config: { startPath: 'start', endPath: 'end', unit: 'days' } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ start: '2024-01-01', end: '2024-01-10', end_diff_days: 9 });
  });
});
