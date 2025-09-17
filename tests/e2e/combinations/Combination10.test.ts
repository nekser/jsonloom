import { applyPipeline } from '@/tests/helpers/runner';

describe('Combination 10: SortArray → SliceArray → UniqueArray', () => {
  it('sorts, slices, and uniques', () => {
    const input = { values: [5, 2, 2, 8, 3, 3] } as any;
    const ops = [
      { id: 'sort', type: 'SortArray', config: { path: 'values', direction: 'asc' } },
      { id: 'slice', type: 'SliceArray', config: { path: 'values', start: 0, end: 4 } },
      { id: 'unique', type: 'UniqueArray', config: { path: 'values' } },
    ];
    const result = applyPipeline(input, ops as any);
    expect(result).toEqual({ values: [2,3,5,8] });
  });
});
