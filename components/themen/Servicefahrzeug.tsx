import t from '@/components/zeichnung/technik/technik.module.css';
import { Etikettkasten } from '@/components/zeichnung/Etikettkasten';
import { FAHRZEUG, FAHRZEUG_RAHMEN } from '@/lib/zeichnung/szenen/fahrzeug';
import { cn } from '@/lib/utils/cn';
import styles from './themen.module.css';

export interface ServicefahrzeugProps {
  /**
   * Zugänglicher Name aus lib/themen/text.ts. Er beschreibt noch die alte Zeichnung (Rohrpaar auf dem Dachträger);
   * bis er angepasst ist, gilt der Name aus `fahrzeugTitel`, der zur Zeichnung passt.
   */
  titel?: string;
  /** Beschriftungen an der Zeichnung, aus den Fakten (vehicle, hilti); siehe lib/themen/text.ts `zeichnung`. */
  etiketten: { sortimo: string; hilti: string; mess: string };
  className?: string;
}

/** Zugänglicher Name aus den Etiketten (belegte Ausstattung), passend zur Zeichnung. */
export function fahrzeugTitel(etiketten: ServicefahrzeugProps['etiketten']): string {
  return (
    `Transporter von der Seite, die Schiebetür offen und nach hinten geschoben: dahinter der ${etiketten.sortimo} mit ` +
    'Regalböden, Koffern und Kleinteilekästen, unten auf dem Ladeboden der Werkzeugkoffer.'
  );
}

/**
 * Servicefahrzeug (Signatur der Seite „Fahrzeug und Werkzeug“, E-028, Zeichnung 2.0 nach E-029): ein allgemeiner
 * Kastenwagen in der Seitenansicht von rechts, maßstäblich in der Klasse der Transporter (lib/zeichnung/szenen/
 * fahrzeug.ts, 1 Einheit = 10 mm, alle Maße geschätzt, weil das Modell nicht belegt ist). Linienarten wie die
 * technischen Zeichnungen: Kontur 2 px, Felgen und Schiene fein; stumpfe Enden. Stoßfänger, Scheinwerfer und
 * Rückleuchte als eigene Teile, die Schiebetür offen über der Seitenwand, dahinter der Regalausbau. Kein Rohrpaar auf
 * dem Dach (Rohr nur, wo Wasser fließt), keine Wärmefläche, kein Zirkel. Steht immer auf Navy (Panel des
 * Seitenkopfs). Die Etiketten-Kästchen nennen nur belegte Ausstattung; am Handy stehen sie als Reihe unter dem Bild,
 * ab 26rem Bildbreite an ihren Stellen.
 */
export function Servicefahrzeug({ etiketten, className }: ServicefahrzeugProps) {
  const f = FAHRZEUG;
  const o = f.oeffnung;
  return (
    <div className={cn(styles.fahrzeug, className)} role="img" aria-label={fahrzeugTitel(etiketten)} data-zeichnung="servicefahrzeug">
      <svg className={t.zeichnung} viewBox={`0 0 ${FAHRZEUG_RAHMEN.breite} ${FAHRZEUG_RAHMEN.hoehe}`} aria-hidden="true" focusable="false">
        {/* Aufbau mit ausgesparten Radläufen; Tür vorn mit Scheibe, Griff und Spiegel; Leuchten */}
        <path d={f.aufbau} className={cn(t.kontur, t.flaeche)} />
        <path d={f.tuer} className={t.kontur} />
        <path d={f.scheibe} className={t.kontur} />
        <path d={f.griff} className={t.kontur} />
        <path d={f.spiegel} className={cn(t.kontur, t.flaeche)} />
        {f.leuchten.map((d) => (
          <path key={d} d={d} className={t.kontur} />
        ))}
        <path d={f.schiene} className={t.fein} />
        {/* Türöffnung mit dem Regalausbau */}
        <rect x={o.x0} y={o.y0} width={o.x1 - o.x0} height={o.y1 - o.y0} className={cn(t.kontur, t.flaeche)} data-oeffnung="" />
        <path d={f.regal.boeden} className={t.kontur} />
        {f.regal.koffer.map((d) => (
          <path key={d} d={d} className={t.kontur} />
        ))}
        <path d={f.regal.griffe} className={t.kontur} />
        <path d={f.regal.kaesten} className={t.fein} />
        {/* Räder: Reifen, Felge, Nabe */}
        {f.achsen.map((x) => (
          <g key={x}>
            <circle cx={x} cy={f.rad.y} r={f.rad.r} className={cn(t.kontur, t.flaeche)} />
            <circle cx={x} cy={f.rad.y} r={f.rad.felge} className={t.fein} />
            <circle cx={x} cy={f.rad.y} r={f.rad.nabe} className={t.kontur} />
          </g>
        ))}
        {/* Offene Schiebetür außen auf der Seitenwand (deckt Schiene und Radlauf dahinter), Stoßfänger, Fahrbahn */}
        <path d={f.schiebetuer} className={cn(t.kontur, t.flaeche)} data-schiebetuer="" />
        <path d={f.schiebetuerGriff} className={t.kontur} />
        {f.stossfaenger.map((d) => (
          <path key={d} d={d} className={cn(t.kontur, t.flaeche)} />
        ))}
        <path d={f.fahrbahn} className={t.kontur} />
      </svg>
      <span className={styles.fahrzeugEtiketten} aria-hidden="true">
        <Etikettkasten icon="servicefahrzeug" className={cn(styles.fahrzeugEtikett, styles.fzSortimo)}>
          {etiketten.sortimo}
        </Etikettkasten>
        <Etikettkasten icon="werkzeug" className={cn(styles.fahrzeugEtikett, styles.fzHilti)}>
          {etiketten.hilti}
        </Etikettkasten>
        <Etikettkasten icon="waermepumpe" className={cn(styles.fahrzeugEtikett, styles.fzMess)}>
          {etiketten.mess}
        </Etikettkasten>
      </span>
    </div>
  );
}
