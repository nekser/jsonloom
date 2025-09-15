import { applyOperation } from '@/tests/helpers/runner';

describe('Count', () => {
  it('counts array length', () => {
    const input = { arr: [1,2,3,4] };
    const op = { type: 'Count' as const, config: { path: 'arr' } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ arr: 4 });
  });
});
