# Stellen pflegen

Stand: 2026-10-14 (Lohn auf Anfrage, neue Stellen, Berufsschlüssel, Stellen-Frische; fakten-abgleich S1–S7)

Alle Stellen liegen als TypeScript im Repo (`lib/jobs/data/*.ts`, eine Datei je Stelle). Stellenseiten, JSON-LD, Sitemap und Feeds (`/feeds/indeed.xml`, `/feeds/jobs.xml`, `/feeds/jobs.json`) werden daraus erzeugt. Jede Änderung läuft als Pull Request. Die Tests prüfen jede Stelle, bevor sie live geht.

## Grundregeln

- **Nur belegte Fakten.** Vorteile werden über `benefitFactIds` aus `lib/content/facts.ts` eingebunden. Ein neuer Vorteil braucht dort zuerst einen Eintrag mit `source` als `pfad@commit` (z. B. `lib/data/company.ts@393df01`), damit die Fundstelle auch nach dem Löschen der Datei nachvollziehbar bleibt.
- **Lohn auf Anfrage, nie ein Betrag** (E-030, Inhaber 2026-10-14). Jede Stelle trägt `pay: 'auf-anfrage'`; Seite, JSON-LD und Feeds sagen „Lohn auf Anfrage“. Ein `salary` lehnt das Schema ab, ein Euro-Betrag in Titel, Texten, Paket oder Meta-Beschreibung lässt das Schema scheitern. Nach dem Build prüfen `bun run test:claims` (kein Betrag im HTML, in `llms.txt` und den Feeds) und `bun run test:graph` (kein `baseSalary` mit Zahl). Die Fakten ohne Zahl bleiben: über Tarif, Urlaubs- und Weihnachtsgeld, Prämien. Ausnahme Schülerpraktikum: `pay: 'keine-angabe'`, dort steht **kein Wort zu Geld** (auch nicht „Lohn auf Anfrage“).
- **EU-Entgelttransparenz:** Die Richtlinie (EU) 2023/970 (Art. 5, bis 7. Juni 2026 umzusetzen) gibt Bewerbenden das Recht, das Einstiegsentgelt oder seine Spanne **vor dem Vorstellungsgespräch** zu erfahren, in der Anzeige oder auf anderem Weg. Bei „Lohn auf Anfrage“ heißt das: Wer zum Kennenlernen eingeladen wird, bekommt die Spanne für die Stelle vorher genannt (Telefon, WhatsApp oder E-Mail), und das wird festgehalten. Nach dem bisherigen Gehalt fragen wir nicht (Art. 5 Abs. 2). Den Stand des deutschen Umsetzungsgesetzes vor jeder größeren Änderung prüfen.
- **Texte in Du-Form**, Satzanfang groß, sonst normale Schreibung.
- **Slugs bleiben dauerhaft.** Ein einmal veröffentlichter Slug wird nie gelöscht.

## Neue Stelle anlegen

