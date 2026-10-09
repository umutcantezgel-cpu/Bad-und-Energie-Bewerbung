# Meta-, Such- und Wegeprüfung · P0-SLOP-01

Erstellt 2026-10-09T07:56:01.085Z · Basis http://localhost:3500
Messbedingungen: d1440 hell · networkidle + scrollThrough (scroll-behavior: auto) + 300 ms · GET über Playwright APIRequestContext, maxRedirects 0 (Linkziele, alte Pfade), nur Basisadresse

## Zählung

| Messgröße | Wert |
| --- | --- |
| Seiten (Grundmenge) | 12 |
| Statuscodes | 200: 11 · 404: 1 |
| ohne title / ohne description | 0 / 0 |
| ohne canonical · Pfad weicht von Seite ab · Hosts | 1 · 1 · karriere.bad-energie.de, localhost:3500 |
| noindex-Seiten | /bewerbung/danke, /bewerbung/mappe, /datenschutz, /impressum, /gibt-es-nicht-404 |
| og unvollständig · twitter unvollständig | 1 · 0 |
| Seiten mit hreflang | 0 |
| JSON-LD-Blöcke · ungültig · Typen | 19 · 0 · FAQPage, Organization, WebSite, LocalBusiness, BreadcrumbList, JobPosting, WebPage |
| Seiten ohne JSON-LD | – |
| Seiten mit h1-Anzahl ≠ 1 | – |
| Bilder gesamt · alt fehlt · alt nur Leerraum · dekorativ (alt="") | 12 · 0 · 0 · 0 |
| interne Links geprüft (Anker · Pfade) · nicht in Ordnung · Weiterleitungen | 228 (45 · 183) · 0 · 0 |
| einzigartige Linkziele (GET) | 12 |
| Sitemap: Status · Einträge · Grundmenge ohne Sitemap · Sitemap ohne Grundmenge | 200 · 7 · 5 · 0 |
| robots.txt: Status · für * gesperrte Grundmengen-Seiten | 200 · 0 |
| alte Pfade/Anker: gesamt · ok · Weiterleitung · Anker fehlt · nicht erreichbar | 24 · 15 · 1 · 8 · 0 |

## Seiten

| Seite | Status | title (Zeichen) | description (Zeichen) | canonical | robots | og fehlend | twitter fehlend | hreflang | JSON-LD (@type) | h1 | Bilder (ohne alt / dekorativ) | Links |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | 200 | 51 | 140 | karriere.bad-energie.de | index, follow | – | – | – | 2: FAQPage, Organization, WebSite, LocalBusiness | 1 | 0 / 0 von 1 | 34 |
| /jobs | 200 | 56 | 155 | karriere.bad-energie.de/jobs | index, follow | – | – | – | 2: BreadcrumbList, Organization, WebSite, LocalBusiness | 1 | 0 / 0 von 1 | 30 |
| /jobs/anlagenmechaniker-shk-wetzlar | 200 | 54 | 147 | karriere.bad-energie.de/jobs/anlagenmechaniker-shk-wetzlar | index, follow | – | – | – | 2: JobPosting, BreadcrumbList, Organization, WebSite, LocalBusiness | 1 | 0 / 0 von 1 | 34 |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | 200 | 59 | 153 | karriere.bad-energie.de/jobs/kundendiensttechniker-waermepumpe-wetzlar | index, follow | – | – | – | 2: JobPosting, BreadcrumbList, Organization, WebSite, LocalBusiness | 1 | 0 / 0 von 1 | 34 |
| /jobs/obermonteur-projektleiter-shk-wetzlar | 200 | 51 | 151 | karriere.bad-energie.de/jobs/obermonteur-projektleiter-shk-wetzlar | index, follow | – | – | – | 2: JobPosting, BreadcrumbList, Organization, WebSite, LocalBusiness | 1 | 0 / 0 von 1 | 34 |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | 200 | 53 | 145 | karriere.bad-energie.de/jobs/ausbildung-anlagenmechaniker-shk-wetzlar | index, follow | – | – | – | 2: JobPosting, BreadcrumbList, Organization, WebSite, LocalBusiness | 1 | 0 / 0 von 1 | 34 |
| /bewerbung → (Skript, nach dem Laden) /bewerbung?schritt=stelle | 200 | 57 | 141 | localhost:3500/bewerbung | index, follow | – | – | – | 2: WebPage, Organization, WebSite, LocalBusiness | 1 | 0 / 0 von 1 | 10 |
| /bewerbung/danke | 200 | 50 | 111 | karriere.bad-energie.de/bewerbung/danke | noindex, follow | – | – | – | 1: Organization, WebSite, LocalBusiness | 1 | 0 / 0 von 1 | 10 |
| /bewerbung/mappe | 200 | 50 | 140 | karriere.bad-energie.de/bewerbung/mappe | noindex, follow | – | – | – | 1: Organization, WebSite, LocalBusiness | 1 | 0 / 0 von 1 | 5 |
| /datenschutz | 200 | 45 | 151 | karriere.bad-energie.de/datenschutz | noindex, follow | – | – | – | 1: Organization, WebSite, LocalBusiness | 1 | 0 / 0 von 1 | 48 |
| /impressum | 200 | 34 | 148 | karriere.bad-energie.de/impressum | noindex, follow | – | – | – | 1: Organization, WebSite, LocalBusiness | 1 | 0 / 0 von 1 | 34 |
| /gibt-es-nicht-404 | 404 | 45 | 81 | fehlt | noindex | og:url | – | – | 1: Organization, WebSite, LocalBusiness | 1 | 0 / 0 von 1 | 23 |

