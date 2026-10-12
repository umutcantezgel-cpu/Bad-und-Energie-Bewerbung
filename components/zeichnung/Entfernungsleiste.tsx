import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils/cn';
import styles from './zeichnung.module.css';

export interface LeistenOrt {
  id: string;
  name: string;
  /** Straßenstrecke in ganzen km (Messung). */
  km: number;
}

export interface EntfernungsleisteProps {
  /** Orte auf der Skala (z. B. alle Orte eines Kreises). */
  orte: readonly LeistenOrt[];
  /** Hervorgehobener Ort (Ortsseite): größerer Punkt mit Namen und Wert. */
  aktuellId?: string;
  /**
   * Strecken aller Orte des Gebiets als leise Striche: waagerecht auf der Skala (Ortsseiten kleiner Kreise), senkrecht
   * als Sprossen im Leitungspaar (Kreis-Hubs). So wirkt die Leiste bei wenigen Orten nicht leer, und die Lage des
   * Kreises im Gebiet ist zu sehen.
   */
  hintergrundKm?: readonly number[];
  /** Ende der Skala in km (Gebietsregel, Fakt radius35). */
  maxKm?: number;
  /** Ringe des Plans (15, 25, 35 km): stärkere Teilstriche mit Wert. */
  ringe?: readonly number[];
  /**
   * `waagerecht`: Punkte über der Skala, gleich weite Orte gestapelt (Ortsseite, Papier). `senkrecht`: die Skala als
   * Leitungspaar von oben (0 km) nach unten, jeder Ort mit Namen an seiner Strecke (Kreis-Hub, Navy-Fläche).
   */
  ausrichtung?: 'waagerecht' | 'senkrecht';
  /** Zugänglicher Name der ganzen Leiste (role="img"); die Werte stehen auf der Seite außerdem als Text. */
  titel: string;
  className?: string;
}

const NBSP = ' ';
const prozent = (km: number, max: number) => `${Math.round((Math.min(km, max) / max) * 10000) / 100}%`;

/** Teilstriche alle 5 km; die Ringe tragen ihren Wert. */
function teilung(maxKm: number): number[] {
  return Array.from({ length: Math.floor(maxKm / 5) + 1 }, (_, i) => i * 5);
}

/** Senkrecht: Abstand der Namen in rem (eine Zeile text-footnote mit Luft). */
const ZEILE_REM = 1.5;
/** Abgänge in SVG-Einheiten: eine Zeile = 24 (1,5rem bei 16 px), Breite 64 (4rem); gleiches Verhältnis wie im CSS. */
const ZEILE_EINHEITEN = 24;
const ABGANG_BREITE = 64;
/** Gerades Stück am Rohr und längster 45°-Knick. */
const ABGANG_STUMMEL = 6;
const ABGANG_KNICK = ABGANG_BREITE - ABGANG_STUMMEL - 10;

export interface SenkrechteLage {
  id: string;
  /** Lage des Teilstrichs auf der Skala (0–1). */
  an: number;
  /** Lage des Namens in Zeilen ab oben. */
  zeile: number;
}

/**
 * Namen der senkrechten Leiste: jeder so nah wie möglich an seiner Strecke, ohne Überlappung (eine Zeile Abstand),
 * in Reihenfolge der Strecke. Höhe der Leiste in Zeilen = max(Zahl der Orte, `minZeilen`).
 */
export function senkrechteLage(orte: readonly LeistenOrt[], maxKm: number, minZeilen = 10): { zeilen: number; lage: SenkrechteLage[] } {
  const sortiert = [...orte].sort((a, b) => a.km - b.km || a.name.localeCompare(b.name, 'de'));
  const zeilen = Math.max(sortiert.length, minZeilen);
  const ziel = sortiert.map((ort) => (Math.min(ort.km, maxKm) / maxKm) * (zeilen - 1));
  const lage = [...ziel];
  for (let i = 1; i < lage.length; i += 1) lage[i] = Math.max(lage[i], lage[i - 1] + 1);
  // Unten anstoßen: von unten wieder nach oben schieben
  for (let i = lage.length - 1; i >= 0; i -= 1) {
    const grenze = i === lage.length - 1 ? zeilen - 1 : lage[i + 1] - 1;
    lage[i] = Math.min(lage[i], grenze);
  }
  return {
    zeilen,
    lage: sortiert.map((ort, i) => ({ id: ort.id, an: Math.min(ort.km, maxKm) / maxKm, zeile: lage[i] })),
  };
}

