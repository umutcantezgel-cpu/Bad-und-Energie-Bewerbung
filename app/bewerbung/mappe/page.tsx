import type { Metadata } from 'next';
import { Container } from '@/components/layout';
import { MappeTool } from '@/components/mappe';
import { ContactOptions } from '@/components/site/ContactOptions';
import { PageHeader } from '@/components/ui/PageHeader';
import { getFact } from '@/lib/content';
import { getMappeJobOptions, getMappeRecipient, getMappeWhatsAppMessage } from '@/lib/mappe/context';
import { generatePageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generatePageMetadata({
  title: 'Bewerbungsmappe erstellen',
  description:
    'Anschreiben und Lebenslauf auf A4 für deine Bewerbung bei Bad und Energie in Wetzlar: ausfüllen, als PDF speichern oder drucken. Freiwillig.',
  path: '/bewerbung/mappe',
  noindex: true,
});

/**
 * Optional tool outside the application path (roadmap §6). Static (drafts live in the browser tab),
 * regenerated hourly through the root layout's `revalidate`, so expired jobs drop out of the list.
 */
export default function BewerbungsmappePage() {
  const noCvNeeded = getFact('noCvNeeded');

  return (
    <Container size="wide" className="py-section-sm print:m-0 print:max-w-none print:p-0">
      <PageHeader
        title="Bewerbungsmappe erstellen"
        lead={`Anschreiben und Lebenslauf auf A4, zum Drucken oder als PDF. Die Mappe ist freiwillig: ${noCvNeeded.long}`}
        className="print-hidden"
      />
      <MappeTool
        className="mt-12"
        jobs={getMappeJobOptions(new Date())}
        recipient={getMappeRecipient()}
        contact={<ContactOptions variant="inline" whatsappMessage={getMappeWhatsAppMessage()} />}
      />
    </Container>
  );
}
