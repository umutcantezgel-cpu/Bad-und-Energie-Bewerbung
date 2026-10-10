# R3-PERF-01 · Schriftlast senken (LCP-Rückschritt aus R2) · Rolle Baumeister (Opus) · KERN 1.1

## Anlass
R2 brachte die eigenen Schriften (`app/fonts/`, 6 woff2-Dateien, 223 864 B, 2 vorgeladen). Lighthouse mobil, Median, gegen P0:

| Seite | P0 | nach R2 | Änderung |
|---|---|---|---|
| `/` | 2,92 s | 3,36 s | +15 % |
| Stellenseite | – | – | +14 % |
| `/bewerbung` | – | – | +9,5 % |

Quelle: `_relaunch/ENTSCHEIDUNGEN.md` E-022, `_relaunch/MESSUNGEN.md`. Ziel: höchstens P0 + 10 %, besser ≤ 2,5 s, ohne das Schriftbild zu verlieren.

## Schreibrechte
- `app/fonts/**`: woff2-Dateien, `index.ts`, `LIZENZEN.md` (Vermerk „instanziert/teilgesetzt mit fontTools, OFL erlaubt Änderungen; reservierte Namen beachten“), `__tests__/`.
- Neu `_relaunch/werkzeuge/schriften/` für das Skript, das die Dateien reproduzierbar erzeugt (Eingabe: die Originaldateien aus `_relaunch/ausbau/referenz/b-runde1/fonts/` und `_relaunch/richtungen/a/fonts/`).
- Belege nach `_relaunch/belege/r3-perf-01/` (Messungen als JSON und kurze Tabelle).

## Aufgaben
1. **Bedarf feststellen:** Welche Schnitte und Achsen die Seite wirklich nutzt. Suche in `app/styles/theme.css`, `app/globals.css` und allen Komponenten nach `font-*`-Gewichten, `font-variation-settings`, `font-stretch` und `opsz`.
   - Erwartet: Bricolage nur 800 (vielleicht 700), Atkinson 400 und 700, Martian Mono 400 bei Breite 75 %.
   - Achtung: Die Startseiten-Pakete R3-HOME-01…05 bauen parallel. Lies ihren Stand am Ende noch einmal, damit kein dort genutzter Schnitt fehlt.
2. **Instanzieren und teilsetzen** mit fontTools.
   - Werkzeug: das Rad liegt unter `_relaunch/werkzeuge/fonttools-*.whl`. Installiere es in eine venv im Scratchpad, dazu `brotli` für woff2 von PyPI über den Proxy.
   - Vorgehen:
     - Variable Achsen auf die genutzten Werte festlegen oder einengen (`fontTools.varLib.instancer`).
     - `pyftsubset` mit denselben unicode-range-Bereichen wie heute in `index.ts`.
     - Nur die nötigen Layout-Features: `kern`, `liga`, `calt`, `tnum`, `lnum`, `case`, dazu `ss0x` nur, wenn die Seite sie nutzt.
     - `--no-hinting`, `--desubroutinize`, `--flavor=woff2`.
   - Ziel: gesamt deutlich unter 150 KB, die zwei vorgeladenen Dateien zusammen ≤ 60 KB.
3. **`index.ts` anpassen:**
   - `weight` passend zur Instanz.
   - Nach wie vor genau zwei Dateien vorgeladen, die Ersatzschrift mit Metrik-Ausgleich.
   - Prüfen, ob `display: 'swap'` für Display richtig bleibt oder `optional` für Martian Mono besser ist, und die Wahl begründen.
   - Kommentar mit den neuen Summen.
   - Test in `app/fonts/__tests__/` anpassen: Summe, Vorlade-Zahl, vorhandene Dateien.
4. **Messen** (A/B, sauber getrennt von der parallel laufenden Startseiten-Arbeit):
   - Lege zwei Kopien des aktuellen Commits an: `git archive HEAD | tar -x -C <scratchpad>/perf-a` (nur lesend), dasselbe für `perf-b`, dort deine neuen `app/fonts/**` hineinkopieren.
   - Je Kopie: `bun install --frozen-lockfile`, dann `EMAIL_SIMULATION=true ALLOW_DEV_SECRETS=true APP_URL=http://localhost:3450 bun run build`, dann `next start` auf :3460 (A) bzw. :3461 (B). Die Kopien nacheinander messen, nicht gleichzeitig.
   - Messung: `node _relaunch/werkzeuge/lh.mjs --base http://localhost:346x --label r3-perf-01-<a|b> --runs 5 --forms mobile --only start,stelle-anlagenmechaniker,bewerbung`.
   - Notiere Median-LCP, FCP, TBT und CLS, dazu die übertragenen Schriftbytes.
   - Server danach beenden, Kopien löschen.
5. **Sichtprüfung:** Bildschirmfotos der Startseite m390/d1440 hell aus der B-Kopie (`node _relaunch/werkzeuge/screens.mjs --base http://localhost:3461 --label r3-perf-01 --only start --vps m390,d1440 --schemes light --belege haupt`) und Vergleich mit `_relaunch/belege/r2-fundament-r2/`. Die Schrift darf sich nicht sichtbar ändern (gleiche Gewichte, gleiche Laufweite).

## Prüfung
- `bun run lint`, `bun run type-check`, `bun run test` (oder gezielt `bunx vitest run app/fonts`), `bun run check:design`.
- Kein Server auf :3450 (gehört dem Orchestrator), kein Git außer `git archive` lesend.

## Ausgabe
- Formular: GEÄNDERTE DATEIEN · WAS UND WARUM · MESSUNG (Tabelle A/B je Seite) · BILDBELEGE · OFFENE FRAGEN · RISIKEN.
- Endzeile: `=== ENDE R3-PERF-01 · BEREIT ZUR RÜCKGABE ===`.
