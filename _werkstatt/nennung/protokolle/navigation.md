# Navigation und rel des Coday-Links (S4)

Kennung E3-PRUEFER-02 · Stand 2026-10-16 · Produktions-Server http://127.0.0.1:3511 · Werkzeug navigation.mjs

Maßstab: rel des Links `footer a[href*="codayweb.de"]` im ausgelieferten HTML derselben URL.

## Ergebnis

- Lesart N-05 (Gleichheit der Werte im DOM und im HTML, nach Laden, nach Hydration und nach Navigation): grün, 11 von 11 Vergleichen gleich.
- Wortlaut „im Browser nicht nachträglich umgeschaltet“: nicht eingehalten. Bei der internen Navigation wechselt das rel desselben Link-Elements zweimal (/ → /jobs: `noopener` zu `nofollow noopener`; /jobs → /: zurück zu `noopener`). Beim reinen Laden aller drei Seiten gibt es 0 Änderungen. Siehe OFFENE FRAGE 1.

## Tabelle

| URL | Fall | erwartet | gelesen | gleich ja/nein |
| --- | --- | --- | --- | --- |
| / | (b) Browser ohne JavaScript | `noopener` | `noopener` | ja |
| / | (c1) mit JavaScript bei DOMContentLoaded | `noopener` | `noopener` | ja |
| / | (c2) mit JavaScript nach networkidle und 2 s | `noopener` | `noopener` | ja |
| /jobs | (b) Browser ohne JavaScript | `nofollow noopener` | `nofollow noopener` | ja |
| /jobs | (c1) mit JavaScript bei DOMContentLoaded | `nofollow noopener` | `nofollow noopener` | ja |
| /jobs | (c2) mit JavaScript nach networkidle und 2 s | `nofollow noopener` | `nofollow noopener` | ja |
| /arbeiten-bei-uns/waermepumpen | (b) Browser ohne JavaScript | `nofollow noopener` | `nofollow noopener` | ja |
| /arbeiten-bei-uns/waermepumpen | (c1) mit JavaScript bei DOMContentLoaded | `nofollow noopener` | `nofollow noopener` | ja |
| /arbeiten-bei-uns/waermepumpen | (c2) mit JavaScript nach networkidle und 2 s | `nofollow noopener` | `nofollow noopener` | ja |
| /jobs (von /) | (d1) interne Navigation / → /jobs | `nofollow noopener` | `nofollow noopener` | ja |
| / (von /jobs) | (d2) interne Navigation /jobs → / | `noopener` | `noopener` | ja |

target ist in allen Fällen `_blank`. Das HTML lieferte auf allen drei Seiten HTTP 200.

## Änderungen von rel am Link (MutationObserver)

| Seite | Lauf | rel geändert | Link eingefügt |
| --- | --- | --- | --- |
| / | (c) mit JavaScript | 0 | 0 |
| /jobs | (c) mit JavaScript | 0 | 0 |
| /arbeiten-bei-uns/waermepumpen | (c) mit JavaScript | 0 | 0 |
| / → /jobs → / | (d) Navigation | 2 | 0 |

Einzelablauf (eigene Kontrollmessung, ein Lauf, Zeitpunkte ab Seitenstart): 2605 ms auf /jobs, `noopener` → `nofollow noopener`, am selben Element; 5857 ms auf /, `nofollow noopener` → `noopener`. Die Werte stimmen am Ende mit dem ausgelieferten HTML überein.

## Anfragen an codayweb.de beim Laden

| Seite | Lauf | Anfragen |
| --- | --- | --- |
| / | (b) ohne JavaScript | 0 |
| / | (c) mit JavaScript | 0 |
| /jobs | (b) ohne JavaScript | 0 |
| /jobs | (c) mit JavaScript | 0 |
| /arbeiten-bei-uns/waermepumpen | (b) ohne JavaScript | 0 |
| /arbeiten-bei-uns/waermepumpen | (c) mit JavaScript | 0 |
| / → /jobs → / | (d) Navigation | 0 |

## Belege

- roh/e3b/navigation.json und roh/e3b/navigation.md (Werkzeug)
- roh/e3b/leitplanken-beleg.txt (HTML-Werte)
- werkzeuge/navigation.mjs (neu)
- Referenz E0: roh/e0/netz.json, 0 Anfragen an codayweb.de

## OFFENE FRAGEN

1. Ist die Umschaltung des rel bei interner Navigation (zweimal am selben Element) ein Mangel nach dem Wortlaut „nicht nachträglich umgeschaltet“, auch wenn der Endwert stimmt? Lesart N-05 sagt grün. Der Inhaber entscheidet. Ursache im Code ist nicht geprüft; das Werkzeug misst nur die Anzahl.
