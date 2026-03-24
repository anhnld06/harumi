import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NoData } from '@/components/ui/no-data';
import { Button } from '@/components/ui/button';

export default async function ReadingPage() {
  const passages = await prisma.readingPassage.findMany({
    where: { level: 'N2' },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reading</h1>
      <Card>
        <CardHeader>
          <CardTitle>N2 Reading Passages</CardTitle>
          <p className="text-sm text-muted-foreground">
            Practice reading comprehension with timed passages
          </p>
        </CardHeader>
        <CardContent>
          {passages.length === 0 ? (
            <NoData
              description="Run database seed to add reading passages"
            />
          ) : (
            <div className="space-y-4">
              {passages.map((p) => (
                <Link key={p.id} href={`/reading/${p.id}`}>
                  <div className="rounded-lg border p-4 transition hover:bg-muted/50">
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {p.content}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {p.wordCount} words
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
