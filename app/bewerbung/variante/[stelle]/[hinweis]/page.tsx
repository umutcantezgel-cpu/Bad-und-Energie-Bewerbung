import { BEWERBUNG_METADATA, BewerbungSeite } from '@/components/apply/seite/BewerbungSeite';
import { KEINE_STELLE, jobIdFromParam } from '@/lib/apply/params';
import { variantenParams, vorauswahlOptionen } from '@/lib/apply/vorauswahl';

/**
 * Vorgerenderte Variante von /bewerbung mit Vorauswahl und/oder Unterlagen-Hinweis. Nur proxy.ts schreibt hierher um,
 * der Browser zeigt weiter /bewerbung?stelle=…; deshalb dieselben Metadaten (Canonical /bewerbung, indexierbar). Ein
 * direkter Aufruf dieser Adresse leitet der Proxy auf /bewerbung zurück.
 */
export const metadata = BEWERBUNG_METADATA;
export const revalidate = 3600;
export const dynamic = 'error';
/** Nur vorgerenderte Varianten; andere Werte schreibt der Proxy nie hierher (lib/apply/__tests__/vorauswahl.test.ts). */
export const dynamicParams = false;

export function generateStaticParams() {
  return variantenParams();
}

type Params = Promise<{ stelle: string; hinweis: string }>;

export default async function BewerbungVariante({ params }: { params: Params }) {
  const { stelle, hinweis } = await params;
  // Renderzeit (Build, danach höchstens stündlich): nur Stellen vorwählen, die jetzt wählbar sind, sonst wie /bewerbung.
  const initialJobId = stelle === KEINE_STELLE ? undefined : jobIdFromParam(stelle, vorauswahlOptionen(new Date()));
  return <BewerbungSeite initialJobId={initialJobId} unterlagenWunsch={hinweis === 'unterlagen'} />;
}
