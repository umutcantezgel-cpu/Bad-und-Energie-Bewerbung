# Bus und Bahn für die Ortsseiten (ÖPNV-Daten)

Stand: 2026-10-14 (Vorwarnung und Indexierung nach der Prüfung E-029) · Entscheidung E-029 (Indexierung per Gate), ROADMAP §10.1

Jede Ortsseite unter `/einsatzgebiet/<ort>` zeigt neben Strecke und Fahrzeit mit dem Auto (`orte-messung.md`) zwei Datenklassen aus dem Nahverkehr:

- **`oepnv`:** Haltestellen im Ort mit Fußweg, Linien, Umstiege und die späteste Verbindung mit Ankunft bis 7:30 Uhr an einem Werktag am Firmensitz (Siegmund-Hiepe-Str. 20, alle Haltestellen bis 600 m), dazu die Verbindungen mit Ankunft zwischen 6 und 8 Uhr.
- **`berufsschule`:** derselbe Weg zur zuständigen Berufsschule für Anlagenmechaniker SHK, Ankunft bis 7:45 Uhr.

Mit diesen beiden Klassen erfüllen die Ortsseiten die Bedingungen I2 (mindestens zwei Datenklassen mit Quelle) und I3 (mindestens 60 Wörter und 30 % des Ortstexts aus Daten) des Gates. Gibt es für einen Ort keine brauchbare Verbindung, ist genau das die Information („kein Bus vor 7:30, Auto nötig“); die Klasse zählt trotzdem, weil sie belegt ist.

Dieses Dokument beschreibt Quelle, Lizenz, Erzeugung und die jährliche Neuberechnung. Wie Orte aufgenommen, umbenannt oder zusammengelegt werden, steht in `orte-pflegen.md`; die Überwachung in der Search Console in `orte-monitoring.md`.

## Quelle

| Angabe | Wert |
|---|---|
| Datensätze | gtfs.de „Deutschland Nahverkehr“ (frei, Feed `latest-nv-free`: Bus, Tram) und „Deutschland Regionalverkehr“ (frei, Feed `latest-rv-free`: RB, RE, S-Bahn) |
| Herausgeber laut `feed_info.txt` | „gtfs.de - GTFS für Deutschland, Daten bereitgestellt von DELFI e.V.“ |
| Mitwirkende laut `attributions.txt` | DELFI e.V. (Erzeuger), GTFS.de (Erzeuger), OpenStreetMap contributors |
| Lizenz | Creative Commons Namensnennung 4.0 International (CC BY 4.0) |
| Erste Dateien | `de_nv.zip` (278 MB) und `de_rv.zip` (11 MB), Stand 10.10.2026, heruntergeladen am 2026-10-14 |
| Gültigkeit der ersten Dateien | 10.10.2026 bis 09.11.2026 (laut `calendar.txt` und `calendar_dates.txt`) |
| Werktag der ersten Rechnung | Dienstag, 27.10.2026 (nach den Herbstferien, kein Feiertag) |
| Fußwege | OSRM, Profil Fuß, auf OpenStreetMap-Daten (`routing.openstreetmap.de`, FOSSGIS e.V.; Daten ODbL) |
| Format | GTFS (`stops.txt`, `routes.txt`, `trips.txt`, `stop_times.txt`, `calendar*.txt`) |

Der Nahverkehrs-Feed allein enthält keine Züge; ohne den Regionalverkehr fehlten Lahntalbahn, Dillstrecke und Main-Weser-Bahn. Fernverkehr (IC, ICE) bleibt außen vor.

Die freien Datensätze reichen nur etwa vier Wochen in die Zukunft. Jede Neuberechnung braucht deshalb frische Dateien.

Berufsverkehr und Fahrzeiten aus Google Routes werden **nicht** verwendet: Laut Nutzungsbedingungen dürfen diese Werte nicht dauerhaft gespeichert werden. Echtzeitdaten, Verspätungen und Ticketpreise zeigen die Ortsseiten ebenfalls nicht.

## Lizenz und Namensnennung

