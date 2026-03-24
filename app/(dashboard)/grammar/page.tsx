import { prisma } from '@/lib/db';
import { GrammarList } from '@/features/grammar/grammar-list';

export default async function GrammarPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? '1', 10);
  const search = params.search ?? '';
  const limit = 12;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        level: 'N2',
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { structure: { contains: search, mode: 'insensitive' as const } },
          { explanation: { contains: search, mode: 'insensitive' as const } },
          { exampleJp: { contains: search, mode: 'insensitive' as const } },
          { exampleEn: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : { level: 'N2' };

  const [items, total] = await Promise.all([
    prisma.grammar.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: 'asc' },
    }),
    prisma.grammar.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Grammar</h1>
      <GrammarList
        items={items}
        total={total}
        page={page}
        totalPages={totalPages}
        search={search}
      />
    </div>
  );
}
