'use client';

import { useRef } from 'react';
import Link from 'next/link';
import type { CertificateTemplate } from '@/lib/certificate/constants';
import { Button } from '@/components/ui/button';
import { CertificateArtwork, type CertificateArtworkLabels } from './certificate-artwork';
import { CertificateDownloadButton } from './certificate-download-button';
import { useLanguage } from '@/lib/i18n/language-context';

export type CertificateViewPayload = {
  id: string;
  template: CertificateTemplate;
  recipientName: string;
  courseTitle: string;
  scoreText: string;
  certificateNo: string;
  issuedAt: string;
};

export function CertificateViewContent({ cert }: { cert: CertificateViewPayload }) {
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const issuedAt = new Date(cert.issuedAt);

  const labels: CertificateArtworkLabels = {
    achievementTitle: t('certificate.art.achievementTitle'),
    grantedPrefix: t('certificate.art.grantedPrefix'),
    scoreLabel: t('certificate.art.scoreLabel'),
    certNoLabel: t('certificate.art.certNoLabel'),
  };

  const fileBase = `certificate-${cert.certificateNo}`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('certificate.viewTitle')}</h1>
          <p className="text-sm text-muted-foreground">{cert.courseTitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CertificateDownloadButton
            targetRef={ref}
            template={cert.template}
            fileBase={fileBase}
            label={t('certificate.downloadPng')}
          />
          <Button variant="outline" asChild>
            <Link href="/certificate">{t('certificate.allCertificates')}</Link>
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <CertificateArtwork
          ref={ref}
          template={cert.template}
          recipientName={cert.recipientName}
          courseTitle={cert.courseTitle}
          scoreText={cert.scoreText}
          certificateNo={cert.certificateNo}
          issuedAt={issuedAt}
          labels={labels}
        />
      </div>
    </div>
  );
}
