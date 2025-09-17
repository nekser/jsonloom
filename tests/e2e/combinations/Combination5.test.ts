import { applyPipeline } from '@/tests/helpers/runner';

describe('Combination 5: Switch → SetVariable → GetVariable', () => {
  it('uses Switch then variables', () => {
    const input = { status: 'done' } as any;
    const ops = [
      { id: 'sw', type: 'Switch', config: { path: 'status', cases: [
        { value: 'pending', ops: [ { id: 'setPending', type: 'SetVariable', config: { name: 'flag', op: { id: 'setP', type: 'SetPath', config: { path: 'flag', value: 'P' } } } } ] },
        { value: 'done',    ops: [ { id: 'setDone',    type: 'SetVariable', config: { name: 'flag', op: { id: 'setD', type: 'SetPath', config: { path: 'flag', value: 'D' } } } } ] },
      ] } },
      { id: 'copy', type: 'SetPath', config: { path: 'copiedFlag', value: '${vars.flag.flag}' } },
      { id: 'msg', type: 'TemplateInterpolate', config: { path: 'message', template: 'Status flag is ${copiedFlag}' } },
    ];
    const result = applyPipeline(input, ops as any);
    expect(result).toEqual({ status: 'done', copiedFlag: 'D', message: 'Status flag is D' });
  });
});
