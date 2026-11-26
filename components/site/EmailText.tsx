/**
 * E-Mail-Adresse mit einer Umbruchstelle nach dem „@“. Lange Adressen (umutcan.tezgel@bad-energie.de, seit
 * 26.11.2026 die Kontaktadresse) passen auf 320 px nicht in eine Zeile; so bricht die Zeile an der natürlichen Stelle
 * statt über den Rand zu ragen (WCAG 1.4.10). Notfalls bricht wrap-anywhere auch innerhalb eines Teils.
 * Ohne Hooks: läuft auf dem Server und in Inseln.
 */
export function EmailText({ adresse, className }: { adresse: string; className?: string }) {
  const at = adresse.indexOf('@');
  const klasse = className ? `wrap-anywhere ${className}` : 'wrap-anywhere';
  if (at < 0) return <span className={klasse}>{adresse}</span>;
  return (
    <span className={klasse}>
      {adresse.slice(0, at + 1)}
      <wbr />
      {/* Die Domain bleibt zusammen: kein Umbruch am Bindestrich von „bad-energie.de“ */}
      <span className="whitespace-nowrap">{adresse.slice(at + 1)}</span>
    </span>
  );
}
