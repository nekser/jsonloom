import { applyOperation } from '@/tests/helpers/runner';

describe('JoinArray', () => {
  it('joins array elements into a single string', () => {
    const input = { parts: ['ab','cd','ef'] };
    const op = { type: 'JoinArray' as const, config: { path: 'parts', separator: '-' } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ parts: 'ab-cd-ef' });
  });
});
