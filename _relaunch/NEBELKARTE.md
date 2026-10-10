# Nebelkarte – gesichert · angenommen · unbekannt · riskant

Sortiert nach Wirkung × Unsicherheit (W × U, je 1–3). Jede Zeile hat eine Lichtungsaufgabe (L) oder Gegenmaßnahme (G).

| # | Art | Aussage | W×U | Lichtung / Gegenmaßnahme | Stand |
|---|---|---|---|---|---|
| N-01 | unbekannt | Gab es vor dem 06.10.2026 einen älteren, nicht versionierten Stand der Karriereseite (Beleg: `.jules/state-summary.json`, H1 „Kein Bock mehr auf veraltetes Werkzeug …“)? Wayback/archive.ph/Common Crawl vom Proxy abgewiesen, Wayback-API: keine Kopien | 3×3 | L: P1 – .jules, docs/prompts 18–21 und Git-Historie auswerten; was nicht belegbar ist, bleibt offen und steht in MENSCHEN.md (Frage nach Prompts 1–17 / AI-Studio-Projekt) | offen |
| N-02 | riskant | Inhaberentscheidung „ruhig, typografisch, Apple-Stil, keine Fotos“ (ROADMAP §4) gegen Auftrag „Awwwards, Bewegung, Handschrift“ | 3×3 | G: Richtungen respektieren „keine Fotos“; Charakter aus Schrift, SVG, Bewegung; Geschmacksabnahme am Freigabepunkt | offen |
| N-16 | riskant | Jury wertet fehlende Fotos/Menschen ab: alle sechs Juroren der Stilkacheln (Runde 1) nennen „kein echtes Bildmaterial, keine Menschen“ als größte Schwäche; Inhalt 6,7–7,5. Z-08 verlangt keine Kategorie < 7,5 – mit der Inhaberentscheidung „keine Fotos“ (K-014) kann Inhalt strukturell darunter bleiben | 3×3 | G: (1) Inhalt über Echtheit heben: echte Namen und Rollen (Sabri Demir, Teamzitate), belegte Zahlen, konkrete Ausstattung, Einsatzorte; Illustrationen aus dem Formsystem als gleichwertiges Bildmaterial. (2) Offene Frage an den Auftraggeber in der Freigabe-Übersicht: echte Fotos von Team, Werkstatt, Fahrzeugen (kein Stock) zulassen? (3) Bleibt es bei „keine Fotos“ und Inhalt < 7,5 nach drei belegten Anläufen: AUSNAHME nach L7 mit Denkprotokoll für die Kategorie Inhalt, nicht für Z-08 als Ganzes | offen |
| N-17 | riskant | Geschmack des PUBLIKUMS (Chef) unbekannt; bisher nur Farben (E-016) und Richtungswunsch (E-019) bekannt | 3×2 | G: drei Steigerungsvarianten am Freigabepunkt, Wow-Probe mit Vertrauen, ruhige Fassung | offen |
| N-18 | riskant | Steigerung frisst Leistung (WebGL, Hauptmomente) bei LCP mobil schon über Budget (N-14) | 3×3 | G: Budgets je Paket, WebGL nur nachgeladen nach load im Leerlauf, Messung nach jeder Welle, Zielreserve LCP ≤ 2,2 s | offen |
| N-19 | riskant | Gerät/Netz bei der Vorführung; WebKit im Container nicht installiert (kein `playwright install`) | 3×2 | G: A-10 mit Drosselung in Chromium, WebKit-Probe als MENSCHEN-Eintrag, Generalprobe am echten iPhone/Android, Aufzeichnungen als Rückfall | offen |
| N-20 | riskant | Kontingent: nur Opus und Haiku (E-020) verbrauchen das Sitzungslimit schneller; heute zwei Limits | 2×3 | G: Bündeln, Haiku für Breite, Resume aus Cache, `send_later` auf Reset-Zeit, Kapazität je Limitfenster in L0 | offen |
| N-21 | Vorab-Scheitern | „Feuerwerk ohne Geschichte“: Drehbuch hat mehr Effekte als Akte · „Glanzpfad, schwache Ränder“: Seiten abseits des Pfads fallen ab | 3×2 | G: Rhythmus ein Haupt-, höchstens zwei Nebenmomente; A-05-Stichprobe vor neuen Hauptmomenten | offen |
| N-03 | riskant | Design-Guard (`check-design-tokens.mjs`) verbietet uppercase, mono, laute Animation – neue Gestaltung braucht Guard-Erweiterung | 3×2 | G: Guard nur gemeinsam mit theme.css und ROADMAP §4 ändern, per Denkprotokoll, nie lockern (G7) – neue erlaubte Werte werden Tokens | offen |
| N-04 | riskant | Logo wird im Dunkelmodus per CSS-Filter weiß gefärbt (G8-Verstoß in der Basis) | 2×1 | G: P3/P4 Original auf heller Plakette; M-004 | gesichert erkannt |
| N-05 | unbekannt | Brauchten alte Funktionen Serverlogik, die fehlt (Upload-Tresor, Kontaktformular `/api/contact`)? | 3×2 | L: Funktionsanalyse im Element-Pass (P1); 2a hat Storage-Bucket `application-files` (nicht angewandt) | offen |
| N-06 | riskant | Suchverlust durch verschwundene URLs/Anker (`/bewerbung?tab=*`, `#gehalt`, `#kontakt` …) | 2×2 | G: Z-06, meta.mjs mit Alt-URL-Liste; Anker-Aliase | offen |
| N-07 | riskant | Richtung trifft die Marke nicht | 3×2 | G: drei Stilkacheln, Jury, Freigabe | offen |
| N-08 | riskant | Recht/Datenschutz bei Schriften, Einbettungen, Tracking | 3×1 | G: Schriften selbst gehostet (next/font/local), nichts Neues von Dritten, Google Maps bleibt Zwei-Klick | offen |
| N-09 | riskant | Lighthouse mobil der Basis laut PR 79–96 | 2×2 | G: P0-Messung; Budget je Paket; „Prächtig, aber träge“-Frühwarnung | offen |
| N-10 | riskant | Parallele Supabase-Session ändert dieselben Dateien | 2×2 | G: Dateihoheit – `supabase/`, `lib/supabase/`, künftiges `/admin` nie anfassen; vor Merge main einmergen | offen |
| N-11 | riskant | Produktions-Merge ohne Vercel-Variablen → Bewerbungen 503 | 3×2 | G: Gate in P7, M-001 | offen |
| N-12 | angenommen | Unbelegte Fakten (fakten-abgleich B1–B26) werden nicht neu ausgespielt | 2×1 | G: nur `lib/content/facts.ts` ohne `pending` | gesichert |
| N-14 | unbekannt | Warum liegt der simulierte LCP mobil bei 2,6–3,1 s, obwohl TTFB 16 ms und die beobachtete Renderverzögerung 157 ms betragen? LCP-Element ist Text der H1 (`span.text-ink-muted`). Vermutung: Lantern rechnet alle Anfragen vor dem beobachteten LCP ein (JS-Chunks, Schrift-Swap) – Ausgangs-LCP hängt am Schrift- und JS-Pfad | 3×2 | L: P3-Lichtungspaket – Lighthouse-Trace auswerten, Varianten messen (Schrift preload/`font-display`, kritisches CSS, LCP-Text ohne Abhängigkeit vom Hydrations-JS); Z-12 hängt daran | offen |
| N-15 | unbekannt | Vorteils-Konfigurator (E-START-024): Neu interpretieren (2 Urteile) oder bereits durch Stellenseiten-„Dein Paket“ abgedeckt (1 Urteil)? | 2×2 | L: Richtungswahl P2 – die gewählte Richtung zeigt eine interaktive Paketansicht nur, wenn sie die Besucheraufgabe 1/4 messbar besser löst; sonst Rückfall auf „Dein Paket“ mit Hinweis in MENSCHEN | offen |
| N-13 | gesichert | Altstand ist lokal lauffähig (Port 3600) → Altverhalten testbar | – | – | gesichert |

## Vorab-Scheitern – Frühwarnzeichen → Gegenmaßnahme
- „Prächtig, aber träge“: Lighthouse fällt nach einer Welle um > 3 Punkte → Welle anhalten, Ursache beheben, Budget je Paket.
- „Effektfeuerwerk“: Bewegungsregister wächst schneller als fertige Seiten → Zurückhaltung, Einträge streichen.
- „Fremdkörper“: Jury/Blindvergleich markieren ein zurückgeführtes Element als Bruch → nach KERN neu interpretieren.
