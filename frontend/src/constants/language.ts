export const LanguageCode = {
  En: 'en',
  FrCa: 'fr-CA',
  Es: 'es',
  PtBr: 'pt-BR',
  De: 'de',
  It: 'it',
  Hi: 'hi',
  ZhCn: 'zh-CN',
  ZhTw: 'zh-TW',
  Yue: 'yue',
} as const;

export type LanguageCode = (typeof LanguageCode)[keyof typeof LanguageCode];

interface LanguageOption {
  code: LanguageCode;
  flag: string;
  endonym: string;
}

/**
 * The picker's tiles, in grid order. English is absent on purpose: it is the
 * stored text, reached through "See original" rather than as a translation.
 * Each tile pairs a flag with the endonym, since flags name countries not
 * languages.
 */
export const LANGUAGES = [
  { code: LanguageCode.FrCa, flag: '🇨🇦', endonym: 'Français' },
  { code: LanguageCode.Es, flag: '🇪🇸', endonym: 'Español' },
  { code: LanguageCode.PtBr, flag: '🇧🇷', endonym: 'Português' },
  { code: LanguageCode.De, flag: '🇩🇪', endonym: 'Deutsch' },
  { code: LanguageCode.It, flag: '🇮🇹', endonym: 'Italiano' },
  { code: LanguageCode.Hi, flag: '🇮🇳', endonym: 'हिन्दी' },
  { code: LanguageCode.ZhCn, flag: '🇨🇳', endonym: '简体中文' },
  { code: LanguageCode.ZhTw, flag: '🇹🇼', endonym: '繁體中文' },
  { code: LanguageCode.Yue, flag: '🇭🇰', endonym: '粵語' },
] as const satisfies readonly LanguageOption[];

export const TranslationSource = {
  Official: 'official',
  Machine: 'machine',
  Unavailable: 'unavailable',
} as const;

export type TranslationSource = (typeof TranslationSource)[keyof typeof TranslationSource];
