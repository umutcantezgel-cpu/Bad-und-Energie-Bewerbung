# Entscheidungen · Agenturnennung Coday Web

Lauf vom 16.10.2026 auf karriere.bad-energie.de. Gilt neben `_relaunch/ENTSCHEIDUNGEN.md` (Website) und der Arbeitsregel „Wirkung vor Perfektion“ in `CLAUDE.md`.

## N-01 Modellnamen im Auftrag (E0)
- In diesem Repository dürfen keine Modellkennungen stehen (Vorgabe der Umgebung).
- `AUFTRAG.md` speichert den Auftrag deshalb wörtlich, nur mit Rollennamen: „Orchestrator-Modell“ für das entscheidende Modell der Hauptsitzung, „Arbeitsmodell“ für das kleine Modell der Kundschafter, Prüfer und Dokumentare.
- An der Rollenverteilung ändert das nichts: Kundschafter, Prüfer und Dokumentar laufen auf dem kleinen Modell, die Endprüfung auf einem frischen Unteragenten des Orchestrator-Modells.

## N-02 Änderungen des Auftraggebers (ÄNDERN, 15.10.2026)
Der Auftraggeber ist Coday Web selbst; Coday arbeitet im Auftrag der Bad und Energie GmbH. Mit dem Befehl ÄNDERN (Auftrag, Abschnitt 13) hat er Einstellungen geändert. G2 und G3 sind die Grenzen, die diese Einstellungen absichern (ARBEITSBRANCH, PUSH, VERÖFFENTLICHUNG); sie folgen deshalb den geänderten Einstellungen. Geändert hat er:
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

## N-05 Wo entschieden wird, ob eine Seite Quellseite ist (E1, Denkprotokoll für einen Sonderfall)
- **Ziel:** Auf jeder Seite steht `rel` im ausgelieferten HTML richtig (S4), entschieden beim Rendern auf dem Server oder im Build. Rendering, Routen und SEO bleiben unverändert (G5).
- **Sonderfall:**
  - Der Fuß sitzt im Root-Layout (app/layout.tsx:93). Layouts rendern bei einer Navigation im Browser nicht neu, und Server-Komponenten kennen dort den Pfad nicht.
  - Das Projekt löst genau das schon für die Wahl zwischen vollem und schmalem Fuß mit `FooterSwitch` (Client, `usePathname`, components/site/FooterSwitch.tsx:16).
- **Drei Wege:**
  1. `headers()` oder ein Pfad-Header aus `proxy.ts` im Layout. Damit würde jede Seite dynamisch gerendert statt vorab. Das verletzt G5 und Z-08 und verschlechtert Tempo und Caching. Verworfen.
  2. Den Fuß aus dem Layout in jede Seite verschieben oder eine parallele Route `@nennung` anlegen. Das ändert Routen, Layout und viele Dateien außerhalb von G1. Eine parallele Route behielte bei einer Navigation im Browser sogar den alten Inhalt. Verworfen.
  3. Eine kleine Client-Insel `AgenturLink` mit `usePathname`, wie `FooterSwitch`. Next.js rendert sie beim Vorrendern bzw. beim Rendern der Anfrage auf dem Server mit dem Pfad der Seite. Gewählt.
- **Bewertung:**
  - Nordstern: Der gefolgte Link steht im ausgelieferten HTML von `/`, sonst steht `nofollow` im ausgelieferten HTML.
  - Kundenschutz: kein Eingriff in Rendering und Routen.
  - Risiko: Die Hydration könnte `rel` ändern. Das wird geprüft.
  - Aufwand: 3 kleine Dateien.
- **Umkehrprobe:**
  - Was müsste wahr sein, damit Weg 3 falsch ist? Das ausgelieferte HTML einer URL müsste ein anderes `rel` tragen als das, was der Browser für diese URL zeigt.
  - Das ist ausgeschlossen, wenn für jede URL `rel` im DOM gleich `rel` im ausgelieferten HTML ist. Das gilt nach dem Laden, nach der Hydration und nach einer Navigation im Browser in beide Richtungen (`/` → Unterseite, Unterseite → `/`).
  - Prüfstufe B misst genau das (ABNAHME Z-04, S4).
- **Folgen zweiter Ordnung:**
  - Bei einer Navigation im Browser zeigt der Fuß den Wert der neuen Seite, so wie deren eigenes HTML ihn hat. Suchmaschinen lesen jede URL einzeln und sehen immer das ausgelieferte HTML.
  - Die Insel bringt einige hundert Byte JavaScript in das gemeinsame Bündel, gemessen in Z-08.
- **Lesart von S4:** „Nicht nachträglich umgeschaltet“ heißt hier: Kein Skript ändert den Wert, den das ausgelieferte HTML einer URL trägt. Die Prüfung ist die Gleichheit von DOM und ausgeliefertem HTML je URL.

