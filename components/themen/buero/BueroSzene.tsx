import { Icon } from '@/components/icons';
import t from '@/components/zeichnung/technik/technik.module.css';
import { SichtStart } from '@/components/zeichnung/bewegung/SichtStart';
import type { MotionId } from '@/lib/motion/register';
import { cn } from '@/lib/utils/cn';
import { geschuetzt, type BueroSzeneText } from '@/lib/themen/text';
import { BUERO_SZENEN } from '@/lib/zeichnung/buero/szenen';
import styles from '../stil';
import { BueroZeichnung } from './BueroZeichnung';

/**
 * Eine Szene der Seite „Büro und Verwaltung“ (E-031, Paket W3) als Abbildung: die Zeichnung im Wärmebereich mit ihren
 * Beschriftungen in SichtStart (einmaliger Ablauf beim Sichtbarwerden, Register `buero-ablauf`; ohne Skript, beim Laden
 * im Bild und bei reduzierter Bewegung der Endzustand), darunter Titel, die Aufgabe im Wortlaut der Stellenanzeige
 * und das Schriftfeld mit Format und Norm.
 */
/** Einmaliger Ablauf beim Sichtbarwerden (Auslöser `sicht`): steht nur in SichtStart (sicht-bereich.test). */
const ABLAUF: MotionId = 'buero-ablauf';

export function BueroSzene({ szene }: { szene: BueroSzeneText }) {
  const id = `szene-${szene.id}`;
  return (
    <figure className="m-0 flex flex-col gap-4" data-zeichnung={szene.id}>
      <div role="img" aria-label={szene.bild} data-tone="warm">
        <SichtStart className={styles.bueroBild}>
          <BueroZeichnung szene={BUERO_SZENEN[szene.id]} beschriftungen={szene.beschriftungen} motion={ABLAUF} />
        </SichtStart>
      </div>
      <figcaption className="flex flex-col gap-2">
        <h3 id={id} className="flex items-center gap-3 text-title-3 text-brand">
          <Icon name={szene.icon} size="lg" className="shrink-0" />
          {szene.titel}
        </h3>
        {szene.aufgabe ? <p className="max-w-prose text-body text-ink">{geschuetzt(szene.aufgabe.text)}</p> : null}
        <div className={t.schriftfeld}>
          <span className={cn('text-etikett', styles.bueroSchriftfeld)}>{szene.schriftfeld}</span>
        </div>
      </figcaption>
    </figure>
  );
}
