# Tastatur und Anpassung · r3-home-02-pruef

Erstellt 2026-10-09T23:08:52.604Z · Basis http://localhost:3450 · Chromium 141.0.7390.37

## Messbedingungen
- **reducedMotion**: reduce (nur 'ohne JavaScript': no-preference)
- **farbschema**: hell
- **tab**: d1440 hell, bis zu 80 × Tab je Hauptseite (start), 90 ms Wartezeit je Schritt, ohne vorheriges Durchscrollen; Fokus sichtbar = berechnete outline-width ≥ 2 px (Stil ≠ none, Farbe nicht transparent) oder box-shadow mit sichtbarer Farbe und Maß ≠ 0, gemessen am fokussierten Element und seinen Pseudo-Elementen ::after/::before (nicht an Vorfahren oder Geschwistern); verdeckt (Kopfleiste) = Elementoberkante < Unterkante der ersten sticky/fixed header UND Trefferprobe 2 px unter der Oberkante liegt in der Kopfleiste (Rechteckprüfung allein wird zusätzlich gezählt); Fokusfalle = gleiches Element 3× in Folge oder Zyklus ohne Fußbereich
- **reflow**: 320×640 isMobile, dsf 2, jede Seite der Grundmenge (1), overflowReport() nach Durchscrollen; „erste Verursacher“ = sichtbare Elemente mit Rechteck rechts über dem Rand, ohne Inhalte in eigenen Scrollcontainern
- **zoom**: Primär: Viewport 720×450, dsf 2, ohne isMobile (entspricht Browser-Zoom 200 % bei 1440 px); Vergleich: d1440 mit document.documentElement.style.zoom = 2
- **textabstand**: m375 und d1440, hell; Stylesheet „* { line-height:1.5 !important; letter-spacing:.12em !important; word-spacing:.16em !important } p { margin-bottom:2em !important }“; overflowReport() vorher und nachher, ergänzend vertikal abgeschnittener Text (overflow hidden/clip, Inhalt höher als Box)
- **erzwungeneFarben**: forcedColors „active“, Farbschema hell, m375 und d1440, Hauptseiten; Bildschirmfoto der ersten Bildschirmhöhe (WebP, Qualität 70); sichtbar = Rahmen (eine Seite, Stil ≠ none) oder Outline oder Unterstreichung laut berechneten Styles; „Fließtext“ nach der Heuristik aus e2e/support/site.ts (Block-Vorfahr enthält mehr Text als der Link), daher zählen auch Titel-Links der Stellenkarten dazu; Links umfassen auch als Knopf gestaltete Links (z. B. „Jetzt bewerben“)
- **ohneJavaScript**: javaScriptEnabled false, m375 und d1440, alle Seiten der Grundmenge, Wartezeit 1,5 s nach load; opacity 0 = berechnete opacity exakt 0 bei Element im ersten Bildschirm
- **anfragesperre**: lib/browser.mjs (G5)
- **parallel**: 3

## Abdeckung
- Seiten der Grundmenge: 1 · Hauptseiten: 1
- Läufe: Tab 1 · Reflow 320 1 · Zoom 200 % 0 (je 2 Verfahren) · Textabstände 0 · erzwungene Farben 0 · ohne JavaScript 2
- Fehlgeschlagen: keine
- Anfragesperre insgesamt: keine gesperrten oder abgefangenen Anfragen

## Summenzeile
- Tab: ohne Sprunglink als erstes Ziel 0/1 Hauptseiten (–) · Schritte ohne Fokusdarstellung 1 · verdeckt von Kopfleiste 0 (nur Rechteckprüfung 2) · außerhalb Viewport 1 · von anderem Element überdeckt 0 · Fokusfallen 0 (–)
- Reflow 320: horizontaler Überlauf 0/1 (–) · Seiten mit abgeschnittenem/überstehendem Text 1
- Zoom 200 % (Viewport 720×450): Überlauf 0/0 · abgeschnittener Text 0 · Vergleichsverfahren CSS-Zoom: Überlauf 0/0
- Textabstände: neuer Überlauf 0/0 Läufe · neu abgeschnittener Text 0/0
- Erzwungene Farben: Links ohne Umrandung/Unterstreichung 0/0 · Knöpfe ohne 0/0 (Läufe: 0)
- Ohne JavaScript: Läufe 2 · h1 ≠ 1: 0 · main leer: 0 · opacity 0 im ersten Bildschirm: 0

