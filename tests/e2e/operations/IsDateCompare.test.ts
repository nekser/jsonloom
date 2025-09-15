import { applyOperation } from '@/tests/helpers/runner';

describe('IsDateCompare', () => {
  it('writes boolean to resultPath', () => {
    const input = { a: '2024-01-01', b: '2024-02-01' };
    const op = { type: 'IsDateCompare' as const, config: { path: 'b', compareTo: { path: 'a' }, op: 'after', resultPath: 'isAfter' } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ a: '2024-01-01', b: '2024-02-01', isAfter: true });
  });
});
