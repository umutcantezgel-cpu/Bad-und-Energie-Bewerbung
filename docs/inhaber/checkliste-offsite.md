# Checkliste außerhalb der Website

Stand: 2026-10-14 · für den Inhaber · gehört zu `_relaunch/MENSCHEN.md` M-030, M-032, M-036, M-040

Die Karriereseite ist technisch gut aufgestellt. Ob Bewerber sie finden, entscheidet sich aber zu einem großen Teil außerhalb der Website: in der Search Console, bei der Arbeitsagentur, im Google-Unternehmensprofil und über Links aus der Region. Diese Schritte kann nur der Betrieb selbst erledigen, weil sie eure Konten und euren Namen brauchen. Alle Schritte sind kostenlos.

Die Reihenfolge folgt der Wirkung. Schritt 1 und 3 bringen am meisten.

## Übersicht

| Nr. | Schritt | Wofür | Erledigt am |
|---|---|---|---|
| 1 | Google Search Console: Domain per DNS bestätigen, Sitemaps einreichen, Service-Account | Google findet jede Stelle sofort; Daten für die Ortsseiten | |
| 2 | Bing Webmaster Tools: Import aus der Search Console | Bing, ChatGPT-Suche, Copilot | |
| 3 | Bundesagentur für Arbeit: Arbeitgeberkonto, alle Stellen einstellen | größte kostenlose Jobbörse; bisher 0 Treffer | |
| 4 | HWK-Lehrstellenbörse: Ausbildung 2027 und Praktikum | Schulabgänger und Eltern | |
| 5 | Google-Unternehmensprofil: Kategorien, Logo, jede Woche ein Beitrag | lokale Suche und Karte | |
| 6 | Kununu: Profil übernehmen, Team um Bewertungen bitten | Arbeitgeberbewertungen, KI-Antworten | |
| 7 | Lokale Links: Schulen, IHK-Messe, Innung, Pressemitteilung „100 Jahre“ | Bekanntheit in der Region | |
| 8 | Bosch und Buderus anfragen | Partnerstatus, Badge, Erlaubnis für die Zeichnungen | `bosch-anfrage.md` |
| 9 | Ticket an den Dienstleister von bad-energie.de | Links von der Hauptseite, Google sieht CSS und Bilder | `ticket-hauptdomain.md` |

Wenn alles erledigt ist: die Adressen eurer Profile schicken (Unternehmensprofil, Kununu und alle weiteren), damit wir sie auf der Website als `sameAs` eintragen (M-030).

## Was in Anzeigen, Beiträgen und Profilen stehen darf

Alles, was ihr außerhalb der Website schreibt, muss zu den Angaben auf der Website passen. Sonst widersprechen sich die Quellen, und Google oder KI-Antworten trauen keiner von beiden.

- **Belegt und frei verwendbar:** Meisterbetrieb seit 1926 in Wetzlar · 15 Leute im Team · Wärmepumpen, Heizung und Bäder · alle Baustellen im Umkreis von 35 km um Wetzlar · keine Fernmontage, jeden Abend zu Hause · kein Wochenend-Notdienst · flexible Arbeitszeiten · keine unbezahlten Überstunden · 30 Tage Urlaub · Vergütung über Tarif plus Urlaubs- und Weihnachtsgeld · unbefristeter Arbeitsvertrag · Bewerbung in 60 Sekunden, kein Lebenslauf nötig.
- **Lohn:** keine Euro-Beträge, sondern „Lohn auf Anfrage“ (Entscheidung E-030). Fragt jemand nach, nennt ihr die Spanne am Telefon oder vor dem Kennenlernen.
- **Nicht verwenden:** feste Uhrzeiten oder „pünktlich Feierabend“ (flexible Arbeitszeiten, fakten-abgleich B28) · „Premium Partner“, bevor die Bosch-Urkunde vorliegt (M-020) · „führend“, „bester“ und andere Superlative · „Werkstatt“, solange B31 offen ist (belegt ist „Firmensitz und Lager“).
- **Keine Kopien je Ort:** jede Stelle nur einmal, mit Arbeitsort Wetzlar. Kopien für Gießen, Herborn usw. werten Indeed und Google ab.

---

## 1. Google Search Console

Die Search Console zeigt, ob Google die Stellen und Ortsseiten kennt, und meldet Fehler. Ohne sie lassen sich die Regeln für die Ortsseiten nicht prüfen (`docs/operations/orte-monitoring.md`).

