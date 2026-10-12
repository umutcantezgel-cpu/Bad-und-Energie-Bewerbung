# Ortsvermessung für die Ortsseiten

Stand: 2026-10-12 · erzeugt mit `node scripts/places/measure.mjs` · Daten: `lib/places/data/messung.json`

Quelle aller Strecken, Fahrzeiten, Postleitzahlen und Kreise auf den Ortsseiten (`/einsatzgebiet/…`). Die Seite nennt nur, was hier steht.

**Freigabe des Inhabers:** Der Inhaber gibt diese Liste mit dem Merge des Pull Requests frei, der die Ortsseiten bringt. Nach `main` gemergt wird nur mit seiner ausdrücklichen Zustimmung. Im Branch sind alle aufgenommenen Orte veröffentlicht, und alle gehen mit dem Merge in einem Schritt live, nicht in Chargen (Entscheidung in `docs/ROADMAP.md` §10.1). Streicht er Orte, bekommen sie vor dem Merge einen Eintrag mit Grund in `PLACE_OVERRIDES` (`lib/places/data.ts`, Ablauf in `docs/operations/orte-pflegen.md`). Offen bis dahin: `docs/operations/fakten-abgleich.md` B32.

## Methode

- **Firmensitz:** Siegmund-Hiepe-Str. 20, 35578 Wetzlar (OSM: 50.5525, 8.47465).
- **Kandidaten:** alle Gemeinden der Kreise um Wetzlar und die Wetzlarer Stadtteile (Liste im Skript).
- **Verortung:** Nominatim (OpenStreetMap). Messpunkt ist bei Gemeinden der Hauptort laut OpenStreetMap (`admin_centre` der Gemeindegrenze, Spalte „Messpunkt“, wenn er anders heißt als die Gemeinde), bei Wetzlarer Stadtteilen der Ortsmittelpunkt in OSM. Kreis und Postleitzahl kommen aus den OSM-Adressdaten; ein Kandidat zählt nur, wenn OSM den erwarteten Kreis bestätigt.
- **Strecke und Fahrzeit:** OSRM-Routenplaner (OpenStreetMap, Profil Auto, ohne Verkehrslage), Messpunkt → Firmensitz. Gerundet auf ganze Kilometer und ganze Minuten.
- **Regeln:** Aufgenommen wird nur, was höchstens 35 km Straße entfernt liegt (Fakt `radius35`). Gegenprobe: Straßenstrecke ≥ 0,95 × Luftlinie.
- **Schreibweise:** Münchholzhausen heißt in OSM „Müchholzhausen“; die Seite nennt den amtlichen Namen.
- **Gegenprobe Name:** Das OSM-Objekt muss den amtlichen Namen tragen (Feld `osmName` in `messung.json`, Test in `lib/places/__tests__/schema.test.ts`). Gesucht wird mit dem vollen Namen samt Klammerzusatz.
- **Grenzen:** Die Fahrzeit ist ein Richtwert ohne Berufsverkehr. Gemeinden mit mehreren Ortsteilen werden ab dem Hauptort gemessen; einzelne Ortsteile können näher oder weiter liegen. Der Hauptort ist der Ort, den OpenStreetMap als `admin_centre` der Gemeinde führt. Er ist nicht gegen die Anschrift des Rathauses geprüft; die Ortsseiten nennen ihn darum „Hauptort laut OpenStreetMap“, nicht Verwaltungssitz.

## Korrekturen

- **2026-10-12, Allendorf (Lumda):** Die erste Messung hatte den Gießener Stadtteil Allendorf verortet (OSM-Name „Allendorf“, relation/13774226, PLZ 35398, 14 km). Neu verortet über die Gemeindegrenze (OSM relation/418611, Verwaltungssitz Allendorf (Lumda), PLZ 35469) und neu gemessen: 38 km Straße, 34 Minuten. Damit liegt die Stadt außerhalb der 35 km und hat keine Seite.

