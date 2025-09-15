import { applyOperation } from '@/tests/helpers/runner';

describe('NormalizeKeyCase', () => {
  it('converts keys to snake case', () => {
    const input = { someKey: 1, nestedValue: { innerKey: 2 } } as any;
    const op = { type: 'NormalizeKeyCase' as const, config: { mode: 'snake' } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ some_key: 1, nested_value: { inner_key: 2 } });
  });
});
