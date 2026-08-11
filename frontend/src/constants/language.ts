export const LanguageCode = {
  En: 'en',
  FrCa: 'fr-CA',
  Es: 'es',
  De: 'de',
  Hi: 'hi',
  ZhCn: 'zh-CN',
  Yue: 'yue',
} as const;

export type LanguageCode = (typeof LanguageCode)[keyof typeof LanguageCode];

interface LanguageOption {
  code: LanguageCode;
  flag: string;
  endonym: string;
}

/**
 * The picker's tiles, in grid order. English leads because it is the language
 * the trial text is stored in, so choosing it needs no translation call. Each
 * tile pairs a flag with the endonym, since flags name countries not languages.
 */
export const LANGUAGES = [
  { code: LanguageCode.En, flag: '🇨🇦', endonym: 'English' },
  { code: LanguageCode.FrCa, flag: '🇫🇷', endonym: 'Français' },
  { code: LanguageCode.Es, flag: '🇪🇸', endonym: 'Español' },
  { code: LanguageCode.De, flag: '🇩🇪', endonym: 'Deutsch' },
  { code: LanguageCode.Hi, flag: '🇮🇳', endonym: 'हिन्दी' },
  { code: LanguageCode.ZhCn, flag: '🇨🇳', endonym: '简体中文' },
  { code: LanguageCode.Yue, flag: '🇭🇰', endonym: '粵語' },
] as const satisfies readonly LanguageOption[];

/** The picker grid: English is offered as a separate opt-out, not a tile. */
export const LANGUAGE_TARGETS = LANGUAGES.filter((option) => option.code !== LanguageCode.En);

export const TranslationSource = {
  Official: 'official',
  Machine: 'machine',
  Unavailable: 'unavailable',
} as const;

export type TranslationSource = (typeof TranslationSource)[keyof typeof TranslationSource];
