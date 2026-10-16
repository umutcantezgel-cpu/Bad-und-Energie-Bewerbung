'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { BEDIEN_GLYPHEN } from '@/components/icons/bedien';
import { dauerWert, knopfText } from '@/lib/motion/dauer';
import { prefersReducedMotion, subscribe } from '@/lib/motion/prefers';
import { beobachteSicht, beobachteTab, nachAuftakt } from '@/lib/motion/sicht';
import styles from './dauer.module.css';

// Ein Druck hält alle Schleifen der Seite an: ein Zustand für alle Bereiche, nur im Speicher der Seite
let angehalten = false;
const hoerer = new Set<() => void>();
const abo = (f: () => void) => {
  hoerer.add(f);
  return () => {
    hoerer.delete(f);
  };
};
const umschalten = () => {
  angehalten = !angehalten;
  hoerer.forEach((f) => f());
};

export interface DauerSteuerungProps {
  /** Die bewegte Zeichnung (Server-Komponente, kommt fertig gerendert). */
  children?: ReactNode;
  /** Text links neben dem Knopf (z. B. „Einzelheit X“), vom Server. */
  beschriftung?: ReactNode;
  className?: string;
}

/**
 * Steuerung der Dauerbewegung (E-029, KERN K-009): setzt `data-dauer="an"` am Bereich nur, wenn die Startbedingung gilt
 * (lib/motion/dauer.ts: Skript, Sichtfeld, Tab sichtbar, keine reduzierte Bewegung, nicht angehalten); der Server liefert
 * „aus“, also das Standbild. Der Knopf (44 × 44 px) heißt „Anhalten“ bzw. „Abspielen“ und gilt für alle Schleifen der
 * Seite (WCAG 2.2.2), ohne Speicher im Browser. Bis zur Hydration hält er unsichtbar seinen Platz; ohne Skript und bei
 * reduzierter Bewegung blendet dauer.module.css ihn aus.
 *
 * Beim ersten Laden wartet die Steuerung nach der Hydration, bis der Auftakt der Seite vorbei ist (`nachAuftakt`,
 * lib/motion/sicht.ts; E-031 Prüfrunde 4 C4-2): Erst dann wird der Knopf sichtbar und die Schleife darf starten. Sonst
 * malte Chromium mitten in der Wärme des Heros die ganze Seite neu.
 */
export function DauerSteuerung({ children, beschriftung, className }: DauerSteuerungProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [skript, setSkript] = useState(false);
  const halt = useSyncExternalStore(abo, () => angehalten, () => false);
  const [sichtbar, setSichtbar] = useState(false);
  const [tab, setTab] = useState(false);
  const [reduziert, setReduziert] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setReduziert(prefersReducedMotion());
    const ab = [nachAuftakt(() => setSkript(true)), beobachteSicht(el, setSichtbar), beobachteTab(setTab), subscribe('reduzierteBewegung', setReduziert)];
    return () => ab.forEach((f) => f());
  }, []);

  const wert = dauerWert({ skript, sichtbar, tabSichtbar: tab, reduziert, angehalten: halt });
  return (
    <div ref={ref} className={className ? `${styles.bereich} ${className}` : styles.bereich} data-dauer={wert}>
      {children}
      <div className={styles.leiste}>
        {beschriftung}
        <button type="button" className={skript ? styles.knopf : `${styles.knopf} ${styles.wartet}`} onClick={umschalten} data-dauer-knopf="">
          <svg className={styles.zeichen} viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
            <path d={(halt ? BEDIEN_GLYPHEN.play : BEDIEN_GLYPHEN.pause)[0].d} />
          </svg>
          {knopfText(halt)}
        </button>
      </div>
    </div>
  );
}
