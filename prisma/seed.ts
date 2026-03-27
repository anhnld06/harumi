import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import Kanji from 'kanji.js';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const DATA_DIR = path.join(process.cwd(), 'public', 'data');

async function main() {
  console.log('Seeding database...');

  // 1. Demo user
  const hashedPassword = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@jlpt.com' },
    update: {},
    create: {
      email: 'demo@jlpt.com',
      name: 'Demo User',
      password: hashedPassword,
    },
  });
  console.log('Created user:', user.email);

  // 2. Vocabulary from tu-vung-n2.json
  const vocabPath = path.join(DATA_DIR, 'tu-vung-n2.json');
  if (!fs.existsSync(vocabPath)) {
    console.warn('Skipping vocabulary: tu-vung-n2.json not found');
  } else {
    const vocabJson = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'));
    const vocabulary = vocabJson.vocabulary ?? [];
    let created = 0;
    for (const v of vocabulary) {
      const exists = await prisma.vocabulary.findFirst({
        where: { word: v.kanji, level: 'N2' },
      });
      if (!exists) {
        const nghiaViet = v.nghia_viet ?? v.nghia ?? '';
        const nghiaAnh = v.nghia_anh ?? v.nghia ?? nghiaViet;
        await prisma.vocabulary.create({
          data: {
            word: v.kanji,
            reading: v.hiragana ?? null,
            onyomiVi: v.am_han_viet ?? null,
            meaningEn: nghiaAnh,
            meaningVi: nghiaViet,
            level: 'N2',
          },
        });
        created++;
      }
    }
    console.log('Vocabulary:', created, 'new /', vocabulary.length, 'total');
  }

  // 3. Grammar from ngu-phap-n2.json
  const grammarPath = path.join(DATA_DIR, 'ngu-phap-n2.json');
  if (!fs.existsSync(grammarPath)) {
    console.warn('Skipping grammar: ngu-phap-n2.json not found');
  } else {
    const grammarJson = JSON.parse(fs.readFileSync(grammarPath, 'utf-8'));
    const patterns = grammarJson.patterns ?? [];
    let created = 0;
    let updated = 0;
    for (const g of patterns) {
      const title = Array.isArray(g.mau_ngu_phap) ? g.mau_ngu_phap[0] : g.mau_ngu_phap;
      const structure = Array.isArray(g.cach_dung) ? g.cach_dung[0] : g.cach_dung ?? '';
      const explanation = Array.isArray(g.y_nghia)
        ? g.y_nghia.join('\n')
        : String(g.y_nghia ?? '');
      const exampleJp = Array.isArray(g.vi_du)
        ? g.vi_du.length > 0
          ? g.vi_du.join('\n')
          : null
        : g.vi_du != null && String(g.vi_du).trim()
          ? String(g.vi_du)
          : null;

      const exists = await prisma.grammar.findFirst({ where: { title } });
      if (!exists) {
        await prisma.grammar.create({
          data: {
            title,
            structure,
            explanation,
            exampleJp,
            level: 'N2',
          },
        });
        created++;
      } else {
        await prisma.grammar.update({
          where: { id: exists.id },
          data: { structure, explanation, exampleJp },
        });
        updated++;
      }
    }
    console.log(
      'Grammar:',
      created,
      'new,',
      updated,
      'updated /',
      patterns.length,
      'total',
    );
  }

  // 4. Kanji from kanji-n2.json (enriched with kanji.js: strokeCount, onyomi, kunyomi)
  const kanjiPath = path.join(DATA_DIR, 'kanji-n2.json');
  if (!fs.existsSync(kanjiPath)) {
    console.warn('Skipping kanji: kanji-n2.json not found');
  } else {
    const kanjiJson = JSON.parse(fs.readFileSync(kanjiPath, 'utf-8'));
    const kanjiList = kanjiJson.kanji ?? [];
    let created = 0;
    let updated = 0;
    for (const k of kanjiList) {
      const character = k.kanji;
      const details = Kanji.getDetails(character);
      const onyomi = details?.onyomi?.length
        ? details.onyomi.join(', ')
        : null;
      const kunyomi = details?.kunyomi?.length
        ? details.kunyomi.join(', ')
        : null;
      const strokeCount = details?.stroke_count ?? 0;

      const exists = await prisma.kanji.findUnique({
        where: { character },
      });
      if (!exists) {
        await prisma.kanji.create({
          data: {
            character,
            meaning: k.nghia ?? '',
            onyomi,
            kunyomi,
            strokeCount,
            jlptLevel: 'N2',
          },
        });
        created++;
      } else if (exists.strokeCount === 0 && strokeCount > 0) {
        await prisma.kanji.update({
          where: { character },
          data: { onyomi, kunyomi, strokeCount },
        });
        updated++;
      }
    }
    console.log('Kanji:', created, 'new /', updated, 'updated /', kanjiList.length, 'total');
  }

  // 5. Reading passages from reading-n2.json (passage + footnotes + grammar + vocab + JP/VI questions)
  const readingPath = path.join(DATA_DIR, 'reading-n2.json');
  if (!fs.existsSync(readingPath)) {
    console.warn('Skipping reading: reading-n2.json not found');
  } else {
    const raw = JSON.parse(fs.readFileSync(readingPath, 'utf-8')) as unknown;
    const items = Array.isArray(raw) ? raw : [];
    let created = 0;
    let skipped = 0;

    type JsonQuestion = {
      order?: number;
      content?: string;
      options?: Record<string, string>;
      correctAnswer?: string;
      explanationJp?: string;
      explanationVi?: string;
    };

    for (const item of items) {
      if (!item || typeof item !== 'object') continue;
      const row = item as Record<string, unknown>;
      const p = row.passage as Record<string, unknown> | undefined;
      if (!p || typeof p.title !== 'string' || typeof p.contentJp !== 'string') continue;

      const exists = await prisma.readingPassage.findFirst({
        where: { title: p.title },
      });
      if (exists) {
        skipped++;
        continue;
      }

      const questionsJp = (row.questionsJp as JsonQuestion[]) ?? [];
      const questionsVi = (row.questionsVi as JsonQuestion[]) ?? [];
      const viByOrder = new Map<number, JsonQuestion>();
      for (const qv of questionsVi) {
        if (qv && typeof qv.order === 'number') viByOrder.set(qv.order, qv);
      }

      const footnotes = row.footnotes;
      const grammarInPassage = row.grammarInPassage;
      const vocabulary = row.vocabulary;

      await prisma.readingPassage.create({
        data: {
          title: p.title,
          content: p.contentJp,
          contentVi: typeof p.contentVi === 'string' ? p.contentVi : null,
          level: typeof p.level === 'string' ? p.level : 'N2',
          wordCount: typeof p.wordCount === 'number' ? p.wordCount : null,
          ...(Array.isArray(footnotes) ? { footnotes } : {}),
          ...(Array.isArray(grammarInPassage) ? { grammarInPassage } : {}),
          ...(Array.isArray(vocabulary) ? { vocabulary } : {}),
          questions: {
            create: questionsJp.map((q, idx) => {
              const order = typeof q?.order === 'number' ? q.order : idx + 1;
              const qv = viByOrder.get(order);
              return {
                type: 'READING' as const,
                content: String(q?.content ?? ''),
                options: q?.options ?? undefined,
                correctAnswer: String(q?.correctAnswer ?? ''),
                sortOrder: order,
                contentVi: qv?.content != null ? String(qv.content) : null,
                optionsVi: qv?.options ?? undefined,
                explanation: q?.explanationJp != null ? String(q.explanationJp) : null,
                explanationVi: qv?.explanationVi != null ? String(qv.explanationVi) : null,
              };
            }),
          },
        },
      });
      created++;
    }
    console.log('Reading:', created, 'created,', skipped, 'skipped (title exists)');
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
