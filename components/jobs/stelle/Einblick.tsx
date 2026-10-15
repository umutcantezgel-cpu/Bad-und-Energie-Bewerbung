import Image from 'next/image';
import { Icon } from '@/components/icons';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { TextLink } from '@/components/ui/TextLink';
import type { Job } from '@/lib/jobs/registry';
import { PackageList } from '../PackageList';
import { BUERO_SZENEN } from '@/lib/zeichnung/buero/szenen';
import { bueroSzenePfad } from '@/lib/zeichnung/buero/svg';
import { ARBEITSWEG_LINK, EINBLICK_ANKER, einblick, type EinblickSzenen, type Textteil } from './einblick-text';

export interface EinblickProps {
  job: Job;
  /** Stichtag für „live“ der verlinkten Nachbarstellen (Tests); Standard: jetzt. */
  now?: Date;
}

/** Fließtext mit Verweisen auf andere Stellen (unterstrichene Textlinks im Satz). */
function Fliesstext({ teile }: { teile: readonly Textteil[] }) {
  return (
    <>
      {teile.map((teil, i) =>
        typeof teil === 'string' ? (
          teil
        ) : (
          <TextLink key={i} href={teil.href}>
            {teil.label}
          </TextLink>
        ),
      )}
    </>
  );
}

/**
 * Büro (E-031): die vier Szenen der Themenseite als stille Dateien im Raster 2 × 2 (still im Endzustand, lazy geladen,
 * nie inline: scripts/qa/check-css-chunks.mjs), je mit Titel, dazu der Weg zur Themenseite. Dekorativ (alt leer): Den
 * Inhalt sagen die Punkte darüber und die Titel.
 */
function Szenen({ szenen }: { szenen: EinblickSzenen }) {
  return (
    <div className="flex flex-col gap-4">
      <ul className="grid grid-cols-2 gap-4 sm:gap-6">
        {szenen.bilder.map((bild) => (
          <li key={bild.art}>
            <figure className="m-0 flex flex-col gap-2" data-zeichnung={`buero-${bild.art}`}>
              <Image
                src={bueroSzenePfad(bild.art)}
                alt=""
                width={BUERO_SZENEN[bild.art].rahmen.breite}
                height={BUERO_SZENEN[bild.art].rahmen.hoehe}
                loading="lazy"
                unoptimized
                className="block h-auto w-full"
              />
              <figcaption className="text-etikett text-ink-muted">{bild.titel}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <TextLink href={szenen.link.href} standalone className="self-start">
        {szenen.link.label}
        <Icon name="arrow-right" size="sm" className="shrink-0" />
      </TextLink>
    </div>
  );
}

/**
 * Band „Einblick“ der Stellenseite (V6-G2) auf der Wand, zwischen „Das bekommst du“ (Papier) und der Stimme
 * aus dem Team (Navy): links Arbeit und Abläufe mit dem Unterschied zu den Nachbarstellen (Karte mit
 * Markenrand), rechts das Einsatzgebiet mit Entfernung und Fahrzeit als Maße und dem Weg zur Gebietsseite
 * (ARBEITSWEG_LINK, E-028). Texte aus einblick-text.ts.
 */
export function Einblick({ job, now }: EinblickProps) {
  const inhalt = einblick(job, now);
  if (!inhalt) return null;
  const { arbeit, vergleich, gebiet } = inhalt;

  return (
    <Section tone="wand" trenner>
      <Container className="grid gap-16 lg:grid-cols-12 lg:gap-x-12">
        <section aria-labelledby={EINBLICK_ANKER.arbeit} className="flex flex-col gap-8 lg:col-span-7">
          <div className="flex flex-col gap-4">
            <p className="text-etikett text-ink-muted">{arbeit.etikett}</p>
            <h2 id={EINBLICK_ANKER.arbeit} className="text-title-1 text-brand">
              {arbeit.titel}
            </h2>
            <p className="max-w-prose text-body text-ink-muted md:text-lead">{arbeit.einleitung}</p>
          </div>
          <ul className="flex flex-col">
            {arbeit.punkte.map((punkt) => (
              <li key={punkt.titel} className="flex flex-col gap-2 border-b border-line py-6 first:pt-2">
                <h3 className="text-title-3 text-brand">{punkt.titel}</h3>
                <p className="max-w-prose text-body text-ink">{punkt.text}</p>
              </li>
            ))}
          </ul>
          {arbeit.szenen ? <Szenen szenen={arbeit.szenen} /> : null}
          {vergleich ? (
            <div className="flex flex-col gap-3 rounded-2 border-(length:--m-strich) border-brand bg-surface p-6 sm:p-8">
              <h3 className="text-title-3 text-brand">{vergleich.titel}</h3>
              <p className="max-w-prose text-body text-ink">
                <Fliesstext teile={vergleich.teile} />
              </p>
            </div>
          ) : null}
        </section>

        <section aria-labelledby={EINBLICK_ANKER.gebiet} className="flex flex-col gap-6 self-start lg:col-span-5 lg:mt-16">
          <div className="flex flex-col gap-4">
            <p className="text-etikett text-ink-muted">{gebiet.etikett}</p>
            <h2 id={EINBLICK_ANKER.gebiet} className="text-title-2 text-brand">
              {gebiet.titel}
            </h2>
            <p className="max-w-prose text-body text-ink-muted">{gebiet.einleitung}</p>
          </div>
          <PackageList items={gebiet.orte} />
          {gebiet.nachsatz ? <p className="max-w-prose text-body text-ink-muted">{gebiet.nachsatz}</p> : null}
          <TextLink href={ARBEITSWEG_LINK.href} standalone className="self-start">
            {ARBEITSWEG_LINK.label}
            <Icon name="arrow-right" size="sm" className="shrink-0" />
          </TextLink>
        </section>
      </Container>
    </Section>
  );
}