### title und description im Wortlaut

| Seite | title | description |
| --- | --- | --- |
| / | SHK Jobs Wetzlar: Anlagenmechaniker & Heizungsbauer | SHK-Jobs in Wetzlar: Anlagenmechaniker, Kundendienst, Obermonteur & Ausbildung. 30 Tage Urlaub, freitags ab 13:30 frei. In 60 Sek. bewerben. |
| /jobs | Stellenangebote SHK Wetzlar & Gießen – alle offenen Jobs | Offene SHK-Jobs in Wetzlar & Gießen: Anlagenmechaniker, Kundendienst, Obermonteur, Ausbildung. 30 Tage Urlaub, freitags ab 13:30 frei. In 60 Sek. bewerben. |
| /jobs/anlagenmechaniker-shk-wetzlar | Anlagenmechaniker SHK (m/w/d) Job Wetzlar – Wärmepumpe | Anlagenmechaniker SHK in Wetzlar: Wärmepumpen & Bäder im 35-km-Umkreis, 3.600–4.600 €, 30 Tage Urlaub, freitags ab 13:30 frei. In 60 Sek. bewerben. |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | Kundendiensttechniker Heizung & Wärmepumpe – Wetzlar/Gießen | Kundendiensttechniker SHK (m/w/d) in Wetzlar: Wärmepumpen-Service, 3.800–4.900 €, eigenes Servicefahrzeug, kein Wochenend-Notdienst. In 60 Sek. bewerben. |
| /jobs/obermonteur-projektleiter-shk-wetzlar | Obermonteur / Projektleiter SHK Job Wetzlar (m/w/d) | Obermonteur / Projektleiter SHK (m/w/d) in Wetzlar: Bäder & Heizungsprojekte eigenverantwortlich leiten, 4.400–5.600 €, 30 Tage Urlaub. Jetzt bewerben. |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | Ausbildung Anlagenmechaniker SHK Wetzlar (m/w/d) 2026 | Ausbildung Anlagenmechaniker SHK in Wetzlar – Einstieg 2026 noch möglich: eigenes Hilti-Werkzeugset, 1.050–1.400 € im Monat, Fahrtkostenzuschuss. |
| /bewerbung | Bewerben in 60 Sekunden – ohne Lebenslauf \| Bad & Energie | Bewirb dich in ca. 60 Sekunden bei Bad und Energie in Wetzlar: ein paar kurze Fragen, Name und Telefon. Kein Lebenslauf nötig, 100 % diskret. |
| /bewerbung/danke | Danke für deine Bewerbung \| Bad & Energie Karriere | Bestätigung deiner Bewerbung bei Bad und Energie: Bewerbungsnummer, nächste Schritte und optionale Ergänzungen. |
| /bewerbung/mappe | Bewerbungsmappe erstellen \| Bad & Energie Karriere | Anschreiben und Lebenslauf auf A4 für deine Bewerbung bei Bad und Energie in Wetzlar: ausfüllen, als PDF speichern oder drucken. Freiwillig. |
| /datenschutz | Datenschutzerklärung \| Bad & Energie Karriere | Datenschutz bei Bad und Energie in Wetzlar: Bewerbungsdaten, Entwurf im Browser, Herkunftsmessung ohne Cookies, Google Maps per Klick und deine Rechte. |
| /impressum | Impressum \| Bad & Energie Karriere | Anbieterkennzeichnung nach § 5 DDG und Handwerksordnung der Bad und Energie GmbH Lahn Dill in Wetzlar: Kontakt, Handelsregister und Handwerkskammer. |
| /gibt-es-nicht-404 | Seite nicht gefunden \| Bad & Energie Karriere | Diese Seite gibt es nicht. Hier geht es zu den offenen Stellen und zur Bewerbung. |

### Bilder mit fehlendem oder leerem alt (0)

Keine.

### Dekorative Bilder (alt="")  (0)

Keine.

