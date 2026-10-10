import { describe, expect, it } from 'vitest';
import { mapsStatusText, type MapsStatusInput } from '../status';

/**
 * Statuszeile unter dem Karten-Button (role="status"). Live stand dort „Google Maps ist geladen.“, obwohl Google
 * wegen BillingNotEnabledMapError nur eine abgedunkelte Karte mit Fehlerdialog zeigte. „Geladen“ heißt jetzt:
 * Kacheln da und kein Fehlerdialog; jeder Fehler sagt ehrlich, dass die Übersicht bleibt.
 */
describe('mapsStatusText', () => {
  const base: MapsStatusInput = { mapsAvailable: true, consent: true, hiddenByUser: false, mapStatus: 'loading' };

  it('follows the Google layer after consent: loading, ready, failed', () => {
    expect(mapsStatusText(base)).toBe('Google Maps wird geladen …');
    expect(mapsStatusText({ ...base, mapStatus: 'ready' })).toBe('Google Maps ist geladen.');
    expect(mapsStatusText({ ...base, mapStatus: 'failed' })).toBe(
      'Die interaktive Karte ist gerade nicht verfügbar. Die Übersicht zeigt das Einsatzgebiet.',
    );
  });

  it('never claims a loaded map after a failure', () => {
    expect(mapsStatusText({ ...base, mapStatus: 'failed' })).not.toContain('geladen');
  });

  it('says the map is hidden only after „Karte wieder ausblenden“, else nothing', () => {
    expect(mapsStatusText({ ...base, consent: false, hiddenByUser: true })).toBe('Google Maps ist ausgeblendet.');
    expect(mapsStatusText({ ...base, consent: false })).toBe('');
    expect(mapsStatusText({ ...base, mapsAvailable: false, mapStatus: 'ready' })).toBe('');
  });
});
