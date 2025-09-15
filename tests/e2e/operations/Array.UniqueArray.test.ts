import { applyOperation } from '@/tests/helpers/runner';

describe('UniqueArray', () => {
  it('removes duplicate primitive values', () => {
    const input = { vals: [1,2,2,3,1] };
    const op = { type: 'UniqueArray' as const, config: { path: 'vals' } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ vals: [1,2,3] });
  });
});
