import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getClassifiedReadings } from '@/lib/kanji-readings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KanjiReadingsByType } from '@/components/kanji-readings-by-type';
import { KanjiStrokeOrder } from '@/components/kanji-stroke-order';

export default async function KanjiDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { id } = await params;
  const { returnTo } = await searchParams;
  const backHref =
    returnTo && returnTo.startsWith('/kanji') && !returnTo.includes('//')
      ? returnTo
      : '/kanji';
  const kanji = await prisma.kanji.findUnique({
    where: { id },
  });

  if (!kanji) notFound();

  const classifiedReadings = getClassifiedReadings(
    kanji.character,
    kanji.onyomi,
    kanji.kunyomi
  );

  return (
    <div className="space-y-6">
      <Link href={backHref}>
        <Button variant="ghost" size="sm" className="-ml-2 gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-6xl font-medium">{kanji.character}</span>
        <div>
          <h1 className="text-2xl font-bold">{kanji.meaning}</h1>
          <p className="text-muted-foreground">JLPT {kanji.jlptLevel} • {kanji.strokeCount} strokes</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Readings & Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">音読み (Onyomi):</span>
              <p className="font-medium">{kanji.onyomi || '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">訓読み (Kunyomi):</span>
              <p className="font-medium">{kanji.kunyomi || '-'}</p>
            </div>
          </div>
          <KanjiReadingsByType readings={classifiedReadings} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Stroke</CardTitle>
        </CardHeader>
        <CardContent>
          <KanjiStrokeOrder character={kanji.character} strokeCount={kanji.strokeCount} />
        </CardContent>
      </Card>
    </div>
  );
}
