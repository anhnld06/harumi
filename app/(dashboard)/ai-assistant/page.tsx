import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AiAssistantView } from '@/features/ai-assistant/ai-assistant-view';
import { userCanAccessPremiumMockTests } from '@/lib/mock-test/mock-test-access';

export const dynamic = 'force-dynamic';

export default async function AiAssistantPage() {
  const session = await getServerSession(authOptions);
  const canUsePremiumAi =
    !!session?.user &&
    userCanAccessPremiumMockTests(session.user.planTier, session.user.planExpiresAt);

  return <AiAssistantView canUsePremiumAi={canUsePremiumAi} />;
}
