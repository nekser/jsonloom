import { applyOperation } from '@/tests/helpers/runner';

describe('TemplateInterpolate', () => {
  it('interpolates values with literal mode for missing placeholders', () => {
    const input = { user: { first: 'Ada', last: 'Lovelace' } };
    const op = { type: 'TemplateInterpolate' as const, config: { path: 'full', template: 'Name: ${user.first} ${user.last} / ${missing}' } };
    const result = applyOperation(input, op);
    // missing placeholder stays literal ${missing}
    expect(result).toEqual({ user: { first: 'Ada', last: 'Lovelace' }, full: 'Name: Ada Lovelace / ${missing}' });
  });
});
