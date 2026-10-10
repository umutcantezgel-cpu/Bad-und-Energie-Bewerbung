# P1-KUND-06 · Rolle Kundschafter (Gegenprobe) · Stufe 1 · Kern-Version 0
Schreibrechte: `_relaunch/atlas/gegenprobe-2.md`
Umfang: unabhängige Gegenprobe des Altatlas an den übrigen 12 Abschnittsgruppen (zweite Gegenprobe, deckt zusammen mit P1-KUND-05 alle 24 Gruppen ab).

## Rollenbriefing
Du erfasst Seiten, Komponenten, Texte, Medien, Bewegungen und Metadaten vollständig mit Fundstelle. Häufige Fehler: nur die Navigation lesen und Seiten übersehen; zusammenfassen statt auflisten; Vermutung als Befund.

## Aufgabe in einem Satz
Erfasse die 12 gezogenen Abschnittsgruppen des Altstands selbst neu und prüfe, ob der vorhandene Altatlas jedes Element mit eigener Aufgabe enthält.

## Das Projekt in fünf Sätzen / Kern-Auszug / Quellen / Atlas-Format / Grenzen / Ausgabeformular
Siehe `_relaunch/pakete/_gemeinsam-p0.md` und `_relaunch/pakete/_gemeinsam-p1.md` – gelten wortgleich.

## Gezogene Gruppen (Pfade relativ zu `_relaunch/altstand/main/`)
1. Startseite – Hero (Badge, H1, Einleitung, USP-Kacheln, CTAs, Zitatkarte, Kennzahlen) (`app/page.tsx:150-305`)
2. Startseite – Stellenkarten #stellen (`app/page.tsx:316-545`)
3. Startseite – Vorteilskarten #benefits und Ausstattung #ausstattung (`app/page.tsx:566-684`)
4. Startseite – Bewertungen #bewertungen (`components/reviews/*`, `lib/data/reviews.data.ts`)
5. Startseite – Kontakt #kontakt + FAQ #faq + Schluss-CTA (`app/page.tsx:888-977`, `components/contact/*`)
6. Bewerbung – Checkliste (`components/BewerberCheckliste.tsx`)
7. Bewerbung – Quiz (`components/views/QuizView.tsx`)
8. Bewerbung – Tresor (`components/views/VaultView.tsx`)
9. Rahmen – Oberleiste und Kopf (`components/Header.tsx`)
10. Rahmen – Mobilmenü (`components/navigation/*`)
11. Rahmen – Fuß (`components/Footer.tsx`)
12. Recht – Datenschutz (`app/datenschutz/page.tsx`)

## Schritte
1. Lies für jede Gruppe zuerst NUR den Quelltext und die Altstand-Bildschirmfotos (`_relaunch/belege/p0-altstand/`, `_relaunch/.roh/p0-altstand/webp/`) und notiere eine eigene Liste aller Elemente mit eigener Aufgabe (Texte, Funktionen, Grafiken, Bewegungen, Vertrauens- und Rechtsangaben) mit Fundstelle. Öffne den Altatlas erst danach.
2. Gleiche deine Liste gegen `_relaunch/atlas/alt-start.md`, `alt-bewerbung.md`, `alt-shell-recht-seo.md` ab: Für jedes deiner Elemente die passende ALT-ID oder „FEHLT“.
3. Für jedes „FEHLT“: Kategorie, Fundstelle, Inhalt wörtlich und deine Einschätzung, ob es Muss/Soll/Kann wäre (Prioritätsregeln aus `_relaunch/pakete/_restaurator.md`).
4. Ausgabe `_relaunch/atlas/gegenprobe-2.md`: je Gruppe Tabelle (Eigenes Element · Fundstelle · ALT-ID oder FEHLT · Priorität bei FEHLT), dann Summe: geprüfte Elemente, gefunden, fehlend (davon Muss/Soll/Kann).

## Selbstprüfung
- Erst selbst erfasst, dann verglichen? Jede Gruppe vollständig?
- Markiere Unsicheres als OFFENE FRAGE statt zu raten, und erfülle nur deinen Auftrag.
=== ENDE P1-KUND-06 · BEREIT ZUR RÜCKGABE === (diese Zeile setzt du an das Ende deiner Antwort)
