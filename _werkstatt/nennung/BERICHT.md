# Bericht: Die Agentur-Nennung im Fuß

Stand 16.10.2026. Die Prüfprotokolle liegen in `_werkstatt/nennung/protokolle/`.

## 1. Was sich sichtbar ändert
- Unten auf jeder Seite steht als letzte Zeile unter der OpenStreetMap-Zeile: „Webdesign & Entwicklung: Coday Web“. Nur „Coday Web“ ist ein Link.
- Bilder: `/home/user/Bad-und-Energie-Bewerbung/_werkstatt/nennung/bilder/auswahl/` (8 Bilder, vorher und nachher, Startseite und Stellenübersicht, Handy und Computer, hell und dunkel).
- Live siehst du es auf karriere.bad-energie.de, sobald der Stand gepusht ist.
- Im Code: neue Dateien `components/site/fuss/AgenturNennung.tsx`, `AgenturLink.tsx`, `agentur.ts`, dazu kleine Ergänzungen in `FussVoll.tsx`, `FussSchmal.tsx`, `fuss.module.css` und `site-jsonld.ts` (unsichtbar: „Ersteller: Coday Web“ für Suchmaschinen).

## 2. Welcher Link gefolgt ist und warum
- Nur die Startseite. Sie gibt Suchmaschinen eine Empfehlung weiter.
- Auf allen anderen Seiten steht „nofollow“. Dort zählt die Empfehlung nicht. Grund: Ein Link auf jeder Seite sieht für Google aus wie gekaufte Werbung und kann als Linkspam gelten.
- Ziel ist https://www.codayweb.de/de. Das ist die Standardeinstellung, weil keine eigene Referenzseite festgelegt wurde.
- Der Link öffnet in einem neuen Tab. Beim Klick erfährt die Agentur, von welcher Seite der Besucher kommt.

## 3. Wie du dem Kunden die Nennung zeigst
- Mit den Bildern aus Abschnitt 1 und der Live-Seite.
- Die Zustimmung liegt laut deiner Entscheidung vor. Für die schriftliche Bestätigung gibt es einen Textvorschlag in `_werkstatt/nennung/MENSCHEN.md`, Abschnitt 1.
- Es lädt nichts von unserem Server: kein Bild, kein Skript, keine Schrift.

## 4. Übernahme und Rückweg
- Die Änderung liegt schon lokal auf `main`, in 9 Schritten (Commits, davon 2 mit Code-Änderungen), noch nicht gepusht. Mit dem Push geht sie sofort live, denn `main` wird über Vercel veröffentlicht.
- Gepusht wird erst, wenn die Prüfung grün ist. Stand vor dem Push: 10 von 10 Abnahme-Kriterien mit Beleg erfüllt, volle Prüfung grün (ABNAHME.md).
- Der Ordner `_werkstatt` ist über `.vercelignore` von der Veröffentlichung ausgenommen (Commit b0ae185). Er bleibt im Repository. Löschen ist möglich, ist aber nicht geschehen. Das entscheidest du.
- Der Arbeitsblock in `CLAUDE.md` (zwischen NENNUNG-ANFANG und NENNUNG-ENDE) wird beim Abschluss entfernt.
- Rückweg: `git revert 66d8d99 b0ae185`, dann pushen. Danach ist die Nennung wieder weg. Alternativ setzt du in Vercel den Stand von vor der Nennung (Commit a4491d5) wieder als live.

## 5. Was du nach dem Livegang prüfst
- In der Search Console von codayweb.de: Nach einigen Wochen unter „Links“ nachsehen, ob karriere.bad-energie.de als verweisende Seite auftaucht.
- In der Search Console des Kunden: Nach einigen Wochen prüfen, dass keine neuen Probleme gemeldet werden. Dafür braucht ihr dort Zugang, das klärst du mit dem Kunden.

## 6. Stand und was offen ist
- Grün geprüft: Die Startseite ist für Google offen, der Link stimmt, die Browser-Konsole zeigt keine Fehler, die Seite lädt mit gleich vielen Anfragen (38) wie vorher, und im Fuß gibt es keine Befunde bei der automatischen Barrierefreiheits-Prüfung.
- Auch grün: die Nachprüfung nach der Änderung am Linktext und die volle Prüfung des Standes vor dem Push (protokolle/nachpruefung.md, protokolle/stufe-b-ci.md).
- Deine Entscheidungen:
  - Soll `_werkstatt` im Repository bleiben oder vor dem Push gelöscht werden?
  - Soll der Link auch auf der Startseite keine Empfehlung mehr weitergeben („nofollow“)?
  - Bei jedem Seitenwechsel im Browser springt die Schutzangabe des Links einmal um und stimmt danach mit der neuen Seite überein. Ist das für dich in Ordnung?
