# Links der Nennung und Bestand · Prüfung E3-PRUEFER-01 (Z-02, Z-03)

Stand: 2026-10-16, Lauf 10:51 UTC · Server: http://127.0.0.1:3511 (Produktions-Build b0ae185, laufend, nicht neu gebaut) · Werkzeug: `_werkstatt/nennung/werkzeuge/links.mjs` (Standard- und Googlebot-Kennung) · Vergleich: Basis a4491d5 (roh/e0)

Rohdaten: `/home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/protokolle/roh/e3/links.tsv` und `links-zusammenfassung.md`. Konsolenausgabe: `/tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/e3-links-konsole.txt`.

## Zahlen

| Prüfpunkt | Ergebnis | Erwartung | Befund |
| --- | --- | --- | --- |
| Geprüfte Seiten | 84 | Seitenliste (Sitemap, Routen, Build) | grün: gleiche Liste wie Basis (84) |
| Status 200 | 81 | ja | grün |
| Status 308 | 2 | nicht erwartet, vorbestehend | OFFENE FRAGE 1 (siehe unten) |
| Status 404 | 1 (`/gibt-es-nicht`) | 404 mit Fuß | grün: Fuß vorhanden, Link nofollow |
| Seiten mit Status 200 und Fuß | 81 | alle | grün |
| davon mit genau einem Link auf codayweb.de im Fuß | 81 von 81 | genau einer | grün |
| Seiten mit Fuß insgesamt (inkl. 404) | 82 | | |
| Links auf codayweb.de außerhalb des Fußes | 0 | 0 | grün |
| Seiten mit gefolgtem Link (rel ohne nofollow, sponsored, ugc) | 1: nur `/` | genau „/“ | grün |
| Links mit href https://www.codayweb.de/de | 82 von 82 | exakt, ohne Parameter | grün |
| Links mit sichtbarem Text „Coday Web“ | 82 von 82 | genau „Coday Web“ | grün (sichtbarer Text); OFFENE FRAGE 2 zum Zusatz für Hilfstechnik |
| Links mit target _blank | 82 von 82 | _blank | grün |
| Links mit rel nofollow noopener | 81 (80 Seiten außer `/` plus 404) | nofollow, kein noreferrer | grün |
| Links mit rel noopener (ohne nofollow) | 1 (`/`) | Startseite ohne nofollow | grün |
| Links mit noreferrer | 0 | 0 | grün |
| Googlebot-Abruf gleich Standard-Abruf | 84 von 84 | alle | grün (Abweichungen 0) |
| Vorher (Basis a4491d5, roh/e0) | 0 von 84 Seiten mit Coday-Link | | Nennung ist neu |

## Abweichungen

1. Status 308, zwei Seiten, kein Fuß gemessen (das Werkzeug folgt Weiterleitungen nicht):
   - `/einsatzgebiet/hochtaunuskreis` → `Location: /einsatzgebiet#hochtaunuskreis`
   - `/einsatzgebiet/landkreis-marburg-biedenkopf` → `Location: /einsatzgebiet#landkreis-marburg-biedenkopf`
   - Vorbestehend: dieselben 308 stehen in `roh/e0/weiterleitungen.txt` und `roh/e0/links-zusammenfassung.md` (Basis a4491d5, ohne Nennung). Ziel `/einsatzgebiet` hat einen Fußlink mit nofollow noopener.
2. Status 404, `/gibt-es-nicht`: Fuß vorhanden, ein Link auf codayweb.de, href https://www.codayweb.de/de, Text „Coday Web“, rel `nofollow noopener`, target `_blank`, robots noindex. Erwartet, grün.
3. Keine Abweichung bei rel, target, href oder Linktext gegen das Linkmodell, außer dem beabsichtigten Unterschied auf `/` (rel ohne nofollow).

## Je Seite: href, Text, rel, target (aus links.tsv)

