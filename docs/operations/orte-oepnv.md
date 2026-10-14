# Bus und Bahn für die Ortsseiten (ÖPNV-Daten)

Stand: 2026-10-14 · Entscheidung E-029 (Indexierung per Gate), ROADMAP §10.1

Jede Ortsseite unter `/einsatzgebiet/<ort>` zeigt neben Strecke und Fahrzeit mit dem Auto (`orte-messung.md`) zwei Datenklassen aus dem Nahverkehr:

- **`oepnv`:** Haltestelle im Ort, Linien, Umstiege, früheste Ankunft bis 7:30 Uhr an einem Werktag in Wetzlar (Haltestelle nächst zum Firmensitz Siegmund-Hiepe-Str. 20) und der Takt am Morgen.
- **`berufsschule`:** derselbe Weg zur zuständigen Berufsschule für Anlagenmechaniker SHK.

Mit diesen beiden Klassen erfüllen die Ortsseiten die Bedingungen I2 (mindestens zwei Datenklassen mit Quelle) und I3 (mindestens 60 Wörter und 30 % des Ortstexts aus Daten) des Gates. Gibt es für einen Ort keine brauchbare Verbindung, ist genau das die Information („kein Bus vor 7:30, Auto nötig“); die Klasse zählt trotzdem, weil sie belegt ist.

Dieses Dokument beschreibt Quelle, Lizenz, Erzeugung und die jährliche Neuberechnung. Wie Orte aufgenommen, umbenannt oder zusammengelegt werden, steht in `orte-pflegen.md`; die Überwachung in der Search Console in `orte-monitoring.md`.

## Quelle

| Angabe | Wert |
|---|---|
| Datensatz | gtfs.de „Deutschland Nahverkehr“ (frei), Feed-Version `latest-nv-free` |
| Herausgeber laut `feed_info.txt` | „gtfs.de - GTFS für Deutschland, Daten bereitgestellt von DELFI e.V.“ |
| Mitwirkende laut `attributions.txt` | DELFI e.V. (Erzeuger), GTFS.de (Erzeuger), OpenStreetMap contributors |
| Lizenz | Creative Commons Namensnennung 4.0 International (CC BY 4.0) |
| Erste Datei | `de_nv.zip`, 278 MB, heruntergeladen am 2026-10-14 |
| Gültigkeit der ersten Datei | 10.10.2026 bis 09.11.2026 (laut `calendar.txt` und `calendar_dates.txt`) |
| Format | GTFS (`stops.txt`, `routes.txt`, `trips.txt`, `stop_times.txt`, `calendar*.txt`) |

Der freie Datensatz reicht nur etwa vier Wochen in die Zukunft. Jede Neuberechnung braucht deshalb eine frische Datei.

Berufsverkehr und Fahrzeiten aus Google Routes werden **nicht** verwendet: Laut Nutzungsbedingungen dürfen diese Werte nicht dauerhaft gespeichert werden. Echtzeitdaten, Verspätungen und Ticketpreise zeigen die Ortsseiten ebenfalls nicht.

## Lizenz und Namensnennung

CC BY 4.0 verlangt drei Dinge: den Namen der Urheber, einen Hinweis auf die Lizenz mit Link und einen Hinweis, dass die Daten verändert wurden.

- **Wortlaut unter jeder ÖPNV-Angabe auf der Seite:** „© gtfs.de, CC BY 4.0, Datenbasis DELFI e.V.“, mit Link auf die Lizenz (`https://creativecommons.org/licenses/by/4.0/deed.de`) und dem Zusatz „gefiltert und ausgewertet“.
- In `lib/places/data/oepnv.json` stehen dieselben Angaben in den Feldern `quelle`, `stand` und `lizenz`. Die Seite liest sie von dort; niemand tippt den Wortlaut von Hand.
- `attributions.txt` nennt zusätzlich „OpenStreetMap contributors“. Ob OpenStreetMap neben gtfs.de und DELFI eigens genannt werden muss, ist vor dem Release zu prüfen; im Zweifel wird es mitgenannt.
- Eine Nennung im Impressum ist möglich, ändert aber einen Rechtstext und läuft dann über `datenschutz-aenderungen.md`. Pflicht ist die Nennung an der Angabe selbst.

## Berufsschule

- Zuständig ist die Schule, die die Hessische Verordnung (GVBl. 2026 Nr. 21, Anlage 2) zusammen mit der Schulbezirkssatzung für Anlagenmechaniker SHK aus dem Lahn-Dill-Kreis nennt. Laut Recherche vom 14.10.2026 sind das die Gewerblichen Schulen des Lahn-Dill-Kreises in Dillenburg.
- Die Seite schreibt „zuständig laut Verordnung“ und nennt die Quelle. Bestätigt der Inhaber die Schule seiner Azubis (MENSCHEN M-024), wird daraus „bestätigt“.
- Ziel der Berechnung ist die Haltestelle nächst zur Schule; Ankunft bis 7:30 Uhr an einem Schultag.

## Erzeugung

Die Daten entstehen offline auf einem Entwicklerrechner. Weder Build noch Website rufen gtfs.de auf.

