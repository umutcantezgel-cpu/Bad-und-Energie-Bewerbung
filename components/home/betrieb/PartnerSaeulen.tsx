import { mitZiffern } from '../einstieg/ziffern';
import { PARTNER_TITEL, partnerSaeulen } from './betrieb-text';

/**
 * Die fünf Partner-Säulen als Text (ROADMAP §5.6), mit den belegten Klammerzusätzen (Urkunde, Werksnähe,
 * Herstellergarantie). Liste wie die Stellen in Variante 1: Kopflinie im Strich, Zeilen mit Haarlinie. Keine
 * Kennzahl-Kachel (K-003); die Zahl steht im Etikett.
 */
export function PartnerSaeulen({ className, id = 'partner-titel' }: { className?: string; id?: string }) {
  const saeulen = partnerSaeulen();
  return (
    <div className={className}>
      <h3 id={id} className="text-etikett text-ink-muted">
        {PARTNER_TITEL}
      </h3>
      <ul aria-labelledby={id} className="mt-3 border-t-(length:--m-strich) border-brand">
        {saeulen.map((saeule) => (
          <li key={saeule.name} className="border-b border-line py-4">
            <p className="text-body font-bold text-ink">{saeule.name}</p>
            {saeule.zusatz ? <p className="mt-1 text-callout text-ink-muted">{mitZiffern(saeule.zusatz)}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
