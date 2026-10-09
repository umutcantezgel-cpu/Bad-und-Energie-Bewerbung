# R2-FUND-01 · Fundament des Gestaltungssystems · Rolle Baumeister (Opus, Stufe 3) · KERN 1.0
**Exklusives Paket (E-021):** Während es läuft, fasst kein anderes Paket diese Dateien an.

## Ziel
Die Plattform bekommt das Gestaltungssystem aus KERN 1.0, damit alle 12 Seiten sofort Farben, Schriften, Raster, Formen und Bewegungsgrundlagen der freigegebenen Richtung tragen (`_relaunch/ausbau/richtungen/1/`). Die Komponenten nutzen weiter die semantischen Utilities; ihr Umbau folgt in den Wellen R3–R5.

## Zuerst lesen
1. `_relaunch/KERN.md`, vollständig; besonders K-004, K-005…K-010 und K-013.
2. `_relaunch/ENTSCHEIDUNGEN.md`: E-013, E-016, E-021.
3. `_relaunch/ausbau/richtungen/1/index.html` und `BEGRUENDUNG.md` §8–§10. Daraus stammen Tokens, Farben hell/dunkel/Druck, Skalen und Bewegungstokens.
4. Plattform: `app/styles/theme.css`, `app/globals.css`, `app/layout.tsx`, `lib/tokens/index.ts`, `lib/utils/cn.ts`, `scripts/qa/check-design-tokens.mjs`, `scripts/qa/check-contrast.mjs`, `components/brand/Logo.tsx`, `next.config.ts`, `docs/ROADMAP.md` §4, `AGENTS.md`.
   - Next 16: Lies vor Änderungen an `next/font` bzw. `app/layout.tsx` den passenden Leitfaden unter `node_modules/next/dist/docs/`.

## Schreibrechte (exklusiv)
- `app/styles/theme.css`, `app/globals.css`, `app/layout.tsx`.
- `app/fonts/**` (neu).
- `lib/tokens/index.ts`, `lib/utils/cn.ts`.
- `lib/motion/**` (neu, mit Tests unter `lib/motion/__tests__/`).
- `scripts/qa/check-design-tokens.mjs`, `scripts/qa/check-contrast.mjs`, dazu Tests unter `scripts/qa/__tests__/`.
- `components/icons/**` (neu, mit Tests).
- `components/brand/Logo.tsx`.
- `next.config.ts`, nur die CSP-Zeile.
- `docs/ROADMAP.md`, nur §4: Hinweis „abgelöst durch KERN 1.0, siehe _relaunch/KERN.md“, dazu die tatsächlichen Werte.

## Aufgaben
1. **Farben** (`theme.css`):
   - Primitive aus E-016 und Variante 1: Papier, Wand, Wärme, Tinte, Navy, Tinte 2, Rot, Rot-Hover, Rot-Druck, Blau, dunkle Gegenstücke, Erfolg und Fehler.
   - Die **vorhandenen Rollennamen bleiben** (`surface`, `surface-2`, `surface-3`, `surface-raised`, `ink`, `ink-muted`, `line`, `line-strong`, `accent`, `accent-hover`, `on-accent`, `focus`, `success*`, `danger*`). Sie zeigen auf die neuen Werte, hell, dunkel, Inverse-Band und Druck.
   - Neue Rollen: `brand` (Navy für Überschriften und Maße), `vorlauf`, `ruecklauf`, `waerme`, `wand`, `ink-2`, `accent-press`. Jeweils als `@theme inline`-Utility und in `cn.ts` registriert.
   - `check-contrast.mjs` um die neuen Paare ergänzen (hell, dunkel, inverse). Alle bestehen AA: Text ≥ 4,5, Grafik und Bedienelemente ≥ 3.
2. **Schriften:**
   - Über `next/font/local` aus `app/fonts/`:
     - Bricolage Grotesque: `_relaunch/ausbau/referenz/b-runde1/fonts/bricolage-*.woff2`.
     - Atkinson Hyperlegible Next: dort `atkinson-*.woff2`.
     - Martian Mono: `_relaunch/richtungen/a/fonts/martian-mono-*.woff2`.
   - latin und latin-ext mit `unicode-range`, ≤ 250 KB gesamt. Höchstens zwei Dateien vorgeladen (Display-latin und Text-latin). Ersatzschrift mit `adjustFontFallback`/Metrik-Overrides.
   - Lizenzen in `app/fonts/LIZENZEN.md` (OFL, Quellen aus den LIZENZEN.md der Prototypen).
   - Variablen `--font-display`, `--font-sans` (Atkinson) und `--font-mass` (Martian Mono). Inter und `next/font/google` entfallen.
   - Die Typo-Skala (`text-display`, `text-numeral`, `title-*`, `lead`, `body`, `callout`, `footnote`) auf die Werte aus Variante 1 bringen: höchstens 10 Stufen, `clamp` mit rem-Anteil. Display = Bricolage 800 mit −0,01 em; `numeral` = Martian Mono, tabellarisch.
3. **Raster, Abstände, Radien, Schatten** nach K-007/K-008: Abstandsskala 11 Stufen; Radien 4 · 12 · 24 · 999; ein Schatten; `--paar` 12 px; `--m-strich` 3 px.
4. **Semantische Utilities statt verbotener Klassen:**
   - `font-mass` (Maße) und `text-etikett` (Versalien +0,06 em, Mono-Etikett) als `@utility`.
   - Der Guard bleibt streng (G7: erweitern, nie lockern). Er verbietet weiter `font-mono`, `uppercase`, `text-[…]` usw. und kennt die neuen Utilities.
   - Neu im Guard: Prüfung, dass jedes Element mit `animate`/`transition`-Utility … ist zu breit. Stattdessen: Registerprüfung für `data-motion`-Kennungen gegen eine Liste in `lib/motion/register.ts`.
