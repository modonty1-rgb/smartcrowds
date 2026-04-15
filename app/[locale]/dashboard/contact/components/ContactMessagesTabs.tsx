'use client';

import { useState } from 'react';
import { ContactMessagesTable } from './ContactMessagesTable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  createdAt: Date | string;
}

interface ContactMessagesTabsProps {
  allMessages: ContactMessage[];
  newMessages: ContactMessage[];
  readMessages: ContactMessage[];
  locale: string;
}

export function ContactMessagesTabs({
  allMessages,
  newMessages,
  readMessages,
  locale,
}: ContactMessagesTabsProps) {
  const [activeTab, setActiveTab] = useState('all');
  const t = (en: string, ar: string) => (locale === 'ar' ? ar : en);

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList>
        <TabsTrigger value="all">
          {t('All', 'الكل')} ({allMessages.length})
        </TabsTrigger>
        <TabsTrigger value="new">
          {t('New', 'جديد')} ({newMessages.length})
        </TabsTrigger>
        <TabsTrigger value="read">
          {t('Read', 'مقروء')} ({readMessages.length})
        </TabsTrigger>
      </TabsList>

        <div className="mt-6">
          <TabsContent value="all">
            <ContactMessagesTable messages={allMessages} locale={locale} />
          </TabsContent>
          <TabsContent value="new">
            <ContactMessagesTable messages={newMessages} locale={locale} />
          </TabsContent>
          <TabsContent value="read">
            <ContactMessagesTable messages={readMessages} locale={locale} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

