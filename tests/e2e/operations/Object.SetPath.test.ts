import { applyOperation } from '@/tests/helpers/runner';

describe('SetPath', () => {
  it('sets nested path creating structure', () => {
    const input = {} as any;
    const op = { type: 'SetPath' as const, config: { path: 'user.name', value: 'Alice' } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ user: { name: 'Alice' } });
  });
});
