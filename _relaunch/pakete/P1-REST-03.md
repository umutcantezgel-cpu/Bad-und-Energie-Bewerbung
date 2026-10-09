# P1-REST-03 · Rolle Restaurator · Stufe 2 · Kern-Version 0
Schreibrechte: `_relaunch/atlas/paesse-shell-recht-seo.md`
Umfang: Abgleich von Seitenrahmen, Rechtsseiten sowie Such- und Technikschicht des Altstands ↔ Ausgangsstand und Element-Pässe dazu.

## Briefing, Grundsätze, Format
`_relaunch/pakete/_gemeinsam-p0.md`, `_relaunch/pakete/_gemeinsam-p1.md`, `_relaunch/pakete/_restaurator.md` – gelten wortgleich.

## Aufgabe in einem Satz
Ordne jede Zeile von `_relaunch/atlas/alt-shell-recht-seo.md` dem Ausgangsstand zu und schreibe die Element-Pässe für Rahmen, Recht und Suche.

## Schritte
1. Lies `_relaunch/atlas/alt-shell-recht-seo.md` vollständig und `_relaunch/atlas/neu-plattform.md` (Bereiche NEU-SHELL, NEU-RECHT, NEU-SEO).
2. Lies im Ausgangsstand `components/site/*`, `components/brand/Logo.tsx`, `components/legal/*`, `app/datenschutz/*`, `app/impressum/*`, `app/not-found.tsx`, `app/error.tsx`, `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts`, `app/llms*.txt/*`, `next.config.ts`, `proxy.ts`, `docs/ROADMAP.md` §5, §9, §10, `docs/operations/datenschutz-aenderungen.md`.
3. Abgleich je Atlaszeile: unverändert · verschoben · geschwächt · verloren. Rechtsseiten: Pflichtangaben im Impressum Wort für Wort vergleichen (Firma, Anschrift, Vertretung, Register, USt-IdNr., Kammer, Berufsbezeichnung/Staat, Streitbeilegung). Jede fehlende Pflichtangabe ist Muss und wird nie zurückgestellt.
4. Element-Pässe (Bereiche `SHELL`, `RECHT`, `SEO`, je ab 001). Pflicht-Kandidaten: Oberleiste (100 J., Region, offene Stellen, Vertraulichkeit, WhatsApp, „Zur Kunden-Website“-Link); Kopfnavigation mit Ankerzielen; Stellen-Zähler-Badge; Mobilmenü-Inhalte und Staffel-Animation; Hamburger-Morph; Fuß (Spalten, Siegel, HWK/Innung, Cookie-Einstellungen); Schnellbewerbungs-Seitenleiste; WhatsApp-Widget (Wesen: Direktweg per WhatsApp); Nach-oben-Knopf; Cookie-Banner (Wesen/Recht – heute ohne Tracking nicht nötig?); 404-Texte „Rohrleitung verirrt“ (Charakter); Fehlerseiten; Datenschutz-Kennzahlenkarten, Suchfeld im Inhaltsverzeichnis, Druck-Knopf; Impressum-Pflichtangaben; Titel/Beschreibungen, JSON-LD-Knoten (LocalBusiness priceRange, knowsAbout, FAQPage), llms.txt-Inhalte, robots-Regeln, IndexNow-Schlüsselroute `/298d966b7e4f4a43981cb8e30da6b5b5.txt` (Bindung!), alte URLs und Anker (für Z-06).
5. Für Z-06: Tabelle „Alte URLs/Anker → Ziel im Ausgangsstand → Status (200/301/308/410/fehlt)“ am Ende der Datei; Status per `curl -s -o /dev/null -w '%{http_code} %{redirect_url}' http://localhost:3500<pfad>` ermitteln (GET, ohne Weiterleitungen zu folgen) und Anker über das Vorhandensein der ID im HTML.
6. Wo unklar ist, ob verloren oder nur verschoben: Feld „Unsicherheit“ ausfüllen.

## Selbstprüfung
- Zuordnungsprüfung geht auf (jede Atlaszeile genau einmal)? Kein erfundener Inhalt als Wesenskern?
- Markiere Unsicheres als OFFENE FRAGE statt zu raten, und erfülle nur deinen Auftrag.
=== ENDE P1-REST-03 · BEREIT ZUR RÜCKGABE === (diese Zeile setzt du an das Ende deiner Antwort)
