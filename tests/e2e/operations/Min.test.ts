import { applyOperation } from '@/tests/helpers/runner';

describe('Min', () => {
  it('computes minimum number ignoring non-numbers', () => {
    const input = { arr: [5, 'x', 3, 9] } as any;
    const op = { type: 'Min' as const, config: { path: 'arr' } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ arr: 3 });
  });
});
