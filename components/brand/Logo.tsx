import Image from 'next/image';
import { cn } from '@/lib/utils/cn';
import logo from '@/public/images/bad-energie-lahn-dill-logo-transparent.webp';

export interface LogoProps {
  /** sm 32px (mobile header) · md 40px tall; the width follows the file's 662×121 ratio. */
  size?: 'sm' | 'md';
  /** Load eagerly with high fetch priority (header, above the fold). */
  priority?: boolean;
  className?: string;
}

const HEIGHT = { sm: 32, md: 40 } as const;
const HEIGHT_CLASS = { sm: 'h-8', md: 'h-10' } as const;

/**
 * Interim raster wordmark, deviating from roadmap §4 (inline SVG, text as paths,
 * currentColor) until the owner supplies a vector logo (open point in §13).
 * The SVG files in public/images show a different emblem with system-font text,
 * so they are not used. No light-on-dark variant exists (the "white-transparent"
 * file still has navy text), so dark mode and the inverse band show a flat white
 * silhouette via CSS filter; print keeps the colors.
 */
export function Logo({ size = 'md', priority = false, className }: LogoProps) {
  return (
    <Image
      src={logo}
      alt="Bad und Energie GmbH Lahn Dill"
      height={HEIGHT[size]}
      loading={priority ? 'eager' : undefined}
      fetchPriority={priority ? 'high' : undefined}
      className={cn(
        'w-auto select-none',
        HEIGHT_CLASS[size],
        'dark:brightness-0 dark:invert in-data-[tone=inverse]:brightness-0 in-data-[tone=inverse]:invert',
        'print:brightness-100 print:invert-0',
        className,
      )}
    />
  );
}
