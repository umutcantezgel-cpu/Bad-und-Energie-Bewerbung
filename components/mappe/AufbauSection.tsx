'use client';

import { useEffect, useRef, type MouseEvent } from 'react';
import { Icon } from '@/components/icons';
import { Button, Chip, Field, IconButton, Input } from '@/components/ui';
import type { MappeSectionId } from '@/lib/applications/constants';
import { ABSCHNITT_NAME, STANDARD_TITEL } from '@/lib/mappe/blatt/aufbau';
import type { AufbauEintrag } from '@/lib/mappe/editor';
import { MAPPE_LIMITS } from '@/lib/mappe/options';
import { FreiwilligAbschnitt } from './EditorSection';

/** Id des Felds „Anschreiben“ (LetterSection): Ziel des Links im Hinweis zu ausgeblendeten Schwerpunkten. */
export const ANSCHREIBEN_FELD_ID = 'mappe-anschreiben-text';

/**
 * Texte des Aufbaus (K-012): Ausgeblendetes geht nicht mit (toMappe; die Vorlage des Anschreibens nennt ausgeblendete
 * Schwerpunkte nicht). Nur ein selbst geänderter Brief kann sie noch enthalten: Dann sagt das der Hinweis.
 */
export const AUFBAU_TEXT = Object.freeze({
  titel: 'Aufbau des Lebenslaufs',
  beschreibung: 'Reihenfolge, Überschriften und was im Lebenslauf steht. Ausgeblendete Abschnitte bleiben hier im Editor und gehen nicht mit.',
  zweispaltig: 'Im Design „Zweispaltig“ stehen Schwerpunkte, Sprachen, Führerschein und Interessen in der Seitenspalte. Die Reihenfolge gilt je Spalte.',
  liste: 'Abschnitte im Lebenslauf',
  zeigen: 'Im Lebenslauf zeigen',
  ausgeblendet: 'Ausgeblendet: steht nicht im Lebenslauf und geht nicht mit.',
  leer: 'Noch leer: erscheint, sobald du etwas einträgst.',
  standardtitel: 'Standardtitel nehmen',
  standardtitelAnsage: 'Standardtitel übernommen.',
  brief: 'Dein Anschreiben hast du selbst geändert: Steht darin etwas zu deinen Schwerpunkten, bleibt es dort stehen.',
  zumBrief: 'Zum Anschreiben',
});

export interface AufbauSectionProps {
  aufbau: readonly AufbauEintrag[];
  /** Hat der Abschnitt Inhalt (unabhängig davon, ob er gezeigt wird)? */
  hatInhalt: (id: MappeSectionId) => boolean;
  zweispaltig: boolean;
  /** Schwerpunkte ausgeblendet, aber ein selbst geänderter Brief kann sie noch nennen. */
  briefHinweis: boolean;
  onTitel: (id: MappeSectionId, titel: string | null) => void;
  onSichtbar: (id: MappeSectionId, sichtbar: boolean) => void;
  onVerschieben: (id: MappeSectionId, richtung: -1 | 1) => void;
  announce: (message: string) => void;
}

type FokusZiel = { id: MappeSectionId; ziel: 'hoch' | 'runter' | 'titel' };

interface ZeilenRefs {
  hoch: HTMLButtonElement | null;
  runter: HTMLButtonElement | null;
  titel: HTMLInputElement | null;
}

/**
 * Freiwillig · Aufbau des Lebenslaufs (L5): je Abschnitt hoch/runter, zeigen oder ausblenden, Überschrift umbenennen
 * („Standardtitel nehmen“ setzt zurück). Nur Knöpfe und Felder (Tastatur, Screenreader), kein Ziehen. Beim Verschieben
 * bleibt der Fokus auf dem Pfeil der verschobenen Zeile (am Rand auf dem anderen), wie im StationsEditor.
 */
