import { HERO, HERO_STATS } from '@/components/home/content';
import { DEFAULT_OG_IMAGE, OG_COLOR, OG_IMAGE_SIZE, OG_IMAGE_TYPE } from '@/lib/seo/og-image';
import { renderOgImage } from '@/lib/seo/og-render';
import { SITE_CONFIG } from '@/lib/seo/site-config';

/**
 * Default share image: the home page and, linked explicitly by generatePageMetadata, every page
 * without its own image. Frame, fonts and logo come from lib/seo/og-render.
 */
export const alt = DEFAULT_OG_IMAGE.alt;
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_TYPE;

const domain = SITE_CONFIG.baseUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
const stats = HERO_STATS.slice(0, 3);

export default async function OpengraphImage() {
  return renderOgImage({
    main: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 92, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.04 }}>{HERO.title}</div>
        <div
          style={{
            fontSize: 54,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            color: OG_COLOR.muted,
            maxWidth: 720,
          }}
        >
          {HERO.titleSecondLine}
        </div>
      </div>
    ),
    footer: (
      <div style={{ display: 'flex', gap: 56 }}>
        {stats.map((stat) => (
          <div key={stat.factId} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 44, fontWeight: 600, letterSpacing: '-0.02em' }}>{stat.value}</div>
            <div style={{ fontSize: 22, color: OG_COLOR.muted }}>{stat.label}</div>
          </div>
        ))}
      </div>
    ),
    aside: domain,
    texts: [HERO.title, HERO.titleSecondLine, ...stats.flatMap((stat) => [stat.value, stat.label])],
  });
}
