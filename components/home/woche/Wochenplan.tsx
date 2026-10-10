import { Fragment } from 'react';
import {
  ACHSE,
  ARBEITSTAGE,
  FREIE_TAGE,
  MASS,
  PLAN_HOEHE,
  WOCHE_TEXT,
  prozent,
  reihenMitte,
  stundeKurz,
  type Arbeitstag,
} from './woche-daten';
import s from './woche.module.css';

/** Schrift im SVG über die semantischen Utilities (fill folgt der Textfarbe). */
const TAG = 'fill-current text-callout font-bold text-ink';
const MASSTEXT = 'fill-current font-mass text-footnote font-medium text-ink';
const HAUPTMASS = `fill-current font-mass font-semibold text-brand ${s.feierabend}`;
const ACHSTEXT = 'fill-current font-mass text-footnote font-medium text-ink-muted';
const ETIKETT = `fill-current text-etikett text-ink-muted ${s.frei}`;

export const WOCHE_BILD_TITEL_ID = 'woche-bild-titel';
export const WOCHE_BILD_TEXT_ID = 'woche-bild-text';

const { spalte, rechts, kopf, reihe, paar, bogenInnen, bogenAussen, kreis, strich, bruecke, mass, zulauf } = MASS;

const vorlaufY = (i: number) => reihenMitte(i) - kreis;
const ruecklaufY = (i: number) => reihenMitte(i) + kreis;

/**
 * Verteiler am Arbeitsbeginn (Variante 1, BEGRUENDUNG §4): Das Leitungspaar kommt vom linken Seitenrand,
 * der Rücklauf außen (Bogen --r-3), der Vorlauf innen (Bogen --r-2), konzentrisch. Der Rücklauf-Verteiler
 * steht genau auf 07:00, der Vorlauf-Verteiler --paar davor. Wo der Vorlauf eines Tages den
 * Rücklauf-Verteiler kreuzt, bleibt eine Brücke (Lücke von drei Strichen, keine Verbindung).
 * Lokale Koordinaten: x = 0 ist der Arbeitsbeginn, y wie im Plan.
 */
function Verteiler({ tage }: { tage: readonly Arbeitstag[] }) {
  const halb = strich / 2;
  const rlOben = halb;
  const vlOben = halb + paar;
  const senkrecht = rlOben + bogenAussen;
  const letzter = tage.length - 1;

  let ruecklauf = `M${-zulauf} ${rlOben}H${-bogenAussen}A${bogenAussen} ${bogenAussen} 0 0 1 0 ${senkrecht}`;
  tage.forEach((_, i) => {
    ruecklauf += `V${vorlaufY(i) - bruecke / 2}M0 ${vorlaufY(i) + bruecke / 2}`;
  });
  // Ecke in den Rücklauf des letzten Tages: um einen halben Strich verlängert, damit sie eckig schließt.
  ruecklauf += `V${ruecklaufY(letzter) + halb}`;

  let vorlauf = `M${-zulauf} ${vlOben}H${-bogenAussen}A${bogenInnen} ${bogenInnen} 0 0 1 ${-paar} ${senkrecht}V${vorlaufY(letzter) + halb}`;
  tage.forEach((_, i) => {
    vorlauf += `M${-paar} ${vorlaufY(i)}H0`;
  });

  return (
    <svg x={prozent(tage[0].vonStunde)} overflow="visible">
      <path className={`${s.verteiler} ${s.ruecklauf}`} d={ruecklauf} />
      <path className={`${s.verteiler} ${s.vorlauf}`} d={vorlauf} />
    </svg>
  );
}

/** Ein Wochentag als Heizkreis: Vorlauf hin, Rücklauf zurück; den Bogen beim Feierabend zeichnet `Boegen`. */
function Heizkreis({ tag, i }: { tag: Arbeitstag; i: number }) {
  const von = prozent(tag.vonStunde);
  const bis = prozent(tag.bisStunde);
  const freitag = tag.kuerzel === 'Fr';
  return (
    <>
      <text className={TAG} x={-spalte} y={reihenMitte(i)} dy="0.35em">
        {tag.kuerzel}
      </text>
      <line className={s.vorlauf} x1={von} x2={bis} y1={vorlaufY(i)} y2={vorlaufY(i)} />
      <line className={s.ruecklauf} x1={von} x2={bis} y1={ruecklaufY(i)} y2={ruecklaufY(i)} />
      <text
        className={freitag ? HAUPTMASS : MASSTEXT}
        x={bis}
        dx={kreis + mass}
        y={reihenMitte(i)}
        dy="0.35em"
      >
        {tag.bis}
      </text>
    </>
  );
}

