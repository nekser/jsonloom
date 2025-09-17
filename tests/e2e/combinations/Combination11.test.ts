import { applyPipeline } from '@/tests/helpers/runner';

// Stress test with 8 chained operations

describe('Combination 11: Stress Test (7–8 operations chained)', () => {
  it('runs a long pipeline over orders', () => {
    const input = {
      orders: [
        { id: 1, price: 50, status: 'pending' },
        { id: 2, price: 200, status: 'done' },
        { id: 3, price: 150, status: 'done' },
        { id: 4, price: 90, status: 'pending' },
      ],
    } as any;

    const ops = [
      // 1. FilterArray → keep only orders with price > 100
      { id: 'filter', type: 'FilterArray', config: { path: 'orders', key: 'price', operator: 'gt', value: 100 } },
      // 2. MapArray → multiply each price by 2
      { id: 'map', type: 'MapArray', config: { path: 'orders', operations: [
        { id: 'mul', type: 'Multiply', config: { path: 'price', value: 2 } },
      ] } },
      // 3. Sum → totalRevenue
      { id: 'sumPrices', type: 'ReduceArray', config: { path: 'orders', by: 'price', op: 'sum' } },
      { id: 'writeTotal', type: 'SetPath', config: { path: 'totalRevenue', value: '${root.orders}' } },
      // 4. SetVariable("revenue", totalRevenue)
      { id: 'setVar', type: 'SetVariable', config: { name: 'revenue', op: { id: 'pickTotal', type: 'ExtractPath', config: { path: 'totalRevenue' } } } },
      // 5. GetVariable("revenue") → attach as "reportedRevenue"
      { id: 'copyVar', type: 'SetPath', config: { path: 'reportedRevenue', value: '${vars.revenue}' } },
      // 6. If totalRevenue > 500 → highRevenue true else false
      { id: 'ifRevenue', type: 'If', config: { when: { path: 'totalRevenue', op: 'gt', value: 500 }, then: [
        { id: 'setTrue', type: 'MergeAtPath', config: { path: '.', source: 'path', sourcePath: '', strategy: 'shallow' } },
        { id: 'setTrueVal', type: 'SetPath', config: { path: 'highRevenue', value: true } },
      ], else: [
        { id: 'setFalse', type: 'SetPath', config: { path: 'highRevenue', value: false } },
      ] } },
      // 7. TemplateInterpolate "Revenue: {{reportedRevenue}}" → message
      { id: 'msg', type: 'TemplateInterpolate', config: { path: 'message', template: 'Revenue: ${reportedRevenue}' } },
      // 8. FlattenObject (final cleanup) — no-op here but ensures chaining works
      { id: 'flatten', type: 'FlattenObject', config: { path: '.' } },
    ];

    const result = applyPipeline(input, ops as any);
    expect(result).toEqual({
      orders: [
        { id: 2, price: 400, status: 'done' },
        { id: 3, price: 300, status: 'done' },
      ],
      totalRevenue: 700,
      reportedRevenue: 700,
      highRevenue: true,
      message: 'Revenue: 700',
    });
  });
});
