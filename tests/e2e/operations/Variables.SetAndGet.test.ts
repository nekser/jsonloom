import { applyPipeline } from '@/tests/helpers/runner';
import { getAllVars } from '@/src/operations/varContext';

describe('Variables: SetVariable + GetVariable (emulated)', () => {
  it('stores basePrice and copies it to copiedPrice', () => {
    const input = { price: 100 };
    const ops = [
      { id: 'set', type: 'SetVariable', config: { name: 'basePrice', op: { id: 'pick', type: 'ExtractPath', config: { path: 'price' } } } },
      { id: 'copy', type: 'SetPath', config: { path: 'copiedPrice', value: '${vars.basePrice}' } },
    ];
    const result = applyPipeline(input, ops as any);
    expect(result).toEqual({ price: 100, copiedPrice: 100 });
    expect(getAllVars()).toEqual({ basePrice: 100 });
  });
});
