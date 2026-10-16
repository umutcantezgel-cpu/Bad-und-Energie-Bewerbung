# E1-PRUEFER-01 · Planabgleich (eine Runde)

Rolle Prüfer · Arbeitsmodell · nur lesend · Befunde wie zurückgegeben, gekürzt; die Antwort des Orchestrators steht je Punkt dahinter („→“).

## BEFUNDE
1. S4: AgenturLink liest rel per usePathname; bei einer Navigation im Browser ändert sich rel. → N-05 als Denkprotokoll für den Sonderfall „Fuß im Root-Layout“. S4 wird als Gleichheit von DOM und ausgeliefertem HTML je URL geprüft, nach dem Laden, nach der Hydration und nach einer Navigation in beide Richtungen (ABNAHME Z-04). Keine AUSNAHME.
2. G1: schale-bundle.test.ts steht nicht auf der G1-Liste. → Änderung zurückgenommen; die Importprüfung steht in der einen Testdatei der Nennung (N-09).
3. G2: HEAD in der Arbeitskopie losgelöst, Commits ohne Branch. → N-09: main übernimmt sie per Fast-Forward; gepusht wird nur main.
4. N-02 hebt G2 und G3 auf. → N-02 ergänzt: ÄNDERN nach Abschnitt 13 durch den Auftraggeber; G2 und G3 sichern genau diese Einstellungen ab.
5. Z-06: Basis uneinheitlich. → Basis a4491d5 in LAGE, ABNAHME und N-09.
6. Prüflücken: Konsolenfehler, HTML-Vergleich, Header und robots.txt, Druck. → konsole.mjs (E0-PRUEFER-02), Roh-HTML in protokolle/roh/e0/html und diff in Stufe B, Z-05 mit curl -I, robots.txt und Sitemap; Druck entfällt, Fuß ist print-hidden (N-10).
7. Klickfläche ungemessen; N-06 nannte min-height. → N-06 nennt padding-block; gemessen in Stufe B.
8. Bericht E0-PRUEFER-02 fehlte zum Zeitpunkt des Abgleichs. → Paket lief noch.
9. Kleinkram: node_modules-Symlink nicht stagen; N-05 nannte „CodayNennung“; MENSCHEN.md „keine Daten an Dritte“ trotz Referrer beim Klick. → Symlink nie gestagt; Namen in N-05 berichtigt; Zustimmungstext sagt jetzt, dass die Agentur beim Klick erfährt, woher der Besuch kommt.

## PRÜFUNG UND ERGEBNIS
- Einstellungen: 18 gezählt; umgesetzt bis auf REFERENZ-STECKBRIEF (folgt in E3) und ARBEITSBRANCH (N-09).
- Kriterien: Z-01, Z-05, Z-07 teilweise (Lücken siehe 6), Z-02, Z-03, Z-08, Z-09 prüfbar, Z-04 S4 offen (siehe 1), Z-06 Methode berichtigt, Z-10 folgt in E3.
- Grenzen: G1 berührt (siehe 2), G2 offen (siehe 3), G3 nach N-02, G4 bis G10 eingehalten. Leitplanken: S1, S2, S5, S6, S7 ja; S3 ja mit offener Klickfläche; S4 siehe 1.
- Wortlaut „Webdesign & Entwicklung: Coday Web“ und Platz unter der OSM-Nennung in beiden Füßen: zulässig nach Abschnitt 6.

=== ENDE E1-PRUEFER-01 · BEREIT ZUR RÜCKGABE ===
