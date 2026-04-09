export type Locale = 'en' | 'ja' | 'vi';

export const locales: { value: Locale; label: string; fullLabel: string }[] = [
  { value: 'en', label: 'US English', fullLabel: 'English' },
  { value: 'ja', label: 'JP 日本語', fullLabel: 'Japanese' },
  { value: 'vi', label: 'VN Tiếng Việt', fullLabel: 'Vietnamese' },
];
