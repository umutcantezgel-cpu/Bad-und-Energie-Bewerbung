# scripts/places

Offline-Skripte für die Ortsseiten unter `/einsatzgebiet`. Sie laufen nur von Hand, nie im Build oder zur Laufzeit. Ihre Ergebnisse werden committet und von `lib/places/*` gelesen.

| Skript | Ergebnis | Protokoll |
|---|---|---|
| `measure.mjs` | `lib/places/data/messung.json` (Orte, Kreise, Strecke und Fahrzeit mit dem Auto) | `docs/operations/orte-messung.md` |
| `oepnv.mjs` (mit `gtfs.mjs`, `raptor.mjs`, `fusswege.mjs`) | `lib/places/data/oepnv.json` (Bus und Bahn je Ort zum Betrieb und zur Berufsschule) | dieser Abschnitt |
| `oepnv-gegenprobe.mjs` | `lib/places/data/oepnv-gegenprobe.json` (Stichprobe gegen eine zweite Auskunft) | dieser Abschnitt |
| – (von Hand geprüft) | `lib/places/data/berufsschule.json` (zuständige Berufsschule) | dieser Abschnitt |

## Bus und Bahn (`oepnv.mjs`, Plan §B, Paket W2a)

### Datenquelle

- **GTFS von gtfs.de**, Lizenz **CC BY 4.0**, Datenbasis **DELFI e.V.** (`attributions.txt` im ZIP nennt DELFI e.V., GTFS.de und OpenStreetMap contributors).
  - „Deutschland Nahverkehr“ (`https://download.gtfs.de/germany/nv_free/latest.zip`, Feed `latest-nv-free`, 278 MB): Bus, Tram.
  - „Deutschland Regionalverkehr“ (`https://download.gtfs.de/germany/rv_free/latest.zip`, Feed `latest-rv-free`, 11 MB): RB, RE, S-Bahn.
  - Beide Dateien: Stand 10.10.2026 (`Last-Modified` des Downloads), Fahrplanperiode 10.10.–09.11.2026.
- **Warum zwei Feeds:** Der Nahverkehrs-Feed enthält keine Züge (kein `route_type` 2). Ohne den Regionalverkehr fehlten Lahntalbahn, Dillstrecke und Main-Weser-Bahn, und Orte mit Bahnhof sähen schlechter angebunden aus, als sie sind.
- Fernverkehr (IC, ICE) bleibt außen vor.
- **Fußwege:** OSRM mit Profil Fuß auf OpenStreetMap-Daten (`routing.openstreetmap.de`, FOSSGIS e.V.), Dienst `table`, höchstens eine Anfrage je Sekunde. Gemessen werden Ortsmitte → Start-Haltestellen, Ziel-Haltestellen → Firmensitz bzw. Schule und die Umstiege an Bahnhöfen.
- **Namensnennung** auf jeder Seite, die die Daten zeigt (steht als `quelle.namensnennung` und `quelle.bearbeitung` in der Datei): „© gtfs.de, CC BY 4.0, Datenbasis DELFI e.V. und OpenStreetMap-Mitwirkende“, dazu der Hinweis auf die Bearbeitung.

Die ZIP-Dateien sind fremde Eingabe. Das Skript liest sie nur, entpackt nichts auf die Platte und führt nichts daraus aus. `stop_times.txt` (über 2 GB entpackt) läuft als Strom durch `node:zlib` und `node:readline`. Neue npm-Pakete braucht es nicht.

### Werktag

**Dienstag, 27.10.2026.** Er liegt in der Mitte der Fahrplanperiode und nach den hessischen Herbstferien (05.–17.10.2026), also fahren die Schulbusse. Er liegt außerdem nach der Zeitumstellung (25.10.) und ist kein Feiertag.

Der im Auftrag genannte 10.11.2026 liegt hinter dem Ende der Periode (09.11.); an diesem Tag enthält der Datensatz keine Fahrten.

