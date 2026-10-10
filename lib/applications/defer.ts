import 'server-only';
import { after } from 'next/server';

/**
 * Arbeit nach der Antwort an den Browser erledigen (auf Vercel per waitUntil, siehe `after` in
 * next/server), z. B. die Eingangsbestätigung. Außerhalb einer Anfrage (Tests, Skripte) wirft
 * `after`; dann läuft die Aufgabe sofort im Hintergrund.
 */
export function runAfterResponse(task: () => Promise<unknown>): void {
  try {
    after(task);
  } catch {
    void task().catch(() => {});
  }
}
