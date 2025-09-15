import { applyOperation } from '@/tests/helpers/runner';

describe('CountArray', () => {
  it('replaces array with its length', () => {
    const input = { items: ['a','b','c'] };
    const op = { type: 'CountArray' as const, config: { path: 'items' } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ items: 3 });
  });
});
