# Slop-Prüfung, harte Befunde S-01 bis S-07 · test-slop

Erstellt 2026-10-09T07:42:15.714Z · Basis http://localhost:3500

Messbedingungen Rendern: Ansichten d1440 · hell · Bewegung no-preference · S-07: domcontentloaded + 300 ms; Rest: networkidle + fonts.ready + 600 ms, dann scrollThrough + 500 ms · Stichprobe S-05 60 Elemente · Tab-Stopps 15 · axe-Regeln color-contrast
Tokens aus app/styles/theme.css: 42 Farbwerte · Radien 0/6/10/14/20/28/9999 px + full · Schatten xs/sm/lg · Dauern 0/0.15/0.22/0.28 s · Schriftstufen footnote/callout/body/lead/title-3/title-2/title-1/display/numeral

## Zählung je S-Kennung

| Befund | Code | Gerendert (Summe der Seitenansichten) |
| --- | --- | --- |
| S-01 Erfundenes oder Platzhalter | – | 3 sichtbare Treffer · 0 Feldplatzhalter mit Muster (von 0) |
| S-02 Effektteppich | – | 7 von 8 Abschnitten mit Scroll-Auftritt · 1 von 1 Seitenansichten über 50 % · 15 Animationen nach Scroll |
| S-03 Unzugänglich | – | Kontrast 0 Verletzungen (5 unklar) · Fokus 0 von 15 Tab-Stopps ohne 2-px-Outline |
| S-04 Gemischte Bildsprache | – | Emojis 1 (+ 1 typografisch) · höchstens 2 verschiedene Strichstärken je Seite (Icons) |
| S-05 Ungeordnete Werte | – | schriftgroesse 1 · radius 1 · schatten 1 · farbe 1 · hintergrund 1 · dauer 1 (Elemente außerhalb Token, Summe der Seitenansichten) |
| S-06 Halbe Zustände | – | 44 interaktive Elemente · ohne Hover-Stil 12 · ohne :focus-visible-Stil 0 · Felder ohne aria-invalid-Stil 0 |
| S-07 Blockierender Auftakt | – | h1 nach 300 ms nicht sichtbar 0 · Scrollen nicht möglich 0 · Vollbild-Überlagerung 0 · Zähleränderungen 0 |

## Teil B: gerendert

### Übersicht je Seite und Ansicht

| Seite | Ansicht | Status | S-01 | S-02 Abschnitte mit Auftritt | S-03 Kontrast | S-03 Fokus nicht ok | S-04 Emoji | S-04 Strich (berechnet) | S-05 Elemente außerhalb | S-06 ohne Hover / ohne Fokus / Feld ohne Fehlerstil | S-07 h1 300 ms / scrollbar |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | d1440 | 200 | 3 | 7/8 (88 %) | 0 | 0/15 | 1 | 5 | s1 r1 s1 f1 h1 d1 | 12 / 0 / 0 | ja / ja |

Kürzel S-05: s Schriftgröße · r Radius · s Schatten · f Farbe · h Hintergrund · d Dauer (je Anzahl Elemente außerhalb der Token, Volltext der Seite).

### S-01 sichtbarer Text mit Platzhalter-Muster (3)

| Seite | Ansicht | Muster | Fundstelle | Kontext |
| --- | --- | --- | --- | --- |
| / | d1440 | alexander koch | `ll > figcaption.text-callout > span.block.font-semibold:nth-of-type(1)` | Alexander Koch |
| / | d1440 | lorem | `div#slop-selbsttest` | Lorem ipsum 🚀 |
| / | d1440 | ipsum | `div#slop-selbsttest` | Lorem ipsum 🚀 |

### S-01 sichtbare Feld-Platzhaltertexte (d1440, zur Kenntnis; Handprüfung auf Beispieltexte) (0)

Keine.

### S-01 Prüfliste Zahlenangaben im sichtbaren Text (d1440; kein Befund – Handprüfung gegen Quellen auf Erfundenes) (43)

