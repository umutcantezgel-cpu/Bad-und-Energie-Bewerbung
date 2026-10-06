import React from 'react';
import Link from 'next/link';
import {
  Wrench,
  ArrowLeft,
  Sparkles,
  PhoneCall,
  MessageSquare,
  Compass,
} from 'lucide-react';
import { SITE_CONFIG } from '@/lib/seo/site-config';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp-utils';

export const metadata = {
  title: 'Seite nicht gefunden (404) | Bad und Energie GmbH Lahn Dill',
  description: 'Die gewünschte Karriereseite konnte leider nicht gefunden werden. Nutzen Sie unsere Direktnavigation zu offenen Stellen oder der Bewerbung in Wetzlar.',
};

export default function NotFound() {
  const whatsappUrl = buildWhatsAppUrl(
    'Hallo Herr Demir, ich hatte einen Fehler auf der Karriereseite und melde mich direkt bei Ihnen.'
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-2xl w-full text-center">
        {/* Badge & Icon */}
        <div className="inline-flex items-center justify-center p-4 bg-red-50 border border-red-100 rounded-3xl mb-6 shadow-sm">
          <div className="relative">
            <Wrench className="w-12 h-12 text-[#C51E1E] transform -rotate-12" strokeWidth={1.5} />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#C51E1E]" />
            </span>
          </div>
        </div>

        {/* 404 Code & Main Title */}
        <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-mono font-bold uppercase tracking-wider mb-3">
          Fehlercode 404 • Nicht Gefunden
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0A1E3A] tracking-tight mb-4">
          Hier hat sich wohl eine Rohrleitung verirrt
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-lg mx-auto leading-relaxed mb-8">
          Die aufgerufene Unterseite existiert nicht oder wurde umgezogen. Unsere offenen Stellen in Wetzlar und das Bewerberportal stehen Dir jedoch weiterhin offen.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[#C51E1E] to-[#DC2626] hover:from-[#B01717] hover:to-[#C51E1E] shadow-lg shadow-red-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            <span>Zurück zur Startseite</span>
          </Link>

          <Link
            href="/bewerbung"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold text-[#0A1E3A] bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#0284C7]" strokeWidth={2} />
            <span>4 Wege Bewerberportal</span>
          </Link>

          <Link
            href="/#stellen"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4 text-slate-600" strokeWidth={1.5} />
            <span>Offene Stellen ansehen</span>
          </Link>
        </div>

        {/* Direct Contact Card for Stranded Users */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm max-w-lg mx-auto text-left">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Schneller Direktkontakt
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
              <span>WhatsApp an Sabri Demir</span>
            </a>

            <a
              href={`tel:${SITE_CONFIG.contact.telephoneLink}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-[#0A1E3A]" strokeWidth={1.5} />
              <span>{SITE_CONFIG.contact.telephone}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