export function AufbauSection({ aufbau, hatInhalt, zweispaltig, briefHinweis, onTitel, onSichtbar, onVerschieben, announce }: AufbauSectionProps) {
  const refs = useRef(new Map<MappeSectionId, ZeilenRefs>());
  const fokus = useRef<FokusZiel | null>(null);

  useEffect(() => {
    const ziel = fokus.current;
    if (!ziel) return;
    fokus.current = null;
    refs.current.get(ziel.id)?.[ziel.ziel]?.focus();
  });

  function setRef(id: MappeSectionId, art: keyof ZeilenRefs, node: HTMLButtonElement | HTMLInputElement | null) {
    const zeile = refs.current.get(id) ?? { hoch: null, runter: null, titel: null };
    refs.current.set(id, { ...zeile, [art]: node });
  }

  function verschieben(id: MappeSectionId, index: number, richtung: -1 | 1) {
    const neu = index + richtung;
    onVerschieben(id, richtung);
    // Am Rand ist der eigene Pfeil gesperrt: dann auf den anderen
    const amRand = neu === 0 || neu === aufbau.length - 1;
    fokus.current = { id, ziel: amRand ? (richtung === -1 ? 'runter' : 'hoch') : richtung === -1 ? 'hoch' : 'runter' };
    announce(`${ABSCHNITT_NAME[id]} steht jetzt an Stelle ${neu + 1} von ${aufbau.length}.`);
  }

  function umschalten(eintrag: AufbauEintrag) {
    onSichtbar(eintrag.id, !eintrag.sichtbar);
    announce(eintrag.sichtbar ? `${ABSCHNITT_NAME[eintrag.id]} ausgeblendet.` : `${ABSCHNITT_NAME[eintrag.id]} wird wieder gezeigt.`);
  }

  function standardtitel(id: MappeSectionId) {
    onTitel(id, null);
    fokus.current = { id, ziel: 'titel' };
    announce(AUFBAU_TEXT.standardtitelAnsage);
  }

  function zumBrief(event: MouseEvent<HTMLAnchorElement>) {
    const feld = document.getElementById(ANSCHREIBEN_FELD_ID);
    if (!feld) return;
    event.preventDefault();
    feld.scrollIntoView({ block: 'center' });
    feld.focus({ preventScroll: true });
  }

  return (
    <FreiwilligAbschnitt
      id="mappe-aufbau"
      title={AUFBAU_TEXT.titel}
      description={zweispaltig ? `${AUFBAU_TEXT.beschreibung} ${AUFBAU_TEXT.zweispaltig}` : AUFBAU_TEXT.beschreibung}
    >
      <ol aria-label={AUFBAU_TEXT.liste} className="flex flex-col gap-3">
        {aufbau.map((eintrag, index) => {
          const name = ABSCHNITT_NAME[eintrag.id];
          return (
            <li key={eintrag.id} className="flex flex-col gap-3 rounded-2 bg-surface-2 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="min-w-0 text-body font-bold text-ink">{name}</h3>
                <div className="-mr-2 flex shrink-0 items-center">
                  <IconButton
                    ref={(node) => setRef(eintrag.id, 'hoch', node)}
                    aria-label={`${name} nach oben verschieben`}
                    disabled={index === 0}
                    onClick={() => verschieben(eintrag.id, index, -1)}
                  >
                    <Icon name="arrow-up" size="md" />
                  </IconButton>
                  <IconButton
                    ref={(node) => setRef(eintrag.id, 'runter', node)}
                    aria-label={`${name} nach unten verschieben`}
                    disabled={index === aufbau.length - 1}
                    onClick={() => verschieben(eintrag.id, index, 1)}
                  >
                    <Icon name="arrow-down" size="md" />
                  </IconButton>
                </div>
              </div>

              <Chip pressed={eintrag.sichtbar} onClick={() => umschalten(eintrag)} className="max-w-full self-start">
                {AUFBAU_TEXT.zeigen}
                <span className="sr-only">: {name}</span>
              </Chip>
              {!eintrag.sichtbar ? (
                <p className="text-callout text-ink-2">{AUFBAU_TEXT.ausgeblendet}</p>
              ) : !hatInhalt(eintrag.id) ? (
                <p className="text-callout text-ink-2">{AUFBAU_TEXT.leer}</p>
              ) : null}

              {eintrag.sichtbar && (
                <div className="flex flex-col gap-2">
                  <Field
                    label={
                      <>
                        Überschrift<span className="sr-only"> für „{name}“</span>
                      </>
                    }
                  >
                    <Input
                      ref={(node) => setRef(eintrag.id, 'titel', node)}
                      autoComplete="off"
                      maxLength={MAPPE_LIMITS.sectionTitle}
                      placeholder={STANDARD_TITEL[eintrag.id]}
                      value={eintrag.titel ?? STANDARD_TITEL[eintrag.id]}
                      onChange={(event) => onTitel(eintrag.id, event.target.value)}
                    />
                  </Field>
                  {eintrag.titel !== null && (
                    <Button variant="ghost" wrap onClick={() => standardtitel(eintrag.id)} className="max-w-full self-start">
                      <Icon name="rotate-ccw" size="md" />
                      {AUFBAU_TEXT.standardtitel}
                      <span className="sr-only"> für „{name}“</span>
                    </Button>
                  )}
                </div>
              )}

              {eintrag.id === 'skills' && !eintrag.sichtbar && briefHinweis && (
                <p className="text-callout text-ink">
                  {AUFBAU_TEXT.brief}{' '}
                  <a href={`#${ANSCHREIBEN_FELD_ID}`} onClick={zumBrief} className="font-bold text-brand underline underline-offset-4">
                    {AUFBAU_TEXT.zumBrief}
                  </a>
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </FreiwilligAbschnitt>
  );
}