Gegenprobe des Werktags: Die Dienstage 20.10. und 03.11.2026 ergeben für alle 54 Orte dieselben Verbindungen.

### Methode (Werte stehen auch unter `methode` in `oepnv.json`)

| Schritt | Regel |
|---|---|
| Ausschnitt | Rechteck ± 50 km um den Firmensitz (35 km Einsatzgebiet + 15 km Rand). Fahrten, die dort zwischen 03:00 und 10:00 halten, gekürzt auf ihre Halte im Rechteck. Nachtfahrten des Vortags (Zeiten über 24 h) zählen mit, um 24 h verschoben. |
| Verkehrstage | `calendar.txt` (Wochentag im Zeitraum) plus Ausnahmen aus `calendar_dates.txt` (1 = zusätzlich, 2 = entfällt). Linien-, Verkehrstage- und Fahrten-IDs bekommen den Feed als Vorsilbe (gtfs.de vergibt sie je Feed neu); Haltestellen mit gleicher ID und gleicher Lage sind dieselbe. |
| Start | Messpunkt des Orts aus `messung.json` (bei Gemeinden der Hauptort, `messpunkt`). Alle Haltestellen bis 1.200 m Luftlinie, ohne solche die nächste bis 2.500 m. Gehzeit über das Wegenetz; Wege über 2.000 m fallen weg. |
| Ziel | Haltestellen bis 600 m Luftlinie um den Firmensitz (Siegmund-Hiepe-Str. 20) bzw. die Berufsschule, Fußweg über das Wegenetz (höchstens 1.000 m). Die nächste am Firmensitz ist „Wetzlar Siegmund-Hiepe-Straße“; „An der Kommandantur“ hat den kürzeren Fußweg. |
| Gehen | 80 m/min, aufgerundet auf volle Minuten. Wo kein Weg aus dem Netz vorliegt: Luftlinie × 1,3. |
| Umstieg | am selben Steig mindestens 2 Minuten. Zu einer anderen Haltestelle bis 400 m Luftlinie: Gehzeit plus 1 Minute Puffer, an Bahnhöfen über das Wegenetz (höchstens 800 m), sonst Luftlinie × 1,3. Höchstens 4 Umstiege. |
| Routing | RAPTOR (Delling, Pajor, Werneck 2012) für jede mögliche Abfahrt an den Start-Haltestellen zwischen 04:00 und 08:00. Muster je Haltestellenfolge und Ein-/Ausstiegsverbot (`pickup_type`/`drop_off_type` = 1), überholende Fahrten bekommen ein eigenes Muster. |
| Ergebnis je Ziel | **Späteste Verbindung** mit Ankunft am Ziel (Haltestelle + Fußweg) bis 07:30 (Betrieb) bzw. 07:45 (Schule); bei Gleichstand weniger Umstiege, dann frühere Ankunft. **Verbindungen am Morgen:** nicht überholte Verbindungen mit Ankunft 06:00–08:00 (keine andere geht später los und kommt früher oder gleich an); zur Abfahrt der spätesten Verbindung steht dort dieselbe Variante, damit die Seite für eine Abfahrt nur eine Ankunft nennt (Prüfung E-029, Test in `oepnv.test.ts`). Je angezeigter Abfahrt (volle Minute) bleibt eine Verbindung: die späteste, wenn sie dabei ist, sonst die frühere Ankunft, bei Gleichstand weniger Umstiege (`jeAbfahrt`; zwei Startpunkte können denselben Bus nehmen und verschieden ankommen, Prüfung E-029, Runde 2). Verbindungen, die länger dauern als der direkte Fußweg (Orte bis 3 km Luftlinie), zählen nicht. Ohne Verbindung: `moeglich: false` mit Grund. |
| Dauer | Aus den angezeigten Uhrzeiten (volle Minuten), damit Text und Zahl zusammenpassen. |

### Erzeugung

