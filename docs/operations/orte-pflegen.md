# Orte pflegen (lokale Seiten unter `/einsatzgebiet`)

Die Gebietsseite `/einsatzgebiet`, die Kreis-Hubs und die Ortsseiten (E-028) entstehen vollständig aus Daten im Repo. Jede Zahl auf diesen Seiten stammt aus der Messung, aus Ableitungen (`lib/places/derive.ts`), aus `lib/content/facts.ts` oder aus den Stellen. Jede Änderung läuft als Pull Request mit Merge-Commit (nie Squash: Quellen sind auf Commits gepinnt).

## Wo was steht

| Datei | Inhalt |
|---|---|
| `lib/places/data/messung.json` | Messung: Orte, Kreise, PLZ, Koordinaten, Strecke, Fahrzeit, Luftlinie, aufgenommen ja/nein. Erzeugt von `scripts/places/measure.mjs` |
| `docs/operations/orte-messung.md` | Protokoll derselben Messung (Methode, Tabelle je Kreis). Ebenfalls vom Skript erzeugt |
| `lib/places/measurement.ts` | `MEASUREMENT_COMMIT`: Commit, der Messung und Protokoll festhält (Quelle jeder Strecke) |
| `lib/places/data.ts` | Orte aus der Messung (`definePlace`), freigegebene Kurzbeschreibungen, `PLACE_OVERRIDES` für Status und Slugs |
| `lib/places/home-map.ts` | Die 10 Orte der Startseitenkarte (zod-frei, auch im Client-Bundle der Google-Karte) |
| `lib/places/kreise.ts` | Kreise mit Namen, Slug und Kreis-Fakten (z. B. `countyPartner` im Lahn-Dill-Kreis) |
| `lib/places/text.ts` | Alle Texte der Orts-, Kreis- und Gebietsseiten |
| `lib/places/slugs.lock.json` | Jeder je veröffentlichte Slug unter `/einsatzgebiet` |
| `lib/places/__tests__/gate.test.ts` | Einzigartigkeits-Gate U1–U8 |

## Grundregeln

- **Nur Gemessenes und Belegtes.** Keine Einwohnerzahlen, keine Sehenswürdigkeiten, keine Firmenadressen je Ort. Kurzbeschreibungen nur wörtlich und freigegeben (MENSCHEN M-016).
- **Gebietsregel:** Aufgenommen wird nur, was höchstens 35 km Straße bis zum Firmensitz liegt (Fakt `radius35`). Das Schema bricht den Build sonst ab.
- **Ein Kreis bekommt eine eigene Seite ab 3 Orten** (`KREIS_HUB_MIN_PLACES`). Darunter ist er ein Abschnitt der Gebietsseite (`/einsatzgebiet#<kreis-slug>`), sein Segment leitet per 308 dorthin.
- **Gate vor jedem Merge:** `bun run test` (Textmodell) und nach dem Build `bun run test:similarity` (gebautes HTML, auch Stellen, Faktenband und Kontakt). Besteht ein Ort das Gate nicht, werden die Grenzwerte nie gelockert: Zuerst wird gemeinsamer Text gekürzt (Sätze, die auf jeder Ortsseite gleich stehen); reicht das nicht, bekommt der Ort `status: 'merged'` und geht im Kreis-Hub auf.
- **Freigabe und Livegang:** Neue oder gestrichene Orte gibt der Inhaber mit dem Merge frei (nach `main` nur mit seiner ausdrücklichen Zustimmung). Search Console beobachten: > 30 % „Gecrawlt – zurzeit nicht indexiert“ oder „Duplikat“ stoppt weitere lokale Seiten (ROADMAP §10.1).

## Neu messen

1. Kandidaten prüfen: `CANDIDATES` in `scripts/places/measure.mjs` (Gemeinden je Kreis, Wetzlarer Stadtteile).
2. Messen (≈ 3 Minuten; Nominatim erlaubt 1 Anfrage je Sekunde, OSRM ohne Schlüssel):

   ```bash
   node scripts/places/measure.mjs
   ```

   Das Skript schreibt `lib/places/data/messung.json` und `docs/operations/orte-messung.md`. Es läuft nie im Build oder zur Laufzeit; die Website ruft keine fremde API auf.
