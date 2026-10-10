# Bericht · Direktive v6.0 „100/100“ (Stand 10.10.2026, live auf main)

**Live:** https://karriere.bad-energie.de. Alle Arbeit liegt auf `main`; jeder Branch ist dort vollständig enthalten.

## Ergebnis in drei Sätzen
1. Desktop steht auf allen Hauptseiten bei Perf 100, CLS ist überall 0,000, und A11y, Best Practices und SEO sind je 100.
2. Die SEO-Prüfliste nach Seobility-Muster ist vollständig erfüllt:
   - ein JSON-LD-`@graph` je Seite mit WebPage-Knoten;
   - eindeutige Ankertexte;
   - ≥ 500 Wörter auf jeder indexierbaren Seite;
   - robots.txt ohne Host-Zeile, Sitemap mit Änderungsdatum.
3. Mobil stieg Perf von 88–93 auf 88–96. Das Ziel 98–100 ist nicht erreicht.
   - Das größte Element ist im ersten Bild schon endgültig sichtbar.
   - Der restliche LCP-Abstand entsteht in Lighthouses Simulation.
   - Verringern ließe er sich nur über eine Entscheidung zur Gestaltung (Schriftschnitt) oder zur Architektur (JavaScript-Sockel). Einzelheiten unter „Grenze“.

## Vitals vorher → nachher
Lighthouse 13.5, simulate, Median aus 5, Produktions-Build. Belege: `belege/d0-basis` (vorher) und `belege/v6-ende` (nachher).

| Seite | Perf mobil | LCP mobil | FCP mobil | TBT mobil | CLS mobil | Perf Desktop | CLS Desktop |
|---|---|---|---|---|---|---|---|
| `/` | 90 → **94** | 3,17 → 2,96 s | 1,69 → 1,37 s | 173 → 67 ms | 0 → 0 | 100 → 100 | 0 → 0 |
| `/jobs` | 92 → **93** | 3,31 → 3,24 s | 1,38 → 1,22 s | 67 → 54 ms | 0,001 → **0** | 100 → 100 | 0 → 0 |
| Anlagenmechaniker | 93 → **96** | 3,03 → 2,65 s | 1,53 → 1,22 s | 70 → 61 ms | 0,015 → **0** | 100 → 100 | 0 → 0 |
| Kundendienst | 92 → **96** | 3,17 → 2,66 s | 1,52 → 1,22 s | 75 → 64 ms | 0 → 0 | 100 → 100 | 0,013 → **0** |
| `/bewerbung` | 88 → 88 | 3,77 → 3,62 s | 1,52 → 1,22 s | 81 → 144 ms | 0 → 0 | 100 → 100 | 0 → 0 |

- **Unter echter Drosselung** (CPU ×4, 150 ms RTT, 1,6 Mbit/s) liegt der LCP bei 1,26–1,94 s (`belege/v6c-lcp-diagnose`).
- **TBT auf `/bewerbung`:** Der Wert streut stark mit der Last der Maschine (103–187 ms). Der Bewerbungsablauf hydriert dort sofort, weil er der Inhalt der Seite ist.

## Was geändert wurde (Pakete und Routen)

| Paket | Routen | Wirkung |
|---|---|---|
| A2 JS (`perf(bundle)`) | Stellenseiten, `/` | Bewerbungsablauf und Einsatzgebiet hydrieren erst in Reichweite, der Code lädt im Leerlauf vor. −43 KB JavaScript zum Start auf Stellenseiten. |
| A1 CSS (`perf(css)`) | alle | Die prose-Stile liegen nur noch auf den Rechtsseiten, dadurch −18 KB render-blockierendes CSS. `inlineCss` gemessen und verworfen. |
| A3 Vitals (`perf(vitals)`) | alle | Martian vorgeladen, CLS 0. Logo ohne hohe Priorität. Sterne als ein gemeinsames Symbol, Wochenplan mit 80 → 51 SVG-Elementen, kein erzwungenes Neuberechnen des Layouts mehr. |
| G1 Inhalt (`content(onpage)`) | `/jobs`, `/bewerbung` | Inhaltswörter: `/jobs` 242 → 737, `/bewerbung` 210 → 580. Sichtbar mit Kopf und Fuß sind es 933 bzw. 671. Alle Texte aus belegten Fakten, mit Herkunftstests. |
| G2 Inhalt (`content(onpage)`) | Stellenseiten, `/` | Abschnitt „Einblick“ je Stelle, 708–797 Inhaltswörter (sichtbar 836–929). Kundendienst-h1 mit „Wärmepumpe“ und „Wetzlar“. „Heizungsbauer“ im Text der Startseite. |
| B SEO (`seo(schema)`, `test(seo)`) | alle | Ein `@graph` je Route und eindeutige Ankertexte, darunter „Direkt hier bewerben“ und „Datenschutzhinweise zur Karte“. Fuß-Überschriften beschreibend. Strengere Graph-Prüfung und Offline-Crawl. |
| Korrekturen aus zwei unabhängigen Codeprüfungen | `/`, Stellenseiten, `/bewerbung` | Siehe unten. |