| Seite | Status | href | Text | rel | target | Googlebot gleich |
| --- | --- | --- | --- | --- | --- | --- |
| / | 200 | https://www.codayweb.de/de | Coday Web | noopener | _blank | ja |
| /jobs | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /bewerbung | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /jobs/anlagenmechaniker-shk-wetzlar | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /jobs/obermonteur-projektleiter-shk-wetzlar | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /jobs/ausbildung-anlagenmechaniker-shk-2027-wetzlar | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /jobs/quereinsteiger-montagehelfer-shk-wetzlar | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /jobs/buerofachkraft-wetzlar | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /jobs/schuelerpraktikum-shk-wetzlar | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/lahn-dill-kreis | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/landkreis-giessen | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/landkreis-limburg-weilburg | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/wetteraukreis | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/steindorf | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/wetzlar | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/garbenheim | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/nauborn | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/hermannstein | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/solms | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/naunheim | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/braunfels | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/asslar | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/lahnau | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/muenchholzhausen | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/schoeffengrund | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/blasbach | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/dutenhofen | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/leun | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/huettenberg | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/heuchelheim-an-der-lahn | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/biebertal | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/ehringshausen | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/giessen | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/loehnberg | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/waldsolms | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/weilmuenster | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/wettenberg | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/hohenahr | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/weilburg | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/langgoens | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/weinbach | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/linden | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/pohlheim | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/mittenaar | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/merenberg | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/fernwald | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/lollar | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/sinn | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/graevenwiesbach | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/herborn | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/bischoffen | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/greifenstein | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/butzbach | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/mengerskirchen | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/lohra | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/muenzenberg | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/staufenberg | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/buseck | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/siegbach | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/waldbrunn-westerwald | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/lich | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/beselich | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/weilrod | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/rockenberg | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/breitscheid | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/villmar | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/bad-endbach | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /arbeiten-bei-uns | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /arbeiten-bei-uns/gehalt | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /arbeiten-bei-uns/fahrzeug-und-werkzeug | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /arbeiten-bei-uns/waermepumpen | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /arbeiten-bei-uns/betrieb | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /arbeiten-bei-uns/diskret-wechseln | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /arbeiten-bei-uns/buero-und-verwaltung | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /bewerbung/danke | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /bewerbung/mappe | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /datenschutz | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /impressum | 200 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |
| /einsatzgebiet/hochtaunuskreis | 308 | – | – | – | – | ja |
| /einsatzgebiet/landkreis-marburg-biedenkopf | 308 | – | – | – | – | ja |
| /gibt-es-nicht | 404 | https://www.codayweb.de/de | Coday Web | nofollow noopener | _blank | ja |

Die Spalte „Googlebot gleich“ ist die Vergleichsspalte des Werkzeugs (Status, Sprache, Robots, Canonical und alle Links des Abrufs mit Googlebot-Kennung gleich dem Standardabruf). Die Spalten href/Text/rel/target sind aus dem Standardabruf; der Googlebot-Abruf ist laut Spalte gleich.

## Schreibrechte und Grenzen

- Geschrieben nur: `protokolle/links.md`, `protokolle/roh/e3/`. Kein Projektcode, kein Werkzeug, kein Commit.
- Der Produktions-Server lief bereits; kein Build, kein Server, keine Testsuite gestartet.

## Offene Fragen

1. Zwei 308-Weiterleitungen (`/einsatzgebiet/hochtaunuskreis`, `/einsatzgebiet/landkreis-marburg-biedenkopf`) gibt es schon im Stand ohne Nennung (`roh/e0/weiterleitungen.txt`), sie sind nicht Teil der Nennung. Das Werkzeug folgt Weiterleitungen nicht, darum ist ihr Fuß nicht direkt gemessen. Das Ziel `/einsatzgebiet` (mit Fußlink, nofollow noopener) ist gemessen. Frage an den Inhaber: Bleibt die Weiterleitung so, oder ist sie bei der Bereinigung der Seitenliste zu klären?
2. S1 „Linktext genau „Coday Web““: Der sichtbare Text ist exakt „Coday Web“. Die Seite enthält aber im Link ein sr-only-Stück „ (öffnet in neuem Tab)“. Hilfstechnik liest also „Coday Web (öffnet in neuem Tab)“. Ob das gegen S1 verstößt, entscheidet der Inhaber. Belegstelle: `/home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/protokolle/roh/e3/standard-start.html` (Standardabruf der Startseite, Fundstelle des Links).
