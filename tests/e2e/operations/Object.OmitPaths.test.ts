import { applyOperation } from '@/tests/helpers/runner';

describe('OmitPaths', () => {
  it('omits specified nested paths', () => {
    const input = { a: { b: 1, c: 2 }, d: 3 };
    const op = { type: 'OmitPaths' as const, config: { paths: ['a.c'] } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ a: { b: 1 }, d: 3 });
  });
});
