import { applyOperation } from '@/tests/helpers/runner';

describe('Clamp', () => {
  it('clamps number within range', () => {
    const input = { n: 150 };
    const op = { type: 'Clamp' as const, config: { path: 'n', min: 0, max: 100 } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ n: 100 });
  });
});
