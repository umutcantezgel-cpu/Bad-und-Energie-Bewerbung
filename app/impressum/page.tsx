import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import {
  CHAMBER,
  LEGAL_ENTITY,
  LegalDocument,
  LegalFacts,
  LegalSection,
  displayUrl,
  mailtoHref,
  type LegalFact,
} from '@/components/legal';
import { TextLink } from '@/components/ui';
import { generatePageMetadata } from '@/lib/seo/metadata';

/*
 * Impressum: Inhalt wie bisher, nur neu gegliedert. Offene Punkte (USt-IdNr., TMG-Verweise,
 * OS-Plattform) stehen in docs/operations/datenschutz-aenderungen.md.
 */

export const metadata: Metadata = generatePageMetadata({
  title: 'Impressum',
  description:
    'Anbieterkennzeichnung nach § 5 DDG und Handwerksordnung der Bad und Energie GmbH Lahn Dill in Wetzlar: Kontakt, Handelsregister und Handwerkskammer.',
  path: '/impressum',
  type: 'legal',
});

type SectionId = 'anbieter' | 'kontakt' | 'register' | 'verantwortlich' | 'kammer' | 'streitbeilegung' | 'haftung';

const SECTIONS: Record<SectionId, { title: string; toc?: string }> = {
  anbieter: { title: 'Anbieter' },
  kontakt: { title: 'Kontakt' },
  register: { title: 'Registereintrag und Umsatzsteuer', toc: 'Register und Umsatzsteuer' },
  verantwortlich: { title: 'Verantwortlich für den Inhalt' },
  kammer: { title: 'Zuständige Handwerkskammer und Aufsichtsbehörde', toc: 'Handwerkskammer' },
  streitbeilegung: { title: 'Verbraucherstreitbeilegung und Universalschlichtungsstelle', toc: 'Streitbeilegung' },
  haftung: { title: 'Haftung für Inhalte und Links', toc: 'Haftung' },
};

const TOC = (Object.keys(SECTIONS) as SectionId[]).map((id) => ({ id, label: SECTIONS[id].toc ?? SECTIONS[id].title }));

function Chapter({ id, children }: { id: SectionId; children: ReactNode }) {
  return (
    <LegalSection id={id} title={SECTIONS[id].title}>
      {children}
    </LegalSection>
  );
}

const PROVIDER: readonly LegalFact[] = [
  { label: 'Unternehmen', value: LEGAL_ENTITY.name },
  {
    label: 'Anschrift',
    value: (
      <>
        {LEGAL_ENTITY.street}
        <br />
        {LEGAL_ENTITY.postalCodeCity}
        <br />
        {LEGAL_ENTITY.country}
      </>
    ),
  },
  { label: 'Geschäftsführung', value: LEGAL_ENTITY.managingDirector },
];

const CONTACT: readonly LegalFact[] = [
  {
    label: 'Telefon',
    value: (
      <TextLink href={LEGAL_ENTITY.phone.href} standalone>
        {LEGAL_ENTITY.phone.display}
      </TextLink>
    ),
  },
  { label: 'Telefax', value: LEGAL_ENTITY.fax },
  {
    label: 'E-Mail',
    value: (
      <TextLink href={LEGAL_ENTITY.emailHref} standalone>
        {LEGAL_ENTITY.email}
      </TextLink>
    ),
  },
  {
    label: 'Website',
    value: (
      <TextLink href={LEGAL_ENTITY.website} standalone>
        {displayUrl(LEGAL_ENTITY.website)}
      </TextLink>
    ),
  },
];

const REGISTER: readonly LegalFact[] = [
  { label: 'Registergericht', value: LEGAL_ENTITY.registerCourt },
  { label: 'Registernummer', value: LEGAL_ENTITY.registerNumber },
  { label: 'USt-IdNr. gemäß § 27 a UStG', value: LEGAL_ENTITY.vatId },
];

const CHAMBER_FACTS: readonly LegalFact[] = [
  { label: 'Kammer', value: CHAMBER.name },
  {
    label: 'Anschrift',
    value: (
      <>
        {CHAMBER.street}
        <br />
        {CHAMBER.postalCodeCity}
      </>
    ),
  },
  {
    label: 'Telefon',
    value: (
      <TextLink href={CHAMBER.phone.href} standalone>
        {CHAMBER.phone.display}
      </TextLink>
    ),
  },
  {
    label: 'E-Mail',
    value: (
      <TextLink href={mailtoHref(CHAMBER.email)} standalone>
        {CHAMBER.email}
      </TextLink>
    ),
  },
  {
    label: 'Website',
    value: (
      <TextLink href={CHAMBER.url} standalone>
        {displayUrl(CHAMBER.url)}
      </TextLink>
    ),
  },
];

const OS_PLATFORM_URL = 'https://consumer-redress.ec.europa.eu/site-relocation_en';

export default function ImpressumPage() {
  return (
    <LegalDocument
      title="Impressum"
      breadcrumb="Impressum"
      lead={`Angaben nach § 5 DDG und Handwerksordnung für die ${LEGAL_ENTITY.name}.`}
      toc={TOC}
    >
      <Chapter id="anbieter">
        <LegalFacts items={PROVIDER} />
      </Chapter>

      <Chapter id="kontakt">
        <LegalFacts items={CONTACT} />
      </Chapter>

      <Chapter id="register">
        <LegalFacts items={REGISTER} />
      </Chapter>

      <Chapter id="verantwortlich">
        <p>
          Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV: {LEGAL_ENTITY.contentResponsible},{' '}
          {LEGAL_ENTITY.street}, {LEGAL_ENTITY.postalCodeCity}
        </p>
      </Chapter>

      <Chapter id="kammer">
        <LegalFacts items={CHAMBER_FACTS} />
        <p>
          Berufsbezeichnung: {CHAMBER.profession}. Berufsrechtliche Regelungen: {CHAMBER.rules}.
        </p>
      </Chapter>

      <Chapter id="streitbeilegung">
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, die du unter{' '}
          <a href={OS_PLATFORM_URL} className="break-all">
            {OS_PLATFORM_URL}
          </a>{' '}
          findest. Wir sind grundsätzlich bereit, an Streitbeilegungsverfahren vor einer anerkannten
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </Chapter>

      <Chapter id="haftung">
        <p>
          Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen
          Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir jedoch nicht verpflichtet, übermittelte oder gespeicherte
          fremde Informationen zu überwachen. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese
          Inhalte umgehend entfernen.
        </p>
      </Chapter>
    </LegalDocument>
  );
}