## Ergebnis

54 Orte aufgenommen.

### Lahn-Dill-Kreis

| Ort | Messpunkt | Art | PLZ | km (Straße) | Minuten | Luftlinie km | aufgenommen |
|---|---|---|---|---|---|---|---|
| Wetzlar | – | stadt | 35578 | 3 | 6 | 2.3 | ja |
| Blasbach | – | stadtteil | 35585 | 11 | 13 | 7.1 | ja |
| Dutenhofen | – | stadtteil | 35582 | 11 | 13 | 8.9 | ja |
| Garbenheim | – | stadtteil | 35583 | 5 | 9 | 4 | ja |
| Hermannstein | – | stadtteil | 35586 | 6 | 10 | 3.4 | ja |
| Münchholzhausen | – | stadtteil | 35581 | 9 | 13 | 7.2 | ja |
| Nauborn | – | stadtteil | 35580 | 5 | 9 | 2.7 | ja |
| Naunheim | – | stadtteil | 35584 | 7 | 11 | 5 | ja |
| Steindorf | – | stadtteil | 35579 | 2 | 4 | 1.6 | ja |
| Aßlar | – | gemeinde | 35614 | 8 | 12 | 4.5 | ja |
| Bischoffen | – | gemeinde | 35649 | 28 | 28 | 17.3 | ja |
| Braunfels | – | gemeinde | 35619 | 8 | 11 | 7.3 | ja |
| Breitscheid | – | gemeinde | 35767 | 34 | 31 | 25 | ja |
| Dietzhölztal | Ewersbach | gemeinde | 35716 | 53 | 46 | 33 | nein: Straße 53 km > 35 km |
| Dillenburg | – | gemeinde | 35683 | 38 | 31 | 24.7 | nein: Straße 38 km > 35 km |
| Driedorf | – | gemeinde | 35759 | 37 | 32 | 22.4 | nein: Straße 37 km > 35 km |
| Ehringshausen | – | gemeinde | 35630 | 18 | 17 | 8.4 | ja |
| Eschenburg | Eibelshausen | gemeinde | 35713 | 47 | 41 | 30.4 | nein: Straße 47 km > 35 km |
| Greifenstein | – | gemeinde | 35753 | 29 | 27 | 15.2 | ja |
| Haiger | – | gemeinde | 35708 | 41 | 34 | 28.4 | nein: Straße 41 km > 35 km |
| Herborn | – | gemeinde | 35745 | 27 | 26 | 18.9 | ja |
| Hohenahr | Erda | gemeinde | 35644 | 21 | 22 | 14.1 | ja |
| Hüttenberg | – | gemeinde | 35625 | 13 | 17 | 11.3 | ja |
| Lahnau | Dorlar | gemeinde | 35633 | 9 | 11 | 6.8 | ja |
| Leun | – | gemeinde | 35638 | 11 | 13 | 8.3 | ja |
| Mittenaar | Bicken | gemeinde | 35756 | 25 | 28 | 17.1 | ja |
| Schöffengrund | Schwalbach | gemeinde | 35641 | 10 | 13 | 6.2 | ja |
| Siegbach | Eisemroth | gemeinde | 35768 | 31 | 34 | 20.8 | ja |
| Sinn | – | gemeinde | 35764 | 27 | 25 | 15.1 | ja |
| Solms | Burgsolms | gemeinde | 35606 | 7 | 9 | 5 | ja |
| Waldsolms | Brandoberndorf | gemeinde | 35647 | 20 | 21 | 13.2 | ja |

### Landkreis Gießen

