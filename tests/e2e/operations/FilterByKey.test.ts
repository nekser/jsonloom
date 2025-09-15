import { applyOperation } from '@/tests/helpers/runner';

describe('FilterByKey', () => {
  it('keeps only specified keys', () => {
    const input = { a: 1, b: 2, c: 3 };
    const op = { type: 'FilterByKey' as const, config: { mode: 'keep', keys: ['a','c'] } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ a: 1, c: 3 });
  });
  it('removes specified keys recursively', () => {
    const input = { a: 1, nested: { a: 2, b: 3 } };
    const op = { type: 'FilterByKey' as const, config: { mode: 'remove', keys: ['a'] } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ nested: { b: 3 } });
  });
});
