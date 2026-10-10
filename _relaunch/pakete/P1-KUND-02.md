# P1-KUND-02 · Rolle Kundschafter · Stufe 1 · Kern-Version 0
Schreibrechte: `_relaunch/atlas/alt-bewerbung.md`
Umfang: Altatlas der Altstand-Seite `/bewerbung` mit allen Tabs (Hub, Quiz, Tresor/Vault, Formular, A4-Dossier) und der Checkliste.

## Rollenbriefing
Du erfasst Seiten, Komponenten, Texte, Medien, Bewegungen und Metadaten vollständig mit Fundstelle. Häufige Fehler: nur die Navigation lesen und Seiten übersehen; zusammenfassen statt auflisten; Vermutung als Befund.

## Aufgabe in einem Satz
Erfasse jedes Element der Altstand-Bewerbungsseite samt Tabs und Zuständen im Atlas-Format mit Fundstelle.

## Das Projekt in fünf Sätzen / Kern-Auszug / Quellen / Atlas-Format / Grenzen / Ausgabeformular
Siehe `_relaunch/pakete/_gemeinsam-p0.md` und `_relaunch/pakete/_gemeinsam-p1.md` – gelten wortgleich.

## Schritte
1. Lies vollständig: `_relaunch/altstand/main/app/bewerbung/page.tsx`, `app/bewerbung/layout.tsx`, `components/BewerberCheckliste.tsx`, `components/views/QuizView.tsx`, `VaultView.tsx`, `FormView.tsx`, `PrintA4View.tsx`, `lib/recruiting-types.ts`, `app/api/bewerbung/route.ts`, `lib/email/resend.ts` (nur Ablauf), `lib/email/templates/*` (nur Betreff und Kernsätze).
2. Lege `ALT-BEW-*`-Zeilen an für: Unterkopf (Tabs, Glow, BDSG-Pille, mobile Tab-Leiste), Hub (Badge, H1, „Weg A/Weg B“-Box, Knöpfe, vier Gateway-Karten einzeln, Regionalleiste), Checkliste (jede Kategorie, Gauge, Schrittkarten, Texte), Quiz (jede Frage mit allen Antworten, Fortschritt, Ergebnis, Anschreiben-Vorlage), Tresor (Upload-Bereiche, Statusanzeigen, Foto, Absenden – und was tatsächlich gesendet wird), Formular (jedes Feld mit Label, Validierungsmeldungen, Speichern-Verhalten), A4-Dossier (Briefkopf, Abschnitte, Druck, WhatsApp-Teilen, Absenden, Erfolgszustand, Konfetti), URL-Parameter `?tab=` / `?direct=`, localStorage-Schlüssel, Metadaten und JSON-LD aus `layout.tsx`.
3. Kennzeichne in Spalte „Verhalten / Funktion“ ausdrücklich, wo der Altstand Erfolg vortäuscht, Platzhalterdaten vorbelegt (z. B. „Alexander Koch“) oder Dateien nicht wirklich hochlädt – mit Fundstelle. Das ist Befund, keine Wertung.
4. Bewegung (motion layoutId, AnimatePresence, Fortschrittsbalken, Konfetti) und SVG (Gauge, Icons mit lucide-Namen) je Element erfassen.
5. Prüfe im Browser (Port 3600, d1440 + m375, User-Agent aus Quellen) jeden Tab über `?tab=quiz|vault|form|dossier` und ordne Bildschirmfotos zu (Spalte Bild).
6. Am Ende: Zählung je Kategorie, Liste aller Anker-IDs und URL-Parameter.

## Selbstprüfung
- Jede Quiz-Frage und jede Antwortoption wörtlich? Jedes Formularfeld? Jede Checklisten-Kategorie?
- Markiere Unsicheres als OFFENE FRAGE statt zu raten, und erfülle nur deinen Auftrag.
=== ENDE P1-KUND-02 · BEREIT ZUR RÜCKGABE === (diese Zeile setzt du an das Ende deiner Antwort)
