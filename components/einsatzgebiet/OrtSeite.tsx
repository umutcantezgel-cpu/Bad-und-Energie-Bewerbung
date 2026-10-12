import { routeUrl } from '@/components/home/gebiet/gebiet-text';
import { Icon } from '@/components/icons';
import { JobAbgaenge } from '@/components/jobs/JobCard';
import { LISTEN_MIKROTEXT, listenName, listenZweitweg } from '@/components/jobs/liste/liste-text';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { Seitenkopf } from '@/components/seitenkopf';
import { Pfad } from '@/components/seitenkopf/Pfad';
import { APPLY_PATH, SHORT_APPLY_LABEL } from '@/components/site/nav';
import { TextLink } from '@/components/ui/TextLink';
import { Entfernungsleiste } from '@/components/zeichnung/Entfernungsleiste';
import { Pendelweg } from '@/components/zeichnung/Pendelweg';
import type { Job } from '@/lib/jobs/registry';
import { HEADQUARTERS, airKmBetween, bearingDeg, neighborsOf } from '@/lib/places/derive';
import { pfadItems, placePfad } from '@/lib/places/jsonld';
import {
  EINSATZGEBIET_PATH,
  getKreisPlaces,
  getPlaceById,
  getPlaceKreis,
  getPublishedPlaces,
  getStadtteile,
  kreisPath,
  placePath,
  type Place,
} from '@/lib/places/registry';
import {
  EINSATZGEBIET_LINK_LABEL,
  type LinkGruppe,
  type PlacePageText,
  type PlaceSectionId,
  type TextSection,
} from '@/lib/places/text';
import { cn } from '@/lib/utils/cn';
import { Abschnittskopf, Absaetze, Faktenband, Kontakt, Messhinweis, OrtsKarten, bloecke, kartenWerte, titelId, type OrtsKarteDaten } from './Bausteine';
import { ETIKETT, NEUER_TAB, planBeschreibungOrt, inDerselbenRichtung } from './einsatzgebiet-text';
import styles from './einsatzgebiet.module.css';
import { placeView } from './karte';
import { OrtTitel } from './OrtTitel';
import { OrtPlan } from './Plaene';

export interface OrtSeiteProps {
  place: Place;
  text: PlacePageText;
  /** Die Stellen, die gerade live sind (dieselben, aus denen `text` gebaut ist). */
  jobs: readonly Job[];
}

const abschnitt = (text: PlacePageText, id: PlaceSectionId): TextSection<PlaceSectionId> | undefined =>
  text.sections.find((section) => section.id === id);

/**
 * Ortsseite (E-028), Erzählseite im Design der Stellenseite. Tonfolge: Pfad und Kopf Papier/Navy (Pendelweg) ·
 * Arbeitsweg Papier (Ortsblöcke, Plan, Entfernungsleiste, Messhinweis, Route) · Stellen Wand · Nachbarorte, Stadtteile
 * und Kreis Papier · Band Navy (Fakten) · Kontakt Papier · Fuß Navy. Jeder Satz kommt aus lib/places/text.ts.
 */
