import { applyOperation } from '@/tests/helpers/runner';

describe('Multiply', () => {
  it('multiplies value at path', () => {
    const input = { value: 4 };
    const op = { type: 'Multiply' as const, config: { path: 'value', value: 3 } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ value: 12 });
  });
});
