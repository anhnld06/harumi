'use client';

import { forwardRef } from 'react';
import { CERTIFICATE_IMAGE_PATHS, type CertificateTemplate } from '@/lib/certificate/constants';
import { formatCertificateDate } from '@/lib/certificate/format-certificate-date';
import { cn } from '@/lib/utils';

export type CertificateArtworkLabels = {
  achievementTitle: string;
  grantedPrefix: string;
  scoreLabel: string;
  certNoLabel: string;
};

type ArtProps = {
  recipientName: string;
  courseTitle: string;
  scoreText: string;
  certificateNo: string;
  issuedAt: Date;
  labels: CertificateArtworkLabels;
};

/** CSS variables from `app/layout.tsx` (Alex Brush, Niconne, Great Vibes). */
const NAME_FONT: Record<CertificateTemplate, string> = {
  HERITAGE: 'var(--font-cert-name-1), cursive',
  SAKURA: 'var(--font-cert-name-2), cursive',
  MIDNIGHT: 'var(--font-cert-name-3), cursive',
};

function ImageTemplateInner({
  template,
  recipientName,
  courseTitle,
  scoreText,
  certificateNo,
  issuedAt,
  labels,
}: ArtProps & { template: CertificateTemplate }) {
  const nameStyle = { fontFamily: NAME_FONT[template] };

  const nameColor =
    template === 'HERITAGE'
      ? '#1b3e5f'
      : template === 'SAKURA'
        ? '#0b2e24'
        : '#0a2744';

  const courseColor =
    template === 'HERITAGE' ? '#2a2a2a' : template === 'SAKURA' ? '#1a3328' : '#1e3a5f';

  const metaColor =
    template === 'MIDNIGHT' ? '#475569' : template === 'SAKURA' ? '#374151' : '#4b5563';

  /** Top edge of recipient name block (above the horizontal rule on the artwork). */
  const nameTop =
    template === 'HERITAGE' ? 'top-[43%]' : template === 'SAKURA' ? 'top-[42%]' : 'top-[52%]';

  /** Course line sits below the rule under the name — offset differs per Canva template. */
  const courseTop =
    template === 'HERITAGE' ? 'top-[56%]' : template === 'SAKURA' ? 'top-[56%]' : 'top-[64%]';

  return (
    <div className="absolute inset-0">
      <img
        src={CERTIFICATE_IMAGE_PATHS[template]}
        alt=""
        width={900}
        height={636}
        crossOrigin="anonymous"
        decoding="async"
        className="pointer-events-none h-full w-full select-none object-cover object-center"
        draggable={false}
      />

      <div
        className={cn(
          'absolute left-1/2 w-[88%] max-w-[720px] -translate-x-1/2 text-center',
          nameTop
        )}
      >
        <p
          data-cert-name
          className="break-words leading-tight"
          style={{
            ...nameStyle,
            color: nameColor,
            fontSize: 'clamp(2rem, 5.5vw, 3rem)',
          }}
        >
          {recipientName}
        </p>
      </div>

      <div
        className={cn(
          'absolute left-1/2 flex w-[82%] max-w-[640px] -translate-x-1/2 flex-col items-center gap-2 sm:gap-2.5',
          courseTop
        )}
      >
        <p
          data-cert-course
          className="w-full text-center text-sm font-medium leading-snug sm:text-base"
          style={{ color: courseColor }}
        >
          {courseTitle}
        </p>
        <div className="w-full pt-2" style={{ color: metaColor }}>
          <div
            className="mx-auto mb-2 h-px w-60 bg-black/15 sm:w-60"
            aria-hidden
          />
          <div className="mx-auto flex max-w-md flex-wrap items-end justify-center gap-x-8 gap-y-2 px-2 text-[11px] sm:gap-x-10 sm:text-xs">
            <div className="flex flex-col gap-0.5 text-left">
              <span className="font-medium opacity-80">{labels.scoreLabel}</span>
              <span className="font-semibold tabular-nums">{scoreText}</span>
            </div>
            <div className="flex flex-col gap-0.5 text-right">
              <span className="opacity-80">
                {labels.certNoLabel} {certificateNo}
              </span>
              <span className="tabular-nums">{formatCertificateDate(issuedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const CertificateArtwork = forwardRef<
  HTMLDivElement,
  {
    template: CertificateTemplate;
    recipientName: string;
    courseTitle: string;
    scoreText: string;
    certificateNo: string;
    issuedAt: Date;
    labels: CertificateArtworkLabels;
  }
>(function CertificateArtwork(
  { template, recipientName, courseTitle, scoreText, certificateNo, issuedAt, labels },
  ref
) {
  const props: ArtProps = {
    recipientName,
    courseTitle,
    scoreText,
    certificateNo,
    issuedAt,
    labels,
  };

  return (
    <div
      ref={ref}
      id="certificate-capture-root"
      className={cn('relative mx-auto overflow-hidden rounded-lg bg-white shadow-2xl')}
      style={{ width: 900, height: 636 }}
    >
      <ImageTemplateInner {...props} template={template} />
    </div>
  );
});

export function certificateCaptureBackground(_template: CertificateTemplate): string {
  return '#ffffff';
}
