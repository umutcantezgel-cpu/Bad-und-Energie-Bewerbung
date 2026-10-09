# Stellenbörsen und Reichweite

Stand: 2026-10-08 · Schritt 1.6 der Roadmap (§7)

Alle Stellen kommen aus dem Registry (`lib/jobs/data/*.ts`, siehe `stellen-pflegen.md`). Seiten, Schema und Feeds aktualisieren sich mit jedem Deploy von selbst. Manuell gepflegt werden nur die Börsen ohne Feed: **Bundesagentur für Arbeit** und **HWK-Lehrstellenbörse**.

| Kanal | Weg | Aufwand | Messung (`utm_source`) |
|---|---|---|---|
| Google for Jobs | JobPosting auf jeder Stellenseite, Sitemap, IndexNow | automatisch | Referrer `google` |
| Indeed | Feed `/feeds/indeed.xml`, Aufnahme bei Indeed anfragen | einmalig | `indeed` |
| Jooble, Talent.com, Adzuna, Careerjet, Kimeta | Feed `/feeds/jobs.xml`, je Anbieter einmal anmelden | einmalig | `jobs-xml` |
| Bundesagentur für Arbeit (Jobbörse) | Stelle von Hand einstellen | je Stelle | `arbeitsagentur` |
| HWK-Lehrstellenbörse | Ausbildungsplatz von Hand einstellen | je Ausbildungsstelle | `hwk` |
| Website bad-energie.de | Widget aus `/feeds/jobs.json` | einmalig | `jobs-json` |

Die Feeds enthalten nur Stellen, die veröffentlicht sind, deren `validThrough` noch nicht erreicht ist und deren Kanal-Flag (`channels.indeedFeed`, `channels.genericFeed`) gesetzt ist. Sie werden stündlich neu erzeugt. Quereinstieg/Montagehelfer ist `funnel_only` und erscheint in keinem Kanal.

Feed-Adressen (Produktion):

- Indeed: `https://karriere.bad-energie.de/feeds/indeed.xml`
- Aggregatoren: `https://karriere.bad-energie.de/feeds/jobs.xml`
- JSON (schema.org JobPosting): `https://karriere.bad-energie.de/feeds/jobs.json`

## Getrackte Links je Stelle

Für jede manuell eingestellte Anzeige wird genau dieser Link als Bewerbungs-Link eingetragen. Die Parameter folgen `withUtm()` aus `lib/jobs/feeds/tracking.ts`: `utm_source=<Börse>`, `utm_medium=jobboard`, `utm_campaign=<Stellen-ID>`. Ohne diese Parameter ist im Postfach bzw. später im Cockpit nicht erkennbar, woher eine Bewerbung kam.

Ein Test (`app/jobs/__tests__/reach.test.ts`) prüft, dass für jede veröffentlichte BA-Stelle der Link hier steht. Neue Stelle → Zeile ergänzen.

### Bundesagentur für Arbeit (`utm_source=arbeitsagentur`)

| Stelle | Referenz | Link |
|---|---|---|
| Anlagenmechaniker SHK für Wärmepumpen & Heizungstechnik (m/w/d) | SHK-WP-2026-01 | `https://karriere.bad-energie.de/jobs/anlagenmechaniker-shk-wetzlar?utm_source=arbeitsagentur&utm_medium=jobboard&utm_campaign=anlagenmechaniker-shk` |
| Kundendiensttechniker SHK / Servicemonteur (m/w/d) | SHK-KD-2026-02 | `https://karriere.bad-energie.de/jobs/kundendiensttechniker-waermepumpe-wetzlar?utm_source=arbeitsagentur&utm_medium=jobboard&utm_campaign=kundendiensttechniker-shk` |
| Obermonteur / Projektleiter SHK & Badsanierung (m/w/d) | SHK-PL-2026-03 | `https://karriere.bad-energie.de/jobs/obermonteur-projektleiter-shk-wetzlar?utm_source=arbeitsagentur&utm_medium=jobboard&utm_campaign=obermonteur-projektleiter-shk` |
| Ausbildung zum Anlagenmechaniker SHK (m/w/d) | SHK-AZ-2026-04 | `https://karriere.bad-energie.de/jobs/ausbildung-anlagenmechaniker-shk-wetzlar?utm_source=arbeitsagentur&utm_medium=jobboard&utm_campaign=ausbildung-anlagenmechaniker-shk` |

### HWK-Lehrstellenbörse (`utm_source=hwk`)

| Stelle | Referenz | Link |
|---|---|---|
| Ausbildung zum Anlagenmechaniker SHK (m/w/d) | SHK-AZ-2026-04 | `https://karriere.bad-energie.de/jobs/ausbildung-anlagenmechaniker-shk-wetzlar?utm_source=hwk&utm_medium=jobboard&utm_campaign=ausbildung-anlagenmechaniker-shk` |

### Indeed (`utm_source=indeed`, nur zur Kontrolle)

Der Indeed-Feed setzt diese Links selbst. Sie stehen hier, damit man im Feed und in Indeed prüfen kann, ob die richtige Adresse ankommt.

