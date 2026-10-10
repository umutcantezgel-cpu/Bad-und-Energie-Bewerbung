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

/** Ein Wochentag als Heizkreis: Vorlauf hin, Bogen beim Feierabend, Rücklauf zurück. */
function Heizkreis({ tag, i }: { tag: Arbeitstag; i: number }) {
  const von = prozent(tag.vonStunde);
  const bis = prozent(tag.bisStunde);
  const freitag = tag.kuerzel === 'Fr';
  return (
    <g>
      <text className={s.tag} x={-spalte} y={reihenMitte(i)} dy="0.35em">
        {tag.kuerzel}
      </text>
      <line className={s.vorlauf} x1={von} x2={bis} y1={vorlaufY(i)} y2={vorlaufY(i)} />
      <line className={s.ruecklauf} x1={von} x2={bis} y1={ruecklaufY(i)} y2={ruecklaufY(i)} />
      <svg x={bis} y={reihenMitte(i)} overflow="visible">
        <path className={s.vorlauf} d={`M0 ${-kreis}A${kreis} ${kreis} 0 0 1 ${kreis} 0`} />
        <path className={s.ruecklauf} d={`M${kreis} 0A${kreis} ${kreis} 0 0 1 0 ${kreis}`} />
      </svg>
      <text
        className={freitag ? `${s.mass} ${s.feierabend}` : s.mass}
        x={bis}
        dx={kreis + mass}
        y={reihenMitte(i)}
        dy="0.35em"
      >
        {tag.bis}
      </text>
    </g>
  );
}

/** Haarlinie über einer Reihe, über Tagesspalte, Spur und rechten Rand. */
function Haarlinie({ y }: { y: number }) {
  return (
    <>
      <line className={s.haar} x1={-spalte} x2="100%" y1={y} y2={y} />
      <svg x="100%" overflow="visible">
        <line className={s.haar} x1={0} x2={rechts} y1={y} y2={y} />
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

      {reihen.map((y) => (
        <Haarlinie key={y} y={y} />
      ))}

      <Verteiler tage={ARBEITSTAGE} />
      {ARBEITSTAGE.map((tag, i) => (
        <Heizkreis key={tag.kuerzel} tag={tag} i={i} />
      ))}

      {FREIE_TAGE.length > 0 && (
        <g>
          <text className={s.tag} x={-spalte} y={reihenMitte(wochenende)} dy="0.35em">
            {WOCHE_TEXT.freieTage}
          </text>
          <text className={s.etikett} x={0} y={reihenMitte(wochenende)} dy="0.35em">
            {WOCHE_TEXT.wochenende}
          </text>
        </g>
      )}

      <line className={s.haar} x1={0} x2="100%" y1={achseY + 0.5} y2={achseY + 0.5} />
      {ACHSE.striche.map((h) => (
        <g key={h}>
          <line className={s.strich} x1={prozent(h)} x2={prozent(h)} y1={achseY + 1} y2={achseY + 9} />
          <text className={`${s.mass} ${s.achse}`} x={prozent(h)} y={achseY + 22} dy="0.35em" textAnchor="middle">
            {stundeKurz(h)}
          </text>
        </g>
      ))}
    </svg>
  );
}
