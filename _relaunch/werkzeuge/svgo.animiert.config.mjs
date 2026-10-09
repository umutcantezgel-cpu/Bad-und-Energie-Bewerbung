// SVGO-Konfiguration „animiert“ (AUFTRAG Abschnitt 7, SVG · Optimierung).
// Für inline eingebundene, animierte Grafiken (Linienzeichnen über pathLength/stroke-dashoffset, Masken, clipPath,
// Morphing). Wie die statische Konfiguration (viewBox und title bleiben, role bleibt), zusätzlich ohne die Plugins,
// die Struktur, Pfadanzahl oder Formart ändern und damit Animationsziele zerstören:
//   - mergePaths          (würde getrennt animierte Pfade zu einem verschmelzen)
//   - collapseGroups      (würde Gruppen auflösen, die als Animationsziel oder Drehpunkt dienen)
//   - convertShapeToPath  (würde circle/rect/line in path wandeln – Formattribute wie r/width gingen verloren)
//   und mit cleanupIds { preserve }: IDs, die CSS, Skripte oder aria-labelledby ansprechen, werden weder entfernt
//   noch umbenannt.
//
// Die Schutzliste ist per Export erweiterbar:
//   import { PRESERVE_IDS, PRESERVE_PREFIXES, animiertConfig, idsAusQuelltext } from './svgo.animiert.config.mjs';
//   PRESERVE_IDS.push('mein-pfad');                      // dauerhaft für alle Läufe im Prozess
//   animiertConfig({ ids: ['mein-pfad'] })               // nur für diese eine Konfiguration
//   animiertConfig({ svg: svgText })                     // Ids aus <style>, <script> und aria-labelledby/-describedby automatisch
//
// BEFUND SVGO 4.0.0: siehe svgo.static.config.mjs – removeViewBox/removeTitle sind in v4 nicht mehr im Preset.
import { idsAusQuelltext, staticConfig } from './svgo.static.config.mjs';

export { idsAusQuelltext };

/** Pfade/Plugins, die für animierte Grafiken abgeschaltet sind. */
export const ABGESCHALTET = Object.freeze(['mergePaths', 'collapseGroups', 'convertShapeToPath']);

/** Dauerhaft geschützte IDs (leer; das Register der Plattform trägt sie bei Bedarf ein). */
export const PRESERVE_IDS = [];
/** Dauerhaft geschützte ID-Präfixe, z. B. für je Instanz erzeugte IDs (useId-Muster). */
export const PRESERVE_PREFIXES = [];

/** Aufbau der animierten Konfiguration. `ids`/`prefixes` ergänzen die Schutzlisten, `svg` liest Ids automatisch aus dem Quelltext. */
export function animiertConfig({ ids = [], prefixes = [], svg } = {}) {
  const preserve = [...new Set([...PRESERVE_IDS, ...ids, ...(svg ? idsAusQuelltext(svg) : [])])];
  const preservePrefixes = [...new Set([...PRESERVE_PREFIXES, ...prefixes])];
  const overrides = Object.fromEntries(ABGESCHALTET.map((n) => [n, false]));
  overrides.cleanupIds = { preserve, preservePrefixes };
  return staticConfig(overrides);
}

export const meta = Object.freeze({ name: 'animiert', svgoVersion: '4.0.0', abgeschaltet: ABGESCHALTET });

export default animiertConfig();
