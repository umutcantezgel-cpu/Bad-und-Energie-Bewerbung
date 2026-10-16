# E3-PRUEFER-03 · Leistung der Startseite nach der Nennung

Stand 2026-10-16. Vorher: E0, Messung 10:37 (Build a4491d5, Ausgangswerte). Nachher: Messung 11:01 am Produktions-Server http://127.0.0.1:3511 (`next start`, kein Entwicklungsserver). Die ausgelieferte Startseite enthält die Agenturnennung im Footer. Gemessen: Startseite, 1440 × 900, drei Läufe mit neuem Browserkontext je Lauf, Median aus drei Läufen.

Sichtbar auf der Seite hat sich in diesem Schritt nichts geändert. Gemessen wird der Stand, der die Nennung bereits ausliefert.

## Ergebnis

| Wert | Vorher (E0) | Nachher (E3c) | Messart | Schwelle | Ergebnis |
|---|---|---|---|---|---|
| Anfragen Startseite, Median | 38 | 38 | netz.mjs, CDP Network.requestWillBeSent | null neue Anfragen | grün |
| Anfragen je Lauf | 38 / 38 / 38 | 38 / 38 / 38 | netz.mjs | (Info) | grün |
| Neue Anfrage-URLs (normalisiert) | · | 0 | Vergleich, Chunk-Namen und `_rsc` normalisiert | 0 | grün |
| Wegfallende Anfrage-URLs (normalisiert) | · | 0 | Vergleich | (Info) | grün |
| Anfragen je Typ (Lauf 1, alle Läufe gleich) | Document 1, Font 3, Stylesheet 4, Script 16, Image 3, Fetch 11 | gleich | netz.mjs | null Abweichung | grün |
| Transfer komprimiert, Median | 554 107 Byte (541,1 KB) | 553 423 Byte (540,5 KB) | CDP encodedDataLength | höchstens +1 024 Byte | grün (Differenz −684 Byte) |
| Transfer je Lauf | 541,1 / 539,8 / 541,1 KB | 538,8 / 540,5 / 541,7 KB | CDP | (Info) | grün |
| Layoutverschiebung je Lauf | 0,0000 / 0,0000 / 0,0000 | 0,0000 / 0,0000 / 0,0000 | layout-shift bis 5 s nach load, ohne Nutzereingabe | nicht schlechter als Spanne E0 (0,0000 bis 0,0000) | grün |
| Verschiebungen (Anzahl) | 0 je Lauf | 0 je Lauf | layout-shift | (Info) | grün |
| Anfragen an codayweb.de | 0 | 0 je Lauf | netz.json, Host-Prüfung | 0 | grün |
| Fremdhost-Anfragen gesamt | 0 | 0 | netz.json | (Info) | grün |
| Abgebrochene Anfragen (ERR_ABORTED, Prefetch `/bewerbung?_rsc=`) | 1 je Lauf | 2 / 1 / 1 | netz.json | keine Schwelle | Info, dieselbe URL wie in E0 |
| load, Median | 270 ms (259 bis 273) | 242 ms (233 bis 273) | netz.mjs | keine Schwelle | Info |

Gesamtergebnis: alle Schwellen grün. Kein roter Wert.

## Anfragen im Vergleich

- Normalisierung: Dateinamen unter `/_next/static/chunks/` und `/_next/static/media/` werden durch `*` ersetzt, `?_rsc=…` ebenfalls.
- Die Chunk-Namen ändern sich mit dem Build (z. B. E0 `2491gjvs2tjrf.css`, nachher `1svxpaovy1p_v.css`; E0 `14brvdxsr8o6c.js`, nachher `0p9v9sd4q-w8j.js`). Anzahl und Typ bleiben gleich.
- Die Vereinigung der normalisierten Anfrage-URLs über drei Läufe ist in E0 und in E3c identisch. Neue Anfragen: keine.

## Belegpfade

- Nachher: /home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/protokolle/roh/e3c/netz.json und netz.md
- Vorher: /home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/protokolle/roh/e0/netz.json und netz.md
- Ausgangswerte: /home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/berichte/E0-PRUEFER-02.md
- Vergleichsskript (Scratchpad): /tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/vergleich/vergleich.mjs
- Ausgelieferte Startseite (Scratchpad): /tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/start-e3c.html

## Offene Fragen

1. Der Build-Stand des laufenden Servers ist nicht unabhängig bestätigt. Projekt-HEAD ist aa4931b. `.next/BUILD_ID` ist `IjLcoD1fcpOLQBrlEBy8j` (10:45). Belegt ist nur: Die ausgelieferte Startseite enthält die Nennung, und die Chunk-Namen weichen von E0 ab. Ob der Build exakt b0ae185 ist, habe ich nicht geprüft.
2. Das Serverlog meldet: „next start“ passt nicht zu „output: standalone“ (`/tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/server-3511-b.log`). Das ist dieselbe Frage wie E0-Frage 5; der Einfluss auf die Werte ist nicht geprüft.
3. Die Abbrüche des Prefetch (ERR_ABORTED) schwanken zwischen einem und zwei je Lauf. Keine Schwelle betroffen; die Ursache ist nicht geprüft.

## Selbstprüfung

- Mengen: 3 Läufe, 38 Anfragen je Lauf, 6 Typen, 2 Vergleichsdateien, 0 neue und 0 wegfallende normalisierte URLs, 0 Anfragen an codayweb.de.
- Schreibrechte: geschrieben nur leistung.md und roh/e3c/ (netz.json, netz.md, vom Werkzeug angelegt). Das Vergleichsskript liegt im Scratchpad. Kein Projektcode, kein Werkzeug, kein Server, kein Build, keine Testsuite, kein Commit.
