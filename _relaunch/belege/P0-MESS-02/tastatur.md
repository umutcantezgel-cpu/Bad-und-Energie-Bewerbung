# Tastatur und Anpassung · P0-MESS-02

Erstellt 2026-10-09T07:39:48.184Z · Basis http://localhost:3500 · Chromium 141.0.7390.37

## Messbedingungen
- **reducedMotion**: reduce (nur 'ohne JavaScript': no-preference)
- **farbschema**: hell
- **tab**: d1440 hell, bis zu 80 × Tab je Hauptseite (start, stellen, stelle-anlagenmechaniker, bewerbung), 90 ms Wartezeit je Schritt, ohne vorheriges Durchscrollen; Fokus sichtbar = berechnete outline-width ≥ 2 px (Stil ≠ none, Farbe nicht transparent) oder box-shadow mit sichtbarer Farbe und Maß ≠ 0, gemessen am fokussierten Element und seinen Pseudo-Elementen ::after/::before (nicht an Vorfahren oder Geschwistern); verdeckt (Kopfleiste) = Elementoberkante < Unterkante der ersten sticky/fixed header UND Trefferprobe 2 px unter der Oberkante liegt in der Kopfleiste (Rechteckprüfung allein wird zusätzlich gezählt); Fokusfalle = gleiches Element 3× in Folge oder Zyklus ohne Fußbereich
- **reflow**: 320×640 isMobile, dsf 2, jede Seite der Grundmenge (12), overflowReport() nach Durchscrollen; „erste Verursacher“ = sichtbare Elemente mit Rechteck rechts über dem Rand, ohne Inhalte in eigenen Scrollcontainern
- **zoom**: Primär: Viewport 720×450, dsf 2, ohne isMobile (entspricht Browser-Zoom 200 % bei 1440 px); Vergleich: d1440 mit document.documentElement.style.zoom = 2
- **textabstand**: m375 und d1440, hell; Stylesheet „* { line-height:1.5 !important; letter-spacing:.12em !important; word-spacing:.16em !important } p { margin-bottom:2em !important }“; overflowReport() vorher und nachher, ergänzend vertikal abgeschnittener Text (overflow hidden/clip, Inhalt höher als Box)
- **erzwungeneFarben**: forcedColors „active“, Farbschema hell, m375 und d1440, Hauptseiten; Bildschirmfoto der ersten Bildschirmhöhe (WebP, Qualität 70); sichtbar = Rahmen (eine Seite, Stil ≠ none) oder Outline oder Unterstreichung laut berechneten Styles; „Fließtext“ nach der Heuristik aus e2e/support/site.ts (Block-Vorfahr enthält mehr Text als der Link), daher zählen auch Titel-Links der Stellenkarten dazu; Links umfassen auch als Knopf gestaltete Links (z. B. „Jetzt bewerben“)
- **ohneJavaScript**: javaScriptEnabled false, m375 und d1440, alle Seiten der Grundmenge, Wartezeit 1,5 s nach load; opacity 0 = berechnete opacity exakt 0 bei Element im ersten Bildschirm
- **anfragesperre**: lib/browser.mjs (G5)
- **parallel**: 3

## Abdeckung
- Seiten der Grundmenge: 12 · Hauptseiten: 4
- Läufe: Tab 4 · Reflow 320 12 · Zoom 200 % 12 (je 2 Verfahren) · Textabstände 24 · erzwungene Farben 8 · ohne JavaScript 24
- Fehlgeschlagen: keine
- Anfragesperre insgesamt: keine gesperrten oder abgefangenen Anfragen

