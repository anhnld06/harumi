import * as fs from 'fs';
import * as path from 'path';

function katakanaToHiragana(s: string): string {
  return s.replace(/[\u30a0-\u30ff]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0x60)
  );
}

export type ReadingExample = {
  word: string;
  reading: string;
  meaning: string;
};

export type ReadingGroup = {
  label: string;
  examples: ReadingExample[];
};

export type ClassifiedReadings = {
  kunyomi: ReadingGroup[];
  onyomi: ReadingGroup[];
  amHanViet: string | null;
};

function parseReadingEntry(entry: string): ReadingExample | null {
  const trimmed = entry.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) return null;
  const word = parts[0];
  const reading = parts[1];
  const meaning = parts.slice(2).join(' ') || '';
  return { word, reading, meaning };
}

function normalizeForMatch(s: string): string {
  return katakanaToHiragana(s).replace(/[・.\s]/g, '');
}

function findMatchingOnyomi(reading: string, onyomiList: string[]): string | null {
  const readingH = katakanaToHiragana(reading);
  for (const on of onyomiList) {
    const onH = normalizeForMatch(on);
    if (readingH.includes(onH)) return on;
    const onStem = onH.replace(/[っんゅょうょぁぃぅぇぉ]?$/, '');
    if (onStem.length >= 2 && readingH.includes(onStem)) return on;
    if (onH.length >= 2 && readingH.includes(onH.slice(0, 2))) return on;
  }
  return null;
}

function findMatchingKunyomi(reading: string, kunyomiList: string[]): string | null {
  const readingH = katakanaToHiragana(reading);
  for (const kun of kunyomiList) {
    const kunBase = normalizeForMatch(kun).split('.')[0] || kun;
    if (readingH.startsWith(kunBase)) return kun;
  }
  return null;
}

export function getClassifiedReadings(
  character: string,
  onyomi: string | null,
  kunyomi: string | null
): ClassifiedReadings {
  const result: ClassifiedReadings = { kunyomi: [], onyomi: [], amHanViet: null };
  const onList = (onyomi ?? '')
    .split(/[,，、\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const kunList = (kunyomi ?? '')
    .split(/[,，、\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const dataPath = path.join(process.cwd(), 'public', 'data', 'kanji-n2.json');
  if (!fs.existsSync(dataPath)) return result;

  const json = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const kanjiEntry = (json.kanji ?? []).find((k: { kanji: string }) => k.kanji === character);
  if (!kanjiEntry) return result;
  result.amHanViet = kanjiEntry.am_han_viet ?? null;
  if (!kanjiEntry.readings?.length) return result;

  const groupsOn = new Map<string, ReadingExample[]>();
  const groupsKun = new Map<string, ReadingExample[]>();

  for (const entry of kanjiEntry.readings) {
    const ex = parseReadingEntry(entry);
    if (!ex) continue;

    const kunMatch = findMatchingKunyomi(ex.reading, kunList);
    const onMatch = findMatchingOnyomi(ex.reading, onList);

    if (kunMatch) {
      const list = groupsKun.get(kunMatch) ?? [];
      list.push(ex);
      groupsKun.set(kunMatch, list);
    } else if (onMatch) {
      const list = groupsOn.get(onMatch) ?? [];
      list.push(ex);
      groupsOn.set(onMatch, list);
    }
  }

  result.onyomi = Array.from(groupsOn.entries())
    .map(([label, examples]) => ({ label, examples }))
    .sort((a, b) => (a.label < b.label ? -1 : 1));
  result.kunyomi = Array.from(groupsKun.entries())
    .map(([label, examples]) => ({ label, examples }))
    .sort((a, b) => (a.label < b.label ? -1 : 1));

  return result;
}
