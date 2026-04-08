export type CertificateTemplateId = 'HERITAGE' | 'SAKURA' | 'MIDNIGHT';

/** Matches Prisma enum `CertificateTemplate` — prefer this in app code over importing from `@prisma/client`. */
export type CertificateTemplate = CertificateTemplateId;

/** Background artwork under `public/images/` (Canva exports). */
export const CERTIFICATE_IMAGE_PATHS: Record<CertificateTemplateId, string> = {
  HERITAGE: '/images/certificate-1.png',
  SAKURA: '/images/certificate-2.png',
  MIDNIGHT: '/images/certificate-3.png',
};

export const CERTIFICATE_TEMPLATES: {
  id: CertificateTemplateId;
  labelKey: string;
  descKey: string;
}[] = [
  { id: 'HERITAGE', labelKey: 'certificate.template.heritage', descKey: 'certificate.template.heritageDesc' },
  { id: 'SAKURA', labelKey: 'certificate.template.sakura', descKey: 'certificate.template.sakuraDesc' },
  { id: 'MIDNIGHT', labelKey: 'certificate.template.midnight', descKey: 'certificate.template.midnightDesc' },
];

export function isCertificateTemplateId(v: string): v is CertificateTemplateId {
  return v === 'HERITAGE' || v === 'SAKURA' || v === 'MIDNIGHT';
}