**Du brauchst:** das Google-Konto des Betriebs (am besten dasselbe wie für das Unternehmensprofil) und Zugang zur DNS-Verwaltung von bad-energie.de. Liegt die DNS-Verwaltung beim Dienstleister der Hauptdomain, beauftragst du dort den Eintrag (Vorlage im Ticket, `ticket-hauptdomain.md`, Punkt 5).

### 1.1 Domain bestätigen

1. https://search.google.com/search-console öffnen und mit dem Google-Konto des Betriebs anmelden.
2. **Property hinzufügen** → Typ **Domain** wählen (nicht „URL-Präfix“) → `bad-energie.de` eingeben. Die Domain-Property deckt auch `karriere.bad-energie.de` und `www.bad-energie.de` ab.
3. Google zeigt einen TXT-Eintrag der Form `google-site-verification=…`. Diesen Eintrag in der DNS-Verwaltung von bad-energie.de als **TXT-Eintrag für die Domain selbst** (Host `@` bzw. leer) anlegen. Bestehende Einträge nicht löschen.
4. Zurück in der Search Console auf **Bestätigen** klicken. Klappt es nicht sofort, nach einer Stunde noch einmal; DNS-Änderungen brauchen manchmal bis zu einem Tag.
5. Gibt es die Property schon (zum Beispiel vom Dienstleister angelegt), lass dich dort als **Inhaber** eintragen, statt eine zweite anzulegen.

### 1.2 Sitemaps einreichen

1. https://karriere.bad-energie.de/robots.txt öffnen. Unten stehen fünf Zeilen `Sitemap: https://…`: der Index `…/sitemap.xml` und je eine Sitemap für Kern, Stellen, Orte und Themen (`…/sitemap/kern.xml`, `…/sitemap/stellen.xml`, `…/sitemap/orte.xml`, `…/sitemap/themen.xml`).
2. In der Search Console links **Sitemaps** → jede dieser Adressen einzeln eintragen → **Senden**. Die Orts-Sitemap `https://karriere.bad-energie.de/sitemap/orte.xml` ist die, die jede Woche geprüft wird.
3. Optional die Sitemap der Hauptseite einreichen: `https://bad-energie.de/sitemap.xml`.
4. Das Datum notieren, an dem die Orts-Sitemap eingereicht wurde (Protokoll in `docs/operations/orte-monitoring.md`).

### 1.3 Service-Account für die Google Indexing API (M-032)

Damit meldet die Website jede neue oder geänderte Stelle nach dem Deploy selbst an Google. Neue Stellen erscheinen so schneller in Google for Jobs, besetzte verschwinden schneller.

1. https://console.cloud.google.com öffnen (dasselbe Google-Konto) → ein neues Projekt anlegen, zum Beispiel „karriere-bad-energie“.
2. **APIs und Dienste → Bibliothek** → „Web Search Indexing API“ suchen → **Aktivieren**.
3. **IAM und Verwaltung → Dienstkonten → Dienstkonto erstellen**, Name zum Beispiel „indexierung“. Rollen im Projekt sind nicht nötig.
4. Das neue Dienstkonto öffnen → **Schlüssel → Schlüssel hinzufügen → Neuen Schlüssel erstellen → JSON**. Die heruntergeladene Datei ist ein Passwort: nicht per Mail, Chat oder Messenger weitergeben.
5. Die E-Mail-Adresse des Dienstkontos kopieren (endet auf `iam.gserviceaccount.com`).
6. In der Search Console: **Einstellungen → Nutzer und Berechtigungen → Nutzer hinzufügen** → diese Adresse eintragen, Berechtigung **Inhaber**.
7. In GitHub (Repository der Karriereseite): **Settings → Environments** → die Umgebung, die der Workflow `indexierung.yml` nennt → **Add environment secret** → Name `GOOGLE_INDEXING_SA_KEY`, Wert: der komplette Inhalt der JSON-Datei. Danach die Datei auf deinem Rechner löschen.
8. Kurz Bescheid geben, dass der Schlüssel hinterlegt ist. In den Protokollen des Workflows stehen nur Zählwerte, nie der Schlüssel.

### 1.4 Nach jedem Deploy mit neuen oder geänderten Stellen

Test für Rich-Suchergebnisse je Stellenseite, URL-Prüfung, Bericht „Stellenanzeigen“: Ablauf in `docs/operations/stellenboersen.md`, Abschnitt d).

## 2. Bing Webmaster Tools

Bing liefert die Suchergebnisse für ChatGPT-Suche und Copilot mit. Der Import übernimmt die bestätigte Domain und die Sitemaps aus der Search Console.

