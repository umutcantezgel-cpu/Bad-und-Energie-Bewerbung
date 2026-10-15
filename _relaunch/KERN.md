# KERN – Gestaltungssystem
Version: 1.3 (15.10.2026; 1.0 nach FREIGABE E-021, 1.1: K-004 CSP nach E-022, 1.2: Technische Zeichnung 2.0, Dauerbewegung, Bosch-Sperre, Indexierung per Gate und Lohn auf Anfrage nach E-029 und E-030, 1.3: Wärme und Weichheit nach E-031).
Änderungen in 1.3 mit Grund (E-031): K-003.2 (Rohrakzente zurück, nur an freigegebenen Stellen) · K-003.5 (Wärme breitet sich einmal aus, keine neuen Schleifen) · K-006 (Wärmerampe `--waerme-0…4`, Wärmebereich `data-tone="warm"`) · K-008 (Leitungen rund, Isothermen nur berechnet) · K-009 (Auslöser `nachlauf` und `sicht`, √t-Regel, Klick-Wärme, Wärmefront statt View Transition) · K-010 (Wärmefeld, Büro-Zeichnungsfamilie, Kopfbild-Typen) · K-011 (Scroll-Auftritte höchstens auf der Hälfte der Abschnitte) · K-013 (Teilbudgets) · K-014 (Wärmebild kehrt berechnet zurück) · K-015 (neue Begriffe).
Änderungen in 1.2 mit Grund: K-001 (Zirkel entfällt, Vorlauf fließt fachlich richtig, E-029) · K-002 (Bosch-Status mit Vorbehalt, Bezahlung statt Gehaltsspanne, Seitenarten nach E-028) · K-003.2 (Fließrichtung, Rohr nur, wo etwas fließt) · K-003.5 (Dauerbewegung nur in Produkt- und Prozesszeichnungen, mit Anhalten) · K-003.6 (Verweis auf die Seitenarten in K-011) · K-008 (Enden je Linienart) · K-009 (Auslöser `dauer`, Startbedingung, Register) · K-010 (Linienarten, Maßstab, Symbole, Gerätedaten, Markenfassung) · K-011 (Seitenarten nach E-028) · K-012 (Beispiel ohne Euro-Betrag, E-030) · K-013 (Budgets der Zeichnungen) · K-014 (Wärmebild abgelöst, Lohn auf Anfrage, Ortsseiten per Gate) · K-015 (neue Begriffe).
Maßgebliche Detailquelle für Linienarten, Maßstab, Symbole und Gerätedaten ist `lib/zeichnung/` (K-010), für die Bewegung `lib/motion/register.ts`; für die übrigen Tokens der Prototyp `ausbau/richtungen/1/` (index.html, BEGRUENDUNG.md §8–§10), für `/jobs` und den Kopf der Stellenseiten `ausbau/richtungen/2/`. Das Wärmebild aus `ausbau/richtungen/3/` (WebGL) bleibt abgelöst (E-029); die Wärme kehrt als berechnetes Wärmefeld zurück (E-031, `lib/zeichnung/szenen/waermefeld.ts`). Änderungen nur durch den Orchestrator, mit Versionsnummer und Grund.

## Das Projekt in fünf Sätzen
1. Bad & Energie in Wetzlar, SHK-Meisterbetrieb seit 1926, sucht Fachkräfte, Azubis und Quereinsteiger im Umkreis von 35 km; die Karriereseite muss in Sekunden sagen, was die Stelle bietet und wie man sich in 60 Sekunden bewirbt.
2. Beim Umbau zur Plattform gingen Elemente der alten Seite verloren; 55 Muss- und Soll-Elemente kommen im Wesen zurück, gebaut in der Sprache der Plattform und nur mit belegten Fakten.
3. Die Gestaltung macht die Marke greifbar: Das Haus aus dem Logo ist eine Heizungsanlage, der rote Vorlauf und der blaue Rücklauf sind die Farben des Logos, und jede Zusage hängt als Maß an dieser Anlage.
4. Der erste Eindruck auf dem Handy des Chefs ist eigens komponiert, ohne Fotos, aus Schrift, SVG und wenig, sinnvoller Bewegung, schnell und barrierefrei.
5. Das Ergebnis geht nach bestandenem Merge-Gate (E-021) auf `main` und ist damit live.

## K-001 Leitidee
**Jede Zusage ist eingemessen: Das Haus aus dem Logo ist eine maßstäblich gezeichnete Anlage, das Einsatzgebiet steht als Maß „35 km“ im Giebel, und der rote Vorlauf läuft vom Wärmeerzeuger bis in deine Bewerbung.**
Austauschprobe (E-027, ersetzt die Uhr auf 13:30; E-029, ersetzt Zirkel und Einrasten): Ein anderer Betrieb kann 35 km, Giebel des Logos und 1926–2026 nicht zeigen, ohne zu lügen; jede Ortsseite zeigt ihre Lage auf derselben Skala (Lageplan mit Nordpfeil und Maßstabsleiste). Tragend sind die belegten Zusagen und die Genauigkeit der Zeichnung – Maße aus der Herstelleranleitung, Normsymbole, richtige Fließrichtung –, nicht das Allerweltsbild Haus + Wärmepumpe. Fachlich stimmt jetzt auch der Weg des Vorlaufs: Er beginnt an der Anlage und endet im Bewerben-Knopf (vorher floss er aus dem Knopf in die Pumpe).

## K-002 Marke, Zielgruppe, fünf Besucheraufgaben
**Marke (Annahme, abgeleitet aus Inhalten):** Bad & Energie GmbH Lahn-Dill – SHK-Meisterbetrieb in Wetzlar, gegründet 1926, 15 Leute; Schwerpunkt Wärmepumpen, Heizung und moderne Bäder; Fachbetrieb des Lahn-Dill-Kreises; Partner Buderus, Bosch, NIBE, Alpha Innotec und Viessmann (Fakt `partners5`: „Partnerbetrieb von Buderus und Bosch“). **Bosch-Status mit Vorbehalt (E-029):** Der Inhaber nennt den Status „Bosch Premium Partner“ (14.10.2026). Öffentlich belegt ist er nicht; er gilt erst mit Urkunde und Wortlaut (M-020) und bleibt bis dahin `pending` (Fakt `boschPremiumPartner`, `check-claims` sperrt den Wortlaut). Bosch-Logo, Anker, Partner-Badge und die Markenfassung der Zeichnung nur mit schriftlicher Erlaubnis (M-021); die Produktnennung als Wort („Wärmepumpen von Bosch“) bleibt erlaubt, soweit sie stimmt. Gefühl: ehrliches Handwerk, Verlässlichkeit, Stolz auf gutes Werkzeug, Nähe (höchstens 35 km), Respekt vor der Zeit der Leute (flexible Arbeitszeiten, keine unbezahlten Überstunden, kein Wochenend-Notdienst; fakten-abgleich B28), Diskretion beim Wechsel.

