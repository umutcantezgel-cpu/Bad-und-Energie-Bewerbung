import type { CSSProperties } from 'react';
import { RadiusGraphic } from '@/components/maps/RadiusGraphic';
import { KARTE_SCHRIFT_SCHMAL, ringLabels } from '@/components/maps/graphic';
import type { RadiusView } from '@/components/maps/types';
import { cn } from '@/lib/utils/cn';
import { HAUS_NAME, PLAN_LEGENDE, PLAN_LEGENDE_STADTTEILE } from './einsatzgebiet-text';
import styles from './einsatzgebiet.module.css';
import { GEBIET_MAP_DATA, gebietView } from './karte';

export interface OrtPlanProps {
  /** Ansicht (15, 25 oder 35 km). */
  view: RadiusView;
  /** Ort mit Leitungspaar zum Firmensitz (Ortsseite). */
  selectedId?: string | null;
  /** Hervorgehobene Orte, jeder mit Namen; alle übrigen bleiben kleine Punkte ohne Namen. */
  emphasizeIds: readonly string[];
  /** Hervorgehobene Orte, die keinen Namen brauchen (Stadtteile von Wetzlar am Haus); die Legende sagt es. */
  ohneNamen?: readonly string[];
  /** Zusatz der Legende, wenn Orte ohne Namen bleiben; ohne Angabe der Satz des Kreis-Hubs (PLAN_LEGENDE_STADTTEILE). */
  legendeOhneNamen?: string;
  /** Eindeutiger Präfix der Ids von <title> und <desc>. */
  id: string;
  beschreibung: string;
}

/**
 * Der Plan des Einsatzgebiets auf dem Server, ohne Bewegung und ohne Client-Code (components/maps/RadiusGraphic hat
 * kein 'use client'): alle Orte an ihrer echten Lage, die Ringe, Lahn, Dill, A45 und B49 schematisch. Auf der
 * Ortsseite hängt der Ort mit dem Leitungspaar am Firmensitz.
 */
export function OrtPlan({
  view,
  selectedId = null,
  emphasizeIds,
  ohneNamen = [],
  legendeOhneNamen = PLAN_LEGENDE_STADTTEILE,
  id,
  beschreibung,
}: OrtPlanProps) {
  return (
    <figure className={styles.plan}>
      <div className={cn(styles.planRahmen, 'karte-rahmen')} data-karte-rahmen="">
        <RadiusGraphic
          data={GEBIET_MAP_DATA}
          view={view}
          selectedId={selectedId}
          emphasizeIds={emphasizeIds}
          unnamedIds={ohneNamen}
          centerLabel={hausName(emphasizeIds, ohneNamen)}
          allFilled
          titleId={`${id}-titel`}
          descId={`${id}-beschreibung`}
          description={beschreibung}
        />
      </div>
      <figcaption className={styles.planLegende}>{ohneNamen.length > 0 ? `${PLAN_LEGENDE} ${legendeOhneNamen}` : PLAN_LEGENDE}</figcaption>
    </figure>
  );
}

/**
 * Name am Haus: „Wetzlar“ wie auf der Startseite; „Firmensitz“ (wie am Pendelweg), wenn der Ort Wetzlar selbst mit
 * Namen auf dem Plan steht, damit nicht zweimal „Wetzlar“ nebeneinander steht.
 */
export function hausName(emphasizeIds: readonly string[], ohneNamen: readonly string[] = []): string | undefined {
  const stadt = GEBIET_MAP_DATA.places.find((place) => place.name === GEBIET_MAP_DATA.centerName && !place.atCenter);
  return stadt && emphasizeIds.includes(stadt.id) && !ohneNamen.includes(stadt.id) ? HAUS_NAME : undefined;
}

/** Giebel 45° (K-010) wie das Haus in der Mitte des Plans, hier 1,5-fach. */
const HAUS = 'M-8 7V-1L0 -9L8 -1V7Z';

export interface GebietsplanProps {
  /** Zugänglicher Name (role="img"). */
  titel: string;
}

/**
 * Zeichnung im Seitenkopf der Gebietsseite (Navy): alle Orte als Punkte an ihrer echten Lage um das Haus des
 * Firmensitzes und die Ringe 15, 25 und 35 km als Linien, ohne Namen (die nennt der Plan darunter). Beim Laden ziehen
 * sich die Ringe einmal auf, erst 15, dann 25, dann 35 km (Register `ringe-zeichnen`); reduziert stehen sie.
 */
export function Gebietsplan({ titel }: GebietsplanProps) {
  const view = gebietView(GEBIET_MAP_DATA.radiusKm);
  const { size, origin } = view;
  const werte = ringLabels(view);

  // Der Rahmen ist der Container `karte`: Die Ringwerte stehen in 16 Einheiten, ab 21rem gezeichneter Breite in 13
  // (graphic.ts KARTE_*); bei 320 px ist der Plan 280 px breit, bei 1024 px 323 px.
  return (
    <div className={cn(styles.gebietsplan, 'karte-rahmen')} data-karte-rahmen="">
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={titel} focusable="false">
        <circle cx={origin.x} cy={origin.y} r={view.radius} className={styles.planRingFlaeche} />
        {view.rings.map((ring, i) => (
          <circle
            key={ring.km}
            cx={origin.x}
            cy={origin.y}
            r={ring.r}
            pathLength={1}
            transform={`rotate(-90 ${origin.x} ${origin.y})`}
            className={styles.planRing}
            style={{ '--ring': i } as CSSProperties}
            data-motion="ringe-zeichnen"
          />
        ))}
        {GEBIET_MAP_DATA.places.map((place, i) => {
          const p = view.points[i];
          if (!p?.inFrame) return null;
          return <circle key={place.id} cx={p.drawn.x} cy={p.drawn.y} r={4} className={styles.planPunkt} />;
        })}
        {/* Radius des Zirkels (Leitmotiv „35 km“, E-027): vom Haus nach oben links bis an den äußeren Ring */}
        <path
          d={`M${origin.x} ${origin.y}L${Math.round((origin.x - view.radius * Math.SQRT1_2) * 10) / 10} ${Math.round((origin.y - view.radius * Math.SQRT1_2) * 10) / 10}`}
          className={styles.planRadius}
        />
        <path d={HAUS} transform={`translate(${origin.x} ${origin.y}) scale(1.5)`} className={styles.planHaus} />
        {werte.map((wert) => (
          <text
            key={wert.km}
            x={wert.x}
            y={wert.y}
            dominantBaseline="central"
            fontSize={KARTE_SCHRIFT_SCHMAL}
            className={cn(styles.planWert, 'karte-fein')}
          >
            {wert.text}
          </text>
        ))}
      </svg>
    </div>
  );
}
