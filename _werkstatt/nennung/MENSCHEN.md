# Für Menschen · Agenturnennung Coday Web

## 1. Zustimmung des Kunden
- **Stand:** liegt vor. Coday Web hat am 15.10.2026 als Auftragnehmer der Bad und Energie GmbH erklärt, dass die Nennung gewollt ist (ENTSCHEIDUNGEN.md N-02).
- **Textvorschlag für die schriftliche Bestätigung** (an die Geschäftsführung der Bad und Energie GmbH):

> Sehr geehrter Herr Demir, wir haben im Fuß Ihrer Karriereseite karriere.bad-energie.de eine kleine Zeile „Webdesign & Entwicklung: Coday Web“ eingefügt, wie sie bei Websites von Agenturen üblich ist. Sie steht unter den Pflichtangaben und der Kartennennung, in derselben Schrift wie diese, und verlinkt auf unsere Website; nur auf der Startseite gibt der Link Suchmaschinen eine Empfehlung weiter, auf allen anderen Seiten ist er ausdrücklich ohne. Beim Aufruf Ihrer Seite werden dabei keine Daten an uns oder andere übertragen: Es gibt kein Bild, kein Skript und keine Schrift von unserem Server; erst wenn jemand auf den Link klickt, öffnet sich unsere Website und erfährt, von welcher Seite der Besuch kommt. Sie können jederzeit verlangen, dass der Link auch auf der Startseite keine Empfehlung mehr weitergibt („nofollow“) oder dass die Zeile ganz entfernt wird. Bitte bestätigen Sie uns kurz per E-Mail, dass Sie damit einverstanden sind.

## 2. Fremde Nennungen und Lizenzen (G6, unverändert)
- OpenStreetMap-Daten, ODbL 1.0: Nennung im Fuß jeder Seite (components/site/fuss/OsmNennung.tsx, Wortlaut lib/places/osm.ts:11-23), dazu app/llms.txt/content.ts:147-155 und die Einsatzgebiet-Seiten (KreisSeite.tsx:124, GebietSeite.tsx:197, OrtSeite.tsx:202). Bleibt; die Agenturnennung steht darunter und verdrängt sie nicht.
- Fahrplandaten gtfs.de, CC BY 4.0: lib/places/data/oepnv.json:7-12, 22; lib/places/text.ts:700.
- Schriften, SIL Open Font License 1.1: app/fonts/LIZENZEN.md, lib/seo/og-fonts/LIZENZEN.md.
- Frühere Agenturen, Themes, Vorlagen, Fotoquellen: keine gefunden (berichte/E0-KUNDSCHAFTER-02.md).

## 3. Hinweise aus der Erkundung (außerhalb dieses Laufs, nicht geändert)
- Herkunft von Logos (public/images/), Cursor (public/cursor/), favicon.ico, icon-192.png, Icons (components/icons/glyphs.tsx) und Berufsschul-Daten (lib/places/data/berufsschule.json) ist im Repository nicht belegt.
- „Partnerurkunde 2026“ (lib/data/company.ts:69) ist im Repository nicht belegt (siehe M-020 in docs/inhaber/offene-angaben.md).
- USt-IdNr. im Impressum gegen lib/seo/site-config.ts: bekannt als B1 in docs/inhaber/offene-angaben.md.

## 4. Linkziel
- `https://www.codayweb.de/de` antwortet ohne Weiterleitung mit 200, sein Canonical zeigt auf sich selbst (berichte/E0-PRUEFER-02.md, protokolle/indexierbar.md). Bleibt das Linkziel.
- Gibt es auf codayweb.de eine eigene Referenzseite für die Bad und Energie GmbH (etwa `/de/work/...`), kann LINKZIEL per ÄNDERN darauf umgestellt werden; der Entwurf dafür steht in REFERENZ.md.

## 5. Liste für den nächsten Schritt (N-08)
- Lighthouse-Performance auf `/` lag am Endstand im Median bei 0,90 (E0: 0,93), dazu eine neue Warnung auf `/einsatzgebiet` (0,90). Beides liegt unter dem Warnwert 0,95 und blockiert die CI nicht. Netz und Layoutverschiebung sind unverändert (Z-08). An der Live-Seite einmal nachmessen (protokolle/stufe-b-ci.md).
- S4 bei Navigation im Browser: Der beibehaltene Fuß zeigt den rel-Wert der neuen URL (N-05, N-13). Wer das anders will, bräuchte einen Fuß je Seite statt im Layout; das wäre ein größerer Umbau außerhalb dieses Laufs.
- Search Console: Zugang für den Kunden und für codayweb.de klären (BERICHT.md, Abschnitt 5).
- Der Linkprüfer folgt keinen Weiterleitungen; die zwei 308-Adressen (/einsatzgebiet/hochtaunuskreis, /einsatzgebiet/landkreis-marburg-biedenkopf) führen auf /einsatzgebiet, das geprüft ist.
