import { applyPipeline } from '@/tests/helpers/runner';

describe('Combination 5: Switch → writeResultTo propagation', () => {
  it('stores flag via writeResultTo and reuses it', () => {
    const input = { status: 'done' } as any;
    const ops = [
      { id: 'sw', type: 'Switch', config: { path: 'status', cases: [
        { value: 'pending', ops: [ { id: 'flagP', type: 'SetPath', config: { path: '_internal.flag', value: 'P' } } ] },
        { value: 'done',    ops: [ { id: 'flagD', type: 'SetPath', config: { path: '_internal.flag', value: 'D' } } ] },
      ] } },
      { id: 'copy', type: 'SetPath', config: { path: 'copiedFlag', value: '${_internal.flag}' } },
      { id: 'msg', type: 'TemplateInterpolate', config: { path: 'message', template: 'Status flag is ${copiedFlag}' } },
    ];
    const result = applyPipeline(input, ops as any);
    expect(result).toEqual({ status: 'done', _internal: { flag: 'D' }, copiedFlag: 'D', message: 'Status flag is D' });
  });
});
