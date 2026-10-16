# E0-PRUEFER-01 · Werkzeuge eingerichtet

Rolle Prüfer · Arbeitsmodell · Bericht wie zurückgegeben, abgelegt durch den Orchestrator (der Prüfer durfte nur die Werkzeugdateien schreiben).

## BEFUNDE
- Selektoren passen zum Arbeitsstand: Die Nennung trägt `data-agentur-nennung` (components/site/fuss/AgenturNennung.tsx), darin liegt der Link mit sr-only-Zusatz `NEUER_TAB`. Der Fuß ist ein `<footer>` (FussVoll.tsx, FussSchmal.tsx), `html lang="de"` (app/layout.tsx:80).
- Die ESLint-Konfiguration des Projekts meldet ungenutzte Variablen und undefinierte Namen nicht. „Lint-sauber“ heißt hier: Next-Regeln grün, Importe von Hand gegengeprüft.
- Bewusste Abweichungen: Bilder als WebP (Wandlung im Browser per Canvas, höchstens 1.440 px breit); `links.tsv` mit Spalte `ort` (footer oder ausserhalb); `zugang.mjs` prüft hell und dunkel, Schwelle 4,5:1.

## PRÜFUNG UND ERGEBNIS
- `node --check` für alle sechs `.mjs` und `package.json`: ohne Ausgabe, OK.
- `bunx eslint _werkstatt/nennung/werkzeuge`: Exit 0, 6 Dateien, 0 Meldungen.
- Proben im Speicher ohne Server: Linkauswertung, codayweb-Erkennung (6 von 6), JSON-LD mit Syntaxfehler, Kontrast (21:1; #767676 auf Weiß 4,54:1), Median und Spanne: OK.
- Nicht getan: kein Lauf gegen einen Server, kein Build, keine Installation.

## BELEGPFADE
- `werkzeuge/package.json`, `README.md`, `gemeinsam.mjs`, `links.mjs`, `bilder.mjs`, `zugang.mjs`, `netz.mjs`, `jsonld.mjs` (8 Dateien).

## OFFENE FRAGEN (mit Antwort des Orchestrators)
1. Ablage des Berichts → erledigt (diese Datei).
2. Abschnitt Einrichtung in STATUS.md → ergänzt der Orchestrator.
3. Roh-HTML vorher und nachher für den HTML-Vergleich (Z-01) → sichert E0-PRUEFER-02 per Abruf in `protokolle/roh/e0/html/`.
4. Erst am Produktions-Build prüfbar: CDP-Ereignisse, Canvas-WebP, axe-Include, Sitemap-Index, Fokus über Tab auf langen Seiten → E0-PRUEFER-02.
5. Sichtbarkeit (CLAUDE.md, Regel 1) → Die Nennung im Footer ist der sichtbare Schritt; Vorher-nachher-Bilder gehen vor dem Livegang an den Inhaber.

=== ENDE E0-PRUEFER-01 · BEREIT ZUR RÜCKGABE ===
