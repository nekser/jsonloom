import { applyOperation } from '@/tests/helpers/runner';

describe('FilterArray', () => {
  it('filters items by price > 100', () => {
    const input = { orders: [{ price: 10 }, { price: 200 }, { price: 50 }] };
    const op = { type: 'FilterArray' as const, config: { path: 'orders', key: 'price', operator: 'gt', value: 100 } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ orders: [{ price: 200 }] });
  });
});
