# End-to-end-Tests (Playwright + axe)

Prüft die Phase-1-Abnahme aus `docs/ROADMAP.md` §9 und §14 im Production-Build.

## Ausführen

```bash
bun run build      # Pflicht: Der Webserver startet nur `next start`, er baut nicht selbst.
bun run e2e        # = playwright test; startet `next start -p 3400` und beendet ihn danach
```

- Browser: `bunx playwright install --with-deps chromium` (in CI vor dem Lauf).
- Port 3400 muss frei sein (`reuseExistingServer: false`).
- Der Server läuft mit `EMAIL_SIMULATION=true` und `ALLOW_DEV_SECRETS=true`: Bewerbungen werden
  simuliert zugestellt, es geht keine echte E-Mail raus. Beides greift nie auf Vercel Production.
- Nach Codeänderungen erst neu bauen, sonst testet der Lauf den alten Stand.
- Ein Projekt oder eine Datei: `bunx playwright test e2e/apply.spec.ts --project=mobile-light`.
- Bericht mit Screenshots aller Seiten: `bunx playwright show-report`.

## Projekte

| Projekt | Viewport | Farbschema |
|---|---|---|
| `mobile-light` / `mobile-dark` | 390 × 844, Touch, DPR 2 | hell / dunkel |
| `desktop-light` / `desktop-dark` | 1440 × 900 | hell / dunkel |

Alle mit `reducedMotion: 'reduce'`, Locale `de-DE`, Zeitzone `Europe/Berlin`.

## Specs

- `pages.spec.ts`: jede Route (Stellenseiten aus dem Registry) mit Status, genau einer h1,
  `main#main`, Schrift ≥ 12 px, axe (WCAG 2.2 AA) ohne Verstöße und Screenshot; auf Touch-Geräten
  Trefferflächen ≥ 44 px; bei 320 px Breite kein horizontaler Scroll.
- `seo.spec.ts` (nur `desktop-light`): genau ein JobPosting je Stellenseite mit `url` = canonical,
  keins auf `/` und `/jobs`, Feeds mit Status und Content-Type, Sitemap mit allen Stellen. Dazu (V6-B)
  je Route genau ein JSON-LD-Block mit `@graph` (auflösbare `@id`-Verweise, WebPage-`url` = canonical)
  und ein Offline-Crawl nach Seobility-Prüfpunkten über alle Sitemap-Seiten: Titel 30–60 Zeichen,
  Meta-Beschreibung 110–160, genau eine h1, ≥ 500 sichtbare Wörter, Canonical absolut und gleich dem
  Sitemap-Eintrag; auf allen Routen jeder Ankertext mit genau einem Ziel und jedes `<img>` mit `alt`.
- `apply.spec.ts`: Happy Path eingebettet und auf `/bewerbung` (≤ 3 Taps), nur Tastatur (Desktop),
  Browser-Zurück/-Vor, Entwurf nach Neuladen, 503 mit WhatsApp-Rückfallweg, Fokus auf das erste
  fehlerhafte Feld, kein Doppel-Submit, keine Personendaten in URLs, alter localStorage-Eintrag gelöscht.
- `mappe.spec.ts`: Station anlegen, Anschreiben erzeugen, mit der Mappe in den Flow und absenden.

Jeder Flow-Test sendet mit eigener `x-real-ip`, damit das Rate-Limit von `/api/bewerbung`
(5 pro 10 Minuten je IP) parallele Tests nicht blockiert.
