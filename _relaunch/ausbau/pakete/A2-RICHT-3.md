# A2-RICHT-3 · Rolle Art Director/Bildtechniker (Stufe 3, Opus) · Kern-Version 0.2 + E-016/E-019
Schreibrechte: `_relaunch/ausbau/richtungen/3/**` · Port 3803
Umfang: Prototyp des ersten Bildschirms der Startseite nach `_relaunch/ausbau/pakete/_steigerung.md`.

## Variante 3 · „Grenze“ – Wärmebild (ein WebGL- oder Canvas-Moment)
Folgeauftrag A2, Variante C: „geht bis an die Grenze der STEIGERUNG“, also spektakulär mit höchstens einem WebGL- oder Canvas-Moment auf der Startseite.

- **Kern:**
  - Das Haus aus B, Giebel und Logo-Motive, als **Wärmebild** wie in der Thermografie, die Heizungsbauer täglich nutzen.
  - Kalt ist Navy, warm ist Signalrot, auf warmem Papier – keine Regenbogen-Thermopalette, nur die Farben aus E-016.
  - Die Wärme breitet sich von der Wärmepumpe über den Vorlauf in die Räume aus, der Rücklauf kühlt ab.
  - Der Vorlauf führt sichtbar zur Hauptaktion.
  - Das zeigt die Marke (Wärme ins Haus), kein Partikel- oder Flüssigkeitsfeld (S-09).
  - Optional reagiert die Wärme auf Zeiger oder Tippen. Dann wird gezeigt, wo das Haus warm wird, ohne Text zu verdecken (S-15).
- **Technik** (Folgeauftrag §6 „WebGL und Canvas“, alle Regeln einhalten):
  - Eigener Shader-Code (WebGL1/2) oder Canvas 2D, keine 3D-Engine. Eine Bibliothek höchstens sehr leicht und lokal vendort.
  - JS gesamt ≤ 120 KB gzip, **nachgeladen**. Start nach dem `load`-Ereignis im Leerlauf (`requestIdleCallback` mit Rückfall), ohne künstliche Verzögerung.
  - **Statischer Ersatz:** SVG/CSS-Fassung derselben Szene, sofort sichtbar. Sie ist zugleich das erste Bild der Szene, ohne Sprung beim Übergang.
  - Bei `webglcontextlost` sofort der Ersatz.
  - Pause außerhalb des Bildes (IntersectionObserver) und bei verborgenem Tab (`visibilitychange`).
  - Beim Verlassen Texturen, Puffer und Kontext freigeben.
  - Pixeldichte höchstens 2, höchstens ein aktiver Kontext.
  - Bei `prefers-reduced-motion` und ohne WebGL: der statische Ersatz als eigens gestaltete ruhige Fassung.
- **Zusätzliche Belege:**
  - JS gzip gemessen.
  - Test mit `WEBGL_lose_context` (Ersatz erscheint).
  - Pause offscreen und bei verborgenem Tab nachgewiesen, z. B. über einen rAF-Zähler.
  - Framezeiten mobil mit 4× CPU-Drosselung: ≤ 5 % verworfene Bilder.
  - Alles in BEGRUENDUNG.md.
- **Mobil (390) eigens komponiert:** Das Wärmebild ist angeschnitten und groß, die H1 bleibt echter Text darüber oder daneben und ist lesbar (Kontrast AA auf jeder Stelle der Szene).
