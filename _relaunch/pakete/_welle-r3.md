# Welle R3 · Startseite · gemeinsames Briefing (Rolle Baumeister, Opus, Stufe 3) · KERN 1.0

## Ziel
Die Startseite `/` erreicht in der freigegebenen Gestaltung (E-021) Zielniveau, **mobil zuerst**:
- Einstieg nach **Variante 1** (`_relaunch/ausbau/richtungen/1/index.html`).
- Dazu aus **B Runde 1** (`_relaunch/ausbau/referenz/b-runde1/index.html`, Bild `_relaunch/belege/auftraggeber/2026-10-09-1501-kachel-b-runde1-d1440.webp`): Wegweiser „Wetzlar“, Knopf „Kreislauf zeigen“, Erklärsatz zur Wärmepumpe (TEXTVORSCHLAEGE T-001, freigegeben), Rohrklammer, Leitungstrenner, Arbeitszeit-Diagramm.
- Alle Muss- und Soll-Elemente der Startseite aus der Verlustliste stehen an einem logischen Ort.

## Zuerst lesen
1. `_relaunch/KERN.md` (1.0), vollständig.
2. `_relaunch/ENTSCHEIDUNGEN.md` E-016, E-019, E-021.
3. Den Prototyp `_relaunch/ausbau/richtungen/1/` (index.html, BEGRUENDUNG.md) und die Teile aus B Runde 1, die dein Paket betreffen.
4. Für deine E-IDs die Pässe in `_relaunch/atlas/paesse-start.md` bzw. `paesse-shell-recht-seo.md`: Wesenskern wörtlich, Abnahme und Bindungen.
5. Die vorhandenen Dateien deines Pakets, ihre Tests und `components/home/content.ts`.
6. Was R2 geschaffen hat: `app/styles/theme.css` (Rollen und Utilities, z. B. `bg-surface`, `text-brand`, `text-vorlauf`, `font-display`, `font-mass`, `text-etikett`), `lib/motion/` (Register, Kopfskript-Klasse `auftakt`) und `components/icons/` (Icon-Komponente).
7. `AGENTS.md`: Next.js 16; die Doku liegt in `node_modules/next/dist/docs/`.

## Regeln
- **Schreibrechte:** nur die Dateien, die dein Paket nennt, plus neue Dateien darin (Komponenten, Tests).
  - `components/home/content.ts`, `app/page.tsx`, `app/styles/*`, `app/globals.css`, `lib/content/*`, `lib/motion/*` und `components/icons/*` gehören dem Orchestrator bzw. R2.
  - Brauchst du neuen Text, lege ihn in einer eigenen Datei deines Pakets ab (`components/home/<bereich>-text.ts`), gebaut aus `FACTS`/`COMPANY`/`REGION`/Registry, nur Belegtes. Melde nötige Änderungen an gemeinsamen Dateien als OFFENE FRAGE.
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
  - Überschriftenhierarchie: genau eine `h1` auf der Seite, im Einstieg.
  - Anker-Aliase (E-START-052/E-SEO-021) bleiben erreichbar.
- **Mobil eigens komponiert** (390 zuerst), geprüft in 320 · 375 · 390 · 430 · 768 · 1440 · 1920; kein horizontaler Überlauf.
- **Tests:** Bestehende Tests deiner Dateien laufen weiter oder werden gleichwertig angepasst (Begründung im Ausgabeformular). Neue Funktionen bekommen einen Test der Kernaufgabe (Vitest, Muster `components/home/__tests__/`).

## Prüfung (Paketprüfung)
- `bun run lint`, `bun run type-check`, `bun run test`, `bun run check:design`, `bun run check:contrast`, `bun run check:client-imports`. Alle grün; Fehler in fremden Dateien nur melden.
- **Kein eigener Build und kein eigener Server.** Der Orchestrator betreibt einen gemeinsamen Entwicklungsserver auf `http://localhost:3450` mit Hot Reload. Bilder zur Selbstkontrolle:
  `node _relaunch/werkzeuge/screens.mjs --base http://localhost:3450 --label r3-<paket> --only start --vps m390,d1440 --schemes light,dark --belege alle`.
  Sieh dir die Ausschnitte deines Abschnitts an und verbessere ihn.
- Kein Git, keine schreibenden Anfragen, keine fremden Ports.
- Ausgabeformular: GEÄNDERTE DATEIEN · WAS UND WARUM (mit E-IDs) · TESTS UND ERGEBNIS · BILDBELEGE · OFFENE FRAGEN · RISIKEN.
- Endzeile: `=== ENDE <Kennung> · BEREIT ZUR RÜCKGABE ===`.
