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

## E-009 · 09.10.2026 · Verhältnis Auftrag ↔ ROADMAP §4 (Apple-Stil, Bewegungsverbote)
- Befund: `docs/ROADMAP.md` (vom Auftraggeber am 08.10. freigegeben) legt ein „ruhiges, typografisches Apple-Design“ fest: Inter, Bewegung nur als Feedback, verboten u. a. pulse/ping/marquee/shimmer/tilt/spotlight/count-up/Konfetti/Parallax/Scroll-Reveal.
- Entscheidung: Die verbindlichen Inhaberentscheidungen aus ROADMAP §1 (keine KI, keine Fotos/Stock, typografische Ästhetik, nur belegte Fakten, Gehälter sichtbar, Karte+Pendelrechner, Mappe, Bewertungsband) gelten als WÜNSCHE (Rang 5). Die Gestaltungsregeln aus §4 gelten als bisheriger KERN (Rang 6) und werden durch den jüngeren Auftrag vom 09.10. (Nordstern, Abschnitt 7) abgelöst, soweit dieser ausdrücklich mehr verlangt: eigenständige Schrift statt Inter, Bewegung mit Zweck und 2–3 Signaturmomenten, SVG-Formsystem. Was §4 und der Slop-Katalog gemeinsam verbieten (Konfetti, Count-up, Laufband, Glas, Glow, Blobs, Shimmer, Tilt, Spotlight, Parallax ohne Grund), bleibt verboten. Scroll-Auftritte nur nach Bewegungsregister und unter der S-02-Grenze.
- Barrierefreiheitsregeln aus §4 (Fokus, 44-px-Ziele, Kontraste, konsistente Hilfe) bleiben vollständig.
- Geschmacksabnahme: am Freigabepunkt (MENSCHEN.md M-005).
- Umkehr: KERN auf §4 zurückstellen; Guard-Änderungen per Revert.

## E-010 · 09.10.2026 · Zählregeln für weichen Slop (gelten für Ausgangs- und Endwert gleich)
- S-08 zählt je Seite, wenn eine Framework-Standardschrift (Inter) die einzige Schrift ist – auch wenn Radien/Schatten projekteigene Tokens sind (die Aufzählung im Katalog beschreibt Erscheinungsformen, jede genügt).
- S-09 zählt den Weichzeichner der Kopfleiste (`backdrop-blur`) als Glaseffekt ohne Leitidee-Begründung – je Seite.
- S-11 zählt nur Karten mit Icon + Überschrift + Kurztext (Wortlaut); gleichförmige Karten ohne Icon werden als Hinweis geführt, nicht gezählt.
- S-12 zählt auf Erzählseiten: Startseite und Stellenseiten. Rechtsseiten, Flow, Mappe, Danke sind Arbeitsseiten.
- S-13 zählt nicht in echten Kundenzitaten (werden nie umgeschrieben); Textbausteine der Mappe zählen.
- S-14 zählt das per CSS-Filter umgefärbte Logo im Dunkelmodus (uneinheitliche Bildbearbeitung) je Hauptseite.
- S-10 nur, wenn alle drei Merkmale (zentriert, Unterzeile + zwei Knöpfe, abstrakter Hintergrund) erfüllt sind.
- Mitgeführt wird zusätzlich die Zahl eindeutiger Fundstellen (Komponenten).
- Ausgangswert nach diesen Regeln: S-08 12 · S-09 12 · S-11 1 · S-12 5 · S-13 1 · S-14 4 = **35** (eindeutige Fundstellen: Layout-Schrift, HeaderBar, BenefitGrid, JobSections, Home-Abschnittsfolge, Mappe-Textbaustein, Logo = 7). Ziel Z-07: ≤ 7 gesamt (−80 %), ≤ 2 je Hauptseite.

## E-011 · 09.10.2026 · Prüfregeln aus P0-SLOP-01
- S-01: „Alexander Koch“ ist laut ROADMAP §1 ein echter Mitarbeiter mit freigegebenem Zitat → kein Platzhalter. Im Altstand war sein Name als vorbelegte Bewerberdaten missbraucht – das bleibt „nicht zurückführen“.
- S-05 Ausnahmen: OG-Bilder (`ImageResponse`, Bildinhalte), `lib/tokens/index.ts` (Spiegel von theme.css), `0.01ms` in der Reduced-Motion-Regel (Technik, kommt ins Bewegungsregister), `env(safe-area-inset-bottom)` (Gerätewert). Keine Ausnahme: A4-Vorschau der Mappe (bekommt in P4 eine eigene Druck-Tokenskala in pt), Eingabefelder 17 px (bekommt ein Token).
- SVGO: statische Konfiguration schützt IDs, auf die `aria-labelledby` zeigt (`staticConfig({}, {svg})` ist Standard); animierte Konfiguration ohne `inlineStyles`.
- Werkzeug: `scrollThrough` scrollt mit `behavior: 'instant'` (vorher nur ~70 % Abdeckung bei `scroll-behavior: smooth`).

