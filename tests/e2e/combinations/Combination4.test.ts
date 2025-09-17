import { applyPipeline } from '@/tests/helpers/runner';

describe('Combination 4: If → Math → String', () => {
  it('applies If, Multiply, and TemplateInterpolate', () => {
    const input = { price: 120 } as any;
    const ops = [
      { id: 'if', type: 'If', config: { when: { path: 'price', op: 'gt', value: 100 }, then: [
        { id: 'add', type: 'Add', config: { path: 'price', value: 10 } },
      ], else: [
        { id: 'sub', type: 'Subtract', config: { path: 'price', value: 10 } },
      ] } },
      { id: 'mul', type: 'Multiply', config: { path: 'price', value: 2 } },
      { id: 'msg', type: 'TemplateInterpolate', config: { path: 'message', template: 'Final price: ${price}' } },
    ];
    const result = applyPipeline(input, ops as any);
    expect(result).toEqual({ price: 260, message: 'Final price: 260' });
  });
});
