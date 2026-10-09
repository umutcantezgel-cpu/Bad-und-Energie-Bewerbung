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

## E-014 · 09.10.2026 · Übernahme der unabhängigen Urteile und der Gegenprüfung (P1)
- Unklare Pässe (drei unabhängige Sonnet-Gegenprüfer, Mehrheit): E-START-002 Jubiläum geschwächt · Muss · Rückführen (3/3; bis 31.12.2026, als Textzeile ohne Badge/Hochzählen, `heroEyebrow(now)`); E-START-007 Upload-Einstieg verloren · Soll · Verschmelzen mit E-BEW-012 (3/3; vor Phase 2 kein Upload-Link auf `/`); E-START-011 Innungs-/Kammersiegel geschwächt · Muss · Verschmelzen (3/3; `FACTS.founded1926.long`); E-START-024 Vorteils-Konfigurator geschwächt · Soll · Neu interpretieren (2/3, ein Urteil „Keine Rückführung nötig“ → Nebelkarte N-15); E-START-030 Zentrale-Werkstatt-Karte geschwächt · Soll · Verschmelzen (3/3 Entscheidung); E-START-032 Einsatzgebietskarte geschwächt · Muss · Neu interpretieren (2/3, ein Urteil Verschmelzen).
- Gegenprüfung P1-GEGEN-01 (105 Pässe geprüft, 13 Korrekturen) vollständig übernommen, u. a.: E-RECHT-005 Verbraucherstreitbeilegung nicht mehr zurückgestellt (Pflichtangabe → Wortlaut bleibt, Rechtsprüfung als MENSCHEN-Eintrag); E-SHELL-012 Mobilmenü schließt bei Zurück/Pfadwechsel (Muss, Verschmelzen); E-SEO-021 alte Anker Muss (Leitpass E-START-052); E-START-021/010/031/008/049, E-SHELL-018, E-RECHT-018 auf Muss angehoben; E-START-016/033 und E-SHELL-019 auf Soll.
- Ergebnis: 163 Pässe · 59 zu bauen · 9 zurückgestellt (5,5 %) · Belege `atlas/gegenpruefung-p1.md`, `VERLUSTLISTE.md`.

## E-015 · 09.10.2026 · Bilder immer im Chat zeigen (Wunsch des Auftraggebers)
- Wortlaut: „zeig mir die bilder immer im chat wenn du welche machst“.
- Regel: Jeder Bildlauf des Orchestrators oder eines Unteragenten (Bildschirmfotos, Stilkacheln, Bildpaare alt/neu, Bewegungs-Bildfolgen, Galerie) endet mit einer Auswahl der aussagekräftigsten Ausschnitte per SendUserFile in den Chat (Ansicht „render“, kurze Bildunterschrift: was, welcher Stand, welche Ansicht). Volle Sätze bleiben in `_relaunch/belege/`. Unteragenten können nicht in den Chat senden; das übernimmt der Orchestrator beim Auswerten.
- Folge: Die Freigabe-Übersicht und jedes Wellenende enthalten Bilder. Die Nummer für die Richtungswahl verschiebt sich auf E-016.