**Zielgruppe:** SHK-Fachkräfte (Anlagenmechaniker, Kundendiensttechniker, Obermonteure/Projektleiter), Auszubildende und Quereinsteiger im Umkreis von 35 km um Wetzlar (Lahn-Dill-Kreis, Gießen); meist in fester Anstellung und vorsichtig beim Wechsel; überwiegend am Telefon unterwegs, oft nach Feierabend; schätzen klare Fakten (Bezahlung, Arbeitszeit, Fahrzeug, Werkzeug) mehr als Werbesprache.

**Fünf Besucheraufgaben (Grundlage für Z-04):**
1. **Passende Stelle finden und verstehen** – Aufgaben, Bezahlung (Lohn auf Anfrage, über Tarif, Zusatzleistungen; E-030), Arbeitszeiten, Ausstattung (/, /jobs, /jobs/[slug]).
2. **Prüfen, ob der Arbeitsweg passt** – Einsatzgebiet und Fahrzeit vom eigenen Wohnort (/#einsatzgebiet, Stellenseiten).
3. **Sich in rund 60 Sekunden bewerben** – am Telefon, ohne Lebenslauf, diskret (/bewerbung, eingebetteter Flow auf Stellenseiten).
4. **Den Betrieb einschätzen** – seit 1926, Team, Werkzeug und Fahrzeug, Vorteile, Stimmen, Partner (/, Stellenseiten).
5. **Direkt und unverbindlich Kontakt aufnehmen** – Telefon, WhatsApp, E-Mail, Ansprechpartner Sabri Demir (überall, Danke-Seite).

**Seitenarten (Auftrag Abschnitt 7):**
- Erzählseiten (dürfen inszenieren, Signaturmomente erlaubt): `/` (Startseite), `/jobs/[slug]` (Stellenseiten), 404 (kleiner Charaktermoment); seit E-028 auch `/einsatzgebiet` mit Kreis-Hubs und Ortsseiten sowie `/arbeiten-bei-uns` mit den Themenseiten.
- Arbeitsseiten (ruhig, dicht, schnell, ohne Signaturmomente): `/jobs` (Liste), `/bewerbung` (Flow), `/bewerbung/danke`, `/bewerbung/mappe`, `/datenschutz`, `/impressum`.

## K-003 Gestaltungsprinzipien (Tun · Lassen)
1. **Eingemessen statt behauptet.** Tun: Zahlen als Maße an der Zeichnung (Martian Mono, Maßkette, Hinweislinie), Quelle `lib/content/facts.ts`. Lassen: Kennzahl-Kacheln, hochzählende Zahlen, Superlative.
2. **Ein Leitungspaar, das fließt, wohin Wasser fließt (1.2, E-029).** Tun: Rot = Vorlauf vom Wärmeerzeuger zum Verbraucher (warm, Hauptaktion), Blau = Rücklauf vom Verbraucher zurück zum Wärmeerzeuger (kühl, Fokus); Kältemittel in Navy mit Etikett (Heißgas, flüssig, Sauggas). Jeder Leitungspfad ist in Fließrichtung gezeichnet und beginnt am Erzeuger; so stimmen Pfeile und Bewegung von selbst. Der Vorlauf endet im Bewerben-Knopf, er beginnt nie dort. Rohre nur, wo Wasser oder Kältemittel fließt; Fortschrittsstrang und Leitungspaar im Bewerbungsflow bleiben, weil sie eine Funktion haben. **Rohrakzente (1.3, E-031)** kehren zurück, aber nur an freigegebenen Stellen, normgerecht und still: Rohrklammer (Abschnittsköpfe, Unterzeile im Hero), Leitungstrenner (S-Bogen mit konzentrischen Radien 12/24 im Paarabstand), Heizkreis (um „35 km“, nur Desktop), Verteiler (Themen-Hub, maßstäblicher Heizkreisverteiler) und Absperrung (Diskretion, geschlossener Kugelhahn nach DIN EN ISO 10628-2); harte 3-px-Oberkanten werden zum Rohrakzent mit runden Enden. Lassen: Rohrakzente an anderen Stellen, Rot als Hervorhebung, Text oder Fläche außer dem Knopf.
3. **Zwei Stimmen.** Tun: Bricolage Grotesque spricht die Botschaft, Martian Mono spricht die Maße, Atkinson Hyperlegible Next trägt das Lesen. Lassen: eine dritte Display-Stimme, Mono im Fließtext.
4. **Handy zuerst, eigens komponiert.** Tun: Schrift in Bildgröße, Haus angeschnitten, Hauptaktion in der Daumenzone, Höhenstufen in `svh`. Lassen: gestapelten Desktop.
5. **Bewegung erzählt einmal – nur die Maschine läuft weiter (1.2, E-029).** Tun: ein Auftakt ≤ 1,12 s, danach Ruhe; Rückmeldung bei Berührung. Dauerbewegung nur in Produkt- und Prozesszeichnungen (Rotor des Außengeräts, Wasser im Anlagenschema, Kältemittel im Kältekreis), nur wenn alle Startbedingungen erfüllt sind (K-009), immer mit sichtbarem Knopf „Anhalten“ (WCAG 2.2.2); sonst ein vollständiges Standbild mit festen Fließpfeilen. **Wärme (1.3, E-031):** Die Wärme breitet sich einmal aus – im Hero nach dem Vorlauf (`nachlauf`, Ende ≤ 1,92 s), auf Seiten beim Sichtbarwerden (`sicht`, Ende ≤ 2,4 s) –, ein Klick gibt kurz Wärme ab, und ein Seitenwechsel deckt mit Wärmeschichten ab und auf; keine neuen Schleifen. Lassen: Schleifen an Schrift, Knöpfen, Symbolen und Schmuck; Pulsieren, Leuchten; Skalieren außer nach √t (K-009); Scroll-Auftritte auf mehr als der Hälfte der Abschnitte, Laufbänder, Konfetti.
6. **Erzählseite inszeniert, Arbeitsseite dient.** Tun: Signatur und Dauerbewegung nur auf Erzählseiten (K-011; seit E-028 auch Einsatzgebiet und Themen); Formulare ruhig und dicht. Lassen: Effekte im Bewerbungsflow.

## K-004 Plattformregeln
- **Technik:** Next.js 16 App Router (`proxy.ts` statt Middleware), React 19, Tailwind CSS 4.3 mit `@theme` in `app/styles/theme.css` (drei Ebenen: Primitive → semantische Rollen in `:root`/Dunkel/`[data-tone="inverse"]` → `@theme inline`-Utilities), Bun 1.4 als Paketmanager, Server-Komponenten als Standard.
- **Styling:** Komponenten nutzen nur semantische Utilities (`bg-surface`, `text-ink`, `border-line`, `text-title-2` …). Rohpaletten, Hexwerte in Klassen, `text-[…]`, freie Schatten sind per `scripts/qa/check-design-tokens.mjs` verboten (Ausnahme pro Zeile nur mit `// design-allow` und Grund). Kontraste werden per `scripts/qa/check-contrast.mjs` aus `theme.css` gerechnet – Rollenwerte bleiben reine Hexwerte. Neue Token-Namen müssen in `lib/utils/cn.ts` (`extendTailwindMerge`) eingetragen werden, sonst verschluckt `cn()` Klassen. JS-Spiegel der Bewegungswerte in `lib/tokens/index.ts`.
- **Komponenten:** `components/ui/*` (cva + `variants.ts`, `@radix-ui/react-slot` für `asChild`), Seitenrahmen `components/site/*`, Abschnitte `components/home/*`, Stellen `components/jobs/*`, Flow `components/apply/*`, Mappe `components/mappe/*`, Region `components/maps/*`, Stimmen `components/reviews/*`, Recht `components/legal/*`. Varianten statt Kopien.
- **Inhalte:** Fakten nur aus `lib/content/facts.ts` (mit Quelle, `pending` = nicht ausspielen außer wo die Basis es erlaubt), Stellen aus `lib/jobs/data/*`, Texte der Startseite aus `components/home/content.ts`. Sprache: nur Deutsch, Anrede „du“ in Recruiting-Texten.
- **Themen:** Hell/Dunkel über `prefers-color-scheme`, Druck immer hell; jedes neue Teil beherrscht hell, dunkel, Inverse-Band und Druck.
- **Tests:** Vitest (`bun run test`, 927 grün in P0), Playwright (`playwright.config.ts`: 4 Projekte mobil/Desktop × hell/dunkel, `reducedMotion: 'reduce'`, axe WCAG 2.2 AA), Guards (`check:design`, `check:contrast`, `check:client-imports`), `test:graph` (JSON-LD), Lighthouse CI (`lighthouserc.json`). Neue Funktionen bekommen Vitest- und E2E-Tests im bestehenden Muster.
- **Dateihoheit (E-012):** nie `supabase/**`, `lib/supabase/**`, `lib/uploads/**`, `app/admin/**`, `app/api/admin/**`; gemeinsame Verträge nur ergänzend mit Absprache-Eintrag.
- **Sicherheit:** CSP derzeit Report-Only in `next.config.ts` mit `'unsafe-inline'` für Skripte (ein Hash würde die Inline-Skripte von Next sperren, E-022); Hash des Kopfskripts dokumentiert in `lib/motion/head-script.ts`; Nonce-Strategie offen (M-018); keine neuen Drittanbieter.

## K-005 Typografie
- Familien (OFL, selbst gehostet über `next/font/local`, woff2 latin + latin-ext, ≤ 250 KB gesamt, zwei Schnitte vorgeladen, Ersatzschrift mit Metrik-Overrides): **Bricolage Grotesque** (Display, 800, −0,01 em), **Atkinson Hyperlegible Next** (Text 400/700), **Martian Mono** (nur Maße und Planbeschriftung; Werte Breite 75 %, Etiketten Versalien +0,06 em). Lizenzen in `app/fonts/LIZENZEN.md`. Kaufempfehlung: M-017.
- Skala: höchstens 10 Stufen, fließend per `clamp` mit rem-Anteil; Display mobil am längsten Wort („Anlagenmechaniker“) geprüft; Zeilenhöhe Display 0,92–1,05, Text 1,5–1,6; Zeilenlänge 60–75 Zeichen; `text-wrap: balance` für Überschriften, `pretty` für Absätze; `hyphens: auto`, `lang="de"`.
- Utilities: Mono und Versalien nur über semantische Klassen (`font-mass`, `text-etikett`), nie `font-mono`/`uppercase` direkt (Guard).

## K-006 Farbe (E-016)
| Rolle | hell | dunkel | Verwendung |
|---|---|---|---|
| Papier (Fläche) | #FBF7F0 | #0A1033 | Seitengrund, Dokumenthintergrund, `theme-color` |
| Wand (Fläche 2) | #F1E9DB | #131B4A | Abschnittsflächen, Hover-Flächen |
| Wärme | #FADCC9 | #47445B | Hausfüllung, warme Felder |
| Tinte | #111A3B (≈) | #F6F0E4 | Fließtext |
| Navy (Marke) | #111D6D | #F6F0E4 | Überschriften, Linien, Maße |
| Tinte 2 | #3E4885 / #454C78 | #B9C0E8 | Nebentext |
| Rot (Hauptaktion, Vorlauf) | #D60000 · Hover #B00000 · Druck #A80000 | Linie #FF6B5F, Knopf #D60000 | nur Knopffläche und Vorlauf-Linie |
| Blau (Rücklauf, Fokus) | #1F57C4 | #86AEFF | Rücklauf, Fokusring, Zweitweg-Hover |
| Erfolg | Grün nur für Erfolg | | |
| Wärmerampe `--waerme-0…4` (1.3, E-031) | 5 Stufen Papier → Pfirsich (`--p-waerme-0…4`) | 5 Stufen Nacht-Blau → Pflaume (`--p-pflaume-0…4`) | nur die Bänder des Wärmefelds, Klick-Wärme und Wärmefront (Guard `waerme-rollen`) |
Kontraste: alle Textpaare ≥ 4,5:1, Grafik/Bedienelemente ≥ 3:1 (Prüfung `scripts/qa/check-contrast.mjs`; Werte in `ausbau/richtungen/1/BEGRUENDUNG.md` §10). Inverse-Band: Navy-Fläche mit Creme-Schrift. Druck: immer helle Primitiven.
**Wärmebereich (1.3, E-031):** `[data-tone="warm"]` umschließt das Rauminnere einer Zeichnung (auch im Navy-Band). Hell gelten die Rollen des Papiers (Navy-Linien, Vorlauf #D60000, Rücklauf #1F57C4), dunkel Creme-Linien auf der Pflaumen-Rampe; `line-strong` ist dort eine Stufe kräftiger. Die Rampe ist in jedem Modus gesetzt (hell, dunkel, Inverse-Band, Druck = hell) und in `lib/tokens/index.ts` gespiegelt. `check-contrast` prüft im Wärmebereich hell, dunkel und Druck: Linien (Marke, Vorlauf, Rücklauf, line-strong) auf jedem Band ≥ 3:1, Text (Tinte, Marke) ≥ 4,5:1, Nachbarbänder im Helligkeitsverhältnis 1,04–1,35. Linien über den Bändern stehen immer im Wärmebereich.

## K-007 Raster und Abstände
12 Spalten, Bundsteg `clamp(1rem, 2.2vw, 1.5rem)`, Seitenrand `clamp(1.25rem, 4vw, 4rem)`, Satzspiegel ≤ 84 rem. Abstandsskala 11 Stufen: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 80 · 96 · 128 px. Paarabstand der Leitungen `--paar` = 12 px. Benachbarte Abschnitte wechseln Struktur und Dichte (S-12); mobil eigene Komposition.

## K-008 Formen, Flächen, Tiefe
Radien 4 Stufen: 4 · 12 · 24 · 999 px (24 = äußerer Bogen eines Leitungspaars). Ecken als 45°-Fasen (Giebel). **Enden je Linienart (1.3, E-031, Tabelle in K-010):** Leitungen haben runde Enden und runde Ecken und biegen mit Radius; Konturen haben stumpfe Enden und runde Ecken; Maß-, verdeckte und Mittellinien sowie feine Linien bleiben stumpf (`butt`) mit spitzen Ecken nach DIN. Rohre, die sich beim Laden zeichnen (pathLength), sind nur während des Auftakts stumpf. Runde Enden sonst nur bei Bedienzeichen (`--m-icon`). Ein Schatten (nur technische Brückenlücke). Tiefe durch Flächen (Papier/Wand/Wärme) und angeschnittene Zeichnung, nie durch Glas, Glow oder Verläufe. Schnittflächen und Erdreich als 45°-Schraffur in `--m-fein`. **Isothermen (1.3, E-031)** nur aus `lib/zeichnung/szenen/waermefeld.ts` (berechnet, mit Herkunft und Lock-Test), als flache Bänder; Verläufe bleiben verboten.

## K-009 Bewegung
- Architektur E-013: CSS-first, `lib/motion/` (reduzierte Bewegung, hover/pointer, IntersectionObserver), Kopfskript setzt die Klasse `auftakt` vor dem ersten Rendern, 2-s-Sicherheitsnetz, CSP-Hash. Keine Bibliothek, kein WebGL (E-021).
- Tokens: Dauern `--d-1` 120 · `--d-2` 240 · `--d-3` 400 · `--d-4` 600 ms; Takt 80 ms (Verzögerungen nur als Vielfache); Kurven aus `(.16,1,.3,1)`, wechselnd `(.65,0,.35,1)`, ein `(.32,0,.67,0)`, dazu linear. Eingänge d-2/aus, Ausgänge d-1/ein.
- Register: verbindlich ist `lib/motion/register.ts` (der Guard liest `MOTION_IDS` wörtlich). Herkunft ist die Tabelle in `ausbau/richtungen/1/BEGRUENDUNG.md` §9, ergänzt um `fortschritt` (Leitungsstrang im Bewerbungsflow, d-2), `kreis-schliessen` (Danke-Seite, einmal, d-3), `seitenwechsel` (seit 1.3 die Wärmefront, vorher View Transition) und die Kennungen aus E-027/E-028. Stand 1.2 (E-029): neu `rotor-dreht`, `wasser-fliesst`, `kaeltemittel-fliesst` (Auslöser `dauer`); entfallen `luft`, `luefter` (halber Dreh), `waerme` (Skalierung) und `kreislauf-zeigen` (Knopf, ersetzt durch „Anhalten“/„Abspielen“); `radius-einrasten` (Skalierung) entfällt mit dem Zirkel bzw. bleibt höchstens als Überblendung (`opacity`); `uhr` ist seit E-027 entfallen. Jedes animierte Element trägt `data-motion`.
- **Wärme (1.3, E-031):**
  - Neue Auslöser: `nachlauf` (Hero, in der Phase des Kopfskripts unter `.auftakt`; Start nach `NACHLAUF_START_TAKTE` = 7 Takten, wenn der Vorlauf den Heizkörper erreicht; Ende ≤ `NACHLAUF_ENDE_MS` = 1.920 ms < Sicherheitsnetz 2.000 ms) und `sicht` (einmal beim Sichtbarwerden, Ende ≤ `SICHT_ENDE_MS` = 2.400 ms ab dem Auslöser; Insel `components/zeichnung/bewegung/SichtStart.tsx` mit `data-ablauf` fertig → bereit → laeuft → fertig, beim Laden sichtbar oder reduziert: Endzustand). `tippen` trägt die Klick-Wärme (Ende `KLICK_ENDE_MS` = 480 ms), `navigation` die Wärmefront (`WECHSEL`: abdecken 360 ms, aufdecken 240 ms, halten höchstens 1.200 ms).
  - Neue Kennungen: `waerme-breitet-sich-aus` (Bänder 1–4 des Wärmefelds, `nachlauf` im Hero und `sicht` auf der Wärmepumpen-Seite, je d-4, Verzögerungen aus den Daten), `buero-ablauf` (Szenen der Büro-Themenseite, `sicht`, d-3/d-4, ≤ 22 Takte), `klick-waerme` (drei Scheiben, d-3, nicht in Formularen und nicht auf `/bewerbung*`); `seitenwechsel` ist die Wärmefront (Überlagerung, kein View-Übergang). Die Eigenschaft `view-transition` entfällt: animiert werden nur `transform`, `opacity` und `stroke-dashoffset`.
  - **Skalieren nur nach √t:** Jeder Keyframe-Ablauf mit `scale` steht genau auf den Stützstellen `DIFFUSION_STUETZ` (0 | 0, 0,0625 | 0,25, 0,25 | 0,5, 0,5625 | 0,75, 1 | 1), linear dazwischen, monoton steigend. Band 0 (der ganze Raum) steht still.
  - Notschalter `WAERMEFELD_AN` (`lib/zeichnung/waerme/schalter.ts`) und `WAERMEFRONT_AN` (`lib/motion/seitenwechsel.ts`). `DAUER_IDS` bleibt bei genau drei Kennungen, `dauer.module.css` unverändert.
- **Dauerbewegung (1.2, E-029):**
  - Auslöser `dauer` mit `schleife: { periodeMs, pausierbar: true, nurSichtbar: true }`; jede `dauer`-Kennung ist pausierbar, nur auf Erzählseiten erlaubt und hat eine Periode ≥ 400 ms. Die einmaligen Abläufe enden weiter nach ≤ 1.120 ms (`AUFTAKT_ENDE_MS`).
  - **Startbedingung** (`lib/motion/dauer.ts`, reine Logik; Sichtbarkeit über `lib/motion/sicht.ts`): Eine Schleife läuft nur, wenn alles zutrifft – JS ist geladen, die Zeichnung ist im Sichtfeld, der Tab ist sichtbar, `prefers-reduced-motion: no-preference`, nicht angehalten. Sonst steht ein vollständiges Standbild mit festen Fließpfeilen; ohne JS ist das der Normalzustand.
  - **Anhalten:** `components/zeichnung/bewegung/DauerSteuerung.tsx` (Client, ≤ 2 KB gzip) setzt `data-dauer`. Knopf 44 × 44 px mit Text „Anhalten“/„Abspielen“; ein Druck hält alle Schleifen der Seite an; kein Speicher im Browser. Bei reduzierter Bewegung ist der Knopf verborgen, weil nichts läuft.
  - **Was sich bewegt:** Rotor per `rotate`, linear, ein Blattabstand je 600 ms, auf eigener Ebene. Wasser und Kältemittel über einen Überlagerungspfad mit Strichmuster und `stroke-dashoffset`; der Pfad ist in Fließrichtung gezeichnet (K-003.2). Kein Pulsieren, kein Leuchten, kein Skalieren.
  - `infinite` steht nur in `components/zeichnung/bewegung/dauer.module.css`, nur unter `[data-dauer="an"]` und `prefers-reduced-motion: no-preference` (Guard-Regel `endlos`; einzige weitere Ausnahme mit Grund: die Ladeanzeige in `components/ui/eingabe.module.css`). `einstieg.module.css` bleibt ohne `infinite`.
  - Leistung: Malzeit je Bild unter 2 ms im Trace (Moto-G-Profil); sonst Ausweichlösung `steps(8)`.
- Signaturmomente (Erzählseiten): (1) Startseite „Der Kreislauf läuft an“ (Auftakt ≤ 1,12 s, einmal; danach breitet sich die Wärme im Raum aus, Ende ≤ 1,92 s, und der Rotor dreht in der Einzelheit des Außengeräts, solange die Startbedingung gilt), (2) Stellenseite: Der Vorlauf führt zur Bewerbung (V2); der Heizkreis um das Gehalt entfällt mit E-030, (3) Danke-Seite „Der Kreis schließt sich“ (Erfolg, ruhig). Reduziert: Endzustand bzw. Standbild sofort.

## K-010 SVG-Formsystem: Technische Zeichnung 2.0 (1.2, E-029)
**Grundsatz.** Rohr nur, wo Wasser oder Kältemittel fließt. Jede Zeichnung ist entweder eine maßstäbliche technische Zeichnung oder ein Fließschema mit Normsymbolen. Die Grundgeometrie bleibt Giebel 45° (Hausschnitt) und Kreis.

**Linienarten** (DIN EN ISO 128-2, an den Bildschirm angepasst; Tokens in `app/styles/theme.css`, gespiegelt in `lib/tokens/index.ts`, Helfer in `lib/zeichnung/norm.ts`; alle mit `vector-effect: non-scaling-stroke`):

| Token | px | Enden | Verwendung |
|---|---|---|---|
| `--m-leitung` | 3 | rund, Ecken rund, Bögen mit Radius (1.3) | Vorlauf, Rücklauf, Kältemittel |
| `--m-kontur` | 2 | stumpf, Ecken rund (1.3) | Gehäuse, Wände, Geräte |
| `--m-fein` | 1 | stumpf | Gitter, Lamellen, Fugen, Schraffur |
| `--m-mass` | 1 | 45°-Begrenzungsstrich (DIN 406) | Maß- und Hinweislinien |
| verdeckt / Mittellinie | 1, gestrichelt bzw. Strich-Punkt | stumpf | Verdampfer hinter der Front, Lüfterachse |
| `--m-icon` | 2 | rund | nur Bedienzeichen |

Der eine 3-px-Strich mit runden Enden aus 1.1 (`--m-strich`) geht in `--m-leitung` und `--m-icon` auf; die Icons wechseln in P2 von 3 auf 2 px.

**Maßstab als Daten** (`lib/zeichnung/`). In Gerätezeichnungen gilt 1 Einheit = 1 mm, im Hausschnitt 1 Einheit = 10 mm. Die viewBox einer Gerätezeichnung entspricht den Maßen aus ihrem Geräte-Modul; das eingesetzte Außengerät im Hausschnitt misst 110 × 80 Einheiten. Website und OG-Bilder nutzen dieselbe Geometrie (`lib/zeichnung/szenen/hausschnitt.ts`). Schriftfeld in Martian Mono: „Maße in mm · maßstäblich gezeichnet“. Nichts schwebt, nichts ist aus Gefälligkeit größer gezeichnet (Flachheizkörper 600 × 1000 mm).

**Symbole** (`lib/zeichnung/symbole.ts`, Grundlage DIN EN ISO 10628-2): Pumpe, Absperrventil, Rückschlagventil, Sicherheitsventil, Ausdehnungsgefäß, Plattenwärmetauscher, Speicher, 3-Wege-Ventil, Verdichter, Expansionsventil, Heizkörper, Fußbodenheizung, Fühler. Fließschemata bestehen nur aus diesen Symbolen (`components/zeichnung/technik/Symbol.tsx`).

**Gerätedaten** (jeder Wert im Modul mit Quelle und Seitenangabe, Schätzwerte als `geschaetzt` markiert):
- `geraete/compress-aw-s.ts` – Bosch Compress 5800i/6800i AW, Außeneinheit AW 4|5|7 OR-S: 1.100 × 800 × 540 mm (B × H × T), Tiefe mit Bodenhalterungen 580 mm, vier Bodenhalterungen mit 881 mm Abstand, hydraulische Anschlüsse hinten links auf 202 mm Höhe, Kondensatablauf an der Unterseite. **Quelle:** Bosch-Installationsanleitung AW 4|5|7 OR-S, Dok.-Nr. 6721840669 (2025/06), Bilder 4–6 und Tabelle 26 (Bild 4 nennt 802 mm Höhe, Tabelle 26 nennt 800 mm).
- `geraete/compress-aw-l.ts` – Außeneinheit AW 10|12 OR-T: 1.350 × 1.100 × 540 mm. **Quelle:** Bosch-Installationsanleitung AW 10|12 OR-T, Dok.-Nr. 6721842854 (2023/10), Tabelle 5.
- `geraete/inneneinheit.ts` – Maße `null`, bis das Modell feststeht (M-022); bis dahin nur als Symbol.
- Übernommen werden nur Zahlen. Fotos, Renderings und die Zeichnungen der Anleitungen werden weder abgepaust noch vektorisiert (§§ 2 Abs. 1 Nr. 7, 23, 72 UrhG; Bosch-Nutzungsbedingungen digitale Inhalte, Ziffer 7.2).

**Neutrale Fassung und Markenfassung** (`components/zeichnung/technik/Aussengeraet.tsx`, Props `ansicht` vorne/seite, `groesse` S/L, `variante` neutral/marke, `massketten`, `bewegt`, `titel`):
- *Neutral (Standard):* Gehäuse mit gerundeter Oberkante, runde Ausblasöffnung mit konzentrischem Schutzgitter, dahinter ein allgemeiner Axialrotor, Verdampfer als verdeckte Linie, vier Konsolen, Anschlüsse hinten links, Kondensatablauf, Maßketten 1100/800/540. Kein Logo, kein Anker, kein gestufter Ring-Diffusor.
- *Marke:* nur, wenn `lib/zeichnung/marke.ts` `BOSCH_FREIGABE.erteilt` mit Belegpfad enthält (M-021). Ohne Freigabe sperrt ein Test die Variante.

**Farben (K-006 bleibt).** Kontur Navy (auf Navy-Fläche Creme), Vorlauf Rot #D60000, Rücklauf Blau #1F57C4, Kältemittel Navy mit Etiketten (Heißgas, flüssig, Sauggas). Nur flache Flächen, Erdreich als 45°-Schraffur, keine Verläufe; nur `currentColor` und Rollen-Variablen. Das gezeichnete Wärmebild aus E-024 bleibt abgelöst; Isothermen nur berechnet (unten).

**Wärmefeld (1.3, E-031).** Ein Löser (`lib/zeichnung/waerme/`, Skript `bun run zeichnung:waermefeld`, Prüfmodus `--pruefen`) rechnet das Temperaturfeld im Rauminneren des Hausschnitts (x 330…750, y 305…555, 4,2 × 2,5 m) und im Vergleichsraum der Wärmepumpen-Seite (Heizkörper bzw. Fußbodenheizung) und schreibt `lib/zeichnung/szenen/waermefeld.ts` (`WAERMEFELDER`) mit Herkunft (Skript, Eingabe-Hash, Modell, Raster, Iterationen, Residuum). Band 0 ist das Innenrechteck, die Bänder 1–4 sind Isothermen auf festen Schwellen, geschachtelt, im Raum, mit Startverzögerung aus einem zeitabhängigen Lauf (heiß zuerst). Gezeichnet nur aus diesen Daten (`components/zeichnung/waerme/`), nie auf Gerät oder Lageplan.

**Büro-Zeichnungsfamilie (1.3, E-031).** `lib/zeichnung/buero/` mit genormten Maßen (A4 nach ISO 216, Schreibtisch nach DIN EN 527-1, DIN lang nach DIN 678, Europalette nach EN 13698-1; Schätzwerte markiert): Leitstelle in Draufsicht mit Bezugslinien in Maß- und Fein-Linienart (keine Rohrfarben, nichts fließt) und vier Szenen (Termine, Angebote und Rechnungen, Material, Ablage). Bewegt nur auf der Themenseite, auf der Stellenseite nur als Dateien.

**Kopfbilder als Datei (`lib/zeichnung/kopf-svg.ts`):** Typen `anlagenschema`, `hausschnitt` und `buero`; keine Kopfzeichnung steht inline im Dokument (`scripts/qa/check-css-chunks.mjs`).

**Zeichnungen und Einsatzorte:**
- Startseite: Hausschnitt mit 45°-Giebel und „35 km“ als Maß in Schrift; Außengerät maßstäblich vor der Wand, Erdleitung mit Schraffur, Inneneinheit als Symbol, Flachheizkörper, im Rauminneren das Wärmefeld (1.3); Einzelheit „X“ als Frontansicht mit Maßketten und drehendem Rotor. Der Vorlauf läuft von der Anlage zum Bewerben-Knopf.
- `/arbeiten-bei-uns/waermepumpen`: Außengerät Front und Seite; Anlagenschema (Außengerät → Erdleitung und Wanddurchführung → Inneneinheit mit Speicher, Pumpe, Umschaltventil → Heizkörper bzw. Fußbodenheizung) und Kältekreis (Monoblock: Verdampfer → Verdichter → Plattenwärmetauscher → Expansionsventil; das Kältemittel bleibt im Außengerät), bewegt und mit Erklärtext.
- Kundendienst-Stelle: Außengerät bewegt, mit Maßketten. Anlagenmechaniker- und Ausbildungsstelle: Anlagenschema, statisch und beschriftet. Obermonteur: Hausschnitt klein.
- Ortsseiten: Lageplan mit Nordpfeil und Maßstabsleiste.
- OG-Bilder aus denselben Modulen; die Glyphe `waermepumpe` folgt den Proportionen des Außengeräts.
- Bestand bis zur Ablösung in P2: offene Leitung mit Wegweiser (404), Kreis schließt sich (Danke), Fortschrittsstrang im Bewerbungsflow.

**Allgemein (unverändert aus 1.1).** Raster 24 × 24 (Rand 2) für Icons, Icon-Familie in `components/icons/` (ersetzt lucide); Linienzeichnen über Masken/`stroke-dashoffset`; dekorativ `aria-hidden`, bedeutungstragend `role="img"` + `<title>`; SVGO-Konfigurationen statisch/animiert (`_relaunch/werkzeuge/svgo.*.mjs`); keine eingebetteten Pixelbilder.

**Prüfungen.** `components/zeichnung/__tests__/technik.test.ts`: viewBox gleich den Maßen der Geräte-Module, Box des eingesetzten Geräts 110 × 80, Enden je Linienart (1.3: nur Leitungen rund, exakt je Selektor in `components/zeichnung/__tests__/linienarten.test.ts`), nur Rollenfarben, Vorlauf beginnt am Wärmeerzeuger und Rücklauf umgekehrt, `variante="marke"` nur mit Freigabe, Budgets per zlib (K-013), jede `dauer`-Kennung liegt in einem Bereich mit `DauerSteuerung`. `zeichnung.test.ts` und `zeichnungen-seitenkopf.test.ts` prüfen die Linienarten aus `norm.ts`. Fachliche Abnahme durch einen Meister (M-037).

## K-011 Komponenten, Zustände, Seitenarten 
**Seitenarten.**
- Erzählseiten (`/`, `/jobs/[slug]`, 404; seit E-028 auch `/einsatzgebiet/**` und `/arbeiten-bei-uns/**`): ein Blickfang je Bildschirmhöhe; benachbarte Abschnitte unterscheiden sich in Struktur und Dichte (S-12); Signaturmomente nur hier. Scroll-Auftritte (Auslöser `sicht`, 1.3) auf höchstens der Hälfte der Abschnitte einer Seite (S-02); die Wärmefront führt nur zu Erzählseiten.
- Arbeitsseiten (`/jobs`, `/bewerbung*`, `/datenschutz`, `/impressum`): ruhig, dicht, schnell. Nur Rückmeldungs- und Zustandsbewegung, keine Auftritte beim Scrollen; auf `/bewerbung*` und in Formularen keine Klick-Wärme. Formular zuerst, Erklärung daneben oder darunter.

**Komponenten.** `components/ui/*` mit cva-Varianten statt Kopien. Neue Aufgaben werden zur Variante einer vorhandenen Komponente, wo eine passt (Auftrag 8: Verschmelzen). Abschnitte unter `components/home/*`, Stellen unter `components/jobs/*` usw. (K-004). Eine Komponente wird nur neu angelegt, wenn keine vorhandene die Aufgabe trägt; Beispiele sind `TrustLine`, `BenefitConfigurator`, `ProgressRing`, `UploadPanel` und `components/icons/*`.

**Zustände (Pflicht für jedes interaktive Element, wo der Zustand vorkommen kann):**

| Zustand | Regel |
|---|---|
| Ruhe | aus Rollen-Tokens, nie aus Rohwerten |
| Hover | nur bei `(hover: hover) and (pointer: fine)`; nie einzige Informationsquelle |
| Fokus | `:focus-visible` mit `outline` ≥ 2 px und Abstand; Kontrast ≥ 3:1 gegen Umgebung und Ruhezustand; `scroll-padding-top` in Höhe von Kopf und StickyApplyBar |
| Aktiv | Druck-Rückmeldung sofort (Dauerstufe „Rückmeldung“), Touch mit eigener Rückmeldung |
| Deaktiviert | sichtbar anders, mit Grund in Textform, wenn der Grund nicht offensichtlich ist (z. B. Upload bis Phase 2) |
| Lädt | Anzeige erst nach 300 ms, dann mindestens 500 ms sichtbar; Knopf behält seine Breite |
| Fehler | Text mit Ursache und nächstem Schritt, Icon und Farbe nur zusätzlich; Alternativweg Telefon/WhatsApp |
| Erfolg | Text zuerst; Bewegung bestätigt, blockiert nie |
| Leer | erklärt, warum leer, und bietet den nächsten Schritt an |

**Bedienmaße.** Touch-Ziele 44 × 44 px, Auswahlkarten ≥ 64 px Höhe, nie unter 24 × 24 px (WCAG 2.5.8). Eingabefelder ≥ 17 px Schrift (kein iOS-Zoom). Sichtbare Beschriftungen, `autocomplete`, Fehlermeldungen am Feld. Hilfe (Telefon, WhatsApp) steht immer an derselben Stelle (WCAG 3.2.6).

## K-012 Inhalte, Ton, Mikrotexte 
- **Wahrheit:** Jede Arbeitgeber-Aussage kommt aus `lib/content/facts.ts`. Dort markierte Fakten mit `pending` erscheinen nur, wo die Basis es erlaubt; `validUntil` wird beachtet (Jubiläum bis 31.12.2026). Was nicht im Register steht, wird nicht behauptet. Das gilt für Zahlen, Auszeichnungen, Zitate und Bewertungen; offene Belege stehen in MENSCHEN.md (M-003, M-007…M-015).
- **Ton:** du-Anrede, kurze Hauptsätze, Fakt vor Adjektiv („Keine unbezahlten Überstunden“ statt „attraktive Arbeitszeiten“). Handwerkersprache ohne Jargon-Überhöhung. Keine KI-Floskeln (S-13: „nahtlos“, „innovativ“, „ganzheitlich“, „maßgeschneidert“, „Entdecken Sie …“, „auf das nächste Level“), keine Superlative ohne Beleg.
- **Typografie im Text:** „…“ als Anführungszeichen, Gedankenstrich –, Halbgeviert für Bereiche (1926–2026, Mo–Do; Euro-Beträge zu Lohn oder Gehalt gibt es seit E-030 nicht mehr), geschütztes Leerzeichen vor Einheiten und in Zahl-Wort-Paaren (35 km, 16 Min., 30 Tage). `lang="de"` und `hyphens: auto` im Fließtext; weiche Trennstellen für lange Berufsnamen (`titleShy`).
- **Knöpfe sagen, was passiert:** „Jetzt in 60 Sekunden bewerben“, „Mappe als PDF speichern“, „Route in Google Maps öffnen“; nie „Absenden“, „Mehr“ oder „Klicken Sie hier“.
- **Fehlertexte:** was passiert ist, was jetzt zu tun ist, und der Direktweg (Telefon/WhatsApp mit Sabri Demir).
- **Mikrotexte** ändert der Lauf direkt (TEXTE = Mikrotexte direkt). Längere Texte gehen als Vorschlag nach `TEXTVORSCHLAEGE.md`. Rechtstexte bleiben wörtlich.

## K-013 Budgets (aus dem Auftrag, gemessen mit `_relaunch/werkzeuge/lh.mjs` und `groessen.mjs`)
Lighthouse mobil ≥ 90 · LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms · INP ≤ 200 ms · zusätzliches JS für Bewegung ≤ 60 KB gzip (Ziel ≤ 8 KB, E-013) · Schriften ≤ 250 KB gesamt · Icon-SVG ≤ 1,5 KB (roh) · Illustrations-SVG ≤ 40 KB gzip. Ausgangswerte (P0): Perf mobil 94–96, LCP mobil 2,63–3,08 s (über Budget!), CLS 0, TBT 80–108 ms, Schriften 47 KB (eine Inter-Datei), JS je Seite 170–224 KB gzip.

Ergänzung Lauf 2 (E-018): Erzählseiten dürfen bis 120 KB gzip JS für Bewegung nutzen, nur nachgeladen; gebaut wird ohne WebGL (E-021), Ziel bleibt ≤ 8 KB. Zielreserve LCP mobil ≤ 2,2 s.

Ergänzung 1.2 (E-029, Technische Zeichnung 2.0):
- Die Zeichnungen werden auf dem Server gerendert; das erste Bild steht ohne JS.
- **Einstieg** (Hero-Zeichnung der Startseite) ≤ 15 KB gzip · **Gerät** (eine Gerätezeichnung) ≤ 12 KB gzip · **Steuerung** (`DauerSteuerung`, Client-Code) ≤ 2 KB gzip. Geprüft per zlib in `components/zeichnung/__tests__/technik.test.ts`.
- **Malzeit** je Bild unter 2 ms im Trace (Moto-G-Profil); sonst Ausweichlösung `steps(8)`. Bewegung nur über `transform`, `opacity` und `stroke-dashoffset`.
- **LCP nicht schlechter** als vor E-029: Messung vorher und nachher mit `_relaunch/werkzeuge/lh.mjs` (Median aus 5, mobil, `start` und `stellen`), dazu `groessen.mjs` und `svg-pruefung.mjs`.

Ergänzung 1.3 (E-031, Wärme und Weichheit):
- Hero weiter ≤ 15 KB gzip (vor E-031 gemessen: 5.128 B), davon die Bänder des Wärmefelds ≤ 3 KB gzip; Band 0 als Fläche ohne Pfad.
- JS: `SichtStart` ≤ 1 KB gzip, Wärmefront ≤ 2 KB gzip, `DauerSteuerung` ≤ 2 KB gzip (unverändert); je Büro-Zeichnung ≤ 12 KB gzip.
- CSS (geprüft nach dem Build, `scripts/qa/check-css-chunks.mjs`): Regeln aus `waerme.module.css` ≤ 1.400 B je Seite, aus `waermefront.module.css` ≤ 1.200 B auf jeder Seite, Büro-Block in `themen.module.css` nur auf Themenseiten ≤ 2.500 B; die Grenzen für Stylesheets je Seite und `TECHNIK_BUDGET` bleiben.
- Malzeit je Bild unter 2 ms (mobil, CPU 4×) auch während der Wärme; CLS ≤ 0,02; LCP nicht schlechter als vor E-031 (`_relaunch/belege/e031-vorher/`).

## K-014 Wünsche (verbindliche Inhaberentscheidungen, ROADMAP §1, Rang 5)
Keine KI-Funktionen · nur bestehende, belegte Fakten (kürzen/umstellen erlaubt) · keine Fotos, kein Stock, typografische Ästhetik (am 14.10.2026 bestätigt: „keine“; die Grafiken tragen die Seite) · ~~Gehaltsspannen sichtbar~~ → **Lohn auf Anfrage bei allen Stellen (E-030):** kein Euro-Betrag auf Seiten, im Schema, in Feeds, OG-Bildern und `llms.txt`; daneben die belegten Fakten ohne Zahl (über Tarif, Urlaubs- und Weihnachtsgeld, Prämien, 30 Tage Urlaub); beim Schülerpraktikum kein Wort zu Geld · Google-Karte + Pendelrechner, Bewerbungsmappen-Generator und Bewertungsband bleiben (neu gestaltet) · Ausbildung 2026: „Einstieg noch möglich“ · die vier Teamzitate sind echt und freigegeben · Navy als Schriftfarbe, Rot nur für die eine Primäraktion · **Farben bestätigt (E-016):** Signalrot #D60000 (Hauptaktion, Vorlauf), Marken-Navy #0C1A72–#111D6D (Überschriften, Kennzahlen, Rücklauf), Schrift tiefes Navy, helles Papier (kühl #F3F5F9 oder warm #FBF7F0), Rücklauf-/Fokusblau #1F57C4 erlaubt · Barrierefreiheit WCAG 2.2 AA (44-px-Ziele, Auswahlkarten ≥ 64 px, Hilfe immer an derselben Stelle). · **Richtung (E-019, E-021):** Startseite Variante 1 mit Teilen aus B Runde 1, Stellen Variante 2, Stellenseiten V2 + V1; ~~Wärmepumpen-Stelle Wärmebild (V3, statisch)~~ → ~~Wärmebild abgelöst (E-029)~~ → **Wärmebild kehrt berechnet zurück (E-031):** „die alte Weichheit sowie diese Wärme-Animation mit mehreren Layern“, als Wärmefeld auf der Technischen Zeichnung 2.0 (K-010) · **Büro und Verwaltung (15.10.2026, E-031):** neue Designs und Motion Graphics, der Bereich wird erweitert · **Cursor, Klick und Seitenwechsel (15.10.2026, E-031):** eigener Cursor, Klick-Animation und Seitenwechsel als Wärmeschichten mit physikalischer Verteilung · **Stil und Bewegung (14.10.2026, E-029):** „Technikzeichnung + animierte Produkt-SVGs“, Animation „läuft dauerhaft“ – nur in Produkt- und Prozesszeichnungen, mit Anhalten (K-003.5, K-009); Gerät Bosch Compress 5800i/6800i AW · **Bosch:** „Bosch Premium Partner“ laut Inhaber; Text und Badge erst mit Urkunde (M-020), Markenfassung erst mit schriftlicher Erlaubnis (M-021) · **Ortsseiten (E-029):** massiv ausbauen, kein Herausnehmen („mach, dass sie bestehen“); indexiert wird nur, was das Gate besteht (ROADMAP §10.1), wer durchfällt, bekommt `noindex,follow` · **Stellen (14.10.2026):** zusätzlich Ausbildung 2027 (Start nach Absprache, Vergütung über Tarif plus Prämien), Quereinsteiger/Montagehelfer mit eigener Seite, Schülerpraktikum (Dauer nach Absprache) und Bürofachkraft (Voll- oder Teilzeit) · **kein Werbebudget** (keine Anzeigen-Pixel, keine Klick-Kennungen).

## K-015 Glossar 
- **Altstand:** `main` @ f2e7eae, die Live-Seite vor dem Umbau.
- **Ausgangsstand:** a83269d, die Plattform zu Beginn dieses Laufs.
- **Element / Pass / Leitpass:** ein Teil des Altstands mit eigener Aufgabe; sein Eintrag in `atlas/paesse-*.md`; bei Doppelpässen der eine Pass, der die Arbeit trägt (die übrigen verweisen nur auf ihn).
- **Erzählseite / Arbeitsseite:** siehe K-011.
- **Signaturmoment:** Bewegung, die ein konkretes Merkmal der Marke erlebbar macht und die Austauschprobe besteht (K-009).
- **Register:** die Tabelle aller Bewegungen in K-009; jedes animierte Element trägt seine Kennung als `data-motion`.
- **Formsystem:** Grundgeometrie, Raster, Strich, Ecken und Enden aller SVGs (K-010).
- **Inverse-Band:** Abschnitt mit `data-tone="inverse"` (dunkle Fläche in hellem Thema).
- **Faktenregister:** `lib/content/facts.ts`.
- **Vorlauf / Rücklauf:** in der Heizungstechnik die warme Zuleitung (rot) und die abgekühlte Rückleitung (blau). Die Farben decken sich mit Rot und Navy des Logos.
- **Dauerbewegung:** Schleife in einer Produkt- oder Prozesszeichnung (Auslöser `dauer`), die nur unter der Startbedingung läuft und sich anhalten lässt (K-009).
- **Linienart:** Strichstärke, Enden und Muster einer Linie nach ihrer Aufgabe (K-010).
- **Neutrale Fassung / Markenfassung:** Gerätezeichnung ohne bzw. mit Bosch-Gestaltungsmerkmalen (Logo, Anker, Ring-Diffusor); die Markenfassung braucht die schriftliche Erlaubnis (M-021).
- **Gate (Ortsseiten):** Prüfung I1–I6, ob eine Ortsseite indexiert wird; Ergebnis in einer Lock-Datei (ROADMAP §10.1).
- **Lohn auf Anfrage:** einheitlicher Text statt Euro-Beträgen bei allen Stellen (E-030).
- **Wärmefeld:** die berechneten Isothermen im Rauminneren (`WAERMEFELDER`), Band 0 bis Band 4 von kühl nach heiß (E-031).
- **Grundband:** Band 0, das ganze Rauminnere; es steht immer still.
- **Nachlauf:** die Wärme, die sich im Hero nach dem Vorlauf ausbreitet (Auslöser `nachlauf`, Ende ≤ 1,92 s).
- **Sicht-Auftritt:** ein einmaliger Ablauf beim Sichtbarwerden (Auslöser `sicht`, `SichtStart`, `data-ablauf`).
- **Wärmebereich:** Teil einer Zeichnung mit `data-tone="warm"`, in dem die Linien auf den Wärmebändern stehen.
- **Klick-Wärme:** drei Scheiben, die nach einem Klick nach √t wachsen und verblassen (`klick-waerme`).
- **Wärmefront:** der Seitenwechsel als Überlagerung, die mit Wärmeschichten abdeckt und aufdeckt (`seitenwechsel`).

## Markierte Annahmen
- Bedeutung von `distanceKm` (Straße statt Luftlinie) – Ringe werden als „Luftlinie“ beschriftet.
- Telefon 06441 42956 ist die Nummer für Bewerber (lib/data/company.ts).
- Bricolage Grotesque bleibt, Archivo 68 % ist der vorbereitete Tausch (eine Variable).
