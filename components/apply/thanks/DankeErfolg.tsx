import type { ReactNode } from 'react';
import { SectionHeader } from '@/components/home/SectionHeader';
import { Icon } from '@/components/icons';
import { Section } from '@/components/layout/Section';
import { Seitenkopf } from '@/components/seitenkopf';
import { OpeningHoursText } from '@/components/site/OpeningHoursText';
import { Button } from '@/components/ui/Button';
import { TextLink } from '@/components/ui/TextLink';
import { KreisGeschlossen, Leitungstrenner } from '@/components/zeichnung';
import type { ContactChannel } from '@/lib/applications/constants';
import { formatBerlinDateTime } from '@/lib/apply/office-hours';
import { MAPPE_PATH } from '@/lib/apply/params';
import type { SubmittedApplication } from '@/lib/apply/storage';
import { buildVCard, vcardDataUri } from '@/lib/apply/vcard';
import { buildFollowUpMessage } from '@/lib/apply/whatsapp-message';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp-utils';
import { DankeAblauf, type DankeSchritt } from './DankeAblauf';
import { ABLAUF_TEXT, DANKE_ANKER, ERFOLG_KOPF, ERGAENZEN_TEXT, SEITEN_TEXT, rueckmeldewegText } from './danke-text';
import { FollowUpForm } from './FollowUpForm';
import type { ThankYouCompany, ThankYouViewProps } from './types';
import styles from './danke.module.css';

const KANAL_ICON = { whatsapp: 'message-circle', phone: 'phone', email: 'mail' } as const;

export interface DankeErfolgProps extends Omit<ThankYouViewProps, 'bewerbenMikrotext'> {
  record: SubmittedApplication;
  /** Gewählter Rückmeldeweg, falls der gespeicherte Datensatz ihn trägt. */
  rueckmeldeweg: ContactChannel | null;
  /** Büro gerade besetzt (Öffnungszeiten, Europe/Berlin). */
  officeOpen: boolean;
}

/**
 * Erfolgszustand der Danke-Seite (E-START-020, E-START-015, E-BEW-015): erst nach Serverbestätigung, denn der
 * Flow schreibt den Datensatz nur nach HTTP 200 mit ok:true. Der Kreis schließt sich einmal (kreis-schliessen,
 * d-3), reduziert steht er geschlossen; Text zuerst, die Bewegung bestätigt nur.
 */
