# P1-REST-02 · Rolle Restaurator · Stufe 2 · Kern-Version 0
Schreibrechte: `_relaunch/atlas/paesse-bewerbung.md`
Umfang: Abgleich Altstand-Bewerbungsseite (alle Tabs) ↔ Ausgangsstand und Element-Pässe für alle verlorenen, geschwächten oder verschobenen Elemente von /bewerbung (Hub, Checkliste, Quiz, Tresor, Formular, A4-Dossier).

## Briefing, Grundsätze, Format
`_relaunch/pakete/_gemeinsam-p0.md`, `_relaunch/pakete/_gemeinsam-p1.md`, `_relaunch/pakete/_restaurator.md` – gelten wortgleich.

## Aufgabe in einem Satz
Ordne jede Zeile von `_relaunch/atlas/alt-bewerbung.md` dem Ausgangsstand zu (`_relaunch/atlas/neu-plattform.md` und Code) und schreibe die Element-Pässe der Bewerbungsstrecke.

## Schritte
1. Lies `_relaunch/atlas/alt-bewerbung.md` vollständig und – sobald vorhanden und vollständig – `_relaunch/atlas/neu-plattform.md` (Neuatlas wird parallel erstellt; maßgeblich ist der Code des Ausgangsstands; Bereiche NEU-BEW, NEU-DANKE, NEU-MAPPE, NEU-STELLEN soweit eingebetteter Flow).
2. Lies im Ausgangsstand `app/bewerbung/**`, `components/apply/**`, `components/mappe/**`, `lib/apply/*`, `lib/applications/*` (nur Struktur), `lib/mappe/*`, `app/api/bewerbung/**`, `docs/ROADMAP.md` §1, §6, §8 (Uploads Phase 2), `docs/operations/fakten-abgleich.md`, und `supabase/` nur zur Frage, ob Uploads vorbereitet sind (Bucket `application-files`).
3. Abgleich je Atlaszeile: unverändert · verschoben (wohin) · geschwächt (was fehlt) · verloren.
4. Element-Pässe (Bereich `BEW`, ab 001). Pflicht-Kandidaten: Vier-Wege-Hub („Weg A/Weg B“, Gateway-Karten); Bewerber-Checkliste mit Vollständigkeits-Gauge; Quiz mit Fachrichtung/Status/Kenntnissen und Anschreiben-Vorlage; Dokumenten-Tresor (Upload Lebenslauf/Zeugnisse/Foto – im Altstand nur vorgetäuscht: Wesen ist „Unterlagen einreichen können“; braucht Serverlogik → Schnittstelle in der Architektur von Phase 2a, Attrappe, Rest in MENSCHEN); Formular mit Feldern; A4-Dossier mit Druck, WhatsApp-Teilen, Absenden; Erfolgsmoment (Konfetti → Wesen: Rückmeldung/Bestätigung); Tab-Glow und Ansichtswechsel-Bewegung; `?tab=`/`?direct=`-Parameter (Bindung: eingehende Links); BDSG-Vertraulichkeitshinweis; Regionalleiste.
5. Wo unklar ist, ob verloren oder nur verschoben: Feld „Unsicherheit“ ausfüllen.

## Selbstprüfung
- Zuordnungsprüfung geht auf (jede Atlaszeile genau einmal)? Kein erfundener Inhalt als Wesenskern?
- Markiere Unsicheres als OFFENE FRAGE statt zu raten, und erfülle nur deinen Auftrag.
=== ENDE P1-REST-02 · BEREIT ZUR RÜCKGABE === (diese Zeile setzt du an das Ende deiner Antwort)
