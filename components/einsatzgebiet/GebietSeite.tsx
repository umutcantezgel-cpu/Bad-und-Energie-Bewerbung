import Link from 'next/link';
import { Icon } from '@/components/icons';
import { LISTEN_MIKROTEXT } from '@/components/jobs/liste/liste-text';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { RegionExplorerLazy } from '@/components/maps/RegionExplorerLazy';
import { Seitenkopf } from '@/components/seitenkopf';
import { Pfad } from '@/components/seitenkopf/Pfad';
import { APPLY_PATH, SHORT_APPLY_LABEL } from '@/components/site/nav';
import { Masskette } from '@/components/zeichnung/Masskette';
import { groupStats } from '@/lib/places/derive';
import { einsatzgebietPfad, pfadItems } from '@/lib/places/jsonld';
import { getHubKreise, getKreisPlaces, getKreise, kreisPath, placePath } from '@/lib/places/registry';
import {
  ORTE_ANKER,
  formatKm,
  formatMin,
  type EinsatzgebietPageText,
  type EinsatzgebietSectionId,
  type PlaceRow,
  type TextSection,
} from '@/lib/places/text';
import { Abschnittskopf, Absaetze, Faktenband, Messhinweis, OrtsKarten, bloecke, kartenWerte, titelId } from './Bausteine';
import { ETIKETT, VERZEICHNIS_TITEL } from './einsatzgebiet-text';
import styles from './einsatzgebiet.module.css';
import { GEBIET_LABEL_PRIORITY, GEBIET_MAP_DATA } from './karte';
import { OrtTitel } from './OrtTitel';
import { Gebietsplan } from './Plaene';

export interface GebietSeiteProps {
  text: EinsatzgebietPageText;
}

const abschnitt = (text: EinsatzgebietPageText, id: EinsatzgebietSectionId): TextSection<EinsatzgebietSectionId> | undefined =>
  text.sections.find((section) => section.id === id);

/** Erster Buchstabe für das Verzeichnis: Umlaute unter ihrem Grundbuchstaben (Ä → A). */
function buchstabe(name: string): string {
  return name.charAt(0).toLocaleUpperCase('de-DE').normalize('NFD').charAt(0);
}

function verzeichnis(rows: readonly PlaceRow[]): [string, PlaceRow[]][] {
  const gruppen = new Map<string, PlaceRow[]>();
  for (const row of [...rows].sort((a, b) => a.name.localeCompare(b.name, 'de'))) {
    const b = buchstabe(row.name);
    gruppen.set(b, [...(gruppen.get(b) ?? []), row]);
  }
  return [...gruppen];
}

/** Name des Gebiets in Bildgröße: der Teil der h1 vor dem Doppelpunkt („Unser Einsatzgebiet:“). */
function hauptteil(h1: string): string {
  const doppelpunkt = h1.indexOf(':');
  return doppelpunkt > 0 ? h1.slice(0, doppelpunkt + 1) : h1;
}

/**
 * Gebietsseite /einsatzgebiet (E-028). Tonfolge: Pfad und Kopf (Navy mit dem Gebietsplan, die Ringe ziehen sich auf)
 * · Ringe Papier mit dem Explorer aller Orte · Kreise Wand mit Karten der Kreis-Hubs und den Abschnitten der Kreise
 * ohne eigene Seite · Verzeichnis A–Z Papier · Band Navy.
 */
