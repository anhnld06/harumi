/**
 * Katakana → Hepburn-style romaji (lowercase, ASCII).
 * Used for the "reading" column next to name katakana.
 */

const SMALL = new Set(['ァ', 'ィ', 'ゥ', 'ェ', 'ォ', 'ャ', 'ュ', 'ョ', 'ヮ', 'ッ']);

/** Two-kana combinations (longest match first) */
const BIGRAM: Record<string, string> = {
  キャ: 'kya',
  キュ: 'kyu',
  キョ: 'kyo',
  ギャ: 'gya',
  ギュ: 'gyu',
  ギョ: 'gyo',
  シャ: 'sha',
  シュ: 'shu',
  ショ: 'sho',
  ジャ: 'ja',
  ジュ: 'ju',
  ジョ: 'jo',
  チャ: 'cha',
  チュ: 'chu',
  チョ: 'cho',
  ニャ: 'nya',
  ニュ: 'nyu',
  ニョ: 'nyo',
  ヒャ: 'hya',
  ヒュ: 'hyu',
  ヒョ: 'hyo',
  ビャ: 'bya',
  ビュ: 'byu',
  ビョ: 'byo',
  ピャ: 'pya',
  ピュ: 'pyu',
  ピョ: 'pyo',
  ミャ: 'mya',
  ミュ: 'myu',
  ミョ: 'myo',
  リャ: 'rya',
  リュ: 'ryu',
  リョ: 'ryo',
  ティ: 'ti',
  ディ: 'di',
  トゥ: 'tu',
  ドゥ: 'du',
  ファ: 'fa',
  フィ: 'fi',
  フェ: 'fe',
  フォ: 'fo',
  フュ: 'fyu',
  ヴァ: 'va',
  ヴィ: 'vi',
  ヴェ: 've',
  ヴォ: 'vo',
  ヴュ: 'vyu',
  ウィ: 'wi',
  ウェ: 'we',
  ウォ: 'wo',
  シェ: 'she',
  ジェ: 'je',
  チェ: 'che',
  ツァ: 'tsa',
  ツィ: 'tsi',
  ツェ: 'tse',
  ツォ: 'tso',
  イェン: 'yen',
  イェ: 'ye',
};

const SINGLE: Record<string, string> = {
  ア: 'a',
  イ: 'i',
  ウ: 'u',
  エ: 'e',
  オ: 'o',
  ァ: 'a',
  ィ: 'i',
  ゥ: 'u',
  ェ: 'e',
  ォ: 'o',
  カ: 'ka',
  キ: 'ki',
  ク: 'ku',
  ケ: 'ke',
  コ: 'ko',
  ガ: 'ga',
  ギ: 'gi',
  グ: 'gu',
  ゲ: 'ge',
  ゴ: 'go',
  サ: 'sa',
  シ: 'shi',
  ス: 'su',
  セ: 'se',
  ソ: 'so',
  ザ: 'za',
  ジ: 'ji',
  ズ: 'zu',
  ゼ: 'ze',
  ゾ: 'zo',
  タ: 'ta',
  チ: 'chi',
  ツ: 'tsu',
  テ: 'te',
  ト: 'to',
  ダ: 'da',
  ヂ: 'ji',
  ヅ: 'zu',
  デ: 'de',
  ド: 'do',
  ナ: 'na',
  ニ: 'ni',
  ヌ: 'nu',
  ネ: 'ne',
  ノ: 'no',
  ハ: 'ha',
  ヒ: 'hi',
  フ: 'fu',
  ヘ: 'he',
  ホ: 'ho',
  バ: 'ba',
  ビ: 'bi',
  ブ: 'bu',
  ベ: 'be',
  ボ: 'bo',
  パ: 'pa',
  ピ: 'pi',
  プ: 'pu',
  ペ: 'pe',
  ポ: 'po',
  マ: 'ma',
  ミ: 'mi',
  ム: 'mu',
  メ: 'me',
  モ: 'mo',
  ヤ: 'ya',
  ユ: 'yu',
  ヨ: 'yo',
  ラ: 'ra',
  リ: 'ri',
  ル: 'ru',
  レ: 're',
  ロ: 'ro',
  ワ: 'wa',
  ヲ: 'wo',
  ン: 'n',
  ヴ: 'vu',
  ヵ: 'ka',
  ヶ: 'ke',
  '\u30FB': ' ',
};

const BIGRAM_KEYS = Object.keys(BIGRAM).sort((a, b) => b.length - a.length);

function vowelOfRomaji(s: string): string | null {
  const m = s.match(/(a|i|u|e|o)$/);
  return m ? m[1]! : null;
}

/**
 * Convert katakana (and middle dot ・) to lowercase Hepburn romaji.
 */
export function katakanaToRomaji(k: string): string {
  if (!k || k === '—') return '';

  const out: string[] = [];
  let i = 0;
  let pendingSokuon = false;

  while (i < k.length) {
    const ch = k[i]!;

    if (ch === '\u30FB') {
      out.push(' ');
      i += 1;
      continue;
    }

    if (ch === 'ー') {
      const prev = out[out.length - 1];
      if (prev) {
        const v = vowelOfRomaji(prev);
        if (v) out.push(v);
      }
      i += 1;
      continue;
    }

    if (ch === 'ッ') {
      pendingSokuon = true;
      i += 1;
      continue;
    }

    let chunk: string | undefined;
    let len = 1;

    const restFromI = k.slice(i);
    for (const key of BIGRAM_KEYS) {
      if (restFromI.startsWith(key)) {
        chunk = BIGRAM[key];
        len = key.length;
        break;
      }
    }

    if (!chunk && i + 1 < k.length && SMALL.has(k[i + 1]!)) {
      const base = SINGLE[ch];
      const sm = k[i + 1]!;
      if (base && (sm === 'ャ' || sm === 'ュ' || sm === 'ョ')) {
        const head = base.slice(0, -1);
        const last = base.slice(-1);
        const yaMap: Record<string, string> = { ャ: 'a', ュ: 'u', ョ: 'o' };
        if (last === 'i' && yaMap[sm]) {
          chunk = head + (sm === 'ャ' ? 'ya' : sm === 'ュ' ? 'yu' : 'yo');
          len = 2;
        }
      }
    }

    if (!chunk) {
      chunk = SINGLE[ch];
      len = 1;
    }

    if (!chunk) {
      i += 1;
      continue;
    }

    if (pendingSokuon && chunk.length > 0) {
      const first = chunk[0]!;
      out.push(first + chunk);
      pendingSokuon = false;
    } else {
      out.push(chunk);
      pendingSokuon = false;
    }

    i += len;
  }

  return out.join('').replace(/\s+/g, ' ').trim();
}
