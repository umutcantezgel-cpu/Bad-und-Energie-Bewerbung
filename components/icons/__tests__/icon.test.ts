import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FAMILIE, GLYPH_SHAPES, ICON_NAMES, LUCIDE_ERSATZ, type IconName } from '../glyphs';
import { Icon, iconPx, KLEIN_LESBAR, type IconSize } from '../Icon';

const ROOT = path.resolve(__dirname, '../../..');
// Breiter Typ: die Prüfung läuft auch an der Typprüfung vorbei (sm an dichten Glyphen).
const render = (props: { name: IconName; size?: IconSize; title?: string; className?: string }) =>
  renderToStaticMarkup(createElement(Icon, props));

type Pt = readonly [number, number];

/**
 * Absolute Punkte eines SVG-Pfads (M L H V C S Q T A Z, absolut und relativ); Kurven und Bögen
 * abgetastet, damit Ausbuchtungen zwischen den Endpunkten mitzählen.
 */
function pathPoints(d: string): Pt[] {
  const tokens = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) ?? [];
  const pts: Pt[] = [];
  let i = 0;
  let cmd = '';
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  let ctrl: Pt | null = null;
  const num = () => Number(tokens[i++]);
  const bezier = (p: Pt[], n = 32) => {
    for (let k = 1; k <= n; k++) {
      const t = k / n;
      let q = p.slice();
      while (q.length > 1) q = q.slice(1).map((b, j) => [q[j][0] + (b[0] - q[j][0]) * t, q[j][1] + (b[1] - q[j][1]) * t] as const);
      pts.push(q[0]);
    }
  };
  while (i < tokens.length) {
    if (/^[a-zA-Z]$/.test(tokens[i])) cmd = tokens[i++];
    const rel = cmd === cmd.toLowerCase();
    const ox = rel ? x : 0;
    const oy = rel ? y : 0;
    const C = cmd.toUpperCase();
    const prevCurve = ctrl;
    ctrl = null;
    if (C === 'M' || C === 'L') {
      x = ox + num();
      y = oy + num();
      if (C === 'M') {
        sx = x;
        sy = y;
        cmd = rel ? 'l' : 'L';
      }
      pts.push([x, y]);
    } else if (C === 'H') {
      x = ox + num();
      pts.push([x, y]);
    } else if (C === 'V') {
      y = oy + num();
      pts.push([x, y]);
    } else if (C === 'C' || C === 'S') {
      const c1: Pt = C === 'C' ? [ox + num(), oy + num()] : prevCurve ? [2 * x - prevCurve[0], 2 * y - prevCurve[1]] : [x, y];
      const c2: Pt = [ox + num(), oy + num()];
      const e: Pt = [ox + num(), oy + num()];
      bezier([[x, y], c1, c2, e]);
      ctrl = c2;
      [x, y] = e;
    } else if (C === 'Q' || C === 'T') {
      const c1: Pt = C === 'Q' ? [ox + num(), oy + num()] : prevCurve ? [2 * x - prevCurve[0], 2 * y - prevCurve[1]] : [x, y];
      const e: Pt = [ox + num(), oy + num()];
      bezier([[x, y], c1, e]);
      ctrl = c1;
      [x, y] = e;
    } else if (C === 'A') {
      let rx = Math.abs(num());
      let ry = Math.abs(num());
      const phi = (num() * Math.PI) / 180;
      const large = num() !== 0;
      const sweep = num() !== 0;
      const x2 = ox + num();
      const y2 = oy + num();
      const cos = Math.cos(phi);
      const sin = Math.sin(phi);
      const dx = (x - x2) / 2;
      const dy = (y - y2) / 2;
      const x1p = cos * dx + sin * dy;
      const y1p = -sin * dx + cos * dy;
      const lam = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
      if (lam > 1) {
        rx *= Math.sqrt(lam);
        ry *= Math.sqrt(lam);
      }
      const nume = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
      const deno = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
      const co = Math.sqrt(Math.max(0, nume / deno)) * (large === sweep ? -1 : 1);
      const cxp = (co * rx * y1p) / ry;
      const cyp = (-co * ry * x1p) / rx;
      const cx = cos * cxp - sin * cyp + (x + x2) / 2;
      const cy = sin * cxp + cos * cyp + (y + y2) / 2;
      const ang = (ux: number, uy: number, vx: number, vy: number) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
      const t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
      let dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
      if (!sweep && dt > 0) dt -= 2 * Math.PI;
      else if (sweep && dt < 0) dt += 2 * Math.PI;
      for (let k = 1; k <= 64; k++) {
        const t = t1 + (dt * k) / 64;
        pts.push([cos * rx * Math.cos(t) - sin * ry * Math.sin(t) + cx, sin * rx * Math.cos(t) + cos * ry * Math.sin(t) + cy]);
      }
      x = x2;
      y = y2;
    } else if (C === 'Z') {
      x = sx;
      y = sy;
    } else {
      throw new Error(`Pfadbefehl ${cmd} unbekannt`);
    }
  }
  return pts;
}

