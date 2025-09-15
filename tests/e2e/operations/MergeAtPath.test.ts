import { applyOperation } from '@/tests/helpers/runner';

describe('MergeAtPath', () => {
  it('merges root into target object shallowly', () => {
    const input = { target: { a: 1 }, extra: 2 } as any;
    const op = { type: 'MergeAtPath' as const, config: { path: 'target', source: 'root', strategy: 'shallow' } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ target: { a: 1, extra: 2 }, extra: 2 });
  });
});