```bash
# Rohdaten außerhalb des Repos, je in einem eigenen leeren Ordner:
curl -o <ordner-nv>/de_nv.zip https://download.gtfs.de/germany/nv_free/latest.zip
curl -o <ordner-rv>/de_rv.zip https://download.gtfs.de/germany/rv_free/latest.zip

node scripts/places/oepnv.mjs --gtfs <ordner-nv>/de_nv.zip --gtfs <ordner-rv>/de_rv.zip \
  --datum 2026-10-27 --stand 2026-10-10 --cache <scratch>/oepnv-cache
node scripts/places/oepnv-gegenprobe.mjs
```

- Laufzeit: etwa 40 Sekunden je Feed für den Tagesfahrplan, dann eine Anfrage je Sekunde an den Fußweg-Dienst (54 Orte, 2 Ziele, 277 Bahnhöfe; beim ersten Lauf etwa 30 Minuten). Mit `--cache` geht jeder weitere Lauf in etwa einer Minute.
- Erzeugt am 14.10.2026 mit Node 22 aus diesem Repo.

### Berufsschule (`lib/places/data/berufsschule.json`)

- **Zuständig laut Verordnung:** Werner-von-Siemens-Schule Wetzlar, Dammstraße 62, 35576 Wetzlar, für Grund- und Fachstufe. Status `laut-verordnung`; die Bestätigung durch den Inhaber ist offen (MENSCHEN M-024).
- **Herleitung:**
  1. Fachklassenverordnung (FachklV) vom 1. April 2026, GVBl. 2026 Nr. 21, Anlage 2, lfd. Nr. 2 (S. 15). Sie bildet für den Anlagenmechaniker SHK keinen schulträgerübergreifenden Schulbezirk für den Einzugsbereich 15 (Lahn-Dill-Kreis, Anlage 3, S. 78). Damit gilt die Satzung des Kreises. Das regionale Berufsschulzentrum Dillenburg (Spalte 7–9) greift erst nach einer Allgemeinverfügung (§ 4 Abs. 2 und 5).
  2. Schulbezirkssatzung Lahn-Dill-Kreis (2011, geändert 2023): Wetzlar gehört zum Schulbezirk II der Werner-von-Siemens-Schule (§ 1 Nr. 2, S. 1–2). Maßgebend ist der **Ausbildungsort**, nicht der Wohnort (§ 2, S. 2). Die Anlage lfd. Nr. 2 (S. 3) nennt Grund- und Fachstufe in Dillenburg bzw. Wetzlar.
  3. Mitteilungsvorlage MI-11/2026 des Kreises: Für 2026/2027 steht der Beruf weder unter „Ampel Rot“ noch unter „Ampel Gelb“. Die Website der Schule führt den Beruf unter „Berufe im Anlagenbau“.
- **Je Kreis:** Weil der Ausbildungsort zählt, gilt für alle 54 Wohnorte dieselbe Schule. Die Datei nennt zum Vergleich, was für einen Betrieb im Landkreis Gießen (Theodor-Litt-Schule) oder in Lahn-Dill-Nord (Gewerbliche Schulen Dillenburg) gälte.
- **Koordinaten:** OpenStreetMap `node/2391469752` (Nominatim, 14.10.2026). Die Adresse steht im Impressum der Schule.
- **Unterrichtsbeginn:** nicht belegt. Für den Schulweg ist die Ankunft bis 07:45 angesetzt (`ankunftHinweis`).

### Gegenprobe (`oepnv-gegenprobe.mjs`)

Als zweite Auskunft dient Transitous (`api.transitous.org`, Routenplaner MOTIS, Fahrplandaten über DELFI, nur Nah- und Regionalverkehr). Beide Quellen teilen die Datenbasis DELFI, nicht aber Aufbereitung und Routing.

Verglichen wird je Ort und Ziel die späteste Verbindung: Abfahrt des ersten Fahrzeugs und Linienfolge. Die Fußwege bleiben außen vor, weil Transitous eigene Gehzeiten rechnet.

