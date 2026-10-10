# axe · P0-MESS-02

Erstellt 2026-10-09T07:30:04.052Z · Basis http://localhost:3500

## Messbedingungen
- @axe-core/playwright 4.13.0, axe-core 4.13.0 · Chromium 141.0.7390.37 (voller Modus)
- Tags: wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa
- Ansichten: m375 375×812 · t768 768×1024 · d1440 1440×900 · d1920 1920×1080 · Schemata: hell, dunkel · reducedMotion: reduce
- Vorbereitung: goto networkidle → document.fonts.ready → scrollThrough → Zustand herstellen → Animationen beendet → axe (ganze Seite)
- Anfragesperre: lib/browser.mjs (G5): POST/PUT/PATCH/DELETE → Attrappe, Tracking → 204, Fremdhosts blockiert
- Zählweise: „Regeln“ = Anzahl verletzter Regeln im Lauf nach Wirkung (jede Regel einmal je Lauf); „Knoten“ = betroffene Elemente.

## Abdeckung
- Seiten der Grundmenge: 12 × 4 Ansichten × 2 Schemata = 96 Läufe
- Zustände: 4 (zustand-menue in m375; zustand-bewerbung-fehler in m375/d1440; zustand-faq-offen in m375/d1440; zustand-region-ort in m375/d1440) = 14 Läufe
- Gesamt: 110 Läufe, erfolgreich 110, fehlgeschlagen 0
- Anfragesperre insgesamt: keine gesperrten oder abgefangenen Anfragen

## Summe
| | kritisch | ernst | mäßig | gering |
|---|---:|---:|---:|---:|
| Regel-Treffer über alle Läufe | 0 | 0 | 0 | 0 |
| betroffene Knoten über alle Läufe | 0 | 0 | 0 | 0 |
| unterschiedliche Regeln | 0 | 0 | 0 | 0 |

## Läufe (Seite/Zustand × Ansicht × Schema)
Zellen: Anzahl verletzter Regeln je Wirkung.

