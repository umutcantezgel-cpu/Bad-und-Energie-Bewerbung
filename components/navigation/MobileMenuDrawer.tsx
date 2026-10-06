'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import {
  MessageSquare,
  PhoneCall,
  Sparkles,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Car,
  Wrench,
} from 'lucide-react';

export interface MobileNavItem {
  href: string;
  label: string;
  sub?: string;
  badge?: string;
  badgeClass?: string;
  highlight?: boolean;
}

export interface MobileOpenRole {
  title: string;
  type: string;
  tag: string;
  href: string;
}

export interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappUrl: string;
  headerHeight: number;
  navItems: MobileNavItem[];
  openRoles: MobileOpenRole[];
}

export function MobileMenuDrawer({
  isOpen,
  onClose,
  whatsappUrl,
  headerHeight,
  navItems,
  openRoles,
}: MobileMenuDrawerProps) {
  // Prevent background scroll leakage when menu is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.03,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.22, ease: 'easeOut' },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1. Backdrop Overlay (Tap to Dismiss) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          />

          {/* 2. Full-Sheet Drawer with Native Momentum Scrolling */}
          <motion.div
            id="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobiles Navigationsmenü"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            style={{
              top: `${headerHeight}px`,
              height: `calc(100dvh - ${headerHeight}px)`,
            }}
            className="fixed inset-x-0 bottom-0 z-50 overflow-y-auto overscroll-contain bg-white/98 backdrop-blur-2xl border-t border-slate-200/90 shadow-2xl flex flex-col justify-between p-4 sm:p-6 lg:hidden touch-pan-y"
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="max-w-2xl mx-auto w-full space-y-6 pb-6"
            >
              {/* ZONE 1: TACTILE QUICK ACTION BUTTONS */}
              <motion.div variants={itemVariants} className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 px-1 block">
                  Direkter Kontakt zum Meister
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* WhatsApp Direct */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/90 hover:bg-emerald-100/90 border border-emerald-300 text-emerald-950 font-bold text-xs shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <MessageSquare className="w-4.5 h-4.5" strokeWidth={1.75} />
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-300 rounded-full border-2 border-white animate-pulse" />
                      </div>
                      <div>
                        <span className="block text-xs font-black text-emerald-950">
                          WhatsApp Chat
                        </span>
                        <span className="block text-[10px] text-emerald-800 font-medium">
                          Direkt mit Sabri Demir
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-700" strokeWidth={2} />
                  </a>

                  {/* Phone Direct */}
                  <a
                    href="tel:0644142956"
                    onClick={onClose}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-300 text-[#0A1E3A] font-bold text-xs shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#0A1E3A] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <PhoneCall className="w-4.5 h-4.5 text-sky-400" strokeWidth={1.75} />
                      </div>
                      <div>
                        <span className="block text-xs font-black text-slate-900">
                          (06441) 42956
                        </span>
                        <span className="block text-[10px] text-slate-600 font-medium">
                          Büro &amp; Werkstatt Wetzlar
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600" strokeWidth={2} />
                  </a>

                  {/* Express Apply in 60s */}
                  <Link
                    href="/#express-funnel"
                    onClick={onClose}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#C51E1E] to-[#DC2626] hover:from-[#B01717] hover:to-[#C51E1E] text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Sparkles className="w-4.5 h-4.5 text-amber-200" strokeWidth={1.75} />
                      </div>
                      <div>
                        <span className="block text-xs font-black text-white">
                          Expressbewerbung
                        </span>
                        <span className="block text-[10px] text-red-100 font-medium">
                          In 60 Sekunden ohne Lebenslauf
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white" strokeWidth={2} />
                  </Link>
                </div>
              </motion.div>

              {/* ZONE 2: LIVE MEISTER STELLENANGEBOTE */}
              <motion.div variants={itemVariants} className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600">
                    Aktuell offene Meisterstellen (3)
                  </span>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold border border-emerald-300">
                    ● Sofortiger Einstieg
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {openRoles.map((role) => (
                    <Link
                      key={role.title}
                      href={role.href}
                      onClick={onClose}
                      className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 hover:border-[#0284C7] transition-all flex items-center justify-between group active:scale-[0.99] cursor-pointer shadow-2xs"
                    >
                      <div className="space-y-1 pr-2">
                        <div className="text-xs sm:text-sm font-bold text-[#0A1E3A] group-hover:text-[#0284C7] transition-colors leading-snug">
                          {role.title}
                        </div>
                        <div className="text-[11px] text-slate-600 flex items-center gap-2 flex-wrap">
                          <span>{role.type}</span>
                          <span>•</span>
                          <span className="text-emerald-800 font-semibold">{role.tag}</span>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:border-[#0284C7] group-hover:bg-sky-50 transition-colors">
                        <ChevronRight
                          className="w-4 h-4 text-slate-500 group-hover:text-[#0284C7] group-hover:translate-x-0.5 transition-transform"
                          strokeWidth={2}
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>

              {/* ZONE 3: HAUPTNAVIGATION & EINBLICKE */}
              <motion.div variants={itemVariants} className="space-y-2 pt-2 border-t border-slate-200/80">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 px-1 block mb-1">
                  Einblicke &amp; Informationen
                </span>
                <div className="grid grid-cols-1 gap-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        item.highlight
                          ? 'bg-[#0A1E3A] text-white hover:bg-slate-800 shadow-xs'
                          : 'text-slate-800 hover:bg-slate-100 hover:text-[#0A1E3A]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded-full ${item.badgeClass}`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {item.highlight && (
                          <Sparkles className="w-3.5 h-3.5 text-sky-400" strokeWidth={1.5} />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.sub && (
                          <span
                            className={`text-[10px] font-normal ${
                              item.highlight ? 'text-slate-300' : 'text-slate-600'
                            }`}
                          >
                            {item.sub}
                          </span>
                        )}
                        <ChevronRight
                          className={`w-3.5 h-3.5 ${
                            item.highlight ? 'text-white' : 'text-slate-500'
                          }`}
                          strokeWidth={2}
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>

              {/* ZONE 4: DISCRETION GUARANTEE & CONSUMER LINK */}
              <motion.div variants={itemVariants} className="space-y-3 pt-2 border-t border-slate-200/80">
                {/* 100% Discretion Banner */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-800 flex items-start gap-3 shadow-2xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.75} />
                  <div className="text-xs leading-relaxed space-y-1">
                    <div className="font-extrabold text-[#0A1E3A]">
                      100% Vertraulichkeits-Garantie
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Bewerbung in unter 60 Sekunden ohne Anschreiben. Streng vertrauliche Behandlung nach § 26 BDSG – garantiert keine Kontaktaufnahme mit Ihrem aktuellen Arbeitgeber.
                    </div>
                  </div>
                </div>

                {/* Footer Switcher */}
                <div className="flex items-center justify-between text-[11px] text-slate-600 px-1 pt-1">
                  <span>Siegmund-Hiepe-Str. 20 · 35578 Wetzlar</span>
                  <a
                    href="https://bad-energie.de"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[#0A1E3A] hover:underline"
                  >
                    <span>Kunden-Website</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
