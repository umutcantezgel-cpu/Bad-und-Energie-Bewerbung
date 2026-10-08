# Betrieb: Go-live und laufender Betrieb

Stand: 2026-10-08 · Phase 1 (Bewerbungen kommen per E-Mail, das Postfach ist das ATS)

Diese Anleitung richtet sich an alle, die die Website live schalten und Bewerbungen bearbeiten. Technischer Hintergrund: [README](../../README.md), Plan: [ROADMAP](../ROADMAP.md).

## Inhalt

1. [Sofort: Resend-Key rotieren](#1-sofort-resend-key-rotieren)
2. [Go-live-Checkliste](#2-go-live-checkliste)
3. [Monitoring und Fehler](#3-monitoring-und-fehler)
4. [Bewerbungs-E-Mails lesen](#4-bewerbungs-e-mails-lesen)
5. [Ergänzungen und Unterlagen zuordnen](#5-ergänzungen-und-unterlagen-zuordnen)
6. [Löschfristen im Postfach](#6-löschfristen-im-postfach)

---

## 1. Sofort: Resend-Key rotieren

Commit `9717265` hat einen echten Resend-Key in `.env.example` veröffentlicht. Er steht für immer im öffentlichen Git-Verlauf und gilt als kompromittiert (ROADMAP §9.1, §13).

1. Im [Resend-Dashboard](https://resend.com) unter **API Keys** den alten Key löschen.
2. Einen neuen Key anlegen: Berechtigung nur **Sending access**, beschränkt auf die Absender-Domain.
3. Den neuen Key nur in Vercel eintragen (`RESEND_API_KEY`, Environment Production, als „Sensitive“), nie ins Repo oder in Chats.
4. In Resend unter **Emails** bzw. **Logs** prüfen, ob seit der Veröffentlichung fremde Mails über das Konto verschickt wurden. Auffälligkeiten festhalten und mit der oder dem DSB klären.
5. Neu deployen (siehe 2.6).
6. Hier festhalten: **Alter Key widerrufen am:** _offen_ · **neuer Key in Production seit:** _offen_ · **geprüft von:** _offen_. Solange das offen ist, ist der Key als aktiv zu behandeln. Die Ausnahme für den alten Key in `.gitleaks.toml` gilt nur unter dieser Voraussetzung.

## 2. Go-live-Checkliste

- [ ] 2.1 Resend-Domain verifiziert, Absender festgelegt
- [ ] 2.2 Geheimnisse erzeugt, Umgebungsvariablen in Vercel gesetzt
- [ ] 2.3 IndexNow-Key und Prüfdatei passen zusammen
- [ ] 2.4 Google-Maps-Key beschränkt (optional)
- [ ] 2.5 Vercel-Projekt eingerichtet (Region, Build, Domain)
- [ ] 2.6 Deploy und Funktionsprobe mit Testbewerbung
- [ ] 2.7 Search Console und Test für Rich-Suchergebnisse
- [ ] 2.8 Indeed-Aufnahme angefragt
- [ ] 2.9 Stellen bei der Bundesagentur für Arbeit und der HWK eingestellt
- [ ] 2.10 Monitoring eingerichtet (Logs, CSP-Meldungen)

### 2.1 Resend-Domain verifizieren

1. In Resend unter **Domains** die Domain des Absenders anlegen. `.env.example` schlägt `bewerbung@karriere.bad-energie.de` vor, also die Domain `karriere.bad-energie.de`. Resend fragt dabei nach einer Region; die Wahl mit der Datenschutzerklärung abstimmen (Resend ist dort als Auftragsverarbeiter genannt).
2. Die angezeigten DNS-Einträge (DKIM, SPF und MX für die Rücklauf-Subdomain) genau so beim DNS-Anbieter von bad-energie.de eintragen und warten, bis Resend „Verified“ zeigt.
3. DMARC: Hat bad-energie.de eine DMARC-Richtlinie, gilt sie auch für die Subdomain (sofern kein eigener `sp`-Wert gesetzt ist). Nach der Testbewerbung (2.6) im Mail-Header prüfen, dass SPF, DKIM und DMARC „pass“ zeigen.
4. `RESEND_FROM_EMAIL` setzen, z. B. `Bad und Energie Karriere <bewerbung@karriere.bad-energie.de>`.

Ohne verifizierte Domain lehnt Resend den Versand ab; die Website nimmt dann keine Bewerbung an (siehe 3.2).

Die Absenderadresse braucht kein Postfach. Antworten auf die Team-Mail gehen an die Bewerberin bzw. den Bewerber, Antworten auf die Eingangsbestätigung an `CONTACT_NOTIFICATION_EMAIL`. Wer aber auf eine Team-Mail **ohne** angegebene E-Mail-Adresse antwortet, schreibt an die Absenderadresse; das kommt ohne Postfach nicht an (siehe 4.2).

### 2.2 Geheimnisse erzeugen und Umgebungsvariablen setzen

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
| `RESEND_API_KEY` | neuer Key aus Abschnitt 1 | nicht setzen |
| `RESEND_FROM_EMAIL` | Absender aus 2.1 | nicht setzen |
| `CONTACT_NOTIFICATION_EMAIL` | Postfach, das die Bewerbungen bekommt (Standard `info@bad-energie.de`) | nicht setzen |
| `IP_HASH_SALT` | eigener Wert | eigener, anderer Wert |
| `APPLICATION_TOKEN_SECRET` | eigener Wert | eigener, anderer Wert |
| `EMAIL_SIMULATION` | nicht setzen (dort ohnehin wirkungslos) | `true` |
| `INDEXNOW_KEY` | siehe 2.3 | nicht setzen |
| `INDEXNOW_SUBMIT_TOKEN` | eigener Wert | nicht setzen |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | siehe 2.4 | optional |

Mit `EMAIL_SIMULATION=true` schicken Preview-Deployments keine echten Mails an das Team. Die Vercel-Systemvariablen (`VERCEL_ENV`, `VERCEL_URL`) müssen verfügbar bleiben („Automatically expose System Environment Variables“, Standard).

Wichtig:

- `APPLICATION_TOKEN_SECRET` nur bei Verdacht auf ein Leck wechseln. Der Wechsel macht alle Ergänzungs-Links der letzten 14 Tage ungültig.
- `IP_HASH_SALT` lässt sich jederzeit wechseln; nur die Zähler des Rate-Limits beginnen neu.
- Änderungen wirken erst nach einem neuen Deploy.

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

1. In der [Google Cloud Console](https://console.cloud.google.com/google/maps-apis) unter **APIs & Dienste → Anmeldedaten** den Key beschränken:
   - Anwendungsbeschränkung **Websites**: `https://karriere.bad-energie.de/*`. Preview-Domains nur bei Bedarf ergänzen; ohne Freigabe fällt die Karte dort auf die Grafik zurück.
   - API-Beschränkung: nur **Maps JavaScript API** (die Website nutzt keine weitere Maps-API).
   - Unter **Abrechnung** eine Budgetwarnung anlegen.
2. `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in Vercel setzen und neu deployen. Der Key wird beim Build eingebettet; ohne Key beim Build erscheint kein Button.
3. Testen: Startseite → Einsatzgebiet → „Interaktive Karte laden“, danach „Karte wieder ausblenden“.
4. In den ersten Tagen auf `[csp]`-Meldungen zu Google achten (siehe 3.3).

### 2.5 Vercel-Projekt

- Region `fra1` kommt aus `vercel.json`.
- Build Command `bun run build` (führt über `prebuild` die Guard-Skripte aus), Node.js 22.x.
- Custom Domain `karriere.bad-energie.de`, DNS-Eintrag nach Vorgabe im Vercel-Dashboard.

### 2.6 Deploy und Funktionsprobe

1. Production deployen (bzw. **Redeploy** nach Änderungen an den Variablen).
2. In den Logs (siehe 3.1) darf beim Start **keine** Zeile `[env] Server-Konfiguration unvollständig …` stehen.
3. **Testbewerbung** über `https://karriere.bad-energie.de/bewerbung?stelle=initiativ`, Name mit „Test“, Kontaktweg E-Mail, eigene Adresse. Prüfen:
   - Die Danke-Seite zeigt eine Bewerbungsnummer `BE-26-…`.
   - Im Team-Postfach kommt „Neue Bewerbung BE-26-…“ an, „Antworten“ geht an die eigene Adresse.
   - Die Eingangsbestätigung kommt an; „Antworten“ geht an das Team-Postfach.
   - In Resend steht der Versand als zugestellt, im Mail-Header SPF/DKIM/DMARC „pass“.
4. Auf der Danke-Seite eine Ergänzung schicken: „Ergänzung zu BE-26-…“ kommt im Team-Postfach an.
5. Feeds und Header prüfen:

   ```bash
   curl -s https://karriere.bad-energie.de/feeds/indeed.xml | xmllint --noout -
   curl -s https://karriere.bad-energie.de/feeds/jobs.xml | xmllint --noout -
   curl -sI https://karriere.bad-energie.de | grep -iE 'strict-transport|content-security'
   ```

6. Manuell (ROADMAP §14.5): Lighthouse mobil, iPhone Safari, Android Chrome, die In-App-Browser von Instagram, Facebook und TikTok, ein Durchlauf mit VoiceOver und TalkBack durch den Flow.

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
| `[env] Server-Konfiguration unvollständig, PRODUKTION – Bewerbungen werden abgelehnt (503) (fehlt: …; ungültig: …)` | Beim Start fehlen Variablen oder sind ungültig (nur Namen) | Variable setzen, neu deployen |
| `[bewerbung] eingegangen BE-26-… (<stelle>, <kanal>)` | Bewerbung angenommen; Zusätze „Spamverdacht: …“ oder „Wiederholung“ möglich | nichts |
| `[bewerbung] nicht konfiguriert: <VARIABLE>` | Geheimnis fehlt, Antwort 503 | Variable setzen, neu deployen |
| `[bewerbung] nicht zugestellt (not_configured)` | Resend-Key oder Absender fehlt, Antwort 503 | 2.1 und 2.2 prüfen |
| `[bewerbung] nicht zugestellt (failed)` | Resend hat abgelehnt oder war nicht erreichbar, Antwort 500 | Zeile `[email] Resend-Fehler` daneben und die Resend-Logs ansehen |
| `[email] Resend-Fehler: <code> (HTTP <status>)` | Fehlercode von Resend, z. B. `validation_error` | Key, Domain-Verifizierung und Absender prüfen |
| `[bewerbung/ergaenzung] …` | dasselbe für Ergänzungen | wie oben |
| `[csp] report <direktive> blockiert <quelle> auf <pfad>` | CSP-Meldung (Report-Only) | siehe 3.3 |

Fehlt `IP_HASH_SALT`, antwortet die API mit 503, ohne eine eigene Zeile pro Anfrage zu schreiben; dann steht nur die `[env]`-Zeile beim Start im Log.

### 3.2 Was die 503 bedeutet

Antwortet `POST /api/bewerbung` oder `POST /api/bewerbung/ergaenzung` mit **503** (`SERVICE_UNAVAILABLE`), ist die Server-Konfiguration unvollständig: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `IP_HASH_SALT` oder `APPLICATION_TOKEN_SECRET` fehlt, ist zu kurz oder noch ein Platzhalter.

- Es wurde **nichts** verschickt und nichts gespeichert. Die Website bleibt online.
- Die Bewerberin bzw. der Bewerber sieht „Das Senden klappt gerade nicht“ mit den Wegen Anrufen und WhatsApp; die WhatsApp-Nachricht ist mit den Angaben aus dem Flow vorausgefüllt. Solange der Fehler besteht, kommen Bewerbungen also nur über Telefon und WhatsApp an.
- Beheben: Log-Zeile lesen (3.1), Variable setzen, neu deployen, Testbewerbung (2.6).

Andere Antworten zum Vergleich:

| Status | Bedeutung |
|---|---|
| 500 (`INTERNAL`) | Konfiguration vollständig, aber der Versand ist gescheitert, meist bei Resend. Die Oberfläche bietet „Erneut senden“, Anruf und WhatsApp an. |
| 429 (`RATE_LIMITED`) | Zu viele Versuche aus demselben Netz (Bewerbungen 5 je 10 Minuten und 20 je Tag, Ergänzungen 10 je Stunde). Die Zähler gelten je Server-Instanz. |
| 403 (`CSRF_FAILED` bzw. `INVALID_TOKEN`) | Anfrage kam nicht von der eigenen Seite bzw. Ergänzungs-Link ungültig oder abgelaufen |
| 503 bei `/api/indexnow` | Nur IndexNow ist nicht eingerichtet (2.3); Bewerbungen sind nicht betroffen |

### 3.3 CSP-Meldungen

Die Content-Security-Policy läuft bis Phase 3 als **Report-Only**: Browser blockieren nichts, sondern melden an `/api/csp-report`, was die Policy blockieren würde. Die Meldungen erscheinen als `[csp]`-Zeilen (höchstens 60 je Minute und Instanz), nur mit Herkunft und Pfad, ohne Query.

Bis zum Scharfschalten in Phase 3 etwa monatlich auswerten:

- **Ignorieren:** Quellen wie `chrome-extension` oder `moz-extension` und fremde Skripte, die Browser-Erweiterungen oder In-App-Browser einschleusen.
- **An die Entwicklung melden:** wiederkehrende Meldungen auf eigenen Seiten zu Diensten, die die Website wirklich nutzt, etwa Google Maps nach dem Klick auf „Interaktive Karte laden“. Die Policy muss dann vor Phase 3 angepasst werden (`next.config.ts`).

## 4. Bewerbungs-E-Mails lesen

In Phase 1 kommt jede Bewerbung als E-Mail an `CONTACT_NOTIFICATION_EMAIL`. Es gibt keine Datenbank; das Postfach ist die einzige Ablage.

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
- **Quelle:** Kanal (z. B. Google for Jobs, Indeed, Bundesagentur für Arbeit, Empfehlung, Direkt), UTM-Werte, Empfehlungscode, verweisende Seite und Einstiegsseite. Bis zum Cockpit in Phase 2 ist das die Grundlage für „Bewerbungen pro Kanal“.
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

**Unterlagen** (Zeugnisse, Lebenslauf, Fotos) lassen sich in Phase 1 nicht hochladen. Sie kommen per WhatsApp oder als Antwort auf die Eingangsbestätigung, die im Team-Postfach landet. Zuordnen über die Bewerbungsnummer, sonst über Name und Telefonnummer; im Zweifel nach der Nummer fragen. Ab Phase 2 gibt es Uploads und das Cockpit.

**Auskunft oder Löschung** (Art. 15 und 17 DSGVO): im Postfach nach Nummer, Name und Telefonnummer suchen, Ergänzungen, Antworten und WhatsApp-Verläufe einbeziehen.

## 6. Löschfristen im Postfach

Die Datenschutzerklärung ([Abschnitt „Bewerbung über diese Website“](https://karriere.bad-energie.de/datenschutz#bewerberdaten)) sagt zu:

- Nach einer Absage werden die Daten **spätestens 6 Monate** nach Bekanntgabe der Absage gelöscht.
- Länger, **höchstens 24 Monate**, nur mit ausdrücklicher Einwilligung (Talentpool).
- Bei einer Einstellung gehen die erforderlichen Daten in die Personalakte.

In Phase 1 muss das Team das im Postfach selbst einhalten, zum Beispiel so:

1. Ordner nach Stand anlegen, etwa „Bewerbungen offen“ und „Abgesagt JJJJ-MM“ (Monat der Absage).
2. Einmal im Monat die Absage-Ordner löschen, die älter als 6 Monate sind, samt Ergänzungen, Anhängen, WhatsApp-Verläufen und dem Papierkorb.
3. Talentpool-Einwilligungen mit Datum notieren und nach spätestens 24 Monaten löschen.

Auch Resend speichert versendete Mails eine begrenzte Zeit; die Aufbewahrung im Resend-Konto prüfen und mit der Datenschutzerklärung abgleichen. Ab Phase 2 erledigt ein täglicher Cron die Löschung automatisch (ROADMAP §8).
