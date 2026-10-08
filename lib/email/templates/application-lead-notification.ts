import type { ReferencedApplication } from '@/lib/applications/types';
import { CONTACT_CHANNEL_LABEL } from '@/lib/apply/whatsapp-message';
import { channelLabel } from '@/lib/attribution/channel';
import { answerRows, mappeBlocks, phoneRow, telHref, whatsAppHref } from './application-parts';
import { formatBerlinDateTime, renderEmail, type EmailBlockInput, type RenderedEmail } from './layout';

/**
 * Team-Benachrichtigung zu einer neuen Bewerbung (Phase 1: das Postfach ist das ATS).
 * Betreff: „Neue Bewerbung BE-26-K7M4QX: Anlagenmechaniker SHK – Max“, bei Spamverdacht mit
 * vorangestelltem „[Spamverdacht]“. Alle Angaben der Bewerberin bzw. des Bewerbers werden escaped.
 */

export const SPAM_SUBJECT_PREFIX = '[Spamverdacht]';

const INACTIVE_STATUS_LABEL: Record<string, string> = {
  draft: 'Entwurf',
  archived: 'besetzt/archiviert',
};

const SECONDS = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });

/** „1,5“ unter 10 Sekunden, sonst ganze Sekunden. */
function formatSeconds(ms: number): string {
  const seconds = Math.max(0, ms) / 1000;
  return seconds < 10 ? SECONDS.format(Math.round(seconds * 10) / 10) : String(Math.round(seconds));
}

export function applicationTeamSubject(app: ReferencedApplication): string {
  const base = `Neue Bewerbung ${app.reference}: ${app.job.shortTitle} – ${app.firstName}`;
  return app.suspectedSpam ? `${SPAM_SUBJECT_PREFIX} ${base}` : base;
}

function primaryAction(app: ReferencedApplication): { href: string; label: string } | null {
  const whatsapp = whatsAppHref(app.phone);
  const tel = telHref(app.phone);
  if (app.contactChannel === 'email' && app.email) return { href: `mailto:${app.email}`, label: 'E-Mail schreiben' };
  if (app.contactChannel === 'whatsapp' && whatsapp) return { href: whatsapp, label: 'Per WhatsApp antworten' };
  if (tel) return { href: tel, label: 'Anrufen' };
  return null;
}

export function renderApplicationTeamEmail(app: ReferencedApplication): RenderedEmail {
  const { job, attribution } = app;
  const isInitiative = !job.referenceCode;
  const action = primaryAction(app);
  const inactive = job.status ? INACTIVE_STATUS_LABEL[job.status] : undefined;
  const answers = answerRows(job.questionSet, app.answers);
  const fillSeconds = app.fillDurationMs !== undefined ? formatSeconds(app.fillDurationMs) : undefined;

  const blocks: EmailBlockInput[] = [
    app.suspectedSpam && {
      type: 'note',
      tone: 'danger',
      text: `Spamverdacht: Das Formular wurde in ${fillSeconds ?? 'weniger als 3'} Sekunden ausgefüllt. Bitte kurz prüfen, bevor du antwortest.`,
    },
    { type: 'title', text: `Neue Bewerbung ${app.reference}` },
    {
      type: 'paragraph',
      text: isInitiative ? `${app.name} hat sich initiativ beworben.` : `${app.name} hat sich auf „${job.title}“ beworben.`,
    },
    action && { type: 'button', href: action.href, label: action.label },

    { type: 'heading', text: 'Kontakt' },
    {
      type: 'rows',
      rows: [
        { label: 'Name', value: app.name },
        phoneRow(app.phone),
        { label: 'E-Mail', value: app.email, href: app.email ? `mailto:${app.email}` : undefined },
        { label: 'Am liebsten per', value: CONTACT_CHANNEL_LABEL[app.contactChannel] },
      ],
    },

    { type: 'heading', text: 'Stelle' },
    {
      type: 'rows',
      rows: [
        { label: 'Stelle', value: job.title },
        { label: 'Referenz', value: job.referenceCode },
      ],
    },
    Boolean(inactive) && {
      type: 'note',
      text: `Hinweis: Diese Stelle ist im Registry als „${inactive}“ markiert und derzeit nicht ausgeschrieben.`,
    },

    answers.length > 0 && { type: 'heading', text: 'Angaben' },
    answers.length > 0 && { type: 'rows', rows: answers },

    ...mappeBlocks(app.mappe),

    { type: 'heading', text: 'Quelle' },
    {
      type: 'rows',
      rows: [
        { label: 'Kanal', value: channelLabel(app.channel) },
        { label: 'utm_source', value: attribution.utmSource },
        { label: 'utm_medium', value: attribution.utmMedium },
        { label: 'utm_campaign', value: attribution.utmCampaign },
        { label: 'utm_content', value: attribution.utmContent },
        { label: 'utm_term', value: attribution.utmTerm },
        { label: 'Empfehlungscode', value: attribution.ref },
        { label: 'Verweisende Seite', value: attribution.referrerHost },
        { label: 'Einstiegsseite', value: attribution.landingPath },
        { label: 'Einstieg', value: attribution.funnel },
      ],
    },

    { type: 'heading', text: 'Eingang' },
    {
      type: 'rows',
      rows: [
        { label: 'Bewerbungsnummer', value: app.reference },
        { label: 'Eingegangen', value: formatBerlinDateTime(app.submittedAt) },
        { label: 'Ausfülldauer', value: fillSeconds !== undefined ? `${fillSeconds} Sekunden` : undefined },
        { label: 'Datenschutzhinweis', value: `Version ${app.privacyNoticeVersion}` },
      ],
    },
  ];

  return renderEmail({
    subject: applicationTeamSubject(app),
    preheader: `${job.shortTitle} · ${channelLabel(app.channel)} · am liebsten per ${CONTACT_CHANNEL_LABEL[app.contactChannel]}`,
    eyebrow: 'Team-Benachrichtigung',
    blocks,
  });
}
