import { describe, expect, it } from 'vitest';

import {
  GEH_M_PRO_MIN,
  UMSTIEG_MIN_S,
  UMSTIEG_PUFFER_S,
  UMWEG_FAKTOR,
  baueFahrplan,
  gehSekunden,
  gehSekundenWeg,
  haversineM,
  nichtUeberholt,
  raptor,
  verbindungsprofil,
} from '../../../scripts/places/raptor.mjs';

/**
 * RAPTOR aus scripts/places/raptor.mjs an kleinen, von Hand gebauten Netzen (Paket W2a): Umstiegszeiten,
 * Fußwege, Ein- und Ausstiegsverbote, Überholen, Rückverfolgung und das Profil über einen Morgen.
 */

const h = (hhmm: string) => Number(hhmm.slice(0, 2)) * 3600 + Number(hhmm.slice(3, 5)) * 60;

/** Haltestellen auf einer Ost-West-Linie bei Wetzlar; `x` in Metern nach Osten. */
function halt(id: string, x: number) {
  return { id, name: id, lat: 50.55, lng: 8.4 + x / (111320 * Math.cos((50.55 * Math.PI) / 180)) };
}

interface Fahrt {
  id: string;
  route: number;
  stops: number[];
  arr: number[];
  dep: number[];
  board: boolean[];
  alight: boolean[];
}

function fahrt(id: string, route: number, halte: [number, string][], opts: Partial<Pick<Fahrt, 'board' | 'alight'>> = {}): Fahrt {
  return {
    id,
    route,
    stops: halte.map(([s]) => s),
    arr: halte.map(([, t]) => h(t)),
    dep: halte.map(([, t]) => h(t)),
    board: opts.board ?? halte.map(() => true),
    alight: opts.alight ?? halte.map(() => true),
  };
}

// 0 A ── 1 B ── 2 C (Bahnhof)   3 D liegt 300 m neben C   4 E (Ziel)   5 F weit weg
const STOPS = [halt('A', 0), halt('B', 3000), halt('C', 6000), halt('D', 6300), halt('E', 9000), halt('F', 20000)];
const ROUTES = [
  { id: 'r1', short: '1', type: 3 },
  { id: 'r2', short: 'RB', type: 2 },
  { id: 'r3', short: '3', type: 3 },
];

function netz(trips: Fahrt[]) {
  return { stops: STOPS, routes: ROUTES, trips };
}

const ziel = (stop: number, s = 0) => new Map([[stop, s]]);

describe('Gehzeiten und Entfernungen', () => {
  it('rechnet 80 m/min, Luftlinie mit Umwegzuschlag 1,3, aufgerundet auf volle Minuten', () => {
    expect(GEH_M_PRO_MIN).toBe(80);
    expect(UMWEG_FAKTOR).toBe(1.3);
    expect(gehSekundenWeg(80)).toBe(60);
    expect(gehSekundenWeg(81)).toBe(120);
    expect(gehSekundenWeg(0)).toBe(0);
    expect(gehSekunden(300)).toBe(5 * 60); // 390 m Weg → 4,9 Min. → 5
  });

  it('misst die Luftlinie auf etwa einen Meter genau', () => {
    expect(Math.round(haversineM(STOPS[2], STOPS[3]))).toBe(300);
  });
});