5. **Bewegung** (`lib/motion/`, E-013):
   - Dauer- und Kurven-Tokens (`--d-1…4`, Takt 80 ms, `--k-aus`, `--k-wechsel`, `--k-ein`) in `theme.css` und gespiegelt in `lib/tokens/index.ts`.
   - `register.ts`: alle Kennungen aus KERN K-009 mit Zweck und reduzierter Fassung.
   - `prefers.ts`: reduzierte Bewegung, hover und pointer.
   - Kopfskript (`head-script.ts`, als Zeichenkette exportiert, ≤ 1 KB). Es setzt die Klasse `auftakt` auf `<html>` nur ohne reduzierte Bewegung und entfernt sie nach 2 s als Sicherheitsnetz. Eingebunden in `app/layout.tsx` vor dem ersten Rendern. CSP: `script-src` hat derzeit `'unsafe-inline'` (Report-Only); trotzdem den sha256-Hash des Skripts in `next.config.ts` ergänzen.
   - Globale Regeln in `globals.css`:
     - `@media (prefers-reduced-motion: reduce)` setzt alles auf Endzustand.
     - `:focus-visible` mit 3 px outline und 3 px offset in `focus`.
     - `scroll-padding-top` für Kopf und StickyApplyBar.
     - `-webkit-tap-highlight-color: transparent` mit eigenen `:active`-Zuständen.
     - Dokumenthintergrund = Papier, `theme-color` hell/dunkel = Papier/Nacht in `app/layout.tsx`.
     - `::selection` in Wärme/Navy.
   - Vitest-Tests für `register.ts` und `prefers.ts`.
6. **Icons** (`components/icons/`):
   - `Icon.tsx` (`name`, `size`, `title?` → `role="img"` + `<title>`, sonst `aria-hidden`) und `glyphs.tsx` im Formsystem: 24 × 24, Rand 2, eine Strichstärke über `vector-effect: non-scaling-stroke`, runde Enden, `currentColor`.
   - Glyphen:
     - Die 8 Familien-Icons aus B/V1: Wärmepumpe, Tropfen, Flamme, Werkzeug, Servicefahrzeug, Uhr, Standort, Nachricht.
     - Gleichwertige Glyphen für alle heute genutzten lucide-Icons: `grep -rhoE "from 'lucide-react'" components app`. Nämlich ArrowDown/Left/Right/Up, Camera, Check, ChevronDown/Left/Right, CircleAlert, CircleCheck, EyeOff, FileText, Mail, Map, Menu, MessageCircle (WhatsApp-Sprechblase ohne Fremdlogo), Phone, Plus, Printer, RotateCcw, RotateCw, ShieldCheck, Trash, UserPlus, X.
   - Test: jeder Name rendert, `aria-hidden` bzw. `title` korrekt.
   - Die Importe in den Komponenten tauschen die Wellen R3–R5, nicht dieses Paket.
7. **Logo (G8):** Datei unverändert. Im dunklen Thema und im Inverse-Band steht das **Original auf einer hellen Plakette** (Papier, Radius 4, Innenabstand), ohne `brightness`/`invert`-Filter. Der Kommentar nennt den Grund (G8, KERN K-006).

## Prüfung (Paketprüfung, alles muss grün sein)
- `bun run lint`, `bun run type-check`, `bun run test` (alle bestehenden 927+ Tests grün; angepasste Tests nur, wo sie alte Farbwerte, Inter oder Logo-Filter festschreiben, mit Begründung im Ausgabeformular).
- `bun run check:design`, `bun run check:contrast`, `bun run check:client-imports`.
- Build mit CI-Umgebung: `EMAIL_SIMULATION=true ALLOW_DEV_SECRETS=true APP_URL=http://localhost:3400 bun run build`. Achtung: `:3500` (Ausgangsstand) läuft aus `.next` – baue deshalb mit `NEXT_DIST_DIR`, falls vorhanden, oder in eine Kopie. **Bevorzugt:** Prüfe nur `bun run type-check` und den Build in einem eigenen Ordner über `next build` mit `distDir` per Umgebungsvariable, wenn `next.config.ts` das hergibt. Sonst den Build überspringen und melden; der Orchestrator baut nach Wellenschluss.
- Bildschirmfotos zur Selbstkontrolle mit `node _relaunch/werkzeuge/screens.mjs --base http://localhost:<eigener Port> --label r2-fundament --vps m390,d1440 --schemes light,dark --belege haupt`.
  - Eigener Server: `PORT=3450 EMAIL_SIMULATION=true ALLOW_DEV_SECRETS=true APP_URL=http://localhost:3450 bunx next dev -p 3450`.
  - Am Ende beenden.

## Grenzen
- Nur die oben genannten Dateien. Nie `supabase/**`, `lib/supabase/**`, `lib/uploads/**`, `app/admin/**`.
- Kein Git. Keine Rechts- oder Fließtexte ändern. Logo-Datei unverändert.
- Ausgabeformular: GEÄNDERTE DATEIEN · WAS UND WARUM · TESTS UND ERGEBNIS · BILDBELEGE · OFFENE FRAGEN · RISIKEN.
- Endzeile: `=== ENDE R2-FUND-01 · BEREIT ZUR RÜCKGABE ===`.
