import { applyOperation } from '@/tests/helpers/runner';

describe('ExtractPath', () => {
  it('extracts nested value', () => {
    const input = { user: { id: 5 } };
    const op = { type: 'ExtractPath' as const, config: { path: 'user.id' } };
    const result = applyOperation(input, op);
    expect(result).toBe(5);
  });
});
