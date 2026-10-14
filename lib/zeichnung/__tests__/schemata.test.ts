import { describe, expect, it } from 'vitest';
import type { Medium, Punkt } from '../norm';
import {
  ANLAGENSCHEMA_BEREICHE,
  ANLAGENSCHEMA_KAELTE,
  ANLAGENSCHEMA_LEITUNGEN,
  ANLAGENSCHEMA_PFEILE,
  ANLAGENSCHEMA_RAHMEN,
  ANLAGENSCHEMA_SYMBOLE,
} from '../szenen/anlagenschema';
import { LEITUNGEN as HAUS_LEITUNGEN, PFEILE as HAUS_PFEILE } from '../szenen/hausschnitt';
import {
  KAELTEKREIS_DRUCKGRENZE,
  KAELTEKREIS_GERAET,
  KAELTEKREIS_PFEILE,
  KAELTEKREIS_RAHMEN,
  KAELTEKREIS_SYMBOLE,
  KAELTEKREIS_WASSER,
  KAELTEKREIS_WEGE,
} from '../szenen/kaeltekreis';
import { an, type SchemaSymbol } from '../szenen/schema';
import { SYMBOLE } from '../symbole';

interface Weg {
  key: string;
  medium: Medium;
  punkte: readonly Punkt[];
  d: string;
}
interface PfeilDaten {
  medium: Medium;
  d: string;
}

const gleich = (a: Punkt, b: Punkt) => Math.abs(a.x - b.x) < 0.01 && Math.abs(a.y - b.y) < 0.01;

/** Erster und letzter Punkt eines Pfads aus absoluten M/L/H/V/A-Befehlen. */
function enden(d: string): [Punkt, Punkt] {
  let x = 0;
  let y = 0;
  let erster: Punkt | null = null;
  for (const m of d.matchAll(/([MLHVA])([^MLHVAZ]*)/g)) {
    const n = (m[2].match(/-?\d*\.?\d+/g) ?? []).map(Number);
    if (m[1] === 'H') x = n[0];
    else if (m[1] === 'V') y = n[0];
    else if (m[1] === 'A') [x, y] = [n[5], n[6]];
    else [x, y] = [n[0], n[1]];
    erster ??= { x, y };
  }
  return [erster!, { x, y }];
}

/** Liegt q auf dem Stück a → b (achsparallel oder schräg, Toleranz 0,5)? */
function aufStueck(q: Punkt, a: Punkt, b: Punkt): boolean {
  const lx = b.x - a.x;
  const ly = b.y - a.y;
  const l2 = lx * lx + ly * ly;
  if (l2 === 0) return gleich(q, a);
  const t = ((q.x - a.x) * lx + (q.y - a.y) * ly) / l2;
  if (t < -0.001 || t > 1.001) return false;
  return Math.hypot(a.x + t * lx - q.x, a.y + t * ly - q.y) < 0.5;
}

/** Spitze und Richtung eines Fließpfeils (M Spitze L links L rechts Z). */
function pfeilLage(d: string): { spitze: Punkt; richtung: Punkt } {
  const n = (d.match(/-?\d*\.?\d+/g) ?? []).map(Number);
  const spitze = { x: n[0], y: n[1] };
  const basis = { x: (n[2] + n[4]) / 2, y: (n[3] + n[5]) / 2 };
  return { spitze, richtung: { x: spitze.x - basis.x, y: spitze.y - basis.y } };
}

/** Jeder Pfeil liegt auf einer Leitung seines Mediums und zeigt in deren Laufrichtung (Pfad = Fließrichtung). */
function pruefePfeile(name: string, wege: readonly Weg[], pfeile: readonly PfeilDaten[]) {
  expect(pfeile.length, name).toBeGreaterThan(0);
  for (const p of pfeile) {
    const { spitze, richtung } = pfeilLage(p.d);
    const treffer = wege
      .filter((w) => w.medium === p.medium)
      .flatMap((w) => w.punkte.slice(1).map((b, i) => ({ w, a: w.punkte[i], b })))
      .filter(({ a, b }) => aufStueck(spitze, a, b));
    expect(treffer.length, `${name}: Pfeil ${p.d} liegt auf keiner Leitung (${p.medium})`).toBeGreaterThan(0);
    for (const { w, a, b } of treffer) {
      const skalar = (b.x - a.x) * richtung.x + (b.y - a.y) * richtung.y;
      expect(skalar, `${name}: Pfeil ${p.d} zeigt gegen die Fließrichtung von ${w.key}`).toBeGreaterThan(0);
    }
  }
}

