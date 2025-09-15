import { applyOperation } from '@/tests/helpers/runner';

describe('Subtract', () => {
  it('subtracts value at path', () => {
    const input = { v: 10 };
    const op = { type: 'Subtract' as const, config: { path: 'v', value: 3 } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ v: 7 });
  });
});
