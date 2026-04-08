import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NoData } from '@/components/ui/no-data';

export default async function ListeningPage() {
  const passages = await prisma.listeningPassage.findMany({
    where: { level: 'N2', libraryVisible: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Listening</h1>
      <Card>
        <CardHeader>
          <CardTitle>N2 Listening Passages</CardTitle>
          <p className="text-sm text-muted-foreground">
            Practice listening comprehension with audio
          </p>
        </CardHeader>
        <CardContent>
          {passages.length === 0 ? (
            <NoData
              description="No listening passages found"
            />
          ) : (
            <div className="space-y-4">
              {passages.map((p) => (
                <Link key={p.id} href={`/listening/${p.id}`}>
                  <div className="rounded-lg border p-4 transition hover:bg-muted/50">
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {p.duration ? `${p.duration}s` : 'Audio'} • N2
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