CC BY 4.0 verlangt drei Dinge: den Namen der Urheber, einen Hinweis auf die Lizenz mit Link und einen Hinweis, dass die Daten verändert wurden.

- **Wortlaut unter jeder ÖPNV-Angabe auf der Seite:** „© gtfs.de, CC BY 4.0, Datenbasis DELFI e.V. und OpenStreetMap-Mitwirkende“, mit Link auf die Lizenz (`https://creativecommons.org/licenses/by/4.0/deed.de`) und dem Hinweis auf die Bearbeitung.
- In `lib/places/data/oepnv.json` stehen diese Angaben unter `quelle` (`namensnennung`, `bearbeitung`, `lizenz`, `lizenzUrl`, `stand`). Die Seite liest sie von dort; niemand tippt den Wortlaut von Hand.
- OpenStreetMap ist mitgenannt, weil `attributions.txt` es nennt und die Fußwege aus OpenStreetMap-Daten stammen.
- Eine Nennung im Impressum ist möglich, ändert aber einen Rechtstext und läuft dann über `datenschutz-aenderungen.md`. Pflicht ist die Nennung an der Angabe selbst.

## Berufsschule

- Zuständig ist die Schule, die die Hessische Fachklassenverordnung (GVBl. 2026 Nr. 21, Anlage 2) zusammen mit der Schulbezirkssatzung des Lahn-Dill-Kreises für Anlagenmechaniker SHK nennt. Maßgebend ist der Ausbildungsort, nicht der Wohnort. Wetzlar gehört zum Schulbezirk II, laut Prüfung vom 14.10.2026 ist das also die **Werner-von-Siemens-Schule Wetzlar** (Dammstraße 62) für Grund- und Fachstufe, für alle 54 Wohnorte dieselbe.
- Die Gewerblichen Schulen Dillenburg gelten für Betriebe im Schulbezirk I. Als regionales Berufsschulzentrum würden sie erst nach einer Allgemeinverfügung des Ministeriums zuständig (§ 4 FachklV); für 2026/2027 ist keine bekannt.
- Herleitung mit Fundstellen in `lib/places/data/berufsschule.json` und `scripts/places/README.md`.
- Die Seite schreibt „zuständig laut Verordnung“ und nennt die Quelle. Bestätigt der Inhaber die Schule seiner Azubis (MENSCHEN M-024), wird daraus „bestätigt“.
- Ziel der Berechnung sind die Haltestellen bis 600 m um die Schule. Der Unterrichtsbeginn ist nicht belegt; angesetzt ist die Ankunft bis 7:45 Uhr.

## Erzeugung

Die Daten entstehen offline auf einem Entwicklerrechner. Weder Build noch Website rufen gtfs.de auf.

1. **Dateien laden:** Auf https://gtfs.de die Datensätze „Deutschland Nahverkehr“ und „Deutschland Regionalverkehr“ (beide frei) herunterladen und **außerhalb des Repos** ablegen, je in einem eigenen leeren Ordner (zusammen rund 290 MB; sie gehören nie in einen Commit).
2. **Stichtag wählen:** ein Werktag von Dienstag bis Donnerstag in der Gültigkeit der Dateien, ohne Feiertag und außerhalb der hessischen Schulferien (Termine auf kultus.hessen.de). In den Ferien fehlen Schulbusse, die Ergebnisse wären zu schlecht.
3. **Rechnen:** `node scripts/places/oepnv.mjs --gtfs <ordner-nv>/de_nv.zip --gtfs <ordner-rv>/de_rv.zip --datum <stichtag> --stand <datum der dateien> --cache <ordner>` (Aufruf, Laufzeit und alle Regeln im Protokoll `scripts/places/README.md`). Das Skript
   - filtert die Haltestellen auf das Rechteck ± 50 km um den Firmensitz (35-km-Gebiet plus Rand) und die Fahrten auf den Stichtag,
   - nimmt je Ort die Haltestellen um den Messpunkt (aus `lib/places/data/messung.json`) und misst die Fußwege über das Wegenetz,
   - rechnet mit einem eigenen RAPTOR-Verfahren die späteste Verbindung mit Ankunft bis 7:30 Uhr am Betrieb bzw. 7:45 Uhr an der Berufsschule, mit Linien und Umstiegen, und die Verbindungen mit Ankunft zwischen 6 und 8 Uhr,
   - schreibt `lib/places/data/oepnv.json` mit `quelle` (Namensnennung, Lizenz, Stand), `fahrplanperiode`, `werktag` und `methode`.