**Ergebnis (14.10.2026, 14 Orte × 2 Ziele):** 21 von 28 Vergleichen stimmen in Abfahrt und Linien genau überein, auch alle drei „keine Verbindung bis zur Frist“ (Greifenstein zum Betrieb, Weilrod zu beiden Zielen). Die 7 Abweichungen sind geprüft und in `oepnv-gegenprobe.json` begründet (`HINWEISE` im Skript):

| Art | Fälle | Befund |
|---|---|---|
| gleiche Fahrt, anderer Zugang | Gießen → Schule, Wetzlar → Betrieb, Solms → Betrieb | Dasselbe Fahrzeug, nur der Weg zur ersten Haltestelle unterscheidet sich (Fußweg statt Zubringer oder eine Haltestelle früher). |
| andere Auswahlregel | Lich → Schule, Butzbach → Schule | Gleiche erste Fahrt; bei gleichem Losgehen nimmt `oepnv.mjs` weniger Umstiege, Transitous die frühere Ankunft. |
| Umstieg zu knapp gerechnet | Grävenwiesbach → Betrieb und Schule | Weilburg ZOB → Bahnhof (Bus an 06:17, RE25 ab 06:21): hier 4 Minuten Weg plus 1 Minute Puffer, bei Transitous 3 Minuten. Die eigene Rechnung ist hier vorsichtiger als nötig: späteste Verbindung zum Betrieb 04:29 über Frankfurt statt 05:08 über Weilburg. |

Behobene Fehler aus der Gegenprobe:
- Der erste Vergleich zeigte einen Umstieg Zug → Bus in Wetzlar mit 3 Minuten (RE25 an 07:26, Bus ab 07:29), den Transitous nicht anbietet. Seitdem gilt der Puffer von 1 Minute.
- Die Luftlinie täuscht an Bahnhöfen. Seitdem laufen die Umstiege dort über das Wegenetz.
- Mit dem Puffer stimmen 21 von 28 Vergleichen überein, ohne ihn 20, mit mehr knappen Umstiegen.

Zum Aufbau gehören außerdem diese Tests:
- RAPTOR teilt Fahrten mit Ein- oder Ausstiegsverbot in eigene Muster. Sonst nähme es die früheste Fahrt, die am Ziel nicht hält.
- Die Dauer kommt aus den angezeigten Uhrzeiten. Sonst gäbe es bei GTFS-Zeiten mit 30 Sekunden eine Minute Unterschied.
- Bei gleicher Ankunft gewinnt der kürzere Fußweg.
- Keine Fahrt beginnt vor 04:00 oder über Mitternacht. Keine Verbindung dauert 0 Minuten. Der Test `oepnv.test.ts` prüft beides.

**Überblick über die Daten:**
- Zum Betrieb kommt man aus 52 von 54 Orten bis 07:30 an, zur Schule aus 53 von 54 Orten bis 07:45.
- Reisezeit Tür zu Tür zum Betrieb: Median 70 Minuten (16–167).
- Verbindungen mit Ankunft 06:00–08:00: Median 3 zum Betrieb, 4 zur Schule.
- 34 der spätesten Verbindungen zum Betrieb nutzen einen Zug.

### Grenzen

- Ein Werktag in einer Fahrplanperiode. Ab dem Fahrplanwechsel am 13.12.2026 neu rechnen (Daten laden, Befehl oben); `lib/places/__tests__/oepnv.test.ts` prüft Stand, Periode und Werktag.
- Die Linie „EV“ ist Ersatzverkehr. Sie fährt in der ganzen Periode (alle drei geprüften Dienstage gleich), kann aber mit dem nächsten Fahrplan wegfallen.
- Der Messpunkt ist der Hauptort. Andere Ortsteile einer Gemeinde können besser oder schlechter angebunden sein.
- Echtzeit, Verspätungen und Anschlusssicherung kennt ein Sollfahrplan nicht. Die Daten zeigen, was der Fahrplan hergibt.