## Summenzeile
- Tab: ohne Sprunglink als erstes Ziel 0/4 Hauptseiten (–) · Schritte ohne Fokusdarstellung 0 · verdeckt von Kopfleiste 0 (nur Rechteckprüfung 8) · außerhalb Viewport 0 · von anderem Element überdeckt 0 · Fokusfallen 0 (–)
- Reflow 320: horizontaler Überlauf 0/12 (–) · Seiten mit abgeschnittenem/überstehendem Text 1
- Zoom 200 % (Viewport 720×450): Überlauf 0/12 · abgeschnittener Text 0 · Vergleichsverfahren CSS-Zoom: Überlauf 5/12
- Textabstände: neuer Überlauf 1/24 Läufe · neu abgeschnittener Text 0/24
- Erzwungene Farben: Links ohne Umrandung/Unterstreichung 142/175 · Knöpfe ohne 19/53 (Läufe: 8)
- Ohne JavaScript: Läufe 24 · h1 ≠ 1: 0 · main leer: 0 · opacity 0 im ersten Bildschirm: 2

## 1 · Tab-Durchlauf (d1440, hell)
| Seite | Schritte | Ende | Sprunglink erstes Ziel | Fokus ohne Darstellung | verdeckt (Kopfleiste, bestätigt) / nur Rechteck | außerhalb Viewport | überdeckt (anderes Element) | Fokusfalle | Fußbereich erreicht | Zyklus | sichtbar interaktiv |
|---|---:|---|---|---:|---:|---:|---:|---|---|---|---:|
| start | 46 | zyklus | ja | 0 | 0 / 2 | 0 | 0 | nein | ja | Schritt 46, Länge 45 | 44 |
| stellen | 30 | zyklus | ja | 0 | 0 / 2 | 0 | 0 | nein | ja | Schritt 30, Länge 29 | 28 |
| stelle-anlagenmechaniker | 39 | zyklus | ja | 0 | 0 / 2 | 0 | 0 | nein | ja | Schritt 39, Länge 38 | 38 |
| bewerbung | 18 | zyklus | ja | 0 | 0 / 2 | 0 | 0 | nein | ja | Schritt 18, Länge 17 | 16 |

### start · /
Erste Ziele: a „Zum Inhalt springen“ → a „Bad und Energie GmbH Lahn Dill, zur Startseite“ → a „Stellen“ · Sprunglink bei Fokus sichtbar: ja

Keine auffälligen Schritte.

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
| 9 | a | link | Jetzt bewerben | outline | 474 |  |
| 10 | a | link | Offene Stellen ansehen | outline | 480 |  |
| 11 | a | link | Alle Stellen im Überblick | outline | 399 |  |
| 12 | a | link | Anlagenmechaniker SHK | ::after | 508 |  |
| 13 | a | link | Kundendiensttechniker | ::after | 508 |  |
| 14 | a | link | Obermonteur / Projektleiter | ::after | 765 |  |
| 15 | a | link | Ausbildung Anlagenmechaniker | ::after | 765 |  |
| 16 | a | link | Initiativ bewerben | outline | 411 |  |
| 17 | a | link | Seite zur Ausbildung | outline | 792 |  |
| 18 | select | combobox | Wo wohnst du? | outline | 395 |  |
| 19 | a | link | Jetzt bewerben | outline | 395 |  |
| 20 | button | button | Alle | outline | 399 |  |
| 21 | button | button | Kunden | outline | 399 |  |
| 22 | button | button | Team | outline | 399 |  |
| 23 | button | button | Vorherige Stimme | outline | 399 |  |
| 24 | button | button | Nächste Stimme | outline | 399 |  |
| 25 | ul | list | Stimmen von Kunden und Team | outline | 447 |  |
| 26 | summary | button (summary) | Wie läuft der diskrete Wechsel ab, wenn ich noch b | outline | 379 |  |
| 27 | summary | button (summary) | Brauche ich ein Anschreiben oder einen Lebenslauf? | outline | 464 |  |
| 28 | summary | button (summary) | Welche Heizsysteme und Sanitäranlagen montiert ihr | outline | 524 |  |
| 29 | summary | button (summary) | Darf ich das Firmenfahrzeug mit nach Hause nehmen? | outline | 583 |  |
| 30 | summary | button (summary) | Gibt es Fernmontagen oder Wochenendarbeit? | outline | 642 |  |
| 31 | a | link | Jetzt bewerben | outline | 393 |  |
| 32 | a | link | 06441 42956 anrufen | outline | 506 |  |
| 33 | a | link | WhatsApp (öffnet in neuem Tab) | outline | 506 |  |
| 34 | a | link | info@bad-energie.de | outline | 506 |  |
| 35 | a | link | Telefon 06441 42956 | outline | 600 | ja |
| 36 | a | link | info@bad-energie.de | outline | 644 | ja |
| 37 | a | link | Anlagenmechaniker SHK | outline | 467 | ja |
| 38 | a | link | Kundendiensttechniker | outline | 511 | ja |
| 39 | a | link | Obermonteur / Projektleiter | outline | 555 | ja |
| 40 | a | link | Ausbildung Anlagenmechaniker | outline | 599 | ja |
| 41 | a | link | Alle Stellen | outline | 643 | ja |
| 42 | a | link | Impressum | outline | 467 | ja |
| 43 | a | link | Datenschutz | outline | 511 | ja |
| 44 | a | link | bad-energie.de | outline | 555 | ja |
| 45 | body | | | | | |
| 46 | a | link | Zum Inhalt springen | outline | -49 |  |

