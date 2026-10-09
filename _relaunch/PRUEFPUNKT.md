# Prüfpunkt (gemeinsamer Lauf: Lauf 1 + Ausbau, E-018; nach FREIGABE E-021 ohne weiteren Halt bis zum Merge)
- Phase: R3 Welle Startseite (Plan: `_relaunch/PLAN.md` 1.0; Pakete `_relaunch/pakete/R3-HOME.md`, `R3-PERF-01.md`, gemeinsame Regeln `_welle-r3.md`)
- Erledigt: R1 Basis (E-021, KERN 1.1, PLAN 1.0), R3-ORCH (Anker-Aliase, Platzhalter WeekSection), R2-FUND-01 (7f0c8fe, abgenommen E-022)
- Laufend: Workflows R3 (HOME-01…05, PERF-01; je Bau → frischer Opus-Prüfer → eine Reparaturrunde). Fortschritt je Paket in `_relaunch/pakete/fortschritt/<Kennung>.log`.
- Nächster exakter Schritt nach den Workflows: Wellenprüfung (Ebene 1, Build, test:graph, E2E mit axe für `/`), Leitungstrenner zwischen die Abschnitte in `app/page.tsx` setzen, ein Commit je Paket, Push, Bildschirmfotos 6 Ansichten in den Chat; dann R4 nach `_welle-r45.md`.
- Server: :3450 gemeinsamer Entwicklungsserver (Repo, `next dev`, Log im Scratchpad `logs/dev-3450.log`); :3500 Ausgangsstand aus Kopie `scratchpad/ausgangsstand` (bei Bedarf starten); :3600 Altstand.
- Modelle: nur Opus und Haiku (E-020). Merge nach main automatisch nach R6-Gate (E-021).
- Letzter grüner Commit (Plattform): 7f0c8fe (Ebene 1 grün, 1078 Tests).
