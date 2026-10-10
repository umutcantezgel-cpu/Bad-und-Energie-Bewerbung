# Fertigstellung · alle Seiten im Design der Startseite (Rolle Baumeister, Opus) · E-023

## Auftrag des Auftraggebers (10.10.2026, wörtlich)
„Bitte die Webseite endlich fertig machen. Ich, ich scheiß auf Test, scheiß auf alles. Mach bitte alles in diesem Design weiter. Äh, nutze das bitte als äh, Design. Dieses Design, was du erstellt hattest. Und bitte, wenn du das überall auf der Seite an. So dass wir auch endlich fertig werden mit der, äh, mit der Webseite.“

Mitgeschickt hat er zwei Bilder: den fertigen Einstieg der Startseite am Desktop und am Handy.

## Die Designvorgabe: der Einstieg der Startseite
- **Im Code:** `components/home/einstieg/*` (`Einstieg.tsx`, `Szene.tsx`, `einstieg.module.css`, `Vertrauenszeile.tsx`).
- **Als Bild:** `_relaunch/belege/r3-home-01/start__d1440-light__01.webp` und `start__m390-light__01.webp`. Live auf http://localhost:3450/.

Diese Merkmale trägt **jede Seite**:
1. **Warmes Papier** (`bg-surface`) als Grund. Dazu eine **Navy-Fläche** (Inverse-Band) mit Strichzeichnung in 3 px (`--m-strich`), weiß und hell auf Navy. Akzente: Vorlauf rot, Rücklauf blau, Wärme als weiche Fläche.
   - Desktop: Papier links, Navy-Fläche rechts.
   - Handy: Navy-Block oben mit weißer h1, darunter die Hauptaktion auf Papier.
2. **h1 in Bricolage 800**, sehr groß, Navy (`font-display text-brand`, auf Navy weiß). Darüber ein Etikett in Versalien, z. B. „SEIT 1926 · WETZLAR“ (`text-etikett`). Darunter die Unterzeile mit der roten/blauen Rohrklammer (`components/zeichnung/Rohrklammer`).
3. **Hauptaktion:** roter Knopf „Jetzt bewerben“. Eine rote Vorlauf-Linie läuft aus der Zeichnung in den Knopf. Darunter ein Mikrotext und ein Zweitweg als unterstrichener Textlink mit Pfeil.
4. **Maße in Martian Mono** (`font-mass`) mit Maßlinie darunter: 13:30 · 30 Tage · 35 km · 1926, Gehälter.
5. **Etiketten-Kästchen** an der Zeichnung (wie „WÄRMEPUMPEN“, „HEIZUNGEN“, „BÄDER“) mit Familien-Icons (`components/icons`).
6. **Abschnitte** wechseln Papier und Wand (`bg-surface-2`). Zwischen Abschnitten steht der Leitungstrenner (`components/zeichnung/Leitungstrenner`). Überschriften mit `SectionHeader`-Muster (Etikett, h2 Bricolage Navy, Einleitung).

## Arbeitsweise (schnell, E-023)
- **Keine Prüferrunde, keine Jury.** Du baust fertig, kontrollierst dich an Bildern und lieferst ab.
- **Selbstkontrolle:** `node _relaunch/werkzeuge/screens.mjs --base http://localhost:3450 --label fertig-<kennung> --only <slug> --vps m390,d1440 --schemes light --belege haupt`. Sieh dir die Bilder an und verbessere, bis es aussieht wie aus einem Guss mit dem Einstieg. Am Ende eine dunkle Aufnahme zur Kontrolle (`--schemes dark --vps m390`).
- **Tests:**
  - Bestehende Tests deiner Dateien bleiben grün oder werden gleichwertig angepasst. Nie abschwächen, nie überspringen (G7).
  - Neue Logik bekommt einen kleinen Test.
  - Während der Arbeit nur gezielt `bunx vitest run <deine pfade>` und `bunx eslint <deine dateien>`.
  - **Einmal am Ende:** `bun run type-check`, `bun run check:design`, `bun run check:contrast`, `bun run check:client-imports`. Kein Build, kein Lighthouse, kein eigener Server (der gemeinsame Server auf :3450 hat Hot Reload).
