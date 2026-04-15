import { listContactMessages } from '../actions/actions';
import { ContactMessagesTabs } from './ContactMessagesTabs';

interface ContactMessagesContentProps {
  locale: string;
}

export async function ContactMessagesContent({ locale }: ContactMessagesContentProps) {
  const t = (en: string, ar: string) => (locale === 'ar' ? ar : en);
  
  const [allMessages, newMessages, readMessages] = await Promise.all([
    listContactMessages(),
    listContactMessages('NEW'),
    listContactMessages('READ'),
  ]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">
          {t('Contact Messages', 'رسائل التواصل')}
        </h1>
        <p className="text-muted-foreground">
          {t(
            `Total ${allMessages.length} message${allMessages.length !== 1 ? 's' : ''}`,
            `إجمالي ${allMessages.length} رسالة`
          )}
        </p>
      </div>

      <ContactMessagesTabs
        allMessages={allMessages}
        newMessages={newMessages}
        readMessages={readMessages}
        locale={locale}
      />
    </section>
  );
}

