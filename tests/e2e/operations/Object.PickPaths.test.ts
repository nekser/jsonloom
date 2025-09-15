import { applyOperation } from '@/tests/helpers/runner';

describe('PickPaths', () => {
  it('picks specified nested paths', () => {
    const input = { a: { b: 1, c: 2 }, d: 3 };
    const op = { type: 'PickPaths' as const, config: { paths: ['a.b', 'd'] } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ a: { b: 1 }, d: 3 });
  });
});
