import { applyOperation } from '@/tests/helpers/runner';

describe('Modulo', () => {
  it('applies modulo', () => {
    const input = { n: 10 };
    const op = { type: 'Modulo' as const, config: { path: 'n', value: 4 } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ n: 2 });
  });
});
