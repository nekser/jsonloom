import { applyOperation } from '@/tests/helpers/runner';

describe('ReduceArray', () => {
  it('sums numeric values', () => {
    const input = { nums: [1,2,3] };
    const op = { type: 'ReduceArray' as const, config: { path: 'nums', op: 'sum' } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ nums: 6 });
  });
});
