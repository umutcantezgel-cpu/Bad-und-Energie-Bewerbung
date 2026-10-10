// SVGO-Konfiguration „statisch“ (AUFTRAG Abschnitt 7, SVG · Optimierung).
// Für Icons, Trenner, Logos und große statische Grafiken, die als Datei oder Komponente ohne Animation eingebunden werden.
//
//   preset-default
//     ohne removeViewBox   (viewBox bleibt immer erhalten)
//     ohne removeTitle     (title trägt die Zugänglichkeit bedeutungstragender Grafiken)
//     removeUnknownsAndDefaults mit keepRoleAttr: true (role="img" bleibt)
//
// BEFUND SVGO 4.0.0 (geprüft gegen node_modules/svgo/plugins/preset-default.js): removeViewBox und removeTitle
// sind in v4 NICHT mehr Teil von preset-default. Es gibt also nichts abzuschalten; sie dürfen aber auch nicht
// dazukommen. `abgeschalteteOverrides()` schaltet beide nur dann ab, wenn eine künftige Version sie wieder
// ins Preset aufnimmt (sonst würde SVGO eine Warnung „not part of preset-default“ ausgeben).
//
// Aufruf in Skripten:   import config, { staticConfig } from './svgo.static.config.mjs';
//                       optimize(svgText, { path, ...config })
// Aufruf in der SVGO-CLI: svgo --config svgo.static.config.mjs datei.svg
import { builtinPlugins } from 'svgo';

/** Plugins, die in dieser Konfiguration nie aktiv sein dürfen. */
export const VERBOTEN = Object.freeze(['removeViewBox', 'removeTitle']);

const preset = builtinPlugins.find((p) => p.name === 'preset-default');

/** Namen aller Plugins, die in der installierten SVGO-Version zu preset-default gehören. */
export const PRESET_PLUGINS = Object.freeze(preset.plugins.map((p) => p.name));

/** Nur die verbotenen Plugins, die diese SVGO-Version tatsächlich im Preset hat → `false`. */
export function abgeschalteteOverrides(namen = VERBOTEN) {
  return Object.fromEntries(namen.filter((n) => PRESET_PLUGINS.includes(n)).map((n) => [n, false]));
}

/**
 * IDs, die außerhalb der Grafik angesprochen werden: `#id` in <style>, getElementById/querySelector('#id') in
 * <script>, und aria-labelledby/-describedby (Leerzeichen-getrennte Listen). Was in der Grafik selbst per
 * url(#id) oder href="#id" verwiesen wird, schützt cleanupIds bereits von selbst.
 */
export function idsAusQuelltext(svg) {
  const ids = new Set();
  for (const m of svg.matchAll(/aria-(?:labelledby|describedby|controls|owns)\s*=\s*["']([^"']+)["']/g)) m[1].split(/\s+/).filter(Boolean).forEach((i) => ids.add(i));
  for (const block of svg.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    for (const m of block[1].matchAll(/#([A-Za-z_][\w:.-]*)/g)) ids.add(m[1]);
  }
  for (const block of svg.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) {
    for (const m of block[1].matchAll(/getElementById\(\s*["']([^"']+)["']\s*\)/g)) ids.add(m[1]);
    for (const m of block[1].matchAll(/querySelector(?:All)?\(\s*["'][^"']*#([A-Za-z_][\w:.-]*)/g)) ids.add(m[1]);
  }
  return [...ids];
}

/**
 * Aufbau der statischen Konfiguration. `overrides` ergänzt oder ersetzt Einstellungen des Presets (für die animierte Variante).
 * Die Standardkonfiguration (`export default`) entspricht dem Auftrag wörtlich. Optional schützt `svg` (Quelltext) bzw. `ids`
 * die per aria-labelledby/CSS/Skript angesprochenen IDs über cleanupIds { preserve }: ohne diesen Schutz entfernt cleanupIds
 * die id eines <title>, auf das aria-labelledby zeigt (gemessen, siehe OFFENE FRAGEN im Bericht P0-SLOP-01).
 */
export function staticConfig(overrides = {}, { ids = [], svg } = {}) {
  const geschuetzt = [...new Set([...ids, ...(svg ? idsAusQuelltext(svg) : [])])];
  if (geschuetzt.length && !overrides.cleanupIds) overrides = { ...overrides, cleanupIds: { preserve: geschuetzt } };
  return {
    multipass: true,
    js2svg: { pretty: false },
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            ...abgeschalteteOverrides(),
            removeUnknownsAndDefaults: { keepRoleAttr: true },
            ...overrides,
          },
        },
      },
    ],
  };
}

export const meta = Object.freeze({
  name: 'statisch',
  svgoVersion: '4.0.0',
  removeViewBoxImPreset: PRESET_PLUGINS.includes('removeViewBox'),
  removeTitleImPreset: PRESET_PLUGINS.includes('removeTitle'),
});

export default staticConfig();
