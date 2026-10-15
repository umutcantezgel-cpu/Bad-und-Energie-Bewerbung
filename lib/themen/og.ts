import { COMPANY } from '@/lib/content/company';
import { FACTS } from '@/lib/content/facts';
import { OG_IMAGE_SIZE, OG_IMAGE_TYPE, OG_ZEICHNUNG_ABFRAGE, fitTitle, versal, type OgImage, type OgJobText } from '@/lib/seo/og-image';
import { THEMEN_STAND } from './registry';
import type { SeitenBasis } from './text';

const plain = (text: string) => text.replace(/ /g, ' ');
const ACTION = 'Jetzt bewerben';

/**
 * Teilen-Bild einer Themenseite (E-028) im Rahmen der Stellenbilder (renderJobImage, Heizkreis in Stellengröße):
 * Etikett und h1 der Seite, zwei kurze Zeilen an der Rohrklammer, im Heizkreis der Kennwert der Seite („auf Anfrage“
 * seit E-030, „22 V“, „5 Marken“, „1926“, „100 %“). Alles aus dem Textmodell.
 */
export function ogThemaText(text: Pick<SeitenBasis, 'etikett' | 'meta' | 'og'>): OgJobText {
  const etikett = versal(plain(text.etikett));
  const fitted = fitTitle(plain(text.meta.h1));
  const subline = text.og.zeilen.map(plain);
  const microcopy = plain(`Dauert ca. ${FACTS.apply60s.value} Sekunden. ${FACTS.noCvNeeded.short}.`);
  const salary = { value: plain(text.og.wert), name: text.og.name };
  return {
    etikett,
    title: fitted.lines,
    titleSize: fitted.size,
    subline,
    action: ACTION,
    microcopy,
    salary,
    zeichnung: text.og.zeichnung ?? 'haus',
    texts: [etikett, ...fitted.lines, ...subline, ACTION, microcopy, salary.value, salary.name],
  };
}

/**
 * Teilen-Bild der Themenseite: eigene Route `<pfad>/opengraph-image` mit eigenem alt; die Abfrage wechselt mit dem Stand
 * der Texte und dem der Zeichnung.
 */
export function themaOgImage(text: Pick<SeitenBasis, 'path' | 'meta'>): OgImage {
  return {
    url: `${text.path}/opengraph-image?v=${THEMEN_STAND}&${OG_ZEICHNUNG_ABFRAGE}`,
    ...OG_IMAGE_SIZE,
    type: OG_IMAGE_TYPE,
    alt: `${text.meta.h1}: ${COMPANY.name} in ${COMPANY.address.city}`,
  };
}
