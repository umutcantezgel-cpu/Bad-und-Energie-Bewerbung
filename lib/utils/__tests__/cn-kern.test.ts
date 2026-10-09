import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/utils/cn';

/**
 * Regression für die KERN-1.0-Schlüssel in lib/utils/cn.ts (K-004: ohne Eintrag verschluckt
 * tailwind-merge Klassen oder behält zwei, die sich widersprechen).
 */
describe('cn mit den Tokens aus KERN 1.0', () => {
  it('hält Schriftstufe und Farbe nebeneinander', () => {
    expect(cn('text-etikett text-ink-2')).toBe('text-etikett text-ink-2');
    expect(cn('text-display text-brand')).toBe('text-display text-brand');
    expect(cn('text-plakat text-brand')).toBe('text-plakat text-brand');
    expect(cn('text-numeral text-ink-2')).toBe('text-numeral text-ink-2');
  });

  it('lässt die letzte Schriftstufe gewinnen', () => {
    expect(cn('text-display text-plakat')).toBe('text-plakat');
    expect(cn('text-footnote text-etikett')).toBe('text-etikett');
    expect(cn('text-plakat text-title-1')).toBe('text-title-1');
  });

  it('kennt die Familien font-display, font-sans, font-mass und ziffer', () => {
    expect(cn('font-sans font-mass')).toBe('font-mass');
    expect(cn('font-mass font-display')).toBe('font-display');
    expect(cn('font-sans ziffer')).toBe('ziffer');
    expect(cn('ziffer font-sans')).toBe('font-sans');
    expect(cn('ziffer font-bold')).toBe('ziffer font-bold');
    expect(cn('font-mass text-title-2 text-brand')).toBe('font-mass text-title-2 text-brand');
  });

  it('führt die neuen Farbrollen zusammen', () => {
    expect(cn('text-ink text-brand')).toBe('text-brand');
    expect(cn('text-ink-muted text-ink-2')).toBe('text-ink-2');
    expect(cn('bg-wand bg-waerme')).toBe('bg-waerme');
    expect(cn('bg-surface bg-plakette')).toBe('bg-plakette');
    expect(cn('stroke-vorlauf stroke-ruecklauf')).toBe('stroke-ruecklauf');
    expect(cn('bg-accent hover:bg-accent-hover active:bg-accent-press')).toBe('bg-accent hover:bg-accent-hover active:bg-accent-press');
    expect(cn('active:bg-accent-hover active:bg-accent-press')).toBe('active:bg-accent-press');
  });

  it('kennt vier Radien, Dauern und Kurven aus dem Register', () => {
    expect(cn('rounded-md rounded-2')).toBe('rounded-2');
    expect(cn('rounded-1 rounded-voll')).toBe('rounded-voll');
    expect(cn('rounded-3 rounded-t-1')).toBe('rounded-3 rounded-t-1');
    expect(cn('duration-d2 duration-fast')).toBe('duration-fast');
    expect(cn('duration-fast duration-d4')).toBe('duration-d4');
    expect(cn('ease-aus ease-wechsel')).toBe('ease-wechsel');
    expect(cn('ease-standard ease-ein')).toBe('ease-ein');
  });

  it('kennt Bundsteg, Paarabstand und Satzspiegel', () => {
    expect(cn('px-gutter px-bundsteg')).toBe('px-bundsteg');
    expect(cn('gap-paar gap-4')).toBe('gap-4');
    expect(cn('gap-4 gap-paar')).toBe('gap-paar');
    expect(cn('max-w-satz max-w-content')).toBe('max-w-content');
    expect(cn('max-w-prose max-w-satz')).toBe('max-w-satz');
  });
});
