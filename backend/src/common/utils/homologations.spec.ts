import { extractHomologationTokens } from './homologations';

describe('extractHomologationTokens', () => {
  it('extracts VW homologation tokens', () => {
    const result = extractHomologationTokens('VW 504.00 / 507.00');
    expect(result.tokens).toContain('504.00');
    expect(result.tokens).toContain('507.00');
    expect(result.tokens).toContain('VW 504.00');
  });

  it('extracts Asian manufacturer and ILSAC tokens', () => {
    const result = extractHomologationTokens('Toyota / Lexus API SP / ILSAC GF-6A');
    expect(result.tokens).toContain('Toyota');
    expect(result.tokens).toContain('Lexus');
    expect(result.tokens).toContain('API SP');
    expect(result.tokens).toContain('ILSAC GF-6A');
    expect(result.tokens).toContain('GF-6A');
  });

  it('extracts Hyundai / Kia and ACEA C2 tokens', () => {
    const result = extractHomologationTokens('Hyundai / Kia ACEA C2 (0W-30)');
    expect(result.tokens).toContain('Hyundai');
    expect(result.tokens).toContain('Kia');
    expect(result.tokens).toContain('ACEA C2');
    expect(result.tokens).toContain('C2');
  });
});
