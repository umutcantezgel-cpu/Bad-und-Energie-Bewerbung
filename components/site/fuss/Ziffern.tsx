/**
 * Ziffern im Fließtext in der Display-Schrift (theme.css `ziffer`, Variante 1 `.ziffer`): Atkinson Hyperlegible
 * Next zeichnet die Null mit Schrägstrich. Der Text bleibt wörtlich; Ziffernfolgen samt Uhrzeit- und
 * Bereichszeichen (07:00–16:45, 35578, 20) stehen in einem eigenen span. Server- und client-sicher.
 */
export function Ziffern({ text }: { text: string }) {
  return text.split(/(\d+(?:[:.,–]\d+)*)/).map((teil, i) =>
    i % 2 === 1 ? (
      <span key={i} className="ziffer">
        {teil}
      </span>
    ) : (
      teil
    ),
  );
}