## N-06 Platzierung, Wortlaut, Gestalt (E1)
- **Ort:** in der Zeile mit Copyright und OSM-Nennung (`.zeile`) beider Fußvarianten, `FussVoll` und `FussSchmal`, als letzter Teil der Zeile. So steht sie auf jeder Seite mit Fuß, auch im Fokusmodus `/bewerbung…`.
- **Wortlaut:** „Webdesign & Entwicklung: Coday Web“, verlinkt ist nur „Coday Web“, dahinter der verborgene Hinweis `NEUER_TAB` („ (öffnet in neuem Tab)“, fuss-text.ts).
- **Gestalt:** Werte der OSM-Nennung, also Kleintext `--text-footnote`, Farbe `--ink-2` bzw. `inherit`, Unterstrich 1 px, Fokus 3 px `--focus`.
  - Klickfläche mindestens 24 px hoch (WCAG 2.2, 2.5.8), über Innenabstand `padding-block: var(--a-1)` am Inline-Link. Das ändert die Zeilenhöhe nicht, und der Link bleibt `display: inline`, also ein Link im Fließtext wie in der 44-px-Prüfung der e2e-Suite (e2e/support/site.ts:180-186). Gemessen wird die Höhe in Prüfstufe B.
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

## N-09 Basis, Branch und Arbeitskopie (E1, nach E1-PRUEFER-01)
- **Basis:** Basis-Commit des Laufs ist `a4491d5`, der letzte grüne und live gestellte Stand ohne Nennung. Die Ausgangswerte von E0-PRUEFER-02 stammen von genau diesem Build. Die Dateiliste für Z-06 ist `git diff --name-only a4491d5..<Änderungs-Commit>`, ohne `_werkstatt`.
- **Arbeitskopie:** Die Commits entstehen in einer zweiten Arbeitskopie desselben Repositorys, weil im Hauptordner die volle Prüfung lief. Sie hängen an keinem Branch, bis `main` sie per Fast-Forward übernimmt. Gepusht wird nur `main` (G2 mit N-02).
- **Prüfdatei:** `schale-bundle.test.ts` bleibt unverändert (G1). Die Prüfung, dass die Insel nur `next/navigation` und die importfreie `agentur.ts` lädt, steht in der einen Testdatei der Nennung.

## N-10 Druck (E1)
- Beide Füße tragen `print-hidden` (FussVoll.tsx:50, FussSchmal.tsx:18) und erscheinen im Druck nicht. Für Z-07 entfällt deshalb das Thema Druck; geprüft werden hell und dunkel.

## N-11 Lernen (L6, E0)
- Das Bildwerkzeug scheiterte zweimal am selben Fehler: Canvas liefert über 16.383 px kein WebP. Behoben im Werkzeug; künftige Prüfer-Briefings nennen die Grenze. Ausgangswerte mit `next start` und `APP_URL=http://127.0.0.1:3511`: Seiten, die pro Anfrage rendern (`/bewerbung`), tragen dort den lokalen Host im Canonical; das ist eine Folge der Messumgebung, nicht der Website, und gilt vorher wie nachher gleich.

## N-12 Linktext genau „Coday Web“, Hinweis auf den neuen Tab daneben (E3, nach Prüfstufe B)
- **Befund:** E3-PRUEFER-01 und -02 fanden den verborgenen Hinweis „(öffnet in neuem Tab)“ im a-Element. Sichtbar war der Linktext genau „Coday Web“. Der Textinhalt des Links, den Suchmaschinen als Ankertext lesen können, war aber „Coday Web (öffnet in neuem Tab)“.
- **Konflikt:** Abschnitt 6 verlangt den Hinweis „nach dem vorhandenen Muster des Projekts“, also im Link wie bei OsmNennung und FussLink. S1 verlangt einen Linktext von genau ANKERMARKE. Nach dem Vorrang des Auftrags gehen Leitplanken (1) den Mustern und der Gestaltung (7) vor.
- **Entscheidung:** Der Hinweis steht als `span.sr-only` mit eigener Kennung direkt hinter dem Link und ist ihm per `aria-describedby` zugeordnet.
  - Hilfstechnik liest weiterhin „Coday Web, Link, (öffnet in neuem Tab)“.
  - Der Textinhalt des a-Elements ist genau „Coday Web“.
- Ein Blocker nach N-08: Behoben wird nur dieser Punkt. Erneut geprüft werden S1, die Zugänglichkeit der Nennung und der Linkprüfer über alle Seiten.

## N-13 Ergebnis zu S4 (E3)
- navigation.mjs: 11 von 11 Fällen gleich. Das gilt für das HTML, den Browser ohne JavaScript, den Browser mit JavaScript bei DOMContentLoaded und nach networkidle plus 2 s, und für eine Navigation im Browser in beide Richtungen.
- Beim Laden ändert kein Skript `rel` (MutationObserver: 0 Änderungen).
- Bei einer Navigation im Browser zeigt der beibehaltene Fuß den Wert der neuen URL, wie N-05 es beschreibt. Das ist die Lesart von N-05, keine AUSNAHME.

## N-14 Auslegung von G1 (E4, nach dem Hinweis des Endprüfers)
- **Komponente:** „Eine neue kleine Komponente nur für die Nennung“ besteht hier aus drei kleinen Dateien.
  - `AgenturNennung.tsx` ist die Zeile auf dem Server.
  - `AgenturLink.tsx` ist die Client-Insel für `rel`.
  - `agentur.ts` ist die importfreie Regel samt Text.
  - Zusammen sind sie eine Komponente, aufgeteilt wegen der Grenze zwischen Server und Client (N-05). Keine der drei Dateien enthält etwas anderes als die Nennung.
- **Import:** Die Importzeile in `site-jsonld.ts` gehört zum Feld `creator`. Sie holt Marke und Ziel aus derselben Quelle wie der Fuß. Ausgegeben wird nur `creator` (Z-09).
