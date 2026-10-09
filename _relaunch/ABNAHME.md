# Abnahme – Definition of Done (Auftrag Abschnitt 13)

Status: ☐ offen · ☑ mit Beleg erfüllt · AUSNAHME (nur nach L7, höchstens zwei; nie für Z-03, Z-05, Z-11)

| Z | Kriterium | Methode | Schwelle | Beleg | Status |
|---|---|---|---|---|---|
| Z-01 | Verlustatlas | Abgleich aller Quellen (main f2e7eae, 22 Commits, Live-Seite, Altstand-Build; Wayback nicht erreichbar → Nebelkarte) + Gegenprobe | Altseiten aus alter Sitemap, Routen und Wayback-CDX-Liste ohne Dubletten zu 100 % erfasst; Gegenprobe findet null übersehene Muss-/Soll-Elemente | VERLUSTLISTE.md mit Fundstellen | ☑ 09.10.2026 – VERLUSTLISTE.md (165 Pässe mit Fundstellen, 996 Atlaszeilen); Altseiten: alte Sitemap und Routen 100 % (9 Seiten/Ansichten), Wayback-CDX: Verfügbarkeits-API ohne Kopie (leer), archive.ph/Common Crawl vom Proxy abgewiesen (N-01, offen für einen Stand vor dem 06.10.); Gegenprobe: Z-01-Nachprüfung Runde 3 mit zwei frischen Kundschaftern 0 Muss/Soll, bestätigt von zwei Delta-Gegenprüfern (E-017) |
| Z-02 | Rückführung | Status je Element | 100 % Muss+Soll integriert oder belegt zurückgestellt; Zurückstellungen ≤ 10 % aller Elemente; Kann nach Ausbaustufe Voll (optional) | Bildpaar alt/neu je Element in belege/elemente/ | ☐ |
| Z-03 | Funktion | Ebene 2 | 100 % grün, Mutationsprobe bestanden, Logik bei ≥ 10 Eingaben gleich dem Altverhalten (wo Altstand lauffähig: Port 3600) | Testprotokoll | ☐ |
| Z-04 | Besucheraufgaben | Probeläufer + Fünf-Sekunden-Probe | 5 Aufgaben mobil/Desktop mit Touch, Maus, Tastatur lösbar; Schrittzahl ≤ Altstand; 0 Befunde „hoch“; frischer Agent nennt aus erstem Bildschirm jeder Hauptseite Angebot, Zielgruppe, nächsten Schritt | Protokoll | ☐ |
| Z-05 | Bestand | Ebene 1 | Build, Typen, Linter, vorhandene Tests mindestens wie P0 (927 Vitest grün, Guards grün, Build grün, Graph grün, E2E wie P0); 0 Konsolenfehler aus Plattformcode; Funktionsliste F-01…F-30 zu 100 % geprüft | Logs | ☐ |
| Z-06 | Suche | Ebene 7 | 100 % alter URLs/Anker: 200, passende 301/308 oder 410; Metadaten vollständig; 0 kaputte interne Links | Prüfliste meta.md | ☐ |
| Z-07 | Slop | Slop-Jäger über Grundmenge, alle Ansichten | 0 harte Befunde; weiche ≥ 80 % unter Ausgangswert, ≤ 2 je Hauptseite, jeder mit vom Gegenprüfer anerkannter Begründung aus der Leitidee | MESSUNGEN.md | ☐ |
| Z-08 | Jury | 3 Jury-Agenten nach Rubrik | je Hauptseite gewichteter Wert aus Medianen ≥ 8,0, keine Kategorie < 7,5; Blindvergleich ≥ 90 % Siege | MESSUNGEN.md | ☐ |
| Z-09 | Bewegung | Ebene 4 | jede Animation mit data-motion im Register; keine Layout-Animation außer Registerausnahmen; mobil 4× gedrosselt ≤ 5 % verworfene Frames, kein LoAF > 20 ms Skript aus Bewegungscode; reduzierte Bewegung ohne Positions-/Größenänderung, alles sichtbar; Pause-Knöpfe | Messprotokoll, Bildfolgen | ☐ |
| Z-10 | SVG | Ebene 8 | 100 % im Formsystem; Fixpunkt der SVGO-Konfiguration; 0 ID-Kollisionen; 100 % korrekte Zugänglichkeit; eine Icon-Familie; Budgets | svg.md | ☐ |
| Z-11 | Barrierefreiheit | Ebene 5 | 0 ernste/kritische axe-Befunde; Tastatur ohne Falle mit sichtbarem Fokus; Kontraste WCAG 2.2 AA; Reflow, Zoom, Textabstände, erzwungene Farben ohne Verlust | axe.md, tastatur.md | ☐ |
| Z-12 | Leistung | Ebene 6 | alle Budgets auf allen Hauptseiten; keine Seite schlechter als P0 jenseits Streuung (> 3 Punkte oder 10 % LCP) | lighthouse.md | ☐ |
| Z-13 | Darstellung | Ebene 3 | alle Seiten der Grundmenge in allen Ansichten (Sprache: nur Deutsch) ohne Überlauf, ohne abgeschnittenen/überlappenden Text | Screens + bericht.json | ☐ |
| Z-14 | Übergabe | Sichtprüfung frischer Gegenprüfer | BERICHT.md mit Galerie, KERN.md als Doku, MENSCHEN.md vollständig, Anleitung Zusammenführen/Zurückrollen | Dateien | ☐ |

Geltungsbereich: Z-05 und Z-11 gelten für alles, was der Lauf ändern darf. Vorbestehende Befunde in Unantastbarem, Geschäftslogik und Einbettungen dürfen nicht zunehmen und stehen mit Fundstelle in MENSCHEN.md.

## Phasentore
- **P0 (09.10.2026, bestanden):** Plattform läuft (Produktions-Build :3500, Altstand :3600) · Sicherung belegt (Ausgangsstand a83269d, Archive `_relaunch/sicherung/altstand-main-f2e7eae.tar.gz` und `ausgangsstand-a83269d.tar.gz`, lokal) · Messbasis vollständig: Bildschirmfotos (96 + 36), Lighthouse (Median aus 5), axe (110 Läufe), Tastatur/Reflow/Zoom/Textabstände/erzwungene Farben/ohne JS, Größen, Konsolenfehler, Slop hart und weich, SVG, Meta, Jury-Ausgangswert je Hauptseite. Belege: `MESSUNGEN.md`.
- **P1 (09.10.2026, bestanden):** Z-01 erfüllt (siehe Zeile Z-01). 165 Element-Pässe, 61 zu bauen (Muss 20 · Soll 35 · Kann 6), 9 zurückgestellt (5,5 %), jede Zurückstellung und Kann-Einstufung von frischen Gegenprüfern geprüft (gegenpruefung-p1.md, gegenpruefung-p1-delta.json). Belege: `VERLUSTLISTE.md`, `atlas/`, ENTSCHEIDUNGEN E-014, E-017.
