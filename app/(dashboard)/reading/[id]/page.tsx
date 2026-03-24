import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReadingPractice } from '@/features/reading/reading-practice';

export default async function ReadingPassagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const passage = await prisma.readingPassage.findUnique({
    where: { id },
    include: { questions: true },
  });

  if (!passage) notFound();

  return (
    <div className="space-y-6">
      <Link href="/reading">
        <Button variant="ghost" size="sm" className="-ml-2 gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </Link>
      <div>
        <h1 className="text-2xl font-bold">{passage.title}</h1>
        <p className="text-muted-foreground">{passage.wordCount} words</p>
      </div>

      <ReadingPractice passage={passage} questions={passage.questions} />
    </div>
  );
}
