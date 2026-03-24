/**
 * Generate MP3 via Microsoft Edge online TTS (node-edge-tts).
 * Sources: public/data/ngu-phap-n2.json (vi_du), public/data/tu-vung-n2.json (hiragana).
 * Output: public/audio/ngu-phap-n2/gp-{stt}-{idx}.mp3, public/audio/tu-vung-n2/v-{stt}.mp3
 *
 * Run from repo root: npx tsx scripts/generate-edge-tts-audio.ts
 * Options: --grammar-only | --vocab-only | --limit=N (cap total new synths) | --force (regenerate existing)
 */

import { mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { EdgeTTS } from 'node-edge-tts';

const ROOT = process.cwd();
const DATA_GRAMMAR = join(ROOT, 'public/data/ngu-phap-n2.json');
const DATA_VOCAB = join(ROOT, 'public/data/tu-vung-n2.json');
const OUT_GRAMMAR = join(ROOT, 'public/audio/ngu-phap-n2');
const OUT_VOCAB = join(ROOT, 'public/audio/tu-vung-n2');

const VOICE = 'ja-JP-NanamiNeural';
const LANG = 'ja-JP';
const DELAY_MS = 400;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs() {
  const args = process.argv.slice(2);
  let grammarOnly = false;
  let vocabOnly = false;
  let limit: number | undefined;
  let force = false;
  for (const a of args) {
    if (a === '--grammar-only') grammarOnly = true;
    else if (a === '--vocab-only') vocabOnly = true;
    else if (a === '--force') force = true;
    else if (a.startsWith('--limit=')) limit = Math.max(0, parseInt(a.slice('--limit='.length), 10));
  }
  if (grammarOnly && vocabOnly) {
    console.error('Use only one of --grammar-only or --vocab-only');
    process.exit(1);
  }
  return { grammarOnly, vocabOnly, limit, force };
}

type GrammarJson = {
  patterns: Array<{ stt: number; vi_du: string[] }>;
};

type VocabJson = {
  vocabulary: Array<{ stt: number; hiragana: string }>;
};

async function main() {
  const { grammarOnly, vocabOnly, limit, force } = parseArgs();

  mkdirSync(OUT_GRAMMAR, { recursive: true });
  mkdirSync(OUT_VOCAB, { recursive: true });

  const tts = new EdgeTTS({
    voice: VOICE,
    lang: LANG,
    outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
    timeout: 120_000,
  });

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  const trySynth = async (text: string, outPath: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!force && existsSync(outPath)) {
      skipped++;
      return;
    }
    if (limit !== undefined && generated >= limit) return;
    try {
      await tts.ttsPromise(trimmed, outPath);
      generated++;
      const rel = outPath.slice(ROOT.length).replace(/^[/\\]/, '');
      process.stdout.write(`OK ${rel}\n`);
    } catch (e) {
      failed++;
      console.error(`FAIL ${outPath}:`, e);
    }
    await sleep(DELAY_MS);
  };

  if (!vocabOnly) {
    const raw = readFileSync(DATA_GRAMMAR, 'utf8');
    const data = JSON.parse(raw) as GrammarJson;
    for (const p of data.patterns) {
      const arr = p.vi_du ?? [];
      for (let i = 0; i < arr.length; i++) {
        const name = `gp-${String(p.stt).padStart(3, '0')}-${i}.mp3`;
        await trySynth(arr[i], join(OUT_GRAMMAR, name));
        if (limit !== undefined && generated >= limit) break;
      }
      if (limit !== undefined && generated >= limit) break;
    }
  }

  if (!grammarOnly) {
    const raw = readFileSync(DATA_VOCAB, 'utf8');
    const data = JSON.parse(raw) as VocabJson;
    for (const v of data.vocabulary) {
      const name = `v-${String(v.stt).padStart(4, '0')}.mp3`;
      await trySynth(v.hiragana ?? '', join(OUT_VOCAB, name));
      if (limit !== undefined && generated >= limit) break;
    }
  }

  console.log(
    `\nDone. generated=${generated} skipped=${skipped} failed=${failed} voice=${VOICE}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
