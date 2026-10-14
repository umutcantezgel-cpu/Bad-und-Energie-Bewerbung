# Ticket für den Dienstleister von bad-energie.de

Stand: 2026-10-14 · für den Inhaber · gehört zu `_relaunch/MENSCHEN.md` M-036

## Worum es geht

Die Hauptseite bad-energie.de läuft im Baukasten eines Dienstleisters (die Seite lädt ihre Inhalte von `ihre-fhw-seite.de`) und liegt nicht in unserem Repository. Ändern kann sie nur der Dienstleister. Abruf am 14.10.2026:

- **Konkurrierende Jobseiten:** `/ueber-uns/jobs`, `/ueber-uns/ausbildung`, `/anlagenmechaniker-shk-mwd` und `/ausbildung-als-anlagenmechaniker-shk-mwd` stehen in der Sitemap der Hauptseite. `/anlagenmechaniker-shk-mwd` trägt sogar ein eigenes JobPosting („Anlagenmechaniker SHK (m/w/d)“, gültig bis 31.12.2026) und tritt damit in Google for Jobs gegen die Stellenseite der Karriereseite an.
- **Canonical-Fehler:** `/anlagenmechaniker-shk-mwd` nennt `/leistungen/haustechnik` als kanonische Seite. Für Google ist die Jobseite damit eine Kopie der Haustechnik-Seite.
- **Kein Link zur Karriereseite:** Im Quelltext der Startseite steht kein einziger Link auf karriere.bad-energie.de; das Menü „Über uns“ führt zu „Jobs“ und „Ausbildung“ auf der Hauptseite.
- **robots.txt sperrt CSS und Bilder:** Sie beginnt mit `Disallow: /` und gibt nur eine Liste von Seiten frei. Die Stildateien unter `/_next/static/css/` und die Bilder unter `/api/attachments/…` sind nicht freigegeben. Google sieht die Seiten deshalb ohne Gestaltung und kann die Bilder nicht aufnehmen.

Den Text unten über den gewohnten Weg an den Dienstleister schicken (Kundenportal, E-Mail oder Telefon). Danach den Punkt „Prüfen“ abarbeiten.

## Ticket-Text zum Kopieren

**Betreff:** bad-energie.de: Weiterleitungen zur Karriereseite, Canonical-Fehler, Navigation und robots.txt

