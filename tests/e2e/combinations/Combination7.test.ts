import { applyPipeline } from '@/tests/helpers/runner';

describe('Combination 7: FlattenObject → RenameKey → UnflattenObject', () => {
  it('flattens, renames, and unflattens', () => {
    const input = { user: { profile: { full_name: 'Alice' } } } as any;
    const ops = [
      { id: 'flat', type: 'FlattenObject', config: { path: '.' } },
      { id: 'rename', type: 'RenameKey', config: { from: 'user.profile.full_name', to: 'user.profile.name' } },
      { id: 'unflat', type: 'UnflattenObject', config: { path: '.' } },
    ];
    const result = applyPipeline(input, ops as any);
    expect(result).toEqual({ user: { profile: { name: 'Alice' } } });
  });
});
