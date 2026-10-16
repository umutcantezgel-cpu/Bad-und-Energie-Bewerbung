STATUS · Branch main · Phase E1 · Kriterien 0/10 · Ausnahmen 0 · Bestand grün · Nächster Schritt: E1-PRUEFER-01 Planabgleich, danach E0-PRUEFER-02 Ausgangswerte am Produktions-Build von a4491d5

# Status · Agenturnennung Coday Web

## Einrichtung (für eine neue Umgebung)
- Abhängigkeiten: `bun install` im Projekt (bun 1.4.2). Browser: Chromium unter /opt/pw-browsers (PLAYWRIGHT_BROWSERS_PATH), nie `playwright install`.
- Produktions-Build: `bun run build` (output standalone). Start: `node .next/standalone/server.js` mit `PORT=<frei>` (nicht 3400, den nutzt die e2e-Suite), dazu `.next/static` und `public` wie in den e2e-Einstellungen.
- Werkzeuge: `_werkstatt/nennung/werkzeuge/*.mjs` (links, bilder, zugang, netz, jsonld, gemeinsam), ohne eigene Abhängigkeiten; Playwright und axe kommen aus dem `node_modules` des Projekts. Aufrufe aus der Projektwurzel, siehe `werkzeuge/README.md`; jedes Werkzeug zeigt mit `--hilfe` seine Nutzung. Ausgaben nach `protokolle/roh/…` (nicht committet).

## Pakete
| Kennung | Rolle | Modell | Schreibrechte | Kriterium | Stand |
|---|---|---|---|---|---|
| E0-KUNDSCHAFTER-01 | Kundschafter | Arbeitsmodell | keine (Bericht als Rückgabe, abgelegt in berichte/) | Grundlage E1 | fertig |
| E0-KUNDSCHAFTER-02 | Kundschafter | Arbeitsmodell | keine (Bericht als Rückgabe, abgelegt in berichte/) | Grundlage E1, Z-05 | fertig |
| E0-PRUEFER-01 | Prüfer | Arbeitsmodell | `_werkstatt/nennung/werkzeuge/*` (Bericht abgelegt durch den Orchestrator) | Werkzeuge für Z-01 bis Z-09 | fertig |
| E0-PRUEFER-02 | Prüfer | Arbeitsmodell | `berichte/E0-PRUEFER-02.md`, `protokolle/e0-*`, `bilder/` | Ausgangswerte Z-01, Z-07, Z-08, Z-09 | offen |
| E1-PRUEFER-01 | Prüfer | Arbeitsmodell | keine (Bericht als Rückgabe) | Planabgleich: Einstellungen, Kriterien mit Prüfschritt, Grenzen | fertig, nachgebessert |
| E2-PRUEFER-01 | Prüfer | Arbeitsmodell | `protokolle/stufe-a.md`, `protokolle/roh/e2/*` | Prüfstufe A | offen |
| E3-PRUEFER-01 | Prüfer | Arbeitsmodell | `protokolle/*.md` außer stufe-a.md, `protokolle/roh/e3/*`, `bilder/` | Prüfstufe B: Z-01 bis Z-09 | offen |
| E3-DOKUMENTAR-01 | Dokumentar | Arbeitsmodell | `BERICHT.md`, `LINKREGISTER.md`, `REFERENZ.md` | Z-10 | offen |
| E4-ENDPRUEFER-01 | Endprüfer | frischer Unteragent des Orchestrator-Modells | keine (Urteil als Rückgabe) | Z-01 bis Z-10 gegen Belege | offen |

## Verlauf
- 16.10.2026 · E0 · Auftrag gespeichert (N-01), Kundschafter-Berichte abgelegt, LAGE.md geschrieben. Bau der Nennung parallel vorbereitet, Änderungs-Commit erst nach den Ausgangswerten.
- 16.10.2026 · E0 · E0-PRUEFER-01: sechs Werkzeuge, node --check und ESLint sauber; Lauf gegen den Server folgt mit E0-PRUEFER-02.
- 16.10.2026 · E1 · Entscheidungen N-01 bis N-08, ABNAHME.md mit Z-01 bis Z-10, MENSCHEN.md mit Zustimmungstext und G6-Liste.
- 16.10.2026 · E1 · Planabgleich E1-PRUEFER-01 (9 Befunde) nachgebessert: N-05 als Denkprotokoll, N-09 Basis a4491d5, N-10 Druck, schale-bundle.test.ts unverändert. Die Entscheidung gilt.
