# Teildokument-CLS (Seitenkopf), Nachweis V6-A3-VITALS

Proxy liefert das HTML der Stellenseite in zwei Teilen: bis vor `<div class="…__leitung">` sofort, den Rest nach 600 ms
(simuliert einen Parser-Halt bzw. ein spätes HTML-Stück). Sonde: Chromium 141, 412 × 823 @1,75, mobil, je 3 Läufe.

| Stand | Anlagenmechaniker | Kundendienst |
|---|---|---|
| vorher (3464) | 0 · 0 · 0,0681 (aktionsblock 484 → 799 px) | 0,1149 · 0 · 0,1149 (aktionsblock 555 → unter den Rand) |
| nachher (3465) | 0 · 0 · 0 | 0 · 0 · 0 |

0,0805 / 0,1149 traten auch in Lighthouse-Läufen ohne Proxy auf (V6-A2-JS-B2 Lauf 3, V6-A3-VITALS-a-schrift Lauf 2).
Nachher wartet das erste Bild per `<link rel="expect" href="#…-ende" blocking="render">` auf die Endmarke des Kopfs.
