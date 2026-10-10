import { TextLink } from '@/components/ui/TextLink';
import { REGION } from '@/lib/content/region';
import { cn } from '@/lib/utils/cn';

/**
 * Orte der Ortsliste im Fuß (E-SHELL-021): Wetzlar zuerst (Firmensitz), dann die Städte und Gemeinden
 * aus REGION.areas (SITE_CONFIG.serviceRegions) ohne die Stadtteile Wetzlars, ohne Doppelungen.
 * Nur Orte aus den Daten; „Hohenahr“ steht dort nicht (B17).
 */
export function footerPlaces(): string[] {
  const center = REGION.center.name;
  const names = REGION.areas.flatMap((area) =>
    area.name.startsWith(center) ? area.cities.filter((city) => city === center) : area.cities,
  );
  return [...new Set([center, ...names])];
}

/**
 * Einsatzgebiet-Ortsliste im Fuß (E-SHELL-021): eine ruhige Zeile mit den Orten und dem Weg zu
 * Entfernung und Fahrzeit auf der Startseite. Nennt bewusst keine Kilometerzahl (die steht im
 * Einstieg und im Abschnitt Einsatzgebiet). Die Gestaltung des Fußes folgt in R4.
 */
export function FooterPlaces({ className }: { className?: string }) {
  const places = footerPlaces();
  return (
    <section aria-labelledby="footer-einsatzgebiet" className={cn('flex flex-col gap-3', className)}>
      <h2 id="footer-einsatzgebiet" className="text-callout font-semibold text-ink">
        Einsatzgebiet
      </h2>
      <ul className="m-0 flex list-none flex-wrap gap-x-2 gap-y-1 p-0 text-callout text-ink-muted">
        {places.map((name, i) => (
          <li key={name} className="inline-flex items-center gap-2">
            {i === 0 ? (
              <span className="font-medium text-ink">
                {name} <span className="text-ink-muted">(Firmensitz)</span>
              </span>
            ) : (
              name
            )}
            {i < places.length - 1 && <span aria-hidden="true">·</span>}
          </li>
        ))}
      </ul>
      <TextLink href="/#einsatzgebiet" tone="muted" standalone className="self-start text-callout">
        Entfernung und Fahrzeit zu deinem Ort
      </TextLink>
    </section>
  );
}
