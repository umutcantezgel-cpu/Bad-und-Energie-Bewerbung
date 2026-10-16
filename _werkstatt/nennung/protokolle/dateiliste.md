# Dateiliste der Änderungen · Prüfung E3-PRUEFER-01 (Z-06, Z-10)

Stand: 2026-10-16 · Basis a4491d5 (ohne Nennung) · Änderungs-Commit b0ae185 · Stand jetzt HEAD aa4931b · Prüfung nur per git, kein Build.

## 1. Dateien seit der Basis (ohne `_werkstatt`)

`git diff --stat a4491d5 HEAD -- ':(exclude)_werkstatt'`: 10 Dateien, 224 Zeilen eingefügt, 4 gelöscht.

Alle 10 Dateien gegen G1 (erlaubt sind Footer-Dateien, neue kleine Komponente der Nennung, Testdatei für die rel-Regel, WebSite-Knoten nur mit creator, Ausschlusskonfiguration der Auslieferung, `_werkstatt/nennung`, eigener Block in CLAUDE.md):

| Datei | Änderung | Commit | G1 |
| --- | --- | --- | --- |
| `.vercelignore` | +2: `_werkstatt` von der Auslieferung ausgenommen | b0ae185 | erlaubt (Ausschlusskonfiguration) |
| `CLAUDE.md` | +6: Block zwischen `NENNUNG-ANFANG` und `NENNUNG-ENDE` (nur Orchestrator) | 19e4478 (E0) | erlaubt (eigener Block) |
| `components/site/__tests__/agentur-nennung.test.ts` | +136 neue Testdatei (rel, Wortlaut, Ziel, Strukturdaten) | b0ae185 | erlaubt (Testdatei für rel-Regel) |
| `components/site/fuss/AgenturLink.tsx` | +18 neue Client-Insel, nur für die Nennung | b0ae185 | erlaubt (neue kleine Komponente) |
| `components/site/fuss/AgenturNennung.tsx` | +20 neue Komponente, nur für die Nennung | b0ae185 | erlaubt (neue kleine Komponente) |
| `components/site/fuss/agentur.ts` | +22 neue Datei: Marke, Ziel, rel-Funktion der Nennung | b0ae185 | erlaubt (Teil der Nennung, im Fuß-Ordner) |
| `components/site/fuss/FussSchmal.tsx` | +2: Import und Aufruf `<AgenturNennung />` | b0ae185 | erlaubt (Footer-Datei) |
| `components/site/fuss/FussVoll.tsx` | +2: Import und Aufruf `<AgenturNennung />` | b0ae185 | erlaubt (Footer-Datei) |
| `components/site/fuss/fuss.module.css` | +13 / −4: bestehende OSM-Regeln `.osm`, `.osmLink`, `.osmLink:focus-visible` bekommen je einen zusätzlichen Selektor für die Nennung; neue Regel `.nennungLink` mit `padding-block` (Trefferfläche) | b0ae185 | erlaubt (Footer-Datei). Keine Werte der OSM-Regeln geändert. |
| `components/site/site-jsonld.ts` | +3: Importzeile `AGENTUR`, Kommentar, Feld `creator` im WebSite-Knoten | b0ae185 | erlaubt, siehe Befund 1 |

## 2. Prüfung G5, G6, G7 (git diff a4491d5 b0ae185, Ausgabe in Zeilen)

| Prüfung | Befehl | Zeilen | Ergebnis |
| --- | --- | --- | --- |
| G5 | `git diff a4491d5 b0ae185 -- app lib/seo app/robots.ts` | 0 | grün |
| G6 | `git diff a4491d5 b0ae185 -- components/site/fuss/OsmNennung.tsx lib/places/osm.ts` | 0 | grün |
| G7 | `git diff a4491d5 b0ae185 -- app/impressum app/datenschutz components/legal` | 0 | grün |
| Zusätzlich | `git diff --name-only b0ae185 HEAD` | nur `_werkstatt/nennung/…` (STATUS.md, bilder/auswahl, protokolle/stufe-a.md) | grün: nach b0ae185 keine Code-Datei geändert |

## 3. Z-10: Commit b0ae185 ohne _werkstatt

`git show --stat b0ae185`: 9 Dateien, 218 Einfügungen, 4 Löschungen. Keine Zeile mit `_werkstatt` im Stat. Grün.

Vollständige Liste der 9 Dateien des Commits: `.vercelignore`, `components/site/__tests__/agentur-nennung.test.ts`, `components/site/fuss/AgenturLink.tsx`, `components/site/fuss/AgenturNennung.tsx`, `components/site/fuss/FussSchmal.tsx`, `components/site/fuss/FussVoll.tsx`, `components/site/fuss/agentur.ts`, `components/site/fuss/fuss.module.css`, `components/site/site-jsonld.ts`.

Hinweis zur Dateizahl: Die Zahl 10 (aus stufe-a.md, offene Frage 1) ergibt sich aus den 9 Dateien von b0ae185 plus `CLAUDE.md` aus 19e4478 (E0). Der Commit b0ae185 selbst ändert `CLAUDE.md` nicht.

Zusatz, Auslieferung: `curl -s -o /dev/null -w '%{http_code}'` auf `/_werkstatt/nennung/AUFTRAG.md` und `/_werkstatt/nennung/STATUS.md` am Produktions-Server (127.0.0.1:3511): je 404. Kein Arbeitsordner ist über den Server erreichbar.

## 4. Befunde

1. **site-jsonld.ts: eine Zeile mehr als erwartet.** Erwartet: eine Zeile `creator` und ein Kommentar. Gefunden: zusätzlich die Importzeile `import { AGENTUR } from '@/components/site/fuss/agentur';`. Der Kommentar und das Feld `creator` sind wie erwartet (Feld: `{ '@type': 'Organization', name: AGENTUR.marke, url: AGENTUR.url }`). Der Import liefert die Werte. Nach meiner Lesart kein Verstoß gegen G1, weil die Datei nur das Feld `creator` im WebSite-Knoten ändert. Die Prüfung im Wortlaut ist aber nicht erfüllt. OFFENE FRAGE: Soll der Import so bleiben, oder soll der Wert inline stehen?
2. CLAUDE.md-Block: Der Block enthält Arbeitsanweisungen für den Orchestrator (Push nur auf ARBEITSBRANCH main; main geht über Vercel live). G1 erlaubt den eigenen Block. Der Text wird als sichtbarer Befund nicht bewertet. Er ist mit `NENNUNG-ENDE` markiert und soll laut Kommentar beim Abschluss entfernt werden. Das ist die Vorgabe des Auftrags, kein Befund.

## 5. Ergebnis

- Alle Pflichtprüfungen grün: G5, G6, G7, Z-10, und alle 10 Dateien unter G1 erlaubt.
- Eine offene Frage (Befund 1).

## Belege

- `/home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/protokolle/dateiliste.md` (diese Datei)
- git-Befehle wie oben, aus `/home/user/Bad-und-Energie-Bewerbung`
- Diff site-jsonld.ts: `git diff a4491d5 b0ae185 -- components/site/site-jsonld.ts`
