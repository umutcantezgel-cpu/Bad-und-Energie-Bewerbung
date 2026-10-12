import { describe, expect, it } from 'vitest';
import { graphicLabels, labelFrame, planLabels, ringLabels, type GraphicLabel } from '@/components/maps/graphic';
import type { RadiusView } from '@/components/maps/types';
import { boxesOverlap } from '@/lib/maps/labels';
import { placeNeighbors } from '@/lib/places/derive';
import { getHubKreise, getKreisPlaces, getPublishedPlaces } from '@/lib/places/registry';
import { GEBIET_LABEL_PRIORITY, GEBIET_MAP_DATA, gebietView, ortPlanOrte, placeView, planName } from '../karte';
import { hausName } from '../Plaene';

/**
 * Pläne der Seiten unter /einsatzgebiet (Review Phase 2, Punkt 6): Jeder hervorgehobene Ort trägt seinen Namen,
 * nötigenfalls mit Hinweislinie; die Ringwerte liegen auf keinem Punkt; die Gebietsseite nennt die größeren Orte zuerst.
 */
const published = getPublishedPlaces();
type Leader = NonNullable<GraphicLabel['leader']>;

/** Die Namen eines Plans, wie OrtPlan sie zeichnet (planLabels mit dem Namen am Haus). */
function labelsFor(view: RadiusView, emphasized: readonly string[], selectedId: string | null, unnamed: readonly string[] = []) {
  const full = labelFrame(GEBIET_MAP_DATA, view);
  const { labels, hiddenLandscape } = planLabels(GEBIET_MAP_DATA, view, {
    selectedId,
    emphasizeIds: emphasized,
    unnamedIds: unnamed,
    centerLabel: hausName(emphasized, unnamed),
  });
  return { full, labels, hiddenLandscape };
}

