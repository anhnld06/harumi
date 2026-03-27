import { prisma } from '@/lib/db';
import { NoData } from '@/components/ui/no-data';
import { ReadingListView } from '@/features/reading/reading-list';

export default async function ReadingPage() {
  const passages = await prisma.readingPassage.findMany({
    where: { level: 'N2' },
    orderBy: { createdAt: 'asc' },
    take: 50,
    select: {
      id: true,
      title: true,
      content: true,
      wordCount: true,
      level: true,
      contentVi: true,
    },
  });

  if (passages.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Reading</h1>
        <NoData description="Run database seed to add reading passages" />
      </div>
    );
  }

  return <ReadingListView items={passages} />;
}