1. Eine bestehende Datei in `lib/jobs/data/` kopieren, z. B. `anlagenmechaniker-shk.ts` → `kaeltetechniker-shk.ts`.
2. Felder ausfüllen:
   - `id`: kurz, stabil, z. B. `kaeltetechniker-shk`. Der Dateiname ist die `id`.
   - `referenceCode`: `SHK-XX-JJJJ-NN`, fortlaufend.
   - `slug`: Keyword + Ort, z. B. `kaeltetechniker-shk-wetzlar`.
   - `category`: `anlagenmechaniker`, `kundendienst`, `projektleitung`, `ausbildung`, `helfer`, `buero` oder `praktikum`. Danach richten sich die Fragen der Seite (`JOB_FAQ_IDS` in `lib/content/faq.ts`).
   - `title` mit „(m/w/d)“ und ohne Jahreszahl (Google-Richtlinie für JobPosting, gilt auch für die Feeds). `titleShy` ist derselbe Text mit `­` in langen Wörtern (`Kälte­techniker`).
   - `alsoKnownAs`: übliche andere Berufsbezeichnungen, sichtbar als „Auch gesucht als …“ (z. B. „Heizungsbauer“). Keine Ortsnamen, keine Werbewörter.
   - `seo.metaTitle` ≤ 60 Zeichen, `seo.metaDescription` ≤ 155 Zeichen.
   - `requirements`: nur, was der Inhaber bestätigt hat. Fehlen die Anforderungen noch, `requirements: []` und `requirementsOpen: 'M-0NN'` (Frage in `fakten-abgleich.md`); die Seite blendet „Das bringst du mit“ dann aus, das JobPosting nennt keine Qualifikationen.
   - `pay: 'auf-anfrage'` (siehe oben).
   - `beruf`: amtliche Schlüssel, **nachgeschlagen, nie geschätzt** (`lib/jobs/berufe.ts`, Quellen dort): `kldb` aus dem Schlüsselverzeichnis der BA (Auszubildende mit dem Zielberuf), `isco` genau dann, wenn der Umsteigeschlüssel der BA eindeutig ist (das Schema prüft es). `berufenetId` erst eintragen, wenn die Stelle im BA-Portal angelegt ist (`stellenboersen.md`). Daraus wird `occupationalCategory` im JobPosting.
   - `datePosted`, `updatedAt` und `validThrough`: `validThrough` mindestens 14 Tage in der Zukunft und **höchstens 90 Tage nach `updatedAt`** (Google empfiehlt kurze Laufzeiten; das Schema prüft es). Nennt ein Text ein Jahr („Ausbildung 2026“), darf `validThrough` nicht nach dem Ende dieses Jahres liegen.
   - `apply.questionSet`: `fachkraft`, `ausbildung` (auch Praktikum), `quereinstieg` oder `buero`.
   - `channels`: wo die Stelle erscheinen soll (`googleJobs`, `indeedFeed`, `genericFeed`, `ba`).
3. Die ID in `JOB_IDS` in `lib/jobs/ids.ts` ergänzen.
4. Die Stelle in `ALL_JOBS` in `lib/jobs/registry.ts` eintragen. Die Reihenfolge dort ist die Anzeigereihenfolge.
5. Den Slug in `lib/jobs/slugs.lock.json` eintragen.
6. Das Band „Einblick“ in `components/jobs/stelle/einblick-text.ts` schreiben (TypeScript verlangt einen Eintrag je ID): nur aus Stellendaten, Fakten, `REGION` und FAQ, keine 8-Wort-Folge, die schon bei einer anderen Stelle steht (Test `app/jobs/__tests__/einblick.test.ts`).
7. **Datenbank:** Die neue `job_id` (und ein neues Fragenset) per neuer Migration in die CHECK-Listen von `public.applications` aufnehmen (Vorlage `supabase/migrations/20261014095643_neue_stellen.sql`, Test `lib/supabase/__tests__/db-contract.test.ts`). Eingespielt wird von Hand durch die Phase-2-Session (Absprache E-012); bis dahin gehen Bewerbungen auf die neue Stelle als Not-E-Mail ans Team.
8. In `docs/operations/stellenboersen.md` die getrackten Links ergänzen (Test `app/jobs/__tests__/reach.test.ts`).
9. Tests laufen lassen: `bun run test`, dann den PR öffnen.

Eine Stelle, die nur im Bewerbungsflow wählbar sein soll (ohne Seite, Schema und Feed), bekommt `status: 'funnel_only'`. Alle `channels` stehen dann auf `false`. Seit 2026-10-14 gibt es keine solche Stelle mehr (der Quereinstieg ist veröffentlicht).

## Stelle ändern

