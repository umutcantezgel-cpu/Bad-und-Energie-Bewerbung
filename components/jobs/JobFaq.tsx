import { Disclosure } from '@/components/ui';
import { JOB_FAQ_IDS, getFaqItems } from '@/lib/content';
import type { Job } from '@/lib/jobs/registry';
import { cn } from '@/lib/utils/cn';

export interface JobFaqProps {
  job: Job;
  className?: string;
}

/**
 * Three matching questions as native <details>. Deliberately without FAQPage markup:
 * FAQPage structured data lives on the home page only (ROADMAP §10).
 */
export function JobFaq({ job, className }: JobFaqProps) {
  const items = getFaqItems(JOB_FAQ_IDS[job.apply.questionSet]);
  return (
    <section aria-labelledby="stelle-faq" className={cn('flex flex-col gap-4', className)}>
      <h2 id="stelle-faq" className="text-title-3 text-ink">
        Häufige Fragen
      </h2>
      <div className="border-t border-line">
        {items.map((item) => (
          <Disclosure key={item.id} name={`faq-${job.id}`} summary={item.question}>
            <p className="max-w-prose">{item.answer}</p>
          </Disclosure>
        ))}
      </div>
    </section>
  );
}