| Seite/Zustand | Ansicht | Schema | Status | kritisch | ernst | mäßig | gering | Regeln |
|---|---|---|---:|---:|---:|---:|---:|---|
| start | m375 | hell | 200 | 0 | 0 | 0 | 0 | – |
| start | m375 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| start | t768 | hell | 200 | 0 | 0 | 0 | 0 | – |
| start | t768 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| start | d1440 | hell | 200 | 0 | 0 | 0 | 0 | – |
| start | d1440 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| start | d1920 | hell | 200 | 0 | 0 | 0 | 0 | – |
| start | d1920 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stellen | m375 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stellen | m375 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stellen | t768 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stellen | t768 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stellen | d1440 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stellen | d1440 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stellen | d1920 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stellen | d1920 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stelle-anlagenmechaniker | m375 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stelle-anlagenmechaniker | m375 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stelle-anlagenmechaniker | t768 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stelle-anlagenmechaniker | t768 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stelle-anlagenmechaniker | d1440 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stelle-anlagenmechaniker | d1440 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stelle-anlagenmechaniker | d1920 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stelle-anlagenmechaniker | d1920 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stelle-kundendienst | m375 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stelle-kundendienst | m375 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stelle-kundendienst | t768 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stelle-kundendienst | t768 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stelle-kundendienst | d1440 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stelle-kundendienst | d1440 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stelle-kundendienst | d1920 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stelle-kundendienst | d1920 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stelle-obermonteur | m375 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stelle-obermonteur | m375 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stelle-obermonteur | t768 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stelle-obermonteur | t768 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stelle-obermonteur | d1440 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stelle-obermonteur | d1440 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stelle-obermonteur | d1920 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stelle-obermonteur | d1920 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stelle-ausbildung | m375 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stelle-ausbildung | m375 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stelle-ausbildung | t768 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stelle-ausbildung | t768 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stelle-ausbildung | d1440 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stelle-ausbildung | d1440 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| stelle-ausbildung | d1920 | hell | 200 | 0 | 0 | 0 | 0 | – |
| stelle-ausbildung | d1920 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| bewerbung | m375 | hell | 200 | 0 | 0 | 0 | 0 | – |
| bewerbung | m375 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| bewerbung | t768 | hell | 200 | 0 | 0 | 0 | 0 | – |
| bewerbung | t768 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| bewerbung | d1440 | hell | 200 | 0 | 0 | 0 | 0 | – |
| bewerbung | d1440 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| bewerbung | d1920 | hell | 200 | 0 | 0 | 0 | 0 | – |
| bewerbung | d1920 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| bewerbung-danke | m375 | hell | 200 | 0 | 0 | 0 | 0 | – |
| bewerbung-danke | m375 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| bewerbung-danke | t768 | hell | 200 | 0 | 0 | 0 | 0 | – |
| bewerbung-danke | t768 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| bewerbung-danke | d1440 | hell | 200 | 0 | 0 | 0 | 0 | – |
| bewerbung-danke | d1440 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| bewerbung-danke | d1920 | hell | 200 | 0 | 0 | 0 | 0 | – |
| bewerbung-danke | d1920 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| bewerbung-mappe | m375 | hell | 200 | 0 | 0 | 0 | 0 | – |
| bewerbung-mappe | m375 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| bewerbung-mappe | t768 | hell | 200 | 0 | 0 | 0 | 0 | – |
| bewerbung-mappe | t768 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| bewerbung-mappe | d1440 | hell | 200 | 0 | 0 | 0 | 0 | – |
| bewerbung-mappe | d1440 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| bewerbung-mappe | d1920 | hell | 200 | 0 | 0 | 0 | 0 | – |
| bewerbung-mappe | d1920 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| datenschutz | m375 | hell | 200 | 0 | 0 | 0 | 0 | – |
| datenschutz | m375 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| datenschutz | t768 | hell | 200 | 0 | 0 | 0 | 0 | – |
| datenschutz | t768 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| datenschutz | d1440 | hell | 200 | 0 | 0 | 0 | 0 | – |
| datenschutz | d1440 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| datenschutz | d1920 | hell | 200 | 0 | 0 | 0 | 0 | – |
| datenschutz | d1920 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| impressum | m375 | hell | 200 | 0 | 0 | 0 | 0 | – |
| impressum | m375 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| impressum | t768 | hell | 200 | 0 | 0 | 0 | 0 | – |
| impressum | t768 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| impressum | d1440 | hell | 200 | 0 | 0 | 0 | 0 | – |
| impressum | d1440 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| impressum | d1920 | hell | 200 | 0 | 0 | 0 | 0 | – |
| impressum | d1920 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| fehler-404 | m375 | hell | 404 | 0 | 0 | 0 | 0 | – |
| fehler-404 | m375 | dunkel | 404 | 0 | 0 | 0 | 0 | – |
| fehler-404 | t768 | hell | 404 | 0 | 0 | 0 | 0 | – |
| fehler-404 | t768 | dunkel | 404 | 0 | 0 | 0 | 0 | – |
| fehler-404 | d1440 | hell | 404 | 0 | 0 | 0 | 0 | – |
| fehler-404 | d1440 | dunkel | 404 | 0 | 0 | 0 | 0 | – |
| fehler-404 | d1920 | hell | 404 | 0 | 0 | 0 | 0 | – |
| fehler-404 | d1920 | dunkel | 404 | 0 | 0 | 0 | 0 | – |
| zustand-menue | m375 | hell | 200 | 0 | 0 | 0 | 0 | – |
| zustand-menue | m375 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| zustand-bewerbung-fehler | m375 | hell | 200 | 0 | 0 | 0 | 0 | – |
| zustand-bewerbung-fehler | m375 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| zustand-bewerbung-fehler | d1440 | hell | 200 | 0 | 0 | 0 | 0 | – |
| zustand-bewerbung-fehler | d1440 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| zustand-faq-offen | m375 | hell | 200 | 0 | 0 | 0 | 0 | – |
| zustand-faq-offen | m375 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| zustand-faq-offen | d1440 | hell | 200 | 0 | 0 | 0 | 0 | – |
| zustand-faq-offen | d1440 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| zustand-region-ort | m375 | hell | 200 | 0 | 0 | 0 | 0 | – |
| zustand-region-ort | m375 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| zustand-region-ort | d1440 | hell | 200 | 0 | 0 | 0 | 0 | – |
| zustand-region-ort | d1440 | dunkel | 200 | 0 | 0 | 0 | 0 | – |
| **Summe (110 Läufe)** | | | | **0** | **0** | **0** | **0** | 0 Regel-IDs |

## Regel-IDs und Fundstellen
Keine Verstöße gefunden.

## Unklar (axe „incomplete“, nicht als Verstoß gezählt)
| Regel | Läufe | Knoten | Seiten/Zustände | erstes Ziel (erster Lauf) |
|---|---:|---:|---|---|
| color-contrast | 16 | 84 | start, zustand-faq-offen, zustand-region-ort | `text[x="256.1"]` (start__m375-light) |

## Nachweise der Zustände
- zustand-menue (m375): {"dialogOffen":true,"ariaExpanded":"true"}
- zustand-bewerbung-fehler (m375): {"felderMitAriaInvalid":2,"fehlertexte":["Bitte gib deinen Namen an.","Bitte gib eine gültige Telefonnummer an."]}
- zustand-bewerbung-fehler (d1440): {"felderMitAriaInvalid":2,"fehlertexte":["Bitte gib deinen Namen an.","Bitte gib eine gültige Telefonnummer an."]}
- zustand-faq-offen (m375): {"frage":"Wie läuft der diskrete Wechsel ab, wenn ich noch bei einem anderen Betrieb angestellt bin?","offen":1}
- zustand-faq-offen (d1440): {"frage":"Wie läuft der diskrete Wechsel ab, wenn ich noch bei einem anderen Betrieb angestellt bin?","offen":1}
- zustand-region-ort (m375): {"ort":"Aßlar (35614)","ergebnis":"Aßlar ca. 6 km · 9 Min. bis Wetzlar"}
- zustand-region-ort (d1440): {"ort":"Aßlar (35614)","ergebnis":"Aßlar ca. 6 km · 9 Min. bis Wetzlar"}
