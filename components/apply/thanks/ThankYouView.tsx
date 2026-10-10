'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { Seitenkopf } from '@/components/seitenkopf';
import { STORAGE_KEYS } from '@/lib/applications/constants';
import { isWithinOpeningHours } from '@/lib/apply/office-hours';
import { parseSubmitted, readItem, removeLegacyDossier } from '@/lib/apply/storage';
import { DankeErfolg } from './DankeErfolg';
import { DankeLeer } from './DankeLeer';
import { DANKE_ANKER, LEER_KOPF, rueckmeldewegAus } from './danke-text';
import type { ThankYouViewProps } from './types';

/** sessionStorage meldet Änderungen anderer Fenster über `storage`; im eigenen Fenster ändert sich nichts. */
function abonnieren(melden: () => void): () => void {
  window.addEventListener('storage', melden);
  return () => window.removeEventListener('storage', melden);
}

const leseDatensatz = (): string | null => readItem(STORAGE_KEYS.submitted);
/** Auf dem Server (und beim Hydrieren) ist der Speicher noch nicht gelesen. */
const nochNichtGelesen = (): undefined => undefined;
const ohneAbo = () => () => {};

/**
 * Danke-Seite (ROADMAP §6, R5-THANKS-01): liest die abgeschickte Bewerbung aus sessionStorage (C7). Der Flow
 * schreibt sie nur nach der Bestätigung des Servers; ohne Eintrag (neuer Tab, direkt aufgerufen) zeigt die
 * Seite den ruhigen Leerzustand. Beim Wechsel aus dem Flow liest useSyncExternalStore den Speicher schon im
 * ersten Render, es blitzt kein Zwischenstand auf.
 */
export function ThankYouView({ bewerbenMikrotext, ...props }: ThankYouViewProps) {
  const roh = useSyncExternalStore(abonnieren, leseDatensatz, nochNichtGelesen);
  // Büro gerade besetzt? Ein Wahrheitswert, also ein stabiler Schnappschuss (Uhrzeit des Besuchs, Europe/Berlin).
  const officeOpen = useSyncExternalStore(
    ohneAbo,
    () => isWithinOpeningHours(new Date(), props.company.openingHoursSpec),
    () => true,
  );
  const record = useMemo(() => (roh === undefined ? undefined : parseSubmitted(roh)), [roh]);

  useEffect(() => {
    removeLegacyDossier();
  }, []);

  // Vor dem Lesen des Speichers (Server-HTML): der Rahmen des Kopfs mit einer h1, noch ohne Inhalt.
  if (record === undefined) {
    return (
      <div aria-busy="true">
        <Seitenkopf
          variante="arbeit"
          titelId={DANKE_ANKER.titel}
          etikett={LEER_KOPF.etikett(props.company.city)}
          titel={<span className="sr-only">Danke für deine Bewerbung</span>}
        />
      </div>
    );
  }
  if (record === null) {
    return <DankeLeer ort={props.company.city} bewerbenMikrotext={bewerbenMikrotext} contactOptions={props.contactOptions} />;
  }
  return <DankeErfolg {...props} record={record} rueckmeldeweg={rueckmeldewegAus(roh)} officeOpen={officeOpen} />;
}
