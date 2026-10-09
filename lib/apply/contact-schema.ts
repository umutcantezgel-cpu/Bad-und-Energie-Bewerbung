import type { FieldErrors, Resolver } from 'react-hook-form';
import {
  CONTACT_LIMITS,
  CONTACT_MESSAGES,
  EMAIL_PATTERN,
  isContactChannel,
  tooLongMessage,
  type ContactChannel,
} from '@/lib/applications/constants';
import { isPlausiblePhone, normalizePhoneInput } from './phone';

/**
 * Kontaktschritt des Flows ohne zod (kleines Browser-Bundle): dieselben Regeln, Grenzen und
 * Meldungen wie applicationInputSchema auf dem Server (lib/applications/constants.ts), dazu
 * die Plausibilitätsprüfung der Telefonnummer. Ein Test hält Client und Server deckungsgleich.
 */

export { CONTACT_MESSAGES };

export interface ContactFormInput {
  name: string;
  phone: string;
  email: string;
  contactChannel: ContactChannel;
}

/** Geprüfte Werte: getrimmt, Telefonnummer mit Leerzeichen statt Punkten. */
export type ContactFormValues = ContactFormInput;

export type ContactField = keyof ContactFormInput;
export type ContactErrors = Partial<Record<ContactField, string>>;

export type ContactValidation = { ok: true; values: ContactFormValues } | { ok: false; errors: ContactErrors };

export const EMPTY_CONTACT: ContactFormInput = {
  name: '',
  phone: '',
  email: '',
  contactChannel: 'whatsapp',
};

/** Maximallängen für die Eingabefelder (deckungsgleich mit dem Schema). */
export const CONTACT_MAX_LENGTH = { name: CONTACT_LIMITS.name, phone: CONTACT_LIMITS.phone, email: CONTACT_LIMITS.email } as const;

const asText = (value: unknown): string => (typeof value === 'string' ? value : '');

/** Prüft alle Kontaktfelder; Fehler je Feld mit derselben Meldung wie der Server. */
export function validateContact(input: Partial<Record<ContactField, unknown>>): ContactValidation {
  const errors: ContactErrors = {};

  const name = asText(input.name).trim();
  if (name.length < CONTACT_LIMITS.nameMin) errors.name = CONTACT_MESSAGES.name;
  else if (name.length > CONTACT_LIMITS.name) errors.name = tooLongMessage(CONTACT_LIMITS.name);

  const phone = normalizePhoneInput(asText(input.phone));
  if (phone.length > CONTACT_LIMITS.phone) errors.phone = tooLongMessage(CONTACT_LIMITS.phone);
  else if (!isPlausiblePhone(phone)) errors.phone = CONTACT_MESSAGES.phone;

  const contactChannel: ContactChannel = isContactChannel(input.contactChannel) ? input.contactChannel : 'whatsapp';

  const email = asText(input.email).trim();
  if (email.length > CONTACT_LIMITS.email || (email !== '' && !EMAIL_PATTERN.test(email))) errors.email = CONTACT_MESSAGES.email;
  else if (contactChannel === 'email' && email === '') errors.email = CONTACT_MESSAGES.emailRequired;

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, values: { name, phone, email, contactChannel } };
}

/** react-hook-form-Resolver auf Basis von validateContact. */
export const contactResolver: Resolver<ContactFormInput, unknown, ContactFormValues> = (values) => {
  const result = validateContact(values);
  if (result.ok) return { values: result.values, errors: {} };
  const errors: FieldErrors<ContactFormInput> = {};
  for (const [field, message] of Object.entries(result.errors) as [ContactField, string][]) {
    errors[field] = { type: 'validate', message };
  }
  return { values: {}, errors };
};
