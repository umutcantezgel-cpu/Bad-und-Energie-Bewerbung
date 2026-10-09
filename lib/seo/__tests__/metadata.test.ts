import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { generatePageMetadata } from '../metadata';
import { DEFAULT_OG_IMAGE, type OgImage } from '../og-image';

const ROOT = path.resolve(__dirname, '../../..');
const base = { title: 'Titel', description: 'Beschreibung' };

function ogOf(meta: ReturnType<typeof generatePageMetadata>) {
  return meta.openGraph as { images?: unknown } & Record<string, unknown>;
}

function twitterOf(meta: ReturnType<typeof generatePageMetadata>) {
  return meta.twitter as { images?: unknown; card?: string } & Record<string, unknown>;
}

function findImageFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : findImageFiles(full);
    return /^(opengraph|twitter)-image\.(tsx|ts|jsx|js|png|jpg|jpeg|gif)$/.test(entry.name)
      ? [path.relative(ROOT, full).split(path.sep).join('/')]
      : [];
  });
}

describe('generatePageMetadata: share image', () => {
  // A page's openGraph/twitter object replaces the layout's (Next merges one level deep),
  // so every page without its own image file has to link the root image itself.
  it.each(['/jobs', '/bewerbung', '/bewerbung/danke', '/bewerbung/mappe', '/datenschutz', '/impressum'])(
    '%s links the root image for og:image and twitter:image',
    (pagePath) => {
      const meta = generatePageMetadata({ ...base, path: pagePath, type: pagePath === '/datenschutz' ? 'legal' : 'default' });
      expect(ogOf(meta).images).toEqual([DEFAULT_OG_IMAGE]);
      expect(twitterOf(meta).images).toEqual([DEFAULT_OG_IMAGE]);
      expect(twitterOf(meta).card).toBe('summary_large_image');
    },
  );

  it('uses separate arrays for Open Graph and Twitter', () => {
    const meta = generatePageMetadata({ ...base, path: '/jobs' });
    expect(ogOf(meta).images).not.toBe(twitterOf(meta).images);
  });

  // Next uses a segment's image file only if the page's metadata has no `images` key at all.
  it('leaves the key out on "/", so app/opengraph-image (with its cache-busting hash) applies', () => {
    const meta = generatePageMetadata({ ...base, path: '/' });
    expect(Object.hasOwn(ogOf(meta), 'images')).toBe(false);
    expect(Object.hasOwn(twitterOf(meta), 'images')).toBe(false);
  });

  it("leaves the key out for ogImage: 'file'", () => {
    const meta = generatePageMetadata({ ...base, path: '/lp/test', ogImage: 'file' });
    expect(Object.hasOwn(ogOf(meta), 'images')).toBe(false);
    expect(Object.hasOwn(twitterOf(meta), 'images')).toBe(false);
  });

  it('passes an explicit image through, alt included', () => {
    const image: OgImage = { url: '/jobs/x/opengraph-image?v=1', width: 1200, height: 630, alt: 'Stelle X' };
    const meta = generatePageMetadata({ ...base, path: '/jobs/x', ogImage: image });
    expect(ogOf(meta).images).toEqual([image]);
    expect(twitterOf(meta).images).toEqual([image]);
  });

  it('the default points at app/opengraph-image', () => {
    expect(DEFAULT_OG_IMAGE).toMatchObject({ url: '/opengraph-image', width: 1200, height: 630 });
    expect(DEFAULT_OG_IMAGE.alt.length).toBeGreaterThan(10);
    expect(existsSync(path.join(ROOT, 'app/opengraph-image.tsx'))).toBe(true);
  });

  // A new image file needs a decision in its page: ogImage 'file' or an explicit image.
  it('knows every image file under app/', () => {
    expect(findImageFiles(path.join(ROOT, 'app')).sort()).toEqual([
      'app/jobs/[slug]/opengraph-image.tsx',
      'app/opengraph-image.tsx',
    ]);
  });
});