</details>

### stellen · /jobs
Erste Ziele: a „Zum Inhalt springen“ → a „Bad und Energie GmbH Lahn Dill, zur Startseite“ → a „Stellen“ · Sprunglink bei Fokus sichtbar: ja

Keine auffälligen Schritte.

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
| 9 | a | link | Startseite | outline | 48 |  |
| 10 | a | link | Anlagenmechaniker SHK | ::after | 355 |  |
| 11 | a | link | Kundendiensttechniker | ::after | 355 |  |
| 12 | a | link | Obermonteur / Projektleiter | ::after | 613 |  |
| 13 | a | link | Ausbildung Anlagenmechaniker | ::after | 613 |  |
| 14 | a | link | Quereinstieg / Montagehelfer | outline | 411 |  |
| 15 | a | link | Initiativ bewerben | outline | 458 |  |
| 16 | a | link | Anrufen 06441 42956 | outline | 280 |  |
| 17 | a | link | WhatsApp Nachricht schreiben (öffnet in neuem Tab) | outline | 342 |  |
| 18 | a | link | E-Mail info@bad-energie.de | outline | 403 |  |
| 19 | a | link | Telefon 06441 42956 | outline | 599 | ja |
| 20 | a | link | info@bad-energie.de | outline | 643 | ja |
| 21 | a | link | Anlagenmechaniker SHK | outline | 467 | ja |
| 22 | a | link | Kundendiensttechniker | outline | 511 | ja |
| 23 | a | link | Obermonteur / Projektleiter | outline | 555 | ja |
| 24 | a | link | Ausbildung Anlagenmechaniker | outline | 599 | ja |
| 25 | a | link | Alle Stellen | outline | 643 | ja |
| 26 | a | link | Impressum | outline | 467 | ja |
| 27 | a | link | Datenschutz | outline | 511 | ja |
| 28 | a | link | bad-energie.de | outline | 555 | ja |
| 29 | body | | | | | |
| 30 | a | link | Zum Inhalt springen | outline | -49 |  |

</details>

### stelle-anlagenmechaniker · /jobs/anlagenmechaniker-shk-wetzlar
Erste Ziele: a „Zum Inhalt springen“ → a „Bad und Energie GmbH Lahn Dill, zur Startseite“ → a „Stellen“ · Sprunglink bei Fokus sichtbar: ja