/** rotate(a cx cy) auf Punkte anwenden (die einzige Transformation der Glyphen). */
function transform(points: Pt[], t?: string): Pt[] {
  if (!t) return points;
  const m = t.match(/^rotate\(\s*(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s*\)$/);
  if (!m) throw new Error(`Transformation ${t} unbekannt`);
  const [a, cx, cy] = m.slice(1).map(Number);
  const r = (a * Math.PI) / 180;
  return points.map(([px, py]) => [cx + (px - cx) * Math.cos(r) - (py - cy) * Math.sin(r), cy + (px - cx) * Math.sin(r) + (py - cy) * Math.cos(r)] as const);
}

function* codeFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (entry === 'node_modules' || entry === '.next') continue;
    if (statSync(full).isDirectory()) yield* codeFiles(full);
    else if (/\.tsx?$/.test(entry)) yield full;
  }
}

describe('Icon', () => {
  it.each(ICON_NAMES)('rendert „%s“ dekorativ im 24er-Raster mit einem Strich', (name) => {
    const html = render({ name });
    expect(html).toContain('viewBox="0 0 24 24"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain('role="img"');
    expect(html).not.toContain('<title>');
    expect(html).toContain('fill="none"');
    expect(html).toContain('stroke="currentColor"');
    expect(html).toContain('stroke-linecap="round"');
    expect(html).toContain('stroke-linejoin="round"');
    expect(html).toContain('stroke-width:var(--m-strich, 3px)');
    expect(html).toContain(`data-icon="${name}"`);
    // jede Form behält ihren Strich (non-scaling-stroke), keine Füllung, keine Pixel
    const shapes = html.match(/<(?:path|circle|rect)\b[^>]*>/g) ?? [];
    expect(shapes.length).toBeGreaterThan(0);
    for (const shape of shapes) expect(shape).toContain('vector-effect="non-scaling-stroke"');
    expect(html).not.toMatch(/<image|fill="(?!none)/);
    // Budget K-013: Icon-SVG ≤ 1,5 KB roh
    expect(html.length).toBeLessThanOrEqual(1536);
  });

  it('wird mit Titel bedeutungstragend: role="img" und <title>, ohne aria-hidden', () => {
    const html = render({ name: 'phone', title: 'Anrufen' });
    expect(html).toContain('role="img"');
    expect(html).toContain('<title>Anrufen</title>');
    expect(html).not.toContain('aria-hidden');
    expect(html.indexOf('<title>')).toBeLessThan(html.indexOf('<path'));
  });

  it('lässt die runden Enden am Rand stehen (overflow visible: bei 16 px ragt die Kappe 0,17 px hinaus)', () => {
    expect(render({ name: 'user-plus', size: 'sm' })).toContain('overflow:visible');
  });

  it('erlaubt sm (16 px) nur einfachen Glyphen; dichte beginnen bei md (Kontaktbogen 16/20/24)', () => {
    for (const name of KLEIN_LESBAR) expect(ICON_NAMES).toContain(name);
    for (const name of ['menu', 'printer', 'file-text', 'calendar-off', 'banknote', 'waermepumpe', 'eye-off', 'trash', 'users', 'circle-alert'] as IconName[]) {
      expect(KLEIN_LESBAR as readonly string[], name).not.toContain(name);
      expect(iconPx(name, 'sm'), name).toBe(20);
      expect(render({ name, size: 'sm' }), name).toContain('width="20" height="20"');
    }
    expect(iconPx('arrow-right', 'sm')).toBe(16);
    expect(iconPx('menu', 'md')).toBe(20);
    expect(iconPx('menu', 18)).toBe(18);
    // Typprüfung (bun run type-check): sm an einer dichten Glyphe ist ein Fehler
    // @ts-expect-error -- „menu“ läuft bei 16 px zu
    void createElement(Icon, { name: 'menu', size: 'sm' } as const satisfies Parameters<typeof Icon<'menu'>>[0]);
    void createElement(Icon, { name: 'check', size: 'sm' } as const satisfies Parameters<typeof Icon<'check'>>[0]);
  });

  it('setzt Größen aus Stufen oder px, Klassen gehen durch', () => {
    expect(render({ name: 'check' })).toContain('width="24" height="24"');
    expect(render({ name: 'check', size: 'sm' })).toContain('width="16" height="16"');
    expect(render({ name: 'check', size: 'md' })).toContain('width="20" height="20"');
    expect(render({ name: 'check', size: 'xl' })).toContain('width="36" height="36"');
    expect(render({ name: 'check', size: 18 })).toContain('width="18" height="18"');
    expect(render({ name: 'check', className: 'size-5 text-brand' })).toContain('class="size-5 text-brand"');
  });

  it('hält alle Koordinaten im Raster 0–24 (Rand 2 für Kreise und Rechtecke)', () => {
    for (const name of ICON_NAMES) {
      for (const shape of GLYPH_SHAPES[name] as readonly Record<string, unknown>[]) {
        if ('cx' in shape) {
          const { cx, cy, r } = shape as { cx: number; cy: number; r: number };
          expect(Math.min(cx - r, cy - r), name).toBeGreaterThanOrEqual(2);
          expect(Math.max(cx + r, cy + r), name).toBeLessThanOrEqual(22);
        } else if ('width' in shape) {
          const { x, y, width, height } = shape as { x: number; y: number; width: number; height: number };
          expect(Math.min(x, y), name).toBeGreaterThanOrEqual(2);
          expect(Math.max(x + width, y + height), name).toBeLessThanOrEqual(22);
        } else {
          const numbers = String(shape.d).match(/-?\d*\.?\d+/g)!.map(Number);
          for (const n of numbers) expect(Math.abs(n), name).toBeLessThanOrEqual(24);
        }
      }
    }
  });

  it('hält auch jeden Pfad im Rand 2 (absolute Koordinaten, Kurven und Bögen abgetastet, Drehung angewandt)', () => {
    const EPS = 0.01;
    for (const name of ICON_NAMES) {
      for (const shape of GLYPH_SHAPES[name] as readonly { d?: string; transform?: string }[]) {
        if (shape.d === undefined) continue;
        const points = transform(pathPoints(shape.d), shape.transform);
        expect(points.length, name).toBeGreaterThan(1);
        const xs = points.map((p) => p[0]);
        const ys = points.map((p) => p[1]);
        const box = `${name} ${shape.d}: x ${Math.min(...xs).toFixed(2)}–${Math.max(...xs).toFixed(2)}, y ${Math.min(...ys).toFixed(2)}–${Math.max(...ys).toFixed(2)}`;
        expect(Math.min(...xs, ...ys), box).toBeGreaterThanOrEqual(2 - EPS);
        expect(Math.max(...xs, ...ys), box).toBeLessThanOrEqual(22 + EPS);
      }
    }
  });

  it('wertet Pfade richtig aus (Prüfung der Prüfung)', () => {
    // Halbkreis r 9 um (12,12) von oben nach unten im Uhrzeigersinn: rechts bis x = 21
    const arc = pathPoints('M12 3a9 9 0 0 1 0 18');
    expect(Math.max(...arc.map((p) => p[0]))).toBeCloseTo(21, 1);
    expect(Math.min(...arc.map((p) => p[0]))).toBeCloseTo(12, 1);
    expect(pathPoints('M2 2h4v4H2Z').at(-1)).toEqual([2, 6]);
    expect(transform([[12, 2]], 'rotate(90 12 12)')[0][0]).toBeCloseTo(22, 5);
    expect(() => pathPoints('M0 0R1 1')).toThrow(/unbekannt/);
  });

  it('enthält die acht Familien-Icons aus B Runde 1', () => {
    expect(FAMILIE).toEqual(['waermepumpe', 'tropfen', 'flamme', 'werkzeug', 'servicefahrzeug', 'uhr', 'standort', 'nachricht']);
    for (const name of FAMILIE) expect(ICON_NAMES).toContain(name);
  });

  it('hat für jedes heute genutzte lucide-Icon eine gleichwertige Glyphe', () => {
    const used = new Set<string>();
    for (const dir of ['components', 'app']) {
      for (const file of codeFiles(path.join(ROOT, dir))) {
        const source = readFileSync(file, 'utf8');
        for (const m of source.matchAll(/import\s*\{([^}]*)\}\s*from\s*'lucide-react'/g)) {
          for (const part of m[1].split(',')) {
            const name = part.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0];
            if (name && name !== 'LucideIcon') used.add(name);
          }
        }
      }
    }
    expect(used.size).toBeGreaterThan(0);
    for (const name of used) {
      expect(LUCIDE_ERSATZ, `lucide ${name} ohne Ersatz`).toHaveProperty(name);
      expect(ICON_NAMES).toContain(LUCIDE_ERSATZ[name as keyof typeof LUCIDE_ERSATZ] as IconName);
    }
  });
});
