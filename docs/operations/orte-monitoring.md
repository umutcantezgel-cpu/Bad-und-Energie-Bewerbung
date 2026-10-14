# Ortsseiten überwachen (Search Console)

Stand: 2026-10-14 · Entscheidung E-029, ROADMAP §10.1

Die Ortsseiten unter `/einsatzgebiet/<ort>` sind zahlreich und ähnlich gebaut. Google kann solche Seiten als Massenware einstufen und dann schlechter oder gar nicht indexieren; im schlimmsten Fall leidet die ganze Domain mit den Stellenseiten. Das Gate (ROADMAP §10.1) senkt dieses Risiko vor dem Livegang. Diese Anleitung sorgt dafür, dass wir nach dem Livegang sehen, was Google daraus macht, und rechtzeitig reagieren.

**Wer:** wer die Search Console betreut (Inhaber oder Entwicklung). **Wann:** jede Woche, am besten montags. **Dauer:** etwa 15 Minuten.

## Voraussetzungen

- Domain-Property `bad-energie.de` in der Search Console, Orts-Sitemap eingereicht (`docs/inhaber/checkliste-offsite.md`, Schritt 1). Ohne Search Console gibt es keine Daten für die Regeln unten (MENSCHEN M-032).
- Die Sitemap ist nach Gruppen geteilt (Kern, Stellen, Orte, Themen). Die Adressen stehen in `https://karriere.bad-energie.de/robots.txt` in den Zeilen `Sitemap:`. In der Orts-Sitemap stehen nur Ortsseiten, die das Gate bestanden haben.
- Das Datum, an dem die Orts-Sitemap zum ersten Mal eingereicht wurde, steht im Protokoll unten. Ab diesem Tag zählen die 120 Tage.

## Wöchentliche Prüfung

1. **Seitenindexierung der Orts-Sitemap:** Search Console → Indexierung → Sitemaps → Orts-Sitemap anklicken → „Seitenindexierung ansehen“. Der Bericht zeigt nur die URLs dieser Sitemap.
2. **Zahlen notieren** (Protokoll unten):
   - eingereicht,
   - indexiert,
   - „Gecrawlt – zurzeit nicht indexiert“,
   - alle Gründe, die mit „Duplikat“ beginnen (zum Beispiel „Duplikat – Google hat eine andere Seite als der Nutzer als kanonische Seite bestimmt“),
   - „Gefunden – zurzeit nicht indexiert“ (nur zur Info, siehe unten).
3. **Anteile ausrechnen:**
   - *Nicht indexiert* = („Gecrawlt – zurzeit nicht indexiert“ + Duplikat) ÷ eingereicht.
   - *Indexiert* = indexiert ÷ eingereicht.
   „Gefunden – zurzeit nicht indexiert“ heißt nur, dass Google die Seite noch nicht abgerufen hat. Das zählt für die Stopp-Regel nicht.
4. **Leistung:** Search Console → Leistung → Suchergebnisse → Filter „Seite“ enthält `/einsatzgebiet/` → Tab „Seiten“, Zeitraum „Letzte 3 Monate“. Ortsseiten mit 0 Impressionen notieren.
5. **Stichprobe:** Eine Ortsseite aus „Gecrawlt – zurzeit nicht indexiert“ per URL-Prüfung ansehen (wann zuletzt gecrawlt, welche kanonische URL Google gewählt hat).
6. **Entscheiden** nach den Regeln unten und ins Protokoll schreiben.

## Regeln

### Stopp-Regel (mehr als 30 %)

Sind **mehr als 30 %** der eingereichten Ortsseiten „Gecrawlt – zurzeit nicht indexiert“ oder ein Duplikat, gilt sofort:

- **Keine weiteren lokalen Seiten:** kein neuer Ort, keine der 26 weiteren Orte aus B33, keine neuen Kreis- oder Themenseiten.
- **Ursache klären,** bevor etwas Neues dazukommt. Typische Ursachen: Texte zu ähnlich (gebautes HTML mit `bun run test:similarity` prüfen), zu wenig eigene Daten, Google wählt den Kreis-Hub als kanonische Seite, interne Links fehlen.
- **Gegenmaßnahmen** nur über mehr echte Daten (Einsatzdaten M-023), kürzere gemeinsame Texte oder das Zurücknehmen einzelner Orte. Das Gate wird nie gelockert, um mehr Seiten durchzulassen (G7).
- Aufgehoben ist der Stopp, wenn die Ursache geklärt und behoben ist und der Anteil wieder bei höchstens 30 % liegt; beides steht im Protokoll.

### Breiter erst ab 70 % indexiert

Neue Orte (zum Beispiel die 26 Orte aus B33, falls der Umkreis Luftlinie meint) kommen erst dazu, wenn **mindestens 70 %** der eingereichten Ortsseiten indexiert sind. Auch dann gehen sie nur über das Gate.

### 120-Tage-Regel

Eine Ortsseite, die **120 Tage** nach dem ersten Einreichen in der Orts-Sitemap **keine einzige Impression** hat, wird ausgedünnt, in zwei Schritten:

1. **`noindex,follow`:** In der Lock-Datei des Gates (`lib/places/data/indexierung.json`, erzeugt mit `bun run orte:gate`) als nicht indexierbar führen, mit dem Grund „120 Tage ohne Impressionen“ und dem Datum. Die Seite bleibt erreichbar, fällt aber aus Sitemap, IndexNow und `llms.txt`.
2. **308 in den Kreis-Hub:** Sobald die URL-Prüfung „Durch ‚noindex‘-Tag ausgeschlossen“ zeigt, bekommt der Ort in `PLACE_OVERRIDES` (`lib/places/data.ts`) `status: 'merged'` mit `statusNote` und `updatedAt`. Die Adresse leitet dann per 308 auf den Kreis-Hub; der Slug bleibt im Lock und liefert nie 404 (`orte-pflegen.md`).

Rechenbeispiel: Wird die Orts-Sitemap am 2026-10-14 eingereicht, ist die erste Prüfung nach dieser Regel am 2027-02-11. Für Orte, die später dazukommen, zählt ihr eigenes erstes Einreichen.

Gebietsseite und Kreis-Hubs fallen nicht unter die 120-Tage-Regel; sie bündeln die Orte.

## Nach jeder Änderung

- IndexNow auslösen (`betrieb.md` 2.3) und die Orts-Sitemap in der Search Console neu einreichen.
- Für zurückgenommene Seiten die URL-Prüfung einmal anstoßen, damit Google das `noindex` bzw. die 308 schnell sieht.

## Bing

Einmal im Monat in den Bing Webmaster Tools unter „Sitemaps“ und „Seiten“ nachsehen, ob die Ortsseiten ankommen. Bing ist wichtig für ChatGPT-Suche und Copilot. Die Regeln oben richten sich nach der Search Console; Bing dient als Gegenprobe.

## Protokoll

Eine Zeile je Woche. Erstes Einreichen der Orts-Sitemap: ____________

| Datum | eingereicht | indexiert | gecrawlt, nicht indexiert | Duplikat | nicht indexiert in % | Orte ohne Impressionen | Entscheidung |
|---|---|---|---|---|---|---|---|
| | | | | | | | |
