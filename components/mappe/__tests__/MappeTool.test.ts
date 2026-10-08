import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { ToastProvider } from '@/components/ui/Toast';
import { getMappeJobOptions, getMappeRecipient } from '@/lib/mappe/context';
import { MappeTool } from '../MappeTool';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), prefetch: vi.fn(), refresh: vi.fn() }),
}));

function render(): string {
  return renderToStaticMarkup(
    createElement(
      ToastProvider,
      null,
      createElement(MappeTool, { jobs: getMappeJobOptions(), recipient: getMappeRecipient() }),
    ),
  );
}

describe('MappeTool (server render)', () => {
  const html = render();

  it('renders the five editor steps, the preview and both actions', () => {
    const headings = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((m) => m[1].replace(/<[^>]+>/g, ''));
    expect(headings).toEqual([
      '1Persönliches',
      '2Stelle',
      '3Schwerpunkte',
      '4Arbeitsstil und Anschreiben',
      '5Berufserfahrung und Ausbildung',
      'Vorschau',
    ]);
    expect(html).toContain('Mit dieser Mappe bewerben');
    expect(html).toContain('Als PDF speichern / drucken');
    expect(html.match(/<h1/g)).toBeNull();
  });

  it('starts without invented data', () => {
    expect(html).not.toMatch(/undefined|Alexander Koch|Mittelhessen|Gesellenbrief/);
    expect(html).toContain('Noch keine Berufserfahrung eingetragen.');
    expect(html).toContain('Noch kein Abschluss eingetragen.');
    expect(html).toContain('Sehr geehrter Herr Demir,');
  });

  it('offers every flow job plus the initiative option', () => {
    for (const job of getMappeJobOptions()) expect(html).toContain(`value="${job.id}"`);
    expect(html).toContain('value="initiativ"');
  });

  it('labels the reorder controls only once entries exist', () => {
    expect(html).not.toContain('nach oben verschieben');
    expect(html).toContain('Berufserfahrung hinzufügen');
  });
});
