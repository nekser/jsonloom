import { applyOperation } from '@/tests/helpers/runner';

describe('Sum', () => {
  it('sums numbers in array', () => {
    const input = { nums: [1, 2, 3, 'x'] } as any;
    const op = { type: 'Sum' as const, config: { path: 'nums' } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ nums: 6 });
  });
});
