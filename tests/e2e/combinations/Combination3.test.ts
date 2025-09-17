import { applyPipeline } from '@/tests/helpers/runner';

// Using SetVariable + SetPath with ${vars.name} to emulate GetVariable

describe('Combination 3: Variables (Set + Get multiple times)', () => {
  it('sets variable and uses it multiple times', () => {
    const input = { user: { name: 'Alice', age: 30 } };
    const ops = [
      { id: 'setVar', type: 'SetVariable', config: { name: 'username', op: { id: 'pick', type: 'ExtractPath', config: { path: 'user.name' } } } },
      { id: 'greet', type: 'SetPath', config: { path: 'greeting', value: 'Hello, ${vars.username}' } },
      { id: 'copy', type: 'SetPath', config: { path: 'copiedName', value: '${vars.username}' } },
    ];
    const result = applyPipeline(input, ops as any);
    expect(result).toEqual({ user: { name: 'Alice', age: 30 }, greeting: 'Hello, Alice', copiedName: 'Alice' });
  });
});
