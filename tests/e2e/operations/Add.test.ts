import { applyOperation } from '@/tests/helpers/runner';

describe('Add', () => {
  it('adds value at path', () => {
    const input = { value: 10 };
    const op = { type: 'Add' as const, config: { path: 'value', value: 5 } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ value: 15 });
  });
});