- **Speicher schonen:** Sechs Agenten arbeiten gleichzeitig. Keine Dauerschleifen mit Browsern; je Durchlauf höchstens 2 Ansichten.
- **Fortschritt:** Schreibe nach jedem größeren Schritt eine Zeile nach `_relaunch/pakete/fortschritt/<Kennung>.log`.
- **Regeln aus `_welle-r45.md` gelten weiter:**
  - nur Tokens bzw. semantische Utilities;
  - Rot nur Hauptaktion und Vorlauf, Blau nur Rücklauf;
  - eine h1 je Seite;
  - Bewegung nur über Register-Kennungen (`lib/motion/register.ts`) mit Endzustand bei reduzierter Bewegung;
  - Server-Komponenten als Standard;
  - nur belegte Fakten (`lib/content/facts.ts`, Stellendaten, `COMPANY`, `REGION`);
  - Rechts- und Fließtexte unverändert, die Geschäftslogik unverändert;
  - Touch-Ziele ≥ 44 px, Fokus sichtbar, AA-Kontrast, kein Überlauf bei 320 px;
  - lucide-Importe in deinen Dateien durch `components/icons` ersetzen.
- **Grenzen:**
  - Nie `.env*` lesen.
  - Nie schreiben: `supabase/**`, `lib/supabase/**`, `lib/uploads/**`, `app/admin/**`, `app/api/**`.
  - Logo bytegleich.
  - Kein Git außer lesend.
  - Nur Dateien deiner Schreibrechte; fremde Fehler nur melden.
- **Ausgabe:** GEÄNDERTE DATEIEN · WAS (mit E-IDs) · TESTS · BILDER · OFFENE PUNKTE. Letzte Zeile `=== ENDE <Kennung> · BEREIT ZUR RÜCKGABE ===`.

## Faktenverteilung der Startseite (E-023, verbindlich für R3-FIX-A/B)
- **Zählregel:** Ein Fakt zählt je Abschnitt einmal; Überschrift, Grafik und Text desselben Abschnitts sind eine Nennung. Wörtliche Wiederholung im selben Abschnitt vermeiden. Höchstens zwei Abschnitte je Seite.
- **Bestandstexte** bleiben und zählen mit; neue Bausteine weichen ihnen aus. Bestandstexte sind die FAQ (`lib/content/faq.ts`), `HERO.lead` und `REGION.headline`.

| Fakt | Abschnitt 1 | Abschnitt 2 | Nicht mehr |
|---|---|---|---|
| 13:30 / Freitag | Einstieg (Maß) | Woche | Vorteile, Konfigurator-Zeilen, Woche-Einleitung als Doppel |
| 30 Tage Urlaub | Einstieg (Maß) | Vorteile | – |
| 35 km | Einstieg (Maß) | Einsatzgebiet (einmal sichtbar plus Ringbeschriftung der Grafik) | Bildunterschrift, SVG-Titel und -Beschreibung ohne Wiederholung der Zahl |
| Keine Fernmontage | Einsatzgebiet (`REGION.headline`) | FAQ (Bestand) | Vertrauenszeile |
| Diskretion | Vertrauenszeile (E-START-010) | Ablauf | – (FAQ ist Bestand) |
| 100 Jahre (1926–2026) | Einstieg (Ortsmarke) | Kopf-Marke (R4-SHELL-01, E-SHELL-001) | Jahres-Maßkette nur „1926 … 2026“ ohne den Satz |
| Hilti / Fahrzeug | `HERO.lead` (Bestand) | genau ein Ort in #vorteile | Konfigurator und „Werkzeug & Fuhrpark“ entdoppeln |

**Tonfolge:** Einstieg Papier/Navy · Woche Wand · Stellen Papier · Vorteile Wand · Einsatzgebiet Papier · Ablauf Wand · Betrieb/Stimmen Papier · FAQ Wand · Schlussband Navy.

---

