import { applyOperation } from '@/tests/helpers/runner';

describe('Round', () => {
  it('rounds number with precision', () => {
    const input = { price: 12.3456 };
    const op = { type: 'Round' as const, config: { path: 'price', precision: 2 } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ price: 12.35 });
  });
});
