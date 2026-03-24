/**
 * Transform tu-vung-n2.json: nghia → nghia_viet + nghia_anh
 * Uses Jisho API to fetch English meanings for each word
 */
import * as fs from 'fs';
import * as path from 'path';

const DATA_FILE = path.join(process.cwd(), 'public', 'data', 'tu-vung-n2.json');
const DELAY_MS = 600; // Rate limit for Jisho API

async function fetchEnglishFromJisho(kanji: string): Promise<string> {
  try {
    const url = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(kanji)}`;
    const res = await fetch(url);
    const json = await res.json();
    const data = json?.data?.[0];
    if (!data?.senses?.[0]?.english_definitions) {
      return '';
    }
    const defs = data.senses.flatMap((s: { english_definitions?: string[] }) => s.english_definitions ?? []);
    return defs.slice(0, 3).join(', ') || '';
  } catch {
    return '';
  }
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  const data = JSON.parse(raw) as {
    title: string;
    total: number;
    vocabulary: Array<{ stt: number; hiragana: string; kanji: string; am_han_viet: string; nghia?: string; nghia_viet?: string; nghia_anh?: string }>;
  };
  const vocab = data.vocabulary ?? [];
  console.log(`Transforming ${vocab.length} entries...`);

  for (let i = 0; i < vocab.length; i++) {
    const v = vocab[i];
    const nghiaViet = v.nghia_viet ?? v.nghia ?? '';
    let nghiaAnh = v.nghia_anh ?? '';

    if (!nghiaAnh && v.kanji) {
      nghiaAnh = await fetchEnglishFromJisho(v.kanji);
      await sleep(DELAY_MS);
    }

    const obj = v as unknown as Record<string, unknown>;
    obj.nghia_viet = nghiaViet;
    obj.nghia_anh = nghiaAnh || nghiaViet; // fallback to Vietnamese if no English
    delete obj.nghia;

    if ((i + 1) % 50 === 0) {
      console.log(`  Progress: ${i + 1}/${vocab.length}`);
    }
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4), 'utf-8');
  console.log('Done. tu-vung-n2.json updated.');
}

main().catch(console.error);
