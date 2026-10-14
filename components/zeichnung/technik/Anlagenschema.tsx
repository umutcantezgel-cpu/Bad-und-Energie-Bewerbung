import { SCHRIFTFELD_SCHEMA, schraffurLinien, versal } from '@/lib/zeichnung/norm';
import {
  ANLAGENSCHEMA_BEREICHE,
  ANLAGENSCHEMA_KAELTE,
  ANLAGENSCHEMA_LEITUNGEN,
  ANLAGENSCHEMA_PFEILE,
  ANLAGENSCHEMA_RAHMEN,
  ANLAGENSCHEMA_SYMBOLE,
  ANLAGENSCHEMA_TEXTE,
} from '@/lib/zeichnung/szenen/anlagenschema';
import { cn } from '@/lib/utils/cn';
import { Legende, Leitungen, Pfeile, Symbole } from './Schemabild';
import t from './technik.module.css';

export interface AnlagenschemaProps {
  /** Heizwasser und Kältemittel fließen (Register `wasser-fliesst`, `kaeltemittel-fliesst`); nur mit DauerSteuerung. */
  bewegt?: boolean;
  /** Zugänglicher Name; `null` macht die Zeichnung dekorativ. */
  titel?: string | null;
  /** Legende der Symbole unter der Zeichnung (auf jeder Breite lesbar). */
  legende?: boolean;
  /** Schriftfeld: `voll` mit Hinweis zur Inneneinheit, `kurz` nur die Art der Zeichnung (Stellenkopf), oder keins. */
  schriftfeld?: 'voll' | 'kurz' | false;
  className?: string;
}

export const ANLAGENSCHEMA_TITEL =
  'Anlagenschema einer Luft/Wasser-Wärmepumpe: Der Vorlauf kommt aus der Außeneinheit, läuft in der Erdleitung durch ' +
  'die Wand zur Inneneinheit mit Umwälzpumpe und Umschaltventil und weiter zu Heizkörper, Speicher und über Mischer, ' +
  'Pumpe und Sicherheitstemperaturwächter zur Fußbodenheizung; der Rücklauf fließt zurück zur Außeneinheit.';

/**
 * Anlagenschema (KERN K-010, E-029): Fließschema mit Normsymbolen nach DIN EN ISO 10628-2, Leitungen in Fließrichtung
 * (Vorlauf vom Plattenwärmeübertrager der Außeneinheit zu den Verbrauchern, Rücklauf zurück), Bögen mit Radius. Erdreich
 * als 45°-Schraffur, Wand als Schnittfläche mit Wanddurchführung, Inneneinheit als Systemgrenze (Strich-Punkt, Modell
 * offen). Die Beschriftung der Symbole steht auf breiten Flächen, die Legende darunter auf jeder Breite.
 */
export function Anlagenschema({ bewegt = false, titel = ANLAGENSCHEMA_TITEL, legende = true, schriftfeld = 'voll', className }: AnlagenschemaProps) {
  const { breite, hoehe } = ANLAGENSCHEMA_RAHMEN;
  const b = ANLAGENSCHEMA_BEREICHE;
  return (
    <figure className={cn(t.schema, className)} data-zeichnung="anlagenschema">
      <svg
        className={cn(t.zeichnung, t.anlagenBild)}
        viewBox={`0 0 ${breite} ${hoehe}`}
        focusable="false"
        {...(titel ? { role: 'img', 'aria-label': titel } : { 'aria-hidden': true })}
      >
        {/* Erdreich vor dem Haus, Geländelinie, Wand im Schnitt mit Wanddurchführung */}
        <path d={schraffurLinien(0, b.gok, b.wand.x, hoehe, 14)} className={t.schraffur} />
        <path d={`M0 ${b.gok}H${b.wand.x}`} className={t.kontur} />
        <rect x={b.wand.x} y={b.wand.y} width={b.wand.breite} height={b.wand.hoehe} className={cn(t.kontur, t.schnitt)} />
        <rect
          x={b.durchfuehrung.x}
          y={b.durchfuehrung.y}
          width={b.durchfuehrung.breite}
          height={b.durchfuehrung.hoehe}
          className={cn(t.kontur, t.flaeche)}
          data-wanddurchfuehrung=""
        />
        {/* Außeneinheit (Gehäuse) und Inneneinheit (Systemgrenze, Modell offen) */}
        <rect x={b.aussen.x} y={b.aussen.y} width={b.aussen.breite} height={b.aussen.hoehe} className={t.kontur} data-bereich="aussen" />
        <rect x={b.innen.x} y={b.innen.y} width={b.innen.breite} height={b.innen.hoehe} className={t.mittellinie} data-bereich="innen" />
        {ANLAGENSCHEMA_TEXTE.map((text) => (
          <text key={text.wert} x={text.x} y={text.y} className={cn(t.etikett, t.schemaText, t.halo)} fontSize={20} textAnchor={text.anker} dominantBaseline="central">
            {versal(text.wert)}
          </text>
        ))}

        <Leitungen wege={[...ANLAGENSCHEMA_KAELTE, ...ANLAGENSCHEMA_LEITUNGEN]} bewegt={bewegt} />
        <Pfeile pfeile={ANLAGENSCHEMA_PFEILE} />
        <Symbole symbole={ANLAGENSCHEMA_SYMBOLE} />
      </svg>
      {legende || schriftfeld ? (
        <figcaption>
          {legende ? <Legende symbole={ANLAGENSCHEMA_SYMBOLE} /> : null}
          {schriftfeld ? (
            <div className={t.schriftfeld}>
              <span className="text-etikett">{SCHRIFTFELD_SCHEMA}</span>
              {schriftfeld === 'voll' ? (
                <span className={t.quelle}>
                  Typische Anordnung, kein bestimmtes Modell: Die Inneneinheit steht als Systemgrenze (Strich-Punkt), ihre Maße
                  folgen, wenn das Modell feststeht. Sicherheitsventil und Ausdehnungsgefäß sind zum Wärmeerzeuger hin nicht
                  absperrbar. Die Fußbodenheizung hat einen gemischten Kreis mit eigener Pumpe; der Fühler im Vorlauf ist der
                  Sicherheitstemperaturwächter (DIN EN 1264-4).
                </span>
              ) : null}
            </div>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
