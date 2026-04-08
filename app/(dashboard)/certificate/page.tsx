import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { formatCertificateDate } from '@/lib/certificate/format-certificate-date';
import { listUserCertificates } from '@/server/services/certificate.service';
import { CertificateListClient } from '@/features/certificate/certificate-list-client';

export default async function CertificateListPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) redirect('/login?callbackUrl=/certificate');

  const certificates = await listUserCertificates(userId);

  return (
    <CertificateListClient
      certificates={certificates.map((c) => ({
        id: c.id,
        courseTitle: c.courseTitle,
        certificateNo: c.certificateNo,
        issuedAt: formatCertificateDate(c.issuedAt),
        scoreText: c.scoreText,
      }))}
    />
  );
}
