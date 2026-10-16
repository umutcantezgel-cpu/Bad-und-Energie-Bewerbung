# E0-PRUEFER-02 · Ausgangswerte vor der Nennung

Stand 2026-10-16, Produktions-Server http://127.0.0.1:3511 (`next start`), Build Commit a4491d5. Median aus drei Läufen, wo verlangt.

## BEFUNDE mit Fundstellen

1. Keine Agenturnennung: 0 von 84 Seiten mit Link auf codayweb.de, 0 Nennungen im Footer (B1, B3).
2. /bewerbung zeigt Canonical und WebSite-Knoten auf 127.0.0.1 (`http://127.0.0.1:3511/bewerbung`). Auf /, /jobs und /arbeiten-bei-uns/waermepumpen steht karriere.bad-energie.de. Auch mit Host-Header karriere.bad-energie.de gleich (B1, B4, B5).
3. Zwei Adressen liefern 308 und stehen nicht in der Sitemap: /einsatzgebiet/hochtaunuskreis und /einsatzgebiet/landkreis-marburg-biedenkopf (B6).
4. Lighthouse-Warnung auf /: Performance 0,93 gegen Mindestwert 0,95, in allen drei Läufen. CI-Endzeile trotzdem ALLES GRUEN (B13).

## PRÜFUNG UND ERGEBNIS

| Ausgangswert | Zahl | Messart | Beleg |
|---|---|---|---|
| Build | erfolgreich, 183 statische Seiten | CI-Protokoll | B13 |
| Typprüfung | keine Fehlerausgabe | CI-Protokoll | B13 |
| Linter | keine Ausgabe | CI-Protokoll, Befehl fehlt (Frage 2) | B13 |
| Tests | 189 Dateien, 3873 Tests, alle grün | CI-Protokoll | B13 |
| e2e | 1096: 590 grün, 506 übersprungen, 0 rot | CI-Protokoll | B13 |
| Lighthouse | 6 URLs, 18 Läufe, 1 Warnung | CI-Protokoll | B13 |
| Linkliste | 84 Seiten: 81× 200, 2× 308, 1× 404 (erwartet) | links.mjs, Standard- und Googlebot | B1 |
| Footer-Bilder | 1 von 24 | bilder.mjs, zweimal abgebrochen (Frage 1) | B11 |
| Netzwerk Startseite 1440 × 900 | 38 Anfragen, 541,1 KB komprimiert | netz.mjs, Median aus 3 Läufen | B7 |
| Layoutverschiebung Startseite | 0,0000 in 3 Läufen | netz.mjs | B7 |
| Zugang Footer | axe 0 Befunde (12 Kombinationen), 0 Nennungen, kein Überlauf | zugang.mjs | B3 |
| Konsolenfehler | 0 Konsolen-, 0 Seitenfehler in 8 Läufen | konsole.mjs (neu) | B8 |
| Linkziel codayweb.de | 200, keine Weiterleitung, Canonical auf sich selbst | curl | unten |
| Startseite indexierbar | 200, kein X-Robots-Tag, robots `index, follow`, Canonical karriere.bad-energie.de, in kern.xml | curl, robots.txt | B9 |
| JSON-LD | 4 Seiten, 0 Syntaxfehler | jsonld.mjs | B4 |

Linkziel wörtlich: `200` mit leerer Weiterleitungs-URL. Canonical: `<link rel="canonical" href="https://www.codayweb.de/de"/>`.

Werkzeuge: alle fünf mit `--hilfe` geprüft. links.mjs und jsonld.mjs mit `--projekt`, weil der Standard auf das Worktree zeigt (ohne .next).

## BELEGPFADE

- B1 /tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/wt-s2/_werkstatt/nennung/protokolle/roh/e0/links.tsv (dazu links-zusammenfassung.md, B2)
- B3 /tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/wt-s2/_werkstatt/nennung/protokolle/roh/e0/zugang.md
- B4 /tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/wt-s2/_werkstatt/nennung/protokolle/roh/e0/jsonld.json
- B5 /tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/wt-s2/_werkstatt/nennung/protokolle/roh/e0/canonical-host-test.txt
- B6 /tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/wt-s2/_werkstatt/nennung/protokolle/roh/e0/weiterleitungen.txt
- B7 /tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/wt-s2/_werkstatt/nennung/protokolle/roh/e0/netz.md (dazu netz.json)
- B8 /tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/wt-s2/_werkstatt/nennung/protokolle/roh/e0/konsole.md (Gegenprobe: gegenprobe-konsole/konsole.md)
- B9 /tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/wt-s2/_werkstatt/nennung/protokolle/roh/e0/kopfzeilen-start.txt (dazu robots.txt, sitemap-kern.xml)
- B10 /tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/wt-s2/_werkstatt/nennung/protokolle/roh/e0/html/ (Roh-HTML der vier Seiten)
- B11 /tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/wt-s2/_werkstatt/nennung/bilder/e0/start__390-light__fuss.webp
- B12 /tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/wt-s2/_werkstatt/nennung/werkzeuge/konsole.mjs (neu)
- B13 /tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/ci/a4491d5.log

## OFFENE FRAGEN

1. bilder.mjs bricht zweimal mit „Der Browser liefert kein WebP“ ab, beim Vollbild von / bei 390 px (Seite 17 774 px hoch, Ursache ungeprüft). 23 Bilder fehlen.
2. Lint-Abschnitt im CI-Protokoll (B13, Zeile 1) ohne Befehl und Ausgabe. Welcher Lauf gemeint ist, ist unklar.
3. Canonical auf /bewerbung mit 127.0.0.1: Ursache offen; der Live-Auftritt ist nicht geprüft.
4. Die beiden 308-Adressen: beabsichtigt oder nicht, ist offen.
5. CI-Protokoll Zeile 2230: „next start“ passt nicht zu „output: standalone“. Einfluss auf die Werte nicht geprüft.
6. konsole.mjs ist nur mit console-error gegengeprüft, Seitenfehler (pageerror) nicht.
7. Mengen: Linkprüfer 84 Seiten, CI-Graphprüfung 81 HTML-Dokumente, nicht abgeglichen.

## SELBSTPRÜFUNG

- Mengen: 84 Seiten, 4 Roh-HTML, 4 JSON-LD, 12 Zugang-Kombinationen, 10 Konsolen-Läufe (8 plus 2 Gegenproben), 3 Netz-Läufe, 1 von 24 Bildern.
- Schreibrechte: Eine Hilfsdatei lag einmal in roh/ statt roh/e0 (sitemap-kern-tmp.xml), entfernt und in roh/e0 neu abgelegt. Keine Projekt- oder Werkzeugdatei geändert; kein Server, Build oder Testlauf gestartet.

=== ENDE E0-PRUEFER-02 · BEREIT ZUR RÜCKGABE ===