describe('raptor: eine Abfahrtszeit', () => {
  it('findet die direkte Fahrt und rechnet Zugang und Fußweg am Ziel dazu', () => {
    const fp = baueFahrplan(netz([fahrt('t1', 0, [[0, '07:00'], [1, '07:10'], [2, '07:20']])]));
    const [v] = raptor(fp, { abfahrt: h('06:50'), quellen: [{ stop: 0, s: 300 }], ziele: ziel(2, 240) });
    expect(v.fahrten).toBe(1);
    expect(v.abfahrt).toBe(h('07:00'));
    expect(v.losgehen).toBe(h('06:55'));
    expect(v.ankunftHalt).toBe(h('07:20'));
    expect(v.ankunft).toBe(h('07:24'));
    expect(v.teile.map((t: { fahrt: Fahrt }) => t.fahrt.id)).toEqual(['t1']);
  });

  it('verlangt beim Umstieg am selben Steig mindestens UMSTIEG_MIN_S', () => {
    expect(UMSTIEG_MIN_S).toBe(120);
    const zuKnapp = baueFahrplan(
      netz([
        fahrt('t1', 0, [[0, '07:00'], [1, '07:10']]),
        fahrt('t2', 2, [[1, '07:11'], [4, '07:30']]),
        fahrt('t3', 2, [[1, '07:12'], [4, '07:31']]),
      ]),
    );
    const [v] = raptor(zuKnapp, { abfahrt: h('06:59'), quellen: [{ stop: 0, s: 0 }], ziele: ziel(4) });
    expect(v.teile.map((t: { fahrt: Fahrt }) => t.fahrt.id)).toEqual(['t1', 't3']);
    expect(v.ankunft).toBe(h('07:31'));
  });

  it('Umstieg zu Fuß zur Nachbarhaltestelle: Gehzeit plus Puffer', () => {
    expect(UMSTIEG_PUFFER_S).toBe(60);
    // C → D: 300 m Luftlinie, 390 m Weg, 5 Min., plus 1 Min. Puffer = 6 Min.
    const fp = baueFahrplan(
      netz([
        fahrt('t1', 1, [[0, '07:00'], [2, '07:10']]),
        fahrt('t2', 2, [[3, '07:15'], [4, '07:30']]),
        fahrt('t3', 2, [[3, '07:16'], [4, '07:31']]),
      ]),
    );
    const [v] = raptor(fp, { abfahrt: h('06:59'), quellen: [{ stop: 0, s: 0 }], ziele: ziel(4) });
    expect(v.teile.map((t: { fahrt: Fahrt }) => t.fahrt.id)).toEqual(['t1', 't3']);
    expect(v.teile[1].fussVorher).toEqual({ von: 2, s: 300 });
  });

  it('keine Fußwege über UMSTIEG_MAX_M (F liegt 11 km entfernt)', () => {
    const fp = baueFahrplan(netz([fahrt('t1', 0, [[0, '07:00'], [4, '07:10']]), fahrt('t2', 2, [[5, '07:30'], [4, '07:40']])]));
    expect(fp.fusswege[4].some((w: { stop: number }) => w.stop === 5)).toBe(false);
    expect(fp.fusswege[2]).toEqual([{ stop: 3, s: 300 }]);
  });

  it('hält sich an Ein- und Ausstiegsverbote (pickup_type/drop_off_type = 1)', () => {
    const fp = baueFahrplan(
      netz([
        fahrt('ohne-einstieg', 0, [[0, '07:00'], [4, '07:10']], { board: [false, true] }),
        fahrt('ohne-ausstieg', 0, [[0, '07:05'], [4, '07:15']], { alight: [true, false] }),
        fahrt('normal', 0, [[0, '07:20'], [4, '07:30']]),
      ]),
    );
    const [v] = raptor(fp, { abfahrt: h('06:55'), quellen: [{ stop: 0, s: 0 }], ziele: ziel(4) });
    expect(v.teile[0].fahrt.id).toBe('normal');
  });

  it('teilt überholende Fahrten in eigene Muster und findet die schnellere', () => {
    const fp = baueFahrplan(
      netz([
        fahrt('langsam', 0, [[0, '07:00'], [1, '07:30'], [4, '08:00']]),
        fahrt('schnell', 0, [[0, '07:05'], [1, '07:15'], [4, '07:25']]),
      ]),
    );
    expect(fp.muster).toHaveLength(2);
    const [v] = raptor(fp, { abfahrt: h('06:59'), quellen: [{ stop: 0, s: 0 }], ziele: ziel(4) });
    expect(v.teile[0].fahrt.id).toBe('schnell');
  });

  it('liefert je Runde nur Verbesserungen: erst direkt, dann schneller mit Umstieg', () => {
    const fp = baueFahrplan(
      netz([
        fahrt('direkt', 0, [[0, '07:00'], [1, '07:40'], [4, '08:20']]),
        fahrt('zu-b', 2, [[0, '07:02'], [1, '07:10']]),
        fahrt('ab-b', 2, [[1, '07:15'], [4, '07:35']]),
      ]),
    );
    const runden = raptor(fp, { abfahrt: h('06:59'), quellen: [{ stop: 0, s: 0 }], ziele: ziel(4) });
    expect(runden.map((v: { fahrten: number; ankunft: number }) => [v.fahrten, v.ankunft])).toEqual([
      [1, h('08:20')],
      [2, h('07:35')],
    ]);
    // Teilstrecken hängen zusammen: Ausstieg der einen ist Einstieg der nächsten.
    const [, mitUmstieg] = runden;
    expect(mitUmstieg.teile[0].fahrt.stops[mitUmstieg.teile[0].bis]).toBe(1);
    expect(mitUmstieg.teile[1].fahrt.stops[mitUmstieg.teile[1].von]).toBe(1);
  });

  it('bei gleicher Ankunft am Ziel gewinnt der kürzere Fußweg', () => {
    // B ist Ziel-Haltestelle mit 8 Min. Fußweg, E mit 2 Min.; die Fahrt hält erst in B, dann in E.
    const fp = baueFahrplan(netz([fahrt('t1', 0, [[0, '07:00'], [1, '07:12'], [4, '07:18']])]));
    const ziele = new Map([
      [1, 8 * 60],
      [4, 2 * 60],
    ]);
    const [v] = raptor(fp, { abfahrt: h('06:59'), quellen: [{ stop: 0, s: 0 }], ziele });
    expect(v.ankunft).toBe(h('07:20'));
    expect(v.zielStop).toBe(4);
  });
});

