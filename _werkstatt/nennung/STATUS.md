STATUS · Branch main · Phase E0 · Kriterien 0/10 · Ausnahmen 0 · Bestand grün · Nächster Schritt: E0-PRUEFER-01 Einrichtung und E0-PRUEFER-02 Ausgangswerte am Produktions-Build von a4491d5

# Status · Agenturnennung Coday Web

## Einrichtung (für eine neue Umgebung)
- Abhängigkeiten: `bun install` im Projekt (bun 1.4.2). Browser: Chromium unter /opt/pw-browsers (PLAYWRIGHT_BROWSERS_PATH), nie `playwright install`.
- Produktions-Build: `bun run build` (output standalone). Start: `node .next/standalone/server.js` mit `PORT=<frei>` (nicht 3400, den nutzt die e2e-Suite), dazu `.next/static` und `public` wie in den e2e-Einstellungen.
- Werkzeuge: `_werkstatt/nennung/werkzeuge/*.mjs`; sie nutzen Playwright aus dem `node_modules` des Projekts. Schritte trägt E0-PRUEFER-01 hier nach.

## Pakete
| Kennung | Rolle | Modell | Schreibrechte | Kriterium | Stand |
|---|---|---|---|---|---|
| E0-KUNDSCHAFTER-01 | Kundschafter | Arbeitsmodell | keine (Bericht als Rückgabe, abgelegt in berichte/) | Grundlage E1 | fertig |
| E0-KUNDSCHAFTER-02 | Kundschafter | Arbeitsmodell | keine (Bericht als Rückgabe, abgelegt in berichte/) | Grundlage E1, Z-05 | fertig |
| E0-PRUEFER-01 | Prüfer | Arbeitsmodell | `_werkstatt/nennung/werkzeuge/*`, `berichte/E0-PRUEFER-01.md`, Abschnitt Einrichtung in `STATUS.md` | Werkzeuge für Z-01 bis Z-09 | offen |
| E0-PRUEFER-02 | Prüfer | Arbeitsmodell | `berichte/E0-PRUEFER-02.md`, `protokolle/e0-*`, `bilder/` | Ausgangswerte Z-01, Z-07, Z-08, Z-09 | offen |

## Verlauf
- 16.10.2026 · E0 · Auftrag gespeichert (N-01), Kundschafter-Berichte abgelegt, LAGE.md geschrieben. Bau der Nennung parallel vorbereitet, Änderungs-Commit erst nach den Ausgangswerten.
