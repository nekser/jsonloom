import { applyOperation } from '@/tests/helpers/runner';

describe('MapArray', () => {
  it('multiplies item.price by 2', () => {
    const input = { orders: [{ price: 10 }, { price: 20 }] };
    const op = {
      type: 'MapArray' as const,
      config: {
        path: 'orders',
        operations: [
          { id: 'mul', type: 'Multiply', config: { path: 'price', value: 2 } },
        ],
      },
    };
    const result = applyOperation(input, op);
    expect(result).toEqual({ orders: [{ price: 20 }, { price: 40 }] });
  });
});
