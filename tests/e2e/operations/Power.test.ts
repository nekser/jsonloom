import { applyOperation } from '@/tests/helpers/runner';

describe('Power', () => {
  it('raises to exponent', () => {
    const input = { n: 3 };
    const op = { type: 'Power' as const, config: { path: 'n', value: 3 } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ n: 27 });
  });
});
