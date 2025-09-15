import { applyOperation } from '@/tests/helpers/runner';

describe('FlattenObject', () => {
  it('flattens nested object at path', () => {
    const input = { data: { user: { id: 1, name: 'A' } } };
    const op = { type: 'FlattenObject' as const, config: { path: 'data' } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ data: { 'user.id': 1, 'user.name': 'A' } });
  });
});
