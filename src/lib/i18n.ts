import en from '../i18n/en.json';
import ur from '../i18n/ur.json';

export type Language = 'en' | 'ur';

const translations: Record<Language, Record<string, Record<string, string>>> = {
  en: en as any,
  ur: ur as any,
};

let currentLanguage: Language = 'en';

const rtlLanguages: Language[] = ['ur'];

export function setLanguage(lang: Language): void {
  currentLanguage = lang;
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL() ? 'rtl' : 'ltr';
  }
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function isRTL(): boolean {
  return rtlLanguages.includes(currentLanguage);
}

export function t(key: string, fallback?: string): string {
  const keys = key.split('.');
  let result: any = translations[currentLanguage];
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      return fallback ?? key;
    }
  }
  return typeof result === 'string' ? result : (fallback ?? key);
}

export function getTranslations(lang: Language): Record<string, any> {
  return translations[lang] ?? translations.en;
}

export const supportedLanguages: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
];
