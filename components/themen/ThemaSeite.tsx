import type { Job } from '@/lib/jobs/registry';
import type { ThemaPageText } from '@/lib/themen/text';
import { BetriebSeite } from './BetriebSeite';
import { DiskretSeite } from './DiskretSeite';
import { FahrzeugSeite } from './FahrzeugSeite';
import { GehaltSeite } from './GehaltSeite';
import { WaermepumpenSeite } from './WaermepumpenSeite';

/** Die Themenseite zu ihrem Text (E-028); jede Seite hat ihre eigene Signatur im Kopf. */
export function ThemaSeite({ text, jobs }: { text: ThemaPageText; jobs: readonly Job[] }) {
  switch (text.id) {
    case 'gehalt':
      return <GehaltSeite text={text} />;
    case 'fahrzeug-und-werkzeug':
      return <FahrzeugSeite text={text} />;
    case 'waermepumpen':
      return <WaermepumpenSeite text={text} />;
    case 'betrieb':
      return <BetriebSeite text={text} />;
    case 'diskret-wechseln':
      return <DiskretSeite text={text} jobs={jobs} />;
  }
}