1. https://www.bing.com/webmasters öffnen und anmelden (Microsoft-, Google- oder Facebook-Konto).
2. **Aus der Google Search Console importieren** wählen → mit dem Google-Konto des Betriebs anmelden → Zugriff erlauben.
3. Die Property `bad-energie.de` auswählen → **Importieren**. Websites und Sitemaps werden übernommen; eine eigene Bestätigung ist nicht nötig.
4. Unter **Sitemaps** prüfen, ob alle Adressen aus robots.txt da sind.
5. IndexNow läuft bereits über die Website und meldet Änderungen an Bing; dafür ist hier nichts zu tun.
6. Optional: In „Bing Places for Business“ das Unternehmensprofil aus Google übernehmen.

## 3. Bundesagentur für Arbeit: Arbeitgeberkonto und alle Stellen (M-040)

Die Jobbörse der Arbeitsagentur ist der größte kostenlose Kanal. Am 14.10.2026 fand die Suche nach „Bad und Energie“ in Wetzlar 0 Treffer; im 25-km-Umkreis standen dort 94 Anzeigen für Anlagenmechaniker. Google for Jobs zeigt auch Anzeigen der Arbeitsagentur.

### 3.1 Konto anlegen

1. https://www.arbeitsagentur.de → **Unternehmen** → Jobbörse → als Arbeitgeber **registrieren** (kostenlos).
2. Firmendaten wie im Impressum: Bad und Energie GmbH Lahn Dill, Siegmund-Hiepe-Str. 20, 35578 Wetzlar, HRB 2449 Amtsgericht Wetzlar.
3. Bei der ersten Anmeldung prüft der Arbeitgeber-Service das Unternehmen und meldet sich. Fragen beantwortet der Arbeitgeber-Service unter 0800 4 5555 20 (gebührenfrei).

### 3.2 Jede Stelle einstellen

Die Anleitung mit allen Feldern steht in `docs/operations/stellenboersen.md`, Abschnitt b). Kurz:

1. Je Stelle **ein** Stellenangebot. Texte von der Stellenseite übernehmen, nichts ergänzen.
2. **Bewerbungsweg:** Online-Bewerbung mit genau dem Link aus der Tabelle „Bundesagentur für Arbeit“ in `stellenboersen.md` (er endet auf `utm_source=arbeitsagentur&…`). Nur so ist im Postfach erkennbar, dass die Bewerbung über die Arbeitsagentur kam.
3. **Bezahlung:** kein Betrag (E-030). Verlangt das Formular eine Angabe, das Feld leer lassen bzw. „nach Vereinbarung“ wählen.
4. **Ausbildung** als Ausbildungsplatz anlegen, nicht als Arbeitsstelle; das **Schülerpraktikum** als Praktikum; die **Bürofachkraft** als eine Anzeige für Voll- und Teilzeit.
5. **Ein Arbeitsort** je Anzeige: Wetzlar. Keine Kopien für andere Orte.
6. **Veröffentlichen bis** höchstens zum Ablaufdatum der Stelle auf der Website.

### 3.3 Prüfen und pflegen

- Nach der Freischaltung in der Jobsuche der Arbeitsagentur nach „Bad und Energie“ suchen: Alle Stellen müssen erscheinen.
- Bewerbungen über die Arbeitsagentur tragen in der Bewerbungs-E-Mail `utm_source: arbeitsagentur`.
- Ändert sich eine Stelle auf der Website (Text, Verlängerung, besetzt), die Anzeige am selben Tag anpassen oder beenden.
- Die **Ausbildung 2026** endet am 31.12.2026: Anzeige spätestens dann beenden. Die Ausbildung 2027 hat eine eigene Anzeige.

## 4. HWK-Lehrstellenbörse

1. Bei der Ausbildungsberatung der Handwerkskammer Wiesbaden nach dem Zugang zur Lehrstellenbörse fragen (für Mitgliedsbetriebe kostenlos; viele Kammern nutzen dafür den „Lehrstellen-Radar“).
2. **Ausbildung 2027** eintragen, Beginn „nach Absprache“, mit dem `hwk`-Link aus `stellenboersen.md`.
3. Nimmt die Börse auch Praktika auf, das **Schülerpraktikum** ebenso eintragen (Dauer „nach Absprache“, keine Angabe zu Geld).
4. Die Ausbildung 2026 dort spätestens am 31.12.2026 beenden.

