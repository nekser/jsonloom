import { applyOperation } from '@/tests/helpers/runner';

describe('MapFields', () => {
  it('maps fields for each object in array', () => {
    const input = { rows: [{ a: 1, b: 2 }, { a: 3, b: 4 }] } as any;
    const op = { type: 'MapArray' as const, config: { path: 'rows', mapping: { x: 'a', y: 'b' } } } as any; // MapFields module exports type MapArray intentionally
    const result = applyOperation(input, op);
    expect(result).toEqual({ rows: [{ x: 1, y: 2 }, { x: 3, y: 4 }] });
  });
});
