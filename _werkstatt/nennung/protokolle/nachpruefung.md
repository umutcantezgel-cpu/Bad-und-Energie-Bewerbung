# Nachprüfung nach N-12 · Commit 66d8d99

Kennung E3-PRUEFER-04 · 16.10.2026 · Server http://127.0.0.1:3511

Vorbedingung: Der Server läuft als Produktionsmodus (`next-server` 16.3.8, `bunx next start -p 3511`). Die Build-ID im ausgelieferten HTML stimmt mit `.next/BUILD_ID` überein. Im Code gibt es keinen Unterschied zwischen 66d8d99 und HEAD.

## Ergebnis

Alle Schritte 2 bis 6 sind grün. Kein roter Befund. Der Linktext ist genau „Coday Web“, der Hinweis hängt per `aria-describedby` am Link, die rel-Werte folgen dem Linkmodell. Der Hinweis steht nicht mehr im Link; das entspricht S1 und klärt die E2-Offene-Frage 3 zum Linktext. Offen bleibt nur die Lighthouse-Warnung (siehe unten).

## Je Schritt

**2 · Links: grün.** 84 Seiten, 82 mit genau einem Footer-Link auf codayweb.de, 0 Links außerhalb, Googlebot gleich bei allen. Gefolgt ist nur `/` (rel „noopener“), alle anderen 81 Fußlinks haben „nofollow noopener“. target `_blank` überall. Die zwei 308-Seiten (`/einsatzgebiet/hochtaunuskreis`, `/einsatzgebiet/landkreis-marburg-biedenkopf`) haben im Abruf keinen Fuß. Sie leiten wie in E0 auf `/einsatzgebiet#…`, und das Ziel hat den Fuß. Direkte curl-Prüfung für `/`, `/jobs`, `/gibt-es-nicht`: Linktext exakt „Coday Web“, `aria-describedby="agentur-neuer-tab"`, das span `id="agentur-neuer-tab"` steht direkt nach `</a>`. Die id kommt je Seite genau einmal vor (auch auf `/bewerbung` und `/arbeiten-bei-uns/waermepumpen`).
Beleg: `roh/e3d/links-zusammenfassung.md`, `roh/e3d/links.tsv`.

**3 · Zugang: grün.** 12 Läufe (`/`, `/jobs`, `/bewerbung` × 390 und 1440 px × hell und dunkel). axe im Footer: 0 Befunde in allen Stufen. Kontrast min. 8,28:1 hell und 7,57:1 dunkel (Grenze 4,5). Trefferfläche min. 71 × 26 px (Grenze 24 × 24). Fokus in allen 12 Läufen sichtbar (3-px-Umriss). Kein Überlauf. Zugänglicher Name laut Playwright: „Coday Web“ (ein Treffer der Rollensuche). Beschreibung: „(öffnet in neuem Tab)“, abgeleitet aus `aria-describedby`. E0 hatte keine Nennung, deshalb gibt es keinen Vorher-Wert.
Beleg: `roh/e3d/zugang.md`, `roh/e3d/zugang-name.json`.

**4 · Konsole: grün.** 4 Seiten × 2 Größen: 0 Konsolenfehler, 0 Seitenfehler. E0 ebenso 0 und 0, also keine neuen Fehler.
Beleg: `roh/e3d/konsole.md`.

**5 · Navigation: grün.** 11 von 11 Vergleichen gleich. Geprüft sind Browser ohne JavaScript, mit JavaScript bei DOMContentLoaded, nach networkidle plus 2 s und die interne Navigation `/` → `/jobs` → `/`. Anfragen an codayweb.de beim Laden: 0.
Beleg: `roh/e3d/navigation.md`.

**6 · HTML-Vergleich: grün.** Vier Seiten gegen E0, normalisiert nach html-vergleich.md. Je Seite 3 Zeilen hinzugefügt (das Nennungs-span mit Link und Hinweis), 0 entfernt, 0 geändert. Das Feld `creator` im JSON-LD ist neu (`"name":"Coday Web","url":"https://www.codayweb.de/de"`), E0 hat kein Vorkommen. Das ist der erwartete Unterschied. Die Normalisierung entfernt Skripte, deshalb habe ich das Feld getrennt geprüft. Kein `noreferrer` in der Nennung.
Beleg: `roh/e3d/html-diff.txt`, `roh/e3d/html/`.

## Z-01 und Z-07

- **Z-01: grün.** Lint und Typprüfung ohne Befund. Tests 190 Dateien und 3883 Tests grün (E0: 189 und 3873). Build grün. e2e 590 bestanden, 506 übersprungen, 0 rot. Endzeile „ALLES GRUEN“. Lighthouse mit Warnungen, wie in E0, aber mit schlechteren Medianen (siehe offene Frage 1).
- **Z-07: grün.** Siehe Schritt 3.

## Belegpfade

- Protokolle: `/home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/protokolle/stufe-b-ci.md`, `/home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/protokolle/nachpruefung.md`
- Roh: `/home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/protokolle/roh/e3d/`
- CI-Protokoll und Abrufe im Scratchpad: `/tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/ci/66d8d99.log`

## Offene Fragen

1. **Lighthouse.** Der Median bei `/` fällt von 0,93 (E0) auf 0,90, und `/einsatzgebiet` hat eine neue Warnung (Median 0,90). Die Ursache ist nicht geklärt. Einzelheiten in `stufe-b-ci.md`, Befund 1.
2. **Build-Exit.** Das CI-Protokoll hat keine Exit-Zeile (wie bei E2). Bitte bestätigen.
3. **Weiterleitungen.** Der Linkprüfer folgt 308-Weiterleitungen nicht. Das ist in E0 gleich und kein Befund zur Nennung.