## 5. Google-Unternehmensprofil

Das Profil erscheint in der lokalen Suche und auf Google Maps. Es ist für Bewerber oft der erste Eindruck.

1. https://business.google.com öffnen und das Profil „Bad und Energie GmbH Lahn Dill“ auswählen.
2. **Kategorien prüfen:** Die Hauptkategorie soll das Kerngeschäft treffen. Im Auswahlfeld „Heizung“, „Sanitär“, „Wärmepumpe“ oder „Bad“ eintippen und aus den Vorschlägen von Google wählen. Weitere Kategorien nur, wenn sie stimmen.
3. **Logo** hochladen (Original, quadratischer Ausschnitt). Eigene Fotos von Fahrzeugen, Gebäude und Team sind fürs Profil sehr hilfreich; „keine Fotos“ gilt nur für die Website. Auf Fotos mit Personen nur, wer zugestimmt hat.
4. **Öffnungszeiten** wie im Fuß der Website (Büro erreichbar).
5. **Jede Woche ein Beitrag „Wir stellen ein“:**
   - Beitragstyp „Neuigkeit“, zwei bis vier Sätze, nur Belegtes (oben).
   - Keine Telefonnummer in den Beitragstext schreiben (Google lehnt solche Beiträge oft ab; die Nummer steht im Profil).
   - Schaltfläche **„Weitere Infos“** mit Link. Für alle Stellen: `https://karriere.bad-energie.de/jobs?utm_source=gbp&utm_medium=beitrag&utm_campaign=wir-stellen-ein`. Für eine einzelne Stelle: den Link aus der Tabelle „Bundesagentur für Arbeit“ in `stellenboersen.md` nehmen und darin `utm_source=arbeitsagentur&utm_medium=jobboard` durch `utm_source=gbp&utm_medium=beitrag` ersetzen. Beispiel: `https://karriere.bad-energie.de/jobs/anlagenmechaniker-shk-wetzlar?utm_source=gbp&utm_medium=beitrag&utm_campaign=anlagenmechaniker-shk`.
   - Reihenfolge, damit jede Stelle regelmäßig dran ist: Anlagenmechaniker → Kundendienst → Ausbildung 2027 → Quereinsteiger → Bürofachkraft → Obermonteur → Schülerpraktikum, dann von vorn.
   - Bewerbungen über das Profil tragen in der Bewerbungs-E-Mail `utm_source: gbp`.
6. **Bewertungen:** Kundinnen und Kunden nach getaner Arbeit freundlich um eine Google-Bewertung bitten und auf jede Bewertung antworten. Aktuelle Zahl und Monat bitte melden (M-009), dann zeigt die Website die Bewertungszeile mit Stand.
7. Die Adresse des Profils notieren (M-030).

Vorlagen für Beiträge (nur Belegtes, bei Bedarf kürzen):

> **Anlagenmechaniker SHK (m/w/d) in Wetzlar.** Wärmepumpen, Heizung und Bäder auf Baustellen im Umkreis von 35 km – keine Fernmontage, kein Wochenend-Notdienst, 30 Tage Urlaub. Bewerbung in 60 Sekunden, ohne Lebenslauf.

> **Ausbildung 2027 zum Anlagenmechaniker SHK (m/w/d).** Start nach Absprache, Ausbildungsvergütung über Tarif, eigenes Hilti-Werkzeugset ab dem ersten Tag. Du lernst von Meistern und Gesellen und arbeitest von Anfang an richtig mit.

> **Quereinsteiger und Montagehelfer (m/w/d).** Baustellen im Umkreis von 35 km um Wetzlar, jeden Abend zu Hause, familiäres Meisterteam. Bewerbung in 60 Sekunden, ohne Lebenslauf.

> **Bürofachkraft (m/w/d) in Voll- oder Teilzeit.** Telefon und Termine, Angebote und Rechnungen, Material und Bestellungen, allgemeine Verwaltung – in einem Meisterbetrieb mit 15 Leuten. Bewerbung in 60 Sekunden.

> **Schülerpraktikum im SHK-Handwerk.** Lerne Wärmepumpen, Heizung und Bäder kennen. Die Dauer stimmen wir mit deiner Schule ab.

## 6. Kununu

Kununu-Bewertungen tauchen in Google und in KI-Antworten auf Fragen wie „guter SHK-Arbeitgeber in Wetzlar“ auf.

