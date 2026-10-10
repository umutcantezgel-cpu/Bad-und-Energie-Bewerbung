# Wellen R4 und R5 · Rahmen und Unterseiten · gemeinsames Briefing (Rolle Baumeister, Opus, Stufe 3) · KERN 1.0

## Ziel
Rahmen (Kopf, Menü, Fuß, Bausteine, 404) und alle Unterseiten tragen die freigegebene Gestaltung (E-021). Die Startseite (Welle R3) ist der Maßstab, an dem du Formen, Strich, Schrift und Rhythmus abliest. Zuordnung:

| Bereich | Gestaltung |
|---|---|
| `/jobs` | Variante 2: das große „13:30“ im Heizkreis als Kopf, Stellen als Leitungsabgänge mit sichtbarem Gehalt. Quelle `_relaunch/ausbau/richtungen/2/` |
| Stellenseiten | Variante 2 und 1: Gehaltsspanne in Bildgröße im Heizkreis, Vorlauf endet im Bewerben-Knopf, Maßketten für Arbeitszeit und 35 km. Auf der Wärmepumpen-Stelle (Kundendienst) zusätzlich das Wärmebild aus Variante 3 als statisches SVG ohne WebGL, Quelle `_relaunch/ausbau/richtungen/3/` (statischer Ersatz) |
| Arbeitsseiten (`/bewerbung*`, Recht) | ruhig; Leitungspaar als Fortschrittsstrang; Danke: Der Kreis schließt sich; siehe `_relaunch/ausbau/referenz/b-runde1/BEGRUENDUNG.md` §11 „Übertragbarkeit“ |
| 404 | Wegweiser ins Leere, offene Leitung |

Alle Muss- und Soll-Elemente deines Pakets aus der Verlustliste stehen an einem logischen Ort.

## Zuerst lesen
1. `_relaunch/KERN.md` (1.0), vollständig.
2. `_relaunch/ENTSCHEIDUNGEN.md` E-016, E-019, E-021.
3. Die Prototypen deines Bereichs (siehe Tabelle) und die fertige Startseite im Code (`components/home/*`, `app/page.tsx`) als Maßstab.
4. Für deine E-IDs die Pässe in `_relaunch/atlas/paesse-start.md`, `paesse-bewerbung.md` bzw. `paesse-shell-recht-seo.md`: Wesenskern wörtlich, Abnahme und Bindungen.
5. Die vorhandenen Dateien deines Pakets und ihre Tests (Vitest und `e2e/*.spec.ts`).
6. Was R2 geschaffen hat: `app/styles/theme.css` (Rollen und Utilities, z. B. `bg-surface`, `text-brand`, `text-vorlauf`, `font-display`, `font-mass`, `text-etikett`), `lib/motion/` (Register, Kopfskript-Klasse `auftakt`) und `components/icons/` (Icon-Komponente).
7. `AGENTS.md`: Next.js 16; die Doku liegt in `node_modules/next/dist/docs/`.

## Regeln
- **Schreibrechte:** nur die Dateien, die dein Paket nennt, plus neue Dateien darin (Komponenten, Tests).
  - `app/styles/*`, `app/globals.css`, `app/layout.tsx`, `lib/content/*`, `lib/motion/*`, `components/icons/*`, `components/home/*` und Konfiguration gehören dem Orchestrator bzw. R2/R3. Nie `supabase/**`, `lib/supabase/**`, `lib/uploads/**`, `app/admin/**`, `app/api/admin/**`. Die Geschäftslogik (Intake, Validierung, API-Routen) bleibt unverändert (G9); du änderst Darstellung.
  - Brauchst du neuen Text, lege ihn in einer eigenen Datei deines Pakets ab, gebaut aus `FACTS`/`COMPANY`/`REGION`/Registry, nur Belegtes. Melde nötige Änderungen an gemeinsamen Dateien als OFFENE FRAGE.
- **Gestaltung nur über Tokens und semantische Utilities.**
  - Kein `text-[…]`, keine Hexwerte, kein `font-mono` oder `uppercase` direkt.
  - SVG-Zeichnungen inline als React-Komponenten mit `currentColor` und Rollenvariablen, eine Strichstärke (`--m-strich`), `aria-hidden` oder `role="img"` + `<title>`.
  - Bewegung nur über Register-Kennungen (`data-motion`) und die Bewegungstokens; reduzierte Bewegung zeigt den Endzustand.
  - Server-Komponenten als Standard, Client-Inseln nur für Interaktion.
- **Wahrheit:** nur Fakten aus `lib/content/facts.ts` (pending nur, wo erlaubt; `validUntil` beachten), Stellen aus `lib/jobs/data/*`, Orte aus `lib/data/locations.ts`. Ausnahme M-016: die drei Geschäftsaussagen der Ortsbeschreibungen nicht zeigen.
- **Icons:** In deinen Dateien lucide-Importe durch `components/icons` ersetzen.
- **Zugänglichkeit:**
  - Touch-Ziele ≥ 44 px, Fokus sichtbar, Kontraste AA.
  - Keine Information nur über Hover.
  - Überschriftenhierarchie: genau eine `h1` je Seite.
  - Formulare mit sichtbaren Beschriftungen, `autocomplete` und Fehlermeldungen am Feld.
- **Mobil eigens komponiert** (390 zuerst), geprüft in 320 · 375 · 390 · 430 · 768 · 1440 · 1920; kein horizontaler Überlauf.
- **Tests:** Bestehende Tests deiner Dateien laufen weiter oder werden gleichwertig angepasst (Begründung im Ausgabeformular). Neue Funktionen bekommen einen Test der Kernaufgabe (Vitest, Muster `components/home/__tests__/`).

## Prüfung (Paketprüfung)
- `bun run lint`, `bun run type-check`, `bun run test`, `bun run check:design`, `bun run check:contrast`, `bun run check:client-imports`. Alle grün; Fehler in fremden Dateien nur melden.
- **Kein eigener Build und kein eigener Server.** Der Orchestrator betreibt einen gemeinsamen Entwicklungsserver auf `http://localhost:3450` mit Hot Reload. Bilder zur Selbstkontrolle:
  `node _relaunch/werkzeuge/screens.mjs --base http://localhost:3450 --label r45-<paket> --only <slug> --vps m390,d1440 --schemes light,dark --belege alle`. Die Slugs stehen in `_relaunch/werkzeuge/lib/browser.mjs` (GRUNDMENGE). Zusätzlich die betroffenen E2E-Specs: `bunx playwright test e2e/<spec> --project=<projekt>` gegen den Server auf :3450, falls die Konfiguration das erlaubt; sonst melden.
  Sieh dir die Ausschnitte deines Abschnitts an und verbessere ihn.
- Kein Git, keine schreibenden Anfragen, keine fremden Ports.
- Ausgabeformular: GEÄNDERTE DATEIEN · WAS UND WARUM (mit E-IDs) · TESTS UND ERGEBNIS · BILDBELEGE · OFFENE FRAGEN · RISIKEN.
- Endzeile: `=== ENDE <Kennung> · BEREIT ZUR RÜCKGABE ===`.
