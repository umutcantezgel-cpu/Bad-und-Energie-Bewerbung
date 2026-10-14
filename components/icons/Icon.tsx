import type { SVGProps } from 'react';
import { renderGlyph, type IconName } from './glyphs';

/** sm 16 · md 20 · lg 24 · xl 36 px; Zahlen gelten als px. className (size-*) geht vor. */
const SIZE = { sm: 16, md: 20, lg: 24, xl: 36 } as const;

/**
 * Glyphen, die auch bei 16 px (sm) lesbar bleiben. Belegt ist die Liste im Kontaktbogen 16/20/24 px mit dem
 * 3-px-Strich (_relaunch/belege/r2-fundament-r2/icons-kontaktbogen-dpr1.webp und -dpr2.webp): bei 16 px liefen
 * Linien mit 5 Rastereinheiten Abstand zu (Menü, Drucker, Datei, Kalender, Geldschein, Wärmepumpe …). Seit E-029 ist
 * der Strich 2 px (--m-icon); die Liste bleibt die vorsichtige Auswahl, bis ein neuer Kontaktbogen sie erweitert.
 * Alle anderen ab md; die Familien-Icons sind für 24 px gezeichnet.
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
 * Linienart `icon` (E-029): Strich 2 px (--m-icon) unabhängig von der Größe, runde Enden (die einzigen runden Enden
 * des Formsystems: Bedienzeichen), Farbe aus currentColor. overflow: visible, damit eine runde Kappe am Rand 2 bei
 * 16 px nie abgeschnitten wird.
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
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      data-icon={name}
      {...a11y}
      {...rest}
      style={{ strokeWidth: 'var(--m-icon, 2px)', flexShrink: 0, overflow: 'visible', ...style }}
    >
      {title ? <title>{title}</title> : null}
      {renderGlyph(name)}
    </svg>
  );
}
