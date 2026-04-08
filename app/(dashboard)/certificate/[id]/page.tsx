import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserCertificate } from '@/server/services/certificate.service';
import { CertificateViewContent } from '@/features/certificate/certificate-view-content';

export default async function CertificateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) notFound();

  const { id } = await params;
  const cert = await getUserCertificate(id, userId);
  if (!cert) notFound();

  return (
    <CertificateViewContent
      cert={{
        id: cert.id,
        template: cert.template,
        recipientName: cert.recipientName,
        courseTitle: cert.courseTitle,
        scoreText: cert.scoreText,
        certificateNo: cert.certificateNo,
        issuedAt: cert.issuedAt.toISOString(),
      }}
    />
  );
}
