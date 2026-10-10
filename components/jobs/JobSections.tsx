import { Icon } from '@/components/icons';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { FACTS } from '@/lib/content/facts';
import { getJobSections, type JobSection } from '@/lib/jobs/format';
import type { Job } from '@/lib/jobs/registry';
import { cn } from '@/lib/utils/cn';
import { PackageList, type PackageListItem } from './PackageList';
import { STELLE_ANKER, paketIcon, vorteilIcon } from './stelle/stelle-text';
import { splitLabel } from './text';

export interface JobSectionsProps {
  job: Job;
  className?: string;
}

type SectionId = JobSection['id'];

/** Shown elsewhere on the page: the apply text in #bewerben. The intro leads the first band. */
const RENDERED_ELSEWHERE = new Set<SectionId>(['intro', 'bewerben']);

function toRows(items: readonly string[]): PackageListItem[] {
  return items.map((item, i) => {
    const split = splitLabel(item);
    return split ? { label: split.label, text: split.value } : { label: String(i + 1), text: item };
  });
}

const headingId = (id: SectionId) => `stelle-${id}`;

/** h2 eines Abschnitts in Bricolage und Marken-Navy: `gross` wie die Abschnittsköpfe der Startseite (title-1). */
function Ueberschrift({ id, children, gross = false }: { id: SectionId; children: string; gross?: boolean }) {
  return (
    <h2 id={headingId(id)} className={cn('text-brand', gross ? 'text-title-1' : 'text-title-2')}>
      {children}
    </h2>
  );
}

/** „Das erwartet dich“: Aufgaben als Abgänge mit Nummer in Martian Mono an einer Navy-Linie. */
function Aufgaben({ items }: { items: readonly string[] }) {
  return (
    <ol className="flex flex-col">
      {items.map((item, i) => (
        <li key={item} className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-6 border-b border-line py-6 first:pt-2">
          <span aria-hidden="true" className="font-mass text-lead font-semibold text-brand">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="max-w-prose text-lead text-ink">{item}</span>
        </li>
      ))}
    </ol>
  );
}

/** „Das bringst du mit“: Haken in Navy, auf Papier in einer Karte mit Markenrand. */
function Anforderungen({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-body text-ink">
          <span className="flex h-[1lh] shrink-0 items-center">
            <Icon name="check" size="md" className="text-brand" />
          </span>
          <span className="max-w-prose">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** „Das bekommst du“: jede Zusage mit Icon der eigenen Familie, Kurzform als Titel, Wortlaut des Fakts darunter. */
function Vorteile({ job }: { job: Job }) {
  return (
    <ul className="grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      {job.benefitFactIds.map((id) => (
        <li
          key={id}
          className="grid grid-cols-[auto_minmax(0,1fr)] content-start gap-x-4 gap-y-2 border-t-(length:--m-strich) border-brand pt-6 sm:grid-cols-1 sm:gap-y-3"
        >
          {/* Handy: Icon links neben Titel und Text (kürzer); ab sm darüber */}
          <span className="row-span-2 flex size-11 items-center justify-center rounded-1 border-(length:--m-strich) border-brand text-brand sm:row-span-1">
            <Icon name={vorteilIcon(id)} size="lg" />
          </span>
          <h3 className="self-center text-title-3 text-brand sm:self-auto">{FACTS[id].short}</h3>
          <p className="col-start-2 max-w-prose text-body text-ink-muted sm:col-start-1">{FACTS[id].long}</p>
        </li>
      ))}
    </ul>
  );
}

