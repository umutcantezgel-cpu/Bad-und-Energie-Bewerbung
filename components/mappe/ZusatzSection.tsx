'use client';

import { Chip, Field, Input, Textarea } from '@/components/ui';
import { STANDARD_TITEL } from '@/lib/mappe/blatt/aufbau';
import type { SpracheDraft } from '@/lib/mappe/editor';
import { FUEHRERSCHEIN_KLASSEN, MAPPE_LIMITS, type FuehrerscheinKlasse } from '@/lib/mappe/options';
import { createStationId, type ListAction } from '@/lib/mappe/stations';
import { FreiwilligAbschnitt } from './EditorSection';
import { StationsEditor, type StationField } from './StationsEditor';

/** Texte von „Mehr im Lebenslauf“ (K-012: nur, was stimmt; der Satz zu sensiblen Angaben neutral, ohne Aufforderung). */
export const ZUSATZ_TEXT = Object.freeze({
  titel: 'Mehr im Lebenslauf',
  beschreibung: 'Kurzprofil, Sprachen, Führerschein, Interessen und ein eigener Abschnitt. Was du leer lässt, erscheint nicht.',
  sensibel: 'Angaben zu Religion, Gesundheit, Partei oder Gewerkschaft brauchen wir für deine Bewerbung nicht.',
});

const SPRACHE_FELDER: readonly StationField<SpracheDraft>[] = [
  { key: 'sprache', label: 'Sprache', maxLength: MAPPE_LIMITS.language, half: true },
  {
    key: 'niveau',
    label: 'Niveau',
    optional: true,
    maxLength: MAPPE_LIMITS.languageLevel,
    half: true,
    placeholder: 'z. B. Muttersprache, gut, Grundkenntnisse',
  },
];

export type ZusatzFeld = 'profil' | 'interessen' | 'eigenerText';

export interface ZusatzSectionProps {
  profil: string;
  sprachen: readonly SpracheDraft[];
  fuehrerschein: readonly FuehrerscheinKlasse[];
  interessen: string;
  /** Eigene Überschrift des eigenen Abschnitts; `null`: Standardtitel („Weiteres“). */
  eigenerTitel: string | null;
  eigenerText: string;
  onText: (feld: ZusatzFeld, text: string) => void;
  onSprachen: (action: ListAction<SpracheDraft>) => void;
  onFuehrerschein: (klasse: FuehrerscheinKlasse) => void;
  onEigenerTitel: (titel: string) => void;
  /** Höfliche Ansage über die Live-Region der Mappe. */
  announce: (message: string) => void;
}

/**
 * Freiwillig · Mehr im Lebenslauf (L5): Kurzprofil, Sprachen mit Niveau, Führerscheinklassen, Interessen und ein eigener
 * Abschnitt mit Überschrift. Leeres erscheint weder in der Vorschau noch in der Mappe.
 */
export function ZusatzSection({
  profil,
  sprachen,
  fuehrerschein,
  interessen,
  eigenerTitel,
  eigenerText,
  onText,
  onSprachen,
  onFuehrerschein,
  onEigenerTitel,
  announce,
}: ZusatzSectionProps) {
  return (
    <FreiwilligAbschnitt
      id="mappe-zusatz"
      title={ZUSATZ_TEXT.titel}
      description={
        <>
          {ZUSATZ_TEXT.beschreibung} {ZUSATZ_TEXT.sensibel}
        </>
      }
    >
      <Field label="Kurzprofil" hint="Zwei, drei Sätze über dich und deine Arbeit.">
        <Textarea name="kurzprofil" rows={4} maxLength={MAPPE_LIMITS.profile} value={profil} onChange={(event) => onText('profil', event.target.value)} />
      </Field>

      <StationsEditor
        titleId="mappe-sprachen-title"
        title="Sprachen"
        items={sprachen}
        fields={SPRACHE_FELDER}
        max={MAPPE_LIMITS.languages}
        createItem={() => ({ id: createStationId(), sprache: '', niveau: '' })}
        isEmpty={(eintrag) => !eintrag.sprache.trim() && !eintrag.niveau.trim()}
        addLabel="Sprache hinzufügen"
        emptyText="Noch keine Sprache eingetragen."
        itemLabel="Sprache"
        onAction={onSprachen}
        announce={announce}
      />

      <div className="flex flex-col gap-3">
        <h3 id="mappe-fuehrerschein-title" className="text-body font-bold text-ink">
          Führerschein
        </h3>
        <p id="mappe-fuehrerschein-hinweis" className="text-callout text-ink-2">
          Tipp deine Klassen an.
        </p>
        <div role="group" aria-labelledby="mappe-fuehrerschein-title" aria-describedby="mappe-fuehrerschein-hinweis" className="flex flex-wrap gap-2">
          {FUEHRERSCHEIN_KLASSEN.map((klasse) => (
            <Chip key={klasse} pressed={fuehrerschein.includes(klasse)} onClick={() => onFuehrerschein(klasse)}>
              <span className="sr-only">Klasse </span>
              {klasse}
            </Chip>
          ))}
        </div>
      </div>

      <Field label="Interessen" hint="Zum Beispiel Sport, Musik oder Handwerk in der Freizeit.">
        <Textarea
          name="interessen"
          rows={3}
          maxLength={MAPPE_LIMITS.interests}
          value={interessen}
          onChange={(event) => onText('interessen', event.target.value)}
        />
      </Field>

      <div className="flex flex-col gap-4">
        <h3 id="mappe-eigener-title" className="text-body font-bold text-ink">
          Eigener Abschnitt
        </h3>
        <Field
          label={
            <>
              Überschrift<span className="sr-only"> des eigenen Abschnitts</span>
            </>
          }
          hint="Zum Beispiel Weiterbildungen, Zertifikate oder Ehrenamt."
        >
          <Input
            name="eigener-titel"
            autoComplete="off"
            maxLength={MAPPE_LIMITS.sectionTitle}
            placeholder={STANDARD_TITEL.custom}
            value={eigenerTitel ?? STANDARD_TITEL.custom}
            onChange={(event) => onEigenerTitel(event.target.value)}
          />
        </Field>
        <Field
          label={
            <>
              Text<span className="sr-only"> des eigenen Abschnitts</span>
            </>
          }
        >
          <Textarea
            name="eigener-text"
            rows={4}
            maxLength={MAPPE_LIMITS.customText}
            value={eigenerText}
            onChange={(event) => onText('eigenerText', event.target.value)}
          />
        </Field>
      </div>
    </FreiwilligAbschnitt>
  );
}
