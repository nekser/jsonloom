import { applyOperation } from '@/tests/helpers/runner';

describe('Base64', () => {
  it('encodes then decodes base64', () => {
    const input = { txt: 'hello' };
    const encOp = { type: 'Base64' as const, config: { path: 'txt', mode: 'encode' } };
    const encoded = applyOperation(input, encOp) as any;
    expect(encoded.txt).toMatch(/^[A-Za-z0-9+/=]+$/);
    const decOp = { type: 'Base64' as const, config: { path: 'txt', mode: 'decode' } };
    const decoded = applyOperation(encoded, decOp) as any;
    expect(decoded).toEqual({ txt: 'hello' });
  });
});
