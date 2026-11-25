/**
 * Einstieg: hängt den Helfer in eine Hülle im Dokument. Figur und Zubehör leben in einer Schattenwurzel,
 * der WhatsApp-Ball als gewöhnlicher Link daneben im Dokument.
 */
import { Spiel, type SpielAngaben } from './spiel';
import { SCHATTEN_STIL } from './stil';

export function starte(halter: HTMLElement, angaben: SpielAngaben): { zerstoere: () => void; vermesse: () => void } {
  const wurzel = halter.shadowRoot ?? halter.attachShadow({ mode: 'open' });
  wurzel.textContent = '';
  try {
    const blatt = new CSSStyleSheet();
    blatt.replaceSync(SCHATTEN_STIL);
    wurzel.adoptedStyleSheets = [blatt];
  } catch {
    const stil = document.createElement('style');
    stil.textContent = SCHATTEN_STIL;
    wurzel.append(stil);
  }
  const licht = halter.parentElement ?? document.body;
  const spiel = new Spiel(wurzel, licht, angaben);
  return {
    zerstoere: () => {
      spiel.zerstoere();
      wurzel.textContent = '';
    },
    vermesse: () => spiel.vermesse(),
  };
}
