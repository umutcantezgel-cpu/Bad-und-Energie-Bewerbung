/**
 * Schnittstelle für das Einreichen von Unterlagen (E-BEW-012, R5-UPLOAD-01) in der Komponentenschicht.
 *
 * Die Oberfläche (UnterlagenAuswahl) kennt nur diesen Vertrag. Die echte Anbindung baut die Session
 * „Supabase-Vollintegration“ (ROADMAP §8.1) in `lib/uploads/**` und der Upload-API; diese Schicht schreibt dort
 * nichts (E-012). Ablauf in Phase 2:
 *
 * 1. `sitzungAnlegen`: Sitzung zur Bewerbung anlegen, belegt durch Bewerbungsnummer `BE-26-…` und Prüfschlüssel
 *    (HMAC, 14 Tage) aus der Antwort von `/api/bewerbung`, wie bei `/api/bewerbung/ergaenzung`.
 * 2. `hochladen`: je Datei eine signierte URL holen und die Datei direkt in den privaten Bucket
 *    `application-files` übertragen (umgeht das 4,5-MB-Limit der Funktionen); Fortschritt 0…1 melden.
 * 3. `abschliessen`: den Abschluss melden. Der Server prüft Magic Bytes und SHA-256 und legt die Dateien mit
 *    Status `pending` an; erst das Cockpit entscheidet über „verified“ oder „rejected“.
 *
 * Bis dahin gibt es keine Anbindung: Die Seite zeigt den ehrlichen Hinweis (Unterlagen.tsx), und Tests
 * benutzen eine Attrappe dieses Vertrags.
 */

/** Beleg der abgeschickten Bewerbung (Antwort von `/api/bewerbung`). */
export interface UploadNachweis {
  /** Bewerbungsnummer, z. B. „BE-26-0042“. */
  bewerbungsnummer: string;
  /** Prüfschlüssel (HMAC) zur Bewerbungsnummer. */
  pruefschluessel: string;
}

/** Eine zu übertragende Datei mit dem vorab geprüften MIME-Typ (regeln.ts). */
export interface UploadDatei {
  datei: Blob;
  name: string;
  mime: string;
  groesse: number;
}

export interface UploadSitzung {
  /** Überträgt eine Datei; `fortschritt` meldet den Anteil 0…1. Liefert die Kennung der Datei beim Server. */
  hochladen(datei: UploadDatei, fortschritt: (anteil: number) => void, signal: AbortSignal): Promise<{ id: string }>;
  /** Entfernt eine übertragene Datei wieder (vor dem Abschluss). */
  entfernen(id: string): Promise<void>;
  /** Meldet den Abschluss der Einreichung (Dateien gehen zur Prüfung ins Cockpit). */
  abschliessen(ids: readonly string[]): Promise<void>;
}

export interface UploadAdapter {
  /** Legt die Sitzung zur Bewerbung an. Ohne Nachweis entscheidet die Anbindung, ob eine Sitzung erlaubt ist. */
  sitzungAnlegen(nachweis: UploadNachweis | null): Promise<UploadSitzung>;
}
