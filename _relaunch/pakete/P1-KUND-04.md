# P1-KUND-04 · Rolle Kundschafter · Stufe 1 · Kern-Version 0
Schreibrechte: `_relaunch/atlas/neu-plattform.md`
Umfang: Neuatlas des Ausgangsstands (alle Seiten der Grundmenge plus Seitenrahmen und Such-/Technik-Schicht).

## Rollenbriefing
Du erfasst Seiten, Komponenten, Texte, Medien, Bewegungen und Metadaten vollständig mit Fundstelle. Häufige Fehler: nur die Navigation lesen und Seiten übersehen; zusammenfassen statt auflisten; Vermutung als Befund.

## Aufgabe in einem Satz
Erfasse jedes Element des Ausgangsstands (a83269d) im Atlas-Format mit Fundstelle, damit der Abgleich mit dem Altstand möglich wird.

## Das Projekt in fünf Sätzen / Kern-Auszug / Quellen / Atlas-Format / Grenzen / Ausgabeformular
Siehe `_relaunch/pakete/_gemeinsam-p0.md` und `_relaunch/pakete/_gemeinsam-p1.md` – gelten wortgleich.

## Schritte
1. Lies vollständig: `app/page.tsx`, `components/home/*` (ohne `__tests__`), `app/jobs/page.tsx`, `app/jobs/[slug]/page.tsx`, `components/jobs/*`, `lib/jobs/data/*.ts` (Texte der Stellen), `app/bewerbung/page.tsx` + `layout.tsx`, `components/apply/*` (inkl. `thanks/`), `app/bewerbung/danke/*`, `app/bewerbung/mappe/*`, `components/mappe/*`, `components/maps/*`, `components/reviews/*`, `components/site/*`, `components/brand/Logo.tsx`, `components/legal/*`, `app/datenschutz/*`, `app/impressum/*`, `app/not-found.tsx`, `app/error.tsx`, `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts`, `app/llms.txt/*`, `app/llms-full.txt/*`, `app/feeds/*`, `app/opengraph-image.tsx`, `lib/content/*.ts` (Fakten, FAQ, Ablauf, Region, Team).
2. Bereiche: `NEU-START-*`, `NEU-STELLEN-*` (Übersicht und Vorlage Stellenseite; Inhalte je Stelle nur in Kurzform), `NEU-BEW-*` (Flow: jeder Schritt, Fragen und Antworten je Fragenset, Kontakt, Fehler, Erfolg), `NEU-DANKE-*`, `NEU-MAPPE-*`, `NEU-SHELL-*` (Kopf, Fokusmodus, Mobilmenü, Sticky-Leiste, Fuß, Kontaktoptionen, 404, Fehler), `NEU-RECHT-*` (Aufbau, Abschnittsüberschriften, Pflichtangaben), `NEU-SEO-*` (Titel/Beschreibung je Seite, JSON-LD-Knoten, Feeds, Sitemap, robots, llms).
3. Je Element: Bewegung (transition-, starting:-, animate-Klassen) und SVG (lucide-Icons mit Namen, inline-SVG).
4. Bildschirmfotos aus `_relaunch/belege/p0-ausgangsstand/` bzw. `_relaunch/.roh/p0-ausgangsstand/webp/` zuordnen.
5. Am Ende: Zählung je Kategorie, Liste aller Anker-IDs je Seite, Liste aller Routen.

## Selbstprüfung
- Jede Seite der Grundmenge vertreten? Jeder Flow-Schritt? Jeder Abschnitt der Startseite?
- Markiere Unsicheres als OFFENE FRAGE statt zu raten, und erfülle nur deinen Auftrag.
=== ENDE P1-KUND-04 · BEREIT ZUR RÜCKGABE === (diese Zeile setzt du an das Ende deiner Antwort)
