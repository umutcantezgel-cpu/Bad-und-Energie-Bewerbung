import { z } from 'zod';
import { applicationInputSchema, contactChannelSchema } from '@/lib/applications/schema';
import { isPlausiblePhone, normalizePhoneInput } from './phone';

/**
 * Kontaktschritt des Flows: dieselben Feldregeln wie applicationInputSchema (der gemeinsame
 * Vertrag mit der API), dazu eine Plausibilitätsprüfung der Telefonnummer. Vor dem Absenden
 * prüft der Flow den kompletten Payload noch einmal mit applicationInputSchema.
 */

const shape = applicationInputSchema.shape;

export const CONTACT_MESSAGES = {
  phone: 'Bitte gib eine gültige Telefonnummer an.',
  email: 'Bitte gib eine gültige E-Mail-Adresse an.',
  emailRequired: 'Bitte gib deine E-Mail-Adresse an.',
} as const;

const emailFormat = z.email();

export const contactFormSchema = z
  .object({
    name: shape.name,
    phone: z
      .string()
      .transform(normalizePhoneInput)
      .pipe(shape.phone)
      .refine(isPlausiblePhone, CONTACT_MESSAGES.phone),
    email: z
      .string()
      .trim()
      .max(254, CONTACT_MESSAGES.email)
      .refine((value) => value === '' || emailFormat.safeParse(value).success, CONTACT_MESSAGES.email),
    contactChannel: contactChannelSchema,
    website: shape.website,
  })
  .superRefine((value, ctx) => {
    if (value.contactChannel === 'email' && !value.email) {
      ctx.addIssue({ code: 'custom', path: ['email'], message: CONTACT_MESSAGES.emailRequired });
    }
  });

export type ContactFormInput = z.input<typeof contactFormSchema>;
export type ContactFormValues = z.output<typeof contactFormSchema>;

export const EMPTY_CONTACT: ContactFormInput = {
  name: '',
  phone: '',
  email: '',
  contactChannel: 'whatsapp',
  website: '',
};

/** Maximallängen für die Eingabefelder (deckungsgleich mit dem Schema). */
export const CONTACT_MAX_LENGTH = { name: 100, phone: 40, email: 254 } as const;