## 1 · Tab-Durchlauf (d1440, hell)
| Seite | Schritte | Ende | Sprunglink erstes Ziel | Fokus ohne Darstellung | verdeckt (Kopfleiste, bestätigt) / nur Rechteck | außerhalb Viewport | überdeckt (anderes Element) | Fokusfalle | Fußbereich erreicht | Zyklus | sichtbar interaktiv |
|---|---:|---|---|---:|---:|---:|---:|---|---|---|---:|
| start | 66 | zyklus | ja | 1 | 0 / 2 | 1 | 0 | nein | ja | Schritt 66, Länge 65 | 76 |

### start · /
Erste Ziele: a „Zum Inhalt springen“ → a „Bad und Energie GmbH Lahn Dill, zur Startseite“ → a „Stellen“ · Sprunglink bei Fokus sichtbar: ja

Auffällige Schritte:

| # | Element | Rolle | Fokus sichtbar (Ort) | outline | box-shadow | im Viewport | verdeckt (Kopf) | überdeckt durch |
|---:|---|---|---|---|---|---|---|---|
| 64 | nextjs-portal „“ | generic | nein | 0px none rgb(117, 117, 117) | none | nein | nein | – |

<details><summary>Alle Schritte</summary>

| # | Element | Rolle | Name | Fokus | Kopfabstand | Fuß |
|---:|---|---|---|---|---:|---|
| 1 | a | link | Zum Inhalt springen | outline | -49 |  |
| 2 | a | link | Bad und Energie GmbH Lahn Dill, zur Startseite | outline | Kopf |  |
| 3 | a | link | Stellen | outline | Kopf |  |
| 4 | a | link | Vorteile | outline | Kopf |  |
| 5 | a | link | Ablauf | outline | Kopf |  |
| 6 | a | link | FAQ | outline | Kopf |  |
| 7 | a | link | 06441 42956 anrufen | outline | Kopf |  |
| 8 | a | link | Bewerben | outline | Kopf |  |
| 9 | a | link | Jetzt bewerben | outline | 696 |  |
| 10 | a | link | Offene Stellen ansehen | outline | 760 |  |
| 11 | a | link | Alle Stellen im Überblick | outline | 403 |  |
| 12 | a | link | Anlagen­mechaniker SHK | ::after | 518 |  |
| 13 | a | link | Kunden­dienst­techniker | ::after | 622 |  |
| 14 | a | link | Ober­monteur / Projekt­leiter | ::after | 726 |  |
| 15 | a | link | Ausbildung Anlagen­mechaniker | ::after | 800 |  |
| 16 | a | link | Initiativ bewerben | outline | 412 |  |
| 17 | a | link | Seite zur Ausbildung | outline | 803 |  |
| 18 | input | radio | Anlagen­mechaniker SHK | outline | 424 |  |
| 19 | input | checkbox | Pünktlich Feierabend | outline | 826 |  |
| 20 | input | checkbox | Bezahlung über Tarif | outline | 425 |  |
| 21 | input | checkbox | Werkzeug und Fahrzeug | outline | 486 |  |
| 22 | input | checkbox | Baustellen in der Nähe | outline | 547 |  |
| 23 | a | link | Als Anlagenmechaniker SHK bewerben | outline | 330 |  |
| 24 | a | link | Alles zur Stelle : Anlagenmechaniker SHK | outline | 334 |  |
| 25 | input | radio | 35 km | outline | 424 |  |
| 26 | input | radio | Wetzlar Kernstadt1 km, 3 Min. | outline | 529 |  |
| 27 | summary | button (summary) | Alle Orte als Tabelle | outline | 403 |  |
| 28 | a | link | 06441 42956 | outline | 692 |  |
| 29 | a | link | Route in Google Maps öffnen (öffnet in einem neuen | outline | 791 |  |
| 30 | a | link | Jetzt bewerben | outline | 399 |  |
| 31 | button | button | Alle | outline | 403 |  |
| 32 | button | button | Kunden | outline | 403 |  |
| 33 | button | button | Team | outline | 403 |  |
| 34 | ul | list | Stimmen von Kunden und Team | outline | 346 |  |
| 35 | summary | button (summary) | Antwort des Inhabers | outline | 763 |  |
| 36 | summary | button (summary) | Antwort des Inhabers | outline | 763 |  |
| 37 | summary | button (summary) | Antwort des Inhabers | outline | 763 |  |
| 38 | summary | button (summary) | Antwort des Inhabers | outline | 763 |  |
| 39 | summary | button (summary) | Antwort des Inhabers | outline | 763 |  |
| 40 | summary | button (summary) | Antwort des Inhabers | outline | 763 |  |
| 41 | summary | button (summary) | Antwort des Inhabers | outline | 763 |  |
| 42 | button | button | Vorherige Stimme | outline | 403 |  |
| 43 | button | button | Nächste Stimme | outline | 403 |  |
| 44 | summary | button (summary) | Wie läuft der diskrete Wechsel ab, wenn ich noch b | outline | 706 |  |
| 45 | summary | button (summary) | Brauche ich ein Anschreiben oder einen Lebenslauf? | outline | 772 |  |
| 46 | summary | button (summary) | Welche Heizsysteme und Sanitäranlagen montiert ihr | outline | 378 |  |
| 47 | summary | button (summary) | Darf ich das Firmenfahrzeug mit nach Hause nehmen? | outline | 473 |  |
| 48 | summary | button (summary) | Gibt es Fernmontagen oder Wochenendarbeit? | outline | 537 |  |
| 49 | a | link | Jetzt bewerben | outline | 397 |  |
| 50 | a | link | Anrufen 06441 42956 | outline | 365 |  |
| 51 | a | link | WhatsApp Nachricht schreiben (öffnet in neuem Tab) | outline | 433 |  |
| 52 | a | link | E-Mail info@bad-energie.de | outline | 502 |  |
| 53 | a | link | Telefon 06441 42956 | outline | 403 | ja |
| 54 | a | link | info@bad-energie.de | outline | 447 | ja |
| 55 | a | link | Anlagenmechaniker SHK | outline | 259 | ja |
| 56 | a | link | Kundendiensttechniker | outline | 303 | ja |
| 57 | a | link | Obermonteur / Projektleiter | outline | 347 | ja |
| 58 | a | link | Ausbildung Anlagenmechaniker | outline | 391 | ja |
| 59 | a | link | Alle Stellen | outline | 435 | ja |
| 60 | a | link | Impressum | outline | 259 | ja |
| 61 | a | link | Datenschutz | outline | 303 | ja |
| 62 | a | link | bad-energie.de | outline | 347 | ja |
| 63 | a | link | Entfernung und Fahrzeit zu deinem Ort | outline | 704 | ja |
| 64 | nextjs-portal | generic |  | **keiner** | -11413 |  |
| 65 | body | | | | | |
| 66 | a | link | Zum Inhalt springen | outline | -49 |  |

</details>

## 2 · Reflow 320 × 640
| Seite | Status | horizontaler Überlauf | scrollWidth / clientWidth | innerWidth | abgeschnitten/überstehend | erste Verursacher |
|---|---:|---|---|---:|---:|---|
| start | 200 | nein | 320 / 320 | 320 | 2 | – |

Abgeschnitten/überstehend auf start: span „Offene Stellen ansehen“ (4 px über dem Rand); span „ansehen“ (4 px über dem Rand)

## 6 · Ohne JavaScript
| Seite | Ansicht | Status | Titel vorhanden | h1 | main-Textlänge | opacity 0 im ersten Bildschirm (davon mit Text) | noscript |
|---|---|---:|---|---:|---:|---|---:|
| start | m375 | 200 | ja | 1 | 11032 | 0 (0) | 0 |
| start | d1440 | 200 | ja | 1 | 11064 | 0 (0) | 0 |