| Seite | Zahlangabe | Fundstelle |
| --- | --- | --- |
| / | Dauert ca. 60 Sekunden. Kein Lebenslauf nö | `r.flex.flex-col > div.mt-2.flex > p.basis-full.text-footnote` |
| / | 35 km | `> div.flex.flex-col > p.tabular-nums.text-ink:nth-of-type(1)` |
| / | Wetzlar + 35 km | `.flex > p.flex.flex-col > span.text-ink-muted:nth-of-type(1)` |
| / | 3.600–4.600 € / Monat | `flex.flex-col > span.font-medium.tabular-nums:nth-of-type(2)` |
| / | Wetzlar + 35 km | `.flex > p.flex.flex-col > span.text-ink-muted:nth-of-type(1)` |
| / | 3.800–4.900 € / Monat | `flex.flex-col > span.font-medium.tabular-nums:nth-of-type(2)` |
| / | Wetzlar + 35 km | `.flex > p.flex.flex-col > span.text-ink-muted:nth-of-type(1)` |
| / | 4.400–5.600 € / Monat | `flex.flex-col > span.font-medium.tabular-nums:nth-of-type(2)` |
| / | instieg noch möglich. In 3,5 Jahren wirst du Anlagenmechanik | ` > article.rounded-lg.bg-surface-2 > p.max-w-prose.text-body` |
| / | Wetzlar + 35 km | `.flex > p.flex.flex-col > span.text-ink-muted:nth-of-type(1)` |
| / | 1.050–1.400 € / Monat | `flex.flex-col > span.font-medium.tabular-nums:nth-of-type(2)` |
| / | 35 km um Wetzlar. Keine Fernmo | `h2#einsatzgebiet-title` |
| / | 35 km | `elect-none > text.fill-ink-muted.text-callout:nth-of-type(1)` |
| / | arbeiten im Umkreis von 35 km um Wetzlar. | `) > div.flex.flex-col:nth-of-type(1) > p.-mt-1.text-footnote` |
| / | 1 km | `r-b.border-line:nth-of-type(1) > td.py-3.pr-4:nth-of-type(1)` |
| / | 3 Min. | `r-b.border-line:nth-of-type(1) > td.py-3.pr-2:nth-of-type(2)` |
| / | 4 km | `r-b.border-line:nth-of-type(2) > td.py-3.pr-4:nth-of-type(1)` |
| / | 6 Min. | `r-b.border-line:nth-of-type(2) > td.py-3.pr-2:nth-of-type(2)` |
| / | 4 km | `r-b.border-line:nth-of-type(3) > td.py-3.pr-4:nth-of-type(1)` |
| / | 7 Min. | `r-b.border-line:nth-of-type(3) > td.py-3.pr-2:nth-of-type(2)` |
| / | 4 km | `r-b.border-line:nth-of-type(4) > td.py-3.pr-4:nth-of-type(1)` |
| / | 7 Min. | `r-b.border-line:nth-of-type(4) > td.py-3.pr-2:nth-of-type(2)` |
| / | 5 km | `r-b.border-line:nth-of-type(5) > td.py-3.pr-4:nth-of-type(1)` |
| / | 8 Min. | `r-b.border-line:nth-of-type(5) > td.py-3.pr-2:nth-of-type(2)` |
| / | 6 km | `r-b.border-line:nth-of-type(6) > td.py-3.pr-4:nth-of-type(1)` |
| / | 9 Min. | `r-b.border-line:nth-of-type(6) > td.py-3.pr-2:nth-of-type(2)` |
| / | 7 km | `r-b.border-line:nth-of-type(7) > td.py-3.pr-4:nth-of-type(1)` |
| / | 10 Min. | `r-b.border-line:nth-of-type(7) > td.py-3.pr-2:nth-of-type(2)` |
| / | 14 km | `r-b.border-line:nth-of-type(8) > td.py-3.pr-4:nth-of-type(1)` |
| / | 18 Min. | `r-b.border-line:nth-of-type(8) > td.py-3.pr-2:nth-of-type(2)` |
| / | 15 km | `r-b.border-line:nth-of-type(9) > td.py-3.pr-4:nth-of-type(1)` |
| / | 16 Min. | `r-b.border-line:nth-of-type(9) > td.py-3.pr-2:nth-of-type(2)` |
| / | 24 km | `-b.border-line:nth-of-type(10) > td.py-3.pr-4:nth-of-type(1)` |
| / | 22 Min. | `-b.border-line:nth-of-type(10) > td.py-3.pr-2:nth-of-type(2)` |
| / | Bewerben in 60 Sekunden | `> li.flex.flex-col:nth-of-type(1) > h3.text-title-3.text-ink` |
| / | 100 % Diskretion | `th-of-type(2) > span.inline-flex.items-center:nth-of-type(2)` |
| / | eb (Partnerurkunde 2026, 14,8 km Werksnähe zum Buderus-St | `l.divide-y.divide-line > li.py-3.text-callout:nth-of-type(1)` |
| / | chtigung zur Vergabe von 7 Jahren Herstellergarantie) | `l.divide-y.divide-line > li.py-3.text-callout:nth-of-type(2)` |
| / | Freitags ab 13:30 Uhr Wochenende ist kein Werb | `pe(2) > figure.flex.w-full > blockquote.flex-1.text-body > p` |
| / | Mo–Do 07:00–16:45 Uhr | `tnote.text-ink-muted > span.whitespace-nowrap:nth-of-type(1)` |
| / | Fr 07:00–13:30 Uhr | `tnote.text-ink-muted > span.whitespace-nowrap:nth-of-type(2)` |
| / | bis Donnerstag 07:00–16:45 Uhr | `nth-of-type(1) > address.flex.flex-col > span:nth-of-type(2)` |
| / | Freitag 07:00–13:30 Uhr | `nth-of-type(1) > address.flex.flex-col > span:nth-of-type(2)` |

