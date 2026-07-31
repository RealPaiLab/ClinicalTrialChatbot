import { describe, expect, it } from 'vitest';
import { PANEL_STRINGS } from '@/constants/i18n';
import { LANGUAGES, LanguageCode } from '@/constants/language';

describe('PANEL_STRINGS', () => {
  const codes = Object.values(LanguageCode);
  const englishKeys = Object.keys(PANEL_STRINGS[LanguageCode.En]).sort();

  it.each(codes)('%s defines every key with a non-empty value', (code) => {
    const strings = PANEL_STRINGS[code];
    expect(Object.keys(strings).sort()).toEqual(englishKeys);
    expect(Object.values(strings).every((value) => value.trim().length > 0)).toBe(true);
  });

  it('gives every language its own copy, catching a locale pasted over another', () => {
    // `as const` already proves no locale equals English; this catches two
    // non-English locales sharing a block by accident.
    const phrases = codes.map((code) => PANEL_STRINGS[code].whoCanJoin as string);
    expect(new Set(phrases).size).toBe(codes.length);
  });

  it('offers a tile for every language except English', () => {
    expect(LANGUAGES.map((option) => option.code)).toEqual(
      codes.filter((code) => code !== LanguageCode.En)
    );
  });

  it('gives each tile a distinct flag and endonym', () => {
    expect(new Set(LANGUAGES.map((o) => o.flag)).size).toBe(LANGUAGES.length);
    expect(new Set(LANGUAGES.map((o) => o.endonym)).size).toBe(LANGUAGES.length);
  });
});
