'use client';

import { type DragEvent, useId, useRef, useState, useSyncExternalStore } from 'react';
import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import type { UploadAdapter, UploadNachweis } from './adapter';
import { AUSWAHL_TEXT } from './auswahl-text';
import { Dateiliste } from './Dateiliste';
import { UNTERLAGEN_ACCEPT } from './regeln';
import { erstelleSteuerung, LEERER_ZUSTAND } from './steuerung';
import styles from './unterlagen.module.css';

export interface UnterlagenAuswahlProps {
  /** Anbindung (Phase 2) oder Attrappe; ohne sie zeigt die Seite den ehrlichen Hinweis (Unterlagen.tsx). */
  adapter: UploadAdapter;
  /** Bewerbungsnummer und Prüfschlüssel, sobald die Bewerbung abgeschickt ist. */
  nachweis?: UploadNachweis | null;
}

/**
 * Auswahl mit Anbindung (E-BEW-012): Knopf „Dateien auswählen“ (Tastatur) und Ablage per Ziehen (Maus),
 * Vorprüfung von Typ, Größe und Anzahl mit Fehlertext, Liste mit Fortschritt, Entfernen, „Unterlagen senden“.
 * Rot bleibt der Hauptaktion des Flows vorbehalten: hier nur Navy-Kontur (secondary).
 */
export function UnterlagenAuswahl({ adapter, nachweis = null }: UnterlagenAuswahlProps) {
  const [steuerung] = useState(() => erstelleSteuerung({ adapter, nachweis }));
  const zustand = useSyncExternalStore(steuerung.abonnieren, steuerung.zustand, () => LEERER_ZUSTAND);
  const feld = useRef<HTMLInputElement>(null);
  const [ziehen, setZiehen] = useState(false);
  const hinweisId = useId();

  const gesperrt = zustand.abschluss === 'sendet' || zustand.abschluss === 'abgeschlossen';
  const uebertragen = zustand.eintraege.filter((e) => e.status === 'uebertragen').length;
  const laeuft = zustand.eintraege.some((e) => e.status === 'laedt');
  const kannSenden = uebertragen > 0 && !laeuft && !gesperrt;

  const ablegen = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setZiehen(false);
    if (!gesperrt) void steuerung.waehlen(Array.from(event.dataTransfer.files));
  };

  return (
    <div className="flex flex-col gap-4" data-unterlagen="auswahl">
      <div
        className={styles.ablage}
        data-zustand={ziehen ? 'ziehen' : 'an'}
        onDragOver={(event) => {
          event.preventDefault();
          if (!gesperrt) setZiehen(true);
        }}
        onDragLeave={() => setZiehen(false)}
        onDrop={ablegen}
      >
        <span className={styles.kasten}>
          <Icon name="file-text" size="lg" />
        </span>
        <div className={styles.ablageText}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Button variant="secondary" onClick={() => feld.current?.click()} disabled={gesperrt} aria-describedby={hinweisId}>
              {AUSWAHL_TEXT.auswaehlen}
            </Button>
            <span className="hidden text-callout text-ink-muted pointer-fine:inline">{AUSWAHL_TEXT.ablegen}</span>
          </div>
          <p id={hinweisId} className="text-footnote text-ink-muted">
            {AUSWAHL_TEXT.formate}
          </p>
        </div>
        <input
          ref={feld}
          type="file"
          multiple
          accept={UNTERLAGEN_ACCEPT}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            const dateien = Array.from(event.currentTarget.files ?? []);
            // Zurücksetzen, damit dieselbe Datei nach dem Entfernen erneut gewählt werden kann.
            event.currentTarget.value = '';
            void steuerung.waehlen(dateien);
          }}
        />
      </div>

      {/* Abgelehnte Dateien: Ursache und nächster Schritt stehen im Text (K-011 „Fehler“) */}
      <div aria-live="assertive" className="flex flex-col gap-1">
        {zustand.meldungen.map((meldung) => (
          <p key={meldung} className="flex gap-2 text-callout font-bold text-danger">
            <Icon name="circle-alert" size="lg" className="shrink-0" />
            {meldung}
          </p>
        ))}
      </div>

      <Dateiliste eintraege={zustand.eintraege} onEntfernen={gesperrt ? undefined : (schluessel) => void steuerung.entfernen(schluessel)} />

      {kannSenden || zustand.abschluss === 'sendet' ? (
        <Button
          variant="secondary"
          className="self-start"
          loading={zustand.abschluss === 'sendet'}
          onClick={() => void steuerung.abschliessen()}
        >
          {AUSWAHL_TEXT.senden}
        </Button>
      ) : null}

      <p role="status" className="text-callout text-ink empty:hidden">
        {zustand.abschluss === 'abgeschlossen' ? AUSWAHL_TEXT.gesendet : zustand.abschluss === 'fehler' ? AUSWAHL_TEXT.sendenFehler : ''}
      </p>
    </div>
  );
}
