import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ReactNode } from 'react';
import { ImageResponse } from 'next/og';
import { COMPANY } from '@/lib/content/company';
import { OG_COLOR, OG_EYEBROW, OG_IMAGE_SIZE } from './og-image';

/**
 * Shared frame of all share images (typographic, no photos): logo and eyebrow on top, the
 * content in the middle, a footer line below. Inter is fetched from Google Fonts when the
 * image is rendered, subset to the glyphs in use; if that fails (offline build, timeout), the
 * image renders with the font built into next/og instead of failing.
 */
export interface OgContent {
  /** Middle block. */
  main: ReactNode;
  /** Left side of the footer line. */
  footer: ReactNode;
  /** Right side of the footer line, muted. */
  aside: string;
  /** Every string rendered in `main` and `footer`, so the font subset contains all glyphs. */
  texts: readonly string[];
}

type FontWeight = 400 | 600;

async function loadInter(weight: FontWeight, text: string): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await fetch(cssUrl, { cache: 'force-cache', signal: AbortSignal.timeout(5000) }).then((res) =>
      res.ok ? res.text() : '',
    );
    const fontUrl = /src:\s*url\(([^)]+)\)\s*format\('(?:opentype|truetype)'\)/.exec(css)?.[1];
    if (!fontUrl) return null;
    const font = await fetch(fontUrl, { cache: 'force-cache', signal: AbortSignal.timeout(5000) });
    return font.ok ? await font.arrayBuffer() : null;
  } catch {
    return null;
  }
}

async function loadLogo(): Promise<string | null> {
  try {
    const png = await readFile(join(process.cwd(), 'public/images/bad-energie-lahn-dill-logo-transparent.png'));
    return `data:image/png;base64,${png.toString('base64')}`;
  } catch {
    return null;
  }
}

export async function renderOgImage({ main, footer, aside, texts }: OgContent): Promise<ImageResponse> {
  const glyphs = [...new Set([OG_EYEBROW, COMPANY.name, aside, ...texts].join(''))].join('');
  const [regular, semibold, logo] = await Promise.all([loadInter(400, glyphs), loadInter(600, glyphs), loadLogo()]);
  const fonts = [
    ...(regular ? [{ name: 'Inter', data: regular, weight: 400 as const, style: 'normal' as const }] : []),
    ...(semibold ? [{ name: 'Inter', data: semibold, weight: 600 as const, style: 'normal' as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          backgroundColor: OG_COLOR.surface,
          color: OG_COLOR.ink,
          ...(fonts.length > 0 ? { fontFamily: 'Inter' } : {}),
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {logo ? (
            // Satori renders plain <img>; next/image is not available here.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" width={262} height={48} />
          ) : (
            <div style={{ fontSize: 28, fontWeight: 600 }}>{COMPANY.name}</div>
          )}
          <div style={{ fontSize: 26, color: OG_COLOR.muted }}>{OG_EYEBROW}</div>
        </div>

        {main}

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            borderTop: `2px solid ${OG_COLOR.line}`,
            paddingTop: 28,
          }}
        >
          {footer}
          <div style={{ fontSize: 24, color: OG_COLOR.muted }}>{aside}</div>
        </div>
      </div>
    ),
    { ...OG_IMAGE_SIZE, fonts: fonts.length > 0 ? fonts : undefined },
  );
}
