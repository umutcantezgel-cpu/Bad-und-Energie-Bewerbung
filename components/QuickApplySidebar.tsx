'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  MessageSquare,
  PhoneCall,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp-utils';

export function QuickApplySidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const whatsappUrl = buildWhatsAppUrl(
    'Hallo Herr Demir, ich interessiere mich für eine Stelle als SHK Fachkraft bei Bad und Energie.'
  );

  return (
    <aside
      aria-label="Schnellbewerbung und Direktkontakt"
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end no-print select-none"
    >
      <AnimatePresence mode="wait">
        {isCollapsed ? (
          /* COLLAPSED STATE: Sleek Vertical Floating Tab */
          <motion.button
            key="collapsed-tab"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsCollapsed(false)}
            className="group flex items-center gap-2 py-4 px-2.5 bg-white/95 hover:bg-white backdrop-blur-2xl border-l-2 border-t border-b border-[#C51E1E]/80 shadow-[0_8px_32px_rgba(10,30,58,0.12)] rounded-l-2xl text-slate-800 transition-all cursor-pointer hover:shadow-xl"
            title="Expressbewerbung und WhatsApp öffnen"
            aria-label="Schnellbewerbung • WhatsApp öffnen"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <ChevronLeft
                className="w-4 h-4 text-[#C51E1E] group-hover:-translate-x-0.5 transition-transform"
                strokeWidth={1.5}
              />
              <span
                className="text-[11px] font-bold tracking-wider text-[#0A1E3A] uppercase [writing-mode:vertical-rl] rotate-180"
                style={{ textOrientation: 'mixed' }}
              >
                Schnellbewerbung • WhatsApp
              </span>
              <div className="w-6 h-6 rounded-full bg-red-50 text-[#C51E1E] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
              </div>
            </div>
          </motion.button>
        ) : (
          /* EXPANDED STATE: High-Converting Frosted Sidebar Dock */
          <motion.div
            key="expanded-card"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-72 bg-white/95 backdrop-blur-2xl border-l-2 border-t border-b border-slate-200/90 shadow-[0_12px_40px_rgba(10,30,58,0.14)] rounded-l-3xl p-4.5 space-y-4"
          >
            {/* Header with Live Status & Collapse Trigger */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  3 Stellen offen · Wetzlar
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Leiste einklappen"
                aria-label="Leiste einklappen"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Quick Pitch */}
            <div className="space-y-0.5">
              <div className="text-sm font-extrabold text-[#0A1E3A] tracking-tight">
                Schnellbewerbung
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                In 60 Sekunden ohne Lebenslauf &amp; Anschreiben.
              </p>
            </div>

            {/* CTA 1: Expressbewerbung (Primary Red Gradient) */}
            <Link
              href="/#express-funnel"
              className="group w-full p-3 rounded-2xl bg-gradient-to-r from-[#C51E1E] to-[#DC2626] hover:from-[#B01717] hover:to-[#C51E1E] text-white shadow-[0_4px_16px_rgba(197,30,30,0.3)] hover:shadow-[0_6px_22px_rgba(197,30,30,0.4)] flex items-center justify-between transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-extrabold text-white leading-tight">
                    Expressbewerbung
                  </span>
                  <span className="block text-[10px] text-red-100 font-mono">
                    In 60 Sekunden ohne Lebenslauf
                  </span>
                </div>
              </div>
              <ArrowRight
                className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform"
                strokeWidth={1.5}
              />
            </Link>

            {/* CTA 2: WhatsApp Direktkontakt */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200 text-emerald-950 flex items-center justify-between transition-colors cursor-pointer"
              title="Direkter WhatsApp Chat mit Geschäftsführer Sabri Demir"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold text-emerald-950 leading-tight">
                    WhatsApp Chat
                  </span>
                  <span className="block text-[10px] text-emerald-700">
                    Direkt mit Sabri Demir
                  </span>
                </div>
              </div>
              <ArrowRight
                className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform"
                strokeWidth={1.5}
              />
            </a>

            {/* CTA 3: Telefon Direktruf */}
            <a
              href="tel:0644142956"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-slate-700">
                <PhoneCall className="w-3.5 h-3.5 text-[#0A1E3A]" strokeWidth={1.5} />
                <span>(06441) 42956</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Montag bis Freitag</span>
            </a>

            {/* Trust & Discretion Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={1.5} />
              <span>100% diskret nach Paragraph 26 BDSG</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
