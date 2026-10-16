import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseMotionIds } from '../../../scripts/qa/check-design-tokens.mjs';
import { ABLAUF_BILD_NETZ_MS } from '../ablauf';
import { SICHERHEITSNETZ_MS } from '../head-script';
import {
  AUFTAKT_ENDE_MS,
  DAUER_IDS,
  DAUER_MS,
  DIFFUSION_STUETZ,
  FRONT_RINGE,
  EIGENSCHAFTEN,
  KLICK_ENDE_MS,
  MOTION_IDS,
  MOTION_REGISTER,
  NACHLAUF_ENDE_MS,
  NACHLAUF_START_TAKTE,
  SICHT_ENDE_MS,
  SICHT_WARTEN_MS,
  TAKT_MS,
  WECHSEL,
  isMotionId,
  maxDauerMs,
  maxVerzoegerungMs,
  motionEntry,
  type FensterAusloeser,
  type MotionId,
} from '../register';
import { WAERMEFELDER } from '../../zeichnung/szenen/waermefeld';
import { diffusionsFehler, keyframesIn, listenteile } from './keyframes';

/** KERN K-009 (Stand 1.3, E-031): Tabelle aus BEGRUENDUNG §9 mit den Ergänzungen. */
const KERN_K009 = [
  'vorlauf-haus',
  'ruecklauf-haus',
  'erdleitung',
  'erdleitung-d',
  'pfeile',
  // E-027: ersetzt 'uhr' (13:30); seit E-029 nur noch die Überblendung des Maßes „35 km“ im Giebel
  'radius-einrasten',
  // E-028: Signaturen der lokalen Seiten (Ortsseiten und Gebietsseite)
  'pendel-zeichnen',
  'ringe-zeichnen',
  'menue-oeffnen',
  'menue-leitung',
  'menue-eintrag',
  'unterstrich',
  'flaeche',
  'druck',
  'fortschritt',
  'kreis-schliessen',
  'seitenwechsel',
  // E-029: Dauerbewegung in Produkt- und Prozesszeichnungen
  'rotor-dreht',
  'wasser-fliesst',
  'kaeltemittel-fliesst',
  // E-031: Wärme und Weichheit (seitenwechsel ist seitdem die Wärmefront)
  'waerme-breitet-sich-aus',
  'buero-ablauf',
  'klick-waerme',
];

/** Mit E-029 entfallen (Effekte ohne Aussage bzw. ersetzt durch „Anhalten“/„Abspielen“). */
const ENTFALLEN = ['luft', 'luefter', 'waerme', 'kreislauf-zeigen', 'uhr'];
/** Kommt nie zurück (E-031): keine Kennung erinnert an Uhr, Zirkel, Kompass, Windrad oder Lüfter. */
const NIE = /uhr|zirkel|kompass|windrad|luefter/;

const ROOT = path.resolve(__dirname, '../../..');
const mitAusloeser = (a: string) => MOTION_IDS.filter((id) => (MOTION_REGISTER[id].ausloeser as readonly string[]).includes(a));
const ende = (takte: readonly number[], dauer: number) => Math.max(...takte) * TAKT_MS + dauer;
const steigt = (liste: readonly number[]) => liste.every((v, i) => i === 0 || v > liste[i - 1]);