/**
 * Bögen beim Feierabend: je Uhrzeit ein eingebettetes SVG an der Stelle der Uhrzeit (x in Prozent der Spur),
 * darin ein Vorlauf- und ein Rücklaufpfad mit einem Bogen je Tag (Mo–Do teilen sich 16:45). Weniger Knoten
 * als ein SVG je Tag (V6-A3-VITALS), gleiche Lage: Die Bögen überlappen weder Linien noch Maße.
 */
function Boegen({ tage }: { tage: readonly Arbeitstag[] }) {
  const jeUhrzeit = new Map<number, number[]>();
  tage.forEach((tag, i) => jeUhrzeit.set(tag.bisStunde, [...(jeUhrzeit.get(tag.bisStunde) ?? []), i]));
  return [...jeUhrzeit].map(([stunde, reihen]) => (
    <svg key={stunde} x={prozent(stunde)} overflow="visible">
      <path
        className={s.vorlauf}
        d={reihen.map((i) => `M0 ${reihenMitte(i) - kreis}A${kreis} ${kreis} 0 0 1 ${kreis} ${reihenMitte(i)}`).join('')}
      />
      <path
        className={s.ruecklauf}
        d={reihen.map((i) => `M${kreis} ${reihenMitte(i)}A${kreis} ${kreis} 0 0 1 0 ${reihenMitte(i) + kreis}`).join('')}
      />
    </svg>
  ));
}

/**
 * Haarlinien über den Reihen, über Tagesspalte, Spur und rechten Rand: je Reihe eine Linie bis zum Ende der Spur
 * (Prozent), die Stücke im rechten Rand (px) als ein Pfad in einem SVG am Ende der Spur.
 */
function Haarlinien({ ys }: { ys: readonly number[] }) {
  return (
    <>
      {ys.map((y) => (
        <line key={y} className={s.haar} x1={-spalte} x2="100%" y1={y} y2={y} />
      ))}
      <svg x="100%" overflow="visible">
        <path className={s.haar} d={ys.map((y) => `M0 ${y}H${rechts}`).join('')} />
      </svg>
    </>
  );
}

/**
 * Arbeitszeit-Diagramm (B Runde 1 figure.woche, role="img" mit Titel und Beschreibung) in der Gestalt
 * von Variante 1: jeder Arbeitstag ein Heizkreis ab 07:00, der Freitag sichtbar der kürzeste, Sa/So ohne
 * Kreis. Inline-SVG ohne viewBox: Zeiten in Prozent der Spur, alles andere in px, sodass Strich (3 px) und
 * Schrift auf jeder Breite gleich bleiben. Die Spur ist das SVG; Tagesspalte und rechter Rand liegen
 * außerhalb (overflow: visible) und werden vom Elternteil mit px-16 freigehalten.
 */
export function Wochenplan() {
  const wochenende = ARBEITSTAGE.length;
  const anzahl = wochenende + (FREIE_TAGE.length > 0 ? 1 : 0);
  const achseY = kopf + anzahl * reihe;
  const reihen = Array.from({ length: anzahl }, (_, i) => kopf + i * reihe + 0.5);

  return (
    <svg
      className={s.plan}
      width="100%"
      height={PLAN_HOEHE}
      role="img"
      aria-labelledby={WOCHE_BILD_TITEL_ID}
      aria-describedby={WOCHE_BILD_TEXT_ID}
      overflow="visible"
    >
      <title id={WOCHE_BILD_TITEL_ID}>{WOCHE_TEXT.bildTitel}</title>
      <desc id={WOCHE_BILD_TEXT_ID}>{WOCHE_TEXT.bildText}</desc>

      <Haarlinien ys={reihen} />

      <Verteiler tage={ARBEITSTAGE} />
      {ARBEITSTAGE.map((tag, i) => (
        <Heizkreis key={tag.kuerzel} tag={tag} i={i} />
      ))}
      <Boegen tage={ARBEITSTAGE} />

      {FREIE_TAGE.length > 0 && (
        <>
          <text className={TAG} x={-spalte} y={reihenMitte(wochenende)} dy="0.35em">
            {WOCHE_TEXT.freieTage}
          </text>
          <text className={ETIKETT} x={0} y={reihenMitte(wochenende)} dy="0.35em">
            {WOCHE_TEXT.wochenende}
          </text>
        </>
      )}

      <line className={s.haar} x1={0} x2="100%" y1={achseY + 0.5} y2={achseY + 0.5} />
      {ACHSE.striche.map((h) => (
        <Fragment key={h}>
          <line className={s.strich} x1={prozent(h)} x2={prozent(h)} y1={achseY + 1} y2={achseY + 9} />
          <text className={ACHSTEXT} x={prozent(h)} y={achseY + 22} dy="0.35em" textAnchor="middle">
            {stundeKurz(h)}
          </text>
        </Fragment>
      ))}
    </svg>
  );
}
