import { applyOperation } from '@/tests/helpers/runner';

describe('SliceArray', () => {
  it('slices array with start/end', () => {
    const input = { nums: [0,1,2,3,4] };
    const op = { type: 'SliceArray' as const, config: { path: 'nums', start: 1, end: 4 } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ nums: [1,2,3] });
  });
});
