import { applyPipeline } from '@/tests/helpers/runner';

describe('Combination 2: Filter + MapArray + Reduce', () => {
  it('filters, maps, and reduces orders', () => {
    const input = { orders: [{ price: 50 }, { price: 200 }, { price: 150 }] };
    const ops = [
      { id: 'filter', type: 'FilterArray', config: { path: 'orders', key: 'price', operator: 'gt', value: 100 } },
      { id: 'map', type: 'MapArray', config: { path: 'orders', operations: [
        { id: 'mul', type: 'Multiply', config: { path: 'price', value: 2 } },
      ] } },
      { id: 'sum', type: 'ReduceArray', config: { path: 'orders', by: 'price', op: 'sum' } },
      { id: 'writeSum', type: 'SetPath', config: { path: 'sumPrice', value: '${root.orders}' } },
    ];
    const result = applyPipeline(input, ops as any);
    expect(result).toEqual({ orders: [{ price: 400 }, { price: 300 }], sumPrice: 700 });
  });
});
