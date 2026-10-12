import { describe, expect, it } from 'vitest';
import { graphicLabels, labelFrame, ringLabels } from '@/components/maps/graphic';
import type { RadiusView } from '@/components/maps/types';
import { boxesOverlap } from '@/lib/maps/labels';
import { neighborsOf } from '@/lib/places/derive';
import { getHubKreise, getKreisPlaces, getPublishedPlaces } from '@/lib/places/registry';
import { GEBIET_LABEL_PRIORITY, GEBIET_MAP_DATA, gebietView, placeView, planName } from '../karte';

/**
 * Pläne der Seiten unter /einsatzgebiet (Review Phase 2, Punkt 6): Jeder hervorgehobene Ort trägt seinen Namen,
 * nötigenfalls mit Hinweislinie; die Ringwerte liegen auf keinem Punkt; die Gebietsseite nennt die größeren Orte zuerst.
 */
const published = getPublishedPlaces();

function labelsFor(view: RadiusView, emphasized: readonly string[], selectedId: string | null, unnamed: readonly string[] = []) {
  const full = labelFrame(GEBIET_MAP_DATA, view);
  const frame = {
    ...full,
    places: full.places.filter((p) => emphasized.includes(p.id)),
    mustLabel: emphasized.filter((id) => !unnamed.includes(id)),
  };
  return { full, labels: graphicLabels(frame, selectedId) };
}

describe('Pläne: jeder hervorgehobene Ort hat einen Namen', () => {
  it.each(published.map((place) => [place.id, place] as const))('Ortsseite %s: Ort und vier Nachbarn benannt und im Ausschnitt', (_id, place) => {
    const nachbarn = neighborsOf(place, published, 4).map((n) => n.place);
    const ids = [place.id, ...nachbarn.map((p) => p.id)];
    const { full, labels } = labelsFor(placeView(place, nachbarn), ids, place.id);
    for (const id of ids) {
      const drawn = full.places.find((p) => p.id === id);
      expect(drawn, `${id} liegt außerhalb des Ausschnitts`).toBeDefined();
      if (!drawn!.atCenter) expect(labels.map((l) => l.id), `${id} ohne Namen`).toContain(id);
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

  it('Hinweislinien beginnen am Punkt und enden am Namen', () => {
    const lahnau = published.find((p) => p.id === 'lahnau')!;
    const nachbarn = neighborsOf(lahnau, published, 4).map((n) => n.place);
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