export function OrtSeite({ place, text, jobs }: OrtSeiteProps) {
  const kreis = getPlaceKreis(place);
  const published = getPublishedPlaces();
  const lead = abschnitt(text, 'lead');
  const arbeitsweg = bloecke(abschnitt(text, 'arbeitsweg'));
  const stellen = abschnitt(text, 'stellen');
  const nachbarn = abschnitt(text, 'nachbarn');
  const stadtteile = abschnitt(text, 'stadtteile');
  const kreisAbschnitt = abschnitt(text, 'kreis');
  const band = abschnitt(text, 'band');
  const kontakt = abschnitt(text, 'kontakt');
  const nachbarOrte = neighborsOf(place, published, 4);
  const kreisOrte = getKreisPlaces(place.kreisId);

  // Ortskarten nach der Gruppe ihres Links (lib/places/text.ts): die Nachbarn mit Abstand, darunter abgesetzt die
  // weiteren Orte derselben Richtung bzw. des kleinen Kreises; die Stadtteile stehen nur in ihrem eigenen Abschnitt.
  const karte = (p: Place, mitAbstand: boolean): OrtsKarteDaten => ({
    id: p.id,
    name: p.name,
    href: placePath(p),
    werte: kartenWerte(p.commute.distanceKm, p.commute.minutes, mitAbstand ? airKmBetween(place, p) : undefined),
  });
  const orteDerGruppe = (...gruppen: LinkGruppe[]) =>
    text.links
      .filter((link) => link.gruppe !== undefined && gruppen.includes(link.gruppe))
      .map((link) => published.find((p) => placePath(p) === link.href))
      .filter((p): p is Place => p !== undefined && p.id !== place.id);
  const karten = orteDerGruppe('nachbar').map((p) => karte(p, true));
  const richtungKarten = orteDerGruppe('richtung').map((p) => karte(p, true));
  const kreisKarten = orteDerGruppe('kreisort').map((p) => karte(p, true));
  const stadtteilKarten = orteDerGruppe('stadtteil').map((p) => karte(p, false));
  const eltern = place.parentId ? getPlaceById(place.parentId) : undefined;
  const stellenBloecke = bloecke(stellen);

  return (
    <>
      <Pfad items={pfadItems(placePfad(place))} />
      <div className={styles.kopf} data-motion="erdleitung">
        <Seitenkopf
          variante="erzaehl"
          etikett={text.etikett}
          titel={<OrtTitel h1={text.meta.h1} name={place.name} />}
          einleitung={lead ? <Absaetze blocks={lead.blocks} /> : null}
          aktion={{ href: APPLY_PATH, label: SHORT_APPLY_LABEL }}
          mikrotext={LISTEN_MIKROTEXT}
          zweitweg={listenZweitweg(jobs.length)}
          unterzeile={text.unterzeile.join(' ')}
          masse={text.masse}
          panel={
            <div className={styles.kopfbild}>
              <Pendelweg ort={place.name} kursGrad={bearingDeg(HEADQUARTERS, place)} strasseKm={place.commute.distanceKm} />
            </div>
          }
        />
      </div>

      {/* Arbeitsweg: Ortsblöcke, Messhinweis und Route links, der Plan rechts, darunter die Entfernungsleiste */}
      <Section id="arbeitsweg" tone="papier" trenner aria-labelledby={titelId('arbeitsweg')}>
        <Container className="flex flex-col gap-section-sm">
          <div className={styles.zweiSpalten}>
            <div className={styles.text}>
              <Abschnittskopf id={titelId('arbeitsweg')} eyebrow={ETIKETT.arbeitsweg} title={abschnitt(text, 'arbeitsweg')?.heading ?? ''} klammer />
              <Absaetze blocks={arbeitsweg.ort} lead />
              {arbeitsweg.gemeinsam.map((block) => (
                <Messhinweis key={block.text} text={block.text} />
              ))}
              <a
                href={routeUrl(undefined, { latitude: place.lat, longitude: place.lng })}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(styles.weg, 'rounded-1')}
                data-motion="druck"
              >
                {text.routeLabel}
                <Icon name="arrow-right" size="sm" className="shrink-0" />
                <span className="sr-only">{NEUER_TAB}</span>
              </a>
            </div>
            <OrtPlan
              view={placeView(place, nachbarOrte.map((n) => n.place))}
              selectedId={place.id}
              emphasizeIds={[place.id, ...nachbarOrte.map((n) => n.place.id)]}
              id={`plan-${place.id}`}
              beschreibung={planBeschreibungOrt(place.name, nachbarOrte.map((n) => n.place.name))}
            />
          </div>
          <div className={styles.leistenBlock}>
            <p className="text-etikett text-ink-2">
              {kreis.hasHub
                ? `Strecke zum Firmensitz · ${kreis.shortName}`
                : `Strecke zum Firmensitz · ${kreis.shortName} · Striche: alle ${published.length} Orte`}
            </p>
            <Entfernungsleiste
              orte={kreisOrte.map((p) => ({ id: p.id, name: p.name, km: p.commute.distanceKm }))}
              aktuellId={place.id}
              hintergrundKm={kreis.hasHub ? [] : published.map((p) => p.commute.distanceKm)}
              titel={`${place.name}: ${place.commute.distanceKm} km bis zum Firmensitz, auf der Skala bis 35 km mit den Orten ${kreis.dative}`}
            />
          </div>
        </Container>
      </Section>

      {/* Stellen: alle live Stellen mit Gehalt (gemeinsam) */}
      {stellen ? (
        <Section id="stellen" tone="wand" trenner="62%" aria-labelledby={titelId('stellen')}>
          <Container className="flex flex-col gap-section-sm">
            <Abschnittskopf
              id={titelId('stellen')}
              eyebrow={ETIKETT.stellen}
              title={stellen.heading}
              lead={stellenBloecke.gemeinsam[0]?.text}
            />
            {jobs.length > 0 ? <JobAbgaenge jobs={jobs} headingLevel="h3" aria-label={listenName(jobs.length)} /> : null}
            {stellenBloecke.gemeinsam.slice(1).map((block) => (
              <p key={block.text} className={styles.absatz}>
                {block.text}
              </p>
            ))}
          </Container>
        </Section>
      ) : null}

      {/* Lage: Nachbarorte, Stadtteile (Wetzlar), Kreis */}
      {nachbarn ? (
        <Section tone="papier" trenner aria-labelledby={titelId('nachbarn')}>
          <Container className="flex flex-col gap-section-sm">
            <div className={styles.zweiSpalten}>
              <div className={styles.text}>
                <Abschnittskopf id={titelId('nachbarn')} eyebrow={ETIKETT.nachbarn} title={nachbarn.heading} klammer />
                <Absaetze blocks={nachbarn.blocks} lead />
              </div>
              <div className={styles.kartenStapel}>
                {karten.length > 0 ? <OrtsKarten orte={karten} label={nachbarn.heading} /> : null}
                {richtungKarten.length > 0 ? (
                  <div className={styles.kartenGruppe}>
                    <p className="text-etikett text-ink-2">{inDerselbenRichtung(place)}</p>
                    <OrtsKarten orte={richtungKarten} label={inDerselbenRichtung(place)} />
                  </div>
                ) : null}
                {kreisKarten.length > 0 ? (
                  <div className={styles.kartenGruppe}>
                    <p className="text-etikett text-ink-2">{`Ebenfalls ${kreis.dative}`}</p>
                    <OrtsKarten orte={kreisKarten} label={`Ebenfalls ${kreis.dative}`} />
                  </div>
                ) : null}
              </div>
            </div>

            {/* Stadtteile (nur Stadtseite): Text oben, die Karten darunter in der ganzen Breite, damit keine Spalte leer läuft */}
            {stadtteile ? (
              <section aria-labelledby={titelId('stadtteile')} className={styles.stadtteile}>
                <div className={styles.text}>
                  <Abschnittskopf id={titelId('stadtteile')} eyebrow={ETIKETT.stadtteile} title={stadtteile.heading} />
                  <Absaetze blocks={stadtteile.blocks} />
                </div>
                <OrtsKarten orte={stadtteilKarten} label={stadtteile.heading} breit />
              </section>
            ) : null}

            {kreisAbschnitt ? (
              <section aria-labelledby={titelId('kreis')} className={styles.zweiSpalten}>
                <div className={styles.text}>
                  <Abschnittskopf
                    id={titelId('kreis')}
                    eyebrow={place.kind === 'stadtteil' ? ETIKETT.stadt : ETIKETT.kreis}
                    title={kreisAbschnitt.heading}
                  />
                  <Absaetze blocks={kreisAbschnitt.blocks} />
                </div>
                <ul className={cn(styles.wege, 'flex-col items-start lg:pt-16')}>
                  {eltern?.status === 'published' ? (
                    <li>
                      <TextLink href={placePath(eltern)} standalone>
                        {eltern.name}
                        <Icon name="arrow-right" size="sm" className="shrink-0" />
                      </TextLink>
                    </li>
                  ) : null}
                  <li>
                    <TextLink href={kreisPath(kreis)} standalone>
                      {kreis.shortName}
                      <Icon name="arrow-right" size="sm" className="shrink-0" />
                    </TextLink>
                  </li>
                  <li>
                    <TextLink href={EINSATZGEBIET_PATH} standalone>
                      {EINSATZGEBIET_LINK_LABEL}
                      <Icon name="arrow-right" size="sm" className="shrink-0" />
                    </TextLink>
                  </li>
                </ul>
              </section>
            ) : null}
          </Container>
        </Section>
      ) : null}

      {band ? <Faktenband section={band} factIds={text.bandFactIds} /> : null}
      {kontakt ? <Kontakt section={kontakt} whatsappMessage={text.whatsappGreeting} /> : null}
    </>
  );
}
