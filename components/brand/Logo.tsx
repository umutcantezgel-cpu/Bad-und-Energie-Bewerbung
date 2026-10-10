import Image from 'next/image';
import { cn } from '@/lib/utils/cn';
import logo from '@/public/images/bad-energie-lahn-dill-logo-transparent.webp';

export interface LogoProps {
  /** sm 32px (mobile header) · md 40px tall; the width follows the file's 662×121 ratio. */
  size?: 'sm' | 'md';
  /**
   * Load right away (header, above the fold), but without competing with CSS and fonts: the logo is never
   * the LCP element. Low fetch priority, so React emits no image preload either (it preloads every
   * image that is neither lazy nor low priority).
   */
  eager?: boolean;
  /** Classes for the image (height, object-fit); the plaque around it follows. */
  className?: string;
}

const HEIGHT = { sm: 32, md: 40 } as const;
const HEIGHT_CLASS = { sm: 'h-8', md: 'h-10' } as const;

/**
 * Raster wordmark, always the unchanged original file (G8 „Unantastbar“: the logo's final state
 * matches the original exactly). The file has navy and red artwork on transparency and no
 * light-on-dark variant exists, so in the dark theme and in the inverse band the original sits on a
 * light plaque (`bg-plakette`: Papier, radius 4, 4px padding; transparent in the light theme and in
 * print) instead of being recolored by brightness/invert filters (KERN K-006: Navy and Rot are the
 * logo's colors and stay visible). The SVG files in public/images show a different emblem with
 * system-font text, so they are not used.
 *
 * Header, menu and footer keep the same size, so they share one file per pixel density (one download).
 */
export function Logo({ size = 'md', eager = false, className }: LogoProps) {
  return (
    <span data-logo-plakette="" className="inline-flex min-w-0 max-w-full shrink items-center rounded-1 bg-plakette p-1">
      <Image
        src={logo}
        alt="Bad und Energie GmbH Lahn Dill"
        height={HEIGHT[size]}
        loading={eager ? 'eager' : undefined}
        fetchPriority={eager ? 'low' : undefined}
        className={cn('w-auto select-none', HEIGHT_CLASS[size], className)}
      />
    </span>
  );
}
