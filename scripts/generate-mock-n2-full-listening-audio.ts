/**
 * Reads public/data/mock-tests-n2-full.json and synthesizes each 聴解 passage
 * transcript to MP3 (Edge TTS), matching audioUrl paths in JSON
 * (e.g. /audio/mock-tests-n2-full/L01.mp3 → public/audio/mock-tests-n2-full/L01.mp3).
 *
 * Run: npm run audio:mock-n2-full-listening
 * Options: --force  |  --limit=N
 */

import { mkdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { EdgeTTS } from 'node-edge-tts';

const ROOT = process.cwd();
const DATA = join(ROOT, 'public/data/mock-tests-n2-full.json');
const OUT_DIR = join(ROOT, 'public/audio/mock-tests-n2-full');

const VOICE = 'ja-JP-NanamiNeural';
const LANG = 'ja-JP';
const DELAY_MS = 450;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs() {
  let force = false;
  let limit: number | undefined;
  for (const a of process.argv.slice(2)) {
    if (a === '--force') force = true;
    else if (a.startsWith('--limit=')) limit = Math.max(0, parseInt(a.slice('--limit='.length), 10));
  }
  return { force, limit };
}

type Passage = { title?: string; audioUrl?: string; transcript?: string | null };

async function main() {
  const { force, limit } = parseArgs();
  if (!existsSync(DATA)) {
    console.error('Missing', DATA, '— run: npx tsx scripts/generate-mock-tests-n2-full-json.ts');
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(DATA, 'utf-8')) as {
    tests?: Array<{ sections?: Array<{ kind?: string; passages?: Passage[] }> }>;
  };
  const test = raw.tests?.[0];
  const listenSec = test?.sections?.find((s) => s.kind === 'LISTENING');
  const passages = listenSec?.passages ?? [];

  mkdirSync(OUT_DIR, { recursive: true });

  const tts = new EdgeTTS({
    voice: VOICE,
    lang: LANG,
    outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
    timeout: 120_000,
  });

  let done = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < passages.length; i++) {
    if (limit !== undefined && done >= limit) break;
    const p = passages[i];
    const url = p.audioUrl?.trim();
    const text = (p.transcript ?? '').trim();
    if (!url || !text) {
      console.warn('Skip passage', i + 1, '(missing audioUrl or transcript)');
      continue;
    }
    const m = url.match(/\/audio\/mock-tests-n2-full\/([^/]+\.mp3)$/i);
    if (!m) {
      console.warn('Skip bad audioUrl:', url);
      continue;
    }
    const fileName = m[1];
    const outPath = join(OUT_DIR, fileName);
    if (!force && existsSync(outPath)) {
      skipped++;
      continue;
    }
    try {
      await tts.ttsPromise(text, outPath);
      done++;
      console.log('OK', outPath.replace(ROOT, '').replace(/^[/\\]/, ''));
    } catch (e) {
      failed++;
      console.error('FAIL', outPath, e);
    }
    await sleep(DELAY_MS);
  }
  console.log(`\nDone. synthesized=${done} skipped=${skipped} failed=${failed} voice=${VOICE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
