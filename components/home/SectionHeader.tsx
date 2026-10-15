import type { ReactNode } from 'react';
import { Rohrklammer } from '@/components/zeichnung/Rohrklammer';
import z from '@/components/zeichnung/zeichnung.module.css';
import { cn } from '@/lib/utils/cn';

export interface SectionHeaderProps {
  /** Id of the <h2>; the surrounding <Section> points its aria-labelledby here. */
  id: string;
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
  /** Etikett über der Überschrift (Planbeschriftung in Martian Mono, Versalien über text-etikett). */
  eyebrow?: ReactNode;
  /**
   * Rohrklammer links an der Überschrift (B Runde 1, Variante 1; seit E-031 zurück, KERN 1.3 K-003.2): Vorlauf oben,
   * Rücklauf unten, Bögen --radius-2, runde Enden. Rein grafisch (aria-hidden); nur, wo der Aufrufer sie setzt:
   * Themen- und Ortsseiten, auf der Startseite der Ablauf und das Einsatzgebiet wie vor E-029 (Prüfrunde 3 A3-4; dieselbe
   * Überschrift „In 3 Schritten …“ trägt sie auch auf den Stellenseiten). Standard aus.
   */
  klammer?: boolean;
}

/**
 * Abschnittskopf (KERN K-005): optionales Etikett, h2 in Bricolage (font-display) und Marken-Navy, Einleitung.
 * Props werden nur ergänzt, nie umbenannt (alle Startseiten-Abschnitte nutzen den Kopf). Mit `klammer` fasst die
 * Rohrklammer die Überschrift: mittig zur h2, mindestens zwei Bögen und ein gerades Stück hoch, damit auch eine
 * einzeilige Überschrift als Klammer gefasst ist und nicht als „C“ (wie im Seitenkopf).
 */
export function SectionHeader({ id, title, lead, className, eyebrow, klammer = false }: SectionHeaderProps) {
  return (
    <div className={cn('flex max-w-3xl flex-col gap-4', className)}>
      {eyebrow && <p className="text-etikett text-ink-muted">{eyebrow}</p>}
      <h2 id={id} className={cn('text-title-1 text-brand', klammer && 'relative pl-8')}>
        {klammer ? (
          <span aria-hidden="true" className={z.klammerRahmen}>
            <Rohrklammer />
          </span>
        ) : null}
        {title}
      </h2>
      {lead && <p className="max-w-prose text-lead text-ink-muted">{lead}</p>}
    </div>
  );
}
