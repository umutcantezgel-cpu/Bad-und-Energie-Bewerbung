/**
 * Die vier Szenen der Seite „Büro und Verwaltung“ (E-031, Paket W3) in der Reihenfolge der Aufgaben der Bürofachkraft
 * (lib/jobs/data/buerofachkraft.ts): Telefon und Termine, Angebote und Rechnungen, Material, Verwaltung. Reines
 * Datenmodul (Komponenten und Datei-Renderer lib/zeichnung/buero/svg.ts lesen es).
 */
import { ABLAGE } from './ablage';
import { BELEG } from './beleg';
import { MATERIAL } from './material';
import { WOCHENPLAN } from './wochenplan';

export const BUERO_SZENEN = Object.freeze({ wochenplan: WOCHENPLAN, beleg: BELEG, material: MATERIAL, ablage: ABLAGE });
export type BueroSzenenArt = keyof typeof BUERO_SZENEN;
export const BUERO_SZENEN_ARTEN = Object.keys(BUERO_SZENEN) as BueroSzenenArt[];
