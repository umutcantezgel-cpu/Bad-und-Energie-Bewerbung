import type { Metadata } from 'next';
import { FehlerSeite } from '@/components/site/fehler';

/*
 * 404 (R4-404 in R5-RUHE, E-SHELL-025/-026/-027). Status 404 setzt Next selbst. Next fügt auf 404-Seiten
 * `<meta name="robots" content="noindex">` ein; `robots: null` nimmt das „index, follow“ des Root-Layouts zurück,
 * damit nur dieses eine robots-Meta steht (NEU-SEO-16: kein doppeltes robots-Meta). Links folgen Suchmaschinen
 * ohne Angabe ohnehin.
 */
export const metadata: Metadata = {
  title: 'Seite nicht gefunden',
  description: 'Diese Seite gibt es nicht. Hier geht es zu den offenen Stellen und zur Bewerbung.',
  robots: null,
};

export default function NotFound() {
  return <FehlerSeite />;
}
