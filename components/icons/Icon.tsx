import type { SVGProps } from 'react';
import { renderGlyph, type IconName } from './glyphs';

/** sm 16 · md 20 · lg 24 · xl 36 px; Zahlen gelten als px. className (size-*) geht vor. */
const SIZE = { sm: 16, md: 20, lg: 24, xl: 36 } as const;

/**
 * Glyphen, die auch bei 16 px (sm) lesbar bleiben. Der Strich ist bei jeder Größe 3 px; bei 16 px liegen
 * Linien mit 5 Rastereinheiten Abstand nur noch 0,3 px auseinander (Menü, Drucker, Datei, Kalender,
 * Geldschein, Wärmepumpe …) und laufen zu; im Kreis mit Ausrufezeichen verschmilzt der Punkt mit dem
 * Ring. Belegt im Kontaktbogen 16/20/24 px (_relaunch/belege/r2-fundament-r2/icons-kontaktbogen-dpr1.webp
 * und -dpr2.webp). Alle anderen ab md; die Familien-Icons sind für 24 px gezeichnet.
 */
export const KLEIN_LESBAR = [
  'arrow-right',
  'arrow-left',
  'arrow-down',
  'arrow-up',
  'chevron-right',
  'chevron-left',
  'chevron-down',
  'check',
  'x',
  'plus',
  'phone',
  'message-circle',
  'circle-check',
  'rotate-ccw',
  'rotate-cw',
  'uhr',
  'mail',
  'nachricht',
  'shield-check',
  'user-plus',
  'werkzeug',
] as const satisfies readonly IconName[];

export type KleinIconName = (typeof KLEIN_LESBAR)[number];

const KLEIN = new Set<IconName>(KLEIN_LESBAR);

export type IconSize = keyof typeof SIZE | number;

/** sm nur für Glyphen aus KLEIN_LESBAR (Typprüfung); dichte Glyphen beginnen bei md. */
export type IconSizeFor<N extends IconName> = N extends KleinIconName ? IconSize : Exclude<IconSize, 'sm'>;

export interface IconProps<N extends IconName = IconName>
  extends Omit<SVGProps<SVGSVGElement>, 'children' | 'name' | 'viewBox'> {
  name: N;
  size?: IconSizeFor<N>;
  /** Bedeutungstragend: Titel als zugänglicher Name (role="img"). Ohne Titel ist das Icon dekorativ. */
  title?: string;
}

/** Pixelgröße einer Stufe; sm an einer dichten Glyphe (an der Typprüfung vorbei) wird md. */
export function iconPx(name: IconName, size: IconSize = 'lg'): number {
  if (typeof size === 'number') return size;
  return SIZE[size === 'sm' && !KLEIN.has(name) ? 'md' : size];
}

/**
 * Icon der eigenen Familie (KERN K-010, ersetzt lucide-react). Server-Komponente ohne Zustand.
 * Strich 3 px (--m-strich) unabhängig von der Größe, runde Enden, Farbe aus currentColor.
 * overflow: visible, weil die runden Enden am Rand 2 bei 16 px 0,17 px über die Box ragen
 * (Kappe 1,5 px = 2,25 Rastereinheiten) und sonst abgeschnitten würden.
 */
export function Icon<N extends IconName>({ name, size = 'lg', title, style, ...rest }: IconProps<N>) {
  const px = iconPx(name, size);
  const a11y = title ? { role: 'img' as const } : { 'aria-hidden': true as const };
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={px}
      height={px}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      data-icon={name}
      {...a11y}
      {...rest}
      style={{ strokeWidth: 'var(--m-strich, 3px)', flexShrink: 0, overflow: 'visible', ...style }}
    >
      {title ? <title>{title}</title> : null}
      {renderGlyph(name)}
    </svg>
  );
}
