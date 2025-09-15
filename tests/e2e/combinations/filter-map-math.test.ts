import { applyPipeline } from '@/tests/helpers/runner';

describe('Pipeline: Filter → Map → Multiply', () => {
  it('filters by price > 50 then doubles prices', () => {
    const input = { orders: [{ price: 10 }, { price: 200 }, { price: 50 }] };
    const ops = [
      // Use gt 49 to emulate >= 50 since FilterArray supports only gt/lt/eq/neq
      { id: 'f', type: 'FilterArray', config: { path: 'orders', key: 'price', operator: 'gt', value: 49 } },
      {
        id: 'm',
        type: 'MapArray',
        config: {
          path: 'orders',
          operations: [
            { id: 'mul', type: 'Multiply', config: { path: 'price', value: 2 } },
          ],
        },
      },
    ];
    const result = applyPipeline(input, ops as any);
    expect(result).toEqual({ orders: [{ price: 400 }, { price: 100 }] });
  });
});
