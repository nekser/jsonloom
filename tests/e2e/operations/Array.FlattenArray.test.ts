import { applyOperation } from '@/tests/helpers/runner';

describe('FlattenArray', () => {
  it('flattens nested arrays one level', () => {
    const input = { items: [1,[2,[3]]] };
    const op = { type: 'FlattenArray' as const, config: { path: 'items', depth: 1 } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ items: [1,2,[3]] });
  });
});
