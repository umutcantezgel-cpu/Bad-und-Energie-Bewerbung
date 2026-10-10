# Slop-Prüfung, weiche Befunde S-08 bis S-14 · Ausgangsstand (P0-SLOP-02)

Erstellt 2026-10-09T07:51:54.149Z · Kern-Version 0 (keine Leitidee, keine Begründung anerkannt) · Basis http://localhost:3500 (Produktions-Build, nicht neu gebaut)

## Messbedingungen

- **Bildbestand:** _relaunch/belege/p0-ausgangsstand/*.webp (Bewegung: reduce laut bericht.json, erstellt 2026-10-09T07:21:11Z); Ansichten d1440-light und m375-light für alle 12 Seiten, bei Hauptseiten zusätzlich t768-light und d1440-dark. .roh wurde nicht benötigt.
- **Betrachtung:** Ausschnitte als Einzelbilder (Startseite, Stellen, Stelle Anlagenmechaniker, 404 teils in voller Größe) und als beschriftete, auf 28–60 % verkleinerte Übersichtsblätter (alle übrigen); Ausschnittsnummern und y-Werte beziehen sich auf die Originaldatei (d1440/t768: 1440 px Breite; m375: 750 px Breite).
- **HTML:** GET auf alle 12 Pfade (Status 200, die 404-Seite 404), sichtbarer Text ohne script/style; Suche nach Begriffsliste und Zusatzbegriffen (professionell, kompetent, hochwertig, exzellent u. a., nicht gezählt).
- **Code:** Gelesen: app/layout.tsx, app/styles/theme.css, app/globals.css, components/ui/*, components/home/*, components/jobs/*, components/reviews/*, components/site/HeaderBar.tsx, app/not-found.tsx, app/error.tsx, app/bewerbung/*, components/legal/*, components/brand/Logo.tsx, lib/jobs/format.ts, lib/data/reviews.data.ts. Durchsucht: app, components, lib/content, lib/jobs/data, lib/data, lib/mappe, lib/seo.
- **Zählweise:** Eine Instanz = ein Vorkommen je Seite mit Ort. Gemeinsame Bausteine (Kopfzeile) zählen auf jeder Seite, zusätzlich werden eindeutige Fundstellen gesondert genannt. S-08 höchstens einmal je Seite, S-12 je Folge, S-11 je Raster, S-13 je Vorkommen. Grenzfälle sind nicht in den Summen.

## Zählung (gezählte Befunde, ohne Grenzfälle)

| Seite | S-08 | S-09 | S-10 | S-11 | S-12 | S-13 | S-14 | Summe |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| start (Hauptseite) | 0 | 1 | 0 | 1 | 0 | 0 | 0 | 2 |
| stellen (Hauptseite) | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 1 |
| stelle-anlagenmechaniker (Hauptseite) | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 2 |
| stelle-kundendienst | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 2 |
| stelle-obermonteur | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 2 |
| stelle-ausbildung | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 2 |
| bewerbung (Hauptseite) | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 1 |
| bewerbung-danke | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 1 |
| bewerbung-mappe | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 1 |
| datenschutz | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 1 |
| impressum | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 1 |
| fehler-404 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 1 |
| **Summe** | **0** | **12** | **0** | **1** | **4** | **0** | **0** | **17** |

- Hauptseiten (start, stellen, stelle-anlagenmechaniker, bewerbung): **6**; übrige 8 Seiten: **11**.
- Eindeutige Fundstellen: **3** (S-09 components/site/HeaderBar.tsx:55-61 auf 12 Seite(n); S-11 components/home/BenefitGrid.tsx:55-67 auf 1 Seite(n); S-12 components/jobs/JobSections.tsx:58-72 auf 4 Seite(n)).
- Ohne die Kopfzeile (S-09, 12 Treffer an einer Stelle, siehe F-02): **5**.

### Grenzfälle (nicht in den Summen)

| Seite | S-08 | S-09 | S-10 | S-11 | S-12 | S-13 | S-14 | Summe |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| start | 1 | 0 | 0 | 2 | 1 | 1 | 1 | 6 |
| stellen | 1 | 0 | 0 | 1 | 0 | 0 | 1 | 3 |
| stelle-anlagenmechaniker | 1 | 0 | 0 | 1 | 0 | 0 | 1 | 3 |
| stelle-kundendienst | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 2 |
| stelle-obermonteur | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 2 |
| stelle-ausbildung | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 2 |
| bewerbung | 1 | 0 | 0 | 0 | 0 | 0 | 1 | 2 |
| bewerbung-danke | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| bewerbung-mappe | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 2 |
| datenschutz | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 2 |
| impressum | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 2 |
| fehler-404 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 2 |
| **Summe** | **12** | **0** | **1** | **7** | **3** | **2** | **4** | **29** |

Mit allen Grenzfällen (milde Lesart): 46.

## S-08 im Einzelnen (Schritt 1 des Pakets)

| Frage | Befund | Fundstelle |
| --- | --- | --- |
| Einzige Schrift? | Ja: Inter über next/font (latin, swap) als `--font-inter`, Rückfallstapel Systemschrift. Gewichte 400–700. Keine zweite Schrift auf den Seiten (`font-mono`/`serif`/`font-family` nur in global-error.tsx:25 Systemschrift, og-render.tsx:72 Inter, E-Mail-Vorlage). | app/layout.tsx:16-20, :78; app/styles/theme.css:109 |
| Standardradien? | Nein: Tailwind-Radien sind gelöscht (`--radius-*: initial`) und durch 6/10/14/20/28 px und full ersetzt. Klassenhäufigkeit in app/ und components/ (*.tsx): rounded-full 18, rounded-xs 17, rounded-lg 15, rounded-md 6, rounded-xl 2, rounded-sm 1. Karten einheitlich `rounded-lg` (20 px). | app/styles/theme.css:83-89; components/ui/Card.tsx:9 |
| Standardschatten? | Nein: Tailwind-Schatten gelöscht, drei marineblau getönte eigene. Genutzt nur `shadow-lg` (4 ×: Toast.tsx:45, ToastCard.tsx:42, Sheet.tsx:90, SkipLink.tsx:18); Karten ohne Schatten. | app/styles/theme.css:92-95 |
| Ergebnis | Schrift ja, Radien/Schatten nein; wegen „und“ im Katalog 0 gezählt, 12 Grenzfälle (F-01). | |

## Befunde je Seite (gezählt)

### start (/) · 2 Befund(e)

| ID | Ort | Komponente (Datei:Zeile) | Beschreibung |
| --- | --- | --- | --- |
| S-09 | start__d1440-light__01.webp, y 0–66 (Kopfzeile). Der Weichzeichner ist im Bildschirmfoto bei Scrollstand 0 nicht erkennbar; belegt durch Code, ausgeliefertes HTML (<header class="sticky top-0 z-30 … bg-surface/80 backdrop-blur …">) und CSS (.backdrop-blur{blur(8px)}). | components/site/HeaderBar.tsx:55-61 (Klassen Zeile 58), eingebunden über app/layout.tsx:83 | Glaseffekt: Kopfzeile mit 80 % Deckkraft und 8 px Hintergrundunschärfe (backdrop-filter), auf jeder Seite. Es gibt noch keine Leitidee, daher gilt keine Begründung als anerkannt. |
| S-11 | start__d1440-light__03.webp y 420–900 und __04 y 0–75 (4 × 2); start__t768-light__03 (2 × 4); start__m375-light__04 (y ca. 870–1624), __05, __06 (y 0–1010) (1 Spalte); start__d1440-dark__03 | components/home/BenefitGrid.tsx:55-67 (Raster Zeile 55, Karte Zeilen 60-64); Daten components/home/content.ts:98-107 | Abschnitt „Das bekommst du“: 8 gleichförmige Karten (Icon 24 px, Überschrift, 1–5 Zeilen Text, gleiche Fläche bg-surface-raised, gleicher Radius und Innenabstand) als einziges Inhaltsmuster des Abschnitts; keine Gewichtung zwischen den Karten. |

### stellen (/jobs) · 1 Befund(e)

| ID | Ort | Komponente (Datei:Zeile) | Beschreibung |
| --- | --- | --- | --- |
| S-09 | stellen__d1440-light__01.webp, y 0–66 (Kopfzeile). Der Weichzeichner ist im Bildschirmfoto bei Scrollstand 0 nicht erkennbar; belegt durch Code, ausgeliefertes HTML (<header class="sticky top-0 z-30 … bg-surface/80 backdrop-blur …">) und CSS (.backdrop-blur{blur(8px)}). | components/site/HeaderBar.tsx:55-61 (Klassen Zeile 58), eingebunden über app/layout.tsx:83 | Glaseffekt: Kopfzeile mit 80 % Deckkraft und 8 px Hintergrundunschärfe (backdrop-filter), auf jeder Seite. Es gibt noch keine Leitidee, daher gilt keine Begründung als anerkannt. |

### stelle-anlagenmechaniker (/jobs/anlagenmechaniker-shk-wetzlar) · 2 Befund(e)

| ID | Ort | Komponente (Datei:Zeile) | Beschreibung |
| --- | --- | --- | --- |
| S-09 | stelle-anlagenmechaniker__d1440-light__01.webp, y 0–66 (Kopfzeile). Der Weichzeichner ist im Bildschirmfoto bei Scrollstand 0 nicht erkennbar; belegt durch Code, ausgeliefertes HTML (<header class="sticky top-0 z-30 … bg-surface/80 backdrop-blur …">) und CSS (.backdrop-blur{blur(8px)}). | components/site/HeaderBar.tsx:55-61 (Klassen Zeile 58), eingebunden über app/layout.tsx:83 | Glaseffekt: Kopfzeile mit 80 % Deckkraft und 8 px Hintergrundunschärfe (backdrop-filter), auf jeder Seite. Es gibt noch keine Leitidee, daher gilt keine Begründung als anerkannt. |
| S-12 | stelle-anlagenmechaniker__d1440-light__01.webp y 570–900, __02 (komplett), __03 y 0–345; m375-light__02–__04 (bis y ca. 1050); t768-light__01 (unten), __02; d1440-dark__01–__03 | components/jobs/JobSections.tsx:58-72 (Abschnittsschleife, Zeile 62), :23-52 (Listenformen); components/jobs/PackageList.tsx:14-24; Reihenfolge lib/jobs/format.ts:155-171; Einbindung app/jobs/[slug]/page.tsx:127-129 | Fünf aufeinanderfolgende Abschnitte „Das erwartet dich“, „Das bringst du mit“, „Das bekommst du“, „Dein Paket“, „Auf einen Blick“ mit gleichem Gerüst (H2 title-3 + Liste bzw. Beschriftungsreihen), gleicher Spaltenbreite und Dichte. Im Textstrang gibt es keinen Blickfang; die Gehaltskarte steht in der Seitenspalte (ab lg) bzw. über dem Text. |

### stelle-kundendienst (/jobs/kundendiensttechniker-waermepumpe-wetzlar) · 2 Befund(e)

| ID | Ort | Komponente (Datei:Zeile) | Beschreibung |
| --- | --- | --- | --- |
| S-09 | stelle-kundendienst__d1440-light__01.webp, y 0–66 (Kopfzeile). Der Weichzeichner ist im Bildschirmfoto bei Scrollstand 0 nicht erkennbar; belegt durch Code, ausgeliefertes HTML (<header class="sticky top-0 z-30 … bg-surface/80 backdrop-blur …">) und CSS (.backdrop-blur{blur(8px)}). | components/site/HeaderBar.tsx:55-61 (Klassen Zeile 58), eingebunden über app/layout.tsx:83 | Glaseffekt: Kopfzeile mit 80 % Deckkraft und 8 px Hintergrundunschärfe (backdrop-filter), auf jeder Seite. Es gibt noch keine Leitidee, daher gilt keine Begründung als anerkannt. |
| S-12 | stelle-kundendienst__d1440-light__01.webp y 600–900, __02 (komplett), __03 y 0–100; m375-light__02–__04 (bis y ca. 1200) | components/jobs/JobSections.tsx:58-72 (Abschnittsschleife, Zeile 62), :23-52 (Listenformen); components/jobs/PackageList.tsx:14-24; Reihenfolge lib/jobs/format.ts:155-171; Einbindung app/jobs/[slug]/page.tsx:127-129 | Fünf aufeinanderfolgende Abschnitte „Das erwartet dich“, „Das bringst du mit“, „Das bekommst du“, „Dein Paket“, „Auf einen Blick“ mit gleichem Gerüst (H2 title-3 + Liste bzw. Beschriftungsreihen), gleicher Spaltenbreite und Dichte. Im Textstrang gibt es keinen Blickfang; die Gehaltskarte steht in der Seitenspalte (ab lg) bzw. über dem Text. |

### stelle-obermonteur (/jobs/obermonteur-projektleiter-shk-wetzlar) · 2 Befund(e)

| ID | Ort | Komponente (Datei:Zeile) | Beschreibung |
| --- | --- | --- | --- |
| S-09 | stelle-obermonteur__d1440-light__01.webp, y 0–66 (Kopfzeile). Der Weichzeichner ist im Bildschirmfoto bei Scrollstand 0 nicht erkennbar; belegt durch Code, ausgeliefertes HTML (<header class="sticky top-0 z-30 … bg-surface/80 backdrop-blur …">) und CSS (.backdrop-blur{blur(8px)}). | components/site/HeaderBar.tsx:55-61 (Klassen Zeile 58), eingebunden über app/layout.tsx:83 | Glaseffekt: Kopfzeile mit 80 % Deckkraft und 8 px Hintergrundunschärfe (backdrop-filter), auf jeder Seite. Es gibt noch keine Leitidee, daher gilt keine Begründung als anerkannt. |
| S-12 | stelle-obermonteur__d1440-light__01.webp y 550–900, __02 (komplett), __03 y 0–110; m375-light__02–__04 (bis y ca. 950) | components/jobs/JobSections.tsx:58-72 (Abschnittsschleife, Zeile 62), :23-52 (Listenformen); components/jobs/PackageList.tsx:14-24; Reihenfolge lib/jobs/format.ts:155-171; Einbindung app/jobs/[slug]/page.tsx:127-129 | Fünf aufeinanderfolgende Abschnitte „Das erwartet dich“, „Das bringst du mit“, „Das bekommst du“, „Dein Paket“, „Auf einen Blick“ mit gleichem Gerüst (H2 title-3 + Liste bzw. Beschriftungsreihen), gleicher Spaltenbreite und Dichte. Im Textstrang gibt es keinen Blickfang; die Gehaltskarte steht in der Seitenspalte (ab lg) bzw. über dem Text. |

### stelle-ausbildung (/jobs/ausbildung-anlagenmechaniker-shk-wetzlar) · 2 Befund(e)

| ID | Ort | Komponente (Datei:Zeile) | Beschreibung |
| --- | --- | --- | --- |
| S-09 | stelle-ausbildung__d1440-light__01.webp, y 0–66 (Kopfzeile). Der Weichzeichner ist im Bildschirmfoto bei Scrollstand 0 nicht erkennbar; belegt durch Code, ausgeliefertes HTML (<header class="sticky top-0 z-30 … bg-surface/80 backdrop-blur …">) und CSS (.backdrop-blur{blur(8px)}). | components/site/HeaderBar.tsx:55-61 (Klassen Zeile 58), eingebunden über app/layout.tsx:83 | Glaseffekt: Kopfzeile mit 80 % Deckkraft und 8 px Hintergrundunschärfe (backdrop-filter), auf jeder Seite. Es gibt noch keine Leitidee, daher gilt keine Begründung als anerkannt. |
| S-12 | stelle-ausbildung__d1440-light__01.webp y 580–900, __02 (komplett), __03 y 0–80; m375-light__01 (unten ab y ca. 920), __02, __03, __04 (bis y ca. 170) | components/jobs/JobSections.tsx:58-72 (Abschnittsschleife, Zeile 62), :23-52 (Listenformen); components/jobs/PackageList.tsx:14-24; Reihenfolge lib/jobs/format.ts:155-171; Einbindung app/jobs/[slug]/page.tsx:127-129 | Fünf aufeinanderfolgende Abschnitte „Das erwartet dich“, „Das bringst du mit“, „Das bekommst du“, „Dein Paket“, „Auf einen Blick“ mit gleichem Gerüst (H2 title-3 + Liste bzw. Beschriftungsreihen), gleicher Spaltenbreite und Dichte. Im Textstrang gibt es keinen Blickfang; die Gehaltskarte steht in der Seitenspalte (ab lg) bzw. über dem Text. |

### bewerbung (/bewerbung) · 1 Befund(e)

| ID | Ort | Komponente (Datei:Zeile) | Beschreibung |
| --- | --- | --- | --- |
| S-09 | bewerbung__d1440-light__01.webp, y 0–66 (Kopfzeile). Der Weichzeichner ist im Bildschirmfoto bei Scrollstand 0 nicht erkennbar; belegt durch Code, ausgeliefertes HTML (<header class="sticky top-0 z-30 … bg-surface/80 backdrop-blur …">) und CSS (.backdrop-blur{blur(8px)}). | components/site/HeaderBar.tsx:55-61 (Klassen Zeile 58), eingebunden über app/layout.tsx:83 | Glaseffekt: Kopfzeile mit 80 % Deckkraft und 8 px Hintergrundunschärfe (backdrop-filter), auf jeder Seite. Es gibt noch keine Leitidee, daher gilt keine Begründung als anerkannt. |

### bewerbung-danke (/bewerbung/danke) · 1 Befund(e)

| ID | Ort | Komponente (Datei:Zeile) | Beschreibung |
| --- | --- | --- | --- |
| S-09 | bewerbung-danke__d1440-light__01.webp, y 0–66 (Kopfzeile). Der Weichzeichner ist im Bildschirmfoto bei Scrollstand 0 nicht erkennbar; belegt durch Code, ausgeliefertes HTML (<header class="sticky top-0 z-30 … bg-surface/80 backdrop-blur …">) und CSS (.backdrop-blur{blur(8px)}). | components/site/HeaderBar.tsx:55-61 (Klassen Zeile 58), eingebunden über app/layout.tsx:83 | Glaseffekt: Kopfzeile mit 80 % Deckkraft und 8 px Hintergrundunschärfe (backdrop-filter), auf jeder Seite. Es gibt noch keine Leitidee, daher gilt keine Begründung als anerkannt. |

### bewerbung-mappe (/bewerbung/mappe) · 1 Befund(e)

| ID | Ort | Komponente (Datei:Zeile) | Beschreibung |
| --- | --- | --- | --- |
| S-09 | bewerbung-mappe__d1440-light__01.webp, y 0–66 (Kopfzeile). Der Weichzeichner ist im Bildschirmfoto bei Scrollstand 0 nicht erkennbar; belegt durch Code, ausgeliefertes HTML (<header class="sticky top-0 z-30 … bg-surface/80 backdrop-blur …">) und CSS (.backdrop-blur{blur(8px)}). | components/site/HeaderBar.tsx:55-61 (Klassen Zeile 58), eingebunden über app/layout.tsx:83 | Glaseffekt: Kopfzeile mit 80 % Deckkraft und 8 px Hintergrundunschärfe (backdrop-filter), auf jeder Seite. Es gibt noch keine Leitidee, daher gilt keine Begründung als anerkannt. |

### datenschutz (/datenschutz) · 1 Befund(e)

| ID | Ort | Komponente (Datei:Zeile) | Beschreibung |
| --- | --- | --- | --- |
| S-09 | datenschutz__d1440-light__01.webp, y 0–66 (Kopfzeile). Der Weichzeichner ist im Bildschirmfoto bei Scrollstand 0 nicht erkennbar; belegt durch Code, ausgeliefertes HTML (<header class="sticky top-0 z-30 … bg-surface/80 backdrop-blur …">) und CSS (.backdrop-blur{blur(8px)}). | components/site/HeaderBar.tsx:55-61 (Klassen Zeile 58), eingebunden über app/layout.tsx:83 | Glaseffekt: Kopfzeile mit 80 % Deckkraft und 8 px Hintergrundunschärfe (backdrop-filter), auf jeder Seite. Es gibt noch keine Leitidee, daher gilt keine Begründung als anerkannt. |

### impressum (/impressum) · 1 Befund(e)

| ID | Ort | Komponente (Datei:Zeile) | Beschreibung |
| --- | --- | --- | --- |
| S-09 | impressum__d1440-light__01.webp, y 0–66 (Kopfzeile). Der Weichzeichner ist im Bildschirmfoto bei Scrollstand 0 nicht erkennbar; belegt durch Code, ausgeliefertes HTML (<header class="sticky top-0 z-30 … bg-surface/80 backdrop-blur …">) und CSS (.backdrop-blur{blur(8px)}). | components/site/HeaderBar.tsx:55-61 (Klassen Zeile 58), eingebunden über app/layout.tsx:83 | Glaseffekt: Kopfzeile mit 80 % Deckkraft und 8 px Hintergrundunschärfe (backdrop-filter), auf jeder Seite. Es gibt noch keine Leitidee, daher gilt keine Begründung als anerkannt. |

### fehler-404 (/gibt-es-nicht-404) · 1 Befund(e)

| ID | Ort | Komponente (Datei:Zeile) | Beschreibung |
| --- | --- | --- | --- |
| S-09 | fehler-404__d1440-light__01.webp, y 0–66 (Kopfzeile). Der Weichzeichner ist im Bildschirmfoto bei Scrollstand 0 nicht erkennbar; belegt durch Code, ausgeliefertes HTML (<header class="sticky top-0 z-30 … bg-surface/80 backdrop-blur …">) und CSS (.backdrop-blur{blur(8px)}). | components/site/HeaderBar.tsx:55-61 (Klassen Zeile 58), eingebunden über app/layout.tsx:83 | Glaseffekt: Kopfzeile mit 80 % Deckkraft und 8 px Hintergrundunschärfe (backdrop-filter), auf jeder Seite. Es gibt noch keine Leitidee, daher gilt keine Begründung als anerkannt. |

## Grenzfälle je Seite (nicht gezählt, siehe offene Fragen)

### start · 6 Grenzfall/-fälle

| ID | Frage | Ort | Komponente (Datei:Zeile) | Beschreibung |
| --- | --- | --- | --- | --- |
| S-08 | F-01 | start__d1440-light__01.webp (gesamte Seite; Schrift auf jedem Ausschnitt) | app/layout.tsx:16-20, :78; app/styles/theme.css:83-95, :109 | Teilbedingung „Standardschrift als einzige Schrift“ erfüllt: Inter ist die einzige Schrift (app/layout.tsx:16-20, app/styles/theme.css:109). Teilbedingung „Standardradien und -schatten überall“ nicht erfüllt: Radien (6/10/14/20/28 px, theme.css:83-89) und Schatten (marineblau getönt, theme.css:92-95) sind eigene Token, Schatten kommen nur in Toast, Sheet und Skip-Link vor, Karten haben keinen. Wegen „und“ im Katalog nicht gezählt. |
| S-11 | F-03 | start__d1440-light__02.webp y 310–840 (2 × 2); start__m375-light__02 (y ca. 870–1624), __03, __04 (y 0–150); start__t768-light__02 | components/home/JobList.tsx:28-34; components/jobs/JobCard.tsx:15-41; components/ui/Card.tsx:9 | Raster aus gleichförmigen Karten (Überschrift, 2–3 Zeilen Text, Eckdaten, „Zur Stelle“), aber ohne Icon; jede Karte steht für eine andere Stelle mit eigenem Gehalt, also mit inhaltlicher Logik. |
| S-11 | F-03 | start__d1440-light__07.webp y 805–900 und __08 y 0–290 (3 sichtbare Karten); start__m375-light__12 (y ca. 360–1260) | components/reviews/ReviewScroller.tsx:127-175 (Karte Zeile 147); Daten lib/data/reviews.data.ts, components/reviews/data.ts:34-39 | Waagerechte Reihe gleichförmiger Stimmen-Karten (Sterne bzw. Quelle, Zitat, Name, Rolle); echte Kunden- und Teamzitate, ohne Icon. |
| S-12 | F-04 | start__d1440-light__02.webp – __09 (Abschnitte „Offene Stellen“, „Das bekommst du“, „35 km um Wetzlar“, „In 3 Schritten“, „15 Leute …“, „Häufige Fragen“); start__m375-light__02–__13 | app/page.tsx:41-50; components/home/SectionHeader.tsx:13-20 (gemeinsamer Kopf: H2 title-1 + Lead); BenefitGrid.tsx:55-67, JobList.tsx:28-34, ProcessTimeline.tsx:19-33 | Alle Abschnitte beginnen mit demselben Kopf (linksbündige H2 title-1 + Lead) und wechseln nur den Hintergrund; „Offene Stellen“ und „Das bekommst du“ sind beide Kartenraster, „Ablauf“ ein Dreierraster. Dazwischen steht aber „Einsatzgebiet“ mit Grafik und Tabelle (anderes Muster, Blickfang), und die Hero-Überschrift ist ein klarer Blickfang. Die Folge gleicher Muster ist daher nur 2 lang; nach der strengen Lesart (gleiche Struktur UND Dichte) nicht gezählt. |
| S-13 | F-05 | start__d1440-light__08.webp (Stimmenreihe, Karte „Rainer Debus“; im Bild nur sichtbar, wenn die Reihe weitergescrollt wird; im ausgelieferten HTML enthalten) | lib/data/reviews.data.ts:190 („Ein rundum empfehlenswerter Fachpartner in Mittelhessen.“); gerendert über components/reviews/ReviewScroller.tsx:158 | Das Wort „rundum“ aus der Begriffsliste steht in einer echten Google-Bewertung eines Kunden (Fremdzitat, wortgetreu zu belassen), nicht im eigenen Text. |
| S-14 | F-06 | start__d1440-dark__01.webp y 0–66 (Logo links oben); start__m375-dark__01 (Logo y 0–110) | components/brand/Logo.tsx:26-39 (Filterklassen Zeile 35), Datei public/images/bad-energie-lahn-dill-logo-transparent.webp (Raster 662 × 121) | Einziges Bild der Seiten ist das Logo. Im Dunkelmodus wird das farbige Rasterlogo per CSS-Filter (brightness-0 invert) zur flachen weißen Silhouette, Emblem-Details verschmelzen (uneinheitliche Bildbearbeitung hell/dunkel). Keine Stock- oder KI-Ästhetik, es gibt keine Fotos oder Illustrationen. |

### stellen · 3 Grenzfall/-fälle

| ID | Frage | Ort | Komponente (Datei:Zeile) | Beschreibung |
| --- | --- | --- | --- | --- |
| S-08 | F-01 | stellen__d1440-light__01.webp (gesamte Seite; Schrift auf jedem Ausschnitt) | app/layout.tsx:16-20, :78; app/styles/theme.css:83-95, :109 | Teilbedingung „Standardschrift als einzige Schrift“ erfüllt: Inter ist die einzige Schrift (app/layout.tsx:16-20, app/styles/theme.css:109). Teilbedingung „Standardradien und -schatten überall“ nicht erfüllt: Radien (6/10/14/20/28 px, theme.css:83-89) und Schatten (marineblau getönt, theme.css:92-95) sind eigene Token, Schatten kommen nur in Toast, Sheet und Skip-Link vor, Karten haben keinen. Wegen „und“ im Katalog nicht gezählt. |
| S-11 | F-03 | stellen__d1440-light__01.webp y 395–900 (2 × 2); stellen__m375-light__01 (ab y ca. 770), __02; stellen__t768-light__01 | app/jobs/page.tsx:74-80; components/jobs/JobCard.tsx:15-41 | Raster aus gleichförmigen Karten (Überschrift, 2–3 Zeilen Text, Eckdaten, „Zur Stelle“), aber ohne Icon; jede Karte steht für eine andere Stelle mit eigenem Gehalt, also mit inhaltlicher Logik. Das Raster ist hier das vorherrschende Muster der Seite. |
| S-14 | F-06 | stellen__d1440-dark__01.webp y 0–66 (Logo links oben); start__m375-dark__01 (Logo y 0–110) | components/brand/Logo.tsx:26-39 (Filterklassen Zeile 35), Datei public/images/bad-energie-lahn-dill-logo-transparent.webp (Raster 662 × 121) | Einziges Bild der Seiten ist das Logo. Im Dunkelmodus wird das farbige Rasterlogo per CSS-Filter (brightness-0 invert) zur flachen weißen Silhouette, Emblem-Details verschmelzen (uneinheitliche Bildbearbeitung hell/dunkel). Keine Stock- oder KI-Ästhetik, es gibt keine Fotos oder Illustrationen. |

### stelle-anlagenmechaniker · 3 Grenzfall/-fälle

| ID | Frage | Ort | Komponente (Datei:Zeile) | Beschreibung |
| --- | --- | --- | --- | --- |
| S-08 | F-01 | stelle-anlagenmechaniker__d1440-light__01.webp (gesamte Seite; Schrift auf jedem Ausschnitt) | app/layout.tsx:16-20, :78; app/styles/theme.css:83-95, :109 | Teilbedingung „Standardschrift als einzige Schrift“ erfüllt: Inter ist die einzige Schrift (app/layout.tsx:16-20, app/styles/theme.css:109). Teilbedingung „Standardradien und -schatten überall“ nicht erfüllt: Radien (6/10/14/20/28 px, theme.css:83-89) und Schatten (marineblau getönt, theme.css:92-95) sind eigene Token, Schatten kommen nur in Toast, Sheet und Skip-Link vor, Karten haben keinen. Wegen „und“ im Katalog nicht gezählt. |
| S-11 | F-03 | stelle-anlagenmechaniker__d1440-light__06.webp, __07; m375-light__08–__10; t768-light__05 (unten), __06 | components/jobs/MoreJobs.tsx:40-46; components/jobs/JobCard.tsx:15-41 | Band „Weitere Stellen“: 3 JobCards in einer Reihe, ohne Icon, je eine andere Stelle. |
| S-14 | F-06 | stelle-anlagenmechaniker__d1440-dark__01.webp y 0–66 (Logo links oben); start__m375-dark__01 (Logo y 0–110) | components/brand/Logo.tsx:26-39 (Filterklassen Zeile 35), Datei public/images/bad-energie-lahn-dill-logo-transparent.webp (Raster 662 × 121) | Einziges Bild der Seiten ist das Logo. Im Dunkelmodus wird das farbige Rasterlogo per CSS-Filter (brightness-0 invert) zur flachen weißen Silhouette, Emblem-Details verschmelzen (uneinheitliche Bildbearbeitung hell/dunkel). Keine Stock- oder KI-Ästhetik, es gibt keine Fotos oder Illustrationen. |

### stelle-kundendienst · 2 Grenzfall/-fälle

| ID | Frage | Ort | Komponente (Datei:Zeile) | Beschreibung |
| --- | --- | --- | --- | --- |
| S-08 | F-01 | stelle-kundendienst__d1440-light__01.webp (gesamte Seite; Schrift auf jedem Ausschnitt) | app/layout.tsx:16-20, :78; app/styles/theme.css:83-95, :109 | Teilbedingung „Standardschrift als einzige Schrift“ erfüllt: Inter ist die einzige Schrift (app/layout.tsx:16-20, app/styles/theme.css:109). Teilbedingung „Standardradien und -schatten überall“ nicht erfüllt: Radien (6/10/14/20/28 px, theme.css:83-89) und Schatten (marineblau getönt, theme.css:92-95) sind eigene Token, Schatten kommen nur in Toast, Sheet und Skip-Link vor, Karten haben keinen. Wegen „und“ im Katalog nicht gezählt. |
| S-11 | F-03 | stelle-kundendienst__d1440-light__06.webp (3 Karten); m375-light__08–__10 | components/jobs/MoreJobs.tsx:40-46; components/jobs/JobCard.tsx:15-41 | Band „Weitere Stellen“: 3 JobCards in einer Reihe, ohne Icon, je eine andere Stelle. |

### stelle-obermonteur · 2 Grenzfall/-fälle

| ID | Frage | Ort | Komponente (Datei:Zeile) | Beschreibung |
| --- | --- | --- | --- | --- |
| S-08 | F-01 | stelle-obermonteur__d1440-light__01.webp (gesamte Seite; Schrift auf jedem Ausschnitt) | app/layout.tsx:16-20, :78; app/styles/theme.css:83-95, :109 | Teilbedingung „Standardschrift als einzige Schrift“ erfüllt: Inter ist die einzige Schrift (app/layout.tsx:16-20, app/styles/theme.css:109). Teilbedingung „Standardradien und -schatten überall“ nicht erfüllt: Radien (6/10/14/20/28 px, theme.css:83-89) und Schatten (marineblau getönt, theme.css:92-95) sind eigene Token, Schatten kommen nur in Toast, Sheet und Skip-Link vor, Karten haben keinen. Wegen „und“ im Katalog nicht gezählt. |
| S-11 | F-03 | stelle-obermonteur__d1440-light__06.webp (3 Karten); m375-light__08–__10 | components/jobs/MoreJobs.tsx:40-46; components/jobs/JobCard.tsx:15-41 | Band „Weitere Stellen“: 3 JobCards in einer Reihe, ohne Icon, je eine andere Stelle. |

### stelle-ausbildung · 2 Grenzfall/-fälle

| ID | Frage | Ort | Komponente (Datei:Zeile) | Beschreibung |
| --- | --- | --- | --- | --- |
| S-08 | F-01 | stelle-ausbildung__d1440-light__01.webp (gesamte Seite; Schrift auf jedem Ausschnitt) | app/layout.tsx:16-20, :78; app/styles/theme.css:83-95, :109 | Teilbedingung „Standardschrift als einzige Schrift“ erfüllt: Inter ist die einzige Schrift (app/layout.tsx:16-20, app/styles/theme.css:109). Teilbedingung „Standardradien und -schatten überall“ nicht erfüllt: Radien (6/10/14/20/28 px, theme.css:83-89) und Schatten (marineblau getönt, theme.css:92-95) sind eigene Token, Schatten kommen nur in Toast, Sheet und Skip-Link vor, Karten haben keinen. Wegen „und“ im Katalog nicht gezählt. |
| S-11 | F-03 | stelle-ausbildung__d1440-light__05.webp (unten y ca. 520–900; Überschrift „Weitere Stellen“), __06 (3 Karten); m375-light__07–__09 | components/jobs/MoreJobs.tsx:40-46; components/jobs/JobCard.tsx:15-41 | Band „Weitere Stellen“: 3 JobCards in einer Reihe, ohne Icon, je eine andere Stelle. |

### bewerbung · 2 Grenzfall/-fälle

| ID | Frage | Ort | Komponente (Datei:Zeile) | Beschreibung |
| --- | --- | --- | --- | --- |
| S-08 | F-01 | bewerbung__d1440-light__01.webp (gesamte Seite; Schrift auf jedem Ausschnitt) | app/layout.tsx:16-20, :78; app/styles/theme.css:83-95, :109 | Teilbedingung „Standardschrift als einzige Schrift“ erfüllt: Inter ist die einzige Schrift (app/layout.tsx:16-20, app/styles/theme.css:109). Teilbedingung „Standardradien und -schatten überall“ nicht erfüllt: Radien (6/10/14/20/28 px, theme.css:83-89) und Schatten (marineblau getönt, theme.css:92-95) sind eigene Token, Schatten kommen nur in Toast, Sheet und Skip-Link vor, Karten haben keinen. Wegen „und“ im Katalog nicht gezählt. |
| S-14 | F-06 | bewerbung__d1440-dark__01.webp y 0–66 (Logo links oben); start__m375-dark__01 (Logo y 0–110) | components/brand/Logo.tsx:26-39 (Filterklassen Zeile 35), Datei public/images/bad-energie-lahn-dill-logo-transparent.webp (Raster 662 × 121) | Einziges Bild der Seiten ist das Logo. Im Dunkelmodus wird das farbige Rasterlogo per CSS-Filter (brightness-0 invert) zur flachen weißen Silhouette, Emblem-Details verschmelzen (uneinheitliche Bildbearbeitung hell/dunkel). Keine Stock- oder KI-Ästhetik, es gibt keine Fotos oder Illustrationen. |

### bewerbung-danke · 1 Grenzfall/-fälle

| ID | Frage | Ort | Komponente (Datei:Zeile) | Beschreibung |
| --- | --- | --- | --- | --- |
| S-08 | F-01 | bewerbung-danke__d1440-light__01.webp (gesamte Seite; Schrift auf jedem Ausschnitt) | app/layout.tsx:16-20, :78; app/styles/theme.css:83-95, :109 | Teilbedingung „Standardschrift als einzige Schrift“ erfüllt: Inter ist die einzige Schrift (app/layout.tsx:16-20, app/styles/theme.css:109). Teilbedingung „Standardradien und -schatten überall“ nicht erfüllt: Radien (6/10/14/20/28 px, theme.css:83-89) und Schatten (marineblau getönt, theme.css:92-95) sind eigene Token, Schatten kommen nur in Toast, Sheet und Skip-Link vor, Karten haben keinen. Wegen „und“ im Katalog nicht gezählt. |

### bewerbung-mappe · 2 Grenzfall/-fälle

| ID | Frage | Ort | Komponente (Datei:Zeile) | Beschreibung |
| --- | --- | --- | --- | --- |
| S-08 | F-01 | bewerbung-mappe__d1440-light__01.webp (gesamte Seite; Schrift auf jedem Ausschnitt) | app/layout.tsx:16-20, :78; app/styles/theme.css:83-95, :109 | Teilbedingung „Standardschrift als einzige Schrift“ erfüllt: Inter ist die einzige Schrift (app/layout.tsx:16-20, app/styles/theme.css:109). Teilbedingung „Standardradien und -schatten überall“ nicht erfüllt: Radien (6/10/14/20/28 px, theme.css:83-89) und Schatten (marineblau getönt, theme.css:92-95) sind eigene Token, Schatten kommen nur in Toast, Sheet und Skip-Link vor, Karten haben keinen. Wegen „und“ im Katalog nicht gezählt. |
| S-13 | F-05 | nicht im Bildbestand: erscheint erst, wenn im Werkzeug „Arbeitsstil“ die Option „Technologie und Energiewende“ gewählt wird (Standardzustand zeigt sie nicht) | lib/mappe/options.ts:45 („… Inbetriebnahme modernster Wärmepumpen und Digitalsteuerung.“) | Textbaustein des Anschreiben-Generators mit „modernster“ (Begriffsliste: „modernste“). Nur nach Nutzerwahl sichtbar, im Ausgangsrender nicht. |

### datenschutz · 2 Grenzfall/-fälle

| ID | Frage | Ort | Komponente (Datei:Zeile) | Beschreibung |
| --- | --- | --- | --- | --- |
| S-08 | F-01 | datenschutz__d1440-light__01.webp (gesamte Seite; Schrift auf jedem Ausschnitt) | app/layout.tsx:16-20, :78; app/styles/theme.css:83-95, :109 | Teilbedingung „Standardschrift als einzige Schrift“ erfüllt: Inter ist die einzige Schrift (app/layout.tsx:16-20, app/styles/theme.css:109). Teilbedingung „Standardradien und -schatten überall“ nicht erfüllt: Radien (6/10/14/20/28 px, theme.css:83-89) und Schatten (marineblau getönt, theme.css:92-95) sind eigene Token, Schatten kommen nur in Toast, Sheet und Skip-Link vor, Karten haben keinen. Wegen „und“ im Katalog nicht gezählt. |
| S-12 | F-04 | datenschutz__d1440-light__01.webp – __13; datenschutz__m375-light__01–__14 (12 Abschnitte „Verantwortlicher“ bis „Beschwerde bei der Aufsichtsbehörde“) | components/legal/LegalDocument.tsx:28-52; components/legal/LegalSection.tsx:14-22 | 12 Abschnitte in Folge mit gleichem Gerüst (H2 + Tabelle bzw. Fließtext) und ohne Blickfang. Rechtstext mit gesetzlich vorgegebener Gliederung, keine Erzählseite; nach Wortlaut des Katalogs („Erzählseiten“) nicht gezählt. |

### impressum · 2 Grenzfall/-fälle

| ID | Frage | Ort | Komponente (Datei:Zeile) | Beschreibung |
| --- | --- | --- | --- | --- |
| S-08 | F-01 | impressum__d1440-light__01.webp (gesamte Seite; Schrift auf jedem Ausschnitt) | app/layout.tsx:16-20, :78; app/styles/theme.css:83-95, :109 | Teilbedingung „Standardschrift als einzige Schrift“ erfüllt: Inter ist die einzige Schrift (app/layout.tsx:16-20, app/styles/theme.css:109). Teilbedingung „Standardradien und -schatten überall“ nicht erfüllt: Radien (6/10/14/20/28 px, theme.css:83-89) und Schatten (marineblau getönt, theme.css:92-95) sind eigene Token, Schatten kommen nur in Toast, Sheet und Skip-Link vor, Karten haben keinen. Wegen „und“ im Katalog nicht gezählt. |
| S-12 | F-04 | impressum__d1440-light__01.webp, __02; impressum__m375-light__01–__06 (7 Abschnitte „Anbieter“ bis „Haftung für Inhalte und Links“) | components/legal/LegalDocument.tsx:28-52; components/legal/LegalSection.tsx:14-22 | 7 Abschnitte in Folge mit gleichem Gerüst (H2 + Tabelle bzw. Fließtext) und ohne Blickfang. Rechtstext mit gesetzlich vorgegebener Gliederung, keine Erzählseite; nach Wortlaut des Katalogs („Erzählseiten“) nicht gezählt. |

### fehler-404 · 2 Grenzfall/-fälle

| ID | Frage | Ort | Komponente (Datei:Zeile) | Beschreibung |
| --- | --- | --- | --- | --- |
| S-08 | F-01 | fehler-404__d1440-light__01.webp (gesamte Seite; Schrift auf jedem Ausschnitt) | app/layout.tsx:16-20, :78; app/styles/theme.css:83-95, :109 | Teilbedingung „Standardschrift als einzige Schrift“ erfüllt: Inter ist die einzige Schrift (app/layout.tsx:16-20, app/styles/theme.css:109). Teilbedingung „Standardradien und -schatten überall“ nicht erfüllt: Radien (6/10/14/20/28 px, theme.css:83-89) und Schatten (marineblau getönt, theme.css:92-95) sind eigene Token, Schatten kommen nur in Toast, Sheet und Skip-Link vor, Karten haben keinen. Wegen „und“ im Katalog nicht gezählt. |
| S-10 | F-07 | fehler-404__d1440-light__01.webp y 190–600; fehler-404__m375-light__01 (y ca. 290–1130) | app/not-found.tsx:14-39 (Zahl 404 Zeile 18, H1 Zeile 21, Knöpfe Zeilen 27-34) | Überschrift, Unterzeile und zwei Knöpfe („Jetzt bewerben“, „Offene Stellen“) plus Textlink; aber linksbündig und auf einfarbigem Grund, nicht zentriert und nicht vor abstraktem Hintergrund. Zwei der drei Merkmale des Katalogs fehlen. |

## Geprüft und nicht gezählt

| ID | Ort | Komponente | Grund |
| --- | --- | --- | --- |
| S-10 | start__d1440-light__01.webp y 140–630; Hero | components/home/Hero.tsx:14-48; components/ui/PageHeader.tsx:36-52 | Überschrift, Lead, ein Knopf und ein Textlink sind linksbündig auf einfarbigem Grund (surface-2); weder zentriert noch zwei Knöpfe noch abstrakter Hintergrund. |
| S-10 | start__d1440-light__09.webp y 185–755 (Schlussband) | components/home/CtaBand.tsx:9-26 | Linksbündig, ein Knopf, keine Grafik; kein Einstieg. |
| S-09 | start__d1440-light__01.webp y 700–830 (Kennzahlen 13:30 / 30 / 35 km / 1926) | components/home/Hero.tsx:40-46; components/ui/StatTile.tsx | Statische Werte; im Code gibt es keinen Zähler (Suche countup\|count-up\|useCount\|gsap\|framer\|lottie ohne Treffer; requestAnimationFrame kommt nur in Bedien- und Messlogik vor: ReviewScroller, ContactStep, FollowUpForm, ApplyFlowClient, StickyApplyBarClient, MappePreview). Kein „hochzählend“. |
| S-09 | start__d1440-light__01.webp y 145–165 („Seit 1926 · Wetzlar“); impressum/datenschutz „Rechtliches“ | components/ui/PageHeader.tsx:38; components/home/content.ts:62 | Einfache Textzeile ohne Fläche, Rand oder Pille; kein „Badge“ im Sinn des Katalogs (siehe F-08). |
| S-09 | Stellenseiten d1440-light__01 (y 310–330), Tags „Vollzeit · Wetzlar + 35 km · Unbefristet“ | components/jobs/JobHeader.tsx:28-34 | Tags stehen unter der H1, nicht darüber. |
| S-09 | ganze Grundmenge, Code | app/, components/, lib/ (*.ts, *.tsx, *.css) | Suche gradient\|glass\|glow\|aurora\|sparkle\|shimmer\|marquee\|ticker\|particle\|confetti\|Audio\|howler\|gsap\|lottie\|framer ohne Treffer außer backdrop-blur in HeaderBar.tsx:58. Kein Verlauf, keine Leuchtkugeln, kein Nachlaufcursor, kein Laufband, keine Figuren, kein Klang. Haken auf der Danke-Seite (components/apply/thanks/CheckMark.tsx) zeichnet sich einmal, ohne Konfetti. |
| S-11 | bewerbung__d1440-light__01.webp y 150–430 (6 Auswahlzeilen) | components/ui/ChoiceCard.tsx; components/apply/ApplyFlowClient.tsx | Auswahlzeilen eines Formulars (Radio), ohne Icon, Bedienelement statt Inhaltskarten. |
| S-11 | stelle-*__d1440-light (Gehaltskarte und Kontaktkarte in der Seitenspalte), JobQuote | components/jobs/SalaryCard.tsx; components/site/ContactOptions.tsx; components/jobs/JobQuote.tsx:11-38 | Einzelkarten mit je eigener Funktion, kein Raster. |
| S-12 | bewerbung-mappe__d1440-light__01–__04 (5 nummerierte Formularabschnitte) | components/mappe/* | Werkzeug- und Formularseite mit unterschiedlichen Feldarten und Dichten, keine Erzählseite. |
| S-12 | stellen__d1440-light__01–__02 | app/jobs/page.tsx:66-126 | Drei Bänder mit unterschiedlichem Inhalt (Kartenraster, Kurztext, Kontaktfläche), keine drei gleichen in Folge. |
| S-12 | bewerbung-danke__d1440-light__01.webp / m375-light__01 | components/apply/thanks/ThankYouView.tsx:233-254 (Leerzustand) | Im Bildbestand nur der Leerzustand (keine gespeicherte Bewerbung): H1, Text, Knopf, Link, Kontaktkarte. Der Zustand mit Bewerbungsdaten (Timeline, Zeilen 204-231) wurde nur im Code gelesen: kein Treffer. |
| S-13 | alle 12 Seiten: ausgeliefertes HTML (curl GET, sichtbarer Text) und Code | app/, components/, lib/content/, lib/jobs/data/, lib/data/ | Begriffsliste (nahtlos, innovativ, ganzheitlich, maßgeschneidert, Entdecken Sie, nächste Level, Mehrwert, Synergie, State of the Art, modernste, erstklassig, rundum, Rundum-sorglos): in eigenen Texten 0 Treffer. Treffer nur in Fremdzitaten und nicht gerenderten Daten (siehe Grenzfälle und Code-Funde). |
| S-14 | alle 12 Seiten | components/mappe/PersonalSection.tsx:94, MappePreview.tsx:153 | Es gibt keine Fotos, Illustrationen oder KI-Bilder. Einzige Rasterdatei im Seitenkörper ist das Logo; die Fotovorschau der Mappe zeigt ein vom Nutzer gewähltes Foto und gehört nicht zur Seitengestaltung. |

## Code-Funde ohne Ausspielung (nicht gezählt)

| ID | Fundstelle | Text | Hinweis |
| --- | --- | --- | --- |
| S-13 | lib/seo/site-config.ts:24 | „… übertarifliche Vergütung und erstklassige Arbeitsbedingungen …“ (SITE_CONFIG.description.de) | Im ausgelieferten HTML aller 12 Seiten nicht enthalten, im Code nirgends gelesen (Suche description.de, SITE_CONFIG.description). Tote Daten. |
| S-13 | lib/data/reviews.data.ts:262 | Team-Stimme „Dennis M.“: „… modernste Arbeitsschutzkleidung …“ | Wird nicht angezeigt: components/reviews/data.ts:26-39 nimmt nur googleCustomerReviews und die vier freigegebenen TEAM_QUOTES. |

## Offene Fragen

| Nr. | ID | Ort | Frage |
| --- | --- | --- | --- |
| F-01 | S-08 | alle 12 Seiten; app/layout.tsx:16-20, app/styles/theme.css:83-95, :109 | Zählt S-08, wenn nur die Schrift Standard ist (Inter als einzige Schrift), die Radien und Schatten aber projekteigene Token sind? Strenge Lesart („und“): 0 gezählt, 12 Grenzfälle. Milde Lesart: 12. Der Ausgangswert für Z-07 hängt daran. |
| F-02 | S-09 | components/site/HeaderBar.tsx:55-61 | Gilt die halbtransparente Kopfzeile mit Hintergrundunschärfe als „Glaseffekt“ im Sinn von S-09? Gezählt (Katalogwort, keine Leitidee), das ergibt 12 Treffer an einer einzigen Fundstelle und macht 12 von 17 Befunden aus (5 ohne sie). |
| F-03 | S-11 | start (JobList, Stimmenreihe), stellen, 4 Stellenseiten (Weitere Stellen); Fundstellen siehe Grenzfälle | Genügen gleichförmige Karten ohne Icon (Stellenkarten, Stimmenkarten) dem Katalogmerkmal „Karten mit Icon, Überschrift und zwei Zeilen“? Nicht gezählt (7 Grenzfälle); falls ja, steigt S-11 von 1 auf 8. |
| F-04 | S-12 | start (Abschnittsfolge), impressum, datenschutz, 4 Stellenseiten | Sind Stellenseiten „Erzählseiten“ (gezählt, 4) und Rechtsseiten nicht (2 Grenzfälle)? Und zählt die Startseite, deren Abschnitte alle denselben Kopf haben, aber abwechselnde Inhaltsmuster (1 Grenzfall)? Bei „ja“ für alle steigt S-12 von 4 auf 7. |
| F-05 | S-13 | lib/data/reviews.data.ts:190 (start); lib/mappe/options.ts:45 (bewerbung-mappe, nur nach Nutzerwahl) | Zählen Floskeln aus echten Kundenzitaten und aus Nutzer-Textbausteinen? Fremdzitate dürfen nicht umgeschrieben werden (Inhalte echt); daher nicht gezählt (2 Grenzfälle). Eigene Texte: 0. |
| F-06 | S-14 | Hauptseiten dunkel; components/brand/Logo.tsx:26-39 | Ist das per Filter zur weißen Silhouette umgefärbte Rasterlogo im Dunkelmodus ein „Bildfehler / uneinheitliche Bildbearbeitung“? Nicht gezählt (4 Grenzfälle). Im Hellmodus ist kein Mangel erkennbar. Ohne Fotos ist S-14 im Ausgangsstand praktisch gegenstandslos. |
| F-07 | S-10 | app/not-found.tsx:14-39 | Muss S-10 alle drei Merkmale (zentriert, zwei Knöpfe, abstrakter Hintergrund) erfüllen? Die 404-Seite hat Überschrift, Unterzeile und zwei Knöpfe, aber linksbündig und ohne Hintergrund; nicht gezählt (1 Grenzfall). Startseiten-Hero erfüllt auch bei milder Lesart höchstens ein Merkmal. |
| F-08 | S-09 | components/ui/PageHeader.tsx:38 (Start „Seit 1926 · Wetzlar“, Impressum und Datenschutz „Rechtliches“) | Zählt eine reine Textzeile (Eyebrow) über der H1 als „Badge über der Einstiegsüberschrift“? Nicht gezählt, da ohne Fläche oder Rand (3 Seiten betroffen). |
| F-09 | alle | Messumfang | Nicht im Bildbestand und daher nur im Code geprüft: Zustände der Bewerbungsflow-Schritte 2 bis 4, Danke-Seite mit Bewerbungsdaten, Mappe nach Eingaben, Google-Karte nach Einwilligung, Dunkelmodus der Nebenseiten, Seitenhöhen mit geöffneten FAQ-Einträgen. Genügt das für Z-07? |

## Abdeckung der Bildschirmfotos

| Seite | Angesehen |
| --- | --- |
| start | d1440-light 01–10 (einzeln 01–10 in voller Größe), m375-light 01–14, t768-light 01–09, d1440-dark 01–10 (Übersichtsblätter) |
| stellen | d1440-light 01–03 (einzeln), m375-light 01–05, t768-light 01–03, d1440-dark 01–03 |
| stelle-anlagenmechaniker | d1440-light 01–07 (01–03 einzeln, 04–07 Übersicht), m375-light 01–10, t768-light 01–06, d1440-dark 01–07 |
| stelle-kundendienst | d1440-light 01–06 (Übersicht; Datei hat 07), m375-light 01–10 |
| stelle-obermonteur | d1440-light 01–06 (Übersicht; Datei hat 07), m375-light 01–10 |
| stelle-ausbildung | d1440-light 01–06, m375-light 01–09 |
| bewerbung | d1440-light 01–02, m375-light 01–02, t768-light 01–02, d1440-dark 01–02 |
| bewerbung-danke | d1440-light 01, m375-light 01–02 |
| bewerbung-mappe | d1440-light 01–04, m375-light 01–07 (Übersicht) |
| datenschutz | d1440-light 01–14 (Übersicht), m375-light 01–14 (Übersicht) |
| impressum | d1440-light 01–02, m375-light 01–06 |
| fehler-404 | d1440-light 01–02 (einzeln), m375-light 01–03 |

## Katalog (wörtlich aus dem Auftrag)

- **S-08 weich:** Standard-Look eines Frameworks oder einer Komponentenbibliothek: Standardschrift als einzige Schrift, Standardradien und -schatten überall.
- **S-09 weich:** Klischees ohne Grund (Verläufe, Verlaufstext, Glaseffekte, Leuchtkugeln, Aurora, Partikel, Funkeln, Leuchtrand-Karten, Nachlaufcursor, Logo-Laufband, hochzählende Kennzahlen, Badge über der Einstiegsüberschrift, Corporate-Memphis-Figuren, Klangeffekte).
- **S-10 weich:** Austauschbarer Einstieg: zentrierte Überschrift, Unterzeile und zwei Knöpfe vor abstraktem Hintergrund.
- **S-11 weich:** Karten-Einerlei: gleichförmige Karten mit Icon, Überschrift und zwei Zeilen als vorherrschendes Muster; Bento-Raster ohne inhaltliche Logik.
- **S-12 weich:** Gleichtakt auf Erzählseiten: drei oder mehr aufeinanderfolgende Abschnitte mit gleicher Struktur und Dichte, kein klarer Blickfang.
- **S-13 weich:** KI-Floskeln wie „nahtlos“, „innovativ“, „ganzheitlich“, „maßgeschneidert“, „Entdecken Sie …“, „auf das nächste Level“.
- **S-14 weich:** Generische Bildanmutung: Stock- oder KI-Ästhetik, Bildfehler, uneinheitliche Bildbearbeitung.
