# Entscheidungen

Format: E-[Nr] · Datum · Gegenstand · Entscheidung · Grund · Umkehr (bei Denkprotokollen zusätzlich Wege, Bewertung, Folgen zweiter Ordnung).

## E-001 · 09.10.2026 · Push, Deploy und Finalisierung (Auftraggeber)
- Entscheidung: Pushes nach jeder bestandenen Welle auf `claude/kind-ride-n9duod`; Vercel-Vorschauen sind erlaubt. Nach ABSCHLUSS wird über einen PR nach `main` gemergt – damit ist das Ergebnis live.
- Grund: Antwort des Auftraggebers auf Rückfrage 2 („Push mit deploy sowie das finalisieren auf main …“). Der Cloud-Container ist flüchtig; ohne Push ginge die Arbeit verloren.
- Wirkung auf den Auftrag: überschreibt „PUSH UND VERÖFFENTLICHUNG: nie“, G2 „Kein Push“ und G3 für genau diese Wege. Weiterhin verboten: Force-Push, Rebase, Push auf fremde Branches, Änderungen an Remotes, DNS, CDN, Hosting-Einstellungen.
- Gate vor dem Produktions-Merge (P7): CI grün; lesende Prüfung, ob eine Supabase-GitHub-Integration Migrationen automatisch anwenden würde; Bestätigung der Vercel-Variablen aus PR #1 „Vor dem Merge“ Punkt 2. Fehlt etwas, eine Rückfrage statt Merge.
- Umkehr: Revert-Commit auf `main` bzw. Vercel „Instant Rollback“ (Mensch).

## E-002 · 09.10.2026 · Basis des Laufs (Auftraggeber)
- Entscheidung: Ausgangsstand = `claude/optimistic-turing-etjnl3` (264bf4e: PR #1 ohne letzten Docs-Commit + Supabase-Schema Phase 2a, nicht angewandt) plus Merge von 5f7f090 (letzter PR-#1-Commit, nur Doku). Ergebnis-Commit a83269d. `claude/kind-ride-n9duod` per Fast-Forward nachgezogen.
- Grund: Antwort auf Rückfrage 1. 5f7f090 enthält nur Dokumentation zur erledigten Schlüsselrotation und macht die Basis vollständig.
- Umkehr: Branch auf f2e7eae zurücksetzen wäre ein Force-Push → ausgeschlossen; stattdessen Revert der Merges.

## E-003 · 09.10.2026 · _relaunch wird versioniert (Auftraggeber)
- Entscheidung: `_relaunch/` wird mitcommittet (Abweichung von Abschnitt 9). Bilder werden SEO- und leistungsoptimiert (WebP, Bildschirmhöhen-Ausschnitte ≤ 1440 px Breite, sprechende Namen, Alt-Texte, feste Maße in der Galerie). Lokal bleiben nur Rohdaten: `_relaunch/sicherung/`, `_relaunch/altstand/`, `_relaunch/.roh/` (Roh-PNGs, Lighthouse-JSON, Logs), `_relaunch/werkzeuge/node_modules/` – über `.git/info/exclude`.
- „Nie ausgeliefert“ bleibt erfüllt: `@source not "../_relaunch"` (Tailwind), ESLint-ignores, tsconfig-exclude, Vitest-exclude, `.vercelignore`. Next.js liefert ohnehin nur `public/` statisch aus.
- Grund: Antwort auf Rückfrage 3; flüchtiger Container.

## E-004 · 09.10.2026 · Branch-Name
- Entscheidung: Arbeit auf `claude/kind-ride-n9duod` statt `relaunch/rueckfuehrung-veredelung`.
- Grund: Vorgabe der Ausführungsumgebung (nur dieser Branch darf gepusht werden).

## E-005 · 09.10.2026 · Hauptseiten (unveränderlich ab hier)
- Entscheidung: Hauptseiten = `/` (Startseite), `/jobs` (Navigation „Stellen“), `/jobs/anlagenmechaniker-shk-wetzlar` (Vertreter der Stellenseiten-Vorlage, Ein-Klick-Ziel aus Start und /jobs), `/bewerbung` (Hauptaktion „Jetzt bewerben“ im Kopf).
- Grund: Die Hauptnavigation (`components/site/nav.ts`) enthält „Stellen“ (/jobs) und die Anker /#vorteile, /#ablauf, /#faq auf der Startseite; die Kopf-Hauptaktion führt nach /bewerbung. Deckungsgleich mit `lighthouserc.json`.

## E-006 · 09.10.2026 · Altstand-Aufnahme ohne Live-Abgriff
- Entscheidung: Bildschirmfotos und Verhalten des Altstands werden von einem lokalen Build von f2e7eae (`_relaunch/altstand/main`) genommen, nicht von der Live-Domain. Weil dessen `middleware.ts` „HeadlessChrome“ mit 403 abweist, setzt der Altstand-Läufer einen normalen Chrome-User-Agent – nur für den Altstand, nie für die Plattform (G7).
- Grund: Live-Seite schonen (G1: ≤ 1 Anfrage/s), deterministische Bildpaare, Formulare gegen Attrappen.

## E-007 · 09.10.2026 · P1-Kundschafter laufen überlappend mit der P0-Messbasis
- Entscheidung: Die Kundschafterpakete P1-KUND-01…04 (reines Code- und Seitenlesen) starten, während die P0-Messungen noch laufen. Das P0-Phasentor (Plattform läuft, Sicherung belegt, Messbasis vollständig) wird trotzdem vor jeder P1-Entscheidung (Element-Pässe, Prioritäten) geprüft.
- Grund: L2 „Kein Platz bleibt leer“; die Atlas-Erfassung hängt nicht von Messwerten ab.

## E-008 · 09.10.2026 · RELAUNCH-Block in CLAUDE.local.md statt CLAUDE.md; Sicherungs-Commits
- Entscheidung: Der Orchestrator-Block steht in `CLAUDE.local.md` (wird von Claude Code wie CLAUDE.md geladen, per `.git/info/exclude` nie versioniert). `CLAUDE.md` ist in der Basis versioniert (`@AGENTS.md`) und bleibt unverändert.
- Grund: Die Umgebung verlangt am Ende jeder Antwort einen sauberen Arbeitsbaum (Stop-Hook „commit and push“); ein dauerhaft geänderter, nie zu committender CLAUDE.md wäre damit unvereinbar. Der Zweck – Wiedereinstieg nach Kontextverdichtung – bleibt erfüllt.
- Sicherungs-Commits: Laufen Unteragenten noch, wenn eine Antwort endet, werden ihre Zwischenstände als „Sicherung (nicht freigegeben)“ mit Paketkennung committet und gepusht. Freigegeben ist ein Paket erst mit seinem Paket-Commit nach Wellenprüfung (G2). Grund: flüchtiger Container (E-001, E-003).