/** Jeder Pfad beginnt und endet an den Punkten seiner Liste (der Pfad ist in Fließrichtung angelegt). */
function pruefePfade(name: string, wege: readonly Weg[]) {
  for (const w of wege) {
    const [a, b] = enden(w.d);
    expect(gleich(a, w.punkte[0]), `${name}: ${w.key} Anfang`).toBe(true);
    expect(gleich(b, w.punkte.at(-1)!), `${name}: ${w.key} Ende`).toBe(true);
  }
}

const imRechteck = (q: Punkt, r: { x: number; y: number; breite: number; hoehe: number }) =>
  q.x >= r.x && q.x <= r.x + r.breite && q.y >= r.y && q.y <= r.y + r.hoehe;

/** Ausdehnung eines Symbols in seiner Lage (halbe Breite und Höhe mal Vergrößerung, Drehung um 90° tauscht). */
function huelle(s: SchemaSymbol) {
  const { halb } = SYMBOLE[s.id];
  const m = s.lage.massstab ?? 1;
  const quer = Math.abs((s.lage.drehung ?? 0) % 180) === 90;
  const hx = (quer ? halb.y : halb.x) * m;
  const hy = (quer ? halb.x : halb.y) * m;
  return { x: s.lage.x - hx, y: s.lage.y - hy, breite: 2 * hx, hoehe: 2 * hy };
}

describe('Kältekreis (Monoblock, E-029)', () => {
  const k = (key: string, anschluss: string) => an(KAELTEKREIS_SYMBOLE, key, anschluss);

  it('Reihenfolge in Fließrichtung: Verdampfer → Verdichter → Verflüssiger → Expansionsventil → Verdampfer, geschlossen', () => {
    expect(KAELTEKREIS_WEGE.map((w) => w.key)).toEqual(['sauggas', 'heissgas', 'fluessig', 'nassdampf']);
    const folge: Array<[string, Punkt, Punkt]> = [
      ['sauggas', k('verdampfer', 'aus'), k('verdichter', 'ein')],
      ['heissgas', k('verdichter', 'aus'), k('verfluessiger', 'linksEin')],
      ['fluessig', k('verfluessiger', 'linksAus'), k('expansionsventil', 'ein')],
      ['nassdampf', k('expansionsventil', 'aus'), k('verdampfer', 'ein')],
    ];
    for (const [key, von, bis] of folge) {
      const w = KAELTEKREIS_WEGE.find((x) => x.key === key)!;
      expect(w.medium, key).toBe('kaeltemittel');
      expect(gleich(w.punkte[0], von), `${key} beginnt am Austritt`).toBe(true);
      expect(gleich(w.punkte.at(-1)!, bis), `${key} endet am Eintritt`).toBe(true);
    }
    expect(KAELTEKREIS_SYMBOLE.map((s) => s.id)).toEqual(['verdampfer', 'verdichter', 'plattenwaermetauscher', 'expansionsventil']);
    pruefePfade('Kältekreis', [...KAELTEKREIS_WEGE, ...KAELTEKREIS_WASSER]);
  });

  it('der Kältekreis bleibt im Gehäuse; ins Haus gehen nur Vorlauf (aus dem Verflüssiger) und Rücklauf (zurück)', () => {
    for (const w of KAELTEKREIS_WEGE) for (const q of w.punkte) expect(imRechteck(q, KAELTEKREIS_GERAET), `${w.key} ${q.x}/${q.y}`).toBe(true);
    for (const s of KAELTEKREIS_SYMBOLE) {
      const h = huelle(s);
      expect(imRechteck({ x: h.x, y: h.y }, KAELTEKREIS_GERAET), s.key).toBe(true);
      expect(imRechteck({ x: h.x + h.breite, y: h.y + h.hoehe }, KAELTEKREIS_GERAET), s.key).toBe(true);
    }
    const vl = KAELTEKREIS_WASSER.find((w) => w.medium === 'vorlauf')!;
    const rl = KAELTEKREIS_WASSER.find((w) => w.medium === 'ruecklauf')!;
    expect(KAELTEKREIS_WASSER).toHaveLength(2);
    expect(gleich(vl.punkte[0], k('verfluessiger', 'rechtsAus'))).toBe(true);
    expect(vl.punkte.at(-1)!.x).toBe(KAELTEKREIS_RAHMEN.breite);
    expect(gleich(rl.punkte.at(-1)!, k('verfluessiger', 'rechtsEin'))).toBe(true);
    expect(rl.punkte[0].x).toBe(KAELTEKREIS_RAHMEN.breite);
    // Der Vorlauf liegt oben am Verflüssiger (Gegenstrom: Heißgas oben ein, Heizwasser oben aus)
    expect(vl.punkte[0].y).toBeLessThan(rl.punkte.at(-1)!.y);
  });

  it('Druckgrenze: Verdichter und Expansionsventil auf der Strich-Punkt-Linie, Niederdruck links, Hochdruck rechts', () => {
    const lage = (key: string) => KAELTEKREIS_SYMBOLE.find((s) => s.key === key)!.lage;
    expect(lage('verdichter').x).toBe(KAELTEKREIS_DRUCKGRENZE.x);
    expect(lage('expansionsventil').x).toBe(KAELTEKREIS_DRUCKGRENZE.x);
    expect(lage('verdampfer').x).toBeLessThan(KAELTEKREIS_DRUCKGRENZE.x);
    expect(lage('verfluessiger').x).toBeGreaterThan(KAELTEKREIS_DRUCKGRENZE.x);
    const etiketten = Object.fromEntries(KAELTEKREIS_WEGE.map((w) => [w.key, w.etikett!.wert]));
    expect(etiketten).toEqual({ sauggas: 'Sauggas', heissgas: 'Heißgas', fluessig: 'flüssig', nassdampf: 'Nassdampf' });
  });

  it('feste Fließpfeile in Fließrichtung, für Kältemittel, Vorlauf und Rücklauf', () => {
    pruefePfeile('Kältekreis', [...KAELTEKREIS_WEGE, ...KAELTEKREIS_WASSER], KAELTEKREIS_PFEILE);
    for (const m of ['kaeltemittel', 'vorlauf', 'ruecklauf'] as const) expect(KAELTEKREIS_PFEILE.some((p) => p.medium === m), m).toBe(true);
  });
});

