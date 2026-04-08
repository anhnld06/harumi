'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/language-context';
import {
  CERTIFICATE_IMAGE_PATHS,
  CERTIFICATE_TEMPLATES,
  type CertificateTemplateId,
} from '@/lib/certificate/constants';
import { Check } from 'lucide-react';

export function CertificateSelectClient({
  attemptId,
  mockTestTitle,
}: {
  attemptId: string;
  mockTestTitle: string;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [template, setTemplate] = useState<CertificateTemplateId>('HERITAGE');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onContinue() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, template }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : t('certificate.issueError'));
        return;
      }
      if (data.certificate?.id) {
        router.push(`/certificate/${data.certificate.id}`);
        router.refresh();
        return;
      }
      setError(t('certificate.issueError'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t('certificate.selectTitle')}</h1>
        <p className="mt-2 text-muted-foreground">
          {mockTestTitle} — {t('certificate.selectSubtitle')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {CERTIFICATE_TEMPLATES.map((opt) => {
          const selected = template === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTemplate(opt.id)}
              className={cn(
                'relative rounded-xl border-2 p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-primary',
                selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
              )}
            >
              {selected && (
                <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
              <TemplatePreviewMini kind={opt.id} />
              <p className="mt-3 font-semibold">{t(opt.labelKey)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t(opt.descKey)}</p>
            </button>
          );
        })}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <Button type="button" size="lg" disabled={busy} onClick={onContinue}>
          {busy ? '…' : t('certificate.continue')}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {t('certificate.back')}
        </Button>
      </div>
    </div>
  );
}

function TemplatePreviewMini({ kind }: { kind: CertificateTemplateId }) {
  return (
    <div className="relative h-28 overflow-hidden rounded-md border bg-muted">
      <img
        src={CERTIFICATE_IMAGE_PATHS[kind]}
        alt=""
        className="h-full w-full object-cover object-center"
        draggable={false}
      />
    </div>
  );
}
