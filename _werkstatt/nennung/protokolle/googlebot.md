# Googlebot-Vergleich · Prüfung E3-PRUEFER-01

Stand: 2026-10-16, Lauf 10:51 UTC · Server: http://127.0.0.1:3511 (Produktions-Build b0ae185) · Quelle: `roh/e3/links.tsv`, Spalte `googlebot_gleich`.

Der Googlebot-Abruf ist mit der Kennung `Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)` gemacht. Verglichen werden Status, Sprache, Robots, Canonical und alle Links auf codayweb.de (href, Text, rel, target).

## Zahl

- Seiten insgesamt: 84
- Gleich (Googlebot = Standard): 84
- Ungleich: 0

Ergebnis: grün.

## Startseite „/“, beide Abrufe wörtlich

Standard-Abruf (Datei `roh/e3/standard-start.html`) und Googlebot-Abruf (Datei `roh/e3/googlebot-start.html`) enthalten an dieser Stelle je genau einen Link. Die beiden Dateien sind byte-gleich (`cmp` ohne Unterschied).

- href: `https://www.codayweb.de/de`
- Text (sichtbar): `Coday Web`
- rel: `noopener`
- target: `_blank`

Wörtlich im HTML (beide Abrufe gleich):

```
<a href="https://www.codayweb.de/de" target="_blank" rel="noopener" class="fuss-module__iD5pIG__nennungLink">Coday Web<span class="sr-only"> (öffnet in neuem Tab)</span></a>
```

Vor dem Link steht im Fuß der Text `Webdesign &amp; Entwicklung: ` (im Browser: „Webdesign & Entwicklung: “).

## Bemerkung

Der Zusatz `<span class="sr-only"> (öffnet in neuem Tab)</span>` ist für Sehende nicht sichtbar. Er steht in Googlebot- und Standardabruf gleich. Die Frage, ob er gegen die Vorgabe „Linktext genau Coday Web“ verstößt, steht in `links.md` als offene Frage.

Belege: `/home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/protokolle/roh/e3/links.tsv`, `/home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/protokolle/roh/e3/standard-start.html`, `/home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/protokolle/roh/e3/googlebot-start.html`.
