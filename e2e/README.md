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

Alle mit `reducedMotion: 'reduce'`, Locale `de-DE`, Zeitzone `Europe/Berlin`. Nur `bewegung.spec.ts` schaltet für
seine Tests `no-preference` ein.

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
- `herkunft.spec.ts`: Herkunft ohne Browser-Speicher (Plan §D). Nach einem Einstieg über Indeed bekommt der Link auf
  `/bewerbung` beim Kontextmenü `?herkunft=ind` und der WhatsApp-Link den sichtbaren Code „– W-IND“, ohne Cookie und
  ohne Speicher; ein neuer Tab mit `?herkunft=ind` schickt die Bewerbung mit dem Kanal Indeed ab.
- `navigation.spec.ts`: Der Kopf-Anker `/#faq` springt sofort zum Abschnitt, auch bevor die Inseln unter der Falz
  hydriert sind. Desktop: „Arbeiten bei uns“ und „Einsatzgebiet“ führen zu ihren Hubs (aria-current für Seite und
  Bereich), das Untermenü öffnet beim Überfahren und per Tastatur (Tab hinein, Escape schließt), Escape schließt auch
  das per Maus geöffnete Untermenü ohne Fokus in der Navigation (WCAG 1.4.13), nie zwei Untermenüs zugleich. Tablet
  quer mit Touch (1180 × 820, in den Desktop-Projekten): Menüknopf statt Navigation, das Menü listet Kreis-Hubs und
  Themen. Handy: Kreis-Hub und Thema aus dem Menü, alle Zeilen im offenen Menü ≥ 44 × 44 px (E-028).
- `local-pages.spec.ts` (nur `mobile-light`): jede lokale Seite (E-028) aus dem Registry, also Gebietsseite,
  4 Kreis-Hubs und 54 Ortsseiten: Status 200, genau eine h1, Canonical auf sich selbst, Pfad bei 320 px und ab
  40em, kein horizontaler Scroll. axe in allen vier Projekten über die Stichproben in `ROUTES`.
- `bewegung.spec.ts` (nur `mobile-light` und `desktop-light`, E-029): Dauerbewegung mit `reducedMotion:
  'no-preference'`. Auf der Startseite läuft der Rotor der Einzelheit X im Sichtfeld, „Anhalten“ hält an, „Abspielen“
  startet wieder (Knopf ≥ 44 × 44 px, WCAG 2.2.2). Auf der Kundendienst-Stelle halten Wegscrollen und ein
  versteckter Tab den Rotor an. Auf der Wärmepumpen-Seite fließen Wasser und Kältemittel, ein Druck hält alle
  Schleifen der Seite an, axe ohne Verstöße.
  Mit reduzierter Bewegung läuft nichts und der Knopf fehlt; ohne JavaScript steht das Standbild vom Server.
- `themen-pages.spec.ts` (nur `mobile-light`): Themen-Hub `/arbeiten-bei-uns` und die sechs Themenseiten, dieselben
  Prüfungen und ein JSON-LD-Graph ohne JobPosting und FAQPage. axe über die Stichproben `/arbeiten-bei-uns` und
  `/arbeiten-bei-uns/gehalt` in `ROUTES`.
- `buero.spec.ts` (E-031, nur `mobile-light` und `desktop-light`): „Büro und Verwaltung“. Beim Laden im Bild steht
  der Endzustand; die vier Szenen unten starten einmal beim Hineinscrollen (`data-ablauf` bereit → laeuft → fertig),
  jede Animation endet ≤ 2.400 ms mit genau einer Wiederholung; reduziert und ohne JavaScript keine Animation und der
  Endzustand; Beschriftungen ≥ 12 px, kein horizontaler Scroll, axe ohne Verstöße. Die Stellenseite der Bürofachkraft
  zeigt die Szenen nur als Dateien (`/zeichnung/buero-*.svg`), ohne Ablauf.

Jeder Flow-Test sendet mit eigener `x-real-ip`, damit das Rate-Limit von `/api/bewerbung`
(5 pro 10 Minuten je IP) parallele Tests nicht blockiert.
