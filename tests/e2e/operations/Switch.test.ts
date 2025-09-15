import { applyOperation } from '@/tests/helpers/runner';
import { getAllVars, resetVarContext } from '@/src/operations/varContext';

describe('Switch', () => {
  it('sets variable flag depending on status', () => {
    resetVarContext();
    const input = { status: 'pending' };
    const op = {
      type: 'Switch' as const,
      config: {
        path: 'status',
        cases: [
          { value: 'pending', ops: [{ id: 'setP', type: 'SetVariable', config: { name: 'flag', op: { id: 'extract', type: 'ExtractPath', config: { path: 'status' } } } }] },
          { value: 'done', ops: [{ id: 'setD', type: 'SetVariable', config: { name: 'flag', op: { id: 'extract', type: 'ExtractPath', config: { path: 'status' } } } }] },
        ],
      },
    } as const;
    applyOperation(input, op);
    // Note: Current API doesn't support a literal-only op to compute 'P', so we store the status value itself
    expect(getAllVars()).toEqual({ flag: 'pending' });
  });
});
