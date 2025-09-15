import { applyOperation } from '@/tests/helpers/runner';

describe('StringReplace', () => {
  it('replaces substring across object tree', () => {
    const input = { a: 'hello world', b: ['world', 1], c: { msg: 'world!' } };
    const op = { type: 'StringReplace' as const, config: { search: 'world', replace: 'there' } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ a: 'hello there', b: ['there', 1], c: { msg: 'there!' } });
  });
});
