import { applyOperation } from '@/tests/helpers/runner';

describe('SortArray', () => {
  it('sorts numbers descending', () => {
    const input = { nums: [3,1,2] };
    const op = { type: 'SortArray' as const, config: { path: 'nums', order: 'desc' } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ nums: [3,2,1] });
  });
});