**Korrekturen aus den unabhängigen Prüfungen** (je mit Gegenprüfer):
- **Kopf-Anker auf der Startseite:** „Vorteile“, „Ablauf“ und „FAQ“ blieben wirkungslos, solange das Einsatzgebiet noch nicht hydriert war. Nachgestellt, behoben, mit E2E-Test, live 8/8.
- **Stellen-h1:** wieder mit Trennstrich am Umbruch (K-005).
- **`/bewerbung?stelle=`:** Der Hinweis zeigt auf „ändern“.
- **Bildschirmleser:** Trenner zwischen Etikett und Wert werden vorgelesen.
- **Einblick:** Überschrift ohne „ab Wetzlar“.
- **Kundendienst:** `updatedAt` nachgezogen.
- **Logo:** Kopf, Menü und Fuß teilen wieder eine Datei.
- **404-Seite:** Der Kommentar zu den Preloads ist korrigiert.
- **Fuß-Überschriften:** brechen ab 1024 px nicht mehr um.
- **E2E-Test:** Er hing auf der 404-Seite und ist korrigiert.

## SEO-Prüfliste vorher → nachher

| Prüfpunkt | vorher | nachher |
|---|---|---|
| Titel 30–60 Zeichen, eindeutig | ja (45–59) | ja (51–59) |
| Beschreibung 110–160 Zeichen | ja | ja (140–155) |
| genau eine h1 | ja | ja |
| ≥ 500 Wörter je indexierbarer Seite | nein (`/jobs` 263, `/bewerbung` 217) | **ja** (671–1617) |
| Titel-Keywords im sichtbaren Text | nein (Stellenangebote, Gießen, Heizungsbauer) | **ja** (Test je Stelle: Fokus-Keyword in den ersten 100 Wörtern) |
| Ankertext → genau ein Ziel | nein („Jetzt bewerben“, „Datenschutz“) | **ja** (E2E-Crawl, 13 Routen, 390 und 1440 px) |
| alt an allen Bildern | ja | ja |
| JSON-LD | 2–3 Blöcke, ohne WebPage | **ein `@graph` je Route mit WebPage**, alle `@id`-Verweise auflösbar |
| robots.txt | mit `Host:` | **ohne** |
| Sitemap: Canonicals mit lastmod | `/bewerbung` ohne lastmod | **alle** |
| Canonical = Sitemap-Eintrag | ja | ja (E2E) |

Seobility selbst braucht ein Konto. Ich habe die Prüfpunkte deshalb offline umgesetzt, in `e2e/seo.spec.ts` und `scripts/qa/check-graph.mjs`. Live liefen sie mit 34 von 34 grün.

## Schema-Entitäten (je Seite in einem `@graph`)

| @type | @id | wo |
|---|---|---|
| Organization | `https://bad-energie.de/#organization` | jede Seite |
| Person | `https://bad-energie.de/#founder` | jede Seite (Organization.founder → Referenz) |
| WebSite | `https://karriere.bad-energie.de/#website` | jede Seite |
| LocalBusiness | `https://bad-energie.de/#localbusiness` | jede Seite (parentOrganization → Organization) |
| WebPage | `<Canonical>#webpage` | jede Seite mit Canonical (10), nicht auf der 404 |
| BreadcrumbList | `<Canonical>#breadcrumb` | `/jobs` und die 4 offenen Stellen |
| JobPosting | `<Canonical>#jobposting` | die 4 offenen Stellen (mainEntityOfPage → WebPage) |
| FAQPage | `https://karriere.bad-energie.de/#faq` | nur `/` |

Bewusst nicht umgesetzt:
- **SearchAction:** Es gibt keine Suche (E-SEO-007).
- **FAQPage:** nur auf `/` (ROADMAP:475).
- **BreadcrumbList:** nur, wo ein Pfad sichtbar ist.

