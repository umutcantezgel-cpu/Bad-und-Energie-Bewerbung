# E3-PRUEFER-05 · Leistung der Startseite am Endstand (Z-08)

Stand 2026-10-16, Messung 11:33 (UTC) am Produktions-Server http://127.0.0.1:3511 (`bunx next start -p 3511`, next-server 16.3.8, kein Entwicklungsserver). Vorher: E0, Messung 10:37 (Ausgangswerte). Gemessen: Startseite, 1440 × 900, drei Läufe mit neuem Browserkontext je Lauf, Median aus drei Läufen. Werkzeug: `_werkstatt/nennung/werkzeuge/netz.mjs`, einmal ausgeführt.

Sichtbar auf der Seite hat sich in diesem Schritt nichts geändert. Gemessen wird der Stand, der jetzt ausgeliefert wird.

## Ergebnis

| Wert | Vorher (E0) | Nachher (E3e) | Messart | Schwelle | Ergebnis |
|---|---|---|---|---|---|
| Anfragen Startseite, Median | 38 | 38 | netz.mjs, CDP Network.requestWillBeSent | null neue Anfragen | grün |
| Anfragen je Lauf | 38 / 38 / 38 | 38 / 38 / 38 | netz.mjs | (Info) | grün |
| Neue Anfrage-URLs (normalisiert, mit Status) | · | 0 | Vergleich, Chunk-Namen, Media und `_rsc` normalisiert | 0 | grün |
| Wegfallende Anfrage-URLs (normalisiert) | · | 0 | Vergleich | (Info) | grün |
| Anfragen je Typ | Document 1, Font 3, Stylesheet 4, Script 16, Image 3, Fetch 11 | gleich in allen 3 Läufen | netz.json | keine Abweichung | grün |
| Transfer komprimiert, Median | 554 107 Byte (541,1 KB) | 551 819 Byte (538,9 KB) | CDP encodedDataLength, Median aus 3 Läufen | höchstens +1 024 Byte | grün (Differenz −2 288 Byte) |
| Transfer je Lauf | 554 107 / 552 779 / 554 109 Byte | 551 819 / 551 819 / 556 596 Byte | CDP | (Info) | grün |
| Zusatz: Transfer ohne Prefetch `/bewerbung?_rsc=` je Lauf | 551 055 Byte (in allen 3 Läufen gleich) | 551 819 Byte (in allen 3 Läufen gleich) | CDP, Summe ohne diese eine Anfrage | höchstens +1 024 Byte | grün (Differenz +764 Byte) |
| Layoutverschiebung je Lauf | 0,0000 / 0,0000 / 0,0000 | 0,0000 / 0,0000 / 0,0000 | layout-shift bis 5 s nach load, ohne Nutzereingabe | nicht schlechter als E0-Spanne (0,0000 bis 0,0000) | grün |
| Verschiebungen (Anzahl) | 0 je Lauf | 0 je Lauf | layout-shift | (Info) | grün |
| Anfragen an codayweb.de | 0 | 0 je Lauf | netz.json, Host-Prüfung | 0 | grün |
| Fremdhost-Anfragen gesamt | 0 | 0 | netz.json | (Info) | grün |
| Abgebrochene Anfragen (ERR_ABORTED, Prefetch `/bewerbung?_rsc=`) | 1 / 1 / 1 | 2 / 2 / 0 | netz.json | keine Schwelle | Info |
| load, Median | 270 ms (259 bis 273) | 256 ms (242 bis 263) | netz.mjs | keine Schwelle | Info |

Gesamtergebnis: alle Schwellen grün. Kein roter Wert.

## Anfragen im Vergleich

- Normalisierung wie in `protokolle/leistung.md`: Dateinamen unter `/_next/static/chunks/` und `/_next/static/media/` werden durch `*` ersetzt, `?_rsc=…` ebenfalls.
- Vereinigung der normalisierten Anfrage-URLs (mit Status) über drei Läufe: E0 13 Schlüssel, E3e 13 Schlüssel, neu 0, wegfallend 0.
- Das Logo-Bild (`/_next/image?url=…`) hat in E0 und E3e denselben Dateinamen.
- Der Stylesheet-Name `1svxpaovy1p_v.css` aus E3c ist in der jetzt ausgelieferten Startseite enthalten. Der ausgelieferte Build entspricht also dem in E3c gemessenen.

## Zur Transfergröße

- Die Schwankung zwischen den Läufen kommt allein vom Prefetch `/bewerbung?_rsc=`. Ist er abgebrochen, fehlen rund 1,7 bis 3,1 KB. Ist er vollständig geladen, kommen sie dazu (E3e Lauf 3: 1 723 + 3 054 Byte).
- Ohne diese Anfrage ist die Basis je Lauf konstant: E0 551 055 Byte, E3e 551 819 Byte, also +764 Byte.

## Belegpfade

- Endstand, Rohdaten: /home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/protokolle/roh/e3e/netz.json und netz.md
- Vorher: /home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/protokolle/roh/e0/netz.json und netz.md
- Vergleich mit E3c: /home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/protokolle/leistung.md
- Ausgangswerte: /home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/berichte/E0-PRUEFER-02.md

## Offene Fragen

1. Gilt die Grenze von +1 024 Byte für den Median oder für jeden Einzellauf? Hier gewertet: Median, wie in `leistung.md` und im Briefing. Lauf 3 liegt mit 556 596 Byte 2 489 Byte über dem E0-Median. Bei einer Einzellauf-Grenze wäre das rot. Bitte entscheiden.
2. Ursache für die schwankende Prefetch-Anfrage `/bewerbung?_rsc=` (abgebrochen oder vollständig) ist nicht geprüft. Keine Schwelle betroffen.
3. Die Zuordnung Build zu Commit 66d8d99 ist nicht unabhängig belegt. Belegt ist: Die Pfade `app`, `components`, `lib`, `styles`, `next.config.ts`, `package.json` und `bun.lock` sind zwischen 66d8d99 und HEAD (0d93854) unverändert und im Arbeitsbaum nicht geändert. Die ausgelieferte Seite enthält `aria-describedby="agentur-neuer-tab"` aus 66d8d99. `.next/BUILD_ID` ist `SS4lRHDMhqY5Bn7nDG_5` (11:06:37). Der Server ist seit 11:23:16 gestartet.
4. Das Serverlog meldet: „next start“ passt nicht zu „output: standalone“ (`/tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/server-3511-c.log`). Der Server antwortet mit 200. Der Einfluss ist nicht geprüft (wie E0-Frage 5 und E3c-Frage 2).

## Selbstprüfung

- Mengen: 3 Läufe, 38 Anfragen je Lauf (114 gesamt), 6 Typen, 13 normalisierte URL-Schlüssel je Seite, 0 neue und 0 wegfallende, 0 Anfragen an codayweb.de, 0 Fremdhost-Anfragen.
- Schreibrechte: geschrieben nur `protokolle/leistung-endstand.md` und `protokolle/roh/e3e/` (`netz.json` und `netz.md`, vom Werkzeug angelegt). Der Vergleich lief inline ohne Skriptdatei. Eine versehentlich angelegte Prüfdatei im Scratchpad wurde wieder gelöscht.
- Nicht ausgeführt: kein Projektcode, kein Werkzeug geändert, kein Server gestartet, kein Build, keine Testsuite, kein Commit, kein Push.
