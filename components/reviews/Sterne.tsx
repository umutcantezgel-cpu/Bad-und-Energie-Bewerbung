import { formatRating } from '@/components/ui/helpers';

/**
 * Sterne der Stimmen-Reihe ohne Wiederholung je Karte (V6-A3-VITALS, DOM-Größe): <Rating> trägt in jeder
 * Karte ein eigenes SVG mit Umriss, zwei Gruppen und fünf <use> (10 Knoten, dazu eine Hülle). Hier liegt der
 * Umriss mit der Reihe aus fünf vollen Sternen einmal je Reihe im Vorrat; eine Karte mit voller Wertung zeigt
 * sie mit einem SVG und einem <use> (2 Knoten). Maße, Strich, Farben und Ansage gleichen <Rating size="sm">.
 */

/** Sternumriss wie in components/ui/Rating (24er-Raster, runde Stöße); __tests__/sterne.test.ts hält beide gleich. */
export const STERN_PFAD =
  'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z';

/** Höchstwertung; nur sie kommt aus dem Vorrat, jede andere Wertung zeichnet <Rating> (Teilsterne). */
export const STERNE_MAX = 5;
const STERN = 24;
/** Abstand in Sterneinheiten wie <Rating>: 2 px bei 16-px-Sternen. */
const LUECKE = 3;
const BREITE = STERNE_MAX * STERN + (STERNE_MAX - 1) * LUECKE;
/** Höhe wie <Rating size="sm">. */
const HOEHE_PX = 16;

export function istVolleWertung(wert: number): boolean {
  return wert === STERNE_MAX;
}

/** Vorrat einer Reihe (unsichtbar, außerhalb des Flusses); `id` eindeutig je Reihe (useId). */
export function SternVorrat({ id }: { id: string }) {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" className="absolute">
      <defs>
        <path id={`${id}-stern`} d={STERN_PFAD} />
        <g id={`${id}-voll`}>
          {Array.from({ length: STERNE_MAX }, (_, i) => (
            <use key={i} href={`#${id}-stern`} x={i * (STERN + LUECKE)} />
          ))}
        </g>
      </defs>
    </svg>
  );
}

/** Volle Wertung aus dem Vorrat `vorrat`, angesagt wie <Rating>: „5,0 von 5 Sternen“. */
export function VolleSterne({ vorrat }: { vorrat: string }) {
  return (
    <svg
      role="img"
      aria-label={`${formatRating(STERNE_MAX)} von ${STERNE_MAX} Sternen`}
      viewBox={`0 0 ${BREITE} ${STERN}`}
      width={(HOEHE_PX * BREITE) / STERN}
      height={HOEHE_PX}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <use href={`#${vorrat}-voll`} className="fill-brand stroke-brand" />
    </svg>
  );
}
