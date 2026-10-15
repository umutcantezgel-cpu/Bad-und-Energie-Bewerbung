import Link from 'next/link';
import { bindSeparators, withSoftHyphens } from '@/components/jobs/text';
import { Icon } from '@/components/icons';
import { DauerSteuerung } from '@/components/zeichnung/bewegung/DauerSteuerung';
import { SichtStart } from '@/components/zeichnung/bewegung/SichtStart';
import { Anlagenschema } from '@/components/zeichnung/technik/Anlagenschema';
import { Aussengeraet, geraetTitel } from '@/components/zeichnung/technik/Aussengeraet';
import { Kaeltekreis } from '@/components/zeichnung/technik/Kaeltekreis';
import { Raumschnitt } from '@/components/zeichnung/technik/Raumschnitt';
import { COMPRESS_AW_S } from '@/lib/zeichnung/geraete/compress-aw-s';
import { HEIZWASSER, KAELTEKREIS_SCHRITTE, TECHNIK_ANTWORT, TECHNIK_KOPF, WAERMEVERTEILUNG, geraetSteckbrief } from '@/lib/zeichnung/erklaerung';
import { themaPfad } from '@/lib/themen/jsonld';
import { getThema } from '@/lib/themen/registry';
import type { WaermepumpenPageText } from '@/lib/themen/text';
import { cn } from '@/lib/utils/cn';
import { Abschnitt, Kaestenband, Kontakt, Saetze, WeitereThemen, titelId } from './Bausteine';
import { ThemaKopf } from './ThemaKopf';
import styles from './stil';

/** Ids der Zwischenüberschriften im Abschnitt Technik. */
const KAELTE_ID = titelId('kaeltekreis');
const WASSER_ID = titelId('heizwasser');
const RAUM_ID = titelId('waermeverteilung');
const GERAET_ID = titelId('aussengeraet');

/**
 * Abschnitt „Wie arbeitet eine Luft/Wasser-Wärmepumpe?“ (E-029, AEO): die Antwort zuerst, dann der Kältekreis und das
 * Anlagenschema als bewegte Fließschemata (DauerSteuerung: nur im Sichtfeld, Knopf „Anhalten“), daneben der Text in
 * derselben Reihenfolge wie die Zeichnung (lib/zeichnung/erklaerung.ts), dann der Raum im Schnitt mit Heizkörper und
 * mit Fußbodenheizung (E-031: das berechnete Wärmefeld breitet sich beim Sichtbarwerden einmal aus, SichtStart),
 * zuletzt das Beispielgerät von vorn und von der Seite mit Maßketten. Reine Technik; Aussagen über den Betrieb stehen
 * in den anderen Abschnitten (K-012).
 */