| Ort | Messpunkt | Art | PLZ | km (Straße) | Minuten | Luftlinie km | aufgenommen |
|---|---|---|---|---|---|---|---|
| Allendorf (Lumda) | – | gemeinde | 35469 | 38 | 34 | 28.3 | nein: Straße 38 km > 35 km |
| Biebertal | Rodheim-Bieber | gemeinde | 35444 | 16 | 21 | 11.5 | ja |
| Buseck | Großen-Buseck | gemeinde | 35418 | 31 | 28 | 22.9 | ja |
| Fernwald | Steinbach | gemeinde | 35463 | 26 | 25 | 21.5 | ja |
| Gießen | – | gemeinde | 35390 | 19 | 21 | 14.6 | ja |
| Grünberg | – | gemeinde | 35305 | 46 | 37 | 34.6 | nein: Straße 46 km > 35 km |
| Heuchelheim an der Lahn | Heuchelheim | gemeinde | 35452 | 15 | 18 | 11.4 | ja |
| Hungen | – | gemeinde | 35410 | 42 | 34 | 31.3 | nein: Straße 42 km > 35 km |
| Langgöns | Lang-Göns | gemeinde | 35428 | 22 | 20 | 14.8 | ja |
| Laubach | – | gemeinde | 35321 | 44 | 43 | 36.5 | nein: Straße 44 km > 35 km |
| Lich | – | gemeinde | 35423 | 32 | 32 | 24.7 | ja |
| Linden | Leihgestern | gemeinde | 35440 | 23 | 23 | 14.7 | ja |
| Lollar | – | gemeinde | 35457 | 26 | 26 | 19.6 | ja |
| Pohlheim | Watzenborn-Steinberg | gemeinde | 35415 | 24 | 24 | 17.1 | ja |
| Rabenau | Londorf | gemeinde | 35466 | 41 | 37 | 30.6 | nein: Straße 41 km > 35 km |
| Reiskirchen | – | gemeinde | 35447 | 36 | 30 | 25.4 | nein: Straße 36 km > 35 km |
| Staufenberg | – | gemeinde | 35460 | 31 | 26 | 21.7 | ja |
| Wettenberg | Krofdorf-Gleiberg | gemeinde | 35435 | 21 | 21 | 13.8 | ja |

### Landkreis Marburg-Biedenkopf

| Ort | Messpunkt | Art | PLZ | km (Straße) | Minuten | Luftlinie km | aufgenommen |
|---|---|---|---|---|---|---|---|
| Angelburg | Gönnern | gemeinde | 35719 | 50 | 47 | 30.4 | nein: Straße 50 km > 35 km |
| Bad Endbach | Endbach | gemeinde | 35080 | 35 | 34 | 22.2 | ja |
| Biedenkopf | – | gemeinde | 35216 | – | – | 40.6 | nein: Luftlinie 40.6 km > 35 km |
| Breidenbach | – | gemeinde | 35236 | – | – | 37.2 | nein: Luftlinie 37.2 km > 35 km |
| Cölbe | – | gemeinde | 35091 | – | – | 39.7 | nein: Luftlinie 39.7 km > 35 km |
| Dautphetal | Dautphe | gemeinde | 35232 | 49 | 49 | 34.3 | nein: Straße 49 km > 35 km |
| Ebsdorfergrund | Dreihausen | gemeinde | 35085 | 49 | 39 | 33.4 | nein: Straße 49 km > 35 km |
| Fronhausen | – | gemeinde | 35112 | 36 | 31 | 22.8 | nein: Straße 36 km > 35 km |
| Gladenbach | – | gemeinde | 35075 | 38 | 39 | 25.2 | nein: Straße 38 km > 35 km |
| Lahntal | Sterzhausen | gemeinde | 35094 | – | – | 38 | nein: Luftlinie 38 km > 35 km |
| Lohra | – | gemeinde | 35102 | 30 | 36 | 23.3 | ja |
| Marburg | – | gemeinde | 35037 | 49 | 39 | 35.3 | nein: Straße 49 km > 35 km |
| Steffenberg | Niedereisenhausen | gemeinde | 35239 | 53 | 50 | 31.8 | nein: Straße 53 km > 35 km |
| Weimar (Lahn) | Niederweimar | gemeinde | 35096 | 42 | 32 | 29.3 | nein: Straße 42 km > 35 km |
| Wetter (Hessen) | – | gemeinde | 35083 | – | – | 42.5 | nein: Luftlinie 42.5 km > 35 km |
| Amöneburg | – | gemeinde | 35287 | – | – | 41.7 | nein: Luftlinie 41.7 km > 35 km |