Keine auffälligen Schritte.

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
| 9 | a | link | Startseite | outline | 48 |  |
| 10 | a | link | Stellen | outline | 48 |  |
| 11 | button | button | ändern (Stelle wählen) | outline | 401 |  |
| 12 | button | button | Geselle, unter 2 Jahren | outline | 528 |  |
| 13 | button | button | Geselle, 2–5 Jahre | outline | 604 |  |
| 14 | button | button | Geselle, über 5 Jahre | outline | 680 |  |
| 15 | button | button | Meister oder Techniker | outline | 756 |  |
| 16 | button | button | Andere Ausbildung | outline | 771 |  |
| 17 | a | link | Lieber direkt per WhatsApp? (öffnet WhatsApp) | outline | 399 |  |
| 18 | summary | button (summary) | Wie läuft der diskrete Wechsel ab, wenn ich noch b | outline | 555 |  |
| 19 | summary | button (summary) | Darf ich das Firmenfahrzeug mit nach Hause nehmen? | outline | 641 |  |
| 20 | summary | button (summary) | Gibt es Fernmontagen oder Wochenendarbeit? | outline | 700 |  |
| 21 | a | link | Anrufen 06441 42956 | outline | 280 |  |
| 22 | a | link | WhatsApp Nachricht schreiben (öffnet in neuem Tab) | outline | 341 |  |
| 23 | a | link | E-Mail info@bad-energie.de | outline | 403 |  |
| 24 | a | link | Alle offenen Stellen | outline | 399 |  |
| 25 | a | link | Kundendiensttechniker | ::after | 500 |  |
| 26 | a | link | Obermonteur / Projektleiter | ::after | 500 |  |
| 27 | a | link | Ausbildung Anlagenmechaniker | ::after | 500 |  |
| 28 | a | link | Telefon 06441 42956 | outline | 600 | ja |
| 29 | a | link | info@bad-energie.de | outline | 644 | ja |
| 30 | a | link | Anlagenmechaniker SHK | outline | 467 | ja |
| 31 | a | link | Kundendiensttechniker | outline | 511 | ja |
| 32 | a | link | Obermonteur / Projektleiter | outline | 555 | ja |
| 33 | a | link | Ausbildung Anlagenmechaniker | outline | 599 | ja |
| 34 | a | link | Alle Stellen | outline | 643 | ja |
| 35 | a | link | Impressum | outline | 467 | ja |
| 36 | a | link | Datenschutz | outline | 511 | ja |
| 37 | a | link | bad-energie.de | outline | 555 | ja |
| 38 | body | | | | | |
| 39 | a | link | Zum Inhalt springen | outline | -49 |  |

</details>

### bewerbung · /bewerbung
Erste Ziele: a „Zum Inhalt springen“ → a „Bad und Energie GmbH Lahn Dill, zur Startseite“ → a „Abbrechen“ · Sprunglink bei Fokus sichtbar: ja

Keine auffälligen Schritte.

<details><summary>Alle Schritte</summary>

| # | Element | Rolle | Name | Fokus | Kopfabstand | Fuß |
|---:|---|---|---|---|---:|---|
| 1 | a | link | Zum Inhalt springen | outline | -49 |  |
| 2 | a | link | Bad und Energie GmbH Lahn Dill, zur Startseite | outline | Kopf |  |
| 3 | a | link | Abbrechen | outline | Kopf |  |
| 4 | button | button | Anlagenmechaniker SHK | outline | 193 |  |
| 5 | button | button | Kundendiensttechniker | outline | 269 |  |
| 6 | button | button | Obermonteur / Projektleiter | outline | 345 |  |
| 7 | button | button | Ausbildung Anlagenmechaniker | outline | 421 |  |
| 8 | button | button | Quereinstieg / Montagehelfer | outline | 497 |  |
| 9 | button | button | Initiativ bewerben | outline | 573 |  |
| 10 | a | link | Lieber direkt per WhatsApp? (öffnet WhatsApp) | outline | 694 |  |
| 11 | a | link | Lieber mit kompletter Bewerbungsmappe? | outline | 738 |  |
| 12 | a | link | 06441 42956 anrufen | outline | 608 |  |
| 13 | a | link | WhatsApp (öffnet in neuem Tab) | outline | 608 |  |
| 14 | a | link | info@bad-energie.de | outline | 608 |  |
| 15 | a | link | Impressum | outline | 775 | ja |
| 16 | a | link | Datenschutz | outline | 775 | ja |
| 17 | body | | | | | |
| 18 | a | link | Zum Inhalt springen | outline | -49 |  |

