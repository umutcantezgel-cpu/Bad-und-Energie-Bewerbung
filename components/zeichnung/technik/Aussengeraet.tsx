import type { CSSProperties, ReactNode } from 'react';
import { COMPRESS_AW_L } from '@/lib/zeichnung/geraete/compress-aw-l';
import { COMPRESS_AW_S } from '@/lib/zeichnung/geraete/compress-aw-s';
import { ansichtVon, ANSICHT_SCHRIFT, type Ansicht, type AnsichtId, type Massketten } from '@/lib/zeichnung/geraete/ansicht';
import type { Aussengeraet as Geraetedaten } from '@/lib/zeichnung/geraete/typen';
import { geraetTitel } from '@/lib/zeichnung/geraete/titel';
import { wirksameVariante, type Variante } from '@/lib/zeichnung/marke';
import { SCHRIFTFELD, r1, versal } from '@/lib/zeichnung/norm';
import { cn } from '@/lib/utils/cn';
import bewegung from '../bewegung/dauer.module.css';
import t from './technik.module.css';

export { geraetTitel };

export const GERAETE: Readonly<Record<'S' | 'L', Geraetedaten>> = { S: COMPRESS_AW_S, L: COMPRESS_AW_L };

export interface AussengeraetProps {
  ansicht?: AnsichtId;
  /** S: AW 4|5|7 OR-S (1.100 × 800 × 540 mm), L: AW 10|12 OR-T (1.350 × 1.100 × 540 mm). */
  groesse?: 'S' | 'L';
  /** `marke` erst mit Bosch-Freigabe (lib/zeichnung/marke.ts); ohne sie bleibt die neutrale Fassung. */
  variante?: Variante;
  massketten?: Massketten;
  /** Rotor dreht (Register `rotor-dreht`); nur in einem Bereich mit DauerSteuerung. */
  bewegt?: boolean;
  /** Zugänglicher Name (role="img"); `null` macht die Zeichnung dekorativ. */
  titel?: string | null;
  /** Schriftfeld unter der Zeichnung (Benennung, Maßangabe, Herkunft). Standard an. */
  schriftfeld?: boolean;
  /** Größe der Maßzahlen in mm (Standard 48); kleine Einsätze wie die Einzelheit im Einstieg brauchen mehr. */
  massSchrift?: number;
  className?: string;
}

const ANSICHT_NAME: Record<AnsichtId, string> = { vorne: 'Ansicht von vorn', seite: 'Ansicht von rechts' };

/** Die Pfade einer Ansicht im Koordinatensystem des Geräts (mm); `gitter` getrennt für die obere Ebene. */
function Geometrie({ a, teil }: { a: Ansicht; teil: 'unten' | 'oben' | 'alles' }) {
  const unten = teil !== 'oben';
  const oben = teil !== 'unten';
  const ringe = a.kreise.filter((k) => k.art === 'fein');
  const andere = a.kreise.filter((k) => k.art !== 'fein');
  return (
    <>
      {unten ? (
        <>
          {a.verdeckt.map((d) => (
            <path key={d} d={d} className={t.verdeckt} />
          ))}
          {a.kontur.map((d) => (
            <path key={d} d={d} className={t.kontur} />
          ))}
          {andere.map((k) => (
            <circle key={`${k.cx}-${k.cy}-${k.r}`} cx={k.cx} cy={k.cy} r={k.r} className={k.art === 'verdeckt' ? t.verdeckt : t.kontur} />
          ))}
        </>
      ) : null}
      {oben ? (
        <>
          {ringe.map((k) => (
            <circle key={`${k.cx}-${k.cy}-${k.r}`} cx={k.cx} cy={k.cy} r={k.r} className={t.fein} />
          ))}
          {a.fein.map((d) => (
            <path key={d} d={d} className={t.fein} />
          ))}
          {a.mittellinie.map((d) => (
            <path key={d} d={d} className={t.mittellinie} />
          ))}
        </>
      ) : null}
    </>
  );
}

/** Maßketten und Hinweise (außerhalb des Gehäuses, in denselben mm-Koordinaten). */
function Masse({ a, schrift }: { a: Ansicht; schrift: number }) {
  return (
    <g data-massketten="">
      {a.masse.map((m) => (
        <g key={`${m.a.x}-${m.a.y}-${m.text.wert}`}>
          <path d={m.hilfslinien} className={t.mass} />
          <path d={m.linie} className={t.mass} />
          <text
            x={m.text.x}
            y={m.text.y}
            transform={m.text.winkel ? `rotate(${m.text.winkel} ${m.text.x} ${m.text.y})` : undefined}
            className={t.schrift}
            fontSize={schrift}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {m.text.wert}
          </text>
        </g>
      ))}
      {a.hinweise.map((h) => (
        <g key={h.text}>
          <path d={`M${r1(h.ziel.x)} ${r1(h.ziel.y)}L${r1(h.schrift.x)} ${r1(h.schrift.y + 18)}H${r1(h.schrift.x + (h.anker === 'start' ? 1 : -1) * h.text.length * ANSICHT_SCHRIFT.hinweis * 0.68)}`} className={t.mass} />
          <text x={h.schrift.x} y={h.schrift.y} className={t.etikett} fontSize={ANSICHT_SCHRIFT.hinweis} textAnchor={h.anker} dominantBaseline="central">
            {versal(h.text)}
          </text>
        </g>
      ))}
    </g>
  );
}

