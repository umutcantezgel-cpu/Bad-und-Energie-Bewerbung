import { Fragment } from 'react';
import { wortfugen } from '../text';

export interface WortfugenProps {
  text: string;
  /** Titel der Stelle mit weichen Trennstellen (`job.titleShy`): Quelle der Wortfugen. */
  titleShy: string;
}

/**
 * Text einer Überschrift mit Umbruchstellen an den Wortfugen aus `titleShy`, als <wbr> statt weicher
 * Trennstriche (U+00AD) im HTML (V6-G2): Das Keyword bleibt für Crawler am Stück, die Zeile bricht bei 320 px
 * an derselben Stelle wie bisher. Trennstrich und letztes Netz kommen aus dem CSS der Überschrift
 * (`hyphens: auto` mit `lang="de"`, `overflow-wrap: anywhere`).
 */
export function Wortfugen({ text, titleShy }: WortfugenProps) {
  return (
    <>
      {wortfugen(text, titleShy).map((teil, i) => (
        <Fragment key={i}>
          {i > 0 ? <wbr /> : null}
          {teil}
        </Fragment>
      ))}
    </>
  );
}
