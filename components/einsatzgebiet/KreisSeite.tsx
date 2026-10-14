import { JobAbgaenge } from '@/components/jobs/JobCard';
import { LISTEN_MIKROTEXT, listenName } from '@/components/jobs/liste/liste-text';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Seitenkopf } from '@/components/seitenkopf';
import { Pfad } from '@/components/seitenkopf/Pfad';
import { APPLY_PATH, SHORT_APPLY_LABEL } from '@/components/site/nav';
import { Entfernungsleiste } from '@/components/zeichnung/Entfernungsleiste';
import type { Job } from '@/lib/jobs/registry';
import { kreisPfad, pfadItems } from '@/lib/places/jsonld';
import { getKreisPlaces, getPublishedPlaces, type Kreis } from '@/lib/places/registry';
import { OEPNV_QUELLE } from '@/lib/places/oepnv';
import { OEPNV_QUELLENZEILE, ORTE_ANKER, type KreisPageText, type KreisSectionId, type TextSection } from '@/lib/places/text';
import { cn } from '@/lib/utils/cn';
import { Abschnittskopf, Absaetze, Faktenband, Kontakt, Messhinweis, Ortstabelle, Quellenzeile, bloecke, titelId } from './Bausteine';
import { ETIKETT, leisteLegende, planBeschreibungKreis } from './einsatzgebiet-text';
import styles from './einsatzgebiet.module.css';
import { gebietView } from './karte';
import { OrtTitel } from './OrtTitel';
import { OrtPlan } from './Plaene';

export interface KreisSeiteProps {
  kreis: Kreis;
  text: KreisPageText;
  jobs: readonly Job[];
}

const abschnitt = (text: KreisPageText, id: KreisSectionId): TextSection<KreisSectionId> | undefined =>
  text.sections.find((section) => section.id === id);

/**
 * Kreis-Hub (E-028). Tonfolge: Pfad und Kopf (Navy mit der senkrechten Entfernungsleiste: jeder Ort zweigt an seiner
 * Strecke vom Leitungspaar ab) · Wege in Zahlen mit dem Plan, die Orte des Kreises hervorgehoben, darunter Bus und
 * Bahn im Kreis · Ortstabelle Wand · Stellen Papier · Band Navy · Kontakt Papier.
 */