</details>

## 2 · Reflow 320 × 640
| Seite | Status | horizontaler Überlauf | scrollWidth / clientWidth | innerWidth | abgeschnitten/überstehend | erste Verursacher |
|---|---:|---|---|---:|---:|---|
| start | 200 | nein | 320 / 320 | 320 | 0 | – |
| stellen | 200 | nein | 320 / 320 | 320 | 0 | – |
| stelle-anlagenmechaniker | 200 | nein | 320 / 320 | 320 | 0 | – |
| stelle-kundendienst | 200 | nein | 320 / 320 | 320 | 0 | – |
| stelle-obermonteur | 200 | nein | 320 / 320 | 320 | 0 | – |
| stelle-ausbildung | 200 | nein | 320 / 320 | 320 | 0 | – |
| bewerbung | 200 | nein | 320 / 320 | 320 | 0 | – |
| bewerbung-danke | 200 | nein | 320 / 320 | 320 | 0 | – |
| bewerbung-mappe | 200 | nein | 320 / 320 | 320 | 1 | – |
| datenschutz | 200 | nein | 320 / 320 | 320 | 0 | – |
| impressum | 200 | nein | 320 / 320 | 320 | 0 | – |
| fehler-404 | 404 | nein | 320 / 320 | 320 | 0 | – |

Abgeschnitten/überstehend auf bewerbung-mappe: span „Hinzufügen“ (overflow hidden)

## 3 · Zoom 200 %
| Seite | 720×450: Überlauf | scrollWidth / clientWidth | abgeschnitten | Kopfleiste (px) | CSS-Zoom: Überlauf | scrollWidth / clientWidth | abgeschnitten |
|---|---|---|---:|---:|---|---|---:|
| start | nein | 720 / 720 | 0 | 57 | ja | 1488 / 1440 | 7 |
| stellen | nein | 720 / 720 | 0 | 57 | nein | 1440 / 1440 | 0 |
| stelle-anlagenmechaniker | nein | 720 / 720 | 0 | 57 | ja | 1459 / 1440 | 1 |
| stelle-kundendienst | nein | 720 / 720 | 0 | 57 | ja | 1459 / 1440 | 1 |
| stelle-obermonteur | nein | 720 / 720 | 0 | 57 | ja | 1459 / 1440 | 1 |
| stelle-ausbildung | nein | 720 / 720 | 0 | 57 | nein | 1440 / 1440 | 0 |
| bewerbung | nein | 720 / 720 | 0 | 57 | nein | 1440 / 1440 | 0 |
| bewerbung-danke | nein | 720 / 720 | 0 | 57 | nein | 1440 / 1440 | 0 |
| bewerbung-mappe | nein | 720 / 720 | 0 | 57 | ja | 1453 / 1440 | 1 |
| datenschutz | nein | 720 / 720 | 0 | 57 | nein | 1440 / 1440 | 0 |
| impressum | nein | 720 / 720 | 0 | 57 | nein | 1440 / 1440 | 0 |
| fehler-404 | nein | 720 / 720 | 0 | 57 | nein | 1440 / 1440 | 0 |

