import { applyPipeline } from '@/tests/helpers/runner';

describe('Combination 6: ParseDate → DateAdd → DateDiff', () => {
  it('parses, adds, and diffs dates', () => {
    const input = { start: '2023-01-01', end: '2023-01-10' } as any;
    const ops = [
      { id: 'parse', type: 'ParseDate', config: { path: 'start' } },
      { id: 'add', type: 'DateAdd', config: { path: 'newDate', sourcePath: 'start', unit: 'day', amount: 5 } },
      { id: 'diff', type: 'DateDiff', config: { path: 'diff', startPath: 'newDate', endPath: 'end', unit: 'day' } },
    ];
    const result = applyPipeline(input, ops as any);
    expect(result).toEqual({ start: '2023-01-01', end: '2023-01-10', newDate: '2023-01-06', diff: -4 });
  });
});
