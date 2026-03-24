import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SpeakButton } from '@/components/speak-button';
import { getN2GrammarExampleAudioSrc } from '@/lib/n2-static-audio';

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

  const exampleLines = grammar.exampleJp
    ? grammar.exampleJp.split('\n').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      <Link href={backHref}>
        <Button variant="ghost" size="sm" className="-ml-2 gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </Link>
      <Card className="border-0 rounded-2xl bg-blue-50 py-8 px-6 text-center dark:bg-primary/15">
        <CardContent className="p-0">
          <h1 className="text-3xl font-bold text-foreground">{grammar.title}</h1>
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

      {(exampleLines.length > 0 || grammar.exampleEn) && (
        <Card>
          <CardHeader>
            <CardTitle>{exampleLines.length > 1 ? 'Examples' : 'Example'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {exampleLines.map((line, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <p className="flex-1 text-lg whitespace-pre-wrap">{line}</p>
                <SpeakButton
                  text={line}
                  audioSrc={getN2GrammarExampleAudioSrc(grammar.title, line)}
                  className="shrink-0"
                />
              </div>
            ))}
            {grammar.exampleEn && (
              <p className="text-muted-foreground whitespace-pre-wrap">{grammar.exampleEn}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
