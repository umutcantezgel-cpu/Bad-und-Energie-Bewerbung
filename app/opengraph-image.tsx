import { DEFAULT_OG_IMAGE, OG_IMAGE_SIZE, OG_IMAGE_TYPE, ogHomeText } from '@/lib/seo/og-image';
import { renderHomeImage } from '@/lib/seo/og-render';

/**
 * Default share image: the home page and, linked explicitly by generatePageMetadata, every page
 * without its own image. It shows the hero of the home page: paper with h1 and the red button on the
 * left, the navy panel with the section through the house on the right (technical drawing 2.0, E-029:
 * the same geometry as the hero, lib/zeichnung/szenen/hausschnitt.ts). Frame, fonts and drawing come
 * from lib/seo/og-render, the texts from HERO and the fact registry.
 */
export const alt = DEFAULT_OG_IMAGE.alt;
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_TYPE;

export default async function OpengraphImage() {
  return renderHomeImage(ogHomeText());
}