### og- und twitter-Werte (erste Seite je Art, Wortlaut)

| Schlüssel | Wert (/) |
| --- | --- |
| og:title | SHK Jobs Wetzlar: Anlagenmechaniker & Heizungsbauer |
| og:description | SHK-Jobs in Wetzlar: Anlagenmechaniker, Kundendienst, Obermonteur & Ausbildung. 30 Tage Urlaub, freitags ab 13:30 frei. In 60 Sek. bewerben. |
| og:url | https://karriere.bad-energie.de |
| og:site_name | Bad und Energie GmbH Lahn Dill |
| og:locale | de_DE |
| og:image | https://karriere.bad-energie.de/opengraph-image?eb2cfa3c47c4d578 |
| og:image:type | image/png |
| og:image:width | 1200 |
| og:image:height | 630 |
| og:image:alt | Bad und Energie GmbH Lahn Dill: SHK-Jobs in Wetzlar |
| og:type | website |
| twitter:card | summary_large_image |
| twitter:title | SHK Jobs Wetzlar: Anlagenmechaniker & Heizungsbauer |
| twitter:description | SHK-Jobs in Wetzlar: Anlagenmechaniker, Kundendienst, Obermonteur & Ausbildung. 30 Tage Urlaub, freitags ab 13:30 frei. In 60 Sek. bewerben. |
| twitter:image | https://karriere.bad-energie.de/opengraph-image?eb2cfa3c47c4d578 |
| twitter:image:alt | Bad und Energie GmbH Lahn Dill: SHK-Jobs in Wetzlar |
| twitter:image:type | image/png |
| twitter:image:width | 1200 |
| twitter:image:height | 630 |

### Links, die nicht in Ordnung sind (0)

Keine.

### Linkziele (einzigartig, GET ohne Weiterleitung)

| Ziel | Status | Inhaltstyp | Weiterleitung nach |
| --- | --- | --- | --- |
| `/` | 200 | text/html; charset=utf-8 | – |
| `/bewerbung` | 200 | text/html; charset=utf-8 | – |
| `/bewerbung/mappe` | 200 | text/html; charset=utf-8 | – |
| `/bewerbung?stelle=initiativ` | 200 | text/html; charset=utf-8 | – |
| `/bewerbung?stelle=quereinsteiger-montagehelfer-shk-wetzlar` | 200 | text/html; charset=utf-8 | – |
| `/datenschutz` | 200 | text/html; charset=utf-8 | – |
| `/impressum` | 200 | text/html; charset=utf-8 | – |
| `/jobs` | 200 | text/html; charset=utf-8 | – |
| `/jobs/anlagenmechaniker-shk-wetzlar` | 200 | text/html; charset=utf-8 | – |
| `/jobs/ausbildung-anlagenmechaniker-shk-wetzlar` | 200 | text/html; charset=utf-8 | – |
| `/jobs/kundendiensttechniker-waermepumpe-wetzlar` | 200 | text/html; charset=utf-8 | – |
| `/jobs/obermonteur-projektleiter-shk-wetzlar` | 200 | text/html; charset=utf-8 | – |

## Sitemap und robots.txt

Sitemap: Status 200 · application/xml · 7 Einträge · Host(s) in den URLs: karriere.bad-energie.de (Pfade werden gegen localhost:3500 geprüft)

| Sitemap-URL | Status lokal | in Grundmenge | noindex auf Seite | canonical-Pfad gleich |
| --- | --- | --- | --- | --- |
| https://karriere.bad-energie.de/ | 200 | ja | false | true |
| https://karriere.bad-energie.de/jobs | 200 | ja | false | true |
| https://karriere.bad-energie.de/jobs/anlagenmechaniker-shk-wetzlar | 200 | ja | false | true |
| https://karriere.bad-energie.de/jobs/kundendiensttechniker-waermepumpe-wetzlar | 200 | ja | false | true |
| https://karriere.bad-energie.de/jobs/obermonteur-projektleiter-shk-wetzlar | 200 | ja | false | true |
| https://karriere.bad-energie.de/jobs/ausbildung-anlagenmechaniker-shk-wetzlar | 200 | ja | false | true |
| https://karriere.bad-energie.de/bewerbung | 200 | ja | false | true |

Abgleich Grundmenge ↔ Sitemap:

| Seite | in Sitemap | noindex | Status | für * gesperrt | Auffälligkeit |
| --- | --- | --- | --- | --- | --- |
| / | ja | false | 200 | nein | – |
| /jobs | ja | false | 200 | nein | – |
| /jobs/anlagenmechaniker-shk-wetzlar | ja | false | 200 | nein | – |
| /jobs/kundendiensttechniker-waermepumpe-wetzlar | ja | false | 200 | nein | – |
| /jobs/obermonteur-projektleiter-shk-wetzlar | ja | false | 200 | nein | – |
| /jobs/ausbildung-anlagenmechaniker-shk-wetzlar | ja | false | 200 | nein | – |
| /bewerbung | ja | false | 200 | nein | – |
| /bewerbung/danke | nein | true | 200 | nein | – |
| /bewerbung/mappe | nein | true | 200 | nein | – |
| /datenschutz | nein | true | 200 | nein | – |
| /impressum | nein | true | 200 | nein | – |
| /gibt-es-nicht-404 | nein | true | 404 | nein | – |

robots.txt: Status 200 · 4 Gruppen · Sitemap-Zeilen: https://karriere.bad-energie.de/sitemap.xml

| User-agent | Allow | Disallow |
| --- | --- | --- |
| Googlebot, Bingbot, DuckDuckBot | / | /api/ /admin/ |
| GPTBot, ChatGPT-User, OAI-SearchBot, Google-Extended, anthropic-ai, ClaudeBot, PerplexityBot, CCBot, Applebot-Extended, Amazonbot, Cohere-ai, YouBot | / | /api/ /admin/ |
| SemrushBot, PetalBot, DotBot, MJ12bot, BLEXBot, DataForSeoBot, MegaIndex, Bytespider | – | / |
| * | / | /api/ /admin/ |

## Alte Pfade und Anker (24) aus _relaunch/.roh/P0-SLOP-01/alt-urls.json

| Eintrag | Status (ohne Weiterleitung) | Ziel bei 30x | Endstatus | Anker vorhanden | Ergebnis |
| --- | --- | --- | --- | --- | --- |
| `/` | 200 | – | 200 | – | ok |
| `/bewerbung` | 200 | – | 200 | – | ok |
| `/bewerbung?tab=quiz` | 200 | – | 200 | – | ok |
| `/bewerbung?tab=vault` | 200 | – | 200 | – | ok |
| `/bewerbung?tab=form` | 200 | – | 200 | – | ok |
| `/bewerbung?tab=dossier` | 308 | /bewerbung/mappe | 200 | – | Weiterleitung 308 → /bewerbung/mappe |
| `/bewerbung?direct=true` | 200 | – | 200 | – | ok |
| `/datenschutz` | 200 | – | 200 | – | ok |
| `/datenschutz#bewerberdaten` | 200 | – | 200 | ja (/datenschutz) | ok |
| `/impressum` | 200 | – | 200 | – | ok |
| `/llms.txt` | 200 | – | 200 | – | ok |
| `/llms-full.txt` | 200 | – | 200 | – | ok |
| `/298d966b7e4f4a43981cb8e30da6b5b5.txt` | 200 | – | 200 | – | ok |
| `/#express-funnel` | 200 | – | 200 | NEIN | Anker fehlt |
| `/#stellen` | 200 | – | 200 | ja (/) | ok |
| `/#gehalt` | 200 | – | 200 | NEIN | Anker fehlt |
| `/#karriere-paket` | 200 | – | 200 | NEIN | Anker fehlt |
| `/#benefits` | 200 | – | 200 | NEIN | Anker fehlt |
| `/#ausstattung` | 200 | – | 200 | NEIN | Anker fehlt |
| `/#wechsel-prozess` | 200 | – | 200 | NEIN | Anker fehlt |
| `/#einsatzgebiet` | 200 | – | 200 | ja (/) | ok |
| `/#bewertungen` | 200 | – | 200 | NEIN | Anker fehlt |
| `/#kontakt` | 200 | – | 200 | NEIN | Anker fehlt |
| `/#faq` | 200 | – | 200 | ja (/) | ok |

## Hinweise zur Methode

- Kopfdaten und Links stammen aus dem DOM nach networkidle (nicht aus dem Rohquelltext); die Plattform liefert sie serverseitig, so dass beides übereinstimmen sollte, ohne dass dieses Skript es einzeln prüft.
- Linkziele: je einzigartigem Pfad inklusive Query ein GET ohne Weiterleitung; 2xx = in Ordnung, 3xx = Weiterleitung (mit Ziel ausgewiesen), sonst Befund. Ziele mit #Anker werden zusätzlich auf Existenz der ID im DOM bzw. im Quelltext der Zielseite geprüft.
- canonical, og:url und Sitemap-URLs nennen die Produktionsadresse; es wird der Pfad mit der lokalen Seite verglichen, der Host wird nur ausgewiesen.
- „alt nur Leerraum“ = alt-Attribut mit Leerzeichen statt leer; `alt=""` gilt als dekorativ und wird gesondert gezählt.
- Alte Pfade: Status ohne Weiterleitung folgen (maxRedirects 0), bei 30x Kette bis fünf Schritte; Anker werden im DOM der Endseite gesucht (networkidle).