/** „Dein Paket“: Karte mit Markenrand wie das Paket im Konfigurator der Startseite, Etiketten in Versalien. */
function Paket({ job }: { job: Job }) {
  return (
    <dl className="flex flex-col">
      {job.packageExtras.map((extra) => (
        <div key={extra.label} className="flex gap-4 border-b border-line py-4 last:border-b-0 last:pb-0 first:pt-0">
          <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center text-brand">
            <Icon name={paketIcon(extra.label)} size="lg" />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <dt className="text-etikett text-ink-muted">{extra.label}</dt>
            <dd className="text-body text-ink">{extra.text}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

/**
 * Inhalt der Stellenseite in der Reihenfolge von getJobSections(), derselben Quelle wie die
 * JobPosting-Beschreibung und die Feeds: Seite, Schema und Stellenbörsen laufen nie auseinander.
 * Zwei Bänder in der Tonfolge des Einstiegs (E-023), je mit Leitungstrenner:
 * - Wand: die Einleitung (intro) als Lead unter „Das erwartet dich“, daneben „Das bringst du mit“
 *   (Sprungziel des Zweitwegs im Kopf). Der Kopf bleibt so kurz wie der Einstieg: Knopf über dem Falz.
 * - Papier: „Das bekommst du“, darunter „Dein Paket“ und „Auf einen Blick“ nebeneinander.
 */
export function JobSections({ job, className }: JobSectionsProps) {
  const sections = new Map(
    getJobSections(job)
      .filter((s) => !RENDERED_ELSEWHERE.has(s.id) && s.heading)
      .map((s) => [s.id, s] as const),
  );
  const intro = job.intro;
  const aufgaben = sections.get('aufgaben');
  const anforderungen = sections.get('anforderungen');
  const vorteile = sections.get('vorteile');
  const paket = sections.get('paket');
  const eckdaten = sections.get('eckdaten');

  return (
    <div className={className}>
      <Section id={STELLE_ANKER.aufgaben} tone="wand" trenner>
        <Container className="grid gap-16 lg:grid-cols-12 lg:gap-x-12">
          {aufgaben?.heading ? (
            <section aria-labelledby={headingId('aufgaben')} className="flex flex-col gap-8 lg:col-span-7">
              <div className="flex flex-col gap-4">
                <p className="text-etikett text-ink-muted">Die Stelle</p>
                <Ueberschrift id="aufgaben" gross>
                  {aufgaben.heading}
                </Ueberschrift>
                <p className="max-w-prose text-body text-ink-muted md:text-lead">{intro}</p>
              </div>
              <Aufgaben items={aufgaben.items ?? []} />
            </section>
          ) : null}
          {anforderungen?.heading ? (
            <section
              aria-labelledby={headingId('anforderungen')}
              className="flex flex-col gap-6 self-start rounded-2 border-(length:--m-strich) border-brand bg-surface p-6 sm:p-8 lg:col-span-5 lg:mt-16"
            >
              <Ueberschrift id="anforderungen">{anforderungen.heading}</Ueberschrift>
              <Anforderungen items={anforderungen.items ?? []} />
            </section>
          ) : null}
        </Container>
      </Section>

      <Section tone="papier" trenner="62%">
        <Container className="flex flex-col gap-16">
          {vorteile?.heading ? (
            <section aria-labelledby={headingId('vorteile')} className="flex flex-col gap-12">
              <div className="flex flex-col gap-4">
                <p className="text-etikett text-ink-muted">Vorteile</p>
                <Ueberschrift id="vorteile" gross>
                  {vorteile.heading}
                </Ueberschrift>
              </div>
              <Vorteile job={job} />
            </section>
          ) : null}

          {paket?.heading || eckdaten?.heading ? (
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-x-12">
              {paket?.heading ? (
                <section
                  aria-labelledby={headingId('paket')}
                  className="flex flex-col gap-6 rounded-2 border-(length:--m-strich) border-brand p-6 sm:p-8"
                >
                  <Ueberschrift id="paket">{paket.heading}</Ueberschrift>
                  <Paket job={job} />
                </section>
              ) : null}
              {eckdaten?.heading ? (
                <section aria-labelledby={headingId('eckdaten')} className="flex flex-col gap-6 sm:pt-8">
                  <Ueberschrift id="eckdaten">{eckdaten.heading}</Ueberschrift>
                  <PackageList items={toRows(eckdaten.items ?? [])} />
                </section>
              ) : null}
            </div>
          ) : null}
        </Container>
      </Section>
    </div>
  );
}
