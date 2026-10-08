import { COMPANY } from '@/lib/content/company';
import { getFunnelOptions } from '@/lib/jobs/registry';
import type { MappeJobOption, MappeRecipient } from './types';

/**
 * Daten, die die Seite /bewerbung/mappe auf dem Server baut und als Props an das
 * Werkzeug gibt. So landen Registry und Stammdaten nicht im Client-Bundle.
 */

/** Stellen wie im Bewerbungsflow: veröffentlichte plus funnel_only, feste Reihenfolge. */
export function getMappeJobOptions(): MappeJobOption[] {
  return getFunnelOptions().map((option) => ({
    id: option.id,
    slug: option.slug,
    title: option.title,
    category: option.category,
    published: option.status === 'published',
  }));
}

function contactFamilyName(): string {
  const contactName = COMPANY.managingDirector.name;
  return contactName.split(/\s+/).at(-1) ?? contactName;
}

/** Vorbefüllter WhatsApp-Text für den Fallback, wenn das Nachreichen scheitert. */
export function getMappeWhatsAppMessage(): string {
  return `Guten Tag Herr ${contactFamilyName()}, ich möchte meine Bewerbungsmappe zu meiner Bewerbung nachreichen.`;
}

/** Empfänger laut Stammdaten; die Anrede „Herr Demir“ steht so auf der bisherigen Seite. */
export function getMappeRecipient(): MappeRecipient {
  const contactName = COMPANY.managingDirector.name;
  const familyName = contactFamilyName();
  return {
    companyName: COMPANY.legalName,
    contactName,
    salutation: `Sehr geehrter Herr ${familyName},`,
    attention: `Herrn ${contactName}`,
    street: COMPANY.address.street,
    postalCode: COMPANY.address.postalCode,
    city: COMPANY.address.city,
  };
}
