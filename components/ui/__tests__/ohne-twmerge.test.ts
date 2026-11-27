import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Ladezeit am Handy (Inhaber, 27.11.2026): Die Stimmen-Reihe der Startseite ist eine Client-Insel. Zöge einer ihrer
 * Bausteine cn() (tailwind-merge, rund 9 KB gezippt) herein, käme die Bibliothek ins Start-Bündel der Startseite.
 */
const BAUSTEINE = ['components/reviews/ReviewScroller.tsx', 'components/ui/Chip.tsx', 'components/ui/IconButton.tsx', 'components/ui/Rating.tsx'];

describe('Stimmen-Reihe ohne tailwind-merge', () => {
  it.each(BAUSTEINE)('%s nutzt clsx statt cn()', (datei) => {
    const quelle = readFileSync(path.join(process.cwd(), datei), 'utf8');
    expect(quelle).not.toMatch(/from '@\/lib\/utils\/cn'|tailwind-merge'/);
    expect(quelle).toContain("import { clsx as cn } from 'clsx';");
  });
});
