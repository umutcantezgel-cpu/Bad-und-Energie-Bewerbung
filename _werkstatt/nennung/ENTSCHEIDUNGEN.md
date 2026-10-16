# Entscheidungen · Agenturnennung Coday Web

Lauf vom 16.10.2026 auf karriere.bad-energie.de. Gilt neben `_relaunch/ENTSCHEIDUNGEN.md` (Website) und der Arbeitsregel „Wirkung vor Perfektion“ in `CLAUDE.md`.

## N-01 Modellnamen im Auftrag (E0)
- In diesem Repository dürfen keine Modellkennungen stehen (Vorgabe der Umgebung).
- `AUFTRAG.md` speichert den Auftrag deshalb wörtlich, nur mit Rollennamen: „Orchestrator-Modell“ für das entscheidende Modell der Hauptsitzung, „Arbeitsmodell“ für das kleine Modell der Kundschafter, Prüfer und Dokumentare.
- An der Rollenverteilung ändert das nichts: Kundschafter, Prüfer und Dokumentar laufen auf dem kleinen Modell, die Endprüfung auf einem frischen Unteragenten des Orchestrator-Modells.

## N-02 Änderungen des Auftraggebers (ÄNDERN, 15.10.2026)
Der Auftraggeber ist Coday Web selbst; Coday arbeitet im Auftrag der Bad und Energie GmbH. Er hat geändert:
- **ARBEITSBRANCH:** `main` („ich erlaube ausschließlich auf main zu arbeiten“). G2 („kein Push auf den Hauptbranch“) tritt dahinter zurück.
- **VERÖFFENTLICHUNG:** ja, am Ende live („push am Ende alles live auf main“). G3 tritt dahinter zurück: `main` geht bei jedem Push über Vercel in Produktion.
- **KUNDENZUSTIMMUNG:** liegt vor („ich bin die Agentur und arbeite für Bad und Energie GmbH“). Den Textvorschlag für die schriftliche Bestätigung des Kunden enthält trotzdem `MENSCHEN.md`.
- **Folge für L4 (ZWISCHENSTAND):** Weil jeder Push auf `main` live geht, werden Zwischenstände nur lokal committet. Gepusht werden nur grüne Stände: Build, Typprüfung, Linter und Tests mindestens wie in E0.
- **Folge für L2:** Phasenenden mit reinen `_werkstatt`-Commits werden gesammelt gepusht, wenn der Stand grün ist. `_werkstatt` liegt nicht in der Auslieferung (N-07).

## N-03 Quellseite (E1)
- Quellseite ist die Startseite `/` der einzigen Sprachfassung (Deutsch). Sie ist indexierbar, Belege in `LAGE.md` und `ABNAHME.md` Z-05.
- Weil die Quellseite die Startseite ist, ist kein Denkprotokoll nötig.

## N-04 rel je Seitentyp (E1)
- LINKMODELL Startseite, GEGENLEISTUNG nein:
  - auf `/` gefolgt mit `rel="noopener"`;
  - auf jeder anderen Seite `rel="nofollow noopener"`.
- Immer `target="_blank"` und nie `noreferrer` (S5). Damit weicht der Link bewusst vom Muster der übrigen externen Links im Repo ab (`noopener noreferrer`, z. B. OsmNennung.tsx); der Auftrag geht hier vor (Vorrang 1).

## N-05 Wo entschieden wird, ob eine Seite Quellseite ist (E1)
- Der Fuß sitzt im Root-Layout (app/layout.tsx:93). Server-Komponenten dort kennen den Pfad nicht. `headers()` würde jede Seite dynamisch machen (G5: Rendering und Routen bleiben).
- Der Weg ist derselbe wie bei `FooterSwitch` (components/site/FooterSwitch.tsx:16): eine kleine Client-Komponente `CodayNennung`, die `usePathname()` liest.
  - Next.js rendert sie beim Vorrendern bzw. beim Rendern der Anfrage auf dem Server mit dem Pfad der Seite. Darum steht `rel` im ausgelieferten HTML jeder Seite schon richtig (S4), bei `/` gefolgt, sonst `nofollow`.
  - Die Hydration ändert daran nichts. Nur bei einer Navigation im Browser zeigt der Fuß den Wert der neuen Seite, so wie deren eigenes HTML ihn hat. Das ist kein nachträgliches Umschalten eines falschen Werts.
- Geprüft wird am ausgelieferten HTML jeder Seite (Linkprüfer, Googlebot-Vergleich) und mit einem Komponententest der rel-Regel.

## N-06 Platzierung, Wortlaut, Gestalt (E1)
- **Ort:** in der Zeile mit Copyright und OSM-Nennung (`.zeile`) beider Fußvarianten, `FussVoll` und `FussSchmal`, als letzter Teil der Zeile. So steht sie auf jeder Seite mit Fuß, auch im Fokusmodus `/bewerbung…`.
- **Wortlaut:** „Webdesign & Entwicklung: Coday Web“, verlinkt ist nur „Coday Web“, dahinter der verborgene Hinweis `NEUER_TAB` („ (öffnet in neuem Tab)“, fuss-text.ts).
- **Gestalt:** Werte der OSM-Nennung, also Kleintext `--text-footnote`, Farbe `--ink-2` bzw. `inherit`, Unterstrich 1 px, Fokus 3 px `--focus`.
  - Klickfläche mindestens 24 px hoch (WCAG 2.2, 2.5.8), über `min-height` am Link, ohne die Zeilenhöhe der Pflichtzeile zu ändern.
  - Sie ist nicht auffälliger als die Rechtslinks.
- **Kein Bild, kein Skript vom Agenturserver, keine Schrift (S6).** Der Client-Anteil ist nur `usePathname` und der Text; er liegt im Bundle der Seite, nicht beim Agenturserver.

## N-07 Strukturdaten und Auslieferung (E1)
- Im WebSite-Knoten (components/site/site-jsonld.ts:97-111) kommt nur `creator` dazu: `{ "@type": "Organization", "name": "Coday Web", "url": "https://www.codayweb.de/de" }`. Alle anderen Felder und Knoten bleiben (Z-09).
- `_werkstatt` kommt in die vorhandene `.vercelignore` (G1: „bevorzugt eine vorhandene“).
  - tsconfig, ESLint und Vitest bleiben unverändert, denn G1 erlaubt dort keine Änderung.
  - Stattdessen sind die Werkzeuge in `_werkstatt/nennung/werkzeuge` reine `.mjs`-Dateien, lint-sauber und ohne `*.test.*`. tsc erfasst nur `*.ts`/`*.tsx`, Vitest nur `*.test.ts`.

## N-08 Prüfrunden und die Arbeitsregel „Wirkung vor Perfektion“
- Der Auftrag sieht Prüfstufe A, Prüfstufe B und eine Endprüfung vor, jede höchstens zweimal. Die Arbeitsregel des Inhabers erlaubt höchstens eine Prüfrunde je Schritt; nur echte Blocker halten den Livegang auf.
- Beide gelten zusammen: Jede Stufe läuft einmal. Ein Blocker wird behoben und nur dieser Punkt erneut geprüft. Alles andere kommt in `MENSCHEN.md` unter „Liste für den nächsten Schritt“.