## 4 · Textabstände (WCAG 1.4.12)
| Seite | Ansicht | Überlauf vorher → nachher | abgeschnitten h vorher → nachher | vertikal abgeschnitten vorher → nachher | neu h / neu v |
|---|---|---|---|---|---|
| start | m375 | nein → ja | 0 → 0 | 0 → 0 | 0 / 0 |
| start | d1440 | nein → nein | 0 → 0 | 0 → 0 | 0 / 0 |
| stellen | m375 | nein → nein | 0 → 0 | 0 → 0 | 0 / 0 |
| stellen | d1440 | nein → nein | 0 → 0 | 0 → 0 | 0 / 0 |
| stelle-anlagenmechaniker | m375 | nein → nein | 0 → 0 | 0 → 0 | 0 / 0 |
| stelle-anlagenmechaniker | d1440 | nein → nein | 0 → 0 | 0 → 0 | 0 / 0 |
| stelle-kundendienst | m375 | nein → nein | 0 → 0 | 0 → 0 | 0 / 0 |
| stelle-kundendienst | d1440 | nein → nein | 0 → 0 | 0 → 0 | 0 / 0 |
| stelle-obermonteur | m375 | nein → nein | 0 → 0 | 0 → 0 | 0 / 0 |
| stelle-obermonteur | d1440 | nein → nein | 0 → 0 | 0 → 0 | 0 / 0 |
| stelle-ausbildung | m375 | nein → nein | 0 → 0 | 0 → 0 | 0 / 0 |
| stelle-ausbildung | d1440 | nein → nein | 0 → 0 | 0 → 0 | 0 / 0 |
| bewerbung | m375 | nein → nein | 0 → 0 | 0 → 0 | 0 / 0 |
| bewerbung | d1440 | nein → nein | 0 → 0 | 0 → 0 | 0 / 0 |
| bewerbung-danke | m375 | nein → nein | 0 → 0 | 0 → 0 | 0 / 0 |
| bewerbung-danke | d1440 | nein → nein | 0 → 0 | 0 → 0 | 0 / 0 |
| bewerbung-mappe | m375 | nein → nein | 1 → 1 | 1 → 1 | 0 / 0 |
| bewerbung-mappe | d1440 | nein → nein | 0 → 0 | 0 → 0 | 0 / 0 |
| datenschutz | m375 | nein → nein | 0 → 0 | 0 → 0 | 0 / 0 |
| datenschutz | d1440 | nein → nein | 0 → 0 | 0 → 0 | 0 / 0 |
| impressum | m375 | nein → nein | 0 → 0 | 0 → 0 | 0 / 0 |
| impressum | d1440 | nein → nein | 0 → 0 | 0 → 0 | 0 / 0 |
| fehler-404 | m375 | nein → nein | 0 → 0 | 0 → 0 | 0 / 0 |
| fehler-404 | d1440 | nein → nein | 0 → 0 | 0 → 0 | 0 / 0 |

Neuer horizontaler Überlauf (erste Verursacher laut Rechteckprüfung):

- start m375: scrollWidth 381 / clientWidth 375 · aside.fixed.inset-x-0.bottom-0 (+6); div.mx-auto.flex.max-w-content (+6); section.pointer-events-none.fixed.inset-x-0 (+6)

