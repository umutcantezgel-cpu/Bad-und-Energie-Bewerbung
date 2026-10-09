# A2-RICHT-2 · Rolle Art Director/Baumeister (Stufe 3, Opus) · Kern-Version 0.2 + E-016/E-019
Schreibrechte: `_relaunch/ausbau/richtungen/2/**` · Port 3802
Umfang: Prototyp des ersten Bildschirms der Startseite nach `_relaunch/ausbau/pakete/_steigerung.md`.

## Variante 2 · „Kühn“ – Dein Arbeitstag ist ein Kreislauf (Sticky-Szene)
Folgeauftrag A2, Variante B: „interpretiert die Leitidee kühn neu“.

- **Kern:** Der Kreislauf von B wird zum Arbeitstag:
  - Vorlauf: 07:00 vom Zuhause zur Baustelle, höchstens 35 km, keine Fernmontage.
  - Rücklauf: pünktlich heim, freitags 13:30.
  - Haus, Wärmepumpe, Baustelle im 35-km-Ring und die Uhr sind Stationen einer Leitung.
- **Erster Bildschirm:**
  - Dominante Geste ist Schrift in Bildgröße. „13:30“ oder die H1 wird von der rot/blauen Leitung angeschnitten oder umlaufen, die Leitung endet in der Hauptaktion.
  - Steht ohne Scrollen vollständig für sich: Angebot, Zielgruppe, nächster Schritt.
- **Anschluss** (höchstens zwei Bildschirmhöhen) als Sticky-Szene mit Aufbau, Wendung und Auflösung, rückwärts gleich stimmig:
  - 07:00 Haus.
  - Der Vorlauf führt zur Baustelle im 35-km-Ring.
  - 13:30 führt der Rücklauf heim.
- **Technik:** CSS scroll-driven animations hinter `@supports (animation-timeline: view())`, sonst IntersectionObserver-Stufen oder statischer Endzustand. Natives Scrollen, keine Hijacks, Tastatur und Anker bleiben unberührt. JS ≤ 8 KB.
- **Mobil (390) eigens komponiert:** Die Szene funktioniert ohne Hover, Daumenzone für die Hauptaktion, sticky in `svh`.
- **Ruhige Fassung:** drei Stationen als ruhige, gleichzeitig sichtbare Komposition (Plan-Ansicht), ohne Bewegung.