export function GebietSeite({ text }: GebietSeiteProps) {
  const lead = abschnitt(text, 'lead');
  const ringe = bloecke(abschnitt(text, 'ringe'));
  const ringeAbschnitt = abschnitt(text, 'ringe');
  const kreiseAbschnitt = abschnitt(text, 'kreise');
  const band = abschnitt(text, 'band');
  const kreise = getKreise();
  const hubs = getHubKreise();
  const kleine = new Map(kreise.filter((kreis) => !kreis.hasHub).map((kreis) => [kreis.slug, kreis]));

  return (
    <>
      <Pfad items={pfadItems(einsatzgebietPfad())} />
      <div className={styles.kopf} data-motion="erdleitung">
        <Seitenkopf
          variante="erzaehl"
          etikett={text.etikett}
          titel={<OrtTitel h1={text.meta.h1} name={hauptteil(text.meta.h1)} />}
          einleitung={lead ? <Absaetze blocks={lead.blocks} /> : null}
          aktion={{ href: APPLY_PATH, label: SHORT_APPLY_LABEL }}
          mikrotext={LISTEN_MIKROTEXT}
          zweitweg={text.zweitweg}
          masse={text.masse}
          panel={
            <Gebietsplan
              titel={`Plan des Einsatzgebiets: ${text.rows.length} Orte in ${kreise.length} Kreisen um den Firmensitz, Ringe 15, 25 und 35 km in Luftlinie`}
            />
          }
        />
      </div>

      {/* Ringe und Explorer: alle Orte wählbar, Plan mit Radius-Schalter (Code lädt erst in Reichweite) */}
      {ringeAbschnitt ? (
        <Section tone="papier" trenner aria-labelledby={titelId('ringe')}>
          <Container>
            <RegionExplorerLazy
              data={GEBIET_MAP_DATA}
              mapsAvailable={false}
              table={false}
              labelPriority={GEBIET_LABEL_PRIORITY}
              header={
                <div className={styles.text}>
                  <Abschnittskopf id={titelId('ringe')} eyebrow={ETIKETT.ringe} title={ringeAbschnitt.heading} klammer />
                  <Absaetze blocks={ringe.ort} lead />
                  {ringe.gemeinsam.map((block) => (
                    <Messhinweis key={block.text} text={block.text} />
                  ))}
                </div>
              }
            />
          </Container>
        </Section>
      ) : null}

      {/* Kreise: Karten der Kreis-Hubs, dann die Kreise ohne eigene Seite als Abschnitte (Anker = Kreis-Slug) */}
      {kreiseAbschnitt ? (
        <Section tone="wand" trenner="62%" aria-labelledby={titelId('kreise')}>
          <Container className="flex flex-col gap-section-sm">
            <div className={styles.text}>
              <Abschnittskopf id={titelId('kreise')} eyebrow={ETIKETT.kreise} title={kreiseAbschnitt.heading} />
              <Absaetze blocks={kreiseAbschnitt.blocks} />
            </div>
            <ul className={styles.kreisKarten}>
              {hubs.map((kreis) => {
                const stats = groupStats(getKreisPlaces(kreis.id));
                return (
                  <li key={kreis.id}>
                    <Link href={kreisPath(kreis)} className={styles.kreisKarte} data-motion="druck">
                      <span className={styles.kreisKarteName}>
                        {kreis.shortName}
                        <Icon name="arrow-right" size="md" className="shrink-0" />
                      </span>
                      <span className={styles.kreisKarteMasse}>
                        <Masskette wert={`${kreis.placeCount}`} name="Orte" />
                        <Masskette
                          wert={`${stats.nearest[0].commute.distanceKm}–${formatKm(stats.farthest[0].commute.distanceKm)}`}
                          name="Strecke"
                        />
                        <Masskette wert={formatMin(stats.medianMinutes)} name="Mittlere Fahrzeit" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {text.kleineKreise.map((section) => {
              const kreis = kleine.get(section.id);
              const orte = kreis ? getKreisPlaces(kreis.id) : [];
              return (
                <section key={section.id} id={section.id} aria-labelledby={titelId(section.id)} className={styles.kleinerKreis}>
                  <h3 id={titelId(section.id)} className="text-title-2 text-brand">
                    {section.heading}
                  </h3>
                  <Absaetze blocks={section.blocks} />
                  <OrtsKarten
                    breit
                    label={section.heading}
                    orte={orte.map((p) => ({ id: p.id, name: p.name, href: placePath(p), werte: kartenWerte(p.commute.distanceKm, p.commute.minutes) }))}
                  />
                </section>
              );
            })}
          </Container>
        </Section>
      ) : null}

      {/* Verzeichnis A–Z mit Strecke und Fahrzeit */}
      <Section id={ORTE_ANKER} tone="papier" trenner aria-labelledby={titelId(ORTE_ANKER)}>
        <Container className="flex flex-col gap-section-sm">
          <Abschnittskopf id={titelId(ORTE_ANKER)} eyebrow={ETIKETT.verzeichnis} title={VERZEICHNIS_TITEL} klammer />
          <ul className={styles.verzeichnis}>
            {verzeichnis(text.rows).map(([b, rows]) => (
              <li key={b} className={styles.buchstabe}>
                <span className={styles.buchstabeKopf} aria-hidden="true">
                  {b}
                </span>
                <ul className={styles.buchstabeListe}>
                  {rows.map((row) => (
                    <li key={row.placeId}>
                      <Link href={row.href} className={styles.eintrag}>
                        <span className={styles.eintragName}>{row.name}</span>
                        <span className={styles.eintragWerte}>{`${row.km} · ${row.min}`}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {band ? <Faktenband section={band} factIds={band.blocks.flatMap((block) => block.factIds ?? [])} /> : null}
    </>
  );
}
