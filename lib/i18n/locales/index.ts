import type { Locale } from '../locale-types';
import type { LocaleMessages } from './types';
import { enMessages } from './en';
import { jaMessages } from './ja';
import { viMessages } from './vi';

export const translationsByLocale: Record<Locale, LocaleMessages> = {
  en: enMessages,
  ja: jaMessages,
  vi: viMessages,
};
