# Dokumentation

Übersicht über alle Dokumente zu karriere.bad-energie.de. Einstieg für Entwicklung und Architektur ist das [README im Hauptverzeichnis](../README.md).

## Plan

| Dokument | Inhalt |
|---|---|
| [`ROADMAP.md`](ROADMAP.md) | Verbindlicher Masterplan von der Microsite zur Recruiting-Plattform: Entscheidungen, Zielwerte, Architektur, Design-System, Bewerbungsflow, Reichweite, ATS (Phase 2), Sicherheit, SEO, Phasen 1–5, offene Owner-Punkte |

## Betrieb (`operations/`)

| Dokument | Für wen | Inhalt |
|---|---|---|
| [`betrieb.md`](operations/betrieb.md) | Owner, Betrieb, Entwicklung | Go-live-Checkliste (Resend-Key rotiert, Umgebungsvariablen und Geheimnisse, Supabase, IndexNow, Google Maps, Search Console, Indeed, BA), Statusprüfung mit `/api/status`, Monitoring, Bedeutung der 503, Bewerbungs-E-Mails lesen, Ergänzungen zuordnen, Löschfristen in Postfach und Datenbank |
| [`stellen-pflegen.md`](operations/stellen-pflegen.md) | Entwicklung, Owner | Stellen im Registry anlegen, ändern, verlängern und schließen |
| [`stellenboersen.md`](operations/stellenboersen.md) | Owner, Betrieb | Feeds, Indeed-Aufnahme, BA und HWK mit getrackten Links, Aggregatoren, Search Console, Widget für bad-energie.de |
| [`fakten-abgleich.md`](operations/fakten-abgleich.md) | Owner | Offene und widersprüchliche Aussagen, die bestätigt werden müssen |
| [`datenschutz-aenderungen.md`](operations/datenschutz-aenderungen.md) | Owner, DSB | Jede inhaltliche Änderung von Datenschutzerklärung und Impressum zur Prüfung |

## Archiv (`prompts/`)

Die Master-Prompts 18 bis 21 dokumentieren die Entstehung des Vorgängerportals. Sie sind **nicht mehr gültig**: Sie enthalten überholte Aussagen und Fakten (u. a. zu Funnels, Cookie-Banner und Middleware). Verbindlich sind die Roadmap und der Code; Fakten stehen nur in `lib/content`, `lib/jobs` und `lib/data`.

## Regeln für Dokumente

- Deutsch, Satzanfang groß, keine Werbesprache.
- Keine Fakten, Zahlen oder Versprechen erfinden; Aussagen über die Website am Code prüfen.
- Keine echten Schlüssel oder Geheimnisse, auch nicht als Beispiel.
