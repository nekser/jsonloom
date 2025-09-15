import { applyOperation } from '@/tests/helpers/runner';

describe('ValidateJSON', () => {
  it('passes with valid data against schema', () => {
    const input = { user: { id: 1, name: 'Alice' } };
    const op = { type: 'ValidateJSON' as const, config: { path: 'user', schema: { type: 'object', properties: { id: { type: 'number' } }, required: ['id'], additionalProperties: true } } };
    expect(() => applyOperation(input, op)).not.toThrow();
  });

  it('throws on invalid data when failOnError true', () => {
    const input = { user: { id: 'oops' } } as any;
    const op = { type: 'ValidateJSON' as const, config: { path: 'user', schema: { type: 'object', properties: { id: { type: 'number' } }, required: ['id'] }, failOnError: true } };
    expect(() => applyOperation(input, op)).toThrow(/id/);
  });
});
