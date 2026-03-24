/**
 * Fix JSON: use nghia_viet, nghia_anh (remove meaningVi, meaningEn, onyomiVi, nghia)
 */
import * as fs from 'fs';
import * as path from 'path';

const DATA_FILE = path.join(process.cwd(), 'public', 'data', 'tu-vung-n2.json');

interface VocabItem {
  stt: number;
  hiragana: string;
  kanji: string;
  am_han_viet: string;
  nghia?: string;
  nghia_viet?: string;
  nghia_anh?: string;
  meaningVi?: string;
  meaningEn?: string;
  onyomiVi?: string;
}

const raw = fs.readFileSync(DATA_FILE, 'utf-8');
const data = JSON.parse(raw) as { title: string; total: number; vocabulary: VocabItem[] };
const vocab = data.vocabulary ?? [];

for (const v of vocab) {
  const nghiaViet = v.nghia_viet ?? v.meaningVi ?? v.nghia ?? '';
  const nghiaAnh = v.nghia_anh ?? v.meaningEn ?? v.nghia ?? nghiaViet;
  const obj = v as unknown as Record<string, unknown>;
  obj.nghia_viet = nghiaViet;
  obj.nghia_anh = nghiaAnh;
  delete obj.nghia;
  delete obj.meaningVi;
  delete obj.meaningEn;
  delete obj.onyomiVi;
}

fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4), 'utf-8');
console.log('Fixed JSON structure. Using nghia_viet, nghia_anh.');
