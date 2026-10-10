# P1-KUND-03 · Rolle Kundschafter · Stufe 1 · Kern-Version 0
Schreibrechte: `_relaunch/atlas/alt-shell-recht-seo.md`
Umfang: Altatlas des Seitenrahmens (Kopf, Oberleiste, Mobilmenü, Fuß, schwebende Widgets, Cookie-Banner, 404/Fehler), der Rechtsseiten und aller Such-/Technik-Elemente.

## Rollenbriefing
Du erfasst Seiten, Komponenten, Texte, Medien, Bewegungen und Metadaten vollständig mit Fundstelle. Häufige Fehler: nur die Navigation lesen und Seiten übersehen; zusammenfassen statt auflisten; Vermutung als Befund.

## Aufgabe in einem Satz
Erfasse jedes Element von Seitenrahmen, Rechtsseiten und Such-/Technik-Schicht des Altstands im Atlas-Format mit Fundstelle.

## Das Projekt in fünf Sätzen / Kern-Auszug / Quellen / Atlas-Format / Grenzen / Ausgabeformular
Siehe `_relaunch/pakete/_gemeinsam-p0.md` und `_relaunch/pakete/_gemeinsam-p1.md` – gelten wortgleich.

## Schritte
1. Lies vollständig (Altstand): `components/Header.tsx`, `components/navigation/MobileMenuDrawer.tsx`, `MotionHamburgerIcon.tsx`, `components/Footer.tsx`, `components/layout/LayoutClientWidgets.tsx`, `components/QuickApplySidebar.tsx`, `components/contact/FloatingWhatsAppWidget.tsx`, `components/ui/BackToTop.tsx`, `components/CookieConsent.tsx`, `components/Logo.tsx`, `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx`, `app/datenschutz/page.tsx` + `layout.tsx`, `app/impressum/page.tsx`, `app/layout.tsx` (Metadaten und JSON-LD-Graph), `app/robots.ts`, `app/sitemap.ts`, `app/llms.txt/route.ts`, `app/llms-full.txt/route.ts`, `app/298d966b7e4f4a43981cb8e30da6b5b5.txt/route.ts`, `middleware.ts`, `next.config.ts`, `lib/seo/site-config.ts`, `app/globals.css` (nur Druck-Regeln und Keyframes).
2. `ALT-SHELL-*`: Oberleiste (jeder Text/Link, inkl. „Zur Kunden-Website …“, Telefon, Hinweise), Kopf (Logo, Navigationspunkte wörtlich mit Ziel, Stellen-Badge, CTA), Mobilmenü (jede Gruppe und jeder Eintrag, Animation), Hamburger-Morph, Fuß (jede Spalte, jeder Link mit Ziel, Siegel/Texte, Rechtszeile, Cookie-Einstellungen-Link), Schnellbewerbungs-Seitenleiste, WhatsApp-Widget (Verhalten, Texte), Nach-oben-Knopf, Cookie-Banner (Kategorien, Texte, Knöpfe, gespeicherte Schlüssel), 404 (Texte wörtlich, Knöpfe, Grafik), Fehlerseiten.
3. `ALT-RECHT-*`: Datenschutz (Aufbau: Kennzahlenkarten, Inhaltsverzeichnis mit Suche, jede Abschnittsüberschrift §01–§07 wörtlich, Aufklapper, Druck-Knopf, Stand-Angabe), Impressum (jede Pflichtangabe wörtlich: Firma, Anschrift, Vertretung, Register, USt-IdNr., Kammer, Berufsbezeichnung, Streitbeilegung, Haftung).
4. `ALT-SEO-*`: je Seite Titel und Beschreibung wörtlich, canonical, OpenGraph/Twitter, jeder JSON-LD-Knoten (`@type`, Name, wichtigste Eigenschaften), robots-Regeln, Sitemap-Einträge, llms-Texte (Gliederung), IndexNow-Schlüsselroute, Sicherheits-Header, Bot-Filter.
5. Bildschirmfotos zuordnen (Port 3600, User-Agent aus Quellen; 404 über `/gibt-es-nicht-404`).
6. Am Ende: Zählung je Kategorie; Liste aller Routen/URLs, die der Altstand ausliefert (inkl. Textrouten).

## Selbstprüfung
- Jeder Fußlink mit Ziel? Jede Pflichtangabe im Impressum wörtlich? Jeder JSON-LD-Knoten?
- Markiere Unsicheres als OFFENE FRAGE statt zu raten, und erfülle nur deinen Auftrag.
=== ENDE P1-KUND-03 · BEREIT ZUR RÜCKGABE === (diese Zeile setzt du an das Ende deiner Antwort)