/**
 * Abgang eines Orts vom Rohr zu seinem Namen im 45°-Raster (K-010): waagerecht aus dem Rohr, senkrecht bis kurz
 * vor die Zeile, dann unter 45° in die Zeile und waagerecht zum Namen.
 */
function abgang(eintrag: SenkrechteLage, zeilen: number): string {
  const r = (v: number) => Math.round(v * 10) / 10;
  const yStrich = ZEILE_EINHEITEN / 2 + eintrag.an * (zeilen - 1) * ZEILE_EINHEITEN;
  const yName = ZEILE_EINHEITEN / 2 + eintrag.zeile * ZEILE_EINHEITEN;
  const dy = yName - yStrich;
  const knick = Math.min(Math.abs(dy), ABGANG_KNICK);
  const yVorKnick = yName - Math.sign(dy) * knick;
  return `M0 ${r(yStrich)}H${ABGANG_STUMMEL}V${r(yVorKnick)}L${r(ABGANG_STUMMEL + knick)} ${r(yName)}H${ABGANG_BREITE}`;
}

/**
 * Entfernungsleiste (E-028): die Strecke zum Firmensitz auf der Skala 0–35 km, dieselbe Skala wie das Leitmotiv
 * „35 km“ der Startseite. Werte in Martian Mono, Ringe 15/25/35 km als stärkere Teilstriche. Die Leiste ist eine
 * Grafik (role="img" mit Titel); jede Zahl steht auf der Seite auch als Text (Tabelle, Ortsblöcke).
 * Server-Komponente ohne Bewegung, Farben nur über Rollen (Papier und Navy).
 */