| Stelle | Link |
|---|---|
| Anlagenmechaniker SHK | `https://karriere.bad-energie.de/jobs/anlagenmechaniker-shk-wetzlar?utm_source=indeed&utm_medium=jobboard&utm_campaign=anlagenmechaniker-shk` |
| Kundendiensttechniker | `https://karriere.bad-energie.de/jobs/kundendiensttechniker-waermepumpe-wetzlar?utm_source=indeed&utm_medium=jobboard&utm_campaign=kundendiensttechniker-shk` |
| Obermonteur / Projektleiter | `https://karriere.bad-energie.de/jobs/obermonteur-projektleiter-shk-wetzlar?utm_source=indeed&utm_medium=jobboard&utm_campaign=obermonteur-projektleiter-shk` |
| Ausbildung Anlagenmechaniker | `https://karriere.bad-energie.de/jobs/ausbildung-anlagenmechaniker-shk-wetzlar?utm_source=indeed&utm_medium=jobboard&utm_campaign=ausbildung-anlagenmechaniker-shk` |

## a) Indeed: Karriereseite indexieren lassen

Indeed übernimmt Stellen kostenlos aus XML-Feeds von Arbeitgeber-Websites, entscheidet aber selbst über die Aufnahme.

1. Im Indeed-Arbeitgeberkonto (oder über den Indeed-Support für Arbeitgeber) anfragen, dass die Stellen der Karriereseite per XML-Feed übernommen werden. Angeben: Firmenname „Bad und Energie GmbH Lahn Dill“, Karriereseite `https://karriere.bad-energie.de/jobs`, Feed `https://karriere.bad-energie.de/feeds/indeed.xml`.
2. **Keine zusätzlichen manuellen Indeed-Anzeigen** für dieselben Stellen anlegen. Indeed wertet doppelte Anzeigen ab.
3. Eine Stelle hat genau einen Standort (Wetzlar). Keine Kopien für Gießen, Herborn usw. anlegen: Indeed straft Location-Blasting ab, Google wertet Stadt-Duplikate als Doorway-Pages.
4. Nach der Aufnahme stichprobenartig prüfen: Titel, Gehaltsspanne, Link mit `utm_source=indeed`.

Wenn Indeed für die organische Aufnahme eine Bezahl-Option oder „Indeed Apply“ verlangt, bitte nicht selbst abschließen, sondern mit dem Owner klären.

## b) Bundesagentur für Arbeit und HWK-Lehrstellenbörse (manuell)

Die HR-BA-XML-Schnittstelle braucht einen Kooperationsvertrag und ein Zertifikat. Sie ist deshalb erst für Phase 5 vorgesehen. Bis dahin werden die Stellen von Hand eingestellt.

### Jobbörse der Bundesagentur für Arbeit

1. Auf `arbeitsagentur.de` als Arbeitgeber anmelden (kostenloses Arbeitgeberkonto; bei der ersten Anmeldung prüft der Arbeitgeber-Service das Unternehmen).
2. Je Stelle ein Stellenangebot anlegen. Texte **aus der jeweiligen Stellenseite übernehmen**, nichts ergänzen:
   - Titel: `title` der Stelle (siehe Tabelle oben), ohne Jahreszahl.
   - Beruf: die passende BERUFENET-Bezeichnung auswählen, z. B. „Anlagenmechaniker/in – Sanitär-, Heizungs- und Klimatechnik“. Die ID danach in `ba.berufenetId` der Stelle eintragen (nicht schätzen).
   - Arbeitsort: Siegmund-Hiepe-Str. 20, 35578 Wetzlar. Ein Standort je Anzeige.
   - Arbeitszeit, Befristung, Gehaltsspanne: wie auf der Stellenseite unter „Auf einen Blick“.
   - Ausbildung: als **Ausbildungsplatz** anlegen, nicht als Arbeitsstelle.
   - Bewerbungsweg: Online-Bewerbung mit dem getrackten Link aus der Tabelle oben.
   - Veröffentlichung bis: spätestens das `validThrough`-Datum der Stelle.
3. Bei jeder Änderung der Stelle im Repo (Text, Gehalt, Verlängerung, Schließen) die BA-Anzeige am selben Tag anpassen oder beenden.

### Lehrstellenbörse der Handwerkskammer Wiesbaden

1. Bei der Ausbildungsberatung der Handwerkskammer Wiesbaden nach dem Zugang zur Lehrstellenbörse fragen (für Mitgliedsbetriebe kostenlos; viele Kammern nutzen dafür den „Lehrstellen-Radar“).
2. Den Ausbildungsplatz mit dem `hwk`-Link aus der Tabelle oben eintragen. Ausbildungsbeginn: „nach Absprache“, wie auf der Stellenseite.
3. Die Stelle läuft im Registry bis 31.12.2026 (`validThrough`), weil die Texte „Einstieg 2026“ nennen. Spätestens dann die Anzeige beenden oder für 2027 neu anlegen (Owner-Frage B5 in `fakten-abgleich.md`).

