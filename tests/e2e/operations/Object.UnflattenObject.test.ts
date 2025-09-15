import { applyOperation } from '@/tests/helpers/runner';

describe('UnflattenObject', () => {
  it('expands flattened keys', () => {
    const input = { data: { 'user.id': 1, 'user.name': 'A' } };
    const op = { type: 'UnflattenObject' as const, config: { path: 'data' } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ data: { user: { id: 1, name: 'A' } } });
  });
});