## 5 · Erzwungene Farben (forced-colors: active, hell)
| Seite | Ansicht | aktiv | Links ohne / gesamt | davon im Fließtext | Knöpfe ohne / gesamt | Felder ohne / gesamt | forced-color-adjust: none | Foto |
|---|---|---|---|---:|---|---|---:|---|
| start | m375 | ja | 18 / 25 | 4 | 6 / 11 | 0 / 1 | 0 | belege/P0-MESS-02/forced-colors/start__m375-light.webp |
| start | d1440 | ja | 24 / 31 | 4 | 5 / 10 | 0 / 1 | 0 | belege/P0-MESS-02/forced-colors/start__d1440-light.webp |
| stellen | m375 | ja | 22 / 23 | 4 | 1 / 1 | 0 / 0 | 0 | belege/P0-MESS-02/forced-colors/stellen__m375-light.webp |
| stellen | d1440 | ja | 26 / 27 | 4 | 0 / 0 | 0 / 0 | 0 | belege/P0-MESS-02/forced-colors/stellen__d1440-light.webp |
| stelle-anlagenmechaniker | m375 | ja | 18 / 23 | 3 | 4 / 10 | 0 / 0 | 0 | belege/P0-MESS-02/forced-colors/stelle-anlagenmechaniker__m375-light.webp |
| stelle-anlagenmechaniker | d1440 | ja | 26 / 28 | 3 | 3 / 9 | 0 / 0 | 0 | belege/P0-MESS-02/forced-colors/stelle-anlagenmechaniker__d1440-light.webp |
| bewerbung | m375 | ja | 4 / 9 | 0 | 0 / 6 | 0 / 0 | 0 | belege/P0-MESS-02/forced-colors/bewerbung__m375-light.webp |
| bewerbung | d1440 | ja | 4 / 9 | 0 | 0 / 6 | 0 / 0 | 0 | belege/P0-MESS-02/forced-colors/bewerbung__d1440-light.webp |

Beispiele ohne Umrandung/Unterstreichung (je Lauf bis 6):

- start m375: link „Bad und Energie GmbH Lahn Dill, zur Startseite“ (Nav/Kopf/Fuß); link „Jetzt bewerben“ (Nav/Kopf/Fuß); link „Anlagenmechaniker SHK“ (Fließtext); link „Kundendiensttechniker“ (Fließtext); link „Obermonteur / Projektleiter“ (Fließtext); link „Ausbildung Anlagenmechaniker“ (Fließtext)
- start d1440: link „Bad und Energie GmbH Lahn Dill, zur Startseite“ (Nav/Kopf/Fuß); link „Stellen“ (Nav/Kopf/Fuß); link „Vorteile“ (Nav/Kopf/Fuß); link „Ablauf“ (Nav/Kopf/Fuß); link „FAQ“ (Nav/Kopf/Fuß); link „06441 42956 anrufen“ (Nav/Kopf/Fuß)
- stellen m375: link „Bad und Energie GmbH Lahn Dill, zur Startseite“ (Nav/Kopf/Fuß); link „Startseite“ (Nav/Kopf/Fuß); link „Anlagenmechaniker SHK“ (Fließtext); link „Kundendiensttechniker“ (Fließtext); link „Obermonteur / Projektleiter“ (Fließtext); link „Ausbildung Anlagenmechaniker“ (Fließtext)
- stellen d1440: link „Bad und Energie GmbH Lahn Dill, zur Startseite“ (Nav/Kopf/Fuß); link „Stellen“ (Nav/Kopf/Fuß); link „Vorteile“ (Nav/Kopf/Fuß); link „Ablauf“ (Nav/Kopf/Fuß); link „FAQ“ (Nav/Kopf/Fuß); link „06441 42956 anrufen“ (Nav/Kopf/Fuß)
- stelle-anlagenmechaniker m375: link „Bad und Energie GmbH Lahn Dill, zur Startseite“ (Nav/Kopf/Fuß); link „Startseite“ (Nav/Kopf/Fuß); link „Stellen“ (Nav/Kopf/Fuß); link „Kundendiensttechniker“ (Fließtext); link „Obermonteur / Projektleiter“ (Fließtext); link „Ausbildung Anlagenmechaniker“ (Fließtext)
- stelle-anlagenmechaniker d1440: link „Bad und Energie GmbH Lahn Dill, zur Startseite“ (Nav/Kopf/Fuß); link „Stellen“ (Nav/Kopf/Fuß); link „Vorteile“ (Nav/Kopf/Fuß); link „Ablauf“ (Nav/Kopf/Fuß); link „FAQ“ (Nav/Kopf/Fuß); link „06441 42956 anrufen“ (Nav/Kopf/Fuß)
- bewerbung m375: link „Bad und Energie GmbH Lahn Dill, zur Startseite“ (Nav/Kopf/Fuß); link „Abbrechen“ (Nav/Kopf/Fuß); link „Impressum“ (Nav/Kopf/Fuß); link „Datenschutz“ (Nav/Kopf/Fuß)
- bewerbung d1440: link „Bad und Energie GmbH Lahn Dill, zur Startseite“ (Nav/Kopf/Fuß); link „Abbrechen“ (Nav/Kopf/Fuß); link „Impressum“ (Nav/Kopf/Fuß); link „Datenschutz“ (Nav/Kopf/Fuß)

