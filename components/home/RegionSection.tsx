import { Fragment } from 'react';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { gebietText } from '@/components/jobs/liste/inhalt-text';
import { RegionMap } from '@/components/maps';
import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';
import { GEBIET_ETIKETT, headlineSaetze } from './gebiet/gebiet-text';
import { WeitereOrte } from './gebiet/WeitereOrte';
import { Werkstatt } from './gebiet/Werkstatt';
import { SectionHeader } from './SectionHeader';

/**
 * #einsatzgebiet (B Runde 1 „.gebiet“, E-START-029…-040): Radius 15/25/35 km als Plan mit Lahn,
 * Dill, A45 und B49, Ortswahl mit Entfernung und Fahrzeit (Pendlerrechner), weitere Orte, Werkstatt
 * mit Routenlink. Google Maps nur nach Zwei-Klick-Einwilligung (unverändert). Der Meilenstein 2026
 * steht bei „Über uns“ (E-START-031, R3-HOME-04).
 *
 * Einleitung wie auf /jobs (Prüfrunde 4 D4-1, gebietText): Ist eine Stelle am Firmensitz live (Bürofachkraft, Arbeitsort
 * ohne Radius), gilt REGION.summary nur für Baustellen und Kundendienst, danach „Das Büro ist am Firmensitz.“; sonst
 * steht REGION.summary im Bestandswortlaut. Die Stellenliste darüber zeigt dieselben live Stellen (JobList).
 */
export interface RegionSectionProps {
  /** Stichtag für „live“ (Tests); Standard: jetzt. */
  now?: Date;
}

export function RegionSection({ now = new Date() }: RegionSectionProps) {
  const jobs = getActiveJobs().filter((job) => isJobLive(job, now));
  return (
    <Section id="einsatzgebiet" aria-labelledby="einsatzgebiet-title">
      <Container>
        <RegionMap
          header={
            <SectionHeader
              id="einsatzgebiet-title"
              eyebrow={GEBIET_ETIKETT}
              title={headlineSaetze().map((satz, i) => (
                <Fragment key={satz}>
                  {i > 0 && ' '}
                  <span className="block">{satz}</span>
                </Fragment>
              ))}
              lead={gebietText(jobs)}
              klammer
            />
          }
        />
        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-x-16">
          <WeitereOrte />
          <Werkstatt />
        </div>
      </Container>
    </Section>
  );
}
