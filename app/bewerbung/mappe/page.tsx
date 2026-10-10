import type { Metadata } from 'next';
import { MappeTool } from '@/components/mappe';
import { MappeBlatt } from '@/components/mappe/MappeBlatt';
import { MAPPE_KOPF } from '@/components/mappe/text';
import { Seitenkopf } from '@/components/seitenkopf';
import { ContactOptions } from '@/components/site/ContactOptions';
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
 *
 * Kopf im Design des Einstiegs (E-023), Variante `arbeit`: Papier mit h1, schmale Navy-Fläche mit den zwei
 * eingemessenen A4-Blättern; am Handy ein knappes Navy-Band. Keine rote Fläche im Kopf: Die Hauptaktion
 * „Mit dieser Mappe bewerben“ steht am Pult des Werkzeugs. Im Druck bleiben nur die Blätter.
 */
export default function BewerbungsmappePage() {
  return (
    <>
      <Seitenkopf
        variante="arbeit"
        titelId="mappe-titel"
        etikett={MAPPE_KOPF.etikett}
        titel={MAPPE_KOPF.titel}
        unterzeile={MAPPE_KOPF.unterzeile}
        einleitung={<p>{MAPPE_KOPF.einleitung}</p>}
        zweitweg={MAPPE_KOPF.zweitweg}
        masse={MAPPE_KOPF.masse}
        panel={<MappeBlatt />}
        className="print-hidden"
      />
      <MappeTool
        jobs={getMappeJobOptions(new Date())}
        recipient={getMappeRecipient()}
        contact={<ContactOptions variant="inline" whatsappMessage={getMappeWhatsAppMessage()} />}
      />
    </>
  );
}