## 6 · Ohne JavaScript
| Seite | Ansicht | Status | Titel vorhanden | h1 | main-Textlänge | opacity 0 im ersten Bildschirm (davon mit Text) | noscript |
|---|---|---:|---|---:|---:|---|---:|
| start | m375 | 200 | ja | 1 | 8857 | 0 (0) | 0 |
| start | d1440 | 200 | ja | 1 | 8857 | 0 (0) | 0 |
| stellen | m375 | 200 | ja | 1 | 1537 | 0 (0) | 0 |
| stellen | d1440 | 200 | ja | 1 | 1537 | 0 (0) | 0 |
| stelle-anlagenmechaniker | m375 | 200 | ja | 1 | 4055 | 0 (0) | 0 |
| stelle-anlagenmechaniker | d1440 | 200 | ja | 1 | 4094 | 0 (0) | 0 |
| stelle-kundendienst | m375 | 200 | ja | 1 | 4072 | 0 (0) | 0 |
| stelle-kundendienst | d1440 | 200 | ja | 1 | 4111 | 0 (0) | 0 |
| stelle-obermonteur | m375 | 200 | ja | 1 | 3977 | 0 (0) | 0 |
| stelle-obermonteur | d1440 | 200 | ja | 1 | 4016 | 0 (0) | 0 |
| stelle-ausbildung | m375 | 200 | ja | 1 | 3330 | 0 (0) | 0 |
| stelle-ausbildung | d1440 | 200 | ja | 1 | 3369 | 0 (0) | 0 |
| bewerbung | m375 | 200 | ja | 1 | 611 | 6 (0) | 0 |
| bewerbung | d1440 | 200 | ja | 1 | 611 | 6 (0) | 0 |
| bewerbung-danke | m375 | 200 | ja | 1 | 25 | 0 (0) | 0 |
| bewerbung-danke | d1440 | 200 | ja | 1 | 25 | 0 (0) | 0 |
| bewerbung-mappe | m375 | 200 | ja | 1 | 3126 | 0 (0) | 0 |
| bewerbung-mappe | d1440 | 200 | ja | 1 | 3204 | 0 (0) | 0 |
| datenschutz | m375 | 200 | ja | 1 | 18437 | 0 (0) | 0 |
| datenschutz | d1440 | 200 | ja | 1 | 18437 | 0 (0) | 0 |
| impressum | m375 | 200 | ja | 1 | 1740 | 0 (0) | 0 |
| impressum | d1440 | 200 | ja | 1 | 1740 | 0 (0) | 0 |
| fehler-404 | m375 | 404 | ja | 1 | 182 | 0 (0) | 0 |
| fehler-404 | d1440 | 404 | ja | 1 | 182 | 0 (0) | 0 |

Elemente mit opacity 0 im ersten Bildschirm:

- bewerbung m375: svg in „Anlagenmechaniker SHK“; svg in „Kundendiensttechniker“; svg in „Obermonteur / Projektleiter“; svg in „Ausbildung Anlagenmechaniker“; svg in „Quereinstieg / Montagehelfer“
- bewerbung d1440: svg in „Anlagenmechaniker SHK“; svg in „Kundendiensttechniker“; svg in „Obermonteur / Projektleiter“; svg in „Ausbildung Anlagenmechaniker“; svg in „Quereinstieg / Montagehelfer“
