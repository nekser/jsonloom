import { applyOperation } from '@/tests/helpers/runner';

describe('DeletePath', () => {
  it('deletes nested path', () => {
    const input = { user: { name: 'Alice', age: 30 } };
    const op = { type: 'DeletePath' as const, config: { path: 'user.age' } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ user: { name: 'Alice' } });
  });
});
