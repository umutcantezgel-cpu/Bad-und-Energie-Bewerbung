'use client';

import { useEffect, type CSSProperties } from 'react';
import { CONTACT_PHONE as PHONE } from '@/lib/data/contact';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp-utils';

/*
 * Replaces the root layout when it fails, so globals.css, Inter and the design tokens are not
 * available. Inline styles with CSS system colors (Canvas/CanvasText) follow light and dark mode.
 */

const WHATSAPP_HREF = buildWhatsAppUrl(
  'Guten Tag Herr Demir, auf der Karriereseite ist ein technischer Fehler aufgetreten. Ich melde mich deshalb direkt.',
);

const styles = {
  html: { colorScheme: 'light dark' },
  body: {
    margin: 0,
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    background: 'Canvas',
    color: 'CanvasText',
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    fontSize: 17,
    lineHeight: 1.55,
    WebkitFontSmoothing: 'antialiased',
  },
  main: { width: '100%', maxWidth: '40rem', margin: '0 auto', padding: '64px 20px' },
  title: { fontSize: 32, lineHeight: 1.15, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 16px' },
  text: { margin: '0 0 32px', opacity: 0.75 },
  actions: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24 },
  button: {
    minHeight: 48,
    padding: '0 24px',
    border: 0,
    borderRadius: 9999,
    background: 'CanvasText',
    color: 'Canvas',
    font: 'inherit',
    fontWeight: 600,
    cursor: 'pointer',
  },
  link: { color: 'inherit', fontWeight: 500, textUnderlineOffset: 4, minHeight: 44, display: 'inline-flex', alignItems: 'center' },
} satisfies Record<string, CSSProperties>;

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="de" style={styles.html}>
      <body style={styles.body}>
        <title>Fehler | Bad & Energie Karriere</title>
        <main style={styles.main}>
          <h1 style={styles.title}>Da ist etwas schiefgelaufen.</h1>
          <p style={styles.text}>
            Bitte lade die Seite neu. Wenn es weiter hakt, ruf uns an oder schreib per WhatsApp.
            {error.digest ? ` Fehlernummer: ${error.digest}` : ''}
          </p>
          <div style={styles.actions}>
            <button type="button" style={styles.button} onClick={() => retry()}>
              Erneut versuchen
            </button>
            <a href={PHONE.href} style={styles.link}>
              {PHONE.display}
            </a>
            <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" style={styles.link}>
              WhatsApp
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
