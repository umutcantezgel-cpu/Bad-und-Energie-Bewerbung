# JSON-LD-Vergleich mit dem Stand ohne Nennung · Prüfung E3-PRUEFER-01 (Z-09)

Stand: 2026-10-16, ca. 10:54 UTC · Neu: Server http://127.0.0.1:3511 (Produktions-Build b0ae185) · Alt: Basis a4491d5 (`roh/e0/jsonld.json`, Stand 10:35 UTC)

Werkzeug: `_werkstatt/nennung/werkzeuge/jsonld.mjs --seiten /,/jobs,/arbeiten-bei-uns/waermepumpen,/bewerbung --vergleich roh/e0/jsonld.json`. Ausgabe: `roh/e3/jsonld.json`, `roh/e3/jsonld-vergleich.md`. Konsole: `/tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/e3-jsonld-konsole.txt`.

## Gültigkeit

| Seite | Status | JSON-LD-Blöcke | Syntaxfehler |
| --- | --- | --- | --- |
| `/` | 200 | 1 | 0 (gültig) |
| `/jobs` | 200 | 1 | 0 (gültig) |
| `/arbeiten-bei-uns/waermepumpen` | 200 | 1 | 0 (gültig) |
| `/bewerbung` | 200 | 1 | 0 (gültig) |

Ergebnis: grün, gültiges JSON auf allen vier Seiten.

## Geänderte Felder je Seite

Verglichen wurde jeder Knoten und jedes Feld (Werkzeugvergleich und zusätzlich ein eigener Tiefenvergleich der beiden Dateien, Ergebnis gleich). Auf jeder der vier Seiten gibt es genau eine Änderung:

| Seite | Knoten | Feld neu | Wert neu |
| --- | --- | --- | --- |
| `/` | WebSite `https://karriere.bad-energie.de/#website` | `creator` | `{"@type":"Organization","name":"Coday Web","url":"https://www.codayweb.de/de"}` |
| `/jobs` | WebSite `https://karriere.bad-energie.de/#website` | `creator` | wie oben |
| `/arbeiten-bei-uns/waermepumpen` | WebSite `https://karriere.bad-energie.de/#website` | `creator` | wie oben |
| `/bewerbung` | WebSite `http://127.0.0.1:3511/#website` | `creator` | wie oben |

Die drei Teilfelder `creator.@type`, `creator.name` und `creator.url` sind im Vergleich einzeln als „(fehlt) → neu“ geführt. Zusammen ergeben sie das eine Objekt `creator`.

Keine weiteren Änderungen:

- Keine Felder entfernt, keine Werte geändert, keine Knoten neu oder entfernt. Auf allen vier Seiten.
- `/bewerbung`: Die lokale Adresse `http://127.0.0.1:3511` steht in Alt und Neu gleich (Messumgebung, keine Veränderung).
- Canonical und WebPage-URLs: unverändert (Teil des Vergleichs; keine Abweichung gemeldet).

## Erwartung

- Erwartung: im WebSite-Knoten nur `creator` neu, alle anderen Felder und Knoten gleich. Erfüllt auf allen vier Seiten.
- Ergebnis: grün.

## Belege

- `/home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/protokolle/roh/e3/jsonld.json`
- `/home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/protokolle/roh/e3/jsonld-vergleich.md`
- `/home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/protokolle/roh/e0/jsonld.json`

## Schreibrechte und Grenzen

- Geschrieben nur in `protokolle/jsonld.md` und `protokolle/roh/e3/`. Kein Projektcode, kein Commit.
