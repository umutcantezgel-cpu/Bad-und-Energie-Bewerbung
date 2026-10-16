@AGENTS.md

# Arbeitsregel „Wirkung vor Perfektion“ (Inhaber, 16.10.2026)

Anlass: Zwei Tage Arbeit mit vielen Prüfrunden, aber auf der Seite hat sich sichtbar kaum etwas verändert. Das darf nicht wieder passieren. Diese Regel gilt für jede Sitzung und jeden Agenten in diesem Projekt und geht internen Prüfgewohnheiten vor. Grenzen wie die Wahrheit (K-012) oder G7 lockert sie nicht.

1. **Sichtbares zuerst.** Jeder Arbeitsschritt muss etwas ändern, das der Inhaber, ein Bewerber oder der Chef auf der Seite sofort sieht. Unsichtbare Arbeit (Tests, Prüfregeln, Messungen, Doku) gibt es nur, soweit der sichtbare Schritt sie braucht.
2. **Kleine Schritte, oft live.** Spätestens nach etwa zwei bis drei Stunden Arbeit geht ein sichtbarer Stand live. Kein Arbeitsblock dauert länger, ohne dass der Inhaber Ergebnisse sieht.
3. **Bilder vor jedem Deploy.** Vor jedem Livegang bekommt der Inhaber Vorher-nachher-Bilder bzw. Filmstreifen der geänderten Stellen, in einfacher Sprache.
4. **Höchstens eine Prüfrunde je Schritt.**
   - Live blockieren nur echte Blocker: fachlich falsch, kaputt, unwahr, rechtlich oder bei der Barrierefreiheit verletzt, CI rot.
   - Alles andere, also Major, Minor und Geschmack, kommt in eine Liste und wird im nächsten sichtbaren Schritt mitgenommen.
   - Keine Schleifen „bis eine Runde leer ist“.
5. **Zweimal gescheitert heißt anhalten.** Fällt dasselbe Thema zweimal durch die Prüfung, wird nicht weiter nachjustiert. Der Stand geht mit Bildern an den Inhaber, und er entscheidet.
6. **Inhaber-Feedback schlägt interne Kritiker.** Was der Inhaber live sieht und sagt, wird zuerst umgesetzt.
7. **Bericht in Inhabersprache.** Jeder Bericht sagt zuerst, was sich auf der Seite sichtbar geändert hat und wo man es sieht, mit Link oder Bild. Danach erst, was im Hintergrund passiert ist.

<!-- NENNUNG-ANFANG · Lauf „Agenturnennung Coday Web“ · wird beim ABSCHLUSS entfernt -->
## Lauf „Agenturnennung Coday Web“ (nur für den Orchestrator)
- Bei jedem Sitzungsstart und nach jeder Kontextverdichtung zuerst `_werkstatt/nennung/AUFTRAG.md`, `_werkstatt/nennung/STATUS.md` und `_werkstatt/nennung/PRUEFPUNKT.md` lesen und dort fortsetzen.
- Push nur auf ARBEITSBRANCH `main` und nur grüne Stände; `main` geht über Vercel live (Änderung des Auftraggebers, `_werkstatt/nennung/ENTSCHEIDUNGEN.md` N-02). Sonst kein Deploy.
<!-- NENNUNG-ENDE -->
