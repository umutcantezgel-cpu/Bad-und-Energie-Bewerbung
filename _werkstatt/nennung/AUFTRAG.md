<!-- Wortlaut des Auftrags vom 15.10.2026. Einzige Abweichung: Modellnamen sind durch Rollennamen ersetzt
     („Orchestrator-Modell“, „Arbeitsmodell“), weil in diesem Repository keine Modellkennungen stehen dürfen
     (vermerkt in ENTSCHEIDUNGEN.md, N-01). Die Einstellungen in Abschnitt 0 sind die Standardwerte des Auftrags;
     die Änderungen des Auftraggebers stehen in ENTSCHEIDUNGEN.md (N-02). -->

MASTER-AUFTRAG · AGENTURNENNUNG MIT BACKLINK · FÜR JEDES KUNDENPROJEKT VON CODAY WEB
Autonomer Lauf in einer Claude-Code-Sitzung im Repository einer Kundenseite · Orchestrator-Modell entscheidet, baut und nimmt ab · Arbeitsmodell erkundet, prüft, misst und dokumentiert
Lies den ganzen Auftrag, bevor du etwas änderst. Den Kontext suchst du dir selbst aus dem Projekt; Rückfragen gibt es nicht.

## 0. EINSTELLUNGEN
Alles Veränderliche steht hier. Leere Felder nehmen den Standardwert; im übrigen Text gibt es keine Ausfüllfelder.
- ANKERMARKE: Coday Web – genau so geschrieben, ohne Zusätze
- LINKZIEL: [URL der deutschen Referenzseite dieses Kunden, etwa https://www.codayweb.de/de/work/batherm] · Standard: https://www.codayweb.de/de
- LINKZIEL ENGLISCH: [URL der englischen Referenzseite] · Standard: https://www.codayweb.de/en – gilt für jede Sprachfassung außer Deutsch
- LEISTUNG: [was Coday für diesen Kunden wirklich gemacht hat, zwei bis vier Wörter] · Standard: Webdesign & Entwicklung, englisch Web design & development
- LINKMODELL: [zurückhaltend | Startseite | flächig] · Standard: Startseite (Abschnitt 6)
- GEGENLEISTUNG: [nein | ja – der Kunde bekommt für die Nennung einen Vorteil, etwa einen Rabatt] · Standard: nein
- KUNDENZUSTIMMUNG: [liegt vor | offen] · Standard: offen – gebaut wird trotzdem auf ARBEITSBRANCH, übernommen erst nach Zustimmung
- STRUKTURDATEN: [ja | nein] · Standard: ja, nur als Ergänzung eines vorhandenen WebSite-Knotens
- REFERENZ-STECKBRIEF: [ja | nein] · Standard: ja, wenn LINKZIEL leer ist, sonst nein
- ORCHESTRATOR: Orchestrator-Modell in der Hauptsitzung, auf der höchsten verfügbaren Denkstufe
- ARBEITSMODELL: Arbeitsmodell für Erkundung, Einrichtung, alle Prüfungen, Tests und Messungen sowie die Dokumentation – auf der höchsten Denkstufe, die Arbeitsmodell unterstützt
- ARBEITSMODELL-PLÄTZE: 3
- ARBEITSBRANCH: [Name; zum Fortsetzen der Branch des früheren Laufs] · Standard: der Branch, den die Sitzung für diese Aufgabe angelegt hat; stehst du auf dem Hauptbranch: nennung/coday-[Startdatum]
- PUSH: nur ARBEITSBRANCH, stets ausdrücklich benannt, am Ende jeder Phase und mindestens stündlich; ohne Remote nur Commits
- VERÖFFENTLICHUNG: nie
- GERÄTEGRÖSSEN: 390 × 844 · 1440 × 900
- LAUFZEIT: eine Sitzung, bis die Abnahme erfüllt ist; Richtwert ein bis drei Stunden
- BERICHT: Deutsch, du-Anrede, ohne Fachjargon

## 1. NORDSTERN
Am Ende des Laufs trägt die Kundenseite auf ARBEITSBRANCH eine sichtbare, wahre Nennung von Coday Web, die wirkt, als hätte sie immer zum Footer gehört; ihr Link holt für codayweb.de den größten Wert, den Googles Richtlinien und die Einstellungen zulassen – im Standard genau ein gefolgter Markenlink je Sprachfassung von der stärksten indexierbaren Seite –, und die Kundenseite verliert in Rankings, Darstellung, Tempo, Zugänglichkeit und Rechtssicherheit nichts.

## 2. AUSGANGSLAGE UND BEGRIFFE
- Du arbeitest im Repository einer Website, die Coday Web gebaut hat oder betreut, eine inhabergeführte Webagentur aus Wetzlar. Außer diesem Auftrag bekommst du nichts; alles Weitere findest du im Projekt.
- Coday-Projekte sind meist Next.js mit TypeScript und Tailwind, ausgeliefert über Vercel. Den tatsächlichen Stack liest du trotzdem aus dem Projekt und arbeitest mit dem, was da ist – auch mit statischem HTML, WordPress- oder Shopify-Themes und anderen Frameworks.
- Warum es diesen Lauf gibt: Jede Kundenseite ist für codayweb.de eine eigene verweisende Domain. Ihr Wert entsteht aus einem gefolgten Link mit Markenanker von einer starken, indexierbaren Seite auf ein passendes Ziel; weitere Links derselben Domain bringen kaum mehr. Google nennt weit verteilte Links in Footern und Vorlagen vieler Websites, Links gegen eine Gegenleistung und vertraglich verlangte Links, die der Seiteninhaber nicht kennzeichnen darf, ausdrücklich als Linkspam. Darum baut dieser Lauf einen starken, vom Kunden gewollten Link statt vieler – dazu eine sichtbare Erwähnung aus Leistung und Marke auf jeder Seite.
- Der Kunde ist Eigentümer seiner Seite. Die Nennung ist ein Angebot an ihn: Er sieht sie auf ARBEITSBRANCH, stimmt zu und kann jederzeit nofollow oder die Entfernung verlangen.
- codayweb.de: kanonische Startseite https://www.codayweb.de/de, englisch https://www.codayweb.de/en; Referenzseiten liegen unter /de/work/[kürzel] und verlinken bereits auf die Live-Seiten der Kunden.
- Begriffe: Nennung = sichtbarer Text aus LEISTUNG und ANKERMARKE, verlinkt ist nur ANKERMARKE · Sprachfassung = eine Sprache der Kundenseite mit eigener Startseite · Quellseite = die Startseite jeder Sprachfassung oder ihr Ersatz nach Abschnitt 6; nur dort darf die Nennung gefolgt sein · gefolgt = ohne rel-Wert nofollow, sponsored oder ugc · ausgeliefertes HTML = was Server oder Build ohne Ausführung von JavaScript liefern.

## 3. WORAUF ES ANKOMMT
1. Erst lesen, dann ändern: Footer, Sprachsystem, Designwerte und SEO-Stand kennst du, bevor du eine Zeile schreibst.
2. Kunde vor Agentur: Kollidieren Schutz des Kunden und Nutzen für Coday, gewinnt der Kunde.
3. Ein starker Link statt vieler: Der Wert kommt aus Quellseite, Anker und Ziel, nicht aus der Zahl der Links.
4. Wahr und sichtbar: Die Nennung sagt nur, was Coday gemacht hat, und jeder Mensch kann sie sehen und lesen.
5. Teil des Designs: Schrift, Farbe, Abstände und Zustände wie der übrige Kleintext des Footers, nicht auffälliger als die Rechtslinks.
6. Kleinster Eingriff: Geändert wird nur, was die Nennung braucht; vorhandene Komponenten werden erweitert, nicht dupliziert.
7. Prüfen mit Augenmaß: Geprüft wird nach Abschnitt 9, nicht mehr; Urteile über Gestaltung und die Abnahme fällt Orchestrator-Modell.

## 4. AUTONOMIE, GRENZEN, LEITPLANKEN, VORRANG
Autonomie
- Du stellst keine Rückfragen. Du entscheidest, begründest Folgenreiches in ENTSCHEIDUNGEN.md und arbeitest weiter. Was nur ein Mensch klären kann, kommt mit Beleg und deiner Standardannahme in MENSCHEN.md; die Annahme gilt bis zur Antwort.
- Haltepunkte gibt es nur diese: HALT, wenn das Projekt keine Website ausliefert, etwa eine App ohne Web-Fassung; HALT, wenn sich das Projekt auf drei dokumentierten Wegen weder bauen noch per Typprüfung oder Tests prüfen lässt; HALT, wenn eine zweite AUSNAHME nötig wäre oder der Endprüfer auch nach zwei Nachbesserungsrunden nicht bestätigt; und den ABSCHLUSS. Ein Footer im CMS oder in einer Datenbank ist kein HALT, sondern ein Sonderfall nach Abschnitt 6.
- Kontextgrenzen, Nutzungslimits und neu aufgesetzte Umgebungen beenden den Lauf nicht: Stand sichern, später exakt fortsetzen.
Grenzen – jede ist abhakbar
- G1 Schreibrechte im Projekt: die Datei oder Komponente des Footers, eine neue kleine Komponente nur für die Nennung, wenn die Konventionen des Projekts das nahelegen, die Sprachdateien für den Text der Nennung, eine Testdatei für die rel-Regel, die Datei mit einem vorhandenen WebSite-Knoten der Strukturdaten (nur das Feld creator), die Konfiguration, die _werkstatt von der Auslieferung ausschließt – bevorzugt eine vorhandene –, dazu _werkstatt/nennung und dein Block in CLAUDE.md. Alles andere liest du nur, fremde Websites und Dienste ebenso.
- G2 Git: Vor der ersten Änderung stehst du auf ARBEITSBRANCH. Gepusht wird nur ARBEITSBRANCH, stets ausdrücklich benannt. Kein Push auf den Hauptbranch, kein erzwungener Push, kein Rebase oder Reset über fremde Arbeit, keine gelöschten Branches oder Tags, kein Zusammenführen, keine Änderung an Remotes, Git-Konfiguration oder Repository-Einstellungen.
- G3 Veröffentlichung: keine Deploys, Releases, Domain- oder DNS-Änderungen. Vorschauen, die ein angebundener Dienst automatisch aus ARBEITSBRANCH baut, gelten nicht als Veröffentlichung.
- G4 Daten: Zugangsdaten, Schlüssel und Umgebungsdateien bleiben unberührt und erscheinen in keinem Commit, Bericht oder Bild.
- G5 SEO-Bestand des Kunden: Titel, Beschreibungen, Überschriften, Inhalte, interne Links, Canonicals, Robots-Angaben, robots.txt, Sitemaps, hreflang, Weiterleitungen, Routen sowie Analyse- und Consent-Einbindung bleiben unverändert, ebenso vorhandene Links auf codayweb.de außerhalb des Footers.
- G6 Fremde Nennungen: Hinweise auf frühere Agenturen, Theme-, Vorlagen-, Foto- oder Schriftquellen und Lizenzen bleiben unverändert und kommen mit Fundstelle in MENSCHEN.md, weil manche Lizenzen sie verlangen.
- G7 Rechtstexte: Impressum, Datenschutz und AGB bleiben inhaltlich unverändert. Eine Nennung dort gibt es nur, wenn E1 sie per Denkprotokoll wählt – unterhalb der Pflichtangaben, klar abgesetzt und mit Prüfauftrag in MENSCHEN.md.
- G8 Abhängigkeiten: keine neuen Bibliotheken im Projekt; Prüfwerkzeuge liegen nur in _werkstatt/nennung/werkzeuge mit eigener Paketdatei, und eine eigene .gitignore in _werkstatt/nennung hält ihre installierten Abhängigkeiten und alle nicht ausgewählten Bilder aus jedem Commit.
- G9 Ehrliche Prüfungen: Tests, Linter, Typprüfung und Git-Hooks werden nie abgeschaltet, gelockert oder umgangen; nichts wird so gebaut, dass es nur eine Prüfung besteht.
- G10 Einstellungen: Berechtigungen, Modellwahl und Einstellungen von Claude Code änderst du nicht.
Leitplanken für den Link – jede wird in E3 einzeln geprüft
- S1 Anker: Der Linktext ist genau ANKERMARKE. Keine Suchbegriffe wie „Webdesign Wetzlar“ im Link und im Footer keine weiteren Links auf codayweb.de, etwa auf Leistungs- oder Standortseiten.
- S2 Ziel: absolute https-Adresse, exakt LINKZIEL oder LINKZIEL ENGLISCH, ohne Parameter, Sprungmarken oder Kampagnenzusätze.
- S3 Sichtbar: kein Verstecken über Farbe, Größe, Deckkraft, Position, Überlagerung oder winzige Klickflächen. Versteckte Links wertet Google als Spam, und das träfe den Kunden.
- S4 Echt im HTML: ein a-Element mit href im ausgelieferten HTML; rel und target stehen dort schon richtig und werden im Browser nicht nachträglich umgeschaltet.
- S5 rel: nach LINKMODELL; bei GEGENLEISTUNG ja trägt jeder Link rel="sponsored", gleich welches Modell gilt. Nie noreferrer, damit Coday Besuche aus der Nennung in der eigenen Analyse sieht; zum neuen Tab gehört noopener.
- S6 Ohne Fremdressourcen: nur Text – kein Badge, Bild, Skript, Iframe, Pixel und keine Schrift vom Agenturserver.
- S7 Für alle gleich: dieselbe Nennung für Menschen und Suchmaschinen, ohne Weiche nach Nutzeragent, Herkunft oder Gerät.
Leitplanken allgemein
- Wahrheit: Die Nennung enthält nur LEISTUNG und ANKERMARKE – keine Superlative, Auszeichnungen oder Zahlen.
- Datenschutz: kein neuer Drittanbieter; der Link überträgt erst beim Klick Daten.
- Unaufdringlich: Die Nennung lenkt nicht von Inhalten und Handlungsaufforderungen des Kunden ab.
Denkprotokoll und Vorrang
- Denkprotokoll nur für: eine Quellseite, die nicht die Startseite ist; eine Nennung in einem Rechtstext; eine Seite ohne Footer; den Weg in einem Sonderfall; jede AUSNAHME. Form: Ziel → drei Wege → Bewertung nach Nordstern, Kundenschutz, Risiko und Aufwand → Umkehrprobe → Folgen zweiter Ordnung → Eintrag in ENTSCHEIDUNGEN.md.
- Vorrang bei Konflikten: 1. Grenzen und Leitplanken · 2. Bestand und SEO des Kunden · 3. Zugänglichkeit und Leistung · 4. Abnahmeliste · 5. Einstellungen · 6. Wert für codayweb.de · 7. Gestaltungsvorlieben.

## 5. MODELLE, ROLLEN, PAKETE
Orchestrator-Modell – du, in der Hauptsitzung: Du wertest die Erkundung aus, triffst alle Entscheidungen in E1, baust die Nennung selbst, weil Einbindung und Gestaltung Urteil verlangen, nimmst ab, committest und pushst. Rohdaten liest du nicht: Arbeitsmodell liefert verdichtete Berichte, Protokolle bleiben in Dateien.
Zuteilung – das Modell jedes Agenten wählst du im Aufruf selbst; ohne Wahl erbt ein Agent womöglich das Hauptmodell und verbraucht Orchestrator-Kontingent für Fleißarbeit.
- Arbeitsmodell: alle Pakete der Rollen Kundschafter, Prüfer und Dokumentar.
- Orchestrator-Modell als frischer Unteragent: nur die Endprüfung in E4.
- Scheitert ein Arbeitsmodell-Paket zweimal, übernimmst du es oder schneidest es kleiner; ein anderes Modell kommt nie zum Einsatz.
Arbeitsmodell-Rollen – jedem Paket stellst du das Briefing seiner Rolle voran
- Kundschafter: erfasst einen Bereich vollständig mit Datei- und Zeilenangaben. Häufige Fehler: zusammenfassen statt auflisten; Vermutung als Befund; Seiten übersehen, die nicht in der Navigation stehen.
- Prüfer: richtet Werkzeuge ein, führt die Prüfungen seiner Stufe aus und berichtet knapp mit Belegpfaden. Häufige Fehler: Entwicklungsserver statt Produktions-Build; Einzelmessung statt Median aus drei Läufen; deuten statt berichten.
- Dokumentar: schreibt Bericht, Registerzeile und Steckbrief nur aus Belegen. Häufige Fehler: Behauptung ohne Belegpfad; Fachjargon; Zahl ohne Messart.
- Jedes Briefing endet mit: Markiere Unsicheres als OFFENE FRAGE statt zu raten, und erfülle nur deinen Auftrag.
Paket-Bauplan – feste Reihenfolge
1. Kopfzeile: Kennung [Phase]-[ROLLE]-[Nr] · Rolle · Modell · Schreibrechte als exakte Dateiliste · Umfang
2. Rollenbriefing
3. Aufgabe in einem Satz
4. Das Projekt in drei Sätzen, wortgleich aus LAGE.md, sobald es sie gibt
5. Auszug aus diesem Auftrag mit den Einstellungen und Leitplanken, die das Paket braucht, als unveränderlich gekennzeichnet
6. Grenzen
7. Nummerierte Schritte mit exakten Mengen
8. Ausgabeformular: BEFUNDE mit Fundstellen · PRÜFUNG UND ERGEBNIS · BELEGPFADE · OFFENE FRAGEN
9. Selbstprüfung: Mengen gezählt, Schreibrechte eingehalten, offene Fragen gelistet
10. Letzte Zeile: === ENDE [Kennung] · BEREIT ZUR RÜCKGABE ===
- Arbeitsmodell-Agenten schreiben nur in die Dateien ihrer Kopfzeile unter _werkstatt/nennung, ändern keinen Projektcode, committen und pushen nicht. Berichte haben höchstens 600 Wörter, bei Kundschaftern höchstens 1.200. Platzhalter wie „usw.“ oder „analog“ führen zur Ablehnung.
- Gleichzeitige Pakete teilen keine Datei; rechenintensive Schritte – Build, ganze Testsuite, Bilder, Messungen – laufen nacheinander.

## 6. FACHKERN – DAS LINKKONZEPT
Linkmodelle
- Startseite (Standard): Die Nennung steht im Footer jeder Seite. Gefolgt ist sie nur auf der Quellseite jeder Sprachfassung; auf allen übrigen Seiten trägt derselbe Link rel="nofollow". So kommt die Empfehlung von der stärksten Seite des Kunden, Besucher und Suchsysteme finden Leistung und Marke überall, und es entsteht kein Muster gefolgter Footer-Links über die ganze Website.
- Zurückhaltend: wie Startseite, aber auch auf der Quellseite rel="nofollow" – für Kunden, die keinen gefolgten Link wollen.
- Flächig: gefolgt auf allen Seiten, nur wenn die Einstellung es verlangt. Es bringt nach allem, was bekannt ist, kaum mehr als das Modell Startseite und entspricht genau dem Muster, das Google als Linkspam nennt; der Bericht sagt das in einem Satz.
Quellseite
- Standard: die Startseite jeder Sprachfassung.
- Sie muss indexierbar sein: Status 200, kein noindex in Meta-Angabe oder Header, nicht durch robots.txt gesperrt, Canonical auf sich selbst, in der Sitemap, sofern es eine gibt. Links auf dauerhaft nicht indexierten Seiten verlieren mit der Zeit ihre Wirkung.
- Fällt die Startseite durch, wählst du per Denkprotokoll die stärkste indexierbare Seite, auf der eine Nennung natürlich wirkt – Über uns, dann Kontakt, dann Impressum – und vermerkst den Mangel der Startseite in MENSCHEN.md, ohne ihn zu beheben.
- Ob eine Seite Quellseite ist, entscheidet sich beim Rendern auf dem Server oder im Build, nie erst im Browser. Hat das Projekt Komponententests, sicherst du diese rel-Regel mit einem kleinen Test nach dem vorhandenen Muster.
Platzierung und Gestalt
- Im Footer dort, wo Besucher eine Nennung erwarten: in der Zeile mit Copyright oder Rechtslinks oder als letzte Zeile darunter.
- Schrift, Größe, Farbe, Abstände sowie Hover- und Fokuszustand stammen aus den vorhandenen Werten des Footers; in jedem Thema des Projekts mindestens 4,5:1 Kontrast; Fokus immer sichtbar; Klickfläche nach WCAG 2.2 mindestens 24 × 24 CSS-Pixel oder genug Abstand zu Nachbarn.
- Mobil ohne Überlauf, abgeschnittenen Text oder seitliches Scrollen; die Nennung bricht als Ganzes um.
- Hat die Seite keinen Footer, entscheidest du per Denkprotokoll zwischen einer schlichten letzten Zeile im Seitenlayout, Über uns und Impressum; einen neuen Footer baust du nicht.
Wortlaut
- Form: LEISTUNG, Doppelpunkt, ANKERMARKE – zur Veranschaulichung „Webdesign & Entwicklung: Coday Web“ oder „Web design & development: Coday Web“. Verlinkt ist nur ANKERMARKE.
- Jede Sprachfassung bekommt die Nennung in ihrer Sprache, über das Sprachsystem des Projekts und im Ton des vorhandenen Footers. Bist du in einer Sprache unsicher, entsteht ein markierter Entwurf mit Eintrag in MENSCHEN.md.
- Der Link öffnet einen neuen Tab, damit der Besucher die Kundenseite nicht verliert; ein visuell verborgener Hinweis „(öffnet in neuem Tab)“ in der jeweiligen Sprache folgt dem vorhandenen Muster des Projekts für solchen Text.
- Gibt es schon eine Nennung von Coday, wertest du sie zu dieser Form auf, statt eine zweite anzulegen.
Linkziel
- Deutsche Sprachfassung: LINKZIEL; alle anderen: LINKZIEL ENGLISCH.
- Ist codayweb.de aus der Umgebung erreichbar, prüft ein Arbeitsmodell-Prüfer, dass jedes Ziel ohne Weiterleitung mit Status 200 antwortet und sein Canonical auf sich selbst zeigt; antwortet ein Ziel anders, nimmst du die Startseite seiner Sprache und vermerkst es. Ist codayweb.de nicht erreichbar, gilt die Einstellung ungeprüft, und die Prüfung kommt in MENSCHEN.md.
Strukturdaten – bei STRUKTURDATEN ja
- Hat das Projekt schon einen WebSite-Knoten im JSON-LD, ergänzt du dort nur das Feld creator mit einer Organization aus name ANKERMARKE und url https://www.codayweb.de/de. Die sichtbare Nennung macht diese Angabe auf der Seite nachvollziehbar.
- Gibt es keinen WebSite-Knoten, legst du keinen an. name, url, alternateName, publisher und alle anderen Knoten bleiben unverändert, denn aus dem WebSite-Knoten liest Google den Seitennamen, der in den Suchergebnissen erscheint.
- Das ist ein Zuordnungssignal mit ungewisser Wirkung, kein Link und kein Rankingversprechen.
Sonderfälle
- Footer im CMS oder in einer Datenbank: Du änderst keine Inhalte über Datenbank oder Schnittstellen. Stattdessen legst du den fertigen Baustein in BAUSTEIN.md ab – Text je Sprache, Link mit rel je Seitentyp, Gestaltungshinweise – und eine Schritt-für-Schritt-Anleitung in MENSCHEN.md; Kriterien, die eine Darstellung brauchen, werden zur UMGEBUNGSAUSNAHME.
- Seite nur im Browser gerendert, ohne Vorrendern auf Server oder im Build: S4 prüfst du am gerenderten Dokument und vermerkst die Einschränkung als UMGEBUNGSAUSNAHME.
- Onepager: Die einzige Seite ist die Quellseite.
- Seiten ohne Footer, etwa Landingpages mit eigenem Layout, bleiben ohne Nennung.
Für codayweb.de
- LINKREGISTER.md: eine Zeile für dein übergreifendes Register – Datum · Kundendomain · Quellseiten · Linkziele · Anker · Linkmodell · rel auf Quellseite und übrigen Seiten · Änderungs-Commits · Status „auf Branch, nicht live“.
- REFERENZ.md bei REFERENZ-STECKBRIEF ja: Entwurf für eine Referenzseite auf codayweb.de, nur aus Belegen im Repository – Branche, Leistungen laut LEISTUNG, Technik, Seiten, Sprachen, Funktionen, Vorschläge für Bildmotive aus den Startseiten-Bildern. Messwerte nur mit Messart und dem Hinweis, dass Labormessungen vor einer Veröffentlichung an der Live-Seite zu prüfen sind. Kundenstimme, Geschäftsergebnisse und die Zustimmung des Kunden zur Nennung als Referenz stehen darin als OFFENE FRAGE.

## 7. GEDÄCHTNIS UND DATEIEN
- Dauerhaft ist nur, was committet und gepusht ist; das Gedächtnis des Laufs liegt deshalb in _werkstatt/nennung: AUFTRAG.md (dieser Auftrag, wörtlich) · STATUS.md · PRUEFPUNKT.md (nächster exakter Schritt, laufende Pakete, letzter grüner Commit) · LAGE.md · ENTSCHEIDUNGEN.md · ABNAHME.md · MENSCHEN.md · BERICHT.md · LINKREGISTER.md · bei Bedarf REFERENZ.md und BAUSTEIN.md · Ordner berichte, bilder, protokolle, werkzeuge.
- Liegt _werkstatt im ausgelieferten Bereich, schließt du den Ordner von der Auslieferung aus.
- Bilder speicherst du komprimiert und höchstens 1.440 Pixel breit. Committet werden nur die Vorher-nachher-Bilder des Footers auf der Quellseite und einer Unterseite in beiden GERÄTEGRÖSSEN, je Thema und Sprachfassung.
- In CLAUDE.md – anlegen oder ergänzen, nichts anderes ändern, ein vorhandener Block eines anderen Laufs bleibt unberührt – setzt du einen kurzen Block mit klarer Anfangs- und Endmarke: nur für den Orchestrator; bei jedem Sitzungsstart und nach jeder Kontextverdichtung _werkstatt/nennung/AUFTRAG.md, STATUS.md und PRUEFPUNKT.md lesen und dort fortsetzen; Push nur auf ARBEITSBRANCH, kein Deploy. Beim ABSCHLUSS entfernst du ihn.
- Commit-Schnitt: Änderungs-Commits enthalten nur die Nennung – Footer, Komponente, Sprachdateien, Test, Strukturdaten, Ausschluss-Konfiguration – und nie Dateien aus _werkstatt; _werkstatt und der CLAUDE.md-Block kommen in eigene Commits. So lässt sich die Nennung ohne den Arbeitsordner übernehmen. Jede Nachricht nennt die Paketkennung.

## 8. ABLAUF
Zu Beginn jeder Phase liest du ABNAHME.md, sobald es sie gibt, und verankerst dich in zwei Sätzen am Nordstern.
E0 Start und Erkundung
- Branch zuerst: Hat ARBEITSBRANCH auf dem Remote schon _werkstatt/nennung/PRUEFPUNKT.md, gehst du nach L5 vor. Stehst du auf dem Hauptbranch, legst du ARBEITSBRANCH an und wechselst, bevor du irgendetwas änderst.
- _werkstatt/nennung samt .gitignore anlegen, diesen Auftrag wörtlich speichern, CLAUDE.md-Block setzen, committen, pushen.
- Drei Arbeitsmodell-Pakete gleichzeitig:
  · E0-PRUEFER-01 Einrichtung: Abhängigkeiten installieren, Produktions-Build erzeugen und lokal starten – über die vorhandenen Skripte, sonst auf zwei weiteren Wegen. Werkzeuge in _werkstatt/nennung/werkzeuge: ein Linkprüfer, der die Seitenliste aus Sitemap, Routen und Build-Ausgabe bildet, das ausgelieferte HTML jeder Seite liest und je Seite eine Zeile schreibt – Adresse · Sprache · Meta-Robots · Canonical · Zahl der Links auf codayweb.de im Footer und außerhalb · je Link href, Linktext, rel, target –, dazu ein Abruf mit Googlebot-Kennung zum Vergleich, ein Bildwerkzeug für Footer-Ausschnitt und ganze Seite, Zugänglichkeits- und Kontrastprüfung, Mitschnitt der Netzwerkanfragen. Die Einrichtungsschritte kommen in STATUS.md.
  · E0-KUNDSCHAFTER-01 Technik: Stack, Rendering-Art je Seitentyp, Fundstelle des Footers mit Dateien und Zeilen, Herkunft seiner Inhalte (Code, CMS, Datenbank), Sprachsystem und Sprachdateien, Designwerte des Footer-Kleintexts und der Rechtslinks, Themen wie ein Dunkelmodus, Muster für visuell verborgenen Text, Testaufbau und Muster für Komponententests, Ort der Strukturdaten, Build-Ausgabe und Auslieferungskonfiguration.
  · E0-KUNDSCHAFTER-02 SEO-Bestand: alle Seiten mit Sprache; je Startseite Meta-Robots, Robots-Header-Konfiguration, passende robots.txt-Regeln, Canonical, Sitemap-Eintrag, hreflang; alle ausgehenden Links im Footer; alle Links auf codayweb.de; alle Nennungen von Coday, früheren Agenturen und Quellen mit Fundstelle und Lizenzhinweis; alle JSON-LD-Knoten mit Typ und Feldern; Über uns, Kontakt und Impressum mit Indexierbarkeit.
- Danach E0-PRUEFER-02 Ausgangswerte: Build, Typprüfung, Linter, Tests, Konsolenfehler, Linkliste aller Seiten, Footer-Bilder, Netzwerkanfragen und komprimierte Transfergröße der Startseite, Zugänglichkeitsbefunde im Footer, Layoutverschiebung der Startseite in drei Läufen, Erreichbarkeit von codayweb.de und Prüfung beider Linkziele nach Abschnitt 6.
- Du verdichtest alles in LAGE.md: das Projekt in drei Sätzen, Stack, Fundstelle des Footers, Sprachfassungen, Kandidaten für die Quellseite mit Indexierbarkeit, vorhandene Nennungen und Links, Lage der Strukturdaten, Ausgangswerte, erkannte Sonderfälle. Ist das Projekt keine Website, endest du mit HALT und schreibst Begründung und Empfehlung in drei Sätzen in BERICHT.md.
- Ausgang: committen und pushen.
E1 Entscheidung – einmal, ohne Varianten
- Du legst fest: Quellseite je Sprachfassung, rel je Seitentyp nach LINKMODELL und GEGENLEISTUNG, Platzierung, Wortlaut je Sprache, Linkziele, Strukturdaten, Weg in einem Sonderfall; Folgenreiches per Denkprotokoll.
- ABNAHME.md mit Z-01 bis Z-10, Prüfmethode und Ausgangswert je Kriterium. Was die Umgebung grundsätzlich nicht prüfen kann, legst du hier als UMGEBUNGSAUSNAHME mit Ersatzprüfung fest und trägst es in MENSCHEN.md ein.
- Paketliste in STATUS.md mit Kennung, Rolle, Modell, Schreibrechten und Kriterium.
- Ein Arbeitsmodell-Prüfer gleicht in einer Runde ab: jede Einstellung umgesetzt, jedes Kriterium mit Prüfschritt, keine Grenze berührt. Du besserst nach; danach gilt die Entscheidung.
- Ausgang: committen und pushen.
E2 Umsetzung
- Du baust die Nennung in der Architektur des Projekts: vorhandene Footer-Komponente oder -Vorlage erweitern, Texte über das Sprachsystem, Werte aus dem vorhandenen Design, rel je Seitentyp beim Rendern, Test der rel-Regel, Strukturdaten nach Abschnitt 6, Ausschluss von _werkstatt aus der Auslieferung. Im Sonderfall CMS entsteht stattdessen BAUSTEIN.md.
- Prüfstufe A durch einen Arbeitsmodell-Prüfer, bei Grün der Änderungs-Commit und Push.
E3 Prüfung
- Prüfstufe B durch einen Arbeitsmodell-Prüfer.
- Sichtabnahme durch dich an den Footer-Bildern: Die Nennung wirkt wie ein Teil des Footers, ist nicht auffälliger als die Rechtslinks, in jedem Thema lesbar und mobil sauber. Jeder Befund wird eine Reparatur nach L1.
- Ein Arbeitsmodell-Dokumentar schreibt BERICHT.md, LINKREGISTER.md und bei Bedarf REFERENZ.md; den Textvorschlag für die Kundenzustimmung in MENSCHEN.md schreibst du selbst. Du nimmst alles ab und hakst ABNAHME.md nur mit Beleg ab.
E4 Abschluss
- Ein frischer Orchestrator-Unteragent prüft jedes Häkchen, jede AUSNAHME und jede UMGEBUNGSAUSNAHME in ABNAHME.md gegen ihren Beleg und die Bilder; er führt keine Tests aus. Sein Urteil – je Kriterium eine Zeile mit Ergebnis und Belegpfad – gibst du in deiner letzten Antwort wörtlich wieder.
- Bestätigt er nicht alles, wird jede Lücke ein Paket, und er prüft erneut; nach zwei Nachbesserungsrunden ohne volle Bestätigung endest du mit HALT.
- Dann entfernst du den CLAUDE.md-Block, committest, pushst und schreibst die Statuszeile ABSCHLUSS.

## 9. PRÜFSTUFEN
Prüfungen, Tests und Messungen führt immer ein Arbeitsmodell-Prüfer mit den Werkzeugen aus _werkstatt/nennung/werkzeuge aus, stets am Produktions-Build; du liest nur das Ergebnis. Was in keiner Stufe steht, wird nicht geprüft.
- Prüfstufe A, Minuten: Typprüfung und Linter der geänderten Dateien, die direkt betroffenen Tests einschließlich des neuen, Build, Linkprüfer für jede Quellseite und eine Unterseite, Footer-Bilder mobil und am Desktop.
- Prüfstufe B, einmal je Anlauf des Prüftors: Build, Typprüfung, Linter und ganze Testsuite; Konsolenfehler; Linkprüfer über alle Seiten, bei mehr als 200 Seiten über alle Quellseiten plus eine Zufallsstichprobe von 10 %, mindestens 50, mit der Zahl der geprüften Seiten im Protokoll; Vergleich mit Googlebot-Kennung für jede Quellseite; Indexierbarkeit der Quellseiten; Prüfung der Linkziele, falls erreichbar; HTML-Vergleich vorher und nachher für jede Quellseite und drei Unterseiten; Liste der geänderten Dateien gegen G1, G5, G6 und G7; Footer-Bilder in allen GERÄTEGRÖSSEN, Themen und Sprachfassungen; berechnete Stile der Nennung – sichtbar, Größe, Deckkraft, Kontrast, Klickfläche; Zugänglichkeitsprüfung des Footers und Fokus per Tastatur; Netzwerkanfragen, komprimierte Transfergröße und Layoutverschiebung der Startseite in drei Läufen; Vergleich des JSON-LD.
- Werkzeuge: zuerst, was Projekt und Umgebung mitbringen. Fehlt eines und lässt es sich nicht installieren, prüft der Prüfer mit vorhandenen Mitteln weiter; die Lücke kommt in MENSCHEN.md, und ein dadurch unbelegbares Kriterium wird zur UMGEBUNGSAUSNAHME mit Ersatzprüfung. Hintergrundbefehle enden nach etwa 30 Minuten: Server vor Gebrauch prüfen, lange Läufe teilen, Ausgaben in Protokolldateien.

## 10. REGELKREISE
- L1 Paket: ausgeben → bearbeiten → prüfen → deine Abnahme an Bericht und Stichprobe → weiter oder Reparatur. Höchstens zwei Reparaturrunden, dann übernimmst du oder schneidest neu.
- L2 Phase: Am Ende jeder Phase STATUS.md und PRUEFPUNKT.md aktualisieren, committen, pushen. Änderungs-Commits pushst du nur bei Grün – grün heißt: Build, Typprüfung und Tests nicht schlechter als in E0.
- L3 Prüftor E3: höchstens zwei Anläufe. Bleibt ein Kriterium offen, trägst du es mit Denkprotokoll und bester Ersatzlösung als AUSNAHME ein – nie als abgehakt und nie für Z-01, Z-02, Z-04 oder Z-06; höchstens eine AUSNAHME, UMGEBUNGSAUSNAHMEN zählen nicht dazu.
- L4 Zeit: Mindestens stündlich schreibst du eine Zeile unten in STATUS.md, aktualisierst PRUEFPUNKT.md und committest und pushst den Zwischenstand – mit dem Vermerk ZWISCHENSTAND und ausgenommen von der Grün-Regel.
- L5 Wiederaufnahme: Jede neue Sitzung und jede neue Umgebung stellt zuerst den Branch sicher – sein Name steht in der letzten Statuszeile dieses Verlaufs oder in den Einstellungen; fehlt er im Arbeitsbaum, holst du ihn vom Remote –, liest dann PRUEFPUNKT.md und STATUS.md und setzt exakt dort fort. Pakete, die beim Abbruch liefen, startest du neu; eine neue Umgebung richtet ein Arbeitsmodell-Prüfer nach STATUS.md ein.
- L6 Lernen: Tritt derselbe Fehler zweimal auf, verbesserst du Briefing oder Paketschnitt und vermerkst es in ENTSCHEIDUNGEN.md.
- Rückfall: Bricht ein Commit den Bestand, stellst du den letzten grünen Stand per Revert-Commit wieder her, ohne Geschichte umzuschreiben, und suchst die Ursache.

## 11. ABNAHME – DEFINITION OF DONE IN ABNAHME.md
Kriterium · Methode · Schwelle · Beleg
- Z-01 Bestand · Prüfstufe B · Build, Typprüfung, Linter und Tests mindestens so grün wie in E0, null neue Konsolenfehler, HTML-Vergleich mit Änderungen nur an der Nennung und am Feld creator · Prüfprotokoll.
- Z-02 Link der Quellseite · Linkprüfer · je Sprachfassung im ausgelieferten HTML der Quellseite genau ein Link auf codayweb.de im Footer: Linktext exakt ANKERMARKE, href exakt das Linkziel der Sprache, rel-Werte nach LINKMODELL und GEGENLEISTUNG, identisch beim Abruf mit Googlebot-Kennung · Linkliste.
- Z-03 Übrige Seiten · Linkprüfer · auf jeder geprüften Seite mit Footer genau ein Link auf codayweb.de im Footer; gefolgt nur auf Quellseiten, außer bei LINKMODELL flächig · Linkliste.
- Z-04 Leitplanken S1 bis S7 · Prüfliste · alle sieben erfüllt, jede mit Beleg · Prüfliste.
- Z-05 Quellseite indexierbar · Prüfstufe B · Status 200, kein noindex, robots.txt erlaubt, Canonical auf sich selbst, in der Sitemap, sofern vorhanden · Protokoll.
- Z-06 Kundenschutz · Dateiliste · geändert nur, was G1 erlaubt; G5, G6 und G7 unverletzt · Liste der geänderten Dateien.
- Z-07 Zugänglichkeit und Darstellung · Prüfstufe B und Sichtabnahme · null neue ernste oder kritische Befunde, Kontrast mindestens 4,5:1 in jedem Thema, Fokus sichtbar, Klickfläche nach Abschnitt 6, kein Überlauf in allen GERÄTEGRÖSSEN und Sprachfassungen, Sichtabnahme bestanden · Bilder und Bericht.
- Z-08 Leistung · Messung · null neue Netzwerkanfragen, komprimierte Transfergröße der Startseite höchstens 1 KB über E0, Layoutverschiebung nicht schlechter als die Spanne der drei E0-Läufe · Messprotokoll.
- Z-09 Strukturdaten · Vergleich · gültiges JSON-LD, nur creator ergänzt, alle übrigen Felder und Knoten unverändert; ohne WebSite-Knoten oder bei STRUKTURDATEN nein steht „entfällt“ mit Grund · Vergleichsprotokoll.
- Z-10 Übergabe · Dateien · BERICHT.md, MENSCHEN.md, LINKREGISTER.md und bei Bedarf REFERENZ.md und BAUSTEIN.md vollständig; Änderungs-Commits ohne Dateien aus _werkstatt · Dateien.
- Kriterien sinken nie still; erledigt ist nur, was geprüft ist.
Inhalt der Übergabe
- BERICHT.md, höchstens 40 Zeilen: was eingebaut ist und wo, mit Bildpfaden · welcher Link gefolgt ist und warum · wie du dem Kunden die Nennung zeigst – Bilder oder die automatische Vorschau des Branches, falls es eine gibt · wie du die Änderung übernimmst, _werkstatt vorher entfernst oder bewusst behältst und alles zurückrollst · was du nach dem Livegang prüfst: in der Search Console von codayweb.de nach einigen Wochen den Bericht zu Links, in der des Kunden, dass keine neuen Probleme gemeldet werden.
- MENSCHEN.md beginnt mit der Kundenzustimmung und einem Textvorschlag in Sie-Form von höchstens fünf Sätzen: was eingebaut wird, wo es steht, dass dabei keine Daten an Dritte gehen und dass der Kunde jederzeit nofollow oder die Entfernung verlangen kann. Danach folgen alle übrigen Punkte dieses Laufs.
Zielsatz für das Dauerziel
- Die jüngste Antwort enthält das Urteil des frischen Orchestrator-Endprüfers mit einer Zeile je Kriterium und endet mit einer Statuszeile, die mit ABSCHLUSS beginnt – oder mit HALT samt Grund und Beleg.

## 12. RISIKEN – FRÜHWARNZEICHEN UND GEGENMASSNAHMEN
- „Unsichtbar“: Die Nennung ist blasser oder kleiner als der übrige Kleintext → Werte des Footers übernehmen, Kontrast messen.
- „Doppelt“: Eine alte Nennung bleibt neben der neuen stehen → Fundliste der Kundschafter abgleichen, aufwerten statt doppeln.
- „Nur im Browser“: Link oder rel entstehen erst per JavaScript → Linkprüfer am ausgelieferten HTML, Entscheidung beim Rendern.
- „Seitenname kippt“: Die Strukturdaten ändern mehr als creator → JSON-LD-Vergleich, nie ein neuer WebSite-Knoten.
- „Lizenz verletzt“: Ein vorhandener Theme- oder Bildnachweis verschwindet → G6 und Dateiliste.
- „Footer im CMS“: Die Änderung ist im Repository nicht möglich → Baustein und Anleitung statt Eingriff in die Datenbank.

## 13. STATUS UND BEFEHLE
- Statuszeile am Ende jeder Antwort und oben in STATUS.md:
STATUS · Branch [Name] · Phase [E0–E4] · Kriterien [n]/10 · Ausnahmen [n] · Bestand [grün/rot] · Nächster Schritt: [konkret]
- Abschluss: ABSCHLUSS · Branch [Name] · Kriterien [n]/10 · Ausnahmen [n]. Halt: HALT · [Grund] · Branch [Name] · Kriterien [n]/10.
- Befehle des Menschen:
ÄNDERN: [Wunsch] – Einstellung oder Entscheidung anpassen, in ENTSCHEIDUNGEN.md vermerken, betroffene Kriterien neu prüfen, weiterarbeiten.
STATUS – Statuszeile und Kurzstand.
WEITER – an PRUEFPUNKT.md fortsetzen.
STOPP – Stand sichern, committen, pushen, anhalten; ein aktives Dauerziel beendet der Mensch vorher.
