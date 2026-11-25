import { describe, expect, it } from 'vitest';
import { Welt, koerper, schwerpunkt, wurf, type Koerper, type Stoss } from '../spiel/physik';

/** Welt 1000 × 800 mit einem Ball von 28 px Radius. */
function weltMitBall(): { welt: Welt; ball: Koerper } {
  const welt = new Welt();
  welt.links = 0;
  welt.rechts = 1000;
  welt.boden = 800;
  const ball = welt.dazu(koerper({ name: 'ball', x: 500, y: 300, masse: 0.14, kreise: [{ x: 0, y: 0, r: 28 }], prall: 0.76, reibung: 0.5, rollen: 5, luft: 0.1 }));
  return { welt, ball };
}
const figurKreise = (k: number) => [
  { x: 322 * k, y: 190 * k, r: 116 * k, d: 0.5 },
  { x: 320 * k, y: 420 * k, r: 70 * k, d: 1.4 },
  { x: 266 * k, y: 596 * k, r: 24 * k, d: 1.8 },
  { x: 374 * k, y: 596 * k, r: 24 * k, d: 1.8 },
];
/** Rechnet in Bildern von 1/60 s, bis die Bedingung gilt oder die Zeit um ist. Gibt die vergangene Zeit zurück. */
function laufe(welt: Welt, sekunden: number, bis?: () => boolean): number {
  let t = 0;
  while (t < sekunden && !(bis && bis())) {
    welt.schritt(1 / 60);
    t += 1 / 60;
  }
  return t;
}

describe('Physik des Helfers: freier Fall und Aufprall', () => {
  it('fällt so schnell, wie die Schwerkraft es verlangt', () => {
    const { welt, ball } = weltMitBall();
    ball.luft = 0;
    const hoehe = welt.boden - 28 - ball.y;
    let unten = false;
    welt.beiStoss = (s) => {
      if (s.art === 'boden') unten = true;
    };
    const zeit = laufe(welt, 5, () => unten);
    expect(zeit).toBeGreaterThan(Math.sqrt((2 * hoehe) / welt.schwerkraft) - 0.04);
    expect(zeit).toBeLessThan(Math.sqrt((2 * hoehe) / welt.schwerkraft) + 0.04);
  });

  it('springt jedes Mal niedriger und bleibt am Ende auf dem Boden liegen', () => {
    const { welt, ball } = weltMitBall();
    const gipfel: number[] = [];
    let vorher = 0;
    laufe(welt, 12, () => {
      if (vorher < 0 && ball.vy >= 0) gipfel.push(welt.boden - 28 - ball.y);
      vorher = ball.vy;
      return ball.schlaeft;
    });
    expect(gipfel.length).toBeGreaterThanOrEqual(3);
    for (let i = 1; i < gipfel.length; i++) expect(gipfel[i]).toBeLessThan(gipfel[i - 1]);
    expect(gipfel[0]).toBeLessThan(472);
    expect(ball.schlaeft).toBe(true);
    expect(ball.y).toBeCloseTo(welt.boden - 28, 0);
    expect(welt.wach).toBe(false);
  });

  it('bleibt auch bei einem harten Wurf zwischen den Wänden und über dem Boden', () => {
    const { welt, ball } = weltMitBall();
    ball.vx = 5200;
    ball.vy = -2600;
    let minX = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    laufe(welt, 20, () => {
      minX = Math.min(minX, ball.x);
      maxX = Math.max(maxX, ball.x);
      maxY = Math.max(maxY, ball.y);
      return ball.schlaeft;
    });
    expect(minX).toBeGreaterThan(28 - 3);
    expect(maxX).toBeLessThan(1000 - 28 + 3);
    expect(maxY).toBeLessThan(800 - 28 + 3);
    expect(ball.schlaeft).toBe(true);
  });

  it('Reibung am Boden versetzt den rutschenden Ball in Drehung, in Rollrichtung', () => {
    const { welt, ball } = weltMitBall();
    ball.y = welt.boden - 28;
    ball.vx = 600;
    laufe(welt, 0.4);
    expect(ball.dreh).toBeGreaterThan(5);
    expect(ball.vx).toBeLessThan(600);
  });

  it('meldet einen Stoß mit dem Tempo des Aufpralls', () => {
    const { welt, ball } = weltMitBall();
    const stoesse: Stoss[] = [];
    welt.beiStoss = (s) => stoesse.push(s);
    ball.luft = 0;
    laufe(welt, 5, () => stoesse.length > 0);
    const erwartet = Math.sqrt(2 * welt.schwerkraft * (welt.boden - 28 - 300));
    expect(stoesse[0].art).toBe('boden');
    expect(stoesse[0].b).toBeNull();
    expect(stoesse[0].tempo).toBeGreaterThan(erwartet * 0.95);
    expect(stoesse[0].tempo).toBeLessThan(erwartet * 1.05);
  });
});

