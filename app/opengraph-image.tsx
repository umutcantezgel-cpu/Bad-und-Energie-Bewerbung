import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { HERO, HERO_STATS } from '@/components/home/content';
import { COMPANY } from '@/lib/content/company';
import { SITE_CONFIG } from '@/lib/seo/site-config';

/**
 * Default share image for every route without its own (typographic, no photos).
 * Inter is fetched from Google Fonts at build time; if that fails (offline build, timeout)
 * the image renders with the built-in fallback font instead of failing the build.
 */

export const alt = `${HERO.title} ${HERO.titleSecondLine} ${COMPANY.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Plain values: CSS variables and design tokens are not available inside ImageResponse.
const COLOR = {
  surface: '#FFFFFF',
  ink: '#0A1E3A',
  muted: '#5F6878',
  line: '#E3E6EB',
} as const;

const domain = SITE_CONFIG.baseUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
const stats = HERO_STATS.slice(0, 3);
const TEXTS = [HERO.eyebrow, HERO.title, HERO.titleSecondLine, domain, COMPANY.name, ...stats.flatMap((s) => [s.value, s.label])];

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

export default async function OpengraphImage() {
  const glyphs = [...new Set(TEXTS.join(''))].join('');
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
          backgroundColor: COLOR.surface,
          color: COLOR.ink,
          ...(fonts.length > 0 ? { fontFamily: 'Inter' } : {}),
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {logo ? (
            <img src={logo} alt="" width={262} height={48} />
          ) : (
            <div style={{ fontSize: 28, fontWeight: 600 }}>{COMPANY.name}</div>
          )}
          <div style={{ fontSize: 26, color: COLOR.muted }}>{HERO.eyebrow}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 92, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.04 }}>{HERO.title}</div>
          <div
            style={{
              fontSize: 54,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              color: COLOR.muted,
              maxWidth: 720,
            }}
          >
            {HERO.titleSecondLine}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            borderTop: `2px solid ${COLOR.line}`,
            paddingTop: 28,
          }}
        >
          <div style={{ display: 'flex', gap: 56 }}>
            {stats.map((stat) => (
              <div key={stat.factId} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 44, fontWeight: 600, letterSpacing: '-0.02em' }}>{stat.value}</div>
                <div style={{ fontSize: 22, color: COLOR.muted }}>{stat.label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 24, color: COLOR.muted }}>{domain}</div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length > 0 ? fonts : undefined },
  );
}