## E-012 · 09.10.2026 · Dateihoheit gegenüber der Phase-2-Session (ROADMAP §8.1)
- Entscheidung: Der Lauf schreibt nie in `supabase/**`, `lib/supabase/**`, `lib/uploads/**`, `app/admin/**`, `app/api/admin/**`, Upload-API, `db.yml`; die gemeinsamen Verträge `lib/applications/{sink,schema,types,constants}.ts`, `lib/jobs/schema.ts`, `lib/security/rate-limit.ts`, `lib/env.ts`, `proxy.ts` nur, wenn eine Rückführung es zwingend braucht – dann nur ergänzend, mit Test und Eintrag in MENSCHEN.md („Absprache nötig“).
- Folge für E-BEW-012 (Dokumenten-Tresor, Muss): Rückführung als Oberfläche im eigenen Bereich (`components/apply/**`) gegen eine schmale, im eigenen Bereich definierte Adapter-Schnittstelle, geprüft mit Attrappe. In Produktion bleibt der Upload ehrlich abgeschaltet (Hinweis „Unterlagen kannst du nach dem Kennenlernen mitbringen oder per E-Mail schicken“ – nur mit belegtem Kanal), bis die Phase-2-Session `lib/uploads` und die Upload-API liefert. Nie ein Schein-Upload, nie „verifiziert“.
- Grund: Abstimmung des Inhabers vom 08.10. (ROADMAP §8.1); Rang 1 (Grenzen) und Rang 2 (nichts geht kaputt).

## E-013 · 09.10.2026 · Denkprotokoll: Architektur des Bewegungssystems
- **Ziel:** Bewegung mit Zweck (Orientierung, Rückmeldung, Zusammenhang, Hierarchie, Charakter), 2–3 Signaturmomente auf Erzählseiten, zentral gesteuert (reduzierte Bewegung, hover/pointer), messbar (data-motion ↔ Register), ≤ 60 KB gzip zusätzliches JS, LCP nicht verschlechtern (Ausgangs-LCP mobil 2,63–3,08 s liegt bereits über Budget), CSP-tauglich.
- **Wege:**
  1. *Bibliothek „motion“ (Framer Motion) zurückholen* – bequem, Federn, Layout-Animationen; ~30–40 KB gzip zusätzlich, React-gebunden, war in der Basis bewusst entfernt (ROADMAP §4), verleitet zum Effektteppich.
  2. *GSAP + ScrollTrigger* – stärkste Zeitachsen, ~45–60 KB gzip, Lizenz inzwischen frei, aber imperative Parallelwelt neben React, Budget fast ausgeschöpft.
  3. *CSS-first + kleines eigenes Modul* – transitions, `@starting-style`, `transition-behavior: allow-discrete`, CSS scroll-driven animations hinter `@supports (animation-timeline: view())`, View Transitions API als progressive Verbesserung, SVG-Linienzeichnen über `pathLength="1"`/`stroke-dashoffset`; dazu ein zentrales Modul (`lib/motion/`) mit `prefers-reduced-motion`-, `(hover:hover)`/`(pointer:fine)`-Abfrage, IntersectionObserver-Auslöser, WAAPI für die wenigen skriptgesteuerten Signaturabläufe und einem Inline-Kopfskript für Startzustände (Klasse + 2-s-Sicherheitsnetz).
  4. *Nur CSS ohne Modul* – minimal, aber keine zentrale Steuerung, keine Messbarkeit für Skriptabläufe, Startzustände nicht sauber zu kapseln.
- **Bewertung:** Weg 3 erfüllt Nordstern (Bewegung mit Bedeutung, präzise), Z-09 (Register, nur transform/opacity, reduziert), Z-12 (geschätzt < 6 KB gzip), passt zur Basis (CSS-first, `starting:` bereits genutzt, Guard). Risiko: scroll-driven animations fehlen in Safari < 26/Firefox → `@supports`-Weiche mit IntersectionObserver-Ersatz oder statischem Endzustand. Aufwand mittel.
- **Entscheidung:** Weg 3. Bibliotheken bleiben ausgeschlossen, solange kein Signaturmoment sie zwingend braucht (dann neues Denkprotokoll mit Größe/Lizenz/Pflegezustand, G6).
- **Umkehrprobe:** Modul ist ein Ordner (`lib/motion/`) plus Klassen/Tokens in `theme.css`/`globals.css`; Rückbau per Revert, Endzustände sind ohne Modul identisch (Inhalte ohne JS sichtbar).
- **Folgen zweiter Ordnung:** Design-Guard muss `animate-*`-Verbote behalten und um eine Registerprüfung (data-motion ↔ KERN K-009) ergänzt werden; Playwright läuft weiter mit `reducedMotion: 'reduce'` (deterministisch), Bewegungsmessung (Ebene 4) bekommt eigene Läufe mit `no-preference`; CSP: Inline-Kopfskript braucht Nonce oder Hash (CSP ist derzeit Report-Only → Hash in `next.config.ts` ergänzen).
