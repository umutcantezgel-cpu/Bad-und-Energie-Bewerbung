# P1-KUND-01 · Rolle Kundschafter · Stufe 1 · Kern-Version 0
Schreibrechte: `_relaunch/atlas/alt-start.md`
Umfang: Altatlas der Altstand-Startseite `/` vollständig, Abschnitt für Abschnitt.

## Rollenbriefing
Du erfasst Seiten, Komponenten, Texte, Medien, Bewegungen und Metadaten vollständig mit Fundstelle. Häufige Fehler: nur die Navigation lesen und Seiten übersehen; zusammenfassen statt auflisten; Vermutung als Befund.

## Aufgabe in einem Satz
Erfasse jedes Element der Altstand-Startseite (main @ f2e7eae) im Atlas-Format mit Fundstelle.

## Das Projekt in fünf Sätzen / Kern-Auszug / Quellen / Atlas-Format / Grenzen / Ausgabeformular
Siehe `_relaunch/pakete/_gemeinsam-p0.md` und `_relaunch/pakete/_gemeinsam-p1.md` – gelten wortgleich.

## Schritte
1. Lies `_relaunch/altstand/main/app/page.tsx` vollständig (982 Zeilen) und jede dort importierte Komponente vollständig: `components/HeroExpressFunnel.tsx`, `components/trust/TrustStrip.tsx`, `components/trust/ProcessSteps.tsx`, `components/pricing/SalaryCalculator.tsx` + `pricing.constants.ts`, `components/maps/InteractiveMap.tsx` (+ `lib/maps/*`, `lib/data/locations.ts`), `components/reviews/KineticReviewCarousel.tsx`, `ReviewCard.tsx`, `GoogleReviewsBadge.tsx`, `lib/data/reviews.data.ts`, `components/seo/AIAnswerBox.tsx`, `components/contact/DirectContactCard.tsx`, `components/contact/LeadQuickForm.tsx`, plus die Daten am Kopf von `page.tsx`.
2. Lege `ALT-START-*`-Zeilen in Seitenreihenfolge an – mindestens je eine Zeile für: Hero (Badge, H1, Einleitung, USP-Kacheln einzeln, CTAs einzeln, Zitatkarte Demir, Meilenstein-2026-Text, Kennzahlen), Express-Funnel (jeder Schritt, Optionen, Erfolgszustand, Konfetti), Trust-Leiste (jeder Eintrag), jede Stellenkarte (Titel, Untertitel, Stichpunkte, Kennzeichen, CTA), Karriere-Paket/Vorteils-Rechner (Rollen, Erfahrungsstufen, Zusatzoptionen, Ausgaben, CTA), jede Vorteilskarte, jede Ausstattungskarte, Wechselprozess (jeder Schritt, CTA-Leiste), Einsatzgebiet (Orts-Pillen, Hub-Karte, Kartenmodi Porzellan/Satellit/Midnight, Radius 15/25/35, Anfahrtsrechner, Radar, Infokarten), Bewertungen (Badge-Werte, Filter, Bahnen, Steuerung, jede Bewertung mit Name/Kurztext), AIAnswerBox, Kontakt (Direktkontakt-Karte, Formularfelder, Einwilligung, Erfolgs-/Fehlertexte), FAQ (jede Frage wörtlich), Schluss-CTA.
3. Ergänze je Element Bewegung (motion-Aufrufe, CSS-Animationen, ping/pulse) und SVG (inline-SVG, Icons mit lucide-Namen).
4. Öffne die Altstand-Startseite im Browser (d1440 und m375, Port 3600, User-Agent siehe Quellen) nur, um Zuordnung zu Bildschirmfotos zu prüfen; nenne in Spalte Bild den passenden Ausschnitt-Pfad aus `_relaunch/belege/p0-altstand/` oder `_relaunch/.roh/p0-altstand/webp/` (falls noch nicht vorhanden: „–“).
5. Am Ende der Datei: Zählung der Zeilen je Kategorie und eine Liste aller Anker-IDs (`id="…"`) der Seite.

## Selbstprüfung
- Ist jede `<section>` in `page.tsx` mit mindestens einer Zeile vertreten? Jede FAQ-Frage? Jede Bewertung?
- Jede Zeile hat eine Fundstelle mit Zeilennummern?
- Markiere Unsicheres als OFFENE FRAGE statt zu raten, und erfülle nur deinen Auftrag.
=== ENDE P1-KUND-01 · BEREIT ZUR RÜCKGABE === (diese Zeile setzt du an das Ende deiner Antwort)
