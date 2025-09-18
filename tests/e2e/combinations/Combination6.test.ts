import { applyPipeline } from '@/tests/helpers/runner';

describe('Combination 6: ParseDate → DateAdd → DateDiff', () => {
  it('parses, adds, and diffs dates', () => {
    const input = { start: '2023-01-01', end: '2023-01-10' } as any;
    const ops = [
      { id: 'parse', type: 'ParseDate', config: { path: 'start', format: 'yyyy-mm-dd' } },
      { id: 'add', type: 'DateAdd', config: { path: 'start', unit: 'days', amount: 5 } },
      { id: 'diff', type: 'DateDiff', config: { startPath: 'start', endPath: 'end', unit: 'days' } },
    ];
    const result = applyPipeline(input, ops as any);
    expect(result).toEqual({ start: '2023-01-01', end: '2023-01-10', end_diff_days: 4 });
  });
});
