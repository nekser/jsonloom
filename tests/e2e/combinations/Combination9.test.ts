import { applyPipeline } from '@/tests/helpers/runner';

describe('Combination 9: CountArray → Clamp → TemplateInterpolate', () => {
  it('counts, clamps, and interpolates', () => {
    const input = { items: [1,2,3,4,5,6,7,8] } as any;
    const ops = [
      { id: 'count', type: 'CountArray', config: { path: 'items' } },
      { id: 'clamp', type: 'Clamp', config: { path: 'items', min: 0, max: 5 } },
      { id: 'msg', type: 'TemplateInterpolate', config: { path: 'message', template: 'Clamped count: {{items}}' } },
      { id: 'rename', type: 'RenameKey', config: { from: 'items', to: 'count' } },
    ];
    const result = applyPipeline(input, ops as any);
    expect(result).toEqual({ count: 5, message: 'Clamped count: 5' });
  });
});