3. Ergebnis committen (eigener Commit, nur diese zwei Dateien). Den Kurz-Hash dieses Commits in `MEASUREMENT_COMMIT` in `lib/places/measurement.ts` eintragen und `PLACES_UPDATED_AT` in `lib/places/data.ts` auf das Messdatum setzen.
4. `bun run test`: Schema (Luftlinie passt zu den Koordinaten, Straße ≥ 0,95 × Luftlinie, ≤ 35 km), Registry, Gate. Ändert sich eine Zahl in einem Satz, prüft U5 ihre Quelle.
5. Startseite und `/jobs` zeigen dieselben Werte (`lib/data/locations.ts` liest `lib/places/home-map.ts`); die Tests vergleichen beides.
6. Nach dem Deploy: IndexNow auslösen (`POST /api/indexnow`) und die Sitemap in der Search Console neu einreichen. `lastModified` einer Orts-, Kreis- oder Gebietsseite ist das jüngere Datum aus dem `updatedAt` ihrer Orte und dem der jüngsten live Stelle (die Seiten listen die Stellen), nie „jetzt“.

## Ort aufnehmen

1. Gemeinde in `CANDIDATES` ergänzen (amtlicher Name), neu messen (oben). Liegt sie ≤ 35 km Straße, steht sie mit `included: true` in der Messung und hat damit eine Seite.
2. Den neuen Slug (aus dem Namen: ä → ae, ß → ss, Klammern fallen weg) in `lib/places/slugs.lock.json` eintragen. Der Test meldet jeden fehlenden Slug.
3. Das Gate läuft für alle Seitenpaare neu. Neue Nachbarn ändern auch die Texte anderer Orte; das ist gewollt (die Texte folgen den Daten).
4. Erreicht ein Kreis dadurch 3 Orte, bekommt er automatisch seinen Hub; sein Slug steht schon im Lock.

## Ort zurückhalten, zusammenlegen oder archivieren

Einträge in `PLACE_OVERRIDES` (`lib/places/data.ts`), immer mit Grund:

```ts
export const PLACE_OVERRIDES = Object.freeze({
  sinn: { status: 'merged', statusNote: 'besteht U3 nicht (Jaccard 0,46 mit Herborn)', updatedAt: '2026-11-02' },
});
```

| Status | Wirkung |
|---|---|
| `published` | eigene Seite, Sitemap, IndexNow |
| `pending` | gemessen, noch nicht freigegeben: keine Seite, keine Route (404), nicht in der Sitemap |
| `merged` | Seite entfällt, die URL leitet per 308 auf den Kreis-Hub (bzw. den Abschnitt der Gebietsseite) |
| `archived` | wie `merged`, z. B. wenn ein Ort das Gebiet verlässt |

- Orte der Startseitenkarte (`HOME_MAP_LOCATION_IDS`) nicht zurückhalten, ohne die Karte anzupassen: Der Test „home-map und Registry“ schlägt sonst an.
- Ein Slug, der schon veröffentlicht war, bleibt im Lock und liefert nie 404 (`resolveEinsatzgebietSlug` leitet um).
- Ausdünnen nach Plan: Ortsseiten ohne Impressionen nach 120 Tagen gehen im Kreis-Hub auf (`merged`).

## Ort umbenennen (Slug ändern)

```ts
export const PLACE_OVERRIDES = Object.freeze({
  'heuchelheim-an-der-lahn': { slug: 'heuchelheim', redirectFrom: ['heuchelheim-an-der-lahn'] },
});
```

- Neuer Slug in `slug`, der alte in `redirectFrom`. Beide stehen im Lock; der alte leitet per 308 auf den neuen.
- Die Orts-ID (`id`) bleibt; sie hängt an der Messung.

## Prüfen vor dem Merge

```bash
bun run test            # Schema, Registry, Gate U1–U8, Routen, JSON-LD
bun run build           # alle Seiten statisch (generateStaticParams), OG-Bilder je Ort
bun run test:graph      # ein @graph je Seite, Place ohne Straße, ItemList-URLs in der Sitemap
bun run test:claims     # keine festen Arbeitszeiten im HTML
bun run test:similarity # Ortsseiten paarweise ≤ 0,45 Jaccard am gebauten HTML (5 ähnlichste Paare)
bunx playwright test e2e/local-pages.spec.ts --project=mobile-light   # alle Orts- und Kreisseiten bei 320 px
```
