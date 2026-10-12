import { Etikettkasten } from '@/components/zeichnung/Etikettkasten';
import z from '@/components/zeichnung/zeichnung.module.css';
import { cn } from '@/lib/utils/cn';
import styles from './themen.module.css';

export interface ServicefahrzeugProps {
  /** Zugänglicher Name (role="img"). */
  titel: string;
  /** Beschriftungen an der Zeichnung, aus den Fakten (vehicle, hilti); siehe lib/themen/text.ts `zeichnung`. */
  etiketten: { sortimo: string; hilti: string; mess: string };
  className?: string;
}

/**
 * Servicefahrzeug (Signatur der Seite „Fahrzeug und Werkzeug“, 480 × 300 Einheiten): Transporter in der Seitenansicht
 * im Strich der Zeichnungen (3 px bei jeder Größe), Schiebetür offen: dahinter der Sortimo-Ausbau mit Koffern und
 * Kleinteilekästen, unten der Hilti-Koffer; auf der zurückgeschobenen Tür das Zirkelzeichen des Leitmotivs „35 km“
 * (E-027, wie im Giebel von HausKlein). Auf dem Dachträger liegen Vorlauf und Rücklauf als Rohrpaar. Steht immer auf
 * Navy (Panel des Seitenkopfs). Die Etiketten-Kästchen nennen nur belegte Ausstattung; am Handy stehen sie als Reihe
 * unter dem Bild, ab 26rem Bildbreite an ihren Stellen.
 */
export function Servicefahrzeug({ titel, etiketten, className }: ServicefahrzeugProps) {
  const l = cn(z.strich, z.linie, z.fest);
  const leise = cn(z.strich, z.linieLeise, z.fest);
  return (
    <div className={cn(styles.fahrzeug, className)} role="img" aria-label={titel} data-zeichnung="servicefahrzeug">
      <svg className={z.svg} viewBox="0 0 480 300" aria-hidden="true" focusable="false">
        {/* Dachträger mit dem Rohrpaar: Vorlauf oben, Rücklauf unten (Paarabstand 12) */}
        <path className={l} d="M66 84V74M188 84V74M296 84V74M56 74H306" />
        <path className={cn(z.strich, z.vorlauf, z.fest)} d="M60 50H304" />
        <path className={cn(z.strich, z.ruecklauf, z.fest)} d="M60 62H304" />
        <path className={l} d="M60 46V66M304 46V66" />
        {/* Aufbau: Heck, Dach, Windschutzscheibe, Motorhaube, Front; Radläufe */}
        <path
          className={l}
          d="M40 230V100Q40 84 56 84H318L370 140L430 152Q446 156 446 172V230H410A30 30 0 0 0 350 230H156A30 30 0 0 0 96 230H40Z"
        />
        {/* Fahrerhaus: Tür, Fenster, Griff, Spiegel, Scheinwerfer */}
        <path className={l} d="M316 96V224M324 100H340L368 132H324ZM330 152H346" />
        <rect className={l} x="370" y="138" width="10" height="14" rx="2" />
        <path className={l} d="M432 168H442" />
        {/* Offene Schiebetür: Öffnung mit Sortimo-Ausbau (innen warm wie das Haus) */}
        <path className={z.waermeFlaeche} d="M150 98H302V224H150Z" />
        <path className={l} d="M150 98H302V224H150Z" />
        <path className={l} d="M150 134H302M150 170H302M150 204H302" />
        {/* Fach 1: Systemkoffer */}
        <rect className={l} x="226" y="112" width="30" height="22" rx="3" />
        <rect className={l} x="262" y="108" width="34" height="26" rx="3" />
        {/* Fach 2: Koffer mit Griff */}
        <rect className={l} x="160" y="146" width="44" height="24" rx="3" />
        <path className={l} d="M174 146V140H190V146" />
        <rect className={l} x="212" y="150" width="34" height="20" rx="3" />
        <rect className={l} x="254" y="146" width="42" height="24" rx="3" />
        {/* Fach 3: Kleinteilekästen */}
        <path className={l} d="M158 180H238V204H158ZM178 180V204M198 180V204M218 180V204" />
        <path className={leise} d="M248 186H296M248 194H296" />
        {/* Boden: Hilti-Koffer */}
        <rect className={l} x="160" y="210" width="62" height="14" rx="3" />
        <path className={l} d="M182 210V206H200V210" />
        {/* Zurückgeschobene Schiebetür mit dem Zirkelzeichen (Leitmotiv 35 km) */}
        <path className={l} d="M58 100H146V224H58Z" />
        <circle className={l} cx="102" cy="150" r="22" />
        <circle className={l} cx="102" cy="150" r="9" />
        <path className={l} d="M102 150L86.44 134.44" />
        <circle className={z.voll} cx="102" cy="150" r="3.5" />
        {/* Räder */}
        <circle className={l} cx="126" cy="238" r="24" />
        <circle className={l} cx="126" cy="238" r="8" />
        <circle className={l} cx="380" cy="238" r="24" />
        <circle className={l} cx="380" cy="238" r="8" />
        {/* Bodenlinie */}
        <path className={l} d="M4 262H476" />
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