/**
 * Außeneinheit einer Luft/Wasser-Wärmepumpe als technische Zeichnung (KERN K-010, E-029), maßstäblich aus dem
 * Geräte-Modul (1 Einheit = 1 mm): Die verschachtelte Zeichnung hat genau die viewBox der Gerätemaße
 * (`data-geraet-mass`), Maßketten nach DIN 406 liegen außen herum. Neutrale Fassung: Gehäuse mit gerundeter Oberkante,
 * runde Ausblasöffnung mit konzentrischem Schutzgitter, dahinter ein allgemeiner Axialrotor mit vier Sichelblättern,
 * Verdampfer verdeckt, Bodenhalterungen, Anschlüsse, Kondensatablauf; kein Logo, kein Anker, kein Ring-Diffusor.
 *
 * Ebenen: unten Gehäuse und Maße, darüber der Rotor als eigenes HTML-Element (die Drehung läuft auf dem Compositor),
 * oben Gitter und Mittellinien. `bewegt` gibt dem Rotor die Kennung `rotor-dreht`; die Schleife läuft nur in einem
 * Bereich mit DauerSteuerung unter der Startbedingung, sonst steht er (Standbild). Server-Komponente.
 */
export function Aussengeraet({
  ansicht = 'vorne',
  groesse = 'S',
  variante = 'neutral',
  massketten = 'haupt',
  bewegt = false,
  titel,
  schriftfeld = true,
  massSchrift = ANSICHT_SCHRIFT.haupt,
  className,
}: AussengeraetProps) {
  const g = GERAETE[groesse];
  const a = ansichtVon(g, ansicht, { detail: 'voll', massketten, schrift: massSchrift });
  const wirksam = wirksameVariante(variante);
  const { x0, y0, x1, y1 } = a.rahmen;
  const w = x1 - x0;
  const h = y1 - y0;
  const viewBox = `${r1(x0)} ${r1(y0)} ${r1(w)} ${r1(h)}`;
  const name = titel === undefined ? geraetTitel(g, ansicht) : titel;
  const rotor = a.rotor;
  const prozent = (wert: number, bezug: number) => `${r1((wert / bezug) * 1000) / 10}%`;
  const rotorLage: CSSProperties | undefined = rotor
    ? { left: prozent(rotor.cx - rotor.r - x0, w), top: prozent(rotor.cy - rotor.r - y0, h), width: prozent(2 * rotor.r, w) }
    : undefined;
  const innen = (kinder: ReactNode) => (
    <svg x={0} y={0} width={a.breite} height={a.hoehe} viewBox={`0 0 ${a.breite} ${a.hoehe}`} overflow="visible" data-geraet-mass="">
      {kinder}
    </svg>
  );

  return (
    <figure
      className={cn(t.geraet, className)}
      data-zeichnung="aussengeraet"
      data-ansicht={ansicht}
      data-geraet={g.id}
      data-variante={wirksam}
    >
      <div className={t.ebenen} {...(name ? { role: 'img', 'aria-label': name } : { 'aria-hidden': true })}>
        <svg className={t.zeichnung} viewBox={viewBox} aria-hidden="true" focusable="false">
          {innen(<Geometrie a={a} teil={rotor ? 'unten' : 'alles'} />)}
          <Masse a={a} schrift={massSchrift} />
        </svg>
        {rotor ? (
          <>
            <svg
              className={cn(t.rotorEbene, bewegt && bewegung.rotor)}
              style={rotorLage}
              viewBox={`${r1(-rotor.r)} ${r1(-rotor.r)} ${r1(2 * rotor.r)} ${r1(2 * rotor.r)}`}
              aria-hidden="true"
              focusable="false"
              data-rotor=""
              {...(bewegt ? { 'data-motion': 'rotor-dreht' } : {})}
            >
              <path d={rotor.blaetter} className={cn(t.kontur, t.flaeche)} />
              <circle cx={0} cy={0} r={rotor.nabe} className={cn(t.kontur, t.flaeche)} />
              <circle cx={0} cy={0} r={r1(rotor.nabe * 0.36)} className={t.kontur} />
            </svg>
            <svg className={t.ebeneOben} viewBox={viewBox} aria-hidden="true" focusable="false">
              {innen(<Geometrie a={a} teil="oben" />)}
            </svg>
          </>
        ) : null}
      </div>
      {schriftfeld ? (
        <figcaption className={t.schriftfeld}>
          <span className="text-etikett">
            {g.name} · {ANSICHT_NAME[ansicht]}
          </span>
          <span className="text-etikett">{SCHRIFTFELD}</span>
          <span className={t.quelle}>
            Maße nach {g.quelle.titel}, Dok.-Nr. {g.quelle.dokument} ({g.quelle.ausgabe}); Form neutral gezeichnet, nicht die
            Gestaltung des Herstellers.
          </span>
        </figcaption>
      ) : null}
    </figure>
  );
}
