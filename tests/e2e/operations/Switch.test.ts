import { applyOperation } from '@/tests/helpers/runner';

describe('Switch', () => {
  it('writes case-derived value using writeResultTo', () => {
    const input = { status: 'pending' };
    const op = {
      type: 'Switch' as const,
      config: {
        path: 'status',
        cases: [
          { value: 'pending', ops: [ { id: 'extractP', type: 'ExtractPath', config: { path: 'status', writeResultTo: '_internal.flag' } } ] },
          { value: 'done', ops: [ { id: 'extractD', type: 'ExtractPath', config: { path: 'status', writeResultTo: '_internal.flag' } } ] },
        ],
      },
    } as const;
    const out = applyOperation(input, op);
    expect(out).toEqual({ status: 'pending', _internal: { flag: 'pending' } });
  });
});