describe('Anlagenschema (Luft/Wasser, Monoblock)', () => {
  const s = (key: string, anschluss: string) => an(ANLAGENSCHEMA_SYMBOLE, key, anschluss);
  const vorlauf = ANLAGENSCHEMA_LEITUNGEN.filter((l) => l.medium === 'vorlauf');
  const ruecklauf = ANLAGENSCHEMA_LEITUNGEN.filter((l) => l.medium === 'ruecklauf');
  const aufAndererLeitung = (q: Punkt, medium: Medium, ohne: string) =>
    ANLAGENSCHEMA_LEITUNGEN.filter((l) => l.medium === medium && l.key !== ohne).some((l) =>
      l.punkte.slice(1).some((b, i) => aufStueck(q, l.punkte[i], b)),
    );

  it('enthält die Normsymbole des Pflichtumfangs und nur Leitungen mit Anfang und Ende in Fließrichtung', () => {
    const ids = new Set(ANLAGENSCHEMA_SYMBOLE.map((x) => x.id));
    for (const id of ['pumpe', 'absperrventil', 'rueckschlagventil', 'sicherheitsventil', 'ausdehnungsgefaess', 'plattenwaermetauscher', 'speicher', 'dreiwegeventil', 'heizkoerper', 'fussbodenheizung', 'fuehler', 'verdichter', 'expansionsventil', 'verdampfer'] as const) {
      expect(ids.has(id), id).toBe(true);
    }
    pruefePfade('Anlagenschema', [...ANLAGENSCHEMA_LEITUNGEN, ...ANLAGENSCHEMA_KAELTE]);
  });

  it('Vorlauf beginnt am Plattenwärmeübertrager (Wärmeerzeuger) oder zweigt ab und endet an einem Verbraucher', () => {
    const erzeuger = vorlauf.find((l) => l.key === 'vorlauf-erzeuger')!;
    expect(gleich(erzeuger.punkte[0], s('pwt', 'rechtsAus'))).toBe(true);
    const abgaenge = [s('umschaltventil', 'a'), s('umschaltventil', 'b')];
    const ziele = [s('umschaltventil', 'ein'), s('heizkoerper', 'ein'), s('fussboden', 'ein'), s('speicher', 'wendelEin')];
    for (const l of vorlauf) {
      const start = l.punkte[0];
      const ende = l.punkte.at(-1)!;
      expect(l === erzeuger || abgaenge.some((a) => gleich(a, start)) || aufAndererLeitung(start, 'vorlauf', l.key), `${l.key} Anfang`).toBe(true);
      expect(ziele.some((z) => gleich(z, ende)), `${l.key} Ende`).toBe(true);
    }
    // Jeder Verbraucher wird versorgt
    for (const z of ziele) expect(vorlauf.some((l) => gleich(l.punkte.at(-1)!, z))).toBe(true);
  });

  it('Rücklauf beginnt am Verbraucher und endet am Plattenwärmeübertrager oder mündet in einen Rücklauf', () => {
    const quellen = [s('heizkoerper', 'aus'), s('fussboden', 'aus'), s('speicher', 'wendelAus')];
    const zurueck = ruecklauf.find((l) => gleich(l.punkte.at(-1)!, s('pwt', 'rechtsEin')));
    expect(zurueck?.key).toBe('ruecklauf-heizkreis');
    for (const l of ruecklauf) {
      expect(quellen.some((q) => gleich(q, l.punkte[0])), `${l.key} Anfang`).toBe(true);
      const ende = l.punkte.at(-1)!;
      expect(l === zurueck || aufAndererLeitung(ende, 'ruecklauf', l.key), `${l.key} Ende`).toBe(true);
    }
  });

  it('Erdleitung unter der Geländeoberkante durch die Wanddurchführung; Kältemittel nur in der Außeneinheit', () => {
    const b = ANLAGENSCHEMA_BEREICHE;
    for (const key of ['vorlauf-erzeuger', 'ruecklauf-heizkreis']) {
      const l = ANLAGENSCHEMA_LEITUNGEN.find((x) => x.key === key)!;
      // Das Stück durch die Wand: waagerecht, unter GOK, innerhalb der Durchführung
      const durch = l.punkte.slice(1).find((q, i) => {
        const a = l.punkte[i];
        return a.y === q.y && Math.min(a.x, q.x) < b.wand.x && Math.max(a.x, q.x) > b.wand.x + b.wand.breite;
      });
      expect(durch, key).toBeDefined();
      expect(durch!.y, key).toBeGreaterThan(b.gok);
      expect(durch!.y, key).toBeGreaterThan(b.durchfuehrung.y);
      expect(durch!.y, key).toBeLessThan(b.durchfuehrung.y + b.durchfuehrung.hoehe);
    }
    for (const l of ANLAGENSCHEMA_KAELTE) {
      expect(l.medium).toBe('kaeltemittel');
      for (const q of l.punkte) expect(imRechteck(q, b.aussen), `${l.key} ${q.x}/${q.y}`).toBe(true);
    }
    for (const l of ANLAGENSCHEMA_LEITUNGEN) for (const q of l.punkte) expect(q.x <= ANLAGENSCHEMA_RAHMEN.breite && q.y <= ANLAGENSCHEMA_RAHMEN.hoehe).toBe(true);
  });

  it('Armaturen der Inneneinheit sitzen auf dem Vorlauf (Absperrung, Sicherheitsventil, Fühler, Pumpe, Rückschlagventil)', () => {
    const erzeuger = ANLAGENSCHEMA_LEITUNGEN.find((x) => x.key === 'vorlauf-erzeuger')!;
    const stuecke = erzeuger.punkte.slice(1).map((b, i) => [erzeuger.punkte[i], b] as const);
    for (const key of ['absperrung-vl', 'fuehler', 'pumpe', 'rueckschlag']) {
      const lage = ANLAGENSCHEMA_SYMBOLE.find((x) => x.key === key)!.lage;
      expect(stuecke.some(([a, b]) => aufStueck(lage, a, b)), key).toBe(true);
      expect(imRechteck(lage, ANLAGENSCHEMA_BEREICHE.innen), key).toBe(true);
    }
    expect(stuecke.some(([a, b]) => aufStueck(s('sicherheitsventil', 'ein'), a, b))).toBe(true);
    const rl = ANLAGENSCHEMA_LEITUNGEN.find((x) => x.key === 'ruecklauf-heizkreis')!;
    const lageRl = ANLAGENSCHEMA_SYMBOLE.find((x) => x.key === 'absperrung-rl')!.lage;
    expect(rl.punkte.slice(1).some((b, i) => aufStueck(lageRl, rl.punkte[i], b))).toBe(true);
  });

  it('feste Fließpfeile in Fließrichtung für Vorlauf, Rücklauf und Kältemittel', () => {
    pruefePfeile('Anlagenschema', [...ANLAGENSCHEMA_LEITUNGEN, ...ANLAGENSCHEMA_KAELTE], ANLAGENSCHEMA_PFEILE);
    for (const m of ['kaeltemittel', 'vorlauf', 'ruecklauf'] as const) expect(ANLAGENSCHEMA_PFEILE.some((p) => p.medium === m), m).toBe(true);
  });
});

describe('Hausschnitt: Fließpfeile', () => {
  it('jeder feste Pfeil liegt auf einer Leitung seines Mediums und zeigt in Fließrichtung', () => {
    pruefePfeile(
      'Hausschnitt',
      HAUS_LEITUNGEN.map((l) => ({ ...l, key: l.id })),
      HAUS_PFEILE,
    );
    pruefePfade(
      'Hausschnitt',
      HAUS_LEITUNGEN.map((l) => ({ ...l, key: l.id })),
    );
  });
});