1. https://www.kununu.com → Bereich für Arbeitgeber → nach „Bad und Energie“ suchen. Gibt es ein Profil, **Profil übernehmen** (das Basisprofil ist kostenlos); sonst ein neues anlegen.
2. Firmendaten wie im Impressum, Beschreibung nur mit Belegtem (oben). Logo hochladen.
3. **Team um Bewertungen bitten**, fair und freiwillig: einmal im Team ansprechen oder per Aushang, mit dem Link zum Profil. Keine Gegenleistung, keine Vorgaben zum Inhalt, niemand füllt die Bewertung im Beisein der Chefs aus. Gekaufte oder gelenkte Bewertungen sind unzulässig.
4. Auf Bewertungen sachlich antworten, auch auf kritische.
5. Die Adresse des Profils notieren (M-030).

## 7. Lokale Links

Links von Schulen, Kammer, Innung und Presse aus der Region zeigen Google, dass der Betrieb hier verwurzelt ist. Bitte nie Links kaufen oder tauschen.

1. **Berufsschule:** Welche Schule für eure Azubis zuständig ist, klärt M-024 (laut Verordnung und Schulbezirkssatzung die Werner-von-Siemens-Schule Wetzlar, Dammstraße 62; die Gewerblichen Schulen Dillenburg gelten für Betriebe im Schulbezirk I, etwa in Dillenburg oder Herborn). Bei der Schulleitung oder der Berufsorientierung anbieten: Praktikumsplätze, Betriebsbesichtigung, feste Ansprechperson. Bitten: Eintrag in die Liste der Ausbildungs- und Praktikumsbetriebe mit Link auf `https://karriere.bad-energie.de/jobs`.
2. **Allgemeinbildende Schulen** im Umkreis (Haupt-, Real- und Gesamtschulen): das Schülerpraktikum für die Berufsorientierung anbieten, mit demselben Link.
3. **IHK-Ausbildungs- und Studienmesse Wetzlar** in der Stadthalle am **09./10.09.2027** (das Handwerk ist zugelassen, die Agentur für Arbeit Wetzlar stellt aus): Anmeldefrist beim Veranstalter erfragen und als Aussteller anmelden. Die Ausstellerliste verlinkt in der Regel auf die Website; als Adresse `https://karriere.bad-energie.de` angeben.
4. **Innung Sanitär-, Heizungs- und Klimatechnik Lahn-Dill:** prüfen, ob der Betrieb in der Mitgliederliste mit Link steht, und um den Link zur Karriereseite bitten; eine Ausbildungsbörse der Innung ebenso nutzen.
5. **Lahn-Dill-Kreis:** Wenn der Kreis seine Fachbetriebspartner veröffentlicht, um einen Link bitten.
6. **Pressemitteilung „100 Jahre“** an die Lokalpresse, **vor dem 31.12.2026** (danach ist das Jubiläum vorbei). Entwurf unten; Zitat und Datum bitte selbst einsetzen, vor dem Versand prüfen lassen.

Entwurf der Pressemitteilung:

> **100 Jahre Bad und Energie: Wetzlarer Meisterbetrieb sucht Fachkräfte und Azubis**
>
> Wetzlar, [Datum]. Die Bad und Energie GmbH Lahn Dill besteht 2026 seit 100 Jahren. Der Innungs-Meisterbetrieb wurde 1926 in Wetzlar gegründet und arbeitet heute mit 15 Leuten an Wärmepumpen, Heizungen und Bädern – auf Baustellen im Umkreis von 35 Kilometern um Wetzlar, ohne Fernmontage.
>
> [Zitat von Sabri Demir, Geschäftsführer: zwei, drei Sätze zur Geschichte des Betriebs und dazu, was ihn heute ausmacht.]
>
> Zum Jubiläum sucht der Betrieb Verstärkung: Anlagenmechaniker SHK, Kundendiensttechniker, Obermonteure, Quereinsteiger, eine Bürofachkraft und Auszubildende für 2027. Schülerinnen und Schüler können ein Praktikum machen. Die Bewerbung dauert rund 60 Sekunden und geht ohne Lebenslauf: karriere.bad-energie.de.
>
> Kontakt: Bad und Energie GmbH Lahn Dill, Siegmund-Hiepe-Str. 20, 35578 Wetzlar, Telefon 06441 42956, info@bad-energie.de

## 8. Bosch und Buderus

Fertige Anfrage mit genauer Liste: `bosch-anfrage.md` (M-020, M-021).

## 9. Hauptdomain bad-energie.de

Fertiger Ticket-Text für den Dienstleister: `ticket-hauptdomain.md` (M-036).