### S-02 Abschnitte mit Scroll-Auftritt (7)

| Seite | Ansicht | Abschnitt | Animationen nach Scroll | Zustandswechsel |
| --- | --- | --- | --- | --- |
| / | d1440 | `section#stellen` | Animation:null[opacity] | 0 |
| / | d1440 | `section#vorteile` | Animation:null[opacity] | 0 |
| / | d1440 | `section#einsatzgebiet` | Animation:null[opacity] | 0 |
| / | d1440 | `section#ablauf` | Animation:null[opacity] | 0 |
| / | d1440 | `section#ueber-uns` | Animation:null[opacity] | 0 |
| / | d1440 | `section#faq` | Animation:null[opacity] | 0 |
| / | d1440 | `main#main > section.py-section.bg-surface:nth-of-type(8)` | Animation:null[opacity] | 0 |

S-02 Nebenbefunde: Elemente außerhalb des ersten Bildschirms mit opacity < 1 oder transform ≠ none, die sich beim Scrollen nicht ändern (statisch): 2 Elemente in Summe; Animationen insgesamt gesehen 16, davon nach dem ersten Scrollereignis gestartet 15.

### S-03 Kontrast (axe color-contrast) (0)

Keine.

### S-03 Tab-Stopps ohne sichtbare Outline ≥ 2 px (0)

Keine.

### S-04 Emojis im sichtbaren Text (2)

| Seite | Ansicht | Zeichen | Codepoint | typografisch | Fundstelle |
| --- | --- | --- | --- | --- | --- |
| / | d1440 | © | U+A9 | true | `.mx-auto.box-content:nth-of-type(2) > p.border-t.border-line` |
| / | d1440 | 🚀 | U+1F680 | false | `div#slop-selbsttest` |

### S-04 Strichstärken inline-SVG (d1440)

| Seite | sichtbare SVG | lucide | eigen | stroke-width Attribute | berechnet | effektiv px |
| --- | --- | --- | --- | --- | --- | --- |
| / | 38 | 27 | 11 | 1×2 2×1 4×4 1.75×26 2.25×1 1.5×10 | 1×2 2×1 4×4 1.75×53 2.25×1 | 1×2 1.17×11 1.75×28 2.49×1 4.98×4 1.46×14 1.5×1 |

