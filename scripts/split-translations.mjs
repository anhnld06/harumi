import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const srcPath = path.join(root, 'lib/i18n/translations.ts');
const s = fs.readFileSync(srcPath, 'utf8');

function extractLocale(key) {
  const re = new RegExp(`\\b${key}:\\s*\\{`);
  const m = s.match(re);
  if (!m) throw new Error(`Missing locale block: ${key}`);
  let i = m.index + m[0].length - 1;
  let depth = 0;
  const start = i;
  for (; i < s.length; i++) {
    const c = s[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return s.slice(start + 1, i).trim();
    }
  }
  throw new Error(`Unbalanced braces for ${key}`);
}

const types = `/** Flat message map for one locale (shared across bundles). */
export type LocaleMessages = Record<string, string>;
`;

const localesDir = path.join(root, 'lib/i18n/locales');
fs.mkdirSync(localesDir, { recursive: true });
fs.writeFileSync(path.join(localesDir, 'types.ts'), types);

for (const loc of ['en', 'ja', 'vi']) {
  const inner = extractLocale(loc);
  const body = inner
    .split('\n')
    .map((line) => (line.length ? `  ${line}` : line))
    .join('\n');
  const out = `import type { LocaleMessages } from './types';

export const ${loc}Messages: LocaleMessages = {
${body}
};
`;
  fs.writeFileSync(path.join(localesDir, `${loc}.ts`), out);
}

const index = `import type { Locale } from '../locale-types';
import type { LocaleMessages } from './types';
import { enMessages } from './en';
import { jaMessages } from './ja';
import { viMessages } from './vi';

export const translationsByLocale: Record<Locale, LocaleMessages> = {
  en: enMessages,
  ja: jaMessages,
  vi: viMessages,
};
`;
fs.writeFileSync(path.join(localesDir, 'index.ts'), index);

console.log('split-translations: wrote lib/i18n/locales/*.ts');
