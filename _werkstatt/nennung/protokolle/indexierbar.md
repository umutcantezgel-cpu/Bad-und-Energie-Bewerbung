# Indexierbarkeit der Quellseite und Linkziel · Prüfung E3-PRUEFER-01 (Z-05)

Stand: 2026-10-16, ca. 10:53 UTC · Server: http://127.0.0.1:3511 (Produktions-Build b0ae185) · Quelle der Seite: https://karriere.bad-energie.de/ (lokal als `/` abgerufen)

Alle Ausgaben sind wörtlich abgeschrieben. Abrufe mit `curl`, Auswertung der HTML-Angaben aus `roh/e3/standard-start.html` (Standardabruf von `/`).

## 1. Quellseite „/“: Kopfzeilen

Befehl: `curl -sI http://127.0.0.1:3511/`

```
HTTP/1.1 200 OK
...
Cache-Control: s-maxage=3600, stale-while-revalidate=31532400
ETag: "4xr2ci2jdf9erc"
Content-Type: text/html; charset=utf-8
Content-Length: 439809
```

(Gekürzt: Sicherheits- und CSP-Kopfzeilen ohne Befund für die Indexierung.)

- Status: `200 OK`
- X-Robots-Tag: nicht vorhanden (keine Zeile in der Kopfzeile)
- Ergebnis: grün

## 2. Meta robots und Canonical von „/“

Befehl: Auszug aus `roh/e3/standard-start.html`

```
<link rel="canonical" href="https://karriere.bad-energie.de"/>
<meta name="robots" content="index, follow"/>
```

- Anzahl Meta-robots-Angaben: 1
- `noindex` im HTML: 0 Treffer
- Canonical: `https://karriere.bad-energie.de` (ohne Schrägstrich, selbst)
- Ergebnis: grün (index, follow; Canonical auf die eigene Adresse)

## 3. robots.txt

Befehl: `curl -s http://127.0.0.1:3511/robots.txt` (vollständige Ausgabe in `/tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/e3-robots.txt`; Auszug, wörtlich):

```
User-Agent: Googlebot
User-Agent: Bingbot
User-Agent: DuckDuckBot
Allow: /
Disallow: /api/
Disallow: /admin/
...
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
...
Sitemap: https://karriere.bad-energie.de/sitemap/kern.xml
```

- Googlebot-Gruppe: `Allow: /`; keine Sperre für `/`.
- Gruppe `*`: `Allow: /`; keine Sperre für `/`.
- Zusätzlich: die Gruppe für Googlebot-fremde KI-Crawler (GPTBot u. a.) erlaubt `/` ebenfalls. Gesperrt mit `Disallow: /` sind nur SemrushBot, PetalBot, DotBot, MJ12bot, BLEXBot, DataForSeoBot, MegaIndex und Bytespider. Googlebot ist nicht darunter.
- Ergebnis: grün

## 4. Sitemap kern.xml

Befehl: `curl -s http://127.0.0.1:3511/sitemap/kern.xml`

```
<url>
<loc>https://karriere.bad-energie.de</loc>
<lastmod>2026-10-14</lastmod>
</url>
<url>
<loc>https://karriere.bad-energie.de/jobs</loc>
...
```

- Enthält `https://karriere.bad-energie.de` ohne Schrägstrich: ja (Zeile 1 der Urlset-Liste). Das passt zum Canonical.
- Ergebnis: grün

## 5. Linkziel

Befehl: `curl -sS -o /dev/null -w '%{http_code} %{redirect_url}' https://www.codayweb.de/de`

Ausgabe: `200 ` (Statuscode 200, leere Weiterleitungs-URL)

Canonical und robots der Zielseite (Auszug aus dem Abruf der Zielseite, Datei `/tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/e3-codayweb-de.html`):

```
<link rel="canonical" href="https://www.codayweb.de/de"/>
<meta name="robots" content="index, follow"/>
```

Titel der Zielseite (zur Zuordnung): `Webdesign Wetzlar | Webentwicklung Wetzlar | Coday Web`

- Status 200, keine Weiterleitung. Ziel ist selbst kanonisch und indexierbar.
- Ergebnis: grün

## Befund

Keine Ursache für eine Abweichung in der Indexierbarkeit der Quellseite gefunden. Gegen den Stand ohne Nennung (Basis a4491d5, `roh/e0`) geprüft:

- robots.txt: byte-gleich zu `roh/e0/robots.txt` (`diff` ohne Ausgabe).
- sitemap/kern.xml: byte-gleich zu `roh/e0/sitemap-kern.xml`.
- Kopfzeilen von `/`: gleich zu `roh/e0/kopfzeilen-start.txt` bis auf Datum, ETag und Content-Length. Content-Length steigt von 438430 auf 439809 (+1379 Byte, die Nennung im Fuß). Kein X-Robots-Tag in beiden.
- Meta robots und Canonical von `/`: unverändert (index, follow; Canonical ohne Schrägstrich).

Abgelegt unter `roh/e3/robots.txt`, `roh/e3/sitemap-kern.xml`, `roh/e3/kopfzeilen-start.txt`.

## Schreibrechte und Grenzen

- Geschrieben nur in `protokolle/indexierbar.md` und `protokolle/roh/e3/`. Kein Projektcode, kein Commit.

## Belege

- `/home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/protokolle/roh/e3/standard-start.html`
- `/home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/protokolle/roh/e3/links.tsv`
- `/tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/e3-codayweb-de.html`
