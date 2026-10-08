import type { ReactNode } from 'react';
import { Container } from '@/components/layout';
import { Breadcrumbs, PageHeader, Prose } from '@/components/ui';
import { LegalToc, type LegalTocItem } from './LegalToc';

export interface LegalDocumentProps {
  /** The page's h1. */
  title: string;
  /** Current breadcrumb, e.g. "Datenschutz". */
  breadcrumb: string;
  lead?: ReactNode;
  /** Small line under the lead, e.g. the date of the current version. */
  meta?: ReactNode;
  toc: readonly LegalTocItem[];
  /** <LegalSection> elements in the same order as `toc`. */
  children: ReactNode;
}

/**
 * Frame for Datenschutz and Impressum: page header, table of contents and the text column.
 * Phones get one column (header, contents, text). From lg the contents move into a side column
 * and stay in view while scrolling, as long as the window is tall enough for the whole list.
 * Print shows the text only.
 */
export function LegalDocument({ title, breadcrumb, lead, meta, toc, children }: LegalDocumentProps) {
  return (
    <Container size="prose" className="pt-8 pb-section-sm lg:max-w-content lg:pt-12">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:gap-x-16 lg:gap-y-12">
        <PageHeader
          className="lg:col-start-2"
          before={<Breadcrumbs className="print-hidden" items={[{ label: 'Start', href: '/' }, { label: breadcrumb }]} />}
          eyebrow="Rechtliches"
          title={title}
          lead={lead}
        >
          {meta && <p className="text-footnote text-ink-muted">{meta}</p>}
        </PageHeader>

        <div className="print-hidden lg:col-start-1 lg:row-start-2">
          <LegalToc items={toc} className="lg:top-24 lg:[@media(min-height:44rem)]:sticky" />
        </div>

        <Prose className="prose-h2:mt-0 prose-h2:text-title-3 prose-h3:text-body lg:col-start-2 lg:row-start-2">
          {children}
        </Prose>
      </div>
    </Container>
  );
}
