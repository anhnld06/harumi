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
    for (const g of patterns) {
      const title = Array.isArray(g.mau_ngu_phap) ? g.mau_ngu_phap[0] : g.mau_ngu_phap;
      const exists = await prisma.grammar.findFirst({ where: { title } });
      if (!exists) {
        await prisma.grammar.create({
          data: {
            title,
            structure: Array.isArray(g.cach_dung) ? g.cach_dung[0] : g.cach_dung ?? '',
            explanation: Array.isArray(g.y_nghia) ? g.y_nghia.join('\n') : String(g.y_nghia ?? ''),
            exampleJp: Array.isArray(g.vi_du) ? g.vi_du[0] : g.vi_du ?? null,
            level: 'N2',
          },
        });
        created++;
      }
    }
    console.log('Grammar:', created, 'new /', patterns.length, 'total');
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
