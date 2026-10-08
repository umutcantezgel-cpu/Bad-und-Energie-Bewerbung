import type { ReactNode } from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { COMPANY } from '@/lib/content/company';
import { jobPath } from '@/lib/jobs/format';
import { getActiveJobs } from '@/lib/jobs/registry';
import { cn } from '@/lib/utils/cn';

const linkClass =
  'inline-flex min-h-11 items-center rounded-xs text-callout text-ink-muted transition-colors duration-fast hover:text-ink';

function Column({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 id={id} className="text-callout font-semibold text-ink">
        {title}
      </h2>
      {children}
    </div>
  );
}

/** Light footer on surface-2: Betrieb · Stellen · Rechtliches, then register and guild line. */
export function SiteFooter() {
  const jobs = getActiveJobs();
  const year = new Date().getFullYear();
  const websiteLabel = COMPANY.website.replace(/^https?:\/\//, '');

  return (
    // pb-28 below lg keeps the last line clear of the fixed StickyApplyBar.
    <footer className="bg-surface-2 pb-28 lg:pb-0 print-hidden">
      <Container size="wide" className="grid gap-10 py-section-sm md:grid-cols-3 md:gap-8">
        <Column id="footer-betrieb" title="Betrieb">
          <address className="flex flex-col gap-3 text-callout not-italic text-ink-muted">
            <span>
              <span className="block font-medium text-ink">{COMPANY.name}</span>
              {COMPANY.address.street}
              <br />
              {COMPANY.address.postalCode} {COMPANY.address.city}
            </span>
            <span>
              {COMPANY.openingHours.weekdays}
              <br />
              {COMPANY.openingHours.friday}
            </span>
            <span className="flex flex-col">
              <a href={COMPANY.phone.href} className={cn(linkClass, 'tabular-nums')}>
                Telefon {COMPANY.phone.display}
              </a>
              <a href={COMPANY.emailHref} className={linkClass}>
                {COMPANY.email}
              </a>
            </span>
          </address>
        </Column>

        <Column id="footer-stellen" title="Stellen">
          <nav aria-labelledby="footer-stellen">
            <ul className="flex flex-col">
              {jobs.map((job) => (
                <li key={job.id}>
                  <Link href={jobPath(job)} className={linkClass}>
                    {job.shortTitle}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/jobs" className={cn(linkClass, 'font-medium text-ink')}>
                  Alle Stellen
                </Link>
              </li>
            </ul>
          </nav>
        </Column>

        <Column id="footer-rechtliches" title="Rechtliches">
          <nav aria-labelledby="footer-rechtliches">
            <ul className="flex flex-col">
              <li>
                <Link href="/impressum" className={linkClass}>
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className={linkClass}>
                  Datenschutz
                </Link>
              </li>
              <li>
                <a href={COMPANY.website} className={linkClass}>
                  {websiteLabel}
                </a>
              </li>
            </ul>
          </nav>
        </Column>
      </Container>

      <Container size="wide">
        <p className="border-t border-line py-6 text-footnote text-ink-muted">
          © {year} {COMPANY.legalName} · {COMPANY.register.full} · {COMPANY.innung}
        </p>
      </Container>
    </footer>
  );
}