describe('Pläne: jeder hervorgehobene Ort hat einen Namen', () => {
  it.each(published.map((place) => [place.id, place] as const))('Ortsseite %s: Ort und vier Nachbarn (Stadt: und Stadtteile) benannt und im Ausschnitt', (_id, place) => {
    const { nachbarn, stadtteile, ids, ohneNamen } = ortPlanOrte(place, published);
    const { full, labels } = labelsFor(placeView(place, [...nachbarn, ...stadtteile]), ids, place.id, ohneNamen);
    for (const id of ids) {
      const drawn = full.places.find((p) => p.id === id);
      expect(drawn, `${id} liegt außerhalb des Ausschnitts`).toBeDefined();
      if (!drawn!.atCenter && !ohneNamen.includes(id)) expect(labels.map((l) => l.id), `${id} ohne Namen`).toContain(id);
    }
    // Keine zwei Namen übereinander
    for (let i = 0; i < labels.length; i += 1) {
      for (let j = i + 1; j < labels.length; j += 1) expect(boxesOverlap(labels[i].box, labels[j].box), `${labels[i].id}/${labels[j].id}`).toBe(false);
    }
  });

  it.each(getHubKreise().map((kreis) => [kreis.id] as const))('Kreis-Hub %s: alle Orte benannt (Stadtteile am Haus ausgenommen)', (kreisId) => {
    const places = getKreisPlaces(kreisId);
    const unnamed = places.filter((p) => p.kind !== 'gemeinde').map((p) => p.id);
    const { labels } = labelsFor(gebietView(35), places.map((p) => p.id), null, unnamed);
    for (const place of places.filter((p) => !unnamed.includes(p.id))) expect(labels.map((l) => l.id), place.id).toContain(place.id);
  });

  it('Hinweislinien kreuzen einander nicht und laufen durch keinen anderen Namen (Ortsseiten und Kreis-Hubs)', () => {
    const plaene = [
      ...published.map((place) => {
        const { nachbarn, stadtteile, ids, ohneNamen } = ortPlanOrte(place, published);
        return { name: place.id, ...labelsFor(placeView(place, [...nachbarn, ...stadtteile]), ids, place.id, ohneNamen) };
      }),
      ...getHubKreise().map((kreis) => {
        const places = getKreisPlaces(kreis.id);
        const unnamed = places.filter((p) => p.kind !== 'gemeinde').map((p) => p.id);
        return { name: kreis.id, ...labelsFor(gebietView(35), places.map((p) => p.id), null, unnamed) };
      }),
    ];
    const kreuzen = (a: Leader, b: Leader) => {
      const cross = (p: [number, number], q: [number, number], r: [number, number]) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
      const [a1, a2, b1, b2]: [number, number][] = [[a.x1, a.y1], [a.x2, a.y2], [b.x1, b.y1], [b.x2, b.y2]];
      return cross(b1, b2, a1) * cross(b1, b2, a2) < 0 && cross(a1, a2, b1) * cross(a1, a2, b2) < 0;
    };
    for (const { name, labels } of plaene) {
      const mitLinie = labels.filter((l) => l.leader);
      for (const label of mitLinie) {
        const leader = label.leader!;
        for (const other of mitLinie) if (other !== label) expect(kreuzen(leader, other.leader!), `${name}: ${label.id} × ${other.id}`).toBe(false);
        // Stichproben entlang der Linie: kein anderer Name darunter
        for (let t = 0.1; t < 0.95; t += 0.1) {
          const x = leader.x1 + (leader.x2 - leader.x1) * t;
          const y = leader.y1 + (leader.y2 - leader.y1) * t;
          for (const other of labels) {
            if (other.id === label.id) continue;
            const innen = x > other.box.x0 && x < other.box.x1 && y > other.box.y0 && y < other.box.y1;
            expect(innen, `${name}: Linie von ${label.id} durch ${other.id}`).toBe(false);
          }
        }
      }
    }
  });

  it('keine Hinweislinie läuft durch einen fremden Punkt (Abstand Radius + 1,5), auf allen Plänen', () => {
    // Kritik 2: Herborns Linie lief durch Breitscheids Punkt, Hüttenberg über Butzbach, Münzenberg über Rockenberg
    const plaene = [
      ...published.map((place) => {
        const { nachbarn, stadtteile, ids, ohneNamen } = ortPlanOrte(place, published);
        return { name: place.id, view: placeView(place, [...nachbarn, ...stadtteile]), emphasized: ids, selectedId: place.id as string | null, unnamed: ohneNamen };
      }),
      ...getHubKreise().map((kreis) => {
        const places = getKreisPlaces(kreis.id);
        return {
          name: kreis.id,
          view: gebietView(35),
          emphasized: places.map((p) => p.id),
          selectedId: null,
          unnamed: places.filter((p) => p.kind !== 'gemeinde').map((p) => p.id),
        };
      }),
    ];
    const abstand = (a: { x: number; y: number }, b: { x: number; y: number }, p: { x: number; y: number }) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const t = Math.min(1, Math.max(0, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
      return Math.hypot(a.x + dx * t - p.x, a.y + dy * t - p.y);
    };
    const pruefe = (name: string, view: RadiusView, labels: readonly GraphicLabel[], radius: (id: string) => number) => {
      for (const label of labels.filter((l) => l.leader)) {
        const { x1, y1, x2, y2 } = label.leader!;
        GEBIET_MAP_DATA.places.forEach((place, i) => {
          const point = view.points[i];
          if (place.id === label.id || !point?.inFrame || place.atCenter) return;
          expect(abstand({ x: x1, y: y1 }, { x: x2, y: y2 }, point.drawn), `${name}: Linie von ${label.id} über ${place.id}`).toBeGreaterThanOrEqual(radius(place.id) + 1.5);
        });
      }
    };
    for (const { name, view, emphasized, selectedId, unnamed } of plaene) {
      const { labels } = labelsFor(view, emphasized, selectedId, unnamed);
      // Punkte wie RadiusGraphic: gewählt mit Ring (10), hervorgehoben 4,5, gedämpft 3
      pruefe(name, view, labels, (id) => (id === selectedId ? 10 : emphasized.includes(id) ? 4.5 : 3));
    }
    // Gebietsseite (Erkunder ohne Hervorhebung, mit Vorrang): alle drei Ansichten, ohne Wahl und mit jedem Ort gewählt
    for (const km of GEBIET_MAP_DATA.radii) {
      const view = gebietView(km);
      for (const selectedId of [null, ...GEBIET_MAP_DATA.places.map((p) => p.id)]) {
        const { labels } = planLabels(GEBIET_MAP_DATA, view, { selectedId, labelPriority: GEBIET_LABEL_PRIORITY });
        pruefe(`gebiet ${km} km, gewählt ${selectedId}`, view, labels, (id) => (id === selectedId ? 10 : 4.5));
      }
    }
  });

  it('Hinweislinien beginnen am Punkt und enden am Namen', () => {
    const lahnau = published.find((p) => p.id === 'lahnau')!;
    const nachbarn = placeNeighbors(lahnau, published, 4).map((n) => n.place);
    const { full, labels } = labelsFor(placeView(lahnau, nachbarn), [lahnau.id, ...nachbarn.map((p) => p.id)], lahnau.id);
    for (const label of labels.filter((l) => l.leader)) {
      const dot = full.places.find((p) => p.id === label.id)!;
      expect(Math.hypot(label.leader!.x1 - dot.x, label.leader!.y1 - dot.y)).toBeCloseTo(6, 0);
      const { x2, y2 } = label.leader!;
      expect(x2 >= label.box.x0 - 0.1 && x2 <= label.box.x1 + 0.1 && y2 >= label.box.y0 - 0.1 && y2 <= label.box.y1 + 0.1).toBe(true);
    }
  });

  it('lange Namen stehen im Plan kurz, Liste und Text nennen den amtlichen Namen', () => {
    expect(planName('Waldbrunn (Westerwald)')).toBe('Waldbrunn');
    expect(planName('Heuchelheim an der Lahn')).toBe('Heuchelheim');
    expect(planName('Herborn')).toBe('Herborn');
    expect(GEBIET_MAP_DATA.places.find((p) => p.id === 'waldbrunn-westerwald')).toMatchObject({ name: 'Waldbrunn (Westerwald)', shortName: 'Waldbrunn' });
  });
});

describe('Pläne: Ringwerte und Vorrang', () => {
  it('kein Ringwert liegt auf einem Punkt („15, km“)', () => {
    for (const view of GEBIET_MAP_DATA.views) {
      const dots = view.points.filter((p) => p.inFrame).map((p) => ({ x0: p.drawn.x - 5, y0: p.drawn.y - 5, x1: p.drawn.x + 5, y1: p.drawn.y + 5 }));
      for (const label of ringLabels(view)) {
        for (const dot of dots) expect(boxesOverlap(label.box, dot), `${view.radiusKm}: ${label.text}`).toBe(false);
      }
    }
  });

  it('Gebietsseite: Gießen, Herborn, Weilburg und Butzbach tragen ihren Namen', () => {
    const view = gebietView(35);
    const frame = { ...labelFrame(GEBIET_MAP_DATA, view), priority: GEBIET_LABEL_PRIORITY };
    const ids = graphicLabels(frame, null).map((l) => l.id);
    for (const id of GEBIET_LABEL_PRIORITY) expect(ids).toContain(id);
  });
});

describe('Plan der Stadtseite', () => {
  it('Wetzlar: Nachbarn sind die Orte ringsum, nicht die eigenen Stadtteile; die Stadtteile stehen alle im Plan', () => {
    const wetzlar = published.find((p) => p.id === 'wetzlar')!;
    const { nachbarn, stadtteile, ids } = ortPlanOrte(wetzlar, published);
    expect(nachbarn.some((p) => p.parentId === 'wetzlar')).toBe(false);
    expect(nachbarn.map((p) => p.id)).toEqual(expect.arrayContaining(['lahnau', 'asslar']));
    expect(stadtteile).toHaveLength(published.filter((p) => p.parentId === 'wetzlar').length);
    for (const s of stadtteile) expect(ids).toContain(s.id);
  });
});

describe('Pläne: Name am Haus', () => {
  it('„Firmensitz“, wenn Wetzlar selbst mit Namen auf dem Plan steht; sonst der Name der Mitte', () => {
    const wetzlar = published.find((p) => p.id === 'wetzlar')!;
    const nachbarn = (id: string) => {
      const place = published.find((p) => p.id === id)!;
      return [place.id, ...placeNeighbors(place, published, 4).map((n) => n.place.id)];
    };
    expect(hausName(nachbarn('wetzlar'))).toBe('Firmensitz');
    expect(hausName(nachbarn('steindorf'))).toBe(nachbarn('steindorf').includes(wetzlar.id) ? 'Firmensitz' : undefined);
    expect(hausName(nachbarn('herborn'))).toBeUndefined();
    // Kreis-Hub Lahn-Dill-Kreis: Wetzlar bleibt ohne Namen, das Haus heißt Wetzlar
    const ldk = getKreisPlaces('lahn-dill-kreis');
    expect(hausName(ldk.map((p) => p.id), ldk.filter((p) => p.kind !== 'gemeinde').map((p) => p.id))).toBeUndefined();
  });
});
