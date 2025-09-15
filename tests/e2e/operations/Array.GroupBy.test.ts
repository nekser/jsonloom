import { applyOperation } from '@/tests/helpers/runner';

describe('GroupBy', () => {
  it('groups objects by key and collects arrays', () => {
    const input = { items: [{ cat: 'a', v:1 }, { cat: 'b', v:2 }, { cat: 'a', v:3 }] };
    const op = { type: 'GroupBy' as const, config: { path: 'items', by: 'cat', collect: 'array' } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ items: { a: [{ cat: 'a', v:1 }, { cat: 'a', v:3 }], b: [{ cat: 'b', v:2 }] } });
  });
});
