# Prüfstufe A · Agenturnennung · Commit b0ae185

Kennung E2-PRUEFER-01 · Server http://127.0.0.1:3511 (Produktions-Build, `next start`) · 16.10.2026

## Sichtbar auf der Seite

Auf `/` und `/jobs` steht im Fuß unter der OpenStreetMap-Zeile die Zeile „Webdesign & Entwicklung: Coday Web“. „Coday Web“ ist der Link auf https://www.codayweb.de/de. In allen vier Footer-Bildern (390 und 1440, `/` und `/jobs`, hell) ist die Zeile vollständig sichtbar, nicht abgeschnitten und nicht überdeckt. Überdeckt werden nur andere Footer-Teile durch fixierte Leisten (siehe offene Frage 3).

## Prüfung und Ergebnis

1. **Geänderte Dateien:** grün mit Abweichung. Der Befehl mit `':!_werkstatt'` wurde von git abgelehnt. Genutzt wurde `':(exclude)_werkstatt'`. Ergebnis: 10 Dateien, nicht 9 (Liste in Offene Fragen 1).
2. **Typprüfung** (`bun run type-check`): grün, Exit 0, ohne Fehlerausgabe.
   **Linter** (`bunx eslint`) auf die 7 TS/TSX-Dateien: grün, 0 Fehler, 0 Warnungen. Nicht gelintet: `.vercelignore`, `.css` und `CLAUDE.md` (Markdown).
3. **Vitest** (`components/site lib/seo`): grün, 19 Dateien, 347 Tests bestanden, 0 rot. Neue Datei `agentur-nennung.test.ts`: 10 von 10 grün.
4. **Build** (Protokoll `b0ae185-build.log`): grün mit Vorbehalt. „Compiled successfully in 8.7s“, TypeScript fertig, 183 von 183 Seiten erzeugt. Prebuild: „Design guard passed: 530 files checked“. Postbuild: drei ✅-Zeilen (CSS-Ketten, Teilbudgets E-031, Kopfzeichnungen). Kein ❌. Ein Exit-Status steht nicht im Protokoll (Offene Frage 2).
5. **Linkprüfer** (84 Seiten gelaufen, nur `/` und `/jobs` gewertet):
   - `/`: Status 200, de, index/follow. 1 Coday-Link im Fuß, 0 außerhalb. href `https://www.codayweb.de/de`, Text „Coday Web“, rel `noopener`, target `_blank`, Googlebot gleich ja. **Grün:** kein nofollow, sponsored, ugc oder noreferrer.
   - `/jobs`: Status 200, de, index/follow. 1 Coday-Link im Fuß, 0 außerhalb. href gleich, Text „Coday Web“, rel `nofollow noopener`, target `_blank`, Googlebot gleich ja. **Grün.**
   - HTML-Prüfung beider Seiten: vor dem Link steht der Text „Webdesign &amp; Entwicklung: “. Gesamt: „Webdesign & Entwicklung: Coday Web“. **Grün.**
6. **Footer-Bilder:** 16 Dateien erzeugt. Die vier hellen Footer-Bilder wurden angesehen. Ergebnis siehe „Sichtbar auf der Seite“. Dunkel und Gesamtseiten wurden nicht angesehen (nicht im Auftrag).

## Belegpfade

- Protokoll: `/home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/protokolle/stufe-a.md`
- Linkprüfer: `/home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/protokolle/roh/e2/links.tsv` und `links-zusammenfassung.md`
- Bilder: `/home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/bilder/e2/` (16 WebP, Fuß-Ausschnitte `*__fuss.webp`)
- Konsolenausgaben: `/tmp/claude-0/-home-user-Bad-und-Energie-Bewerbung/ca2761bb-9c67-5bb5-b541-7eab198c94f2/scratchpad/e2-links-konsole.txt` und `.../scratchpad/e2-bilder-konsole.txt`
- HTML-Stichproben: `.../scratchpad/e2-html_.html` und `.../scratchpad/e2-html_jobs.html`
- Build-Protokoll: `.../scratchpad/ci/b0ae185-build.log`

## Offene Fragen

1. **Dateizahl:** 10 statt 9. Liste: `.vercelignore`, `CLAUDE.md`, `components/site/__tests__/agentur-nennung.test.ts`, `components/site/fuss/AgenturLink.tsx`, `components/site/fuss/AgenturNennung.tsx`, `components/site/fuss/FussSchmal.tsx`, `components/site/fuss/FussVoll.tsx`, `components/site/fuss/agentur.ts`, `components/site/fuss/fuss.module.css`, `components/site/site-jsonld.ts`. Bitte bestätigen, ob die Erwartung von 9 falsch war.
2. **Build-Exit:** Das Protokoll hat keine Exit-Status-Zeile. Grün ist aus dem Ende des Protokolls geschlossen, nicht belegt. Bitte Exit-Code nachreichen oder bestätigen.
3. **Linktext:** Der Link trägt einen unsichtbaren Zusatz „(öffnet in neuem Tab)“. Der sichtbare Text ist exakt „Coday Web“. Der Name für Hilfstechnik ist also länger. Der OSM-Link hat denselben Zusatz. Soll das so bleiben? Entscheidung beim Inhaber.
4. **Fixierte Leisten:** Auf den 390-px-Bildern überdecken Kopfleiste und Leiste „Jetzt bewerben“ Teile der Footer-Liste (bei „Büro und Verwaltung“). Auf 1440 px überdeckt die Kopfleiste den oberen Fußrand. Die Coday-Zeile ist nicht betroffen. Ob das ein Aufnahme-Effekt ist oder am Seitenende etwas ausgeblendet werden soll, ist offen.
5. **Nicht bewertet:** Der Linkprüfer meldet für einige andere Seiten Status 308 und `/gibt-es-nicht` mit 404. Das liegt außerhalb von `/` und `/jobs`.

Schreibrechte: Geschrieben nur in `protokolle/stufe-a.md`, `protokolle/roh/e2/` und `bilder/e2/`. Projektcode und Werkzeuge unverändert. `git status` zeigt nur ignorierte Pfade (Caches, z. B. `tsconfig.tsbuildinfo`).