- Text anpassen und `updatedAt` auf das heutige Datum setzen. Liegt `validThrough` dann mehr als 90 Tage danach, schlägt das Schema fehl: `validThrough` mit anpassen.
- **Verlängern:** `updatedAt` auf heute, `validThrough` höchstens 90 Tage danach. Abgelaufene Stellen fallen automatisch aus Seite, Sitemap und Feeds.
- **Erinnerung:** Der Workflow `.github/workflows/stellen-frische.yml` prüft jeden Morgen `lib/jobs/frische.ts` und hält genau ein Issue „Stellen-Frische: Stellen verlängern oder schließen“ offen, sobald eine Stelle in weniger als **28 Tagen** abläuft oder abgelaufen und abgelöst ist; ist nichts mehr zu tun, schließt er es. Der Vitest-Check (`getJobsExpiringWithin` in `lib/jobs/registry.ts`) lässt die CI **14 Tage** vor dem Ablauf fehlschlagen. Das Issue kommt also zwei Wochen vorher, Zeit für die Rückfrage beim Inhaber.
- **Slug ändern:** Den neuen Slug in `slug` eintragen, den alten in `redirectFrom`. Beide bleiben in `slugs.lock.json`.

## Neuer Jahrgang (Ausbildung)

Eine Ausbildung mit Jahreszahl im Text („Einstieg 2026“) endet spätestens am 31.12. dieses Jahres. Für den nächsten Jahrgang:

1. Eine **eigene Stelle** anlegen (eigene `id`, eigener `slug`, eigene `referenceCode`, z. B. `ausbildung-anlagenmechaniker-shk-2027`), mit den Schritten oben.
2. In der alten Stelle `nachfolger: '<neue id>'` setzen. Solange die Nachfolgerin live ist und nicht selbst bald abläuft, gilt das Ende der alten Stelle als geplant: Weder die CI noch das Frische-Issue melden sie. Nach ihrem Ablauf zeigt ihre Seite „Besetzt“ mit dem Knopf zur Nachfolgerin.
3. Nach dem Ablauf `status: 'archived'` setzen (das Frische-Issue erinnert daran, Abschnitt „Archivieren“).

Zusagen, die nur für einen Jahrgang bestätigt sind (z. B. die Übernahmegarantie, A1), nicht in die neue Stelle übernehmen.

## Stelle schließen (besetzt)

1. `status: 'archived'` setzen und `updatedAt` aktualisieren.
2. Datei, Slug und Lock-Eintrag bleiben. Die Seite zeigt „Besetzt“ (noindex, kein JobPosting) und verlinkt auf ähnliche Stellen. Die Feeds lassen die Stelle automatisch weg.
3. Später wieder öffnen: `status: 'published'` setzen, `updatedAt` und `validThrough` neu setzen.

Eine Stelle sollte nie gelöscht werden. Wer sie trotzdem löscht, muss ihren Slug in `redirectFrom` einer anderen Stelle eintragen. Sonst schlägt der Slug-Lock-Test fehl. Ihre `job_id` bleibt in der Datenbank-Liste (E-012: kein Wert fällt weg).

## Fakten, die noch auf den Owner warten

Einige Aussagen sind in `facts.ts` mit `pending` markiert, z. B. „Übernahmegarantie“, „1-%-Privatnutzung“ und „Bosch Premium Partner“ (siehe `docs/operations/fakten-abgleich.md`). Der Test erlaubt sie nur bei den Stellen in `pending.onlyForJobIds`. „Premium Partner“ sperrt zusätzlich `bun run test:claims` im gebauten Ergebnis, solange der Fakt offen ist (Urkunde fehlt, M-020). Nach der Bestätigung `pending` entfernen und die Quelle eintragen. Danach sind sie überall nutzbar.

## Nach dem Merge

Der Deploy aktualisiert Seiten, Sitemap und Feeds. Die Stelle bei Jobbörsen, die nicht per Feed angebunden sind (BA-Portal, HWK-Lehrstellenbörse), bitte von Hand nachziehen (`docs/operations/stellenboersen.md`).
