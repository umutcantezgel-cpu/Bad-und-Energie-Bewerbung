'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface LogoProps {
  className?: string;
  variant?: 'default' | 'dark' | 'on-navy' | 'light' | 'print' | 'transparent';
  framing?: 'card' | 'badge' | 'minimal' | 'none' | 'auto';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'responsive';
  withLink?: boolean;
  priority?: boolean;
  showTagline?: boolean;
  withGeoBadge?: boolean;
}

export function Logo({
  className = '',
  variant = 'default',
  framing = 'auto',
  size = 'responsive',
  withLink = true,
  priority = false,
  showTagline = false,
  withGeoBadge = false,
}: LogoProps) {
  // Height classes calibrated to preserve the exact natural aspect ratio (662:121 = 5.47:1)
  const sizeClasses = {
    xs: 'h-6 sm:h-7 w-auto',
    sm: 'h-7 sm:h-8 md:h-9 w-auto',
    md: 'h-8 sm:h-10 md:h-11 w-auto',
    lg: 'h-11 sm:h-13 md:h-14 w-auto',
    responsive: 'h-7 sm:h-8 md:h-9 lg:h-10 w-auto',
  };

  const isDarkSurface = variant === 'on-navy' || variant === 'light';
  const isPrint = variant === 'print';
  const isTransparent = variant === 'transparent';

  // Single Source of Truth logo asset:
  // - Clean anti-aliased transparent cut: /images/bad-energie-lahn-dill-logo-transparent.webp (662x121)
  // - High-DPI 2x Retina original: /images/bad-energie-lahn-dill-logo@2x.webp
  const logoSrc = isTransparent
    ? '/images/bad-energie-lahn-dill-logo-transparent.webp'
    : '/images/bad-energie-lahn-dill-logo@2x.webp';

  // Determine frame styling:
  // - When variant is 'transparent' or 'print', or framing is explicitly 'none', render completely unframed
  //   so the logo stands stable, clean, and authentic on any background without boxed outlines.
  const effectiveFraming = framing === 'auto' ? (isPrint || isTransparent ? 'none' : 'card') : framing;

  let frameClasses = '';
  if (effectiveFraming === 'card') {
    if (isDarkSurface) {
      frameClasses =
        'bg-white rounded-2xl px-3.5 py-1.5 sm:px-4 sm:py-2 border border-white/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.22),0_1.5px_0_0_rgba(255,255,255,1)_inset] ring-1 ring-slate-900/10 hover:shadow-lg transition-all duration-200';
    } else {
      frameClasses =
        'bg-white/95 backdrop-blur-md rounded-2xl px-3 py-1.5 sm:px-3.5 sm:py-2 border border-white/80 shadow-[0_2px_12px_-2px_rgba(10,30,58,0.06),0_1px_0_0_rgba(255,255,255,0.9)_inset] ring-1 ring-slate-900/5 hover:bg-white hover:shadow-md transition-all duration-200';
    }
  } else if (effectiveFraming === 'badge') {
    frameClasses =
      'bg-white rounded-xl px-2.5 py-1 border border-slate-200/80 shadow-2xs';
  } else if (effectiveFraming === 'minimal') {
    frameClasses = 'bg-white/80 rounded-lg p-1';
  } else {
    frameClasses = '';
  }

  const imageElement = (
    <div
      className={`inline-flex items-center gap-3 select-none ${frameClasses} ${className}`}
      itemScope
      itemType="https://schema.org/Organization"
    >
      {/* Schema.org SEO & GEO Semantic Meta Elements */}
      <meta itemProp="name" content="Bad und Energie GmbH Lahn Dill" />
      <meta itemProp="legalName" content="Bad und Energie GmbH Lahn Dill" />
      <meta
        itemProp="description"
        content="Innungsmeisterbetrieb seit 1926 für Sanitär, Heizung, Wärmepumpen und Haustechnik in Wetzlar und dem Lahn Dill Kreis."
      />
      <meta itemProp="telephone" content="+49-6441-42956" />
      <meta itemProp="email" content="info@bad-energie.de" />
      <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress" className="hidden">
        <span itemProp="streetAddress">Siegmund Hiepe Str. 20</span>
        <span itemProp="postalCode">35578</span>
        <span itemProp="addressLocality">Wetzlar</span>
        <span itemProp="addressRegion">Hessen</span>
        <span itemProp="addressCountry">DE</span>
      </div>

      <div className="relative inline-flex items-center">
        <Image
          src={logoSrc}
          alt="Bad und Energie GmbH Lahn Dill • Meisterbetrieb für Sanitär Heizung und Wärmepumpen Wetzlar"
          title="Bad und Energie GmbH Lahn Dill • Meisterbetrieb seit 1926 Wetzlar"
          width={662}
          height={121}
          priority={priority}
          sizes="(max-width: 640px) 140px, (max-width: 1024px) 180px, 240px"
          quality={75}
          itemProp="logo"
          decoding={priority ? 'sync' : 'async'}
          className={`${sizeClasses[size]} object-contain`}
          referrerPolicy="no-referrer"
        />
      </div>

      {(showTagline || withGeoBadge) && (
        <div className="hidden sm:flex flex-col justify-center text-left leading-tight pl-0.5 border-l border-slate-200/70 ml-1">
          {withGeoBadge && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold tracking-wider text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0369a1]" />
              Wetzlar und Lahn Dill • Seit 1926
            </span>
          )}
          {showTagline && (
            <span className="text-[11px] font-medium text-slate-500">
              Meisterbetrieb für SHK &amp; Wärmepumpen
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (withLink) {
    return (
      <Link
        href="/"
        className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369a1] rounded-2xl transition-all duration-150 hover:opacity-98 active:scale-[0.99] group"
        aria-label="Bad und Energie GmbH Lahn Dill Zur Startseite des Karriereportals Wetzlar"
      >
        {imageElement}
      </Link>
    );
  }

  return imageElement;
}
