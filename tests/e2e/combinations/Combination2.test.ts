import { applyPipeline } from '@/tests/helpers/runner';

describe('Combination 2: Filter + MapArray + Reduce', () => {
  it('filters, maps, and reduces orders', () => {
    const input = { orders: [{ price: 50 }, { price: 200 }, { price: 150 }] };
    const ops = [
      { id: 'filter', type: 'FilterArray', config: { path: 'orders', key: 'price', operator: 'gt', value: 100 } },
      { id: 'map', type: 'MapArray', config: { path: 'orders', operations: [
        { id: 'mul', type: 'Multiply', config: { path: 'price', value: 2 } },
      ] } },
      // Write reduced sum to a separate path without losing array content
      { id: 'sum', type: 'ReduceArray', config: { path: 'orders', by: 'price', op: 'sum', writeResultTo: 'sumPrice' } },
    ];
    const result = applyPipeline(input, ops as any);
    expect(result).toEqual({ orders: [{ price: 400 }, { price: 300 }], sumPrice: 700 });
  });
});
