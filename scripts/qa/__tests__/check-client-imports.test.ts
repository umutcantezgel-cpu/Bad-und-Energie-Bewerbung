import { describe, expect, it } from 'vitest';

import { isClientModule, stripComments, valueImports } from '../check-client-imports.mjs';

describe('check-client-imports', () => {
  it('detects the use client directive after comments only', () => {
    expect(isClientModule("'use client';\nimport x from 'y';")).toBe(true);
    expect(isClientModule('/** Doc */\n"use client";')).toBe(true);
    expect(isClientModule("import x from 'y';\n'use client';")).toBe(false);
  });

  it('collects value imports and skips type-only ones (they are erased by the compiler)', () => {
    const source = `
      import { z } from 'zod';
      import type { Mappe } from '@/lib/applications/schema';
      import { type A, type B } from './types';
      import { type C, d } from './mixed';
      import Default, { e } from './default';
      import * as ns from './ns';
      import './side-effect.css';
      export * from './constants';
      export { f } from './reexport';
      export type { G } from './type-reexport';
      const lazy = () => import('./lazy');
      // import { hidden } from 'zod/commented';
      /* import { hidden } from 'zod/block'; */
      const url = 'https://example.org/import';
    `;
    expect(valueImports(source)).toEqual([
      'zod',
      './mixed',
      './default',
      './ns',
      './constants',
      './reexport',
      './side-effect.css',
      './lazy',
    ]);
  });

  it('keeps strings with comment markers intact', () => {
    expect(stripComments("const a = 'http://x'; // weg\nconst b = 1;")).toBe("const a = 'http://x'; \nconst b = 1;");
  });
});

describe('check-client-imports (clause boundaries)', () => {
  it('does not swallow an import that follows other exported code', () => {
    const source = "export function a() { return 1 }\nimport { z } from 'zod';";
    expect(valueImports(source)).toEqual(['zod']);
  });
});