4. **Gate neu rechnen:** `bun run orte:gate` schreibt `lib/places/data/indexierung.json`. Den Diff lesen: Welche Orte wechseln auf `noindex` und warum?
5. **Gegenprobe:** `node scripts/places/oepnv-gegenprobe.mjs` vergleicht eine Stichprobe von 14 Orten mit Transitous (zweite Auskunft auf DELFI-Daten) und schreibt `lib/places/data/oepnv-gegenprobe.json`. Jede Abweichung braucht einen geprüften Hinweis; `oepnv.test.ts` hält Datei und Gegenprobe zusammen. Weicht etwas unerklärt ab, erst die Ursache klären (Ferienfahrten, falscher Messpunkt, Fehler in der Datei), dann committen.
6. **Prüfen:**

   ```bash
   bun run test            # Schema, Gate, Lock-Datei
   bun run build
   bun run test:graph      # u. a. „noindex steht nicht in der Sitemap“
   bun run test:similarity # gebautes HTML, Grenze aus Gate I4
   ```

7. **Committen:** nur `lib/places/data/oepnv.json`, `lib/places/data/oepnv-gegenprobe.json` und `lib/places/data/indexierung.json`, mit Stichtag und Datei-Datum in der Nachricht. Merge per Merge-Commit, nie Squash (Quellen sind auf Commits gepinnt, siehe `orte-pflegen.md`).

Das Gate wird für eine bessere Quote nie gelockert. Fällt ein Ort durch, bekommt er `noindex,follow`, und der Grund steht im Bericht des Gates.

## Neuberechnung zum Fahrplanwechsel im Dezember

Der Fahrplan wechselt jedes Jahr am zweiten Sonntag im Dezember: am **13.12.2026**, danach am **12.12.2027**. Mit dem Wechsel gelten neue Linien, Zeiten und Takte. Das Gate prüft in I5, ob die Daten zur laufenden Fahrplanperiode gehören. Rechnet niemand neu, fallen ab dem Wechsel alle Ortsseiten mit altem Stand durch und bekommen `noindex,follow`; die Kreis-Hubs bleiben indexiert, blenden aber ihren Abschnitt „Mit Bus und Bahn“ samt Quellenzeile aus (`fahrplanAktuell` in `lib/places/datenklassen.ts`), damit kein abgelaufener Fahrplan auf einer indexierten Seite steht.

Vorwarnung (wie bei den Stellen, Prüfung E-029):

- **Issue:** `.github/workflows/fahrplan-frische.yml` prüft täglich `lib/places/frische.ts` und hält ab 28 Tagen vor `FAHRPLAN_STAND.gueltigBis` genau ein Issue „Fahrplan-Frische: Bus und Bahn der Ortsseiten neu rechnen“ offen, mit Datum, Zahl der betroffenen Ortsseiten und den Schritten unten. Nach dem Merge der neuen Daten schließt es sich selbst.
- **CI:** `lib/places/__tests__/frische.test.ts` schlägt 14 Tage vor dem Ende fehl (echte Uhr). Für 2026 also ab dem 28.11.2026; bis dahin sollten die Dateien mit dem neuen Fahrplan da sein.

Ablauf:

