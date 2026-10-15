import { Disclosure } from '@/components/ui/Disclosure';
import { RohrAkzent } from '@/components/zeichnung/RohrAkzent';
import { JOB_FAQ_IDS, getFaqItems } from '@/lib/content';
import type { Job } from '@/lib/jobs/registry';
import { cn } from '@/lib/utils/cn';

export interface JobFaqProps {
  job: Job;
  className?: string;
}

/**
 * Die Fragen zur Art der Stelle (JOB_FAQ_IDS, Plan §C5: Bezahlung, Berufsschule, Quereinstieg …) als natives <details>,
 * Kopf wie die Abschnitte der Startseite (Etikett, h2 in Bricolage und Marken-Navy); ab lg Kopf links, Fragen rechts.
 * Bewusst ohne FAQPage-Markup: FAQPage steht nur auf der Startseite (ROADMAP §10).
 */
export function JobFaq({ job, className }: JobFaqProps) {
  const items = getFaqItems(JOB_FAQ_IDS[job.category]);
  return (
    <section aria-labelledby="stelle-faq" className={cn('grid gap-8 lg:grid-cols-12 lg:gap-x-12', className)}>
      <div className="flex flex-col gap-4 lg:col-span-4">
        <p className="text-etikett text-ink-muted">Fragen</p>
        <h2 id="stelle-faq" className="text-title-1 text-brand">
          Häufige Fragen
        </h2>
      </div>
      <div className="relative lg:col-span-8">
        <RohrAkzent />
        {items.map((item) => (
          <Disclosure key={item.id} name={`faq-${job.id}`} summary={item.question}>
            <p className="max-w-prose">{item.answer}</p>
          </Disclosure>
        ))}
      </div>
    </section>
  );
}