describe('Physik des Helfers: die Figur als Verbund aus Kreisen', () => {
  it('legt den Schwerpunkt in den Ursprung und unter den Kopf', () => {
    const sp = schwerpunkt(figurKreise(1));
    expect(sp.y).toBeGreaterThan(300);
    expect(sp.y).toBeLessThan(430);
    const f = koerper({ name: 'figur', kreise: figurKreise(0.3) });
    const nach = schwerpunkt(f.kreise);
    expect(nach.x).toBeCloseTo(0, 6);
    expect(nach.y).toBeCloseTo(0, 6);
  });

  it('fällt um, bleibt liegen und dringt nicht in den Boden ein', () => {
    const { welt } = weltMitBall();
    const f = welt.dazu(koerper({ name: 'figur', x: 300, y: 200, winkel: 0.5, kreise: figurKreise(0.3), prall: 0.24, reibung: 0.72, rollen: 16 }));
    laufe(welt, 10, () => f.schlaeft);
    expect(f.schlaeft).toBe(true);
    const tiefster = Math.max(...f.kreise.map((c) => f.y + c.x * Math.sin(f.winkel) + c.y * Math.cos(f.winkel) + c.r));
    expect(tiefster).toBeLessThan(welt.boden + 1);
    expect(Math.abs(Math.sin(f.winkel))).toBeGreaterThan(0.7);
  });

  it('hängt am Griff unter dem Zeiger und nimmt beim Loslassen dessen Schwung mit', () => {
    const { welt } = weltMitBall();
    const f = welt.dazu(koerper({ name: 'figur', x: 100, y: 300, kreise: figurKreise(0.3) }));
    f.griff = { lx: 0, ly: -45, zx: 200, zy: 300 };
    laufe(welt, 4);
    const ax = f.x + 45 * Math.sin(f.winkel);
    const ay = f.y - 45 * Math.cos(f.winkel);
    expect(Math.hypot(ax - 200, ay - 300)).toBeLessThan(4);
    // der Schwerpunkt hängt unter dem Griffpunkt
    expect(f.y).toBeGreaterThan(300 + 30);
    expect(Math.abs(f.x - 200)).toBeLessThan(6);
    // Der Zeiger zieht mit 2400 px/s nach rechts und 840 px/s nach oben (weit weg von der Wand), dann loslassen.
    for (let i = 1; i <= 9; i++) {
      f.griff.zx = 200 + i * 40;
      f.griff.zy = 300 - i * 14;
      welt.schritt(1 / 60);
    }
    f.griff = null;
    expect(f.vx).toBeGreaterThan(1500);
    expect(f.vx).toBeLessThan(3600);
    expect(f.vy).toBeLessThan(-500);
  });

  it('ein starrer Körper bleibt stehen, der Ball prallt ab und der Treffer wird gemeldet', () => {
    const { welt, ball } = weltMitBall();
    const f = welt.dazu(koerper({ name: 'figur', x: 500, y: 600, kreise: figurKreise(0.3) }));
    f.starr = true;
    const vorher = { x: f.x, y: f.y };
    ball.x = 100;
    ball.y = f.y - 20;
    ball.vx = 3000;
    ball.vy = -150;
    let treffer: Stoss | null = null;
    welt.beiStoss = (s) => {
      if (s.art === 'koerper') treffer = s;
    };
    laufe(welt, 0.5, () => treffer !== null);
    expect(treffer).not.toBeNull();
    expect((treffer as unknown as Stoss).tempo).toBeGreaterThan(2000);
    expect(f.x).toBe(vorher.x);
    expect(f.y).toBe(vorher.y);
    expect(ball.vx).toBeLessThan(0);
  });

  it('Körper derselben Gruppe stoßen sich nicht, ein Schläfer wird vom Treffer geweckt', () => {
    const { welt, ball } = weltMitBall();
    const a = welt.dazu(koerper({ name: 'a', x: 300, y: 772, kreise: [{ x: 0, y: 0, r: 28 }], gruppe: 2 }));
    const b = welt.dazu(koerper({ name: 'b', x: 310, y: 772, kreise: [{ x: 0, y: 0, r: 28 }], gruppe: 2 }));
    welt.schritt(1 / 60);
    expect(Math.abs(b.x - a.x)).toBeLessThan(11);
    const schlaefer = welt.dazu(koerper({ name: 'c', x: 700, y: 772, kreise: [{ x: 0, y: 0, r: 28 }] }));
    schlaefer.schlaeft = true;
    ball.x = 500;
    ball.y = 772;
    ball.vx = 1500;
    laufe(welt, 0.5, () => !schlaefer.schlaeft);
    expect(schlaefer.schlaeft).toBe(false);
    expect(schlaefer.vx).toBeGreaterThan(0);
  });
});

describe('Physik des Helfers: Zielwurf', () => {
  it('trifft das Ziel in der gewünschten Flugzeit', () => {
    const g = 2300;
    const v = wurf(100, 700, 800, 300, 0.9, g);
    let x = 100;
    let y = 700;
    let vy = v.vy;
    const h = 1 / 2400;
    for (let t = 0; t < 0.9; t += h) {
      vy += g * h;
      x += v.vx * h;
      y += vy * h;
    }
    expect(x).toBeCloseTo(800, 0);
    expect(Math.abs(y - 300)).toBeLessThan(3);
  });
});
