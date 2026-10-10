import type { IconName } from '@/components/icons';
import type { ApplicationJobId } from '@/lib/applications/schema';
import type { QuestionSetId } from '@/lib/apply/questions';

/** Props des einen Bewerbungsflows (C1). */
export interface ApplyFlowProps {
  /** Vorgewählte Stelle; der Schritt „Stelle“ entfällt dann (als Tag mit „ändern“ sichtbar). */
  initialJobId?: ApplicationJobId;
  /**
   * `page`: /bewerbung im Fokus-Modus, jeder Schritt als `?schritt=` in der History, Fragen als h2.
   * `embedded`: in einer anderen Seite (z. B. Stellenseite unter einer h2), keine URL-Änderungen, Fragen als h3.
   */
  variant?: 'page' | 'embedded';
  /** Einstieg für die Attribution, z. B. 'bewerbung', 'stellenseite', 'lp-meta'. */
  funnel?: string;
  className?: string;
}

/** Eine Auswahl im Schritt „Stelle“ (aus getFunnelOptions plus Initiativbewerbung). */
export interface FlowJobOption {
  id: ApplicationJobId;
  /** Wert für `?stelle=`; null für die Initiativbewerbung. */
  slug: string | null;
  /** Text der Auswahlkarte und des Tags. */
  label: string;
  /** Sichtbarer Text der Auswahlkarte mit weichen Trennstellen (aus titleShy); sonst `label`. */
  labelShy?: string;
  /** Kurzform in Zusammenfassung und WhatsApp-Text. */
  summaryLabel: string;
  description?: string;
  questionSet: QuestionSetId;
  /** Familien-Icon der Auswahlkarte (STELLEN_ICON nach Stellenart). */
  icon?: IconName;
}

/** Diskretionszusage je Fragenset (getDiscretionPromise; bei der Ausbildung null). */
export type FlowZusagen = Readonly<Partial<Record<QuestionSetId, string | null>>>;

/** Kontaktwege für Fehlerfall und Abkürzungen (aus COMPANY). */
export interface FlowContact {
  phoneDisplay: string;
  phoneHref: string;
}
