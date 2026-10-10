# Betrieb: Go-live und laufender Betrieb

Stand: 2026-10-10 · Phase 2b (Bewerbungen kommen per E-Mail und zusätzlich in die Datenbank, sobald Supabase konfiguriert ist; das Postfach bleibt bis zum Cockpit die Arbeitsablage)

Diese Anleitung richtet sich an alle, die die Website live schalten und Bewerbungen bearbeiten. Technischer Hintergrund: [README](../../README.md), Plan: [ROADMAP](../ROADMAP.md).

## Inhalt

1. [Resend-Key rotiert (erledigt)](#1-resend-key-rotiert-erledigt)
2. [Go-live-Checkliste](#2-go-live-checkliste)
3. [Monitoring und Fehler](#3-monitoring-und-fehler)
4. [Bewerbungs-E-Mails lesen](#4-bewerbungs-e-mails-lesen)
5. [Ergänzungen und Unterlagen zuordnen](#5-ergänzungen-und-unterlagen-zuordnen)
6. [Löschfristen in Postfach und Datenbank](#6-löschfristen-in-postfach-und-datenbank)

---

## 1. Resend-Key rotiert (erledigt)

Commit `9717265` hat einen echten Resend-Key in `.env.example` veröffentlicht. Er steht für immer im öffentlichen Git-Verlauf und gilt als kompromittiert (ROADMAP §9.1, §13).

1. Im [Resend-Dashboard](https://resend.com) unter **API Keys** den alten Key löschen.
2. Einen neuen Key anlegen: Berechtigung nur **Sending access**, beschränkt auf die Absender-Domain.
3. Den neuen Key nur in Vercel eintragen (`RESEND_API_KEY`, Environment Production, als „Sensitive“), nie ins Repo oder in Chats.
4. In Resend unter **Emails** bzw. **Logs** prüfen, ob seit der Veröffentlichung fremde Mails über das Konto verschickt wurden. Auffälligkeiten festhalten und mit der oder dem DSB klären.
5. Neu deployen (siehe 2.6).
6. Festgehalten: **Alter Key widerrufen am:** 2026-10-08 · **neuer Key in Vercel (`RESEND_API_KEY`) seit:** 2026-10-08 · **Resend-Logs geprüft:** keine fremden Mails · **bestätigt von:** Owner. Damit ist die Ausnahme für den alten Key in `.gitleaks.toml` gedeckt; der Key steht weiterhin im Git-Verlauf, ist aber wertlos.

## 2. Go-live-Checkliste

- [ ] 2.1 Resend-Domain `karriere.bad-energie.de` verifiziert (Standardabsender)
- [ ] 2.2 Umgebungsvariablen in Vercel gesetzt (Resend-Key, Supabase; eigene Geheimnisse empfohlen)
- [ ] 2.3 IndexNow-Key und Prüfdatei passen zusammen
- [ ] 2.4 Google-Maps-Key beschränkt, Rechnungskonto verknüpft (optional)
- [ ] 2.5 Vercel-Projekt eingerichtet (Region, Build, Domain)
- [ ] 2.6 Deploy, `/api/status` und Funktionsprobe mit Testbewerbung
- [ ] 2.7 Search Console und Test für Rich-Suchergebnisse
- [ ] 2.8 Indeed-Aufnahme angefragt
- [ ] 2.9 Stellen bei der Bundesagentur für Arbeit und der HWK eingestellt
- [ ] 2.10 Monitoring eingerichtet (Logs, CSP-Meldungen)

### 2.1 Resend-Domain verifizieren

1. In Resend unter **Domains** die Domain des Absenders anlegen. Der Standardabsender ist `bewerbung@karriere.bad-energie.de`, also die Domain `karriere.bad-energie.de`. Resend fragt dabei nach einer Region; die Wahl mit der Datenschutzerklärung abstimmen (Resend ist dort als Auftragsverarbeiter genannt).
2. Die angezeigten DNS-Einträge (DKIM, SPF und MX für die Rücklauf-Subdomain) genau so beim DNS-Anbieter von bad-energie.de eintragen und warten, bis Resend „Verified“ zeigt.
   Stand 2026-10-10 (geprüft über dns.google): Für `karriere.bad-energie.de` stehen die Resend-Einträge im DNS (`resend._domainkey` sowie MX und SPF für `send.karriere.bad-energie.de`, Region `eu-west-1`). Für `bad-energie.de` gibt es keine; ein Absender `@bad-energie.de` würde abgelehnt.
3. DMARC: Hat bad-energie.de eine DMARC-Richtlinie, gilt sie auch für die Subdomain (sofern kein eigener `sp`-Wert gesetzt ist). Nach der Testbewerbung (2.6) im Mail-Header prüfen, dass SPF, DKIM und DMARC „pass“ zeigen.
4. `RESEND_FROM_EMAIL` nur setzen, wenn ein anderer Absender gelten soll. Ohne Wert gilt `Bad und Energie Karriere <bewerbung@karriere.bad-energie.de>`. Anführungszeichen um den Wert schaden nicht.

Ohne verifizierte Domain lehnt Resend den Versand ab; die Website nimmt dann keine Bewerbung an (503, siehe 3.2).

Die Absenderadresse braucht kein Postfach. Antworten auf die Team-Mail gehen an die Bewerberin bzw. den Bewerber, Antworten auf die Eingangsbestätigung an `CONTACT_NOTIFICATION_EMAIL`. Wer aber auf eine Team-Mail **ohne** angegebene E-Mail-Adresse antwortet, schreibt an die Absenderadresse; das kommt ohne Postfach nicht an (siehe 4.2).

### 2.2 Geheimnisse erzeugen und Umgebungsvariablen setzen

Eigene Werte für `IP_HASH_SALT` und `APPLICATION_TOKEN_SECRET` sind empfohlen, aber keine Pflicht mehr. Fehlen sie oder sind sie ungültig, leitet die Website sie per HMAC aus `RESEND_API_KEY` ab, sonst aus dem Supabase-Server-Key. Der Vorteil eigener Werte: Ein neuer Resend-Key macht dann die Ergänzungs-Links nicht ungültig.

Jedes Geheimnis einzeln erzeugen (mindestens 32 Zeichen; Platzhalter wie `your_…` zählen als nicht gesetzt):

```bash
openssl rand -hex 32   # IP_HASH_SALT
openssl rand -hex 32   # APPLICATION_TOKEN_SECRET
openssl rand -hex 32   # INDEXNOW_SUBMIT_TOKEN
```

Ohne OpenSSL: `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.

In Vercel unter **Settings → Environment Variables** eintragen, Geheimnisse als „Sensitive“:

| Variable | Production | Preview |
|---|---|---|
| `APP_URL` | `https://karriere.bad-energie.de` | nicht setzen (Standard ist die Produktions-URL) |
| `RESEND_API_KEY` | neuer Key aus Abschnitt 1 (Pflicht) | nicht setzen |
| `RESEND_FROM_EMAIL` | nicht setzen (Standardabsender aus 2.1); nur für einen anderen, verifizierten Absender | nicht setzen |
| `CONTACT_NOTIFICATION_EMAIL` | Postfach, das die Bewerbungen bekommt (Standard `info@bad-energie.de`) | nicht setzen |
| `IP_HASH_SALT` | eigener Wert (empfohlen; ohne Wert abgeleitet) | eigener, anderer Wert |
| `APPLICATION_TOKEN_SECRET` | eigener Wert (empfohlen; ohne Wert abgeleitet) | eigener, anderer Wert |
| `SUPABASE_URL` | Projekt-URL `https://<ref>.supabase.co` (Frankfurt); alternativ `NEXT_PUBLIC_SUPABASE_URL` | nicht nötig |
| `SUPABASE_SECRET_KEY` | Secret Key `sb_secret_…` (oder `SUPABASE_SERVICE_ROLE_KEY`, nur `service_role`); nie den Publishable- oder anon-Key | nicht nötig |
| `APPLICATION_SINK` | nicht setzen (`auto`); `email` schaltet die Datenbank ab | nicht setzen (`auto` bleibt dort bei E-Mail); `email` nur zusätzlich, wenn die Supabase-Variablen auch für Preview gelten |
| `EMAIL_SIMULATION` | nicht setzen (dort ohnehin wirkungslos) | `true` |
| `INDEXNOW_KEY` | siehe 2.3 | nicht setzen |
| `INDEXNOW_SUBMIT_TOKEN` | eigener Wert | nicht setzen |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | siehe 2.4 | optional |

Mit `EMAIL_SIMULATION=true` schicken Preview-Deployments keine echten Mails an das Team. In die Datenbank schreiben sie mit `APPLICATION_SINK=auto` nie, auch wenn die Supabase-Variablen dort gelten (etwa über die Vercel-Integration). Ohne eigene Geheimnisse und ohne Resend- oder Supabase-Key antwortet ein Preview-Deployment auf Bewerbungen mit 503; deshalb dort eigene Werte setzen. Die Vercel-Systemvariablen (`VERCEL_ENV`, `VERCEL_URL`) müssen verfügbar bleiben („Automatically expose System Environment Variables“, Standard).

Wichtig:

- `APPLICATION_TOKEN_SECRET` nur bei Verdacht auf ein Leck wechseln. Der Wechsel macht alle Ergänzungs-Links der letzten 14 Tage ungültig. Das gilt auch, wenn ein abgeleiteter Wert erstmals durch einen eigenen ersetzt wird, und solange abgeleitet wird, für jeden neuen `RESEND_API_KEY`.
- `IP_HASH_SALT` lässt sich jederzeit wechseln; nur die Zähler des Rate-Limits beginnen neu.
- `APPLICATION_SINK=email` ist der Notschalter für die Datenbank: Bewerbungen gehen dann wieder nur per E-Mail.
- Änderungen wirken erst nach einem neuen Deploy. Danach `/api/status` prüfen (2.6).

### 2.3 IndexNow

IndexNow meldet neue und geänderte Seiten an Bing, Yandex und weitere Suchmaschinen. Der Key ist per Protokoll öffentlich; geheim ist nur `INDEXNOW_SUBMIT_TOKEN`.

- **Einfachster Weg:** den bisher genutzten Key weiterverwenden. Seine Prüfdatei liegt schon im Repo (`public/298d966b7e4f4a43981cb8e30da6b5b5.txt`), also `INDEXNOW_KEY=298d966b7e4f4a43981cb8e30da6b5b5` setzen.
- **Neuer Key:** `openssl rand -hex 16` erzeugen, per Pull Request die Datei `public/<key>.txt` anlegen (Inhalt: nur der Key), dann `INDEXNOW_KEY` setzen.
- Prüfen: `https://karriere.bad-energie.de/<key>.txt` zeigt den Key.

Nach jedem Deploy mit neuen oder geänderten Stellen einreichen (ohne Body: Startseite, `/jobs`, alle Stellenseiten und `/bewerbung`):

```bash
read -rs INDEXNOW_SUBMIT_TOKEN   # Token einfügen, landet nicht in der Shell-History
curl -X POST https://karriere.bad-energie.de/api/indexnow \
  -H "Authorization: Bearer $INDEXNOW_SUBMIT_TOKEN"
```

Nur einzelne Seiten: zusätzlich `-H "Content-Type: application/json" -d '{"urls":["https://karriere.bad-energie.de/jobs/<slug>"]}'` (höchstens 1000 URLs, nur diese Domain).

| Antwort | Bedeutung |
|---|---|
| 200 | eingereicht |
| 401 | Token falsch |
| 400 | Body ungültig oder fremde Domain |
| 502 | IndexNow hat abgelehnt, meist weil die Prüfdatei fehlt oder nicht zum Key passt |
| 503 | `INDEXNOW_KEY` oder `INDEXNOW_SUBMIT_TOKEN` fehlt |

### 2.4 Google Maps (optional)

Ohne Key zeigt die Website die typografische Radius-Grafik mit Ortsliste, nur ohne den Button „Interaktive Karte laden“. Mit Key:

1. In der [Google Cloud Console](https://console.cloud.google.com/google/maps-apis) das Projekt des Keys einrichten:
   - **Abrechnung:** Das Projekt muss mit einem aktiven Rechnungskonto (gültige Zahlungsmethode) verknüpft sein, auch wenn die Nutzung im kostenlosen Kontingent bleibt. Ohne Rechnungskonto meldet Google `BillingNotEnabledMapError`: abgedunkelte Karte mit „For development purposes only“ und dem Dialog „Google Maps kann auf dieser Seite nicht richtig geladen werden“. Die Website erkennt diesen Dialog und zeigt wieder die Radius-Grafik mit „Die interaktive Karte ist gerade nicht verfügbar. Die Übersicht zeigt das Einsatzgebiet.“
   - **APIs & Dienste → Bibliothek:** nur die **Maps JavaScript API** aktivieren. Die Website nutzt keine weitere Maps-API (kein Places, Geocoding, Directions, Distance Matrix).
2. Unter **APIs & Dienste → Anmeldedaten** den Key beschränken:
   - Anwendungsbeschränkung **Websites**: `https://karriere.bad-energie.de/*`. Preview-Domains oder `http://localhost:3000/*` nur bei Bedarf ergänzen; ohne Freigabe fällt die Karte dort auf die Grafik zurück.
   - API-Beschränkung: nur **Maps JavaScript API**.
3. Unter **Abrechnung → Budgets und Benachrichtigungen** eine Budgetwarnung anlegen; optional die Kartenaufrufe pro Tag unter **APIs & Dienste → Maps JavaScript API → Kontingente** begrenzen.
4. `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in Vercel setzen und neu deployen. Der Key wird beim Build eingebettet; ohne Key beim Build erscheint kein Button. Abrechnung und Beschränkungen lassen sich ohne neues Deploy ändern, der Key bleibt gleich.
5. Testen: Startseite → Einsatzgebiet → „Interaktive Karte laden“. Die Karte erscheint ohne Wasserzeichen und ohne Google-Dialog, die Statuszeile sagt „Google Maps ist geladen.“, und in der Browser-Konsole steht keine Zeile `Google Maps JavaScript API error: …MapError`. Danach „Karte wieder ausblenden“.

   | Fehler in der Konsole | Abhilfe |
   |---|---|
   | `BillingNotEnabledMapError` | Rechnungskonto mit dem Projekt verknüpfen |
   | `ApiNotActivatedMapError` | Maps JavaScript API aktivieren |
   | `RefererNotAllowedMapError` | Domain in der Websites-Beschränkung ergänzen |
   | `InvalidKeyMapError` / `ExpiredKeyMapError` | Key in Vercel prüfen, neu deployen |

   Eine Konsolenwarnung, dass `google.maps.Marker` abgekündigt ist, ist bekannt: Google kündigt die Abschaltung mindestens 12 Monate vorher an. Der Umstieg auf `AdvancedMarkerElement` braucht eine Map-ID und ist eine Aufgabe für die Entwicklung.
6. In den ersten Tagen auf `[csp]`-Meldungen zu Google achten (siehe 3.3).

Stand 2026-10-10: Der Live-Test zeigte `BillingNotEnabledMapError`. Offener Owner-Punkt: im Google-Cloud-Projekt des Keys ein aktives Rechnungskonto verknüpfen. Bis dahin fällt die Website ehrlich auf die Radius-Grafik zurück. `/api/status` zeigt unter `maps.configured` nur, ob ein Key gesetzt ist, nicht, ob die Abrechnung stimmt.

### 2.5 Vercel-Projekt

- Region `fra1` kommt aus `vercel.json`.
- Build Command `bun run build` (führt über `prebuild` die Guard-Skripte aus), Node.js 22.x.
- Custom Domain `karriere.bad-energie.de`, DNS-Eintrag nach Vorgabe im Vercel-Dashboard.

### 2.6 Deploy und Funktionsprobe

1. Production deployen (bzw. **Redeploy** nach Änderungen an den Variablen).
2. **Status prüfen**, ohne eine Bewerbung abzuschicken:

   ```bash
   curl -s https://karriere.bad-energie.de/api/status
   ```

   | Feld | Erwartet in Production | Sonst |
   |---|---|---|
   | `ok` | `true` (HTTP 200) | `false` (HTTP 503): eines der Felder unten passt nicht |
   | `environment` | `production` | `preview`, `development` oder `other`: falsche Adresse oder fehlende Vercel-Systemvariablen |
   | `email.status` | `ready` (Resend-Key gesetzt) | `not_configured`: `RESEND_API_KEY` fehlt oder ist ungültig. `simulated` gibt es nur in Preview und lokal |
   | `email.sender`, `email.senderDomain` | `default` (oder `env`) und `karriere.bad-energie.de` | andere Domain: Sie muss in Resend verifiziert sein (2.1) |
   | `secrets.ipHashSalt`, `secrets.applicationTokenSecret` | `env` (eigener Wert, empfohlen) oder `derived` (abgeleitet) | `missing`: Die Formular-APIs antworten mit 503. `dev` gibt es nur lokal |
   | `applications.target` | `supabase`, sobald Supabase konfiguriert ist | `email` mit `reason`: `mode_email` (`APPLICATION_SINK=email`), `not_configured` (URL oder Server-Key fehlt oder ist ungültig), `not_production` (nicht Vercel Production) |
   | `applications.database` | `ok` | `unavailable` (nicht erreichbar, Zeitlimit, Projekt pausiert), `misconfigured` (Key falsch, Funktion fehlt, Rechte fehlen), andere Werte wie `unexpected` |
   | `maps.configured` | `true`, wenn ein Maps-Key gesetzt ist | sagt nichts über die Abrechnung bei Google (2.4) |

   Der Endpunkt nennt keine Werte und keine Adressen, nur die Absender-Domain. Für die Datenbankprobe ruft er `rpc_submit_follow_up` mit leerer Nutzlast auf: Die Datenbank muss mit `validation_failed` antworten, geschrieben wird nichts. Das Ergebnis gilt 5 Minuten je Server-Instanz. Steht `database` nicht auf `ok`, meldet der Endpunkt 503, obwohl Bewerbungen per Not-E-Mail weiter ankommen. `ok: true` heißt noch nicht, dass Resend den Versand annimmt (Domain, Kontingent); das zeigt erst die Testbewerbung.
3. In den Logs (siehe 3.1) steht beim Start die Zeile `[env] Bewerbungen: …`. Es darf **keine** Zeile `[env] Server-Konfiguration unvollständig …` stehen.
4. **Testbewerbung** über `https://karriere.bad-energie.de/bewerbung?stelle=initiativ`, Name mit „Test“, Kontaktweg E-Mail, eigene Adresse. Prüfen:
   - Die Danke-Seite zeigt eine Bewerbungsnummer `BE-26-…`.
   - Im Team-Postfach kommt „Neue Bewerbung BE-26-…“ an, „Antworten“ geht an die eigene Adresse.
   - Die Eingangsbestätigung kommt an; „Antworten“ geht an das Team-Postfach.
   - In Resend steht der Versand als zugestellt, im Mail-Header SPF/DKIM/DMARC „pass“.
   - Mit Datenbank: Im Log steht `[bewerbung] eingegangen BE-26-…` ohne eine Zeile `[bewerbung] Datenbank: …` davor. Die Testbewerbung steht dann in der Datenbank; bis zum Cockpit löscht die Administration sie per SQL (siehe 6).
5. Auf der Danke-Seite eine Ergänzung schicken: „Ergänzung zu BE-26-…“ kommt im Team-Postfach an.
6. Feeds und Header prüfen:

   ```bash
   curl -s https://karriere.bad-energie.de/feeds/indeed.xml | xmllint --noout -
   curl -s https://karriere.bad-energie.de/feeds/jobs.xml | xmllint --noout -
   curl -sI https://karriere.bad-energie.de | grep -iE 'strict-transport|content-security'
   ```

7. Manuell (ROADMAP §14.5): Lighthouse mobil, iPhone Safari, Android Chrome, die In-App-Browser von Instagram, Facebook und TikTok, ein Durchlauf mit VoiceOver und TalkBack durch den Flow.

Mehrere Tests aus dem Büro zählen gegen dasselbe Rate-Limit (5 Bewerbungen je 10 Minuten, 20 je Tag pro Netz). Bei „Zu viele Versuche“ einfach später weitertesten.

### 2.7 Search Console und Test für Rich-Suchergebnisse

Ablauf und Prüfpunkte: [`stellenboersen.md` d)](stellenboersen.md#d-google-search-console). Kurz: Domain-Property anlegen, Sitemap `https://karriere.bad-energie.de/sitemap.xml` einreichen, jede Stellenseite im [Test für Rich-Suchergebnisse](https://search.google.com/test/rich-results) prüfen (genau eine gültige „Stellenanzeige“), per URL-Prüfung die Indexierung beantragen, danach den Bericht „Stellenanzeigen“ beobachten.

### 2.8 Indeed

Aufnahme der Karriereseite per Feed `https://karriere.bad-energie.de/feeds/indeed.xml` im Indeed-Arbeitgeberkonto anfragen: [`stellenboersen.md` a)](stellenboersen.md#a-indeed-karriereseite-indexieren-lassen). Keine zusätzlichen manuellen Anzeigen für dieselben Stellen, keine Bezahloption ohne Rücksprache mit dem Owner.

### 2.9 Bundesagentur für Arbeit und HWK

Jede veröffentlichte Stelle im Arbeitgeberportal der BA einstellen, die Ausbildung zusätzlich in der HWK-Lehrstellenbörse, jeweils mit dem getrackten Link: [`stellenboersen.md` b)](stellenboersen.md#b-bundesagentur-für-arbeit-und-hwk-lehrstellenbörse-manuell). Ändert sich eine Stelle im Repo, die Anzeigen am selben Tag nachziehen.

### 2.10 Monitoring

Siehe Abschnitt 3. Nach dem Go-live die Logs in der ersten Woche täglich ansehen, danach wöchentlich.

## 3. Monitoring und Fehler

### 3.1 Logs lesen

Vercel → Projekt → **Logs**. Die Zeilen enthalten keine personenbezogenen Daten, nur Bewerbungsnummer, Stelle, Kanal und Fehlercodes. Wie lange Vercel Logs aufbewahrt, hängt vom Tarif ab.

| Log-Zeile | Bedeutung | Was tun |
|---|---|---|
| `[env] Bewerbungen: Supabase (<ref>, Secret Key) und E-Mail` bzw. `[env] Bewerbungen: nur E-Mail (<grund>)`, dahinter z. B. `; IP_HASH_SALT abgeleitet aus RESEND_API_KEY` oder `; Absender: Standard (karriere.bad-energie.de)` | Infozeile bei jedem Start: Ziel der Bewerbungen (Gründe für „nur E-Mail“: `APPLICATION_SINK=email`, `Supabase nicht konfiguriert`, `nicht Vercel Production`) und aktive Ersatzwerte | prüfen, ob das Ziel stimmt; eigene Geheimnisse sind empfohlen (2.2) |
| `[env] Server-Konfiguration unvollständig, PRODUKTION – Bewerbungen werden abgelehnt (503) (fehlt: …; ungültig: …)` | Eine Pflichtvariable fehlt: `RESEND_API_KEY`, die Geheimnisse nur, wenn sie sich nicht ableiten lassen (nur Namen). Ausnahme: Bei `APPLICATION_SINK=supabase` ohne URL oder Server-Key stehen auch `SUPABASE_URL` bzw. `SUPABASE_SECRET_KEY` unter „fehlt“; Bewerbungen gehen dann trotzdem per E-Mail | Variable setzen, neu deployen |
| `[env] Server-Konfiguration unvollständig, PRODUKTION – Ersatzwerte aktiv (ungültig: …)` | Nichts Nötiges fehlt, aber Werte sind ungültig und werden ersetzt: Geheimnis zu kurz → abgeleitet, Absender → Standard, Supabase-Key ist ein Publishable- oder anon-Key → nur E-Mail. **Ausnahme:** Steht `RESEND_API_KEY` unter „ungültig“, gibt es keinen Ersatz; Production lehnt Bewerbungen dann trotz dieser Zeile mit 503 ab | Wert korrigieren oder löschen, neu deployen |
| `[bewerbung] eingegangen BE-26-… (<stelle>, <kanal>)` | Bewerbung angenommen; Zusätze „Spamverdacht: …“ oder „Wiederholung“ möglich | nichts |
| `[bewerbung] nicht konfiguriert: <VARIABLE>` | Geheimnis fehlt und lässt sich nicht ableiten, Antwort 503 | Variable setzen, neu deployen |
| `[bewerbung] nicht zugestellt (not_configured)` | Resend-Key fehlt oder Resend meldet einen Konfigurationsfehler (Key ungültig, eingeschränkt oder gesperrt, Absender-Domain nicht verifiziert bzw. Testmodus, Kontingent erschöpft), Antwort 503 | Zeile `[email] Resend-Fehler … – Konfiguration prüfen` daneben lesen, 2.1 und 2.2 prüfen |
| `[bewerbung] nicht zugestellt (failed)` | Resend hat abgelehnt oder war nicht erreichbar (vorübergehende Fehler auch nach dem zweiten Versuch), Antwort 500. Mit Datenbank nur, wenn die Bewerbung gespeichert ist (Zeile `[bewerbung] gespeichert …` davor); scheitert dagegen die Not-E-Mail, steht dort `unavailable` | Zeile `[email] Resend-Fehler` daneben und die Resend-Logs ansehen |
| `[bewerbung] nicht zugestellt (unavailable)` | Datenbank ausgefallen und Not-E-Mail gescheitert, Antwort 503 | die Zeilen davor lesen |
| `[bewerbung] Datenbank: <art> (<code>) – Not-E-Mail ans Team` | Datenbank nicht nutzbar (`unavailable`, `misconfigured`, `validation_failed`, `unexpected` oder `circuit_open` ohne Code nach zwei Ausfällen in Folge). Folgt keine Zeile `Not-E-Mail fehlgeschlagen`, kam die Bewerbung vollständig per Mail, steht aber nicht in der Datenbank | `/api/status` aufrufen; bei `misconfigured` Key und Migrationen prüfen; bei `unavailable` den Supabase-Status ansehen (pausiertes Projekt?) |
| `[bewerbung] Not-E-Mail fehlgeschlagen (<grund>)` | Auch die Not-E-Mail ging nicht raus, Antwort 503 | Zeile `[email] Resend-Fehler` daneben lesen |
| `[bewerbung] gespeichert BE-26-…, Team-Mail nicht zugestellt (<code>)` | Die Bewerbung steht in der Datenbank, das Team hat aber keine Mail. Der Browser bekommt einen Fehler; eine Wiederholung erhält dieselbe Nummer und schickt die Mail erneut | Zeile `[email] Resend-Fehler` lesen; die Bewerbung ist nicht verloren |
| `[bewerbung] APPLICATION_SINK=supabase, aber Supabase ist nicht vollständig konfiguriert – nur E-Mail` | Datenbank erzwungen, aber URL oder Server-Key fehlt | URL und Key setzen oder `APPLICATION_SINK` löschen, neu deployen |
| `[bewerbung/ergaenzung] Bewerbung nicht in der Datenbank – nur per E-Mail` | Info: Ergänzung zu einer Bewerbung aus der E-Mail-Zeit oder per Not-E-Mail | nichts |
| `[bewerbung/ergaenzung] Datenbank: <art> – nur per E-Mail` | Datenbank gestört, die Ergänzung kam per Mail | wie bei der Not-E-Mail |
| `[bewerbung/ergaenzung] nicht zugestellt (limited)` | Zu dieser Bewerbung liegen schon 20 Ergänzungen vor oder 5 in 24 Stunden (Grenze der Datenbank), Antwort 429 | nichts; die Person wird auf WhatsApp oder E-Mail verwiesen |
| `[email] Resend-Fehler: <code> (HTTP <status>) – Konfiguration prüfen: <meldung>` | Konfigurationsfehler bei Resend, z. B. `invalid_api_key`, `invalid_from_address`, Kontingent oder `validation_error` mit HTTP 403 (Domain nicht verifiziert oder Testmodus). Die Meldung stammt von Resend, Adressen stehen als `[adresse]` | Key, Domain-Verifizierung, Absender und Kontingent in Resend prüfen |
| `[email] Resend-Fehler: <code> (HTTP <status>), neuer Versuch` | Vorübergehender Fehler (`rate_limit_exceeded`, `internal_server_error`, `service_unavailable`, `concurrent_idempotent_requests`); nach 800 ms ein zweiter Versuch mit demselben Idempotency-Key | nichts, solange keine Fehlerzeile folgt |
| `[email] Resend-Fehler: <code> (HTTP <status>): <meldung>` | anderer Fehlercode von Resend | Resend-Logs ansehen |
| `[bewerbung/ergaenzung] …` | dasselbe für Ergänzungen | wie oben |
| `[csp] report <direktive> blockiert <quelle> auf <pfad>` | CSP-Meldung (Report-Only) | siehe 3.3 |

Fehlt `IP_HASH_SALT` und lässt es sich nicht ableiten, antwortet die API mit 503, ohne eine eigene Zeile pro Anfrage zu schreiben; dann steht nur die `[env]`-Zeile beim Start im Log.

### 3.2 Was die 503 bedeutet

Antwortet `POST /api/bewerbung` oder `POST /api/bewerbung/ergaenzung` mit **503** (`SERVICE_UNAVAILABLE`), kann die Website die Bewerbung gerade nicht ans Team zustellen. Mögliche Gründe:

- `RESEND_API_KEY` fehlt oder ist ungültig, oder Resend meldet einen Konfigurationsfehler: Key ungültig, eingeschränkt oder gesperrt, Absender-Domain nicht verifiziert bzw. Testmodus (`validation_error` mit HTTP 403), `invalid_from_address`, Monats- oder Tageskontingent erschöpft.
- Ein HMAC-Geheimnis fehlt und lässt sich nicht ableiten (weder eigener Wert noch Resend- oder Supabase-Server-Key).
- Mit Datenbank: Die Datenbank ist ausgefallen **und** die Not-E-Mail ging auch nicht raus. Bei Ergänzungen gilt das auch, wenn die Bewerbung nicht in der Datenbank steht und die Mail scheitert, selbst bei einem vorübergehenden Resend-Fehler (ohne Datenbank wäre das eine 500).

Folgen:

- Das Team hat keine Mail bekommen. Mit Datenbank kann die Bewerbung trotzdem gespeichert sein (Log `[bewerbung] gespeichert BE-…, Team-Mail nicht zugestellt`); eine Wiederholung bekommt dieselbe Nummer. Die Website bleibt online.
- Die Bewerberin bzw. der Bewerber sieht „Das Senden klappt gerade nicht“ mit den Wegen Anrufen und WhatsApp; die WhatsApp-Nachricht ist mit den Angaben aus dem Flow vorausgefüllt. Solange der Fehler besteht, kommen Bewerbungen also nur über Telefon (06441 42956) und WhatsApp (0160 8834290) an.
- Beheben: Log-Zeile lesen (3.1), `/api/status` aufrufen (2.6), Variable setzen, neu deployen, Testbewerbung.

**Befund vom 2026-10-10:** Production hat jede Bewerbung mit 503 abgelehnt, weil `IP_HASH_SALT` fehlte oder ungültig war. Belegt mit einer Probe `POST /api/bewerbung` mit dem Body `{}`: Die 503 kam schon von der Eingangskontrolle, bevor ein Mailversand überhaupt versucht wurde. Mit dem Stand vom 2026-10-10 leitet die Website fehlende oder ungültige Geheimnisse aus `RESEND_API_KEY` ab; die Seite funktioniert also auch ohne eigene Werte. Empfohlen bleiben eigene Werte (2.2). Nach dem Deploy mit `/api/status` prüfen: Unter `secrets` steht `env` oder `derived`, nie `missing`.

Andere Antworten zum Vergleich:

| Status | Bedeutung |
|---|---|
| 500 (`INTERNAL`) | Konfiguration vollständig, aber der Versand ist gescheitert, meist bei Resend (vorübergehende Fehler auch nach dem zweiten Versuch; Netzfehler und Zeitüberschreitungen werden nicht wiederholt). Die Oberfläche bietet „Erneut senden“, Anruf und WhatsApp an. |
| 429 (`RATE_LIMITED`) | Zu viele Versuche aus demselben Netz (Bewerbungen 5 je 10 Minuten und 20 je Tag, Ergänzungen 10 je Stunde). Die Zähler liegen im Arbeitsspeicher und gelten je Server-Instanz. Bei Ergänzungen auch: Zu dieser Bewerbung liegen schon 20 Ergänzungen vor oder 5 in 24 Stunden (Grenze der Datenbank, `Retry-After` ein Tag); die Meldung bittet, weitere per WhatsApp oder E-Mail mit der Bewerbungsnummer zu schicken. |
| 403 (`CSRF_FAILED` bzw. `INVALID_TOKEN`) | Anfrage kam nicht von der eigenen Seite bzw. Ergänzungs-Link ungültig oder abgelaufen |
| 503 bei `/api/status` | Der Status meldet ein Problem; die Felder lesen (2.6). Steht nur `applications.database` nicht auf `ok`, kommen Bewerbungen per Not-E-Mail weiter an |
| 503 bei `/api/indexnow` | Nur IndexNow ist nicht eingerichtet (2.3); Bewerbungen sind nicht betroffen |

### 3.3 CSP-Meldungen

Die Content-Security-Policy läuft bis Phase 3 als **Report-Only**: Browser blockieren nichts, sondern melden an `/api/csp-report`, was die Policy blockieren würde. Die Meldungen erscheinen als `[csp]`-Zeilen (höchstens 60 je Minute und Instanz), nur mit Herkunft und Pfad, ohne Query.

Bis zum Scharfschalten in Phase 3 etwa monatlich auswerten:

- **Ignorieren:** Quellen wie `chrome-extension` oder `moz-extension` und fremde Skripte, die Browser-Erweiterungen oder In-App-Browser einschleusen.
- **An die Entwicklung melden:** wiederkehrende Meldungen auf eigenen Seiten zu Diensten, die die Website wirklich nutzt, etwa Google Maps nach dem Klick auf „Interaktive Karte laden“. Die Policy muss dann vor Phase 3 angepasst werden (`next.config.ts`).

## 4. Bewerbungs-E-Mails lesen

Jede Bewerbung kommt als E-Mail an `CONTACT_NOTIFICATION_EMAIL`. Ist Supabase in Production konfiguriert (Phase 2b), speichert die Website sie samt Ergänzungen zusätzlich in der Bewerberdatenbank. Eine Oberfläche dafür gibt es erst mit dem Cockpit (Phase 2d); bis dahin bleibt das Postfach die Arbeitsablage.

Die Mails sehen mit und ohne Datenbank gleich aus. War die Datenbank gestört, kam die Bewerbung als Not-E-Mail: Sie sieht aus wie jede andere, steht aber nicht in der Datenbank (Log `[bewerbung] Datenbank: … – Not-E-Mail ans Team`, siehe 3.1).

### 4.1 Die Mails im Überblick

| Betreff | Empfänger | Inhalt |
|---|---|---|
| `Neue Bewerbung BE-26-XXXXXX: <Stelle> – <Vorname>` | Team | die Bewerbung |
| `[Spamverdacht] Neue Bewerbung …` | Team | dieselbe Mail, markiert (siehe 4.3) |
| `Ergänzung zu BE-26-XXXXXX` | Team | Nachträge von der Danke-Seite oder aus der Mappe (siehe 5) |
| `Deine Bewerbung bei Bad und Energie: BE-26-XXXXXX` | Bewerberin bzw. Bewerber, nur mit E-Mail-Angabe und ohne Spamverdacht | Eingangsbestätigung, nächste Schritte, Kontaktwege |

Die **Bewerbungsnummer** `BE-26-XXXXXX` (Jahr und sechs Zeichen) ist der Schlüssel für alles Weitere: Bewerberinnen und Bewerber sehen sie auf der Danke-Seite und in der Bestätigung und sollen sie bei Rückfragen nennen.

### 4.2 Aufbau der Team-Mail

- **Button oben:** der bevorzugte Kontaktweg der Person (E-Mail schreiben, per WhatsApp antworten oder anrufen).
- **Kontakt:** Name, Telefon mit Link „WhatsApp-Chat öffnen“, E-Mail (falls angegeben), „Am liebsten per“. Steht hinter der Nummer „nicht automatisch erkannt, bitte prüfen“, konnte die Nummer nicht eindeutig gelesen werden; dann fehlt auch der WhatsApp-Link.
- **Stelle:** Titel und Referenz der Stelle (z. B. `SHK-WP-2026-01`); Initiativbewerbungen haben keine Referenz. Ein Hinweis erscheint, wenn die Stelle inzwischen als besetzt markiert ist (z. B. Bewerbung über einen alten Link).
- **Angaben:** die Antworten aus dem Flow, etwa Erfahrung und möglicher Start.
- **Bewerbungsmappe:** nur wenn mitgeschickt: Anschreiben, Arbeitsstil, Fähigkeiten, berufliche Stationen, Schule und Ausbildung.
- **Quelle:** Kanal (z. B. Google for Jobs, Indeed, Bundesagentur für Arbeit, Empfehlung, Direkt), UTM-Werte, Empfehlungscode, verweisende Seite und Einstiegsseite. Bis zum Cockpit (Phase 2d) ist das die Grundlage für „Bewerbungen pro Kanal“.
- **Eingang:** Bewerbungsnummer, Zeitpunkt (deutsche Zeit), Ausfülldauer und die Version des Datenschutzhinweises, den die Person gesehen hat.

**Antworten:** „Antworten“ im Mailprogramm geht an die E-Mail-Adresse der Bewerberin bzw. des Bewerbers. Hat die Person keine E-Mail angegeben, ginge die Antwort an die Absenderadresse der Website; dann über den Button, per Telefon oder WhatsApp antworten. Der bevorzugte Kontaktweg steht unter „Am liebsten per“. Die Bestätigung verspricht keine Frist, sondern „Wir melden uns schnellstmöglich“.

### 4.3 Spamverdacht

Eine Bewerbung wird markiert, wenn ein für Menschen unsichtbares Feld ausgefüllt wurde (typisch für Bots) oder das Formular in weniger als 3 Sekunden ausgefüllt war. Sie wird trotzdem zugestellt, weil auch Autofill solche Signale auslösen kann. An die angegebene Adresse geht dann keine Eingangsbestätigung.

Vorgehen: Name und Nummer auf Plausibilität prüfen. Wirkt die Bewerbung echt, ganz normal bearbeiten. Offensichtlichen Spam sofort löschen.

### 4.4 Zwei Mails mit derselben Nummer

Ein identischer zweiter Versuch (Doppelklick, Reload, schlechtes Netz) wird nicht noch einmal verschickt. Kommen trotzdem zwei Mails „Neue Bewerbung“ mit **derselben** Nummer, hat die Person nach einem Fehler ihre Angaben korrigiert und erneut gesendet. Es zählt die neuere Mail.

## 5. Ergänzungen und Unterlagen zuordnen

**Ergänzungen** (`Ergänzung zu BE-26-XXXXXX`) kommen von der Danke-Seite oder aus dem Mappe-Werkzeug: frühester Start, PLZ, eine Nachricht und/oder die Bewerbungsmappe. Sie enthalten bewusst weder Name noch Kontakt.

1. Im Postfach nach der Nummer suchen und die Ergänzung zur ursprünglichen Bewerbung legen (gleicher Ordner oder Unterhaltung).
2. Es kann mehrere Ergänzungen zu einer Nummer geben; gleicher Inhalt kommt nur einmal an.
3. Der Ergänzungs-Link gilt 14 Tage. Danach bittet die Website, Angaben per WhatsApp oder E-Mail mit der Bewerbungsnummer zu schicken.
4. Mit Datenbank nimmt die Website je Bewerbung höchstens 20 Ergänzungen an, davon 5 in 24 Stunden. Darüber bittet sie ebenfalls um WhatsApp oder E-Mail mit der Bewerbungsnummer.

**Unterlagen** (Zeugnisse, Lebenslauf, Fotos) lassen sich noch nicht hochladen. Sie kommen per WhatsApp (Mobiltelefon 0160 8834290) oder als Antwort auf die Eingangsbestätigung, die im Team-Postfach landet. Zuordnen über die Bewerbungsnummer, sonst über Name und Telefonnummer; im Zweifel nach der Nummer fragen. Uploads und das Cockpit kommen in späteren Scheiben von Phase 2.

**Auskunft oder Löschung** (Art. 15 und 17 DSGVO): im Postfach nach Nummer, Name und Telefonnummer suchen, Ergänzungen, Antworten und die WhatsApp-Verläufe auf dem Mobiltelefon (0160 8834290) einbeziehen. Mit Datenbank stehen Bewerbung und Ergänzungen auch dort. Bis es Cockpit und automatische Löschung gibt (Phase 2c/2d), erledigt das in der Datenbank die Administration per SQL: Anfrage mit Bewerbungsnummer an sie weitergeben.

## 6. Löschfristen in Postfach und Datenbank

Die Datenschutzerklärung ([Abschnitt „Bewerbung über diese Website“](https://karriere.bad-energie.de/datenschutz#bewerberdaten)) sagt zu:

- Nach einer Absage werden die Daten **spätestens 6 Monate** nach Bekanntgabe der Absage gelöscht. Seit der Fassung `2026-10-10` gilt das ausdrücklich für die E-Mails und die Bewerberdatenbank gleichermaßen.
- Länger, **höchstens 24 Monate**, nur mit ausdrücklicher Einwilligung (Talentpool).
- Bei einer Einstellung gehen die erforderlichen Daten in die Personalakte.

Im Postfach muss das Team das selbst einhalten, zum Beispiel so:

1. Ordner nach Stand anlegen, etwa „Bewerbungen offen“ und „Abgesagt JJJJ-MM“ (Monat der Absage).
2. Einmal im Monat die Absage-Ordner löschen, die älter als 6 Monate sind, samt Ergänzungen, Anhängen, WhatsApp-Verläufen (Mobiltelefon 0160 8834290) und dem Papierkorb.
3. Talentpool-Einwilligungen mit Datum notieren und nach spätestens 24 Monaten löschen.
4. Mit Datenbank: die Bewerbungsnummern der gelöschten Absagen an die Administration geben. Die Datenbank kennt das Datum der Absage nicht, solange es kein Cockpit gibt.

In der Datenbank ist die automatische Löschung (Phase 2c) noch nicht gebaut. Bis dahin löscht die Administration abgelaufene Bewerbungen per SQL. **Offener Owner-Punkt:** Das muss vor der ersten Frist geregelt sein, also frühestens etwa 6 Monate nach der ersten Absage einer Bewerbung, die in der Datenbank steht. Testbewerbungen (2.6) gehören ebenfalls gelöscht.

Auch Resend speichert versendete Mails eine begrenzte Zeit; die Aufbewahrung im Resend-Konto prüfen und mit der Datenschutzerklärung abgleichen. Ab Phase 2c übernimmt `pg_cron` die Löschung in der Datenbank (ROADMAP §8.1).
