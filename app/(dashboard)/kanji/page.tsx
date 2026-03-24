import { prisma } from '@/lib/db';
import { KanjiList } from '@/features/kanji/kanji-list';

export default async function KanjiPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? '1', 10);
  const search = params.search ?? '';
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        jlptLevel: 'N2',
        OR: [
          { character: { contains: search } },
          { meaning: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : { jlptLevel: 'N2' };

  const [items, total] = await Promise.all([
    prisma.kanji.findMany({
      where,
      skip,
      take: limit,
      orderBy: { strokeCount: 'asc' },
    }),
    prisma.kanji.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Kanji</h1>
      <KanjiList
        items={items}
        total={total}
        page={page}
        totalPages={totalPages}
        search={search}
      />
    </div>
  );
}