1. **Erinnerung:** kommt automatisch als Issue (28 Tage vorher, siehe oben); die CI wird 14 Tage vorher rot.
2. **Frische Dateien:** Weil die freien Datensätze nur etwa vier Wochen vorausreichen, enthalten sie den neuen Fahrplan erst ab etwa Mitte bis Ende November. Beide Dateien frühestens dann laden und in `calendar.txt` prüfen, ob sie über den 13.12. hinausreichen.
3. **Stichtag im neuen Fahrplan:** ein Schultag kurz nach dem Wechsel und vor den Weihnachtsferien.
4. **Rechnen und prüfen** wie unter „Erzeugung“, Schritte 3 bis 7.
5. **Merge vor dem Wechsel:** Der neue Stand soll am Tag des Wechsels online sein. Gelingt das nicht, gehen betroffene Orte vorübergehend auf `noindex,follow`; das ist gewollt und wird mit dem nächsten Merge aufgehoben.
6. Nach dem Deploy: Sitemaps in der Search Console neu einreichen und IndexNow auslösen (`stellenboersen.md` d), `betrieb.md` 2.3).

Unterjährige Fahrplanänderungen (zum Beispiel neue Buslinien im Sommer) sind kein Pflichttermin. Fallen sie auf, gilt derselbe Ablauf.

### Indexierung nach dem Fahrplanwechsel

Fallen die Ortsseiten am Wechsel aus der Sitemap, merkt das `scripts/seo/benachrichtigen.mjs` (Workflow `indexierung.yml`): In der Gruppe Orte fehlen auf einmal mehr als die Hälfte der bekannten URLs. Der Lauf holt diese Seiten dann einzeln. Antworten sie mit `noindex` (Gate I5), 404/410 oder einer Weiterleitung, ist das eine echte Änderung: IndexNow bekommt die URLs, der Stand rückt vor, der Lauf bleibt grün. Die Stellen gehen in jedem Fall unabhängig davon an Google.

Bleibt die Gruppe trotzdem gesperrt (Log „Gesperrt: Orte: … weiter indexierbar“, Exit 1), sind die Seiten noch indexierbar und fehlen nur in der Sitemap: Erst `/sitemap/orte.xml` und eine Ortsseite prüfen. Ist der Zustand gewollt und richtig, gibt es zwei Wege zurück:

1. **Abwarten:** Sobald die Seiten `noindex` tragen oder wieder in der Sitemap stehen, läuft der nächste tägliche Lauf grün durch.
2. **Stand zurücksetzen:** In GitHub unter Actions → Caches die Einträge `indexierung-stand-…` löschen (`gh cache delete --all` im Repo, oder nur die jüngsten). Der nächste Lauf kennt dann keinen alten Stand, meldet einmal alles als neu (Google: alle Stellen `URL_UPDATED`, IndexNow: alle URLs der Sitemap) und schreibt einen frischen Stand. Danach zählen nur noch echte Änderungen.

## Wo was steht

| Datei | Inhalt |
|---|---|
| `scripts/places/oepnv.mjs` | Filter und Routing (offline), dazu `gtfs.mjs`, `raptor.mjs`, `fusswege.mjs` |
| `scripts/places/README.md` | Protokoll: Befehl, Werktag, Regeln, Gegenprobe, Grenzen |
| `lib/places/data/oepnv.json` | Ergebnis je Ort mit `quelle`, `fahrplanperiode`, `werktag`, `methode` |
| `lib/places/data/oepnv-gegenprobe.json` | Stichprobe gegen Transitous mit begründeten Abweichungen |
| `lib/places/data/berufsschule.json` | zuständige Berufsschule mit Fundstellen, Status `laut-verordnung` |
| `lib/places/schema.ts` | Schema der Datenklassen |
| `lib/places/qualitaet.ts` | Gate I1–I6 |
| `lib/places/data/indexierung.json` | Lock-Datei: welcher Ort indexiert wird, mit Grund |
| `lib/places/frische.ts`, `.github/workflows/fahrplan-frische.yml` | Vorwarnung vor dem Ende der Fahrplandaten (Issue 28 Tage, CI 14 Tage vorher) |
| `scripts/seo/benachrichtigen.mjs` | Meldungen an Google und IndexNow; Prüfung je Sitemap-Gruppe |
| `docs/operations/orte-monitoring.md` | wöchentliche Prüfung in der Search Console |
