import { applyOperation } from '@/tests/helpers/runner';

describe('TrimStrings', () => {
  it('trims all strings recursively when no path provided', () => {
    const input = { a: '  hi  ', b: ['  x', 'y  '], c: { d: '  z  ' } };
    const op = { type: 'TrimStrings' as const, config: {} };
    const result = applyOperation(input, op);
    expect(result).toEqual({ a: 'hi', b: ['x', 'y'], c: { d: 'z' } });
  });
});