export function KreisSeite({ kreis, text, jobs }: KreisSeiteProps) {
  const lead = abschnitt(text, 'lead');
  const zahlen = abschnitt(text, 'zahlen');
  const oepnv = abschnitt(text, 'oepnv');
  const orte = abschnitt(text, 'orte');
  const stellen = abschnitt(text, 'stellen');
  const band = abschnitt(text, 'band');
  const kontakt = abschnitt(text, 'kontakt');
  const zahlenBloecke = bloecke(zahlen);
  // Wetzlar und seine Stadtteile liegen dicht um das Haus: Ihre Namen nennen das Haus („Wetzlar“) und die Tabelle.
  const stadtOrte = getKreisPlaces(kreis.id)
    .filter((place) => place.kind !== 'gemeinde')
    .map((place) => place.id);
  const stellenBloecke = bloecke(stellen);
  // Alle Orte des Gebiets als leise Sprossen in der Leiste: zeigt, wo der Kreis im Gebiet liegt
  const alleKm = getPublishedPlaces().map((place) => place.commute.distanceKm);

  return (
    <>
      <Pfad items={pfadItems(kreisPfad(kreis))} />
      <div className={styles.kopf} data-motion="erdleitung">
        <Seitenkopf
          variante="erzaehl"
          bildBreit
          etikett={text.etikett}
          titel={<OrtTitel h1={text.meta.h1} name={kreis.name} />}
          einleitung={lead ? <Absaetze blocks={lead.blocks} /> : null}
          aktion={{ href: APPLY_PATH, label: SHORT_APPLY_LABEL }}
          mikrotext={LISTEN_MIKROTEXT}
          zweitweg={text.zweitweg}
          // Am Handy ohne Nächsten und Weitesten Ort: Die Leiste darüber zeigt beide als erste und letzte Zeile
          masse={text.masse.map((mass, i) => (i < 2 ? { ...mass, nurBreit: true } : mass))}
          masseZweispaltig
          panel={
            <div className={styles.kopfbild}>
              {/* Auf jeder Breite senkrecht: jeder Ort zweigt an seiner Strecke vom Leitungspaar ab, mit Namen (eine
                  Zeile je Ort, mindestens zehn Zeilen) */}
              <Entfernungsleiste
                ausrichtung="senkrecht"
                orte={text.rows.map((row) => ({ id: row.placeId, name: row.name, km: row.distanceKm }))}
                hintergrundKm={alleKm}
                titel={`Die ${text.rows.length} Orte ${kreis.dative} auf der Skala bis 35 km, nach Strecke zum Firmensitz; leise Striche: alle ${alleKm.length} Orte des Gebiets`}
              />
              <p className={cn(styles.leisteLegende, 'text-etikett text-ink-2')} aria-hidden="true">
                {leisteLegende(alleKm.length)}
              </p>
            </div>
          }
        />
      </div>

      {zahlen ? (
        <Section tone="papier" trenner aria-labelledby={titelId('zahlen')}>
          <Container className={`${styles.zweiSpalten} ${styles.zweiSpaltenKarte}`}>
            <div className={styles.text}>
              <Abschnittskopf id={titelId('zahlen')} eyebrow={ETIKETT.zahlen} title={zahlen.heading} klammer />
              <Absaetze blocks={zahlenBloecke.ort} lead />
              {zahlenBloecke.gemeinsam.map((block) => (
                <Messhinweis key={block.text} text={block.text} />
              ))}
              {/* Bus und Bahn im Kreis (Plan §B): Zusammenfassung der Orte, die Einzelheiten auf jeder Ortsseite */}
              {oepnv ? (
                <section aria-labelledby={titelId('oepnv')} className={styles.text}>
                  <h3 id={titelId('oepnv')} className={styles.frage}>
                    {oepnv.heading}
                  </h3>
                  <Absaetze blocks={oepnv.blocks} />
                  <Quellenzeile text={OEPNV_QUELLENZEILE} lizenz={{ label: OEPNV_QUELLE.lizenz, href: OEPNV_QUELLE.lizenzUrl }} />
                </section>
              ) : null}
            </div>
            <OrtPlan
              view={gebietView(35)}
              emphasizeIds={text.rows.map((row) => row.placeId)}
              ohneNamen={stadtOrte}
              id={`plan-${kreis.id}`}
              beschreibung={planBeschreibungKreis(kreis.dative)}
            />
          </Container>
        </Section>
      ) : null}

      {orte ? (
        <Section id={ORTE_ANKER} tone="wand" trenner="62%" aria-labelledby={titelId('orte')}>
          <Container className="flex flex-col gap-section-sm">
            <Abschnittskopf id={titelId('orte')} eyebrow={ETIKETT.orte} title={orte.heading} />
            <Ortstabelle zeilen={text.rows} caption={`${orte.heading}, nach Strecke zum Firmensitz`} />
          </Container>
        </Section>
      ) : null}

      {stellen ? (
        <Section id="stellen" tone="papier" trenner aria-labelledby={titelId('stellen')}>
          <Container className="flex flex-col gap-section-sm">
            <Abschnittskopf id={titelId('stellen')} eyebrow={ETIKETT.stellen} title={stellen.heading} lead={stellenBloecke.gemeinsam[0]?.text} />
            {jobs.length > 0 ? <JobAbgaenge jobs={jobs} headingLevel="h3" aria-label={listenName(jobs.length)} /> : null}
            {stellenBloecke.gemeinsam.slice(1).map((block) => (
              <p key={block.text} className={styles.absatz}>
                {block.text}
              </p>
            ))}
          </Container>
        </Section>
      ) : null}

      {band ? <Faktenband section={band} factIds={text.bandFactIds} /> : null}
      {kontakt ? <Kontakt section={kontakt} whatsappMessage={text.whatsappGreeting} /> : null}
    </>
  );
}