## SEITENKOPF-01 · gemeinsamer Seitenkopf und Zeichnungen (zuerst, alle Seiten bauen darauf)
- **Schreibrechte:** neu `components/seitenkopf/**` und `components/zeichnung/**` (vorhandene `Leitungstrenner`/`Rohrklammer` bleiben in ihrer API), Tests in `components/seitenkopf/__tests__/` und `components/zeichnung/__tests__/`.
- **`Seitenkopf`** (Server-Komponente), aus dem Einstieg abgeleitet, nicht kopiert, aber sichtbar gleich. Der Startseiten-Einstieg selbst bleibt unverändert.
  - Props: `etikett`, `titel` (h1, 1–2 Zeilen), `unterzeile?` (mit Rohrklammer), `einleitung?`, `aktion?` ({href, label}, rot, mit Vorlauf-Linie aus dem Panel), `mikrotext?`, `zweitweg?` ({href, label}), `masse?` ([{wert, name}]), `panel` (ReactNode: die Zeichnung der Seite), `variante: 'erzaehl' | 'arbeit' | 'ruhig'`.
  - **erzaehl:** wie der Einstieg, Navy-Panel groß.
  - **arbeit:** schmaleres Navy-Panel bzw. Navy-Band, h1 kleiner, für Bewerbung, Danke und Mappe.
  - **ruhig:** nur Papier mit Etikett, h1 und Rohrklammer, für Recht.
  - Mobil: Navy-Block oben (Etikett, h1 weiß, Zeichnung), Hauptaktion darunter auf Papier mit Vorlauf-Linie, genau wie das Handy-Bild des Einstiegs.
- **Zeichnungen** in `components/zeichnung/` (Inline-SVG, 3 px, `currentColor`/Rollen, `role="img"` + `<title>` bzw. `aria-hidden`):
  - `Heizkreis`: Kreis aus Vorlauf (rot, oben) und Rücklauf (blau, unten) um eine große Zahl in `font-mass`, z. B. „13:30“ oder eine Gehaltsspanne. Vorbild: Variante 2 (`_relaunch/ausbau/richtungen/2/`).
  - `Masskette`: horizontale Maßlinie mit Endstrichen und Wert.
  - `Waermebild`: statische Fassung des Wärmebilds aus Variante 3 (`_relaunch/ausbau/richtungen/3/`), ohne WebGL.
  - `Leitungspaar`: Fortschrittsstrang mit n Schritten, aktueller Schritt, Kennung `fortschritt`.
  - `KreisGeschlossen`: Vorlauf und Rücklauf schließen sich zum Kreis, Kennung `kreis-schliessen`.
  - `OffeneLeitung` mit `Wegweiser` ins Leere, für 404.
  - `HausKlein`: vereinfachtes Haus aus der Szene für kleine Köpfe.
- **Fertig ist es, wenn** eine Probeseite unter `components/seitenkopf/__tests__/` jede Variante rendert (Vitest). Zur Sichtprüfung steht der Kopf in keinem fremden Route-File; prüfe an Storybook-freien Mitteln, z. B. mit einem Vitest-Render-Snapshot plus Bildern der Startseite zum Vergleich. Die Seitenpakete bauen ihn danach ein.

## R3-FIX-A · Startseite oben fertig
- **Schreibrechte:**
  - `components/home/{Hero.tsx,WeekSection.tsx,ProcessTimeline.tsx,FaqSection.tsx,SectionHeader.tsx,JobList.tsx,BenefitGrid.tsx}`.
  - `components/home/{einstieg,woche,vorteile}/**`, `components/jobs/JobCard.tsx`.
  - Tests unter `components/home/__tests__/{einstieg*,woche*,vorteile*}` und `components/jobs/__tests__/`.
- **Befunde:** `_relaunch/pakete/befunde/R3-HOME-01.json`, `R3-HOME-02.json`, `R3-HOME-05.json`.
  - Pflicht: alle harten Befunde.
  - Danach die weichen, soweit sie das Ergebnis verbessern.
  - Die Faktenverteilung und die Tonfolge oben (E-023).
