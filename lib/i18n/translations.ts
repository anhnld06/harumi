export type { Locale } from './locale-types';
export { locales } from './locale-types';

import { translationsByLocale } from './locales';

/** All UI strings keyed by locale (split under `locales/`). */
export const translations = translationsByLocale;

export type TranslationKey = keyof typeof import('./locales/en').enMessages;
