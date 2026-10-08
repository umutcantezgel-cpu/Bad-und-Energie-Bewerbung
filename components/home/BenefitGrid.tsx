import type { ComponentType, SVGProps } from 'react';
import {
  Banknote,
  CalendarOff,
  FileCheck,
  GraduationCap,
  TabletSmartphone,
  Truck,
  Users,
  Wrench,
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { FACTS } from '@/lib/content/facts';
import { BENEFIT_FACT_IDS } from './content';
import { SectionHeader } from './SectionHeader';

type BenefitId = (typeof BENEFIT_FACT_IDS)[number];

const ICONS: Record<BenefitId, ComponentType<SVGProps<SVGSVGElement>>> = {
  aboveTariff: Banknote,
  permanentContract: FileCheck,
  noWeekendOnCall: CalendarOff,
  hilti: Wrench,
  vehicle: Truck,
  ipadSmartphone: TabletSmartphone,
  paidCertifications: GraduationCap,
  familyTeam: Users,
};

/** #vorteile: up to eight calm tiles (pay, contract, equipment, team), each straight from the facts registry. */
export function BenefitGrid() {
  return (
    <Section id="vorteile" tone="subtle" aria-labelledby="vorteile-title">
      <Container>
        <SectionHeader id="vorteile-title" title="Das bekommst du" />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFIT_FACT_IDS.map((id) => {
            const fact = FACTS[id];
            const Icon = ICONS[id];
            return (
              <li key={id} className="flex flex-col gap-3 rounded-lg bg-surface p-6">
                <Icon aria-hidden="true" strokeWidth={1.75} className="size-6 text-ink-muted" />
                <h3 className="text-body font-semibold text-ink">{fact.short}</h3>
                <p className="text-callout text-ink-muted">{fact.long}</p>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
