# Leitplanken S1 bis S7 · E3-PRUEFER-02

Stand 2026-10-16 · Produktions-Server http://127.0.0.1:3511 · Seiten: /, /jobs, /arbeiten-bei-uns/waermepumpen (S1, S2, S5, S6, S7) bzw. zusätzlich /bewerbung (Zugang, Konsole, Bilder)

| Leitplanke | erfüllt | Beleg (Datei und Wert) |
| --- | --- | --- |
| S1 Linktext genau „Coday Web“, keine weiteren codayweb-Links im Footer | ja | roh/e3b/leitplanken-beleg.txt: Text ohne sr-only „Coday Web“ auf allen drei Seiten; je 1 codayweb-Link auf der Seite, 1 im Footer. Offen: Accessible Name mit sr-only-Zusatz (Frage 1) |
| S2 href exakt https://www.codayweb.de/de ohne Parameter | ja | roh/e3b/leitplanken-beleg.txt: href="https://www.codayweb.de/de" auf allen drei Seiten |
| S3 sichtbar, nicht versteckt, nicht überlagert, Trefferfläche ausreichend | ja | roh/e3b/zugang.json: inline, visible, Deckkraft 1, 14 px wie OSM-Link, Farbe gleich, Kontrast 7,57 bis 8,28:1, Trefferfläche 71 × 26 px. roh/e3b/leitplanken-beleg.txt: 12 von 12 nicht überdeckt |
| S4 echtes a mit href im HTML; rel und target im HTML richtig und im Browser nicht umgeschaltet (Lesart N-05) | ja nach N-05; Umschaltung offen | roh/e3b/navigation.json: 11 von 11 gleich; target überall _blank. Offen: rel wechselt bei interner Navigation zweimal am selben Element (protokolle/navigation.md, Frage 1) |
| S5 rel nach Linkmodell, nie noreferrer, noopener zum neuen Tab | ja | rel="noopener" auf / (ohne nofollow, sponsored, ugc); rel="nofollow noopener" auf /jobs und /arbeiten-bei-uns/waermepumpen; kein noreferrer; target="_blank" (leitplanken-beleg.txt) |
| S6 nur Text, kein Bild, Skript, Iframe, Pixel oder Schrift vom Agenturserver | ja, mit offener Frage | leitplanken-beleg.txt: 0 Tags img/script/iframe/link/... mit codayweb auf allen drei Seiten. roh/e3b/navigation.json: 0 Anfragen an codayweb.de in allen 7 Läufen. roh/e0/netz.json: 0. Offen: WebSite-JSON-LD nennt „Coday Web“ mit codayweb.de-URL als creator, als Text ohne Ladevorgang (Frage 2) |
| S7 dieselbe Nennung für Menschen und Suchmaschinen | ja | leitplanken-beleg.txt: Footer-Link mit Googlebot-Kennung und normaler Kennung identisch (href, rel, target, Text) auf allen drei Seiten |

Hinweis: roh/e3/links.tsv liegt nicht vor (der Ordner roh/e3 steht nicht in meiner Schreibliste). S1, S2, S5 und S7 sind deshalb per Abruf (curl-Äquivalent über fetch) geprüft, nicht über den Linkprüfer.

## OFFENE FRAGEN

1. Accessible Name: Soll der sr-only-Zusatz „(öffnet in neuem Tab)“ im Link bleiben? Nach dem Wortlaut „Linktext genau Coday Web“ wäre er zu viel; der sichtbare Text ist korrekt. Der OSM-Link hat denselben Zusatz. Entscheidung beim Inhaber.
2. JSON-LD: Der WebSite-Knoten enthält „creator“ mit „Coday Web“ und codayweb.de-URL. Es ist Text im Strukturdatenblock, kein Ladevorgang und kein Link im Footer. Ob S6 oder S7 das erfassen sollen, ist offen.
3. S4 Umschaltung: siehe protokolle/navigation.md, Frage 1.
