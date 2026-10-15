'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ABLAUF_RUHE, beobachteAblauf, warteAufEnde, type AblaufWert } from '@/lib/motion/ablauf';

export interface SichtStartProps {
  /** Der Bereich mit dem einmaligen Ablauf (Server-Komponente, kommt fertig gerendert). */
  children?: ReactNode;
  className?: string;
}

/**
 * Startet einen einmaligen Ablauf beim Sichtbarwerden (E-031, Auslöser `sicht`, Logik in lib/motion/ablauf.ts): setzt
 * `data-ablauf` am Bereich. Der Server liefert „fertig“, also den Endzustand; nur wenn Bewegung erlaubt ist und der
 * Bereich beim Laden nicht im Bild ist, wartet er als „bereit“ (Startzustand aus CSS), läuft beim Sichtbarwerden
 * („laeuft“) und steht nach dem letzten Ablauf wieder „fertig“. Die Abläufe selbst stehen im CSS unter
 * [data-ablauf="laeuft"] mit Füllart backwards; der Startzustand unter [data-ablauf="bereit"].
 */
export function SichtStart({ children, className }: SichtStartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [wert, setWert] = useState<AblaufWert>(ABLAUF_RUHE);

  useEffect(() => {
    const el = ref.current;
    return el ? beobachteAblauf(el, setWert) : undefined;
  }, []);

  useEffect(() => {
    const el = ref.current;
    return el && wert === 'laeuft' ? warteAufEnde(el, () => setWert(ABLAUF_RUHE)) : undefined;
  }, [wert]);

  return (
    <div ref={ref} className={className} data-ablauf={wert}>
      {children}
    </div>
  );
}
