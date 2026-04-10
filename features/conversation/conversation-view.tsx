'use client';

import { ConversationLessonGrid } from '@/features/conversation/conversation-lesson-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/language-context';

export function ConversationView() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('conversation.pageTitle')}</h1>
        <p className="mt-1 text-muted-foreground">{t('conversation.pageDescription')}</p>
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t('nav.conversation')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ConversationLessonGrid />
        </CardContent>
      </Card>
    </div>
  );
}
