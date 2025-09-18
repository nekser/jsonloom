import { applyPipeline } from '@/tests/helpers/runner';

// Rewritten: use writeResultTo instead of SetVariable for re-use
describe('Combination 3: Reuse extracted value via writeResultTo', () => {
  it('extracts name once and reuses it', () => {
    const input = { user: { name: 'Alice', age: 30 } };
    const ops = [
      { id: 'extractName', type: 'ExtractPath', config: { path: 'user.name', writeResultTo: '_internal.username' } },
      { id: 'greet', type: 'SetPath', config: { path: 'greeting', value: 'Hello, ${_internal.username}' } },
      { id: 'copy', type: 'SetPath', config: { path: 'copiedName', value: '${_internal.username}' } },
    ];
    const result = applyPipeline(input, ops as any);
    expect(result).toEqual({ user: { name: 'Alice', age: 30 }, _internal: { username: 'Alice' }, greeting: 'Hello, Alice', copiedName: 'Alice' });
  });
});