describe('verbindungsprofil und nichtUeberholt', () => {
  const fp = baueFahrplan(
    netz([
      fahrt('a', 0, [[0, '06:00'], [4, '06:30']]),
      fahrt('b', 0, [[0, '06:30'], [4, '07:00']]),
      fahrt('c-langsam', 0, [[0, '06:29'], [1, '06:50'], [4, '07:20']]),
      fahrt('d', 0, [[0, '07:00'], [4, '07:30']]),
    ]),
  );

  it('rechnet jede Abfahrt im Fenster und lässt überholte Verbindungen weg', () => {
    const { alle, profil } = verbindungsprofil(fp, {
      quellen: [{ stop: 0, s: 120 }],
      ziele: ziel(4),
      vonS: h('05:30'),
      bisS: h('08:00'),
    });
    expect(alle.length).toBeGreaterThanOrEqual(4);
    // c-langsam fährt vor b ab und kommt nach b an → überholt.
    expect(profil.map((v: { teile: { fahrt: Fahrt }[] }) => v.teile[0].fahrt.id)).toEqual(['a', 'b', 'd']);
    expect(profil.map((v: { losgehen: number }) => v.losgehen)).toEqual([h('05:58'), h('06:28'), h('06:58')]);
  });

  it('Losgehen vor vonS zählt nicht (keine Nachtfahrten)', () => {
    const { profil } = verbindungsprofil(fp, { quellen: [{ stop: 0, s: 0 }], ziele: ziel(4), vonS: h('06:15'), bisS: h('08:00') });
    expect(profil[0].teile[0].fahrt.id).toBe('b');
  });

  it('nichtUeberholt: bei gleicher Ab- und Ankunft bleibt die mit weniger Fahrten', () => {
    const v = (losgehen: string, ankunft: string, fahrten: number) => ({ losgehen: h(losgehen), ankunft: h(ankunft), fahrten });
    const profil = nichtUeberholt([v('06:00', '07:00', 2), v('06:00', '07:00', 1), v('06:10', '07:05', 1), v('05:50', '07:10', 0)]);
    expect(profil).toEqual([v('06:00', '07:00', 1), v('06:10', '07:05', 1)]);
  });
});
