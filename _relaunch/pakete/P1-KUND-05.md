# P1-KUND-05 · Rolle Kundschafter (Gegenprobe) · Stufe 1 · Kern-Version 0
Schreibrechte: `_relaunch/atlas/gegenprobe.md`
Umfang: unabhängige Gegenprobe des Altatlas an 12 zufällig gezogenen Abschnittsgruppen (≥ 20 % von 24 Gruppen; Seed 20261009).

## Rollenbriefing
Du erfasst Seiten, Komponenten, Texte, Medien, Bewegungen und Metadaten vollständig mit Fundstelle. Häufige Fehler: nur die Navigation lesen und Seiten übersehen; zusammenfassen statt auflisten; Vermutung als Befund.

## Aufgabe in einem Satz
Erfasse die 12 gezogenen Abschnittsgruppen des Altstands selbst neu und prüfe, ob der vorhandene Altatlas jedes Element mit eigener Aufgabe enthält.

## Das Projekt in fünf Sätzen / Kern-Auszug / Quellen / Atlas-Format / Grenzen / Ausgabeformular
Siehe `_relaunch/pakete/_gemeinsam-p0.md` und `_relaunch/pakete/_gemeinsam-p1.md` – gelten wortgleich.

## Gezogene Gruppen (Pfade relativ zu `_relaunch/altstand/main/`)
1. Startseite – Express-Funnel (alle Schritte, Erfolg) (`components/HeroExpressFunnel.tsx`)
2. Startseite – Trust-Leiste (`components/trust/TrustStrip.tsx`)
3. Startseite – Vorteils-Konfigurator #karriere-paket (`components/pricing/SalaryCalculator.tsx + pricing.constants.ts`)
4. Startseite – Wechselprozess #wechsel-prozess (`app/page.tsx:687-718 + components/trust/ProcessSteps.tsx`)
5. Startseite – Einsatzgebiet #einsatzgebiet inkl. Karte (`app/page.tsx:721-860 + components/maps/InteractiveMap.tsx`)
6. Bewerbung – Hub mit Gateway-Karten und Regionalleiste (`app/bewerbung/page.tsx:231-429`)
7. Bewerbung – Formular (`components/views/FormView.tsx`)
8. Bewerbung – A4-Dossier (`components/views/PrintA4View.tsx`)
9. Rahmen – Schwebende Widgets und Cookie-Banner (`components/QuickApplySidebar.tsx, components/contact/FloatingWhatsAppWidget.tsx, components/ui/BackToTop.tsx, components/CookieConsent.tsx`)
10. Recht – Impressum (`app/impressum/page.tsx`)
11. SEO – Metadaten und JSON-LD (`app/layout.tsx`)
12. Rahmen – 404 und Fehlerseiten (`app/not-found.tsx, app/error.tsx, app/global-error.tsx`)

## Schritte
1. Lies für jede Gruppe zuerst NUR den Quelltext und die Altstand-Bildschirmfotos (`_relaunch/belege/p0-altstand/`, `_relaunch/.roh/p0-altstand/webp/`) und notiere eine eigene Liste aller Elemente mit eigener Aufgabe (Texte, Funktionen, Grafiken, Bewegungen, Vertrauens- und Rechtsangaben) mit Fundstelle. Öffne den Altatlas erst danach.
2. Gleiche deine Liste gegen `_relaunch/atlas/alt-start.md`, `alt-bewerbung.md`, `alt-shell-recht-seo.md` ab: Für jedes deiner Elemente die passende ALT-ID oder „FEHLT“.
3. Für jedes „FEHLT“: Kategorie, Fundstelle, Inhalt wörtlich und deine Einschätzung, ob es Muss/Soll/Kann wäre (Prioritätsregeln aus `_relaunch/pakete/_restaurator.md`).
4. Ausgabe `_relaunch/atlas/gegenprobe.md`: je Gruppe Tabelle (Eigenes Element · Fundstelle · ALT-ID oder FEHLT · Priorität bei FEHLT), dann Summe: geprüfte Elemente, gefunden, fehlend (davon Muss/Soll/Kann).

## Selbstprüfung
- Erst selbst erfasst, dann verglichen? Jede Gruppe vollständig?
- Markiere Unsicheres als OFFENE FRAGE statt zu raten, und erfülle nur deinen Auftrag.
=== ENDE P1-KUND-05 · BEREIT ZUR RÜCKGABE === (diese Zeile setzt du an das Ende deiner Antwort)
