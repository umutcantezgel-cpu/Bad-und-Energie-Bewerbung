/**
 * Leitungsstrang des Ablaufs in drei Schritten (Variante 1 Formsystem), gemeinsam für #ablauf der Startseite
 * (components/home/ProcessTimeline.tsx) und die Stellen- und Themenseiten (JobProcess.tsx), damit dieselbe Überschrift
 * „In 3 Schritten …“ überall gleich aussieht (Prüfrunde 3 A3-3; vorher lief das Paar auf der Startseite mit w-screen
 * hart in den Bildschirmrand, und die Abgänge endeten stumpf).
 */

const STRICH = 'border-(length:--m-strich)';

/** Rundes Ende einer Leitung: ein Kreis im Strich, mittig auf dem offenen Ende (wie .leitungNavy im Seitenkopf). */
const ENDE = 'absolute size-(--m-strich) rounded-voll';

/** Liste der Schritte am Strang: mobil rechts neben dem senkrechten Paar, ab lg drei Spalten unter dem waagerechten. */
export const ABLAUF_LISTE = 'grid gap-12 py-2 pl-12 lg:grid-cols-3 lg:gap-8 lg:pt-12 lg:pb-0 lg:pl-0';

/**
 * Vorlauf und Rücklauf als Paar an den drei Schritten entlang, mobil senkrecht mit Bogen unten, ab lg waagerecht mit
 * Bogen rechts. Die offenen Enden sind rund (Prüfrunde 1 A1-5); ab lg beginnt das Paar links vor dem ersten Abgang,
 * sodass jeder Abgang ein T-Stück ist und keine Ecke. Rein grafisch (aria-hidden), ohne Bewegung; liegt im relativen
 * Rahmen um die Liste.
 */
export function AblaufStrang() {
  return (
    <>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 w-[calc(var(--paar)+var(--m-strich))] rounded-b-voll lg:hidden ${STRICH} border-t-0 border-r-ruecklauf border-b-vorlauf border-l-vorlauf`}
      >
        <span className={`${ENDE} -top-[calc(var(--m-strich)/2)] -left-(--m-strich) bg-vorlauf`} />
        <span className={`${ENDE} -top-[calc(var(--m-strich)/2)] -right-(--m-strich) bg-ruecklauf`} />
      </span>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-0 right-0 -left-6 hidden h-[calc(var(--paar)+var(--m-strich))] rounded-r-voll lg:block ${STRICH} border-l-0 border-t-vorlauf border-r-vorlauf border-b-ruecklauf`}
      >
        <span className={`${ENDE} -top-(--m-strich) -left-[calc(var(--m-strich)/2)] bg-vorlauf`} />
        <span className={`${ENDE} -bottom-(--m-strich) -left-[calc(var(--m-strich)/2)] bg-ruecklauf`} />
      </span>
    </>
  );
}

/** Schrittnummer mit dem Abgang in Navy vom Strang: mobil waagerecht, ab lg senkrecht (24 px), mit runden Enden. */
export function AblaufNummer({ nummer }: { nummer: number }) {
  return (
    <span aria-hidden="true" className="relative self-start">
      <span className="absolute top-1/2 right-full mr-3 h-(--m-strich) w-6 -translate-y-1/2 rounded-voll bg-brand lg:hidden" />
      <span className="absolute bottom-full left-0 mb-3 hidden h-6 w-(--m-strich) rounded-voll bg-brand lg:block" />
      <span className="font-mass text-lead font-semibold text-brand">{String(nummer).padStart(2, '0')}</span>
    </span>
  );
}
