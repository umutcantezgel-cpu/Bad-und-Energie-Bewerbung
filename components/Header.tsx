'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Wrench,
  MessageSquare,
  PhoneCall,
  ArrowUpRight,
  Sparkles,
  Phone,
  Clock,
  ArrowRight,
  Menu,
  X,
  Car,
  ChevronRight,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp-utils';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const whatsappUrl = buildWhatsAppUrl(
    'Hallo Herr Demir, ich interessiere mich für eine Stelle als SHK Fachkraft bei Bad und Energie.'
  );

  // Scroll detection for dynamic sticky compression & enhanced backdrop blur
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    {
      href: '/#stellen',
      label: 'Offene Stellen',
      sub: '3 Stellenangebote',
      badge: '3',
      badgeClass: 'bg-[#C51E1E] text-white',
    },
    {
      href: '/#ausstattung',
      label: 'Werkzeug und Fuhrpark',
      sub: 'Hilti und Sortimo',
    },
    {
      href: '/#benefits',
      label: 'Vorteile & Benefits',
      sub: '30 Tage Urlaub • Freitag ab 13:30 Uhr frei',
    },
    {
      href: '/#wechsel-prozess',
      label: 'Wechselprozess',
      sub: '100 Prozent diskret',
    },
    {
      href: '/bewerbung',
      label: 'Bewerberportal',
      sub: 'Vier Wege ohne Lebenslauf',
      highlight: true,
    },
  ];

  const openRoles = [
    {
      title: 'Anlagenmechaniker für Sanitär Heizung und Klimatechnik m w d',
      type: 'Vollzeitbeschäftigung • Attraktive & übertarifliche Vergütung',
      tag: 'Wetzlar und Lahn Dill Kreis',
      href: '/bewerbung',
    },
    {
      title: 'Kundendiensttechniker für Wärmepumpen m w d',
      type: 'Bosch und Brötje Werkszertifizierung • Eigenes Servicefahrzeug',
      tag: 'Regionale Einsätze vor Ort',
      href: '/bewerbung',
    },
    {
      title: 'Ausbildung zum Anlagenmechaniker SHK 2026',
      type: 'Ausbildungsstart August 2026 • Überdurchschnittliche Vergütung',
      tag: 'Feste Übernahmegarantie',
      href: '/bewerbung',
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* Skip-to-content accessibility link (WAI-ARIA) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#0A1E3A] focus:text-white focus:rounded-xl focus:shadow-xl focus:font-bold focus:text-xs outline-none ring-2 ring-[#0284C7]"
      >
        Direkt zum Inhalt springen
      </a>

      {/* 1. TOP UTILITY TRUST-BAR (Vollständiger oberer Bereich über die gesamte Breite) */}
      <div className="w-full bg-slate-100/90 text-slate-700 border-b border-slate-200/80 text-[11px] font-medium tracking-wide">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 min-h-[34px] flex items-center justify-between gap-3 sm:gap-6">
          {/* Linke Seite: Meisterbetrieb-Qualitätssiegel, Region & Live Stellenstatus */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap min-w-0">
            {/* Meisterbetrieb seit 1926 & Wetzlar und Mittelhessen ausgeschrieben */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#0A1E3A] text-white text-[10px] font-bold tracking-tight shadow-2xs">
                <ShieldCheck className="w-3 h-3 text-sky-400" strokeWidth={2} />
                <span>Meisterbetrieb seit 1926</span>
              </span>
              <span className="font-semibold text-slate-800 text-[11px]">
                Wetzlar und Mittelhessen
              </span>
            </div>

            <div className="h-3.5 w-px bg-slate-300 hidden md:block" />

            {/* Live Status: 3 offene Stellenangebote */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-bold text-emerald-800">
                Aktuell 3 offene Stellenangebote
              </span>
              <span className="text-slate-500 hidden lg:inline">
                (Wetzlar und Lahn Dill Kreis • Umkreis maximal 35 km)
              </span>
            </div>

            <div className="h-3.5 w-px bg-slate-300 hidden xl:block" />

            {/* 100% vertrauliche Kontaktaufnahme */}
            <div className="hidden xl:flex items-center gap-1.5 text-slate-600 truncate">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={1.5} />
              <span className="truncate">
                100 Prozent vertrauliche Kontaktaufnahme, kein Anruf beim aktuellen Arbeitgeber
              </span>
            </div>
          </div>

          {/* Rechte Seite: WhatsApp Direktlinie & Wechsel zur Kunden-Website */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* WhatsApp Direct Line */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 transition-colors"
              title="Direkter WhatsApp Chat mit Geschäftsführer Diplomingenieur Sabri Demir"
            >
              <MessageSquare className="w-3 h-3 text-emerald-600" strokeWidth={1.5} />
              <span className="font-bold">WhatsApp:</span>
              <span className="text-emerald-800 hidden md:inline">Direkt mit Sabri Demir schreiben</span>
              <span className="text-emerald-800 md:hidden">Sabri Demir</span>
            </a>

            <div className="h-3.5 w-px bg-slate-300 hidden md:block" />

            {/* Switch to Consumer Website */}
            <a
              href="https://bad-energie.de"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1 text-slate-500 hover:text-[#0A1E3A] transition-colors group"
            >
              <span>Zur Kunden Website für Bad und Heizung</span>
              <ArrowUpRight
                className="w-3 h-3 text-slate-400 group-hover:text-[#0A1E3A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                strokeWidth={1.5}
              />
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN STICKY NAVIGATION BAR (Apple Frosted Dock / 0px Overflow Guaranteed) */}
      <nav
        role="navigation"
        aria-label="Hauptnavigation Karriere"
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/94 backdrop-blur-2xl border-b border-slate-200/90 shadow-[0_8px_30px_rgba(10,30,58,0.06)] py-2 sm:py-2.5'
            : 'bg-white/88 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_4px_24px_rgba(10,30,58,0.04)] py-2.5 sm:py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 lg:gap-6">
            {/* Left: Standalone Transparent Brand Signature */}
            <div className="flex items-center shrink-0">
              <Link
                href="/"
                className="group flex items-center focus:outline-none"
                aria-label="Bad und Energie GmbH Lahn Dill Startseite Karriere"
              >
                <div className="shrink-0 transition-transform duration-200 group-hover:scale-[1.01]">
                  <Logo
                    priority
                    variant="transparent"
                    framing="none"
                    size="responsive"
                    withLink={false}
                  />
                </div>
              </Link>
            </div>

            {/* Center: Apple-styled Frosted Navigation Dock */}
            <div className="hidden lg:flex items-center apple-nav-dock px-3 py-1.5 rounded-full text-xs font-semibold">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href === '/#stellen' && pathname === '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-3 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1.5 ${
                      item.highlight
                        ? 'bg-[#0A1E3A] text-white hover:bg-slate-800 shadow-2xs font-bold'
                        : isActive
                        ? 'bg-slate-100/90 text-[#0A1E3A] font-bold'
                        : 'text-slate-700 hover:text-[#0A1E3A] hover:bg-slate-100/70 font-medium'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded-full ${item.badgeClass}`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.highlight && (
                      <Sparkles className="w-3 h-3 text-sky-400" strokeWidth={1.5} />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right: Streamlined Conversion Cluster */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Secondary Phone Button with Desktop Tooltip */}
              <div className="relative group hidden sm:block">
                <a
                  href="tel:0644142956"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 hover:bg-slate-200/80 text-slate-800 text-xs font-bold transition-colors border border-slate-200/80 cursor-pointer shadow-2xs apple-press"
                  aria-label="Telefonisch bewerben oder nachfragen unter (06441) 42956"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#0A1E3A]" strokeWidth={1.5} />
                  <span>(06441) 42956</span>
                </a>

                {/* Desktop Hover Tooltip */}
                <div className="absolute right-0 top-full mt-2 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
                  <div className="bg-[#0A1E3A] text-white text-[11px] py-2 px-3.5 rounded-xl shadow-2xl whitespace-nowrap border border-white/10 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                      <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Montag bis Donnerstag von 07:00 bis 16:45 Uhr, Freitag bis 13:30 Uhr</span>
                    </div>
                    <div className="text-slate-300 text-[10px]">
                      Direkter persönlicher Draht zur Werkstattleitung Wetzlar
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary High-End CTA: Button-in-Button Architecture */}
              <Link
                href="/#express-funnel"
                className="group inline-flex items-center gap-2 pl-3 sm:pl-4 pr-1.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#C51E1E] to-[#DC2626] hover:from-[#B01717] hover:to-[#C51E1E] shadow-[0_4px_18px_rgba(197,30,30,0.3)] hover:shadow-[0_6px_24px_rgba(197,30,30,0.45)] apple-press cursor-pointer"
              >
                <span className="font-extrabold tracking-tight hidden sm:inline">Expressbewerbung</span>
                <span className="font-extrabold tracking-tight sm:hidden">Express</span>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:translate-x-0.5 transition-all">
                  <ArrowRight className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                </div>
              </Link>

              {/* Mobile Menu Trigger Hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-drawer"
                aria-label={mobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-slate-900" strokeWidth={1.5} />
                ) : (
                  <Menu className="w-6 h-6 text-slate-900" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 3. MOBILE NAVIGATION EXPERIENCE (Tailored for Handwerker on Smartphones) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="lg:hidden overflow-hidden bg-white/95 backdrop-blur-2xl border-b border-slate-200/90 shadow-2xl"
          >
            <div className="max-w-7xl mx-auto px-4 py-5 space-y-5">
              {/* Quick-Access Conversion Buttons for Handwerker on Smartphone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. WhatsApp Chat Direct */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold text-xs shadow-2xs hover:bg-emerald-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <div>
                      <span className="block text-xs font-extrabold text-emerald-950">
                        WhatsApp Chat
                      </span>
                      <span className="block text-[10px] text-emerald-700 font-normal">
                        Direkt mit Sabri Demir
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.5} />
                </a>

                {/* 2. Direct Phone Call */}
                <a
                  href="tel:0644142956"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-100/90 border border-slate-200 text-[#0A1E3A] font-bold text-xs shadow-2xs hover:bg-slate-200/70 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#0A1E3A] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <PhoneCall className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <div>
                      <span className="block text-xs font-extrabold text-slate-900">
                        Direkt anrufen
                      </span>
                      <span className="block text-[10px] text-slate-500 font-normal">
                        (06441) 42956 Wetzlar
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.5} />
                </a>

                {/* 3. Expressbewerbung ohne Lebenslauf */}
                <Link
                  href="/#express-funnel"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#C51E1E] to-[#DC2626] text-white font-bold text-xs shadow-sm hover:opacity-95 transition-opacity"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <div>
                      <span className="block text-xs font-extrabold text-white">
                        Expressbewerbung
                      </span>
                      <span className="block text-[10px] text-red-100 font-normal">
                        Ohne Lebenslauf in 60 Sekunden
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
                </Link>
              </div>

              {/* Clean List of Current Roles */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Aktuell offene Stellen (3)
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                    Wetzlar und Lahn Dill
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {openRoles.map((role) => (
                    <Link
                      key={role.title}
                      href={role.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 hover:border-[#0284C7] transition-all flex items-center justify-between group"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-[#0284C7] transition-colors">
                          {role.title}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{role.type}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-medium">{role.tag}</span>
                        </div>
                      </div>
                      <ChevronRight
                        className="w-4 h-4 text-slate-400 group-hover:text-[#0284C7] group-hover:translate-x-0.5 transition-transform"
                        strokeWidth={1.5}
                      />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Menu Navigation Links */}
              <div className="space-y-1 pt-1 border-t border-slate-200/80">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 px-1 block mb-2">
                  Bereiche &amp; Einblicke
                </span>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100 hover:text-[#0A1E3A] transition-colors"
                  >
                    <span>{item.label}</span>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${item.badgeClass}`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {item.sub && (
                        <span className="text-[10px] font-normal text-slate-500">
                          {item.sub}
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Reassurance & Discretion Banner - Light Luxury Style */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-800 flex items-start gap-3 shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div className="text-xs leading-relaxed space-y-1">
                  <div className="font-bold text-[#0A1E3A]">
                    Bewerbung in unter 60 Sekunden · Kein Anschreiben und kein Lebenslauf nötig.
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Streng vertrauliche Behandlung nach Paragraph 26 Bundesdatenschutzgesetz (§ 26 BDSG). Keine Kontaktaufnahme mit Ihrem derzeitigen Arbeitgeber.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
