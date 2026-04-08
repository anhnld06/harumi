'use client';

import { useCallback, useState } from 'react';
import type { RefObject } from 'react';
import { toBlob } from 'html-to-image';
import type { CertificateTemplate } from '@/lib/certificate/constants';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from '@/lib/toast-store';
import { certificateCaptureBackground } from './certificate-artwork';

async function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) {
        return (img.decode?.() ?? Promise.resolve()).catch(() => undefined);
      }
      return new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error('Image load timeout')), 25000);
        img.onload = () => {
          window.clearTimeout(timeout);
          void (img.decode?.() ?? Promise.resolve())
            .then(() => resolve())
            .catch(() => resolve());
        };
        img.onerror = () => {
          window.clearTimeout(timeout);
          reject(new Error('Certificate image failed to load'));
        };
      });
    })
  );
}

/**
 * PNG export via SVG foreignObject (not html2canvas). Avoids html2canvas crashing
 * on Tailwind / theme colors using `oklch()`, which it cannot parse.
 */
export function CertificateDownloadButton({
  targetRef,
  template,
  fileBase,
  label,
}: {
  targetRef: RefObject<HTMLDivElement | null>;
  template: CertificateTemplate;
  fileBase: string;
  label: string;
}) {
  const [busy, setBusy] = useState(false);

  const onDownload = useCallback(async () => {
    const el = targetRef.current;
    if (!el) return;
    setBusy(true);
    try {
      el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      await waitForImages(el);

      const blob = await toBlob(el, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: certificateCaptureBackground(template),
        width: el.offsetWidth,
        height: el.offsetHeight,
      });

      if (!blob) {
        throw new Error('Could not export PNG');
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileBase.replace(/[^a-zA-Z0-9-_]/g, '_')}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast(
        e instanceof Error
          ? e.message
          : 'Could not download PNG. Try again or use browser screenshot.'
      );
    } finally {
      setBusy(false);
    }
  }, [targetRef, template, fileBase]);

  return (
    <Button type="button" variant="secondary" disabled={busy} onClick={onDownload}>
      <Download className="mr-2 h-4 w-4" />
      {busy ? '…' : label}
    </Button>
  );
}