> Guten Tag,
>
> bitte nehmen Sie auf unserer Website https://bad-energie.de die folgenden Änderungen vor. Unsere Stellenangebote stehen auf unserer Karriereseite https://karriere.bad-energie.de; die Hauptseite soll dorthin verweisen und keine eigenen Stellenseiten mehr führen.
>
> **1. Weiterleitungen (301, dauerhaft)**
>
> | Alte Adresse | Neues Ziel |
> |---|---|
> | https://bad-energie.de/ueber-uns/jobs | https://karriere.bad-energie.de/jobs |
> | https://bad-energie.de/ueber-uns/ausbildung | https://karriere.bad-energie.de/jobs |
>
> - Statuscode 301, in einem Sprung, ohne Zwischenseite oder Meta-Refresh; auch die Schreibweise mit Schrägstrich am Ende (`/ueber-uns/jobs/`) leitet weiter.
> - Die alten Adressen bitte aus der Sitemap (https://bad-energie.de/sitemap.xml) und aus der Freigabeliste der robots.txt entfernen.
>
> **2. Canonical-Fehler und alte Stellenseiten**
>
> Die Seite https://bad-energie.de/anlagenmechaniker-shk-mwd nennt https://bad-energie.de/leistungen/haustechnik als Canonical. Bitte diese Seite und https://bad-energie.de/ausbildung-als-anlagenmechaniker-shk-mwd ebenfalls per 301 weiterleiten:
>
> | Alte Adresse | Neues Ziel |
> |---|---|
> | https://bad-energie.de/anlagenmechaniker-shk-mwd | https://karriere.bad-energie.de/jobs/anlagenmechaniker-shk-wetzlar |
> | https://bad-energie.de/ausbildung-als-anlagenmechaniker-shk-mwd | https://karriere.bad-energie.de/jobs |
>
> - Bitte auf bad-energie.de kein JobPosting-Markup mehr ausgeben. Die Stellen tragen ihr Markup auf der Karriereseite; doppelte Stellenanzeigen können zum Ausschluss aus Google for Jobs führen.
> - Bitte prüfen Sie außerdem alle übrigen Seiten: Jede Seite soll sich selbst als Canonical nennen (zum Beispiel https://bad-energie.de/leistungen/bad für die Seite „Bad“).
>
> **3. „Karriere“ in die Hauptnavigation**
>
> - Neuer Menüpunkt **„Karriere“** in der Hauptnavigation, Ziel https://karriere.bad-energie.de, im selben Fenster.
> - Derselbe Link im Fußbereich.
> - Die Menüpunkte „Jobs“ und „Ausbildung“ unter „Über uns“ zeigen auf https://karriere.bad-energie.de/jobs (oder entfallen, weil „Karriere“ sie ersetzt).
>
> **4. robots.txt: CSS und Bilder für Google freigeben**
>
> Die robots.txt beginnt mit `Disallow: /` und gibt nur einzelne Seiten frei. Stildateien und Bilder fehlen in der Freigabe. Bitte im Block `User-agent: *` ergänzen:
>
> ```
> Allow: /_next/static/css/
> Allow: /api/attachments/
> ```
>
> - Damit dürfen Suchmaschinen die Stildateien (`/_next/static/css/…`) und die Bilder (`/api/attachments/<id>/…`) laden. Die bestehende Sperre `Disallow: /api/attachments/file/` (mit der Freigabe für `/api/attachments/file/fonts/`) bleibt wirksam, weil sie genauer ist.
> - Die Zeilen `Allow: undefined$` und `Allow: undefined/$` sind ungültig und können entfallen.
> - Bitte prüfen Sie, ob die Sperre aller nicht ausdrücklich freigegebenen Seiten (`Disallow: /`) gewollt ist; neue Seiten sind sonst für Suchmaschinen gesperrt, bis sie in der Liste stehen.
>
> **5. Nur falls Sie die DNS-Einträge von bad-energie.de verwalten**
>
> Für die Google Search Console schicken wir Ihnen einen TXT-Eintrag (`google-site-verification=…`). Bitte legen Sie ihn für die Domain selbst (`@`) an, ohne bestehende Einträge zu ändern.
>
> **Optional: Widget „Wir stellen ein“**
>
> Wer die offenen Stellen auf der Hauptseite zeigen möchte: Die Karriereseite liefert sie als JSON unter https://karriere.bad-energie.de/feeds/jobs.json (Abruf von https://bad-energie.de erlaubt). Ein Beispiel ohne Bibliotheken senden wir gern. Bitte dabei kein JobPosting-Markup einbauen; die Content-Security-Policy der Hauptseite muss `connect-src https://karriere.bad-energie.de` erlauben.
>
> Bitte geben Sie uns kurz Bescheid, wenn die Änderungen live sind.
>
> Vielen Dank und freundliche Grüße
>
> Sabri Demir
> Geschäftsführer
> Bad und Energie GmbH Lahn Dill
> Siegmund-Hiepe-Str. 20, 35578 Wetzlar · 06441 42956 · info@bad-energie.de

## Prüfen, wenn der Dienstleister fertig meldet

1. Jede alte Adresse aus Punkt 1 und 2 im Browser öffnen: Sie muss sofort auf das neue Ziel springen.
2. https://bad-energie.de/sitemap.xml: Die vier alten Jobadressen stehen nicht mehr darin.
3. Startseite von bad-energie.de: Menüpunkt „Karriere“ führt zu https://karriere.bad-energie.de.
4. https://bad-energie.de/robots.txt: Die beiden neuen `Allow`-Zeilen stehen im Block `User-agent: *`.
5. In der Search Console (`checkliste-offsite.md`, Schritt 1): **URL-Prüfung** für https://bad-energie.de → **Live-URL testen** → **Getestete Seite ansehen**. Der Screenshot zeigt die Seite mit Gestaltung und Bildern, und unter „Weitere Informationen“ sind keine Stildateien oder Bilder „durch robots.txt blockiert“.
6. Ergebnis in `_relaunch/MENSCHEN.md` bei M-036 vermerken lassen.

Die Anleitung für das Widget steht in `docs/operations/stellenboersen.md`, Abschnitt e).
