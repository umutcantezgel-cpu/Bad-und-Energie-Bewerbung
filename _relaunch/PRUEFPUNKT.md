# Prüfpunkt
- Phase: P1 (Abschluss Z-01) überlappend mit P2 (Stilkacheln)
- Nächster exakter Schritt:
  1. Workflow `p1-z01-reparatur` (Lauf wf_3bb58d87-90c) auswerten: Nachträge in den Atlanten, Zuordnung zu Pässen, Nachprüfung zweier frischer Kundschafter (bis 0 Muss/Soll-Lücken, max. 3 Runden) → VERLUSTLISTE.md neu konsolidieren (Skript `_relaunch/.roh/verlustliste.mjs` bzw. Neuschreiben), Z-01 in ABNAHME.md abhaken, P1-Phasentor eintragen.
  2. Workflow `p2-stilkacheln` (Lauf wf_50216755-d44) auswerten: Kacheln A/B/C, Jury-Urteile, Überarbeitung → Denkprotokoll zur Wahl/Verschmelzung (ENTSCHEIDUNGEN E-017), KERN v1 (K-001…K-015), PLAN.md (Mengengerüst, Pakete, Wellen, kritischer Pfad, Kapazität) mit L0-Gegenprüfer.
  3. Halt „WARTET AUF FREIGABE“ mit Übersicht ≤ 40 Zeilen, Kacheln per SendUserFile.
- Offene Pakete: P1-KUND-08/09, P1-REST-04 (Workflow p1-z01-reparatur); P2-RICHT-A/B/C mit Jury (Workflow p2-stilkacheln)
- Server: :3500 Ausgangsstand (`next start`, CI-Umgebung), :3600 Altstand; Kacheln auf 3701–3703 (vom Workflow gestartet)
- Letzter grüner Commit (Plattform): a83269d (Ausgangsstand, Ebene 1 grün); Plattform-Änderungen seither nur Ausschlüsse für _relaunch (P0-ORCH-01)
