import { applyPipeline } from '@/tests/helpers/runner';

describe('Combination 6: ParseDate → DateAdd → DateDiff', () => {
  it('parses, adds, and diffs dates', () => {
    const input = { start: '2023-01-01', end: '2023-01-10' } as any;
    const ops = [
      // Parse original start string (non-destructively) into ISO and stash at _internal.startDate
      { id: 'parse', type: 'ParseDate', config: { path: 'start', format: 'YYYY-MM-DD', writeResultTo: '_internal.startDate' } },
      // Add 5 days to the parsed start date, using the internal parsed value as the source
      { id: 'add', type: 'DateAdd', config: { path: '_internal.startDate', unit: 'days', amount: 5, writeResultTo: '_internal.adjustedStart' } },
      // Diff between adjusted start and end to get remaining days
      { id: 'diff', type: 'DateDiff', config: { startPath: '_internal.adjustedStart', endPath: 'end', unit: 'days', writeResultTo: '_internal.diffDays' } },
    ];
    const result = applyPipeline(input, ops as any);
    expect(result).toEqual({
      start: '2023-01-01',
      end: '2023-01-10',
      _internal: {
        startDate: '2023-01-01T00:00:00.000Z',
        adjustedStart: '2023-01-06T00:00:00.000Z',
        diffDays: 4,
      },
    });
  });
});