export function DankeErfolg({
  record,
  rueckmeldeweg,
  officeOpen,
  jobs,
  processSteps,
  company,
  quickResponse,
  noCvNeeded,
  contactOptions,
}: DankeErfolgProps) {
  const job = jobs[record.jobId];
  const questionSet = job?.questionSet ?? 'fachkraft';
  const steps = processSteps[questionSet] ?? processSteps.fachkraft;

  const schritte: DankeSchritt[] = [
    {
      id: 'gesendet',
      titel: ABLAUF_TEXT.gesendet,
      erledigt: true,
      angaben: [
        ...(job ? [{ name: ABLAUF_TEXT.angaben.stelle, wert: job.label }] : []),
        {
          name: ABLAUF_TEXT.angaben.eingang,
          wert: <span className="ziffer">{formatBerlinDateTime(new Date(record.submittedAt))}</span>,
        },
        {
          name: ABLAUF_TEXT.angaben.weg,
          wert: rueckmeldewegText(rueckmeldeweg),
          icon: rueckmeldeweg ? KANAL_ICON[rueckmeldeweg] : undefined,
        },
      ],
    },
    {
      id: 'rueckmeldung',
      titel: ABLAUF_TEXT.rueckmeldung,
      text: quickResponse,
      hinweis: officeOpen ? undefined : (
        <>
          {ABLAUF_TEXT.buero} <OpeningHoursText text={company.openingHoursShort} />.
        </>
      ),
    },
    ...steps
      .filter((step) => step.id !== 'bewerben')
      .map((step) => ({ id: step.id, titel: step.title, text: step.text, etikett: step.highlight })),
  ];

  return (
    <>
      <Seitenkopf
        variante="arbeit"
        titelId={DANKE_ANKER.titel}
        etikett={
          <>
            <span className={styles.kreisHandy}>
              <KreisGeschlossen />
            </span>
            {ERFOLG_KOPF.etikett}
          </>
        }
        titel={ERFOLG_KOPF.titel(record.firstName)}
        unterzeile={ERFOLG_KOPF.unterzeile}
        zweitweg={ERFOLG_KOPF.zweitweg}
        masse={[{ wert: record.reference, name: ERFOLG_KOPF.massName }]}
        panel={<KreisGeschlossen className={styles.kreisPanel} />}
      />

      <div className={styles.flaeche} data-danke="flaeche">
        <div className={styles.haupt}>
          <DankeAblauf titelId={DANKE_ANKER.ablauf} titel={ABLAUF_TEXT.titel} schritte={schritte} />
        </div>
        <Leitungstrenner className={styles.trenner} />
        <div className={styles.seite}>
          <Weg titelId="danke-nummer" titel={SEITEN_TEXT.nummerTitel} icon="user-plus">
            <p className="text-body text-ink-muted">
              {SEITEN_TEXT.nummerVor} <span className="ziffer whitespace-nowrap text-ink">{company.phoneDisplay}</span>
              {SEITEN_TEXT.nummerNach}
            </p>
            <div className={styles.knoepfe}>
              <Button asChild variant="outline">
                <a href={vcardDataUri(buildVCard(vcardFor(company)))} download="bad-und-energie.vcf">
                  <Icon name="user-plus" size="md" />
                  {SEITEN_TEXT.nummerKnopf}
                </a>
              </Button>
            </div>
          </Weg>

          <Weg titelId="danke-unterlagen" titel={SEITEN_TEXT.unterlagenTitel} icon="file-text">
            <p className="text-body text-ink-muted">
              {noCvNeeded} {SEITEN_TEXT.unterlagenText}{' '}
              <span className="font-mass whitespace-nowrap text-ink">{record.reference}</span>.
            </p>
            <div className={styles.knoepfe}>
              <Button asChild variant="outline">
                <a href={buildWhatsAppUrl(buildFollowUpMessage({ reference: record.reference }))} target="_blank" rel="noopener noreferrer">
                  <Icon name="message-circle" size="md" />
                  Per WhatsApp
                  <span className="sr-only"> (öffnet WhatsApp)</span>
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={mailtoFor(company.email, record.reference)}>
                  <Icon name="mail" size="md" />
                  Per E-Mail
                </a>
              </Button>
            </div>
          </Weg>

          {contactOptions ? (
            <Weg titelId="danke-kontakt" titel={SEITEN_TEXT.fragenTitel} icon="phone">
              <div className={styles.voll}>{contactOptions}</div>
            </Weg>
          ) : null}
        </div>
      </div>

      <Section id={DANKE_ANKER.ergaenzen} tone="wand" trenner aria-labelledby="danke-ergaenzen-titel">
        <div className={styles.ergaenzen}>
          <div className={styles.ergaenzenHaupt}>
            <SectionHeader
              id="danke-ergaenzen-titel"
              eyebrow={ERGAENZEN_TEXT.etikett}
              title={ERGAENZEN_TEXT.titel}
              lead={ERGAENZEN_TEXT.einleitung}
            />
            <FollowUpForm
              reference={record.reference}
              followUpToken={record.followUpToken}
              phoneHref={company.phoneHref}
              kenntnisse={questionSet !== 'ausbildung'}
            />
          </div>
          <div className={styles.ergaenzenSeite}>
            <Weg titelId="danke-mappe" titel={ERGAENZEN_TEXT.mappeTitel} icon="file-check">
              <p className="text-body text-ink-muted">{ERGAENZEN_TEXT.mappeText}</p>
              <TextLink href={MAPPE_PATH} standalone>
                {ERGAENZEN_TEXT.mappeLink}
                <Icon name="arrow-right" size="md" className="shrink-0" />
              </TextLink>
            </Weg>
          </div>
        </div>
      </Section>
    </>
  );
}

/** Kurzer Weg in der rechten Spalte: Etikett-Kästchen mit Icon und Titel (h2), darunter der Inhalt. */
function Weg({
  titelId,
  titel,
  icon,
  children,
}: {
  titelId: string;
  titel: string;
  icon: 'user-plus' | 'file-text' | 'phone' | 'file-check';
  children?: ReactNode;
}) {
  return (
    <section aria-labelledby={titelId} className={styles.weg}>
      <div className={styles.wegKopf}>
        <span className={styles.kasten}>
          <Icon name={icon} size="lg" />
        </span>
        <h2 id={titelId} className="text-title-3 text-brand">
          {titel}
        </h2>
      </div>
      {children}
    </section>
  );
}

function vcardFor(company: ThankYouCompany) {
  return {
    formattedName: company.shortName,
    organization: company.legalName,
    phone: company.phoneE164,
    email: company.email,
    street: company.street,
    postalCode: company.postalCode,
    city: company.city,
    region: company.region,
    country: company.countryName,
    url: company.website,
  };
}

function mailtoFor(email: string, reference: string): string {
  const subject = `Unterlagen zur Bewerbung ${reference}`;
  const body = `Guten Tag,\n\nanbei meine Unterlagen zur Bewerbung ${reference}.\n`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