- **Einzelpunkte:**
  - Einstieg:
    - Vertrauenszeile ohne „Keine Fernmontage“;
    - 320 px bei Höhen 568–807 sauber komponiert (Zweitweg nicht abgeschnitten);
    - Jahres-Maßkette ohne Doppel;
    - ohne JS keine leere Knopffläche;
    - Wert und Name der Maße mit trennendem Leerzeichen im DOM.
  - Woche:
    - `woche.module.css` nutzt `text-etikett`/`font-mass` statt Nachbau;
    - 28 px auf die Skala;
    - Einleitung ohne 13:30-Doppel;
    - kein doppelter Screenreader-Text;
    - Ton Wand.
  - Vorteile:
    - Unterblock „Werkzeug & Fuhrpark“ trägt `id="ausstattung"` (der Orchestrator entfernt den alten Alias);
    - Hilti/Fahrzeug entdoppeln;
    - ohne JS kein widersprüchlicher Zustand (Ergebnis mit `has-checked`/CSS oder Standardrolle sichtbar und andere Rollen erst mit JS wählbar);
    - „Das gilt für alle Fachkräfte“ nur, wenn für alle belegt, sonst streichen;
    - Tests mit festem Datum;
    - Fokus-Offset an den Stellenzeilen.
- Ein Vorgänger wurde durch einen Container-Neustart unterbrochen. Prüfe den Stand auf der Platte, bevor du änderst.

## R3-FIX-B · Startseite unten fertig
- **Schreibrechte:**
  - `components/home/{RegionSection.tsx,AboutSection.tsx,CtaBand.tsx}`, `components/home/{gebiet,betrieb}/**`.
  - `components/maps/**`, `components/reviews/**`, `components/site/FooterPlaces.tsx`.
  - Tests dazu.
- **Befunde:** `_relaunch/pakete/befunde/R3-HOME-03.json`, alle harten, dazu die wichtigen weichen:
  - Fokusring des Radius-Umschalters nicht abschneiden;
  - Test der Google-Kreise 15/25/35 mit gestubbtem `window.google`;
  - ohne JS kein Widerspruch;
  - Telefon-Ziel ≥ 44 px;
  - 35-km-Wiederholungen nach E-023;
  - Hermannstein/Haus-Überlappung;
  - Plangröße bei 768 begrenzen;
  - `REGION.headline` als zwei Spans;
  - keine Trennpunkte am Zeilenende.
- **R3-HOME-04 (Betrieb, Stimmen, Kontakt, Schlussband)** ist ungeprüft. Prüfe es selbst gegen die Pässe E-START-043/046/031/048/051 (`_relaunch/atlas/paesse-start.md`, Abnahme-Zeilen) und bessere nach. Das Schlussband ist Navy mit rotem Vorlauf in „Jetzt bewerben“.
- Tonfolge E-023 für deine Abschnitte.

## Wellen R4/R5 (zusammengelegt, nach Seitenkopf)
Die Pakete stehen mit Schreibrechten und E-IDs in `_relaunch/pakete/R4.md` und `_relaunch/pakete/R5.md`. Abweichungen:

| Kennung | Umfang |
|---|---|
| R4-UI-01, R4-UI-02, R4-SHELL-01, R4-SHELL-02 | wie R4.md. SHELL-02 übernimmt `components/site/ContactOptions.tsx`. |
| R5-KLEIN | R5-SEO-01 + R5-MAIL-01 + der Teilen-Bild-Teil von R5-ICON-01 (`lib/seo/og-render.tsx`, `lib/seo/og-image.ts`, `app/opengraph-image.tsx`, `app/jobs/[slug]/opengraph-image.tsx`). Das Teilen-Bild zeigt den Einstieg: Papier links mit h1, Navy rechts mit Haus. |
| R5-JOBS-01, R5-JOBS-02, R5-APPLY-01, R5-THANKS-01, R5-MAPPE-01 | wie R5.md, Kopf über `components/seitenkopf`. Stellenliste und Stellenseiten in der Variante `erzaehl`, Bewerbung, Danke und Mappe in `arbeit`. |
| R5-BEW-01 | R5-BEW-01 + R5-UPLOAD-01: `app/bewerbung/page.tsx`, `app/bewerbung/layout.tsx`, `lib/apply/params.ts`, `components/apply/seite/**`, `components/apply/unterlagen/**`. |
| R5-RUHE | R4-404 + R5-RECHT-01: `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx`, `components/site/fehler/**`, `app/datenschutz/**`, `app/impressum/page.tsx`, `components/recht/**`, `docs/operations/datenschutz-aenderungen.md`. 404 in `erzaehl` mit `OffeneLeitung`; Recht in `ruhig`. |

Den lucide-Rest danach und `package.json` erledigt der Orchestrator.
