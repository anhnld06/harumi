'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';

type Row = {
  id: string;
  courseTitle: string;
  certificateNo: string;
  issuedAt: string;
  scoreText: string;
};

export function CertificateListClient({ certificates }: { certificates: Row[] }) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('certificate.listTitle')}</h1>
        <p className="text-muted-foreground">{t('certificate.listSubtitle')}</p>
      </div>

      {certificates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <Award className="h-12 w-12 text-muted-foreground" />
            <p className="max-w-md text-muted-foreground">{t('certificate.listEmpty')}</p>
            <Button asChild>
              <Link href="/mock-test">{t('certificate.goMockTest')}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certificates.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle className="text-lg">{c.courseTitle}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {c.certificateNo} · {c.issuedAt}
                </p>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">{c.scoreText}</span>
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`/certificate/${c.id}`}>{t('certificate.open')}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
