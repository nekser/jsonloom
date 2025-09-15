import { applyOperation } from '@/tests/helpers/runner';

describe('Divide', () => {
  it('divides value at path', () => {
    const input = { n: 9 };
    const op = { type: 'Divide' as const, config: { path: 'n', value: 3 } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ n: 3 });
  });
});
