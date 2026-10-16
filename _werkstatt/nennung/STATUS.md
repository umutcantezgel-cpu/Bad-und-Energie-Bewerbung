STATUS · Branch main · Phase E4 · Kriterien 10/10 · Ausnahmen 0 · Bestand grün · Nächster Schritt: Endprüfung E4-ENDPRUEFER-01

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
| E0-PRUEFER-02 | Prüfer | Arbeitsmodell | `berichte/E0-PRUEFER-02.md`, `protokolle/roh/e0/*`, `bilder/e0/*`, `werkzeuge/konsole.mjs` | Ausgangswerte Z-01, Z-07, Z-08, Z-09 | fertig; Bilder nach zwei Abbrüchen vom Orchestrator übernommen |
| E1-PRUEFER-01 | Prüfer | Arbeitsmodell | keine (Bericht als Rückgabe) | Planabgleich: Einstellungen, Kriterien mit Prüfschritt, Grenzen | fertig, nachgebessert |
| E2-PRUEFER-01 | Prüfer | Arbeitsmodell | `protokolle/stufe-a.md`, `protokolle/roh/e2/*`, `bilder/e2/*` | Prüfstufe A | fertig, grün |
| E3-PRUEFER-01 | Prüfer | Arbeitsmodell | `protokolle/{links,googlebot,indexierbar,html-vergleich,dateiliste,jsonld}.md`, `protokolle/roh/e3/*` | Prüfstufe B: Z-02, Z-03, Z-05, Z-06, Z-09 | fertig, grün |
| E3-PRUEFER-02 | Prüfer | Arbeitsmodell | `werkzeuge/navigation.mjs`, `protokolle/{zugang,konsole,navigation,leitplanken}.md`, `protokolle/roh/e3b/*`, `bilder/e3/*` | Prüfstufe B: Z-04, Z-07, Konsole | fertig, grün; S1 nachgebessert (N-12) |
| E3-PRUEFER-03 | Prüfer | Arbeitsmodell | `protokolle/leistung.md`, `protokolle/roh/e3c/*` | Prüfstufe B: Z-08 | fertig, grün |
| E3-PRUEFER-04 | Prüfer | Arbeitsmodell | `protokolle/nachpruefung.md`, `protokolle/stufe-b-ci.md`, `protokolle/roh/e3d/*` | Nachprüfung S1, Zugang, Links nach N-12; volle CI für Z-01 | fertig, grün |
| E3-PRUEFER-05 | Prüfer | Arbeitsmodell | `protokolle/leistung-endstand.md`, `protokolle/roh/e3e/*` | Z-08 am Endstand 66d8d99 | läuft |
| E3-DOKUMENTAR-01 | Dokumentar | Arbeitsmodell | `BERICHT.md`, `LINKREGISTER.md`, `REFERENZ.md` | Z-10 | fertig |
| E4-ENDPRUEFER-01 | Endprüfer | frischer Unteragent des Orchestrator-Modells | keine (Urteil als Rückgabe) | Z-01 bis Z-10 gegen Belege | offen |

## Verlauf
- 16.10.2026 · E0 · Auftrag gespeichert (N-01), Kundschafter-Berichte abgelegt, LAGE.md geschrieben. Bau der Nennung parallel vorbereitet, Änderungs-Commit erst nach den Ausgangswerten.
- 16.10.2026 · E0 · E0-PRUEFER-01: sechs Werkzeuge, node --check und ESLint sauber; Lauf gegen den Server folgt mit E0-PRUEFER-02.
- 16.10.2026 · E1 · Entscheidungen N-01 bis N-08, ABNAHME.md mit Z-01 bis Z-10, MENSCHEN.md mit Zustimmungstext und G6-Liste.
- 16.10.2026 · E1 · Planabgleich E1-PRUEFER-01 (9 Befunde) nachgebessert: N-05 als Denkprotokoll, N-09 Basis a4491d5, N-10 Druck, schale-bundle.test.ts unverändert. Die Entscheidung gilt.
- 16.10.2026 · E0 · Ausgangswerte (E0-PRUEFER-02, Build a4491d5): 84 Seiten, 0 Links auf codayweb.de; Footer axe 0 Befunde in 12 Kombinationen; Startseite 38 Anfragen, 541,1 KB komprimiert (Median aus 3), Layoutverschiebung 0,0000 in 3 Läufen; 0 Konsolenfehler; Linkziel 200 ohne Weiterleitung, Canonical auf sich selbst; Startseite indexierbar.
- 16.10.2026 · E0 · bilder.mjs scheiterte zweimal an der WebP-Höchsthöhe von 16.383 px (Vollbild Startseite 390 px: 17.774 px); vom Orchestrator behoben (zusätzliche Verkleinerung), 24 Bilder aufgenommen (L1, L6).
- 16.10.2026 · E2 · Änderungs-Commit b0ae185 (9 Dateien, ohne _werkstatt). Prüfstufe A grün: Typprüfung, Linter der geänderten Dateien, 19 Testdateien mit 347 Tests, Build mit allen Nachprüfungen, Linkprüfer: „/“ rel noopener, „/jobs“ rel nofollow noopener, Googlebot gleich; Footer-Bilder ohne Überdeckung.
- 16.10.2026 · E3 · Sichtabnahme an den Vorher-nachher-Bildern bestanden (bilder/auswahl): wirkt wie ein Teil des Fußes, nicht auffälliger als die Rechtslinks, hell und dunkel lesbar, mobil einzeilig. Bilder an den Inhaber geschickt (Arbeitsregel, Bilder vor dem Deploy).
- 16.10.2026 · E3 · Prüfstufe B (E3-PRUEFER-01 bis -03) am Build b0ae185:
  - Links: 82 Seiten mit Fuß, je genau ein Link, gefolgt nur auf „/“; 84 von 84 Seiten gleich mit Googlebot-Kennung.
  - Startseite indexierbar.
  - HTML-Vergleich: nur das span der Nennung. JSON-LD: nur creator.
  - Dateiliste innerhalb von G1; G5, G6, G7 unberührt.
  - Darstellung: 12 von 12 Footer-Bildern sauber. Kontrast 8,28:1 hell, 7,57:1 dunkel. Trefferfläche 71 × 26 px, axe 0 Befunde, Fokus sichtbar, 0 Konsolenfehler.
  - S4: 11 von 11 Fällen gleich.
  - Leistung: 38 Anfragen, Transfer −684 B, Layoutverschiebung 0.
  - Befund S1: der verborgene Hinweis stand im Link → N-12.
- 16.10.2026 · E3 · Volle CI am Endstand 66d8d99 ALLES GRUEN (190 Testdateien, 3.883 Tests, e2e 590/506/0). Nachprüfung nach N-12 (E3-PRUEFER-04) grün: Linktext und zugänglicher Name exakt „Coday Web“, 82 von 82 Füßen mit genau einem Link, gefolgt nur „/“, axe 0, Konsole 0, Navigation 11/11, HTML nur die Nennung. ABNAHME.md: 10 von 10 mit Beleg.
