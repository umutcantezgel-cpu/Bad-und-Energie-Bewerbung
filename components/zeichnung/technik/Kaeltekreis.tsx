import { COMPRESS_AW_S } from '@/lib/zeichnung/geraete/compress-aw-s';
import { SCHRIFTFELD_SCHEMA, fliesspfeil, versal } from '@/lib/zeichnung/norm';
import {
  KAELTEKREIS_DRUCKGRENZE,
  KAELTEKREIS_GERAET,
  KAELTEKREIS_LUFT,
  KAELTEKREIS_PFEILE,
  KAELTEKREIS_RAHMEN,
  KAELTEKREIS_SYMBOLE,
  KAELTEKREIS_WASSER,
  KAELTEKREIS_WEGE,
} from '@/lib/zeichnung/szenen/kaeltekreis';
import { cn } from '@/lib/utils/cn';
import { Legende, Leitungen, Pfeile, Symbole } from './Schemabild';
import t from './technik.module.css';

export interface KaeltekreisProps {
  /** Kältemittel und Heizwasser fließen (Register `kaeltemittel-fliesst`, `wasser-fliesst`); nur mit DauerSteuerung. */
  bewegt?: boolean;
  /** Zugänglicher Name; `null` macht die Zeichnung dekorativ. */
  titel?: string | null;
  legende?: boolean;
  className?: string;
}

export const KAELTEKREIS_TITEL =
  'Kältekreis einer Monoblock-Wärmepumpe: Im Außengerät läuft das Kältemittel vom Verdampfer zum Verdichter, als Heißgas ' +
  'zum Plattenwärmeübertrager, flüssig zum Expansionsventil und als Nassdampf zurück zum Verdampfer. Ins Haus gehen nur ' +
  'Vorlauf und Rücklauf des Heizwassers.';

/**
 * Kältekreis (KERN K-010, E-029): Fließschema einer Monoblock-Außeneinheit mit Normsymbolen; der Kreis bleibt im
 * Gehäuse (Kontur), am Plattenwärmeübertrager beginnt der Vorlauf. Etiketten Sauggas, Heißgas, flüssig, Nassdampf; die
 * Strich-Punkt-Linie trennt Niederdruck und Hochdruck an Verdichter und Expansionsventil. Feste Fließpfeile im
 * Standbild, mit `bewegt` wandert ein Strichmuster in Fließrichtung. Server-Komponente.
 */
export function Kaeltekreis({ bewegt = false, titel = KAELTEKREIS_TITEL, legende = true, className }: KaeltekreisProps) {
  const { breite, hoehe } = KAELTEKREIS_RAHMEN;
  const g = KAELTEKREIS_GERAET;
  const luft = KAELTEKREIS_LUFT;
  const druck = KAELTEKREIS_DRUCKGRENZE;
  return (
    <figure className={cn(t.schema, className)} data-zeichnung="kaeltekreis">
      <svg
        className={cn(t.zeichnung, t.kaeltekreisBild)}
        viewBox={`0 0 ${breite} ${hoehe}`}
        focusable="false"
        {...(titel ? { role: 'img', 'aria-label': titel } : { 'aria-hidden': true })}
      >
        {/* Gehäuse der Außeneinheit: Grenze des Kältekreises */}
        <rect x={g.x} y={g.y} width={g.breite} height={g.hoehe} className={t.kontur} data-geraet-grenze="" />
        {/* Niederdruck | Hochdruck */}
        <path d={`M${druck.x} ${druck.y0}V${druck.y1}`} className={t.mittellinie} />
        <text x={druck.x - 12} y={druck.y0 + 10} className={cn(t.etikett, t.schemaText)} fontSize={16} textAnchor="end" dominantBaseline="central">
          {versal('Niederdruck')}
        </text>
        <text x={druck.x + 12} y={druck.y0 + 10} className={cn(t.etikett, t.schemaText)} fontSize={16} textAnchor="start" dominantBaseline="central">
          {versal('Hochdruck')}
        </text>
        {/* Außenluft in den Verdampfer */}
        <path d={`M${luft.pfeil.von.x} ${luft.pfeil.von.y}H${luft.pfeil.bis.x - 12}`} className={t.fein} />
        <path d={fliesspfeil(luft.pfeil.bis, { x: 1, y: 0 }, 12, 9)} className={t.voll} />
        <text x={luft.x} y={luft.y} className={cn(t.etikett, t.schemaText)} fontSize={16} textAnchor="middle" dominantBaseline="central">
          {versal(luft.wert)}
        </text>

        <Leitungen wege={[...KAELTEKREIS_WASSER, ...KAELTEKREIS_WEGE]} bewegt={bewegt} />
        <Pfeile pfeile={KAELTEKREIS_PFEILE} />
        <Symbole symbole={KAELTEKREIS_SYMBOLE} />
        {[...KAELTEKREIS_WEGE, ...KAELTEKREIS_WASSER].map((w) =>
          w.etikett ? (
            <text key={w.key} x={w.etikett.x} y={w.etikett.y} className={cn(t.etikett, t.schemaText)} fontSize={18} textAnchor={w.etikett.anker} dominantBaseline="central">
              {versal(w.etikett.wert)}
            </text>
          ) : null,
        )}
      </svg>
      {legende ? (
        <figcaption>
          <Legende symbole={KAELTEKREIS_SYMBOLE} />
          <div className={t.schriftfeld}>
            <span className="text-etikett">{SCHRIFTFELD_SCHEMA}</span>
            <span className={t.quelle}>
              Außeneinheit in Monoblock-Bauweise: Der Kältekreis bleibt im Gerät, ins Haus gehen nur Vorlauf und Rücklauf.
              Kältemittel im Beispielgerät: {COMPRESS_AW_S.kaeltemittel.name} (Propan),{' '}
              {COMPRESS_AW_S.kaeltemittel.fuellmengeKg.toLocaleString('de-DE')}&nbsp;kg laut {COMPRESS_AW_S.quelle.titel}. Vereinfacht:
              ohne 4-Wege-Ventil zum Abtauen, ohne Sammler und Filter.
            </span>
          </div>
        </figcaption>
      ) : null}
    </figure>
  );
}