describe('Bewegungsregister', () => {
  it('enthält genau die Kennungen aus KERN K-009, jede einmal und mit Eintrag', () => {
    expect([...MOTION_IDS].sort()).toEqual([...KERN_K009].sort());
    expect(new Set(MOTION_IDS).size).toBe(MOTION_IDS.length);
    expect(Object.keys(MOTION_REGISTER).sort()).toEqual([...MOTION_IDS].sort());
    for (const id of ENTFALLEN) expect(MOTION_IDS as readonly string[], id).not.toContain(id);
    for (const id of MOTION_IDS) expect(id).not.toMatch(NIE);
  });

  it('nutzt nur Kebab-Kennungen ohne Umlaute (data-motion, CSS-Selektoren)', () => {
    for (const id of MOTION_IDS) expect(id).toMatch(/^[a-z]+(?:-[a-z]+)*$/);
  });

  it('nennt für jede Kennung Zweck und reduzierte Fassung', () => {
    for (const id of MOTION_IDS) {
      const entry = motionEntry(id);
      expect(entry.zweck.length, id).toBeGreaterThan(10);
      expect(entry.reduziert.length, id).toBeGreaterThan(3);
      expect(entry.ausloeser.length, id).toBeGreaterThan(0);
    }
  });

  it('animiert nur transform, opacity und stroke-dashoffset; der View-Übergang ist entfallen (E-031)', () => {
    expect([...EIGENSCHAFTEN]).toEqual(['transform', 'opacity', 'stroke-dashoffset']);
    for (const id of MOTION_IDS) {
      const eigen = MOTION_REGISTER[id].eigenschaften;
      expect(eigen.length, id).toBeGreaterThan(0);
      for (const property of eigen) expect(EIGENSCHAFTEN, id).toContain(property);
      expect(eigen as readonly string[], id).not.toContain('view-transition');
      // Feste Dauern nur aus den Stufen: kein freier Bereich mehr (der gehörte zum View-Übergang)
      expect(Object.keys(MOTION_REGISTER[id]), id).not.toContain('dauerMsBereich');
    }
  });

  it('verzögert nur in halben oder ganzen Takten und hält Dauern auf den vier Stufen', () => {
    for (const id of MOTION_IDS) {
      const entry = MOTION_REGISTER[id];
      for (const takte of entry.verzoegerungTakte) expect(Number.isInteger(takte * 2), id).toBe(true);
      for (const token of entry.dauer) expect(Object.keys(DAUER_MS), id).toContain(token);
    }
    expect(DAUER_MS).toEqual({ 'd-1': 120, 'd-2': 240, 'd-3': 400, 'd-4': 600 });
    expect(TAKT_MS).toBe(80);
  });

  it('beendet den Auftakt nach höchstens 1.120 ms; das Maß „35 km“ blendet zuletzt ein', () => {
    const auftakt = MOTION_IDS.filter((id) => MOTION_REGISTER[id].ausloeser.includes('auftakt'));
    expect(auftakt.length).toBe(8);
    for (const id of auftakt) {
      const entry = MOTION_REGISTER[id];
      expect(entry.endeMs, id).toBeDefined();
      expect(entry.endeMs!, id).toBeLessThanOrEqual(AUFTAKT_ENDE_MS);
      // Ein Teil kann nicht vor Verzögerung + kürzester Dauer enden
      expect(entry.endeMs!, id).toBeGreaterThanOrEqual(maxVerzoegerungMs(entry) + Math.min(...entry.dauer.map((t) => DAUER_MS[t])));
      if (entry.dauer.length === 1) expect(entry.endeMs, id).toBe(maxVerzoegerungMs(entry) + maxDauerMs(entry));
      // Auftakt und Schleife schließen einander aus
      expect(entry.schleife, id).toBeUndefined();
    }
    expect(Math.max(...auftakt.map((id) => MOTION_REGISTER[id].endeMs!))).toBe(AUFTAKT_ENDE_MS);
    expect(MOTION_REGISTER['radius-einrasten'].endeMs).toBe(AUFTAKT_ENDE_MS);
  });

  it('hält Signaturmomente und alle Schleifen auf Erzählseiten (K-011)', () => {
    for (const id of [
      'vorlauf-haus',
      'radius-einrasten',
      'pendel-zeichnen',
      'ringe-zeichnen',
      'seitenwechsel',
      'waerme-breitet-sich-aus',
      'buero-ablauf',
      ...DAUER_IDS,
    ] as MotionId[]) {
      expect(MOTION_REGISTER[id].seitenart, id).toBe('erzaehlseiten');
    }
    expect(MOTION_REGISTER.fortschritt.seitenart).toBe('alle');
  });

  it('führt Ein- und Ausgänge nach der Regel: Eingang d-2/k-aus, Ausgang d-1/k-ein', () => {
    for (const id of ['unterstrich', 'flaeche', 'druck', 'menue-oeffnen'] as MotionId[]) {
      expect(MOTION_REGISTER[id].dauer, id).toEqual(['d-2', 'd-1']);
      expect(MOTION_REGISTER[id].kurve, id).toEqual(['k-aus', 'k-ein']);
    }
  });

  it('Leitmotiv „35 km“ (E-027, E-029): radius-einrasten ist nur noch eine Überblendung, reduziert steht das Maß', () => {
    expect(MOTION_IDS).not.toContain('uhr' as MotionId);
    const mass = MOTION_REGISTER['radius-einrasten'];
    expect(mass.dauer).toEqual(['d-2']);
    expect(mass.verzoegerungTakte).toEqual([11]);
    expect(mass.kurve).toEqual(['k-aus']);
    expect(mass.ausloeser).toEqual(['auftakt']);
    // Keine Skalierung, kein Zeichnen mehr: nur opacity
    expect(mass.eigenschaften).toEqual(['opacity']);
    expect(mass.endeMs).toBe(AUFTAKT_ENDE_MS);
    expect(mass.reduziert).toMatch(/35 km“ steht/);
    expect(`${mass.zweck} ${mass.reduziert}`).not.toMatch(/13:30|Feierabend|Freitag/);
  });

  it('Desktop der Startseite (E-029): der Vorlauf läuft aus der Anlage in den Knopf, vier Stücke nacheinander', () => {
    const d = MOTION_REGISTER['erdleitung-d'];
    expect(d.zweck).toMatch(/aus der Anlage zur Hauptaktion/);
    expect(d.zweck).not.toMatch(/aus der Hauptaktion/);
    expect(d.verzoegerungTakte).toHaveLength(4);
    expect(d.verzoegerungTakte).toEqual([...d.verzoegerungTakte].sort((a, b) => a - b));
    // Jedes Stück beginnt, wenn das vorige fertig ist (d-1 = 1,5 Takte)
    for (let i = 1; i < d.verzoegerungTakte.length; i += 1) {
      expect((d.verzoegerungTakte[i] - d.verzoegerungTakte[i - 1]) * TAKT_MS).toBe(DAUER_MS['d-1']);
    }
    // Der Vorlauf im Haus ist vorher fertig
    expect(d.verzoegerungTakte[0] * TAKT_MS).toBe(MOTION_REGISTER['vorlauf-haus'].endeMs);
  });

  it('Signaturen der lokalen Seiten (E-028): nur stroke-dashoffset, einmal, vor dem Schlusstakt fertig, reduziert statisch', () => {
    const pendel = MOTION_REGISTER['pendel-zeichnen'];
    expect(pendel.eigenschaften).toEqual(['stroke-dashoffset']);
    expect(pendel.ausloeser).toEqual(['auftakt']);
    expect(pendel.verzoegerungTakte).toHaveLength(2);
    expect(pendel.verzoegerungTakte[1]).toBeGreaterThan(pendel.verzoegerungTakte[0]);
    expect(pendel.endeMs!).toBeLessThanOrEqual(AUFTAKT_ENDE_MS);
    expect(pendel.reduziert).toMatch(/stehen|steht/);

    const ringe = MOTION_REGISTER['ringe-zeichnen'];
    expect(ringe.eigenschaften).toEqual(['stroke-dashoffset']);
    // 15 → 25 → 35 km: drei Ringe, gleichmäßig gestaffelt
    expect(ringe.verzoegerungTakte).toHaveLength(3);
    expect(ringe.verzoegerungTakte).toEqual([...ringe.verzoegerungTakte].sort((a, b) => a - b));
    expect(ringe.zweck).toMatch(/15.*25.*35/);
    expect(ringe.endeMs!).toBeLessThanOrEqual(AUFTAKT_ENDE_MS);
  });

  it('Dauerbewegung (E-029): genau Rotor, Wasser, Kältemittel; jede pausierbar, nur im Sichtfeld, Periode ≥ 400 ms', () => {
    expect([...DAUER_IDS].sort()).toEqual(['kaeltemittel-fliesst', 'rotor-dreht', 'wasser-fliesst']);
    for (const id of MOTION_IDS) {
      const entry = MOTION_REGISTER[id];
      const dauer = entry.ausloeser.includes('dauer');
      // Schleife genau bei Auslöser dauer, und dauer nie zusammen mit einem anderen Auslöser
      expect(entry.schleife !== undefined, id).toBe(dauer);
      if (!dauer) continue;
      expect(entry.ausloeser, id).toEqual(['dauer']);
      const s = entry.schleife!;
      expect(s.pausierbar, id).toBe(true);
      expect(s.nurSichtbar, id).toBe(true);
      expect(s.periodeMs, id).toBeGreaterThanOrEqual(400);
      // Periode auf dem halben Takt (40 ms), damit CSS sie aus --takt oder den Dauerstufen bildet
      expect(Number.isInteger(s.periodeMs / (TAKT_MS / 2)), id).toBe(true);
      // Gleichmäßig (linear), kein Pulsieren und kein Skalieren: nur transform (Drehung) oder stroke-dashoffset
      expect(entry.kurve, id).toEqual(['linear']);
      expect(entry.eigenschaften.length, id).toBe(1);
      expect(entry.endeMs, id).toBeUndefined();
      // Standbild in der reduzierten Fassung
      expect(entry.reduziert, id).toMatch(/Standbild/);
    }
    // Rotor: ein Blattabstand je 600 ms (d-4), als Drehung
    const rotor = MOTION_REGISTER['rotor-dreht'];
    expect(rotor.eigenschaften).toEqual(['transform']);
    expect(rotor.schleife!.periodeMs).toBe(DAUER_MS['d-4']);
    expect(rotor.dauer).toEqual(['d-4']);
    // Wasser und Kältemittel: das Strichmuster wandert per transform auf eigenen HTML-Ebenen (Compositor), nicht mehr
    // per stroke-dashoffset, das je Bild neu malte (Prüfung E-029, Befund 10: Malzeit unter 2 ms)
    for (const id of ['wasser-fliesst', 'kaeltemittel-fliesst'] as MotionId[]) {
      expect(MOTION_REGISTER[id].eigenschaften, id).toEqual(['transform']);
      expect(MOTION_REGISTER[id].zweck, id).toMatch(/HTML-Ebene/);
      expect(MOTION_REGISTER[id].reduziert, id).toMatch(/Fließpfeil/);
    }
  });

  it('erkennt Kennungen', () => {
    expect(isMotionId('radius-einrasten')).toBe(true);
    expect(isMotionId('rotor-dreht')).toBe(true);
    expect(isMotionId('waerme-breitet-sich-aus')).toBe(true);
    expect(isMotionId('klick-waerme')).toBe(true);
    expect(isMotionId('waerme')).toBe(false);
    expect(isMotionId('view-transition')).toBe(false);
    expect(isMotionId('uhr')).toBe(false);
    expect(isMotionId('luefter')).toBe(false);
    expect(isMotionId('konfetti')).toBe(false);
    expect(isMotionId(3)).toBe(false);
  });

  it('ist für den Design-Guard lesbar (gleiche Liste wie MOTION_IDS)', () => {
    const source = readFileSync(path.resolve(__dirname, '../register.ts'), 'utf8');
    expect(parseMotionIds(source)).toEqual([...MOTION_IDS]);
  });

  it('Wärme (E-031): Konstanten der neuen Auslöser, der Klick-Wärme und der Wärmefront', () => {
    expect(NACHLAUF_START_TAKTE).toBe(7);
    expect(NACHLAUF_ENDE_MS).toBe(1920);
    expect(SICHT_ENDE_MS).toBe(2400);
    // Prüfrunde 3 C3-3: Start spätestens SICHT_WARTEN_MS nach dem Sichtbarwerden (= Netz der Bilder in lib/motion/ablauf.ts),
    // Ende höchstens 3.900 ms nach dem Sichtbarwerden
    expect(SICHT_WARTEN_MS).toBe(ABLAUF_BILD_NETZ_MS);
    expect(SICHT_WARTEN_MS + SICHT_ENDE_MS).toBeLessThanOrEqual(3900);
    expect(KLICK_ENDE_MS).toBe(720);
    expect(WECHSEL).toEqual({ vorlaufMs: 80, wechselMs: 680, abdeckenMs: 680, aufdeckenMs: 480, haltenMs: 1200, ruheMs: 320 });
    expect(Object.isFrozen(WECHSEL)).toBe(true);
    // Der Nachlauf beginnt, wenn der Vorlauf den Heizkörper erreicht, und endet vor dem Sicherheitsnetz des Kopfskripts
    expect(NACHLAUF_START_TAKTE * TAKT_MS).toBe(MOTION_REGISTER['vorlauf-haus'].endeMs);
    expect(NACHLAUF_ENDE_MS).toBeLessThan(SICHERHEITSNETZ_MS);
    expect(NACHLAUF_ENDE_MS).toBeGreaterThan(AUFTAKT_ENDE_MS);
  });

  it('√t (E-031): DIFFUSION_STUETZ – Fortschritt = Wurzel des Zeitanteils, fünf Stellen von 0 bis 1, streng steigend', () => {
    expect(DIFFUSION_STUETZ.map((p) => [...p])).toEqual([
      [0, 0],
      [0.0625, 0.25],
      [0.25, 0.5],
      [0.5625, 0.75],
      [1, 1],
    ]);
    for (const [t, p] of DIFFUSION_STUETZ) expect(Math.sqrt(t)).toBe(p);
    expect(steigt(DIFFUSION_STUETZ.map(([t]) => t))).toBe(true);
    expect(steigt(DIFFUSION_STUETZ.map(([, p]) => p))).toBe(true);
    expect(Object.isFrozen(DIFFUSION_STUETZ)).toBe(true);
  });

  it('Fenster (E-031): genau die Auslöser nachlauf und sicht haben Fenster; Verzögerungen und Ende stimmen überein', () => {
    for (const id of MOTION_IDS) {
      const e = MOTION_REGISTER[id];
      const fensterAusloeser = e.ausloeser.filter((a): a is FensterAusloeser => a === 'nachlauf' || a === 'sicht');
      expect(Object.keys(e.fenster ?? {}).sort(), id).toEqual([...fensterAusloeser].sort());
      if (fensterAusloeser.length === 0) continue;
      const alle = new Set<number>();
      let spaetestes = 0;
      for (const a of fensterAusloeser) {
        const f = e.fenster![a]!;
        expect(f.verzoegerungTakte.length, `${id} ${a}`).toBeGreaterThan(0);
        expect(steigt(f.verzoegerungTakte), `${id} ${a}: streng steigend`).toBe(true);
        for (const t of f.verzoegerungTakte) {
          expect(Number.isInteger(t * 2), `${id} ${a}: ${t}`).toBe(true);
          alle.add(t);
        }
        // Das Fenster endet zwischen Start des letzten Teils + kürzester und + längster Dauer
        expect(f.endeMs, `${id} ${a}`).toBeLessThanOrEqual(ende(f.verzoegerungTakte, maxDauerMs(e)));
        expect(f.endeMs, `${id} ${a}`).toBeGreaterThanOrEqual(ende(f.verzoegerungTakte, Math.min(...e.dauer.map((d) => DAUER_MS[d]))));
        if (e.dauer.length === 1) expect(f.endeMs, `${id} ${a}`).toBe(ende(f.verzoegerungTakte, maxDauerMs(e)));
        spaetestes = Math.max(spaetestes, f.endeMs);
      }
      expect([...e.verzoegerungTakte], `${id}: Vereinigung der Fenster`).toEqual([...alle].sort((x, y) => x - y));
      expect(e.endeMs, id).toBe(spaetestes);
      // Einmalig: keine Schleife, nur transform und opacity, Endzustand bei reduzierter Bewegung, nur Erzählseiten
      expect(e.schleife, id).toBeUndefined();
      expect([...e.eigenschaften].sort(), id).toEqual(['opacity', 'transform']);
      expect(e.reduziert, id).toMatch(/^Endzustand/);
      expect(e.seitenart, id).toBe('erzaehlseiten');
    }
  });

  it('nachlauf (E-031): nur das Wärmefeld im Hero, Start nach dem Vorlauf, Ende ≤ 1.920 ms vor dem Sicherheitsnetz', () => {
    expect(mitAusloeser('nachlauf')).toEqual(['waerme-breitet-sich-aus']);
    const f = MOTION_REGISTER['waerme-breitet-sich-aus'].fenster!.nachlauf!;
    expect(Math.min(...f.verzoegerungTakte)).toBe(NACHLAUF_START_TAKTE);
    expect(Math.min(...f.verzoegerungTakte) * TAKT_MS).toBeGreaterThanOrEqual(MOTION_REGISTER['vorlauf-haus'].endeMs!);
    expect(f.endeMs).toBeLessThanOrEqual(NACHLAUF_ENDE_MS);
    expect(f.endeMs).toBeLessThan(SICHERHEITSNETZ_MS);
    // vier Bänder, je d-4, linear auf den √t-Stützstellen
    expect(f.verzoegerungTakte).toHaveLength(4);
    expect(MOTION_REGISTER['waerme-breitet-sich-aus'].dauer).toEqual(['d-4']);
    expect(MOTION_REGISTER['waerme-breitet-sich-aus'].kurve).toEqual(['linear']);
  });

  it('Wärmefeld (E-031): die Verzögerungen stammen aus den Daten (lib/zeichnung/szenen/waermefeld.ts), heiß zuerst', () => {
    const f = MOTION_REGISTER['waerme-breitet-sich-aus'].fenster!;
    // Hero: Bänder des Hausschnitts von heiß (Stufe 4) nach kühl (Stufe 1)
    const hero = [...WAERMEFELDER.hausschnitt.baender].sort((a, b) => b.stufe - a.stufe).map((b) => b.startTakte);
    expect([...f.nachlauf!.verzoegerungTakte]).toEqual(hero);
    // Wärmepumpen-Seite: beide Vergleichsräume (Heizkörper, Fußbodenheizung), jede Verzögerung einmal
    const raum = new Set([...WAERMEFELDER['raum-heizkoerper'].baender, ...WAERMEFELDER['raum-fussboden'].baender].map((b) => b.startTakte));
    expect([...f.sicht!.verzoegerungTakte]).toEqual([...raum].sort((a, b) => a - b));
  });

  it('sicht (E-031, Prüfrunde 3 C3-3): nur Wärmefeld und Büro-Szenen, Ende ≤ 2.400 ms ab dem Start (sichtbar und Bilder dekodiert)', () => {
    expect(mitAusloeser('sicht')).toEqual(['waerme-breitet-sich-aus', 'buero-ablauf']);
    for (const id of mitAusloeser('sicht') as MotionId[]) {
      const f = MOTION_REGISTER[id].fenster!.sicht!;
      expect(Math.min(...f.verzoegerungTakte), id).toBeGreaterThanOrEqual(0);
      expect(f.endeMs, id).toBeLessThanOrEqual(SICHT_ENDE_MS);
    }
    const buero = MOTION_REGISTER['buero-ablauf'];
    expect(buero.ausloeser).toEqual(['sicht']);
    expect(buero.kurve).toEqual(['k-aus']);
    expect(buero.dauer.every((d) => d === 'd-3' || d === 'd-4')).toBe(true);
    expect(Math.max(...buero.verzoegerungTakte)).toBeLessThanOrEqual(22);
    expect(buero.reduziert).toBe('Endzustand: Plan, Blatt, Lieferung, Ablage stehen.');
  });

  it('klick-waerme (E-031; Owner-Feedback 16.10.2026): drei Ringe um die Box, ½ Takt versetzt eingeblendet (d-2), gemeinsam verklungen (d-3, k-wechsel), Ende 720 ms; nur opacity; reduziert keine Welle', () => {
    const k = MOTION_REGISTER['klick-waerme'];
    expect(mitAusloeser('tippen')).toContain('klick-waerme');
    expect(k.ausloeser).toEqual(['tippen']);
    // Kein Wachsen mehr: nur Deckkraft (Owner-Feedback: nichts Plötzliches)
    expect([...k.eigenschaften]).toEqual(['opacity']);
    // Prüfrunde 4 C4-3: alle Dauerstufen der Datei – einblenden d-2, verklingen d-3 (Ausgang mit k-wechsel, im Zweck)
    expect(k.dauer).toEqual(['d-2', 'd-3']);
    expect(k.zweck).toMatch(/Ausnahme vom Ausgang d-1 mit k-ein/);
    const frontCss = readFileSync(path.resolve(__dirname, '../../../components/site/waermefront/waermefront.module.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    // Die Ringe blenden mit dem gemeinsamen Ablauf der Schichten ein und verklingen mit der Überlagerung (data-auf)
    const eRegel = frontCss.match(/\.e > \* \{([^}]*)\}/)![1];
    expect(eRegel).toContain(`animation: f var(--${k.dauer[0]}) linear var(--q) both;`);
    expect(eRegel).toContain('--q: calc(var(--takt) * var(--v, 0));');
    expect(frontCss.match(/\.k > \* \{([^}]*)\}/)![1]).not.toMatch(/animation/);
    expect(frontCss.match(/\.e\[data-auf\] \{([^}]*)\}/)![1]).toContain(`transition: var(--${k.dauer[1]}) var(--k-wechsel) var(--takt);`);
    // Ende: der innere Ring steht (d-2), dann ein Takt und d-3
    expect(DAUER_MS[k.dauer[0]] + TAKT_MS + DAUER_MS[k.dauer[1]]).toBe(KLICK_ENDE_MS);
    expect(k.verzoegerungTakte).toEqual([0, 0.5, 1]);
    expect(k.kurve).toEqual(['linear', 'k-wechsel']);
    expect(k.endeMs).toBe(KLICK_ENDE_MS);
    // Etwas langsamer als vorher (480 ms), nie länger als eine Sekunde
    expect(KLICK_ENDE_MS).toBeGreaterThan(480);
    expect(KLICK_ENDE_MS).toBeLessThanOrEqual(1000);
    expect(k.reduziert).toBe('Keine Welle; der Klick wirkt sofort.');
    expect(k.zweck).toMatch(/nicht\s+in Formularen/);
    expect(k.zweck).toMatch(/\/bewerbung/);
    // Prüfrunde 1 A1-3, C1-3, Prüfrunde 5 A5-4: Ringe ohne Fläche, außerhalb der Box, auch nicht auf dem Weg in den
    // Bewerbungsweg
    expect(k.zweck).toMatch(/Ringe ohne Fläche und außerhalb der Box/);
    expect(k.zweck).toMatch(/nicht auf dem Weg dorthin/);
    expect(k.schleife).toBeUndefined();
  });

  it('seitenwechsel (E-031; Owner-Feedback 16.10.2026): sanfter Wärmeschleier mit den Ringen von Runde 1; Vorlauf 80, Deckung und Wechsel 680, aufdecken 480, halten 1.200, Ruhe höchstens 320 ms', () => {
    const w = MOTION_REGISTER.seitenwechsel;
    expect(mitAusloeser('navigation')).toEqual(['seitenwechsel']);
    expect(w.ausloeser).toEqual(['navigation']);
    expect([...w.eigenschaften].sort()).toEqual(['opacity', 'transform']);
    expect(w.dauer).toEqual(['d-4', 'd-3', 'd-2', 'd-1']);
    // Einblenden je Schicht: der Schleier ½ Takt versetzt ab dem Klick, die drei Ringe nach 1, 2½, 4 Takten, die
    // Seitenfarbe nach 5½ Takten
    expect(w.verzoegerungTakte).toEqual([0, 0.5, 1, 2.5, 4, 5.5]);
    expect(steigt(w.verzoegerungTakte)).toBe(true);
    // Ringe (Owner-Feedback 16.10.2026 (2)): je eigene Verzögerung (Schichten 3–5), Dauer in ganzen Takten (die einzige
    // Ausnahme von d-1…d-4), nach innen kürzer, Deckkraft nach innen dichter, keiner deckend
    expect(w.ringe).toBe(FRONT_RINGE);
    expect(Object.isFrozen(FRONT_RINGE)).toBe(true);
    expect(FRONT_RINGE).toEqual({ verzoegerungTakte: [1, 2.5, 4], dauerTakte: [7, 6, 5], deckkraft: [0.55, 0.7, 0.85] });
    expect([...w.verzoegerungTakte.slice(2, 5)]).toEqual([...FRONT_RINGE.verzoegerungTakte]);
    for (const d of FRONT_RINGE.dauerTakte) expect(Number.isInteger(d)).toBe(true);
    expect(steigt([...FRONT_RINGE.dauerTakte].reverse())).toBe(true);
    expect(steigt(FRONT_RINGE.deckkraft)).toBe(true);
    for (const o of FRONT_RINGE.deckkraft) expect(o).toBeLessThan(1);
    // Sie stehen ganz, bevor die Seitenfarbe einblendet (d-1), und wachsen höchstens einen Takt über die Deckung hinaus
    const seitenfarbe = w.verzoegerungTakte.at(-1)! * TAKT_MS;
    FRONT_RINGE.verzoegerungTakte.forEach((v, j) => {
      expect(v * TAKT_MS + DAUER_MS['d-1']).toBeLessThanOrEqual(seitenfarbe);
      expect((v + FRONT_RINGE.dauerTakte[j]) * TAKT_MS).toBeLessThanOrEqual(WECHSEL.abdeckenMs + TAKT_MS);
    });
    expect(new Set(FRONT_RINGE.verzoegerungTakte.map((v, j) => v + FRONT_RINGE.dauerTakte[j])).size).toBe(3);
    // Wachsen nach einem Takt Vorlauf, d-4 mit k-wechsel; Einblenden linear
    expect(w.kurve).toEqual(['k-wechsel', 'linear']);
    expect(w.wechsel).toBe(WECHSEL);
    expect(WECHSEL.vorlaufMs).toBe(TAKT_MS);
    expect(WECHSEL.vorlaufMs + DAUER_MS['d-4']).toBe(WECHSEL.abdeckenMs);
    expect(ende(w.verzoegerungTakte, DAUER_MS['d-2'])).toBe(WECHSEL.abdeckenMs);
    // Die Seite wechselt erst, wenn die Seitenfarbe deckt; Abdecken 650–750, Aufdecken 450–550, zusammen 1,1–1,3 s
    expect(WECHSEL.wechselMs).toBe(WECHSEL.abdeckenMs);
    expect(WECHSEL.abdeckenMs).toBeGreaterThanOrEqual(650);
    expect(WECHSEL.abdeckenMs).toBeLessThanOrEqual(750);
    expect(WECHSEL.aufdeckenMs).toBeGreaterThanOrEqual(450);
    expect(WECHSEL.aufdeckenMs).toBeLessThanOrEqual(550);
    expect(WECHSEL.abdeckenMs + WECHSEL.aufdeckenMs).toBeGreaterThanOrEqual(1100);
    expect(WECHSEL.abdeckenMs + WECHSEL.aufdeckenMs).toBeLessThanOrEqual(1300);
    expect(WECHSEL.aufdeckenMs).toBe(TAKT_MS + DAUER_MS['d-3']);
    // Prüfrunde 5 C5-2: Ruhe höchstens vier Takte nach dem neuen Pfad; Halten deckt Ruhe und Aufdecken
    expect(WECHSEL.ruheMs).toBeLessThanOrEqual(4 * TAKT_MS);
    expect(WECHSEL.haltenMs).toBeGreaterThanOrEqual(WECHSEL.ruheMs + WECHSEL.aufdeckenMs);
    expect(w.reduziert).toBe('Kein Übergang: die Seite wechselt sofort.');
    expect(w.zweck).not.toMatch(/View-Transition|View Transition/);
    // Prüfrunde 1 A1-12, B1-5: die warmen Bänder kühl außen, heiß innen, ohne kalten Kern; Prüfrunde 4 A4-2: zuletzt die
    // Seitenfarbe, nie eine einfarbige Pfirsichfläche; Owner-Feedback: kein Punkt am Anfang, ruhig, verblasst
    expect(w.zweck).toMatch(/heißeste zuletzt\s+und innen/);
    expect(w.zweck).toMatch(/ohne kalten Kern/);
    expect(w.zweck).toMatch(/Seitenfarbe/);
    expect(w.zweck).toMatch(/nie steht eine einfarbige Pfirsichfläche/);
    expect(w.zweck).toMatch(/nicht als Punkt/);
    expect(w.zweck).toMatch(/verblasst die Front/);
    expect(w.zweck).toMatch(/drei warme Ringe ungleichmäßig/);
    expect(w.zweck).toMatch(/nach √t/);
    expect(w.seitenart).toBe('erzaehlseiten');
    for (const id of MOTION_IDS) if (id !== 'seitenwechsel') expect(MOTION_REGISTER[id].wechsel, id).toBeUndefined();
    for (const id of MOTION_IDS) if (id !== 'seitenwechsel') expect(MOTION_REGISTER[id].ringe, id).toBeUndefined();
  });

  describe('Skalieren nur nach √t (E-031)', () => {
    const gut =
      '@keyframes wachsen {\n  from { transform: scale(0.6); opacity: 0; }\n  6.25% { transform: scale(0.7); }\n' +
      '  25% { transform: scale(0.8); }\n  56.25% { transform: scale(0.9); }\n  to { transform: scale(1); opacity: 1; }\n}\n' +
      '.a { animation: wachsen var(--d-4) linear calc(var(--takt) * 7) backwards; }';

    it('der Prüfer nimmt genau die Stützstellen und erkennt Abweichungen', () => {
      expect(diffusionsFehler(gut)).toEqual([]);
      expect(diffusionsFehler(gut.replace(/transform: scale\(([\d.]+)\)/g, 'scale: $1'))).toEqual([]);
      // falsche Stellen, Überschwingen, Schrumpfen, Kurve, Variablen, ungleichmäßig, animation-name
      expect(diffusionsFehler(gut.replace('6.25%', '10%'))[0]).toMatch(/Stellen/);
      expect(diffusionsFehler(gut.replace('scale(0.9)', 'scale(1.05)'))).toContainEqual(expect.stringMatching(/nicht monoton/));
      expect(diffusionsFehler(gut.replace('scale(0.6)', 'scale(1.2)'))).toContainEqual(expect.stringMatching(/wächst nicht/));
      expect(diffusionsFehler(gut.replace('scale(0.7)', 'scale(0.75)'))).toContainEqual(expect.stringMatching(/Fortschritt/));
      expect(diffusionsFehler(gut.replace('linear calc', 'var(--k-aus) calc'))).toContainEqual(expect.stringMatching(/linear fehlt/));
      // Kommas in Klammern trennen keine Abläufe (Prüfrunde 4: Dauer mit Grundwert); ein zweiter Ablauf ohne linear auch nicht
      expect(diffusionsFehler(gut.replace('var(--d-4) linear', 'var(--d, var(--d-4)) linear'))).toEqual([]);
      expect(diffusionsFehler(gut.replace('var(--d-4) linear', 'var(--d, var(--d-4)) var(--k-aus)'))).toContainEqual(expect.stringMatching(/linear fehlt/));
      expect(diffusionsFehler(gut.replace('backwards;', 'backwards, andere 1s ease;'))).toEqual([]);
      expect(diffusionsFehler(gut.replace('linear calc(var(--takt) * 7) backwards;', 'ease, wachsen 1s linear;'))).toContainEqual(expect.stringMatching(/linear fehlt/));
      expect(diffusionsFehler(gut.replace('scale(0.8)', 'scale(var(--s))'))[0]).toMatch(/Zahl/);
      expect(diffusionsFehler(gut.replace('scale(0.8)', 'scale(0.8, 0.9)'))[0]).toMatch(/gleichmäßig/);
      expect(diffusionsFehler(`${gut}\n.b { animation-name: wachsen; }`)).toContainEqual(expect.stringMatching(/Kurzform/));
      // zweistellige Pops sind verboten, einachsiges Zeichnen von Leitungen (scaleX/scaleY) bleibt erlaubt
      expect(diffusionsFehler('@keyframes pop { from { transform: scale(0); } to { transform: none; } }')[0]).toMatch(/Stellen/);
      expect(diffusionsFehler('@keyframes fallen { from { transform: scaleY(0); } to { transform: none; } }')).toEqual([]);
      expect(keyframesIn(gut)[0].stopps.map((s) => s.anteil)).toEqual([0, 6.25, 25, 56.25, 100]);
    });

    it('jedes Stylesheet in app/ und components/ hält die Regel', () => {
      const dateien: string[] = [];
      const lauf = (dir: string) => {
        for (const name of readdirSync(dir)) {
          if (name === 'node_modules' || name.startsWith('.')) continue;
          const p = path.join(dir, name);
          if (statSync(p).isDirectory()) lauf(p);
          else if (name.endsWith('.css')) dateien.push(p);
        }
      };
      for (const dir of ['app', 'components']) lauf(path.join(ROOT, dir));
      expect(dateien.length).toBeGreaterThan(20);
      // Einzige Ausnahme (Owner-Feedback 16.10.2026): Die Wärmefront wächst ruhig mit k-wechsel; sie hat genau einen
      // skalierenden Ablauf, und der prüft sich im nächsten Fall eigens
      const FRONT = 'components/site/waermefront/waermefront.module.css';
      for (const datei of dateien) {
        const rel = path.relative(ROOT, datei);
        const fehler = diffusionsFehler(readFileSync(datei, 'utf8'));
        if (rel === FRONT) expect(new Set(fehler.map((f) => f.split(':')[0])), rel).toEqual(new Set(['w']));
        else expect(fehler, rel).toEqual([]);
      }
    });

    it('die Wärmefront (einzige Ausnahme): Schleier und Seitenfarbe ein Ablauf w von var(--z) auf den Grundwert, nur mit d-4, k-wechsel und einem Takt Vorlauf; ihre Ringe wachsen nach √t (r)', () => {
      const css = readFileSync(path.join(ROOT, 'components/site/waermefront/waermefront.module.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      const skalierend = keyframesIn(css).filter((k) => k.stopps.some((s) => s.deklarationen.has('scale') || /scale\(/.test(s.deklarationen.get('transform') ?? '')));
      expect(skalierend.map((k) => k.name)).toEqual(['w', 'r']);
      expect(skalierend[0].stopps.map((s) => [s.anteil, Object.fromEntries(s.deklarationen)])).toEqual([[0, { scale: 'var(--z)' }]]);
      const teile = [...css.matchAll(/(?<![\w-])animation\s*:\s*([^;]+);/g)].flatMap((m) => listenteile(m[1])).map((t) => t.trim());
      expect(teile.filter((t) => /^w\b/.test(t))).toEqual(['w var(--d-4) var(--k-wechsel) var(--takt) both']);
      // r hält die Regel ganz (nur w ist ausgenommen) und läuft linear, genau einmal benutzt (die Ringe)
      expect(diffusionsFehler(css).filter((f) => /^r: /.test(f))).toEqual([]);
      expect(diffusionsFehler(css).every((f) => /^w: /.test(f))).toBe(true);
      expect(teile.filter((t) => /^r\b/.test(t))).toEqual(['r calc(var(--takt) * var(--u)) linear var(--q) both']);
      // Keine weitere Skalierung in der Datei: scale nur als Ziel --m, Start --z und die Stützstellen von r; transform
      // nur als fester Faktor --m der Ringe (nie in Keyframes)
      expect([...css.matchAll(/(?<![\w-])transform\s*:\s*([^;]+);/g)].map((m) => m[1].trim())).toEqual(['scale(var(--m))']);
      expect(keyframesIn(css).every((k) => k.stopps.every((s) => !s.deklarationen.has('transform')))).toBe(true);
      expect([...css.matchAll(/(?<![\w-])scale\s*:\s*([^;]+);/g)].map((m) => m[1].trim()).sort()).toEqual(['0.16', '0.37', '0.58', '0.79', '1', 'var(--m)', 'var(--z)']);
    });
  });
});
