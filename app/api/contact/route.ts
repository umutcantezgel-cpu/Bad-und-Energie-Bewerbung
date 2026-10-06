import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dispatchContactRequest } from '@/lib/email';
import { escapeHTML, sanitizeInput } from '@/lib/utils/sanitize';

const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Der Name muss mindestens 2 Zeichen lang sein.')
    .max(100, 'Der Name darf maximal 100 Zeichen lang sein.'),
  email: z
    .string()
    .email('Bitte geben Sie eine gültige E Mail Adresse an.')
    .max(254),
  phone: z.string().max(50).optional().default(''),
  subject: z.string().max(200).optional().default('Allgemeine Anfrage oder Schnellbewerbung'),
  message: z.string().max(5000).optional().default(''),
  sourceTag: z.string().max(100).optional().default('kontakt formular wetzlar'),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Bitte stimmen Sie den Datenschutzbestimmungen zu.',
  }),
  websiteUrl: z.string().optional().default(''), // Honeypot field
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Zod Validation
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((issue) => issue.message).join(' ');
      return NextResponse.json(
        {
          success: false,
          error: errorMsg,
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 2. Anti-Spam: Honeypot trap
    if (data.websiteUrl && data.websiteUrl.trim().length > 0) {
      console.warn('[Anti-Spam] Bot abgefangen durch Honeypot:', data.websiteUrl);
      return NextResponse.json({
        success: true,
        message: 'Ihre Anfrage wurde erfolgreich übermittelt.',
      });
    }

    // 3. Input Sanitization
    const sanitizedName = sanitizeInput(data.name, 100);
    const sanitizedEmail = data.email.trim().toLowerCase();
    const sanitizedPhone = sanitizeInput(data.phone || '', 50);
    const sanitizedSubject = sanitizeInput(data.subject || '', 200);
    const sanitizedMessage = escapeHTML(data.message || '').slice(0, 5000);
    const sanitizedSource = sanitizeInput(data.sourceTag || '', 100);

    // 4. Dispatch Email Pipeline (Team Notification + Inquirer Confirmation)
    const result = await dispatchContactRequest({
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      subject: sanitizedSubject,
      message: sanitizedMessage,
      sourceTag: sanitizedSource,
      submittedAt: new Date().toLocaleString('de-DE', {
        timeZone: 'Europe/Berlin',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    });

    if (!result.success) {
      console.error('[Contact API] Fehler beim Versand:', result.teamNotification.error);
      return NextResponse.json(
        {
          success: false,
          error:
            'Die Anfrage konnte nicht übermittelt werden. Bitte rufen Sie uns direkt an unter 06441 42956 oder schreiben Sie per WhatsApp.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        'Vielen Dank! Ihre Nachricht ist sicher bei uns eingegangen. Meister Sabri Demir meldet sich verlässlich innerhalb von 24 Stunden bei Ihnen.',
      simulated: result.simulated,
    });
  } catch (err: unknown) {
    console.error('[Contact API Exception]', err);
    return NextResponse.json(
      {
        success: false,
        error:
          'Ein unerwarteter Systemfehler ist aufgetreten. Bitte kontaktieren Sie uns direkt unter 06441 42956.',
      },
      { status: 500 }
    );
  }
}
