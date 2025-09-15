import { applyOperation } from '@/tests/helpers/runner';

describe('If', () => {
  it('then branch adds 10 when price > 100', () => {
    const input = { price: 120 };
    const op = {
      type: 'If' as const,
      config: {
        when: { path: 'price', op: 'gt', value: 100 },
        then: [{ id: 't1', type: 'Add', config: { path: 'price', value: 10 } }],
        else: [{ id: 'e1', type: 'Add', config: { path: 'price', value: -10 } }],
      },
    };
    const result = applyOperation(input, op);
    expect(result).toEqual({ price: 130 });
  });
});