### S-05 Werte außerhalb der Tokens (Volltext aller sichtbaren Elemente; Beispiele je Wert)


### S-05 abweichende Werte (alle Seitenansichten zusammen, sortiert nach Häufigkeit) (6)

| Eigenschaft | Wert | Elemente (Summe) | Seitenansichten | Beispiel (Seite · Selektor) |
| --- | --- | --- | --- | --- |
| schriftgroesse | `13.5px` | 1 | 1 | / · `div#slop-selbsttest` |
| radius | `7px` | 1 | 1 | / · `div#slop-selbsttest` |
| schatten | `rgb(255, 0, 0) 0px 0px 5px 0px` | 1 | 1 | / · `div#slop-selbsttest` |
| farbe | `rgb(18, 52, 86)` | 1 | 1 | / · `div#slop-selbsttest` |
| hintergrund | `rgb(171, 205, 239)` | 1 | 1 | / · `div#slop-selbsttest` |
| dauer | `0.3s` | 1 | 1 | / · `div#slop-selbsttest` |

Schriftstufen laut Token bei 1440 px: footnote 13px · callout 15px · body 17px · lead 21px · title-3 24px · title-2 34px · title-1 48px · display 72px · numeral 100.8px; bei 375 px: .

Stichprobe (60 Elemente je Seitenansicht, gleichmäßig durch die Dokumentreihenfolge): Elemente mit mindestens einer Abweichung

| Seite | Ansicht | Elemente gemessen (Seite) | Stichprobe | mit Abweichung | Schrift | Radius | Schatten | Farbe | Hintergrund | Dauer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | d1440 | 537 | 60 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

### S-06 Hover-/Fokus-/Fehlerstil je interaktivem Element

| Seite | Ansicht | Links ohne Hover | Knöpfe ohne Hover | Felder ohne Hover | Links ohne :focus-visible | Knöpfe ohne :focus-visible | Felder ohne :focus-visible | Felder ohne aria-invalid-Stil | CSS-Regeln (Hover/Fokus/Invalid) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | d1440 | 6/32 | 0/5 | 0/1 | 0/32 | 0/5 | 0/1 | 0/1 | 13/9/1 |

### S-06 Elemente ohne Hover-Stil (d1440) (12)

| Seite | Typ | Element | Fundstelle |
| --- | --- | --- | --- |
| / | link | Zum Inhalt springen | `a.sr-only` |
| / | link | Bad und Energie GmbH Lahn Dill, zur Star | `header.sticky.top-0 > div.mx-auto.box-content > a.-mx-1.inline-flex` |
| / | link | Anlagenmechaniker SHK | `:nth-of-type(1) > article.rounded-lg.bg-surface-2 > h3.text-title-3.text-ink > a` |
| / | link | Kundendiensttechniker | `:nth-of-type(2) > article.rounded-lg.bg-surface-2 > h3.text-title-3.text-ink > a` |
| / | link | Obermonteur / Projektleiter | `:nth-of-type(3) > article.rounded-lg.bg-surface-2 > h3.text-title-3.text-ink > a` |
| / | link | Ausbildung Anlagenmechaniker | `:nth-of-type(4) > article.rounded-lg.bg-surface-2 > h3.text-title-3.text-ink > a` |
| / | sonstiges | Stimmen von Kunden und Team | `-16.border-t:nth-of-type(3) > div.mt-8:nth-of-type(2) > div > ul.-mx-gutter.mt-6` |
| / | sonstiges | Wie läuft der diskrete Wechsel ab, wenn  | `l:nth-of-type(2) > details.group.border-b:nth-of-type(1) > summary.flex.min-h-11` |
| / | sonstiges | Brauche ich ein Anschreiben oder einen L | `l:nth-of-type(2) > details.group.border-b:nth-of-type(2) > summary.flex.min-h-11` |
| / | sonstiges | Welche Heizsysteme und Sanitäranlagen mo | `l:nth-of-type(2) > details.group.border-b:nth-of-type(3) > summary.flex.min-h-11` |
| / | sonstiges | Darf ich das Firmenfahrzeug mit nach Hau | `l:nth-of-type(2) > details.group.border-b:nth-of-type(4) > summary.flex.min-h-11` |
| / | sonstiges | Gibt es Fernmontagen oder Wochenendarbei | `l:nth-of-type(2) > details.group.border-b:nth-of-type(5) > summary.flex.min-h-11` |