function Technik() {
  return (
    <Abschnitt kopf={TECHNIK_KOPF}>
      <p className={cn(styles.absatz, styles.absatzErst)}>{TECHNIK_ANTWORT.text}</p>

      <div className={styles.technikPaar} role="group" aria-labelledby={KAELTE_ID}>
        <DauerSteuerung className={styles.technikBild}>
          <Kaeltekreis bewegt />
        </DauerSteuerung>
        <div className={styles.text}>
          <h3 id={KAELTE_ID} className="text-title-3 text-brand">
            Der Kältekreis in der Außeneinheit
          </h3>
          <ol className={styles.schritte}>
            {KAELTEKREIS_SCHRITTE.map((schritt) => (
              <li key={schritt.symbol} className={styles.schritt}>
                <span className={cn(styles.schrittName, 'text-etikett text-brand')}>{schritt.bauteil}</span>
                <span className={styles.schrittText}>{schritt.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className={styles.technikPaar} role="group" aria-labelledby={WASSER_ID}>
        <DauerSteuerung className={styles.technikBild}>
          <Anlagenschema bewegt />
        </DauerSteuerung>
        <div className={styles.text}>
          <h3 id={WASSER_ID} className="text-title-3 text-brand">
            Der Weg des Heizwassers
          </h3>
          <p className={styles.absatz}>{HEIZWASSER.text}</p>
        </div>
      </div>

      <div id="waermeverteilung" className={styles.technikPaar} role="group" aria-labelledby={RAUM_ID}>
        <SichtStart className={cn(styles.technikBild, 'grid gap-5 sm:grid-cols-2')}>
          {(['heizkoerper', 'fussboden'] as const).map((art) => (
            <figure key={art} className="m-0 min-w-0">
              <Raumschnitt art={art} titel={`Raum mit ${WAERMEVERTEILUNG[art].name} im Schnitt`} />
              <figcaption className="text-etikett text-ink-2 mt-3">{WAERMEVERTEILUNG[art].name}</figcaption>
            </figure>
          ))}
        </SichtStart>
        <div className={styles.text}>
          <h3 id={RAUM_ID} className="text-title-3 text-brand">
            {WAERMEVERTEILUNG.titel}
          </h3>
          <p className={styles.absatz}>{WAERMEVERTEILUNG.heizkoerper.text}</p>
          <p className={styles.absatz}>{WAERMEVERTEILUNG.fussboden.text}</p>
          <p className={styles.absatz}>{WAERMEVERTEILUNG.hinweis.text}</p>
        </div>
      </div>

      <div className={styles.text}>
        <h3 id={GERAET_ID} className="text-title-3 text-brand">
          Die Außeneinheit, maßstäblich
        </h3>
        <p className={styles.absatz}>{geraetSteckbrief(COMPRESS_AW_S).text}</p>
      </div>
      <div className={styles.geraete}>
        {/* Maßzahlen 60 Einheiten: bei 280 px Breite (320 px Bildschirm) gezeichnet 12 px (Prüfung E-029, Befund 7) */}
        <Aussengeraet ansicht="vorne" massketten="voll" massSchrift={60} className={styles.geraetVorne} />
        <Aussengeraet ansicht="seite" massketten="voll" className={styles.geraetSeite} />
      </div>
    </Abschnitt>
  );
}

/**
 * Themenseite Wärmepumpen (E-028, Zeichnung 2.0 nach E-029). Tonfolge: Kopf Papier/Navy (Außeneinheit von vorn mit
 * Maßketten) · Die Marken Papier (Etiketten-Kästchen der Hersteller, darunter die Partnerstufen mit ihren belegten
 * Zusätzen) · Je Stelle Wand (die Aufgaben mit Wärmepumpen im Wortlaut der Anzeigen) · Technik Papier (Kältekreis,
 * Anlagenschema, Gerät) · Lernen Navy · Weitere Themen Wand · Kontakt Papier.
 */
export function WaermepumpenSeite({ text }: { text: WaermepumpenPageText }) {
  return (
    <>
      <ThemaKopf
        text={text}
        pfad={themaPfad(getThema('waermepumpen'))}
        bildBreit
        panel={<Aussengeraet ansicht="vorne" massketten="haupt" schriftfeld={false} titel={geraetTitel(COMPRESS_AW_S, 'vorne')} massSchrift={64} />}
      />

      <Abschnitt kopf={text.marken.kopf} trenner>
        <ul className={styles.marken} aria-label="Hersteller">
          {text.marken.namen.map((name) => (
            <li key={name} className={styles.marke}>
              <Icon name="waermepumpe" size="lg" className="shrink-0" />
              <span>{name}</span>
            </li>
          ))}
        </ul>
        <ul className={styles.partner} aria-label="Partnerstufen">
          {text.marken.partner.map((saeule) => (
            <li key={saeule.name} className={styles.partnerZeile}>
              <p className="text-title-3 text-brand">{saeule.name}</p>
              {saeule.zusatz ? <p className={styles.partnerZusatz}>{saeule.zusatz}</p> : null}
            </li>
          ))}
        </ul>
      </Abschnitt>

      <Abschnitt kopf={text.arbeit.kopf} tone="wand">
        {text.arbeit.stellen.length > 0 ? (
          <ul className={styles.pakete} aria-label={text.arbeit.kopf.heading}>
            {text.arbeit.stellen.map((stelle) => (
              <li key={stelle.jobId} className={styles.paket}>
                <h3 className="text-title-3 text-brand">
                  <Link href={stelle.href} className={styles.stellenLink} data-motion="druck">
                    {bindSeparators(withSoftHyphens(stelle.titel, stelle.titleShy))}
                  </Link>
                </h3>
                {stelle.einleitung ? <p className={styles.paketText}>{stelle.einleitung}</p> : null}
                <ul className={styles.aufgaben}>
                  {stelle.aufgaben.map((aufgabe) => (
                    <li key={aufgabe}>{aufgabe}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : null}
        <div className={styles.text}>
          <Saetze saetze={[text.arbeit.schluss]} />
        </div>
      </Abschnitt>

      <Technik />

      <Kaestenband kopf={text.lernen.kopf} kaesten={text.lernen.kaesten} />

      <WeitereThemen weitere={text.weitere} />
      <Kontakt kontakt={text.kontakt} whatsapp={text.whatsapp} />
    </>
  );
}
