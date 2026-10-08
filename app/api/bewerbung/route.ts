import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { guardErrorResponse, guardJsonPost, RATE_LIMITS } from '@/lib/security';
import { dispatchApplicationRequest } from '@/lib/email';
import { escapeHTML, sanitizeInput } from '@/lib/utils/sanitize';

const applicationSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Der Name muss mindestens 2 Zeichen lang sein.')
    .max(100),
  email: z
    .string()
    .email('Bitte geben Sie eine gültige E Mail Adresse an.')
    .max(254),
  phone: z
    .string()
    .min(5, 'Bitte geben Sie eine gültige Telefonnummer an.')
    .max(50),
  location: z.string().max(100).optional().default('Wetzlar und Umgebung'),
  position: z
    .string()
    .min(2, 'Bitte wählen Sie eine angestrebte Stelle aus.')
    .max(150),
  experience: z.string().max(100).optional().default(''),
  startDate: z.string().max(100).optional().default('Flexibel nach Absprache'),
  salaryExpectation: z.string().max(100).optional().default('Nach Vereinbarung'),
  skills: z.array(z.string().max(100)).optional().default([]),
  notes: z.string().max(5000).optional().default(''),
  contactPreference: z.string().max(50).optional().default('whatsapp'),
  discretionGuaranteed: z.boolean().optional().default(true),
  websiteUrl: z.string().optional().default(''), // Honeypot
});

export async function POST(request: NextRequest) {
  try {
    const guard = await guardJsonPost(request, { scope: 'application', rateLimit: RATE_LIMITS.applicationSubmit });
    if (!guard.ok) return guardErrorResponse(guard);
    const body = guard.data;

    const parsed = applicationSchema.safeParse(body);
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

    // Honeypot check
    if (data.websiteUrl && data.websiteUrl.trim().length > 0) {
      console.warn('[Anti-Spam] Bot abgefangen durch Honeypot im Bewerbungsformular:', data.websiteUrl);
      return NextResponse.json({
        success: true,
        message: 'Bewerbung erfolgreich eingereicht.',
      });
    }

    const sanitizedFullName = sanitizeInput(data.fullName, 100);
    const sanitizedEmail = data.email.trim().toLowerCase();
    const sanitizedPhone = sanitizeInput(data.phone, 50);
    const sanitizedLocation = sanitizeInput(data.location, 100);
    const sanitizedPosition = sanitizeInput(data.position, 150);
    const sanitizedExperience = sanitizeInput(data.experience, 100);
    const sanitizedStartDate = sanitizeInput(data.startDate, 100);
    const sanitizedSalary = sanitizeInput(data.salaryExpectation, 100);
    const sanitizedSkills = (data.skills || []).map((s) => sanitizeInput(s, 100));
    const sanitizedNotes = escapeHTML(data.notes || '').slice(0, 5000);
    const sanitizedPreference = sanitizeInput(data.contactPreference, 50);

    const result = await dispatchApplicationRequest({
      fullName: sanitizedFullName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      location: sanitizedLocation,
      position: sanitizedPosition,
      experience: sanitizedExperience,
      startDate: sanitizedStartDate,
      salaryExpectation: sanitizedSalary,
      skills: sanitizedSkills,
      notes: sanitizedNotes,
      contactPreference: sanitizedPreference,
      discretionGuaranteed: data.discretionGuaranteed,
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
      console.error('[Application API] Fehler beim Versand:', result.teamNotification.error);
      return NextResponse.json(
        {
          success: false,
          error:
            'Die Bewerbung konnte serverseitig nicht übermittelt werden. Bitte rufen Sie uns direkt an unter 06441 42956 oder schreiben Sie uns via WhatsApp.',
        },
        // 503 = Versand nicht konfiguriert (ROADMAP §14.4), sonst Zustellfehler
        { status: result.teamNotification.error === 'not_configured' ? 503 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        'Vielen Dank! Ihre Bewerbung ist erfolgreich bei uns eingegangen. Wir melden uns schnellstmöglich bei Ihnen.',
      simulated: result.simulated,
    });
  } catch (err: unknown) {
    console.error('[Application API Exception]', err);
    return NextResponse.json(
      {
        success: false,
        error:
          'Ein Systemfehler ist aufgetreten. Bitte wenden Sie sich direkt an Meister Demir unter 06441 42956.',
      },
      { status: 500 }
    );
  }
}
