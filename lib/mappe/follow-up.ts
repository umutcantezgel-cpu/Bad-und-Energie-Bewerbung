import type { Mappe } from '@/lib/applications/schema';
import { describeFailure, type FailureAction, type FailureOverrides } from '@/lib/apply/failure';
import { submitFollowUp, type SubmitFailure, type SubmitOptions } from '@/lib/apply/submit';

/**
 * Nachreichen der Mappe an eine abgeschickte Bewerbung (Vertrag C8). Nutzt denselben Weg wie
 * die Ergänzungen auf der Danke-Seite (lib/apply/submit.ts: Offline-Erkennung, 25 s Timeout,
 * Erfolg nur bei 200 + ok:true) und dieselben Fehlertexte (lib/apply/failure.ts).
 */

export type MappeFollowUpResult =
  | { ok: true }
  | { ok: false; message: string; action: FailureAction; failure: SubmitFailure };

/** Texte, die zur Mappe besser passen als die allgemeinen Meldungen des Servers. */
const MAPPE_OVERRIDES: FailureOverrides = {
  VALIDATION_FAILED: 'Die Mappe enthält Angaben, die wir nicht annehmen konnten. Bitte prüf deine Einträge.',
  PAYLOAD_TOO_LARGE: 'Die Mappe ist zu groß. Bitte kürze das Anschreiben oder die Aufgaben.',
};

export async function sendMappeFollowUp(
  input: { reference: string; token: string; mappe: Mappe },
  options: SubmitOptions = {},
): Promise<MappeFollowUpResult> {
  const result = await submitFollowUp({ reference: input.reference, token: input.token, mappe: input.mappe }, options);
  if (result.ok) return { ok: true };
  const { detail, action } = describeFailure(result, MAPPE_OVERRIDES);
  return { ok: false, message: detail, action, failure: result };
}