### S-06 Elemente ohne :focus-visible-Stil (d1440) (0)

Keine.

### S-06 Felder ohne aria-invalid-Fehlerdarstellung (d1440) (0)

Keine.

### S-07 Auftakt: Inhalt und Scrollen 300 ms nach domcontentloaded

| Seite | Ansicht | h1 vorhanden | h1 Deckkraft | h1 im ersten Bildschirm | h1 sichtbar nach 300 ms | Seite scrollbar nötig | Scrollen möglich | overflow html/body | Vollbild-Überlagerung | Zähler ändern sich |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | d1440 | ja | 1 | true | true | ja | true | visible/visible | keine | 0 |

## Hinweise zur Methode

- Zählung, nicht Urteil: Jede Zahl gehört zu einer Katalogregel; Fundstellen stehen als Datei:Zeile (Code) oder Seite + Selektor (gerendert) in slop-hart.json. Der Selektor ist ein gekürzter Pfad (bis 5 Ebenen) und kein eindeutiger CSS-Selektor.
- S-02 (gerendert): Ein Abschnitt zählt als „mit Auftritt“, wenn nach dem ersten Scrollereignis eine Animation (CSS, Übergang, WAAPI, scroll-/view-gebunden) mit opacity/transform/translate/scale/rotate/clip-path/filter/visibility in ihm startet oder ein Element außerhalb des ersten Bildschirms seinen opacity-/transform-Wert beim Durchscrollen ändert. Abschnitte = oberste `section` in `main` (sonst Kinder von `main`). Grenze: > 50 % der Abschnitte.
- S-03: axe-core-Regel color-contrast allein; Fokus: echte Tab-Taste, `:focus-visible` muss zutreffen und am Element selbst, an `::after`/`::before` oder an einem bis zu drei Ebenen höheren Vorfahren mit `:has(:focus-visible)` muss `outline-style` ≠ none mit `outline-width` ≥ 2 px gelten (ein Ring über box-shadow zählt nicht als Outline, wird aber als „nur box-shadow“ ausgewiesen; der Ort des Rings steht in `ringOrt`). „Information nur über Hover oder Farbe“ ist per Skript nicht entscheidbar; Hinweise stehen unter Code.
- S-05 Stichprobe: gleichmäßig durch die Dokumentreihenfolge aller sichtbaren Elemente; Vergleich mit den aus theme.css gelesenen Werten (Farben alle Hex-Werte der Datei, Radien, Schatten über Prüfelement normalisiert, Dauern, Schriftstufen als clamp() für die jeweilige Ansichtsbreite aufgelöst). Der Volltext derselben Seite ist die vollständige Zählung. Farben mit Deckkraft < 1 gelten als Token, wenn der RGB-Anteil einem Token entspricht (±3).
- S-06: Hover-/Fokus-Regeln werden aus allen lesbaren Stylesheets samt verschachtelten Regeln und @media/@supports/@layer gesammelt; ein Element hat den Stil, wenn es den Selektor ohne die Pseudoklasse trifft (Vorfahren-Hover eingeschlossen). Medienbedingungen wie (hover: hover) werden nicht ausgewertet.
- S-07: `domcontentloaded` + 300 ms; h1 gilt als sichtbar bei Gesamt-Deckkraft ≥ 0,999, visibility visible und Lage im ersten Bildschirm; Scrollen wird mit scrollTo geprüft, wenn die Seite höher als der Bildschirm ist; Zähler = Blattelemente, deren Text nur aus Ziffern und Zeichen besteht und sich zwischen 300 ms und 2,5 s ändert.
