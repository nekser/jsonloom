import { applyOperation } from '@/tests/helpers/runner';

describe('StringCase', () => {
  it('uppercases nested values and coerces numbers when flag set', () => {
    const input = { data: { a: 'hi', b: 42 } } as any;
    const op = { type: 'StringCase' as const, config: { path: 'data', mode: 'uppercase', coerceNonString: true } };
    const result = applyOperation(input, op);
    expect(result).toEqual({ data: { a: 'HI', b: '42' } });
  });
});
