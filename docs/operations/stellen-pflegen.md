# Stellen pflegen

Alle Stellen liegen als TypeScript im Repo (`lib/jobs/data/*.ts`, eine Datei je Stelle). Stellenseiten, JSON-LD, Sitemap und Feeds (`/feeds/indeed.xml`, `/feeds/jobs.xml`, `/feeds/jobs.json`) werden daraus erzeugt. Jede Änderung läuft als Pull Request. Die Tests prüfen jede Stelle, bevor sie live geht.

## Grundregeln

- **Nur belegte Fakten.** Vorteile werden über `benefitFactIds` aus `lib/content/facts.ts` eingebunden. Ein neuer Vorteil braucht dort zuerst einen Eintrag mit `source` als `pfad@commit` (z. B. `lib/data/company.ts@393df01`), damit die Fundstelle auch nach dem Löschen der Datei nachvollziehbar bleibt.
- **Gehalt** steht als Spanne in `salary` und wird auf Seite, Schema und Feeds angezeigt. Wenn die `metaDescription` ein Gehalt nennt, muss es dazu passen. Das prüft ein Test.
- **Texte in Du-Form**, Satzanfang groß, sonst normale Schreibung.
- **Slugs bleiben dauerhaft.** Ein einmal veröffentlichter Slug wird nie gelöscht.

## Neue Stelle anlegen

1. Eine bestehende Datei in `lib/jobs/data/` kopieren, z. B. `anlagenmechaniker-shk.ts` → `kaeltetechniker-shk.ts`.
2. Felder ausfüllen:
   - `id`: kurz, stabil, z. B. `kaeltetechniker-shk`.
   - `referenceCode`: `SHK-XX-JJJJ-NN`, fortlaufend.
   - `slug`: Keyword + Ort, z. B. `kaeltetechniker-shk-wetzlar`.
   - `title` mit „(m/w/d)“ und ohne Jahreszahl (Google-Richtlinie für JobPosting, gilt auch für die Feeds). `titleShy` ist derselbe Text mit `­` in langen Wörtern (`Kälte­techniker`).
   - `seo.metaTitle` ≤ 60 Zeichen, `seo.metaDescription` ≤ 155 Zeichen.
   - `datePosted`, `validThrough` (mindestens 14 Tage in der Zukunft) und `updatedAt`. Nennt ein Text ein Jahr („Ausbildung 2026“), darf `validThrough` nicht nach dem Ende dieses Jahres liegen. Das prüft das Schema.
   - `channels`: wo die Stelle erscheinen soll (`googleJobs`, `indeedFeed`, `genericFeed`, `ba`).
3. Die ID in `JOB_IDS` in `lib/jobs/schema.ts` ergänzen.
4. Die Stelle in `ALL_JOBS` in `lib/jobs/registry.ts` eintragen. Die Reihenfolge dort ist die Anzeigereihenfolge.
5. Den Slug in `lib/jobs/slugs.lock.json` eintragen.
6. Tests laufen lassen: `bun run test`, dann den PR öffnen.

Eine Stelle, die nur im Bewerbungsflow wählbar sein soll (ohne Seite, Schema und Feed), bekommt `status: 'funnel_only'`. Alle `channels` stehen dann auf `false`.

## Stelle ändern

- Text oder Gehalt anpassen und `updatedAt` auf das heutige Datum setzen.
- **Verlängern:** `validThrough` nach hinten schieben. Abgelaufene Stellen fallen automatisch aus den Feeds. `getJobsExpiringWithin(new Date())` aus `lib/jobs/registry.ts` listet alle Stellen, die in weniger als 14 Tagen ablaufen. Ab Phase 2 erinnert der tägliche Cron daran. Der Vitest-Check prüft dieselbe Regel gegen das aktuelle Datum, die CI schlägt also 14 Tage vor dem Ablauf fehl.
- **Slug ändern:** Den neuen Slug in `slug` eintragen, den alten in `redirectFrom`. Beide bleiben in `slugs.lock.json`.

## Stelle schließen (besetzt)

1. `status: 'archived'` setzen und `updatedAt` aktualisieren.
2. Datei, Slug und Lock-Eintrag bleiben. Die Seite zeigt „Besetzt“ (noindex, kein JobPosting) und verlinkt auf ähnliche Stellen. Die Feeds lassen die Stelle automatisch weg.
3. Später wieder öffnen: `status: 'published'` setzen und `validThrough` neu setzen.

Eine Stelle sollte nie gelöscht werden. Wer sie trotzdem löscht, muss ihren Slug in `redirectFrom` einer anderen Stelle eintragen. Sonst schlägt der Slug-Lock-Test fehl.

## Fakten, die noch auf den Owner warten

Einige Aussagen sind in `facts.ts` mit `pending` markiert, z. B. „Übernahmegarantie“ und „1-%-Privatnutzung“ (siehe `docs/operations/fakten-abgleich.md`). Der Test erlaubt sie nur bei den Stellen in `pending.onlyForJobIds`. Nach der Bestätigung `pending` entfernen. Danach sind sie überall nutzbar.

## Nach dem Merge

Der Deploy aktualisiert Seiten, Sitemap und Feeds. Die Stelle bei Jobbörsen, die nicht per Feed angebunden sind (BA-Portal, HWK-Lehrstellenbörse), bitte von Hand nachziehen (`docs/operations/stellenboersen.md`).
