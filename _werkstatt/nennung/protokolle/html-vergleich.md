# HTML-Vergleich mit dem Stand ohne Nennung · Prüfung E3-PRUEFER-01 (Z-01)

Stand: 2026-10-16, ca. 10:53 UTC · Neu: Produktions-Build b0ae185 (Server http://127.0.0.1:3511) · Alt: Basis a4491d5 (`roh/e0/html/`, Build vom Lauf E0)

## Vorgehen

1. Abrufe mit `curl -s`: `/`, `/jobs`, `/arbeiten-bei-uns/waermepumpen`, `/bewerbung` nach `roh/e3/html/start.html`, `jobs.html`, `waermepumpen.html`, `bewerbung.html`.
2. Normalisierung beider Seiten (identisch, Skript `/tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/norm.mjs`): alle `<script>`-Inhalte entfernt (buildId, `self.__next_f`); `/_next/static/…` durch `/_next/static/X`; `fuss-module__…__` durch `fuss-module__X__`; `[a-z]+-module__…__` durch `M__`. Zusätzlich ein Zeilenumbruch an jeder Tag-Grenze, damit der Vergleich lesbar ist (die Rohdatei ist eine Zeile).
3. `diff -u` je Seite. Die Rohdiff ohne Normalisierung ergibt je Seite nur 2 Zeilen (die ganze Seite in einer Zeile), darum ist die Normalisierung nötig.

Ergebnis Rohdiff je Seite: 2 Zeilen, weil das HTML eine Zeile ist (kein Befund, nur Lesbarkeit).

## Ergebnis je Seite

| Seite | Zeilen hinzugefügt (außerhalb script) | entfernt | geändert | Inhalt der Änderung |
| --- | --- | --- | --- | --- |
| `/` (start) | 3 | 0 | 0 | ein Nennungs-Span mit Link, rel `noopener` |
| `/jobs` | 3 | 0 | 0 | ein Nennungs-Span mit Link, rel `nofollow noopener` |
| `/arbeiten-bei-uns/waermepumpen` | 3 | 0 | 0 | ein Nennungs-Span mit Link, rel `nofollow noopener` |
| `/bewerbung` | 3 | 0 | 0 | ein Nennungs-Span mit Link, rel `nofollow noopener` |

Die 3 Zeilen je Seite sind ein eingefügtes Element (`<span>`, `</a>`, `</span>`), in der Diff-Ansicht auf drei Zeilen verteilt.

Ergebnis: grün. Erwartung „nur das span data-agentur-nennung mit dem Link“ erfüllt. Keine andere Zeile außerhalb von `<script>` ist verändert.

## Die eingefügte Stelle (wörtlich, je Seite gleich bis auf rel)

```
<span class="M__nennung" data-agentur-nennung="">Webdesign &amp; Entwicklung: <a href="https://www.codayweb.de/de" target="_blank" rel="noopener" class="M__nennungLink">Coday Web<span class="sr-only"> (öffnet in neuem Tab)</span>
</a>
</span>
```

Steht im `<p class="M__zeile">` der Fußzeile, direkt nach dem OpenStreetMap-Absatz und vor dem schließenden `</p>`. Auf `/bewerbung` steht die Zeile in `<p class="M__zeile w-full">`.

- `/`: `rel="noopener"` (gefolgt, wie vorgesehen)
- `/jobs`, `/arbeiten-bei-uns/waermepumpen`, `/bewerbung`: `rel="nofollow noopener"`

## Weitere Befunde

- Die Anzahl der `<script>`-Blöcke ist gleich je Seite (alt und neu): `/` 21, `/jobs` 17, `/arbeiten-bei-uns/waermepumpen` 19, `/bewerbung` 19. Die Skriptinhalte wurden nicht verglichen; das ist der JSON-LD-Vergleich (Schritt 5, `jsonld.md`).
- Die Änderung entspricht der Erwartung. Der sichtbare Wortlaut „Webdesign & Entwicklung: Coday Web“ steht auf allen vier Seiten (im HTML mit `&amp;`).
- Der `sr-only`-Zusatz „ (öffnet in neuem Tab)“ steht im Link; er ist für Sehende nicht sichtbar. Offene Frage zu S1 steht in `links.md`.

## Belege

- Vollständiger normierter Diff: `/home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/protokolle/roh/e3/html-diff.txt` (52 Zeilen)
- Neue Rohdateien: `/home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/protokolle/roh/e3/html/` (start, jobs, waermepumpen, bewerbung)
- Alte Rohdateien: `/home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/protokolle/roh/e0/html/`
- Normierte Dateien: `/tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/norm/` (e0 und e3)

## Schreibrechte und Grenzen

- Geschrieben nur in `protokolle/html-vergleich.md` und `protokolle/roh/e3/`. Kein Projektcode, kein Commit.
