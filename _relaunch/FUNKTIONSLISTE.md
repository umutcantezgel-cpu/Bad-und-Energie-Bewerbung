# Funktionsliste der Plattform (Bestandsschutz, Ausgangsstand a83269d)

Jede Funktion muss nach jeder Welle so funktionieren wie hier beschrieben (Z-05). Prüfweg: E2E = vorhandener Playwright-Test; U = Vitest; H = Handprüfung per Werkzeug.

| F | Funktion | Ort | Prüfweg |
|---|---|---|---|
| F-01 | Bewerbungsflow „Bewerben in 60 Sekunden“ eingebettet auf Stellenseite bis Danke-Seite | `components/apply/*`, `/jobs/[slug]#bewerben` | E2E apply „eingebettet auf der Stellenseite“ |
| F-02 | Bewerbungsflow auf /bewerbung mit `?stelle=`-Vorauswahl | `/bewerbung` | E2E apply „Bewerbungsseite mit ?stelle=“ |
| F-03 | Flow nur per Tastatur bedienbar | `/bewerbung` | E2E apply „nur mit der Tastatur“ |
| F-04 | Browser-Zurück/-Vor zwischen Flow-Schritten (URL-Schritte `?schritt=`) | `/bewerbung` | E2E apply „Browser-Zurück und -Vor“ |
| F-05 | Entwurf in sessionStorage, Wiederherstellung nach Neuladen | `/bewerbung` | E2E apply „Neuladen stellt den Entwurf wieder her“ |
| F-06 | Alter localStorage-Eintrag `bad_energie_dossier` wird gelöscht | `/bewerbung` | E2E apply |
| F-07 | 503 → ehrlicher Fehler mit WhatsApp-/Telefon-Rückfallweg | `SubmitErrorPanel` | E2E apply „503 zeigt den WhatsApp-Rückfallweg“ |
| F-08 | Pflichtfeldfehler mit Fokus auf erstem fehlerhaften Feld | `ContactStep` | E2E apply |
| F-09 | Kein Doppel-Submit | `ContactStep` | E2E apply |
| F-10 | Legacy-`?tab=`-Zuordnung auf /bewerbung | `app/bewerbung/page.tsx` | U (lib/apply) + H |
| F-11 | Danke-Seite mit Referenz, Ablauf, vCard, Ergänzung per Follow-up-Token | `/bewerbung/danke`, `/api/bewerbung/ergaenzung` | U + H |
| F-12 | Bewerbungsmappe: Stationen-Editor, Anschreiben, Foto (im Speicher), A4-Vorschau, Druck, Übergabe an Flow | `/bewerbung/mappe` | E2E mappe (2 Tests) |
| F-13 | Stellenübersicht und Stellenseiten mit Gehaltsspanne, Paket, Ablauf, FAQ, Teamzitat | `/jobs`, `/jobs/[slug]` | E2E seo + H |
| F-14 | JobPosting-JSON-LD nur auf Stellenseiten; Breadcrumbs; OG-Bilder je Stelle | `lib/jobs/jsonld.ts`, `opengraph-image.tsx` | E2E seo + `bun run test:graph` |
| F-15 | Feeds indeed.xml, jobs.xml, jobs.json | `/feeds/*` | E2E seo |
| F-16 | Sitemap, robots, llms.txt, llms-full.txt aus der Registry | `app/*` | E2E seo + H |
| F-17 | Region: Radius-Grafik, Pendelrechner (Ort wählen → km/Minuten), Tabelle | `components/maps/*` | U (lib/maps) + H |
| F-18 | Google Maps erst nach Klick (Zwei-Klick-Einwilligung, widerrufbar) | `RegionExplorer`, `GoogleRegionMap` | U + H (ohne Laden von Google) |
| F-19 | Bewertungsband mit Filtern und Knöpfen, ohne Autoplay | `components/reviews/*` | U + H |
| F-20 | FAQ als native Aufklapper + FAQPage-JSON-LD | `FaqSection`, `JobFaq` | H |
| F-21 | Kopf: Navigation, Telefon, „Bewerben“; Fokusmodus auf /bewerbung* („Abbrechen“/„Zur Startseite“) | `components/site/*` | U (nav) + H |
| F-22 | Mobilmenü als Sheet (natives dialog) | `MobileNav` | H |
| F-23 | Mobile Sticky-Bewerbungsleiste, blendet sich bei sichtbarer Primäraktion / Tastatur aus | `StickyApplyBar*` | U (nav) + H |
| F-24 | Hell-/Dunkelmodus per `prefers-color-scheme`, Inverse-Band | `app/styles/theme.css` | E2E (4 Projekte) |
| F-25 | Sprunglink zum Inhalt | `components/ui/SkipLink` | E2E pages + H |
| F-26 | Datenschutz/Impressum als lesbare Dokumente mit Inhaltsverzeichnis | `components/legal/*` | E2E pages |
| F-27 | 404 mit Status 404, Fehlerseiten | `app/not-found.tsx`, `error.tsx` | H |
| F-28 | Attributionserfassung (UTM, ref, Referrer-Host) im Speicher, ohne Cookies | `components/analytics/AttributionCapture` | U |
| F-29 | Sicherheit: proxy.ts (Scraper 403, Maps-Config nur eigene Seite), CSP Report-Only, CSRF/Rate-Limit/Body-Größe in Formular-APIs, IndexNow mit Bearer | `proxy.ts`, `lib/security/*`, `app/api/*` | U |
| F-30 | Druck: Seiten im Druck hell, Mappe als A4 | `globals.css` print, `mappe.module.css` | H |
