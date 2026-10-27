'use client';

import type { CSSProperties } from 'react';
import { Icon } from '@/components/icons';
import { ChoiceCard, ChoiceGroup, SegmentedControl } from '@/components/ui';
import {
  AKZENTE,
  AKZENT_FARBEN,
  FOTOFORMEN,
  FOTOFORM_TEXTE,
  SCHRIFTSTILE,
  SCHRIFT_TEXTE,
  VORLAGEN,
  VORLAGE_TEXTE,
  type Fotoform,
  type MappeDesign,
  type Vorlage,
} from '@/lib/mappe/blatt/design';
import styles from './stil';

export interface DesignSectionProps {
  design: MappeDesign;
  fotoform: Fotoform;
  /** Die Fotoform gibt es nur mit Foto (das Foto bleibt im Browser). */
  hatFoto: boolean;
  onDesign: (patch: Partial<MappeDesign>) => void;
  onFotoform: (form: Fotoform) => void;
}

/** Textzeilen der Miniatur (y in Einheiten des 42 × 59 großen Blatts). */
const ZEILEN = [30, 34, 38, 42, 46, 50];

/**
 * Kleines Blatt je Vorlage, ohne Text: Flächen und Linien in der gewählten Farbe (--miniatur-farbe am Abschnitt);
 * für Screenreader stumm.
 */
function Miniatur({ vorlage }: { vorlage: Vorlage }) {
  const zweispaltig = vorlage === 'zweispaltig';
  return (
    <svg viewBox="0 0 42 59" aria-hidden="true" className={styles.miniatur}>
      <rect x="0.5" y="0.5" width="41" height="58" rx="1" className={styles.miniaturBlatt} />
      {vorlage === 'farbband' ? <rect x="3" y="3" width="36" height="11" rx="0.75" fill="currentColor" /> : null}
      <rect x="6" y="6.5" width="18" height="3.5" rx="0.5" className={vorlage === 'farbband' ? styles.miniaturWeiss : undefined} fill={vorlage === 'farbband' ? undefined : 'currentColor'} />
      {vorlage !== 'farbband' ? <rect x="6" y="13" width="30" height="0.6" fill="currentColor" opacity="0.5" /> : null}
      {zweispaltig ? <rect x="6" y="18" width="10" height="36" rx="0.75" fill="currentColor" opacity="0.16" /> : null}
      <rect x={zweispaltig ? 19 : 6} y="19" width={zweispaltig ? 14 : 20} height="1.8" rx="0.5" fill="currentColor" />
      {ZEILEN.map((y, i) => (
        <rect key={y} x={zweispaltig ? 19 : 6} y={y} width={(zweispaltig ? 17 : 30) - (i % 3) * 4} height="1.4" rx="0.5" className={styles.miniaturZeile} />
      ))}
    </svg>
  );
}

// Feste Bild-Komponenten je Vorlage: Eine neue Funktion je Rendern hängte die Miniaturen bei jedem Tastendruck neu ein
function MiniaturSchlicht() {
  return <Miniatur vorlage="schlicht" />;
}
function MiniaturFarbband() {
  return <Miniatur vorlage="farbband" />;
}
function MiniaturZweispaltig() {
  return <Miniatur vorlage="zweispaltig" />;
}
const MINIATUREN = { schlicht: MiniaturSchlicht, farbband: MiniaturFarbband, zweispaltig: MiniaturZweispaltig } as const;

/**
 * Freiwillig · Design (L3): Vorlage, Farbe und Schrift für Vorschau, Druck und die PDF fürs Team; die Fotoform nur mit
 * Foto. Am Inhalt ändert sich nichts. Zählt nicht zum Mappe-Stand (fünf Abschnitte), darum ohne Nummer.
 */
export function DesignSection({ design, fotoform, hatFoto, onDesign, onFotoform }: DesignSectionProps) {
  return (
    <section id="mappe-design" aria-labelledby="mappe-design-title" className={styles.abschnitt}>
      <header className="flex flex-col gap-2">
        <p className="text-etikett text-ink-2">Freiwillig</p>
        <h2 id="mappe-design-title" className="text-title-2 text-brand">
          Design
        </h2>
        <p className="max-w-prose text-callout text-ink-2">
          So sieht deine Mappe aus: in der Vorschau, beim Drucken und in der PDF fürs Team. Am Inhalt ändert sich nichts.
        </p>
      </header>

      <div
        className="flex flex-col gap-2"
        style={{ '--miniatur-farbe': AKZENT_FARBEN[design.akzent].farbe } as CSSProperties}
      >
        <h3 id="mappe-vorlage-title" className="text-callout font-bold text-ink">
          Vorlage
        </h3>
        <ChoiceGroup labelledBy="mappe-vorlage-title">
          {VORLAGEN.map((vorlage) => (
            <ChoiceCard
              key={vorlage}
              title={VORLAGE_TEXTE[vorlage].name}
              description={VORLAGE_TEXTE[vorlage].beschreibung}
              icon={MINIATUREN[vorlage]}
              selected={design.vorlage === vorlage}
              onClick={() => onDesign({ vorlage })}
            />
          ))}
        </ChoiceGroup>
      </div>

      <fieldset className="flex min-w-0 flex-col">
        <legend className="mb-2 text-callout font-bold text-ink">Farbe</legend>
        <div className={styles.farbwahl}>
          {AKZENTE.map((akzent) => (
            <label key={akzent} className={styles.farbe} data-motion="druck">
              <input
                type="radio"
                name="mappe-farbe"
                value={akzent}
                checked={design.akzent === akzent}
                onChange={() => onDesign({ akzent })}
                className="sr-only"
              />
              <span aria-hidden="true" className={styles.farbPunkt} style={{ backgroundColor: AKZENT_FARBEN[akzent].farbe }}>
                <Icon name="check" size="sm" className={styles.farbHaken} />
              </span>
              <span>{AKZENT_FARBEN[akzent].name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <SegmentedControl
          legend="Schrift"
          name="mappe-schrift"
          options={SCHRIFTSTILE.map((schrift) => ({ value: schrift, label: SCHRIFT_TEXTE[schrift].name }))}
          value={design.schrift}
          onValueChange={(schrift) => onDesign({ schrift })}
        />
        <p className="text-callout text-ink-2">{SCHRIFT_TEXTE[design.schrift].beschreibung}</p>
      </div>

      {hatFoto ? (
        <div className="flex flex-col gap-2">
          <SegmentedControl
            legend="Form des Fotos"
            name="mappe-fotoform"
            options={FOTOFORMEN.map((form) => ({ value: form, label: FOTOFORM_TEXTE[form] }))}
            value={fotoform}
            onValueChange={onFotoform}
            className={styles.fotoform}
          />
          <p className="text-callout text-ink-2">
            Wirkt in Vorschau und Druck. Das Foto bleibt auf deinem Gerät und geht nicht ans Team.
          </p>
        </div>
      ) : null}
    </section>
  );
}