## Gates und Prüfung
- **Vor jedem Push auf main:** type-check, lint, Vitest (zuletzt 1828), `check:design`, `check:contrast`, `check:client-imports`, build, `test:graph`, Playwright mit axe in 4 Projekten (zuletzt 206 grün).
- **CI auf main** ist grün.
- **Unabhängige Prüfungen:** vier Läufe (A2/G1/G2/A1, A3, V6-B, V6-C) mit Findern und Gegenprüfern. Jeder bestätigte Befund ist behoben.
- **Live** nach jedem Push: 15 Routen mit 200/404, Navigation 8/8, SEO und Graph 34/34.
- **Dependabot:**
  - übernommen: postcss 8.5.29, Playwright 1.63, checkout v7, setup-node v7, cache v6, upload-artifact v7, gitleaks v3, supabase setup-cli v3;
  - geschlossen mit Begründung: TypeScript 7 (#2) und ESLint 10 (#4). Beide sind mit eslint-config-next 16.3.8 unverträglich.

## Grenze, ehrlich (warum nicht 98–100 mobil)
- **Diagnose `belege/v6c-lcp-diagnose`:** In 100 von 100 Läufen ist LCP = FCP. Es gibt je einen Kandidaten mit Deckkraft 1 und keinen Remount.
- **Ursache:** Lantern rechnet zum simulierten LCP jede Anfrage, die vor dem ersten Bild fertig ist. Auf localhost sind das auch die Schriften (~102 KB) und das async-JS (~240 KB), weil das erste Bild erst nach Stil und Layout von 70–115 ms erscheint.
- **Hebel, die noch bleiben (Entscheidungen, keine Fehler):**
  - **Schmalerer Bricolage-Schnitt:** bis −0,3 s simuliert. Das ist eine Gestaltungsentscheidung nach K-005.
  - **Weniger JS vor dem ersten Bild:** Der Framework-Sockel von ~144 KB lässt sich nicht weiter verkleinern, ohne die Architektur zu ändern.
  - **`inlineCss`:** gemessen und verworfen, TBT +90–320 ms, LCP schlechter.
- **PageSpeed Insights gegen die Produktion** ist von hier nicht messbar (API 429, Tageskontingent). Bitte selbst prüfen unter https://pagespeed.web.dev/?url=https://karriere.bad-energie.de.

## Offen für Menschen
- **Branches löschen:** auf GitHub unter Code → Branches den Papierkorb bei `claude/bold-pasteur-9gu316`, `claude/kind-ride-n9duod`, `claude/optimistic-turing-etjnl3` und `claude/sleepy-einstein-14fh42`. Alle stehen bei 0 Commits vor main. Die Sitzung durfte nicht löschen (403). Empfehlung: Settings → General → „Automatically delete head branches“.
- **Entscheidung zum Schriftschnitt**, falls 98+ mobil Pflicht ist.
- **Bekannte Hinweise in Testausgaben**, ohne Einfluss auf die Ergebnisse:
  - Vitest-Konfiguration als ESM;
  - `next start` mit `output: standalone` im Playwright-Webserver.

## Commits auf main (Conventional Commits, chronologisch)
- **Basis:** `2cf2f0a` chore(jules) · Basis und ehrliche Messbasis
- **Zyklus 1:**
  - `e38c605` perf(bundle)
  - `5294fe3` content(onpage) /jobs + /bewerbung
  - `0fb3183` content(onpage) Stellenseiten
  - `f3f00a9` perf(css)
  - `c46d58b` docs(relaunch)
  - `a7010a0` chore(jules)
- **Dependabot:**
  - `42ec96e` chore(deps)
  - `fa59b0f` ci(actions)
  - `b5d84c6` Merge #11
- **Korrekturen aus der Prüfung:**
  - `38f7542` fix(hydration)
  - `27502c4` fix(jobs)
  - `04ff2b1` fix(content)
- **Vitals:**
  - `fe72359` perf(vitals)
  - `a21e4f7` docs(relaunch)
- **Branches:** `c577222` chore(git) · Sicherungs-Branch in main verbucht, Baum unverändert
- **SEO:**
  - `99a8fc1` seo(schema)
  - `3f8e195` test(seo)
  - `bfd2bcf` chore(jules)
  - `69ce3a5` docs(relaunch) · Endmessung
- **Abschluss:** dieser Bericht, die Diagnose und `.jules` (docs/chore)

## Live-Bilder
`belege/live-2026-10-10-v6/`: Startseite, Stellenliste, Stellenseite und Bewerbung bei 390 und 1440 px.
