import { applyPipeline } from '@/tests/helpers/runner';

describe('Combination 1: Math + Array + String', () => {
  it('sums numbers, multiplies, and interpolates message', () => {
    const input = { numbers: [1, 2, 3] };
    const ops = [
      { id: 'sum', type: 'Sum', config: { path: 'numbers' } },
      { id: 'mul', type: 'Multiply', config: { path: 'numbers', value: 2 } },
  { id: 'msg', type: 'TemplateInterpolate', config: { path: 'message', template: 'Result is {{numbers}}' } },
    ];
    const result = applyPipeline(input, ops as any);
    expect(result).toEqual({ numbers: 12, message: 'Result is 12' });
  });
});
