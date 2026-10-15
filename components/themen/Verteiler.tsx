import type { CSSProperties } from 'react';
import { Icon } from '@/components/icons';
import { Symbol } from '@/components/zeichnung/technik/Symbol';
import t from '@/components/zeichnung/technik/technik.module.css';
import type { ThemaKarte } from '@/lib/themen/text';
import { cn } from '@/lib/utils/cn';
import { verteiler, type Rechteck } from '@/lib/zeichnung/szenen/verteiler';
import styles from './stil';

const Teil = ({ r, className }: { r: Rechteck; className: string }) => (
  <rect x={r.x} y={r.y} width={r.width} height={r.height} rx={r.rx} className={className} />
);

/**
 * Verteiler (Signatur des Themen-Hubs, Navy-Panel im Kopf; seit E-031 wieder ein Heizkreisverteiler, KERN 1.3
 * K-003.2): oben die Zeichnung, ein maßstäblicher Heizkreisverteiler in der Vorderansicht (lib/zeichnung/szenen/
 * verteiler.ts) mit einem Kreis je Thema, unter jedem Kreis ein Kreisschild mit dem Zeichen des Themas; darunter die
 * Themen als Liste wie ein Stücklistenkopf (Etiketten-Kästchen mit Zeichen und Namen, feine Leitlinie, Kennwert in
 * Martian Mono). Die Zahl der Kreise folgt den Themen (getThemen() über den Text des Hubs), auch wenn eines dazukommt.
 * Die Zeichnung ist dekorativ (aria-hidden) und steht erst ab 37,5em, am Handy bleibt die Liste allein, damit der Knopf
 * nah am Kopf bleibt. Echter Text ist nur die Liste, ohne Links: Die Wege zu den Themen stehen im Abschnitt darunter.
 */
export function Verteiler({ karten }: { karten: readonly ThemaKarte[] }) {
  const z = verteiler(karten.length);
  const k = cn(t.kontur, t.flaeche);
  return (
    <div className={styles.verteiler} data-zeichnung="verteiler">
      <div className={styles.verteilerBild} aria-hidden="true">
        <svg className={t.zeichnung} viewBox={`${z.viewBox.x} ${z.viewBox.y} ${z.viewBox.breite} ${z.viewBox.hoehe}`} focusable="false">
          {/* Zuleitungen vom Wärmeerzeuger: Vorlauf hinein, Rücklauf hinaus, Überwurfmuttern am Balkenende */}
          <path d={z.zuleitung.vorlauf} className={cn(t.leitung, t.vorlauf)} />
          <path d={z.zuleitung.ruecklauf} className={cn(t.leitung, t.ruecklauf)} />
          <path d={z.zuleitung.pfeilVorlauf} className={t.pfeilVorlauf} />
          <path d={z.zuleitung.pfeilRuecklauf} className={t.pfeilRuecklauf} />
          {z.zuleitung.muttern.map((r) => (
            <Teil key={r.y} r={r} className={k} />
          ))}
          <path d={z.zuleitung.kanten} className={t.fein} />
          {/* Kreisleitungen: Vorlauf aus dem oberen Balken, Rücklauf in den unteren */}
          {z.kreise.map((kreis) => (
            <g key={kreis.x}>
              <path d={kreis.vorlauf} className={cn(t.leitung, t.vorlauf)} />
              <path d={kreis.ruecklauf} className={cn(t.leitung, t.ruecklauf)} />
            </g>
          ))}
          {/* Balken, Endstücke mit Entlüfter und KFE-Hahn */}
          <Teil r={z.balken.vorlauf} className={k} />
          <Teil r={z.balken.ruecklauf} className={k} />
          {z.endstuecke.map((e) => (
            <g key={e.koerper.y}>
              <Teil r={e.koerper} className={k} />
              {[...e.entluefter, ...e.kfe].map((r) => (
                <Teil key={`${r.x} ${r.y}`} r={r} className={k} />
              ))}
              <path d={e.tuelle} className={k} />
              <path d={e.rillen} className={t.fein} />
            </g>
          ))}
          {/* Je Kreis: Durchflussmesser auf dem Vorlauf, Ventilkopf auf dem Rücklauf, Abgänge mit Eurokonus */}
          {z.kreise.map((kreis) => (
            <g key={kreis.x}>
              <Teil r={kreis.messerMutter} className={k} />
              <Symbol id="durchflussmesser" {...kreis.messer} />
              <Teil r={kreis.messerKappe} className={k} />
              <Teil r={kreis.vorlaufMutter} className={k} />
              <Teil r={kreis.ruecklaufMutter} className={k} />
              <path d={kreis.kanten} className={t.fein} />
              <circle cx={kreis.ventilkopf.cx} cy={kreis.ventilkopf.cy} r={kreis.ventilkopf.r} className={k} />
              <circle cx={kreis.ventilkopf.cx} cy={kreis.ventilkopf.cy} r={kreis.ventilkopf.stift} className={k} />
            </g>
          ))}
        </svg>
        <span className={styles.verteilerSchilder}>
          {karten.map((karte, i) => (
            <span key={karte.id} className={styles.verteilerSchild} style={{ '--lage': z.schilder[i] } as CSSProperties} data-kreis={karte.id}>
              <Icon name={karte.icon} size={16} />
            </span>
          ))}
        </span>
      </div>
      <ul className={styles.verteilerListe} aria-label="Themen">
        {karten.map((karte) => (
          <li key={karte.id} className={styles.verteilerKreis}>
            <span className={cn(styles.verteilerKasten, 'text-etikett text-brand')}>
              <Icon name={karte.icon} size="md" className="shrink-0" />
              <span>{karte.name}</span>
            </span>
            <span aria-hidden="true" className={styles.verteilerLinie} />
            {karte.kurz ? <span className={cn(styles.verteilerWert, 'font-mass text-brand')}>{karte.kurz}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
