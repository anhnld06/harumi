import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SpeakButton } from '@/components/speak-button';

export default async function GrammarDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { id } = await params;
  const { returnTo } = await searchParams;
  const backHref =
    returnTo && returnTo.startsWith('/grammar') && !returnTo.includes('//')
      ? returnTo
      : '/grammar';
  const grammar = await prisma.grammar.findUnique({
    where: { id },
  });

  if (!grammar) notFound();

  return (
    <div className="space-y-6">
      <Link href={backHref}>
        <Button variant="ghost" size="sm" className="-ml-2 gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </Link>
      <Card className="border-0 bg-[#eff6ff] rounded-2xl py-8 px-6 text-center">
        <CardContent className="p-0">
          <h1 className="text-3xl font-bold">{grammar.title}</h1>
          <p className="mt-2 font-mono text-lg text-primary">{grammar.structure}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Explanation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{grammar.explanation}</p>
        </CardContent>
      </Card>

      {(grammar.exampleJp || grammar.exampleEn) && (
        <Card>
          <CardHeader>
            <CardTitle>Example</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {grammar.exampleJp && (
              <div className="flex items-center gap-2">
                <p className="text-lg flex-1">{grammar.exampleJp}</p>
                <SpeakButton text={grammar.exampleJp} />
              </div>
            )}
            {grammar.exampleEn && (
              <p className="text-muted-foreground">{grammar.exampleEn}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
