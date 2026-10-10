# Prüfpunkt (gemeinsamer Lauf; FREIGABE E-021; beschleunigt nach E-023)
- Phase: Fertigstellung (FERTIG.md): alle Seiten im Design des Einstiegs, dann Gesamtprüfung, PR, Merge.
- Erledigt: R1, R2 (7f0c8fe), R3 gebaut (Sicherung 1ff75a3), R3-PERF-01 abgenommen (E-023).
- Laufend (Workflows, nur Bau ohne Prüferrunde): WF-S SEITENKOPF-01 · WF-A R3-FIX-A, R3-FIX-B · WF-B R4-UI-01, R4-UI-02, R5-KLEIN · WF-C R4-SHELL-01, R4-SHELL-02. Fortschritt in `_relaunch/pakete/fortschritt/<Kennung>.log`.
- Nach SEITENKOPF-01: WF-D R5-JOBS-01, R5-JOBS-02, R5-APPLY-01, R5-RUHE · WF-E R5-BEW-01, R5-THANKS-01, R5-MAPPE-01.
- Danach (Orchestrator): Leitungstrenner in `app/page.tsx`, Upload-Einbindung, lucide-Rest + `package.json`, Gesamtprüfung (lint, type-check, test, Guards, Build, test:graph, Playwright mit axe), Bilder in den Chat, Commits je Paket, PR, Supabase lesend, CI grün, Merge, Live-GET.
- Bei Container-Neustart: Stand auf der Platte prüfen, Sicherungs-Commit, abgebrochene Pakete mit „Fortsetzung“-Prompt neu starten (Skript im Sitzungsordner).
- Server: :3450 gemeinsamer Entwicklungsserver (`next dev`, Log scratchpad/logs/dev-3450.log).
