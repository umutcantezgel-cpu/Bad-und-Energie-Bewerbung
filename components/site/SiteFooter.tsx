import type { ReactNode } from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { COMPANY } from '@/lib/content/company';
import { jobPath } from '@/lib/jobs/format';
import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';
import { cn } from '@/lib/utils/cn';
import { FooterPlaces } from './FooterPlaces';
import { FooterSwitch } from './FooterSwitch';

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

const LEGAL_LINKS = [
  { href: '/impressum', label: 'Impressum' },
  { href: '/datenschutz', label: 'Datenschutz' },
] as const;

/**
 * Light footer on surface-2 with a hairline on top, so it stays apart from a closing
 * surface-2 section. Outside focus mode: Betrieb · Stellen · Rechtliches, then register and
 * guild line. In focus mode (/bewerbung…): legal links and copyright only.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return <FooterSwitch full={<FullFooter year={year} />} slim={<SlimFooter year={year} />} />;
}

function SlimFooter({ year }: { year: number }) {
  return (
    <footer className="border-t border-line bg-surface-2 print-hidden">
      <Container
        size="wide"
        className="flex flex-col gap-y-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-x-6"
      >
        <nav aria-label="Rechtliches">
          <ul className="flex gap-6">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-footnote text-ink-muted">
          © {year} {COMPANY.legalName}
        </p>
      </Container>
    </footer>
  );
}

function FullFooter({ year }: { year: number }) {
  // Like the job pages and the sitemap: a job past validThrough no longer gets a footer link.
  const now = new Date();
  const jobs = getActiveJobs().filter((job) => isJobLive(job, now));
  const websiteLabel = COMPANY.website.replace(/^https?:\/\//, '');

  return (
    // pb-28 below lg keeps the last line clear of the fixed StickyApplyBar, which shows on
    // every page outside focus mode (hasStickyApplyBar in ./nav).
    <footer className="border-t border-line bg-surface-2 pb-28 lg:pb-0 print-hidden">
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
              <a href={COMPANY.phone.href} className={linkClass}>
                Telefon&nbsp;<span className="tabular-nums">{COMPANY.phone.display}</span>
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
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href={COMPANY.website} className={linkClass}>
                  {websiteLabel}
                </a>
              </li>
            </ul>
          </nav>
        </Column>
      </Container>

      {/* E-SHELL-021 (R3-HOME-03): Ortsliste des Einsatzgebiets; die Gestaltung des Fußes folgt in R4. */}
      <Container size="wide">
        <FooterPlaces className="border-t border-line py-8" />
      </Container>

      <Container size="wide">
        <p className="border-t border-line py-6 text-footnote text-ink-muted">
          © {year} {COMPANY.legalName} · {COMPANY.register.full} · {COMPANY.innung}
        </p>
      </Container>
    </footer>
  );
}
