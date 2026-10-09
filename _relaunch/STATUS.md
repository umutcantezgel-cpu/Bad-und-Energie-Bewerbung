STATUS · Phase P0 · Welle 0/0 · Erfüllt 0/14 · Ausnahmen 0 · Elemente 0/? · Slop hart ? · Jury ? · Lighthouse mobil ? · axe ? · Puffer 100 % · Nächster Schritt: Messbasis des Ausgangsstands (P0 Schritt 3–5)

# Status · Rückführung und Veredelung

## Der Auftrag in drei eigenen Sätzen
1. Alles, was die Live-Karriereseite (Altstand `main` @ f2e7eae) für Bewerber und Betrieb leistete und beim Umbau zur Recruiting-Plattform (PR #1 + Supabase 2a) verloren ging oder schwächer wurde, kommt im Wesen zurück – neu gebaut in der Sprache der Plattform, ohne Alt-Code und ohne erfundene Inhalte.
2. Die gesamte Oberfläche wird aus einer einzigen Leitidee für Bad & Energie heraus neu gestaltet – Schrift, Raster, Farbe, Bewegung und SVG –, sodass sie unverwechselbar wird und den KI-Einheitslook messbar ablegt.
3. Jede Verbesserung wird gemessen (Slop, Jury, axe, Lighthouse, Bewegung, SVG), nichts Bestehendes darf brechen, und am Ende steht ein belegter Stand, der nach `main` und damit live geht.

## Einstellungen und Annahmen (leere Felder → Standard, plus Festlegungen des Auftraggebers)
| Einstellung | Wert | Herkunft |
|---|---|---|
| PROJEKTORDNER | /home/user/Bad-und-Energie-Bewerbung | Standard (aktueller Ordner) |
| Basis / Ausgangsstand | `claude/optimistic-turing-etjnl3` (264bf4e) + Merge 5f7f090 → Commit a83269d | Auftraggeber (Rückfrage 1) |
| ALTBESTAND | `main` @ f2e7eae (Git), lokal entpackt nach `_relaunch/altstand/main`; Git-Historie 9717265…f2e7eae | selbst gesucht |
| LIVE-ADRESSE | https://karriere.bad-energie.de (liefert derzeit den Altstand aus) | selbst gefunden |
| Archivkopien | Wayback/archive.ph/Common Crawl vom Proxy abgewiesen; Wayback-Verfügbarkeits-API: keine Kopien für karriere.bad-energie.de | geprüft 09.10.2026 |
| BEKANNTE VERLUSTE | keine angegeben – Lauf findet sie | Standard |
| MARKE | abgeleitet, als Annahme markiert (folgt in KERN K-002) | Standard |
| GESCHMACK | keine | Standard |
| WÜNSCHE | verbindliche Inhaberentscheidungen aus docs/ROADMAP.md §1 (keine KI, keine Fotos/Stock, nur belegte Fakten, Gehälter sichtbar, Karte+Pendelrechner, Mappe, Bewertungsband bleiben) | aus Basis abgeleitet |
| UNANTASTBAR | Logo (Form, Proportion, Farben), Inhalte von Rechts- und Fließtexten, Geschäftslogik (Bewerbungs-Intake, Sicherheit, Supabase) | Standard |
| UMFANG | ganze Plattform | Standard |
| AUSBAUSTUFE | Voll (2–3 Signaturmomente) | Standard |
| GESTALTUNGSMUT | ausgeprägt | Standard |
| TEXTE | Mikrotexte direkt, alles andere als Vorschlag | Standard |
| FREIGABE | ja – Halt nach P2 | Standard |
| PARALLELITÄT | 5 | Standard |
| BRANCH | `claude/kind-ride-n9duod` (Vorgabe der Umgebung) | Umgebung |
| PUSH UND VERÖFFENTLICHUNG | Push nach jeder Welle auf BRANCH, Vercel-Vorschau erlaubt; nach ABSCHLUSS Merge nach `main` (live) | Auftraggeber (Rückfrage 2) – überschreibt „nie“ |
| _relaunch | wird mitcommittet; Bilder optimiert (WebP), Rohdaten lokal | Auftraggeber (Rückfrage 3) |
| ANSICHTEN | 375×812 · 768×1024 · 1440×900 · 1920×1080 | Standard |
| BUDGETS | wie Auftrag Abschnitt 0 | Standard |
| BERICHTE | Morgenbericht 07:00 Europe/Berlin | Standard, Zeitzone angenommen |

## Sicherung
- Altstand-Archiv: `_relaunch/sicherung/altstand-main-f2e7eae.tar.gz` (lokal)
- Ausgangsstand-Archiv: `_relaunch/sicherung/ausgangsstand-a83269d.tar.gz` (lokal)
- Ausgangsstand-Commit: a83269d (Merge von 5f7f090 auf 264bf4e); auf origin bereits vorhanden: 264bf4e, 5f7f090
- Kein vorgefundener, nicht committeter Stand (Arbeitsbaum war sauber).

## Protokoll (stündlich)
- 2026-10-09 09:14 CEST · P0 gestartet, Sicherung erstellt, Basis hergestellt (a83269d).
