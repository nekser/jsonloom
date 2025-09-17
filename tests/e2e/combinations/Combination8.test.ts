import { applyPipeline } from '@/tests/helpers/runner';

describe('Combination 8: NormalizeKeyCase → StringReplace → PickPaths', () => {
  it('normalizes keys, replaces string, and picks paths', () => {
    const input = { UserName: 'Alice', UserEmail: 'alice@test.com' } as any;
    const ops = [
      { id: 'norm', type: 'NormalizeKeyCase', config: { path: '.', mode: 'camel' } },
      { id: 'replace', type: 'StringReplace', config: { path: 'userEmail', search: 'alice', replace: 'bob' } },
      { id: 'pick', type: 'PickPaths', config: { paths: ['userName', 'userEmail'] } },
    ];
    const result = applyPipeline(input, ops as any);
    expect(result).toEqual({ userName: 'Alice', userEmail: 'bob@test.com' });
  });
});
