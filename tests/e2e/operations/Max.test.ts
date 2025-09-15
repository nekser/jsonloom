import { applyOperation } from '@/tests/helpers/runner';

describe('Max', () => {
  it('computes maximum number ignoring non-numbers', () => {
    const input = { arr: [5, 'x', 3, 9] } as any;
    const op = { type: 'Max' as const, config: { path: 'arr' } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ arr: 9 });
  });
});
