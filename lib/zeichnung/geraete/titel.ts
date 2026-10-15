import type { AnsichtId } from './ansicht';
import type { Aussengeraet } from './typen';

/** Zugänglicher Name einer Gerätezeichnung aus den belegten Maßen (ohne Bosch-Gestaltung, ohne Schätzwerte). */
export function geraetTitel(g: Aussengeraet, ansicht: AnsichtId): string {
  // Geschütztes Leerzeichen vor der Einheit (K-012)
  const mm = (wert: number) => `${wert.toLocaleString('de-DE')}\u00A0mm`;
  return ansicht === 'vorne'
    ? `${g.name} einer Luft/Wasser-Wärmepumpe von vorn: ${mm(g.breite.mm)} breit, ${mm(g.hoehe.mm)} hoch, runde Ausblasöffnung mit Schutzgitter und Rotor, vier Bodenhalterungen.`
    : `${g.name} einer Luft/Wasser-Wärmepumpe von der Seite: ${mm(g.tiefe.mm)} tief, je Seite zwei Bodenhalterungen mit ${mm(g.konsolen.lochabstandTiefe.mm)} zwischen den Bohrungen, Anschlüsse für das Heizwasser hinten auf ${mm(g.hydraulik.hoehe.mm)} Höhe.`;
}
