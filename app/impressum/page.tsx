import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import {
  CHAMBER,
  LEGAL_ENTITY,
  LegalFactLink,
  LegalFacts,
  displayUrl,
  mailtoHref,
  type LegalFact,
} from '@/components/legal';
import { RechtAbschnitt, RechtDokument, abschnittsNummer } from '@/components/recht';
import { generatePageMetadata } from '@/lib/seo/metadata';

/*
 * Impressum: Inhalt wie bisher, nur neu gegliedert. TMG-Verweise auf das DDG umgestellt, Satz zur
 * eingestellten OS-Plattform entfernt. Offene Punkte (USt-IdNr., § 36 VSBG) stehen in
 * docs/operations/datenschutz-aenderungen.md.
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

const SECTION_IDS = Object.keys(SECTIONS) as SectionId[];
const TOC = SECTION_IDS.map((id) => ({ id, label: SECTIONS[id].toc ?? SECTIONS[id].title }));

/** Kapitel mit derselben laufenden Nummer wie im Inhaltsverzeichnis (Darstellung R5-RECHT-01). */
function Chapter({ id, children }: { id: SectionId; children: ReactNode }) {
  return (
    <RechtAbschnitt id={id} titel={SECTIONS[id].title} nummer={abschnittsNummer(SECTION_IDS.indexOf(id))}>
      {children}
    </RechtAbschnitt>
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
      <LegalFactLink href={LEGAL_ENTITY.phone.href}>
        {LEGAL_ENTITY.phone.display}
      </LegalFactLink>
    ),
  },
  { label: 'Telefax', value: LEGAL_ENTITY.fax },
  {
    label: 'E-Mail',
    value: (
      <LegalFactLink href={LEGAL_ENTITY.emailHref}>
        {LEGAL_ENTITY.email}
      </LegalFactLink>
    ),
  },
  {
    label: 'Website',
    value: (
      <LegalFactLink href={LEGAL_ENTITY.website}>
        {displayUrl(LEGAL_ENTITY.website)}
      </LegalFactLink>
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
      <LegalFactLink href={CHAMBER.phone.href}>
        {CHAMBER.phone.display}
      </LegalFactLink>
    ),
  },
  {
    label: 'E-Mail',
    value: (
      <LegalFactLink href={mailtoHref(CHAMBER.email)}>
        {CHAMBER.email}
      </LegalFactLink>
    ),
  },
  {
    label: 'Website',
    value: (
      <LegalFactLink href={CHAMBER.url}>
        {displayUrl(CHAMBER.url)}
      </LegalFactLink>
    ),
  },
];

export default function ImpressumPage() {
  return (
    <RechtDokument
      titel="Impressum"
      pfad="Impressum"
      einleitung={<p>{`Angaben nach § 5 DDG und Handwerksordnung für die ${LEGAL_ENTITY.name}.`}</p>}
      inhalt={TOC}
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
        {/* Die EU-Plattform zur Online-Streitbeilegung wurde im Juli 2025 eingestellt; der Hinweis darauf entfällt. */}
        <p>
          Wir sind grundsätzlich bereit, an Streitbeilegungsverfahren vor einer anerkannten Verbraucherschlichtungsstelle
          teilzunehmen.
        </p>
      </Chapter>

      <Chapter id="haftung">
        <p>
          Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen
          Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir jedoch nicht verpflichtet, übermittelte oder gespeicherte
          fremde Informationen zu überwachen. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese
          Inhalte umgehend entfernen.
        </p>
      </Chapter>
    </RechtDokument>
  );
}
