# Prüfstufe B · Volle CI am Commit 66d8d99

Kennung E3-PRUEFER-04 · 16.10.2026 · Auswertung des Protokolls `66d8d99.log`, Vergleich mit E0 (`a4491d5.log`)

## Ergebnis

Endzeile: „ALLES GRUEN“. Keine Stufe ist rot. Lighthouse meldet Warnungen (wie in E0), keine Fehler.

| Schritt | Ergebnis am 66d8d99 | E0 (a4491d5) | Bewertung |
| --- | --- | --- | --- |
| lint | ohne Ausgabe | ohne Ausgabe | grün |
| type-check (`tsc --noEmit`) | ohne Fehlerausgabe | ohne Fehler | grün |
| test (Vitest) | 190 Dateien, 3883 Tests bestanden, 0 rot | 189 Dateien, 3873 Tests | grün, +1 Datei, +10 Tests |
| check:design | „530 files checked“, Notiz 41 Klassen außerhalb der Skala (nicht blockierend) | 527 Dateien, gleiche Notiz | grün |
| check:contrast | 1022 Paare bestanden | 1022 Paare | grün |
| check:client-imports | 42 Client-Module, kein zod im Browser-Graph | 41 Client-Module | grün |
| build | „Compiled successfully“, 183 von 183 Seiten, CSS-Ketten, Teilbudgets, Kopfzeichnungen je als bestanden gemeldet, keine Fehlerzeile | „Compiled successfully“, 183 von 183 | grün |
| test:graph | 81 HTML-Dokumente bestanden | 81 | grün |
| test:claims | 84 HTML-Dokumente und 11 Textrouten | gleich | grün |
| test:similarity | 54 Ortsseiten, 1431 Paare, höchster Wert 0,394 | gleich | grün |
| orte:gate | 54 von 54 indexierbar | gleich | grün |
| waermefeld --pruefen | entspricht der Rechnung, eingabeHash 1efb5faa812c3ad3 | gleich | grün |
| e2e | 590 bestanden, 506 übersprungen, 0 fehlgeschlagen | 590 / 506 / 0 | grün |
| lighthouse | Warnungen bei `/` und `/einsatzgebiet`, keine Fehler | Warnung nur bei `/` | Warnung, siehe Befund 1 |

## Befunde

1. **Lighthouse, Leistung (Warnung, kein Blocker).** Ausgewertet wird der Median aus drei Läufen. Die CI nennt bei „found“ den besten Lauf (Standard „optimistic“, die Zahlen passen dazu). Die Mediane sind:
   - `/`: Läufe 0,89 / 0,90 / 0,92, Median **0,90**. In E0 lagen alle drei Läufe bei 0,93. Die CI meldet 0,92.
   - `/einsatzgebiet`: Läufe 0,91 / 0,89 / 0,90, Median **0,90**. In E0 ohne Warnung. Die CI meldet 0,91.
   - Die Stufen mit Fehler bestehen: Barrierefreiheit, Best Practices und SEO je 1,0; Verschiebung des Layouts (CLS) bis 0,02. Im Protokoll steht keine Fehlerzeile.
   - Ursache nicht geklärt (offene Frage 1).
2. **Testzahl.** Eine Testdatei ist seit E0 neu: `components/site/__tests__/agentur-nennung.test.ts` (Status A gegen a4491d5). Das sind 10 Tests mehr. Kein Test ist rot oder übersprungen.
3. **Build-Exit.** Wie in E2 steht im Protokoll keine Exit-Zeile. Grün ist aus dem Ende des Protokolls geschlossen (offene Frage 2).

## Belegpfade

- CI-Protokoll: `/tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/ci/66d8d99.log`. Marker: lint Z. 2, type-check Z. 3, test Z. 5 (Test Files Z. 21, Tests Z. 22), check:design Z. 30, check:client-imports Z. 1064, build Z. 1067, test:graph Z. 2195, e2e Z. 2229 (Summe Z. 3332–3333), lighthouse Z. 3334, Endzeile Z. 3394.
- E0 zum Vergleich: `.../scratchpad/ci/a4491d5.log` (Endzeile Z. 3383).
- Lighthouse-Einstellungen: `/home/user/Bad-und-Energie-Bewerbung/lighthouserc.json` (3 Läufe je Seite, Schwellen Leistung 0,95 und 0,9 für /bewerbung).

## Offene Fragen

1. **Lighthouse.** Der Median bei `/` fällt von 0,93 auf 0,90, und `/einsatzgebiet` erhält eine neue Warnung. Ob das Messrauschen ist oder an den Änderungen liegt, lässt sich aus einer einzelnen CI-Auswertung nicht sagen. Eine Wiederholung war nicht Teil dieses Auftrags.
2. **Build-Exit.** Das Protokoll enthält keine Exit-Zeile. Bitte Exit-Code nachreichen oder bestätigen.

Schreibrechte: Geschrieben nur in `protokolle/stufe-b-ci.md`, `protokolle/nachpruefung.md` und `protokolle/roh/e3d/`. Projektcode, Werkzeuge und der laufende Server unverändert.
