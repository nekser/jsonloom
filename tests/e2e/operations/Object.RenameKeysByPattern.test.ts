import { applyOperation } from '@/tests/helpers/runner';

describe('RenameKeysByPattern', () => {
  it('applies regex rename', () => {
    const input = { FooBar: 1, FooBaz: 2 };
    const op = { type: 'RenameKeysByPattern' as const, config: { pattern: '^Foo', replace: 'Bar' } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ BarBar: 1, BarBaz: 2 });
  });
});
