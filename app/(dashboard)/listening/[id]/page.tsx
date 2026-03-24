import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ListeningPassagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const passage = await prisma.listeningPassage.findUnique({
    where: { id },
    include: { questions: true },
  });

  if (!passage) notFound();

  return (
    <div className="space-y-6">
      <Link href="/listening">
        <Button variant="ghost" size="sm" className="-ml-2 gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </Link>
      <div>
        <h1 className="text-2xl font-bold">{passage.title}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audio</CardTitle>
          <p className="text-sm text-muted-foreground">
            Audio URL: {passage.audioUrl}
          </p>
        </CardHeader>
        <CardContent>
          <audio controls src={passage.audioUrl} className="w-full">
            Your browser does not support audio.
          </audio>
        </CardContent>
      </Card>

      {passage.transcript && (
        <Card>
          <CardHeader>
            <CardTitle>Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{passage.transcript}</p>
          </CardContent>
        </Card>
      )}

      {passage.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {passage.questions.map((q, i) => {
              const options = q.options as Record<string, string> | null;
              return (
                <div key={q.id}>
                  <p className="font-medium">{i + 1}. {q.content}</p>
                  {options && (
                    <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                      {Object.entries(options).map(([k, v]) => (
                        <li key={k}>{k}. {v}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