## E-016 · 09.10.2026 · Farben vom Auftraggeber bestätigt (WUNSCH, Rang 5)
- Wortlaut: „Diese Design Farben sind die richtigen“, zusammen mit den Bildschirmfotos der Kacheln A „Werkplan“ und B „Haus & Kreislauf“ im hellen Thema (Desktop 1440 und Mobil 375, Stand Runde 1).
- Festlegung (bindet Kacheln, KERN K-006 und alle Pakete):
  - **Signalrot #D60000** für die eine Hauptaktion je Ansicht und den Vorlauf; Druck/Hover #A80000–#B00000.
  - **Marken-Navy #0C1A72–#111D6D** (Logo und bad-energie.de) für Überschriften, Kennzahlen, Rücklauf und Leitungen.
  - Schrift in tiefem Navy (#111A3B oder #111D6D).
  - Helles Papier als Fläche, kühl #F3F5F9 (A) oder warm #FBF7F0 (B); dazu Bs warme Illustrationsflächen #F1E9DB/#FADCC9.
  - Ein helleres Rücklauf- und Fokusblau ist erlaubt (#1F57C4).
  - Nicht mehr als Hauptfarben: die bisherigen Plattform-Tokens Navy #0A1E3A und Crimson #C51E1E (ROADMAP §4). Grün nur für Erfolg, keine Verläufe.
- Auslegung (ergänzt nach Runde 2): „Rot nur für die eine Primäraktion“ (ROADMAP §4) gilt für Flächen, Knöpfe und Hervorhebungen. Rot als dünne Vorlauf-Leitung und Blau als Rücklauf in Grafiken sind durch die bestätigten Bilder ausdrücklich erlaubt. Kachel B hat sie in der Überarbeitung auf einen Prüferbefund hin entfernt; die gewählte Richtung stellt sie wieder her.
- Offen bis zur Freigabe: kühles oder warmes Papier, entschieden mit der Richtung. Das dunkle Thema wird aus derselben Familie abgeleitet und am Freigabepunkt gezeigt.
- Folgen:
  - `pakete/_richtung.md` trägt die Palette als harte Vorgabe. Das betrifft Kachel C und die Überarbeitungsrunde.
  - In P3-ORCH-01 werden `theme.css` (Primitive und Rollen) und `check-contrast.mjs` umgestellt. Weiß auf #D60000 hat 5,4:1 (≥ 4,5); #0C1A72 auf #F3F5F9 hat ≈ 14:1.
  - ROADMAP §4 „Farbe“ wird mit KERN K-006 abgeglichen.
- Umkehr: Werte in `theme.css` zurücksetzen. Die Rollen-Tokens bleiben gleich, sodass Komponenten unberührt bleiben.
- Die Richtungswahl erhält die nächste freie Nummer (E-017 ist der Z-01-Abschluss).

## E-017 · 09.10.2026 · Z-01 abgeschlossen: Nachprüfung in drei Runden und Delta-Gegenprüfung (P1-KUND-08/09, P1-REST-04/05, P1-GEGEN-02/03)
- **Nachprüfung:**
  - Ablauf: drei Runden aus Nachtragen, Zuordnen und zwei frischen Kundschaftern.
  - Nachgetragen wurden 75 Atlaszeilen, darunter JSON-LD-Beschreibungen, die vier JobPostings mit Benefits (23 Einträge), die drei GeoCircles, die Abweichungen der FAQPage, `llms.txt`/`llms-full.txt`, die zehn Standortbeschreibungen und die vier Lade-Platzhalter.
  - Ergebnis: Runde 1 fand 46 Lücken, Runde 2 fand 20, Runde 3 fand **0 Muss/Soll** (nur Kann-Technikdetails). Beide Prüfer der Runde 3 urteilen unabhängig: Die Kann-Reste sind kein eigenes Element.
- **Delta-Gegenprüfung:** zwei Linsen, „Regeln“ und „Wahrheit/Machbarkeit“, über 22 geänderte oder neue Pässe. Beide bestätigen die Z-01-Bedingung. Übernommen werden alle 30 Korrekturen (`atlas/gegenpruefung-p1-delta.json`), darunter:
  - E-START-038 Kann → **Soll**. Davon werden sieben Ortsbeschreibungen wörtlich gezeigt; drei Geschäftsaussagen erst nach Bestätigung (M-003).
  - E-SEO-010 → **Verschmelzen**: Der belegte Fakt `noWeekendOnCall` kommt in die Benefits der Stelle Anlagenmechaniker.
  - E-BEW-029 wird Leitpass für den Brotkrumen von /bewerbung.
  - Die E-014-Korrekturen werden in Übersichten und Verteilungen nachgezogen.
  - Präzisere Abnahmen für E-START-024, 033, 035, 047, 056, E-SEO-003, 006, 009, 014 und E-BEW-006.
- **Neue Bauaufgaben aus Z-01:** E-SEO-014 (`llms.txt`-Ergänzung), E-SEO-010 (Benefit-Fakt), E-START-038 (jetzt Soll).
- **Umkehr:** Die Pass-Dateien tragen „korrigiert nach P1-GEGEN-02; vorher …“.
- Die Richtungswahl erhält die nächste freie Nummer.

## E-018 · 09.10.2026 · Denkprotokoll: Zusammenlegung von Lauf 1 und Folgeauftrag „Ausbau auf Showcase-Niveau“ (Lauf 2)
- **Anlass:**
  - Der Auftraggeber hat um 15:01 UTC den Folgeauftrag geschickt. Er liegt wörtlich in `ausbau/AUFTRAG.md`.
  - Lauf 1 stand zu diesem Zeitpunkt in P2.
  - Der Folgeauftrag setzt einen abgeschlossenen Lauf 1 voraus (A0: „läuft Lauf 1 noch, HALT“).
  - Auf die Rückfrage hat der Auftraggeber gewählt: „Lauf-2-Ziele sofort einbauen“.
- **Ziel:** ein einziger Lauf, der die Verluste zurückführt und das Ergebnis auf Showcase-Niveau für das PUBLIKUM hebt (Chef, zuerst am Handy), ohne Arbeit doppelt zu machen.
- **Wege:**
  1. Lauf 1 erst abschließen, dann Lauf 2 nach seinen eigenen Regeln. Sauber, aber die Richtung und das Fundament werden zweimal angefasst.
  2. Beide Läufe jetzt zusammenlegen. Nur ein Freigabepunkt, kein Umbau eines frischen Endstands; die Richtung wird sofort auf Showcase ausgelegt.
  3. Lauf 1 an P2 kappen und Lauf 2 auf dem Ausgangsstand starten. Dann gehen die Rückführung (Z-02) und ihre Belege verloren.
- **Bewertung:** Weg 2 dient beiden Nordsternen am besten und folgt der ausdrücklichen Wahl des Auftraggebers. Risiko: Die Showcase-Ziele erhöhen Umfang und Kontingentverbrauch, und die Kriterien „gegen Endstand 1“ brauchen einen anderen Bezugspunkt. Aufwand höher als Weg 1, aber ohne Doppelarbeit.
- **Entscheidung:** Weg 2. Die HALT-Voraussetzung aus Lauf-2-A0 ist per Auftraggeber-Entscheidung aufgehoben.
- **Regeln des gemeinsamen Laufs:**
  - Beide Aufträge gelten; bei Widerspruch gilt Lauf 2 (dort §5).
  - „Endstand 1“ meint den **Ausgangsstand a83269d**, gemessen in P0. Dazu gelten die Z-Kriterien von Lauf 1 als Bestandsschutz (A-G3).
  - **Abnahme:** `ABNAHME.md` führt Z-01…Z-14 und zusätzlich A-01…A-11 (gegen den Ausgangsstand angepasst).
    - A-02: Blindvergleich und Zuwachs gegen die P0-Jury.
    - A-03: Wow-Probe gegen den ersten Bildschirm des Ausgangsstands.
    - A-06: Z-05, Z-11 und Z-12 plus Lauf-2-Budgets.
  - **Schwerpunktseiten:** `/` und `/jobs/anlagenmechaniker-shk-wetzlar` (Vorlage der Stellenseite). Nur diese beiden Hauptseiten sind Erzählseiten. `/bewerbung` bleibt Arbeitsseite und ist im Vorführpfad der Akt „Handlung“ mit gestaltetem Erfolgsmoment.
  - **STEIGERUNG spektakulär** ersetzt AUSBAUSTUFE und GESTALTUNGSMUT: je Schwerpunktseite ein Hauptmoment, ein Leitfaden, höchstens ein WebGL- oder Canvas-Moment auf der Startseite.
  - **Budgets:** Erzählseiten bis 120 KB gzip JS für Bewegung, WebGL und Canvas, nur nachgeladen; sonst Lauf 1. Zielreserve beim LCP ≤ 2,2 s (N-14).
  - **Ansichten:** zusätzlich 390×844 und 430×932.
  - **Bildmaterial:** nur Vorhandenes. Die Frage nach echten Fotos (N-16) kommt in die Freigabe-Übersicht.
  - **Freigabe:** **ein** Halt nach dem gemeinsamen P2/A2. Die Übersicht vereint die Pflichtinhalte beider Aufträge in höchstens 40 Zeilen.
  - **Arbeitsordner:** bleibt `_relaunch`. Lauf-2-Teile liegen in `_relaunch/ausbau/` (AUFTRAG.md, `richtungen`, `drehbuch`, `vorfuehrung`). `ausbau/STATUS.md` und `ausbau/PRUEFPUNKT.md` verweisen auf die gemeinsamen Dateien.
  - **Statuszeile:** die von Lauf 1, ergänzt um „Ausbau [n]/11 · Wow [Wert]“.
- **Umkehrprobe:** Die Trennung bleibt möglich. Die A-Kriterien stehen in einem eigenen Abschnitt, Lauf-2-Material liegt in `_relaunch/ausbau/`.
- **Folgen zweiter Ordnung:**
  - Mehr Kontingent pro Phase (nur Opus und Haiku, E-020).
  - Längere Dauer bis ABSCHLUSS.
  - Die Jury-Schwellen steigen auf den Schwerpunktseiten von Z-08 (8,0) auf A-01 (9,0); N-16 (Fotos) wiegt damit schwerer.

## E-019 · 09.10.2026 · Wunsch des Auftraggebers zur Richtung (Rang 5)
- Er hat erneut das Bild von Kachel B, Runde 1, geschickt; gesichert in `belege/auftraggeber/2026-10-09-1501-kachel-b-runde1-d1440.webp`. Auf die Rückfrage „Was meinst du damit?“ lautete die Antwort: „alle“. Die drei Antwortmöglichkeiten waren „B ist meine Richtung“, „Nur Farben/Stimmung“ und „B-Bild mit A-Präzision“.
- **Auslegung:** Grundrichtung ist **B in der Fassung der Runde 1**:
  - Haus mit Wärmepumpe, roter Vorlauf, blauer Rücklauf, warmes Papier.
  - Farben und Stimmung nach E-016.
  - Verschmolzen mit der **Präzision von A**: Maße und Maßketten, Arbeitszeit-Diagramm, die Leitung endet im Bewerben-Knopf.
  - Die Reparaturen aus Runde 2 von A und B bleiben erhalten: 320 px, Tokens, Ziel des Logo-Links, eigene Mobil-Komposition.
  - C liefert nur Material, etwa den Tagesbogen der Arbeitszeit.
- **Folgen:**
  - Die ausstehende Überarbeitung von C und die Jury der Runde 2 (am Sitzungslimit gescheitert) entfallen. Die Ergebnisse der Runden 1 und 2 dienen als Eingangsmaterial.
  - Die drei Varianten nach Lauf-2-A2 sind Steigerungsvarianten dieser Grundrichtung: zugespitzt, kühn und an der Grenze mit WebGL/Canvas. Bewertet werden sie per Wow-Probe und Jury.
  - Den Erklärtext „So arbeitet eine Wärmepumpe …“ setzt der Lauf nicht selbst wieder ein; er steht als Vorschlag in TEXTVORSCHLAEGE.md.
- Kommt am Freigabepunkt ein Widerspruch, gilt ÄNDERN.

## E-020 · 09.10.2026 · Modelle, Push und Produktions-Merge (Antworten des Auftraggebers)
- **Modelle:** ab sofort nur Opus 5.5 und Haiku 5.5. Opus übernimmt Orchestrierung, Richtung, Bau (Stufen 2 und 3), Jury, Gegenprüfung, Drehbuch und WebGL. Haiku übernimmt Messen, Bildschirmfotos, Erstbetrachter, Doku und Mengenarbeit. Sonnet wird nicht mehr eingesetzt; das ersetzt die MODELLE-Zeile aus Lauf 1.
- **Push:** Sicherungs-Pushes nur auf `claude/kind-ride-n9duod`, nach jedem Schritt (der Container ist flüchtig). Vercel-Vorschauen sind erlaubt. Das ersetzt „PUSH UND VERÖFFENTLICHUNG: nie“ aus Lauf 2 für diesen Branch.
- **Produktions-Merge** (ergänzt E-001): Der PR nach `main` entsteht erst nach ABSCHLUSS. Gemergt wird erst auf das **ausdrückliche Wort des Auftraggebers** und nur bei erfüllten P7-Bedingungen: CI grün, Supabase-Migrationen lesend geprüft, Vercel-Variablen bestätigt (M-001).

## E-021 · 09.10.2026 · FREIGABE durch den Auftraggeber: Richtung, Verteilung auf die Seiten, Umfang, Merge
- **Wortlaut:**
  - „designs wieder verwerten und auf allen Pages verteilen und die webeite endlich fertig auf main zusammenführen“
  - „das sieht halt schöner für die homepage aus und den rest kannst du auf die anderen unterseiten verteilen“ (Bild: Kachel B, Runde 1)
  - „mach alles ready so wie du denkst und vollende das projekt“ (Bild: Variante 1 Desktop)
- **Antworten auf die Rückfragen:**
  - Gestaltung „Alle drei verteilt“.
  - Umfang „Design + Muss/Soll“.
  - Vercel-Variablen „Ja, alle gesetzt“ (M-001 erledigt).
  - Merge „Automatisch, wenn alles grün“.
- **Das gilt als FREIGABE:** Der Halt nach P2/A2 entfällt, der Lauf arbeitet ohne weiteren Halt bis zum Merge.
- **Gestaltung je Seite:**

  | Seite | Gestaltung |
  |---|---|
  | `/` | **Variante 1** (`ausbau/richtungen/1`, geschärfte Fassung von B Runde 1). Dazu aus B Runde 1: Wegweiser „Wetzlar“, Knopf „Kreislauf zeigen“, Erklärsatz zur Wärmepumpe (T-001, durch das Bild des Auftraggebers freigegeben), Rohrklammer, Leitungstrenner, Arbeitszeit-Diagramm. |
  | `/jobs` | **Variante 2:** 13:30 in Bildgröße im Heizkreis; Stellen als Leitungsabgänge mit Gehalt. |
  | `/jobs/[slug]` | **Variante 2 und 1:** Gehaltsspanne in Bildgröße im Heizkreis, Vorlauf endet im Bewerben-Knopf, Maßketten. Auf der Wärmepumpen-Stelle zusätzlich das Wärmebild aus **Variante 3**, als statisches SVG ohne WebGL. |
  | `/bewerbung*` | Ruhige Arbeitsseiten. Das Leitungspaar ist der Fortschrittsstrang; auf der Danke-Seite schließt sich der Kreislauf. |
  | 404 | Offene Leitung, Wegweiser ins Leere. |
  | Recht | Typografisch ruhig. |

  WebGL entfällt; STEIGERUNG erlaubt „höchstens einen“ Moment, A-08 ist damit ENTFÄLLT.
- **Umfang bis zum Merge:**
  - Pflicht: Design auf allen 12 Seiten und alle 55 Muss- und Soll-Elemente.
  - Kann (6), Showcase-Kriterien A-01 (≥ 9), A-03, A-04 und das Vorführpaket A-09/A-10 folgen nach dem Merge als Folgearbeit. Das ist ausdrücklich ein Umfangsentscheid des Auftraggebers.
- **Merge-Gate:**
  - CI grün.
  - Lokal grün auf Ebene 1 und E2E mit axe.
  - Erfüllt: Z-02 (Muss/Soll), Z-03, Z-05, Z-06, Z-11, Z-12 und Z-13.
  - Gemessen: Z-07, Z-08 (Jury mit Lockvogel) und Z-09/Z-10, mit höchstens einer Reparaturrunde.
  - Supabase lesend geprüft. Würde der Merge 2a-Migrationen auf die Produktion anwenden, frage ich einmal nach.
- **Umsetzung der gemeinsamen Dateien:**
  - Das Fundament (theme.css, Schriften, Guard, Bewegungsmodul, Icon-Schnittstelle, Logo) setzt ein einziger Opus-Agent als **exklusives Paket** um. Kein anderes Paket läuft gleichzeitig auf diesen Dateien.
  - Der Orchestrator nimmt es ab und committet. Das ist eine Abweichung von „gemeinsame Dateien nur der Orchestrator“, begründet mit der Kontextökonomie. Die Dateihoheit bleibt dabei gewahrt.
- **Umkehr:** Jede Welle ist ein eigener Commit je Paket. Der Rückweg ist der Revert auf 8761d41 (Merge von main).

## E-022 · 09.10.2026 · Abnahme R2-FUND-01 mit zwei bekannten Befunden
- **Abgenommen:**
  - Paket-Rubrik 80 %.
  - Ebene 1 grün: lint, type-check, 1078 Vitest (vorher 927, kein bestehender Test geschwächt), Design-Guard (strenger), Kontrast (351 Paare in 7 Modi), Client-Importe, Build, Graph.
  - Logo bytegleich auf Plakette, ohne Filter.
- **CSP:** Der sha256-Hash des Kopfskripts steht **nicht** in `script-src`. Ein Hash schaltet nach CSP Level 2+ `'unsafe-inline'` ab und würde die Inline-Skripte von Next sperren. Das Schutzniveau bleibt wie im Ausgangsstand (Report-Only, `'unsafe-inline'`). Der Hash ist in `lib/motion/head-script.ts` dokumentiert und getestet; eine Nonce-Strategie kommt nach MENSCHEN (M-018). KERN K-004 ist angepasst.
- **Leistung:** Der LCP mobil steigt mit den neuen Schriften gegenüber P0: `/` 2,92 → 3,36 s (+15 %), Stellenseite +14 %, `/bewerbung` +9,5 %. Gegenmaßnahme ist ein eigenes Paket **R3-PERF-01**, parallel zur Startseiten-Welle:
  - statische Instanzen und engere Teilmengen der variablen Schriften (Bricolage 800, Atkinson 400/700, Martian nur Ziffern und Etiketten);
  - Vorladen und `font-display` je Rolle prüfen;
  - Messung als Median aus 5 Läufen.
  
  Das Ziel bleibt Z-12, nie schlechter als P0 plus 10 % LCP.
- **Rechtstext:** Die Datenschutzerklärung nennt „Inter“ als selbst gehostete Schrift (`app/datenschutz/page.tsx`). Die Aussage wird faktisch unrichtig, deshalb ersetzt R5-RECHT-01 den Schriftnamen minimal (weiter selbst gehostet, keine Übermittlung). Vermerk zur Prüfung durch den Datenschutzbeauftragten in `docs/operations/datenschutz-aenderungen.md` und M-019.
