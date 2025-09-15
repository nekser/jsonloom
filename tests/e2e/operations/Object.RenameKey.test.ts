import { applyOperation } from '@/tests/helpers/runner';

describe('RenameKey', () => {
  it('renames key recursively', () => {
    const input = { user_id: 1, nested: { user_id: 2 } };
    const op = { type: 'RenameKey' as const, config: { from: 'user_id', to: 'userId' } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ userId: 1, nested: { userId: 2 } });
  });
});
