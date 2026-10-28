import { Icon } from '@/components/icons';
import type { ZeichenFund } from '@/lib/mappe/blatt/zeichen';
import type { MappeZeichenOrt } from '@/lib/mappe/editor';

/** Fund je Ort im Editor (zeichenFunde über zeichenOrte). */
export type MappeZeichenFund = ZeichenFund<MappeZeichenOrt>;

/** Höchstens so viele Zeichen je Ort, dann „…“. */
const ZEICHEN_JE_ORT = 8;

/**
 * Texte des Hinweises (K-012: nur, was stimmt). Kein PDF entsteht mit Zeichen ohne Glyphe; Name, Telefon, E-Mail und
 * Wohnort stehen nur im PDF zum Herunterladen (das PDF fürs Team nimmt den Namen aus dem Formular, ohne Kontaktzeile).
 */
export const ZEICHEN_TEXT = Object.freeze({
  titel: 'Diese Zeichen fehlen im PDF',
  keinPdf: 'Damit entsteht kein PDF:',
  keinDownload: 'Damit entsteht dein PDF zum Herunterladen nicht:',
  fallenWeg: 'Fallen weg, der übrige Text bleibt:',
  fehlenImDownload: 'Fehlen in deinem PDF zum Herunterladen, der übrige Text bleibt:',
  ersetzen: 'Ersetze diese Zeichen oder nimm „Drucken“.',
  ohnePdf: 'Das Team bekommt deine Mappe auch ohne PDF, als Text in der E-Mail.',
  /** Höfliche Ansage, wenn der Hinweis erscheint (MappeTool, nach einer Pause beim Tippen). */
  ansage: 'Hinweis: Einige Zeichen fehlen im PDF. Welche das sind, steht unter „Per WhatsApp schicken“.',
});

interface Gruppe {
  id: string;
  titel: string;
  art: 'fehlen' | 'fallenWeg';
  funde: readonly MappeZeichenFund[];
}

function GruppeListe({ id, titel, art, funde }: Gruppe) {
  return (
    <div className="flex flex-col gap-1">
      <p id={id} className="text-callout text-ink">
        {titel}
      </p>
      <ul aria-labelledby={id} className="list-disc space-y-1 pl-5 text-callout text-ink wrap-anywhere">
        {funde.map((fund) => {
          const zeichen = fund[art];
          const liste = zeichen.slice(0, ZEICHEN_JE_ORT).join(' ') + (zeichen.length > ZEICHEN_JE_ORT ? ' …' : '');
          return (
            <li key={fund.ort}>
              {fund.ort}: <span className="font-bold">{liste}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Zeichen-Hinweis im Pult (L5), unter den Zweitwegen: Vor dem Senden steht da, welche Zeichen im PDF wegfallen (Emojis)
 * und mit welchen kein PDF entsteht (etwa kyrillisch), je Ort im Editor. Nur mit Funden; eine lesbare Notiz ohne eigene
 * Live-Region (die Ansage macht MappeTool über seine Live-Region). Das Verhalten der PDFs bleibt, wie es ist: Der
 * Hinweis macht es nur vorher sichtbar.
 */
export function ZeichenHinweis({ funde }: { funde: readonly MappeZeichenFund[] }) {
  if (funde.length === 0) return null;
  const inhalt = funde.filter((fund) => !fund.nurDownload);
  const persoenlich = funde.filter((fund) => fund.nurDownload);
  const alle: Gruppe[] = [
    { id: 'mappe-zeichen-kein-pdf', titel: ZEICHEN_TEXT.keinPdf, art: 'fehlen', funde: inhalt },
    { id: 'mappe-zeichen-kein-download', titel: ZEICHEN_TEXT.keinDownload, art: 'fehlen', funde: persoenlich },
    { id: 'mappe-zeichen-fallen-weg', titel: ZEICHEN_TEXT.fallenWeg, art: 'fallenWeg', funde: inhalt },
    { id: 'mappe-zeichen-fehlen-download', titel: ZEICHEN_TEXT.fehlenImDownload, art: 'fallenWeg', funde: persoenlich },
  ];
  const gruppen = alle
    .map((gruppe) => ({ ...gruppe, funde: gruppe.funde.filter((fund) => fund[gruppe.art].length > 0) }))
    .filter((gruppe) => gruppe.funde.length > 0);
  const keinPdf = inhalt.some((fund) => fund.fehlen.length > 0);
  const keinDownload = persoenlich.some((fund) => fund.fehlen.length > 0);

  return (
    <div role="note" aria-labelledby="mappe-zeichen-titel" className="flex flex-col gap-3 rounded-2 bg-surface p-4" data-mappe-zeichen="">
      <p id="mappe-zeichen-titel" className="flex items-start gap-2 text-callout font-bold text-ink">
        <Icon name="circle-alert" size="md" className="mt-0.5 shrink-0 text-brand" />
        <span>{ZEICHEN_TEXT.titel}</span>
      </p>
      {gruppen.map((gruppe) => (
        <GruppeListe key={gruppe.id} {...gruppe} />
      ))}
      {(keinPdf || keinDownload) && (
        <p className="text-callout text-ink">
          {ZEICHEN_TEXT.ersetzen}
          {keinPdf ? ` ${ZEICHEN_TEXT.ohnePdf}` : ''}
        </p>
      )}
    </div>
  );
}