### Landkreis Limburg-Weilburg

| Ort | Messpunkt | Art | PLZ | km (Straße) | Minuten | Luftlinie km | aufgenommen |
|---|---|---|---|---|---|---|---|
| Beselich | Obertiefenbach | gemeinde | 65614 | 33 | 27 | 27 | ja |
| Löhnberg | – | gemeinde | 35792 | 20 | 19 | 15.2 | ja |
| Mengerskirchen | – | gemeinde | 35794 | 30 | 29 | 22.6 | ja |
| Merenberg | – | gemeinde | 35799 | 26 | 23 | 20.6 | ja |
| Runkel | – | gemeinde | 65594 | 38 | 36 | 28.1 | nein: Straße 38 km > 35 km |
| Villmar | – | gemeinde | 65606 | 34 | 37 | 26.8 | ja |
| Weilburg | – | gemeinde | 35781 | 21 | 23 | 16.6 | ja |
| Weilmünster | – | gemeinde | 35789 | 20 | 22 | 15.2 | ja |
| Weinbach | – | gemeinde | 35796 | 22 | 23 | 18.2 | ja |
| Waldbrunn (Westerwald) | Fussingen | gemeinde | 65620 | 32 | 30 | 25.4 | ja |
| Limburg an der Lahn | Dietkirchen | gemeinde | 65549 | 42 | 33 | 31.8 | nein: Straße 42 km > 35 km |

### Wetteraukreis

| Ort | Messpunkt | Art | PLZ | km (Straße) | Minuten | Luftlinie km | aufgenommen |
|---|---|---|---|---|---|---|---|
| Butzbach | – | gemeinde | 35510 | 30 | 27 | 19.2 | ja |
| Münzenberg | – | gemeinde | 35516 | 31 | 25 | 24.1 | ja |
| Rockenberg | – | gemeinde | 35519 | 34 | 27 | 23 | ja |
| Ober-Mörlen | – | gemeinde | 61239 | 38 | 28 | 25.3 | nein: Straße 38 km > 35 km |
| Wölfersheim | – | gemeinde | 61200 | 42 | 30 | 29.4 | nein: Straße 42 km > 35 km |
| Bad Nauheim | – | gemeinde | 61231 | 39 | 30 | 26.8 | nein: Straße 39 km > 35 km |
| Friedberg (Hessen) | – | gemeinde | 61169 | 44 | 35 | 31.1 | nein: Straße 44 km > 35 km |

### Hochtaunuskreis

| Ort | Messpunkt | Art | PLZ | km (Straße) | Minuten | Luftlinie km | aufgenommen |
|---|---|---|---|---|---|---|---|
| Grävenwiesbach | – | gemeinde | 61279 | 27 | 26 | 18.6 | ja |
| Weilrod | Rod an der Weil | gemeinde | 61276 | 33 | 35 | 24.7 | ja |
| Usingen | – | gemeinde | 61250 | 36 | 35 | 24.7 | nein: Straße 36 km > 35 km |
| Neu-Anspach | – | gemeinde | 61267 | 40 | 42 | 28.6 | nein: Straße 40 km > 35 km |
| Wehrheim | – | gemeinde | 61273 | 58 | 41 | 28.5 | nein: Straße 58 km > 35 km |

### Vogelsbergkreis

| Ort | Messpunkt | Art | PLZ | km (Straße) | Minuten | Luftlinie km | aufgenommen |
|---|---|---|---|---|---|---|---|
| Mücke | – | gemeinde | 35325 | – | – | 39.7 | nein: Luftlinie 39.7 km > 35 km |