1. **Datei laden:** Auf https://gtfs.de den Datensatz „Deutschland Nahverkehr“ (frei) herunterladen und **außerhalb des Repos** ablegen (die Datei ist rund 280 MB groß und gehört nie in einen Commit).
2. **Stichtag wählen:** ein Werktag von Dienstag bis Donnerstag in der Gültigkeit der Datei, ohne Feiertag und außerhalb der hessischen Schulferien (Termine auf kultus.hessen.de). In den Ferien fehlen Schulbusse, die Ergebnisse wären zu schlecht.
3. **Rechnen:** `node scripts/places/oepnv.mjs` mit dem Pfad zur ZIP-Datei und dem Stichtag (Aufruf und Optionen stehen im Kopf des Skripts). Das Skript
   - filtert die Haltestellen auf das Rechteck um das 35-km-Gebiet plus Rand und die Fahrten auf den Stichtag,
   - sucht je Ort die Haltestelle im Ort (Messpunkt aus `lib/places/data/messung.json`),
   - rechnet mit einem eigenen RAPTOR-Verfahren die früheste Ankunft bis 7:30 Uhr in Wetzlar und an der Berufsschule, mit Linien, Umstiegen und Takt,
   - schreibt `lib/places/data/oepnv.json` mit `quelle`, `stand` (Stichtag und Datum der Datei) und `lizenz`.
4. **Gate neu rechnen:** `bun run orte:gate` schreibt `lib/places/data/indexierung.json`. Den Diff lesen: Welche Orte wechseln auf `noindex` und warum?
5. **Stichprobe gegen die Fahrplanauskunft:** Für drei Orte (ein naher, ein ferner, einer ohne Bahn) Ankunft, Linien und Umstiege mit der Auskunft des RMV oder der Bahn am Stichtag vergleichen. Weicht etwas ab, erst die Ursache klären (Ferienfahrten, falscher Messpunkt, Fehler in der Datei), dann committen.
6. **Prüfen:**

   ```bash
   bun run test            # Schema, Gate, Lock-Datei
   bun run build
   bun run test:graph      # u. a. „noindex steht nicht in der Sitemap“
   bun run test:similarity # gebautes HTML, Grenze aus Gate I4
   ```

7. **Committen:** nur `lib/places/data/oepnv.json` und `lib/places/data/indexierung.json`, mit Stichtag und Datei-Datum in der Nachricht. Merge per Merge-Commit, nie Squash (Quellen sind auf Commits gepinnt, siehe `orte-pflegen.md`).

Das Gate wird für eine bessere Quote nie gelockert. Fällt ein Ort durch, bekommt er `noindex,follow`, und der Grund steht im Bericht des Gates.

## Neuberechnung zum Fahrplanwechsel im Dezember

Der Fahrplan wechselt jedes Jahr am zweiten Sonntag im Dezember: am **13.12.2026**, danach am **12.12.2027**. Mit dem Wechsel gelten neue Linien, Zeiten und Takte. Das Gate prüft in I5, ob die Daten zur laufenden Fahrplanperiode gehören. Rechnet niemand neu, fallen ab dem Wechsel alle Ortsseiten mit altem Stand durch und bekommen `noindex,follow`.

Ablauf:

1. **Erinnerung:** Am 1. Dezember prüfen, ob die Neuberechnung geplant ist.
2. **Frische Datei:** Weil der freie Datensatz nur etwa vier Wochen vorausreicht, enthält er den neuen Fahrplan erst ab etwa Mitte bis Ende November. Datei frühestens dann laden und in `calendar.txt` prüfen, ob sie über den 13.12. hinausreicht.
3. **Stichtag im neuen Fahrplan:** ein Schultag kurz nach dem Wechsel und vor den Weihnachtsferien.
4. **Rechnen und prüfen** wie unter „Erzeugung“, Schritte 3 bis 7.
5. **Merge vor dem Wechsel:** Der neue Stand soll am Tag des Wechsels online sein. Gelingt das nicht, gehen betroffene Orte vorübergehend auf `noindex,follow`; das ist gewollt und wird mit dem nächsten Merge aufgehoben.
6. Nach dem Deploy: Sitemaps in der Search Console neu einreichen und IndexNow auslösen (`stellenboersen.md` d), `betrieb.md` 2.3).

Unterjährige Fahrplanänderungen (zum Beispiel neue Buslinien im Sommer) sind kein Pflichttermin. Fallen sie auf, gilt derselbe Ablauf.

## Wo was steht

| Datei | Inhalt |
|---|---|
| `scripts/places/oepnv.mjs` | Filter und Routing (offline) |
| `lib/places/data/oepnv.json` | Ergebnis je Ort mit `quelle`, `stand`, `lizenz` |
| `lib/places/schema.ts` | Schema der Datenklassen |
| `lib/places/qualitaet.ts` | Gate I1–I6 |
| `lib/places/data/indexierung.json` | Lock-Datei: welcher Ort indexiert wird, mit Grund |
| `docs/operations/orte-monitoring.md` | wöchentliche Prüfung in der Search Console |