export function Entfernungsleiste({
  orte,
  aktuellId,
  hintergrundKm = [],
  maxKm = 35,
  ringe = [15, 25, 35],
  ausrichtung = 'waagerecht',
  titel,
  className,
}: EntfernungsleisteProps) {
  const striche = teilung(maxKm);

  if (ausrichtung === 'senkrecht') {
    const { zeilen, lage } = senkrechteLage(orte, maxKm);
    const name = new Map(orte.map((ort) => [ort.id, ort]));
    return (
      <figure
        className={cn(styles.leiste, styles.leisteSenkrecht, className)}
        role="img"
        aria-label={titel}
        data-zeichnung="entfernungsleiste"
        style={{ '--zeilen': zeilen, '--zeile-min': `${ZEILE_REM}rem` } as CSSProperties}
      >
        {/* Skala: Leitungspaar von 0 km (oben, Firmensitz) bis 35 km (unten) */}
        <span className={styles.lsPaar} aria-hidden="true" />
        {/* Alle Orte des Gebiets als leise Sprossen im Paar */}
        {[...new Set(hintergrundKm)].map((km) => (
          <span
            key={`h${km}`}
            className={styles.lsHintergrund}
            style={{ top: `calc(var(--zeile) / 2 + ${Math.min(km, maxKm) / maxKm} * (100% - var(--zeile)))` }}
            aria-hidden="true"
          />
        ))}
        {striche.map((km) => (
          <span
            key={km}
            className={cn(styles.lsStrich, ringe.includes(km) && styles.lsRing)}
            style={{ top: `calc(var(--zeile) / 2 + ${Math.min(km, maxKm) / maxKm} * (100% - var(--zeile)))` }}
            aria-hidden="true"
          >
            <span className={cn(styles.lsWert, 'font-mass')}>{km === maxKm ? `${km}${NBSP}km` : km}</span>
          </span>
        ))}
        {/* Orte: Abgang an der Strecke, Name in seiner Zeile (45°-Knick, wenn er ausweichen muss) */}
        <svg
          className={styles.lsAbgaenge}
          viewBox={`0 0 ${ABGANG_BREITE} ${zeilen * ZEILE_EINHEITEN}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          {lage.map((eintrag) => (
            <path
              key={eintrag.id}
              d={abgang(eintrag, zeilen)}
              className={cn(styles.lsAbgang, eintrag.id === aktuellId && styles.lsAbgangAktuell)}
            />
          ))}
        </svg>
        {lage.map((eintrag) => {
          const ort = name.get(eintrag.id)!;
          return (
            <span
              key={eintrag.id}
              className={cn(styles.lsName, ort.id === aktuellId && styles.lsAktuell)}
              style={{ top: `calc(${eintrag.zeile} * var(--zeile))` }}
              aria-hidden="true"
            >
              {ort.name} <span className={cn(styles.lsKm, 'font-mass')}>{`${ort.km}${NBSP}km`}</span>
            </span>
          );
        })}
      </figure>
    );
  }

  // Waagerecht: Punkte über der Skala; gleich weite Orte stapeln sich, der hervorgehobene Ort oben (seine
  // Hinweislinie läuft so durch keinen anderen Punkt).
  const stapel = new Map<number, number>();
  const punkte = [...orte]
    .sort((a, b) => a.km - b.km || Number(a.id === aktuellId) - Number(b.id === aktuellId) || a.name.localeCompare(b.name, 'de'))
    .map((ort) => {
      const stufe = stapel.get(ort.km) ?? 0;
      stapel.set(ort.km, stufe + 1);
      return { ...ort, stufe };
    });
  const hoehe = Math.max(1, ...stapel.values());
  const aktuell = punkte.find((punkt) => punkt.id === aktuellId);
  const anteil = aktuell ? Math.min(aktuell.km, maxKm) / maxKm : 0;

  return (
    <figure
      className={cn(styles.leiste, styles.leisteWaagerecht, className)}
      role="img"
      aria-label={titel}
      data-zeichnung="entfernungsleiste"
      style={{ '--stapel': hoehe } as CSSProperties}
    >
      <div className={styles.lwFeld} aria-hidden="true">
        {aktuell ? (
          <>
            {/* Name und Wert über dem Stapel, anteilig verschoben (links bündig bei 0 km, rechts bei 35 km), damit
                sie nie über die Leiste hinausragen; die Hinweislinie steht genau über dem Punkt. */}
            <span
              className={styles.lwMarke}
              style={{ left: prozent(aktuell.km, maxKm), '--anteil': anteil } as CSSProperties}
            >
              <span className={styles.lwMarkeName}>{aktuell.name}</span>{' '}
              <span className={cn(styles.lwMarkeWert, 'font-mass')}>{`${aktuell.km}${NBSP}km`}</span>
            </span>
            <span className={styles.lwLeitung} style={{ left: prozent(aktuell.km, maxKm), '--stufe': aktuell.stufe } as CSSProperties} />
          </>
        ) : null}
        {punkte.map((punkt) => (
          <span
            key={punkt.id}
            className={cn(styles.lwPunkt, punkt.id === aktuellId && styles.lwPunktAktuell)}
            style={{ left: prozent(punkt.km, maxKm), '--stufe': punkt.stufe } as CSSProperties}
          />
        ))}
      </div>
      <div className={styles.lwSkala} aria-hidden="true">
        {[...new Set(hintergrundKm)].map((km) => (
          <span key={`h${km}`} className={styles.lwHintergrund} style={{ left: prozent(km, maxKm) }} />
        ))}
        {striche.map((km) => (
          <span key={km} className={cn(styles.lwStrich, ringe.includes(km) && styles.lwRing)} style={{ left: prozent(km, maxKm) }}>
            <span className={cn(styles.lwWert, 'font-mass')}>{km === maxKm ? `${km}${NBSP}km` : km}</span>
          </span>
        ))}
      </div>
    </figure>
  );
}