## c) Aggregatoren mit `/feeds/jobs.xml`

Bei jedem Anbieter einmalig den Feed `https://karriere.bad-energie.de/feeds/jobs.xml` anmelden. Die Anmeldung läuft über das Arbeitgeber- bzw. Partnerformular des Anbieters oder per E-Mail an den Partner-Support.

| Anbieter | Hinweis |
|---|---|
| Jooble | Feed über das Arbeitgeber-/Partnerformular einreichen. |
| Talent.com | Feed über das Arbeitgeberformular für XML-Feeds einreichen. |
| Adzuna | Feed beim Adzuna-Support für Arbeitgeber einreichen. |
| Careerjet | Feed über das Formular für Website-Betreiber einreichen. |
| Kimeta | Kimeta durchsucht Karriereseiten selbst; Feed trotzdem per Kontaktformular melden. |

Der Feed enthält je Stelle Titel, Link (mit `utm_source=jobs-xml`), Referenz, Adresse, Radius, HTML-Beschreibung, Jobtyp, Datum, Ablaufdatum und das Gehalt als Text und strukturiert (`salarymin`, `salarymax`, `salarycurrency`, `salaryperiod`).

Verlangt ein Anbieter ein eigenes Format oder eine eigene Feed-Adresse, nichts umbauen, sondern an die Entwicklung melden. `buildGenericXml()` kann eine eigene `utm_source` je Partner erzeugen.

## d) Google Search Console

Einmalig:

1. Property für `karriere.bad-energie.de` anlegen (Domain-Property per DNS-Eintrag) und die Sitemap `https://karriere.bad-energie.de/sitemap.xml` einreichen.

Nach jedem Deploy mit neuen oder geänderten Stellen:

1. **Test für Rich-Suchergebnisse** (`https://search.google.com/test/rich-results`) für jede Stellenseite: genau ein gültiges „Stellenanzeige“-Element, keine Fehler. Warnungen zu optionalen Feldern sind kein Blocker, aber notieren.
2. **URL-Prüfung** in der Search Console für die geänderte Stellenseite, dann „Indexierung beantragen“.
3. Bericht **„Stellenanzeigen“** (unter „Verbesserungen“ bzw. „Ergebnisse mit erweiterter Darstellung“): Zahl der gültigen Elemente = Zahl der veröffentlichten Stellen. Fehler sofort beheben.
4. **Leistung** mit Filter „Darstellung in der Suche“ → Stellenangebote/Stellendetails: Impressionen und Klicks je Stelle.
5. Kontrolle: Startseite, `/jobs` und `/bewerbung` dürfen **kein** JobPosting enthalten. Das prüft auch `bun run test:graph` nach dem Build.

Eine geschlossene Stelle (`status: 'archived'`) zeigt „Besetzt“ mit `noindex` und ohne JobPosting. Google nimmt sie nach dem nächsten Crawl aus Google for Jobs; mit der URL-Prüfung geht es schneller.

IndexNow (Bing, Yandex u. a.) wird über `POST /api/indexnow` mit Bearer-Token ausgelöst. Ohne Body werden Startseite, `/jobs`, alle Stellenseiten und `/bewerbung` gemeldet.

## e) Widget „Wir stellen ein“ auf bad-energie.de

`/feeds/jobs.json` liefert ein Array von schema.org-JobPosting-Objekten. Die Antwort erlaubt den Abruf von `https://bad-energie.de` (CORS). Wird die Kunden-Website unter `www.bad-energie.de` ausgeliefert, muss sie auf `https://bad-energie.de` umleiten oder der Header in `app/feeds/[feed]/route.ts` angepasst werden.

Beispiel (ohne Bibliotheken, bricht still ab, wenn der Feed nicht erreichbar ist):

```html
<section aria-labelledby="wir-stellen-ein">
  <h2 id="wir-stellen-ein">Wir stellen ein</h2>
  <ul id="offene-stellen"></ul>
  <p><a href="https://karriere.bad-energie.de/jobs">Alle offenen Stellen</a></p>
</section>
<script>
  fetch('https://karriere.bad-energie.de/feeds/jobs.json')
    .then((res) => (res.ok ? res.json() : []))
    .then((jobs) => {
      const list = document.getElementById('offene-stellen');
      for (const job of jobs) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = job.url;
        link.textContent = job.title;
        item.append(link);
        list.append(item);
      }
    })
    .catch(() => {});
</script>
```

Wichtig:

- **Kein JobPosting-JSON-LD auf bad-energie.de einbauen.** Google erlaubt das Markup nur auf der Seite, auf der man sich bewirbt; doppelte JobPostings können zum Ausschluss aus Google for Jobs führen.
- Die Links enthalten `utm_source=jobs-json`. So sind Bewerbungen über die Kunden-Website erkennbar.
- Die Content-Security-Policy von bad-energie.de muss `connect-src https://karriere.bad-energie.de` erlauben.
- Gehalt (`baseSalary.value.minValue`/`maxValue`) und Ort stehen ebenfalls im JSON, falls das Widget sie anzeigen soll.
