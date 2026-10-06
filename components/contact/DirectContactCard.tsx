import React from 'react';
import { Phone, Mail, Clock, MapPin, MessageSquare } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/seo/site-config';

export function DirectContactCard({ className = '' }: { className?: string }) {
  return (
    <div className={`p-6 sm:p-8 rounded-3xl bg-white text-slate-800 border border-slate-200/90 shadow-sm ${className}`}>
      <span className="text-[11px] font-mono font-bold text-[#0284C7] uppercase tracking-wider block mb-1">
        Direkter Ansprechpartner
      </span>
      <h3 className="text-xl font-black text-[#0A1E3A]">
        Meisterkontakt in Wetzlar
      </h3>
      <p className="mt-1 text-xs text-slate-500 leading-relaxed">
        Spreche direkt mit Geschäftsführer Diplomingenieur Sabri Demir ohne Warteschleifen.
      </p>

      <div className="mt-5 space-y-3 text-xs">
        {/* Phone */}
        <a
          href={`tel:${SITE_CONFIG.contact.telephoneLink}`}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 text-slate-800 transition-colors border border-slate-200/70"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#0284C7] flex items-center justify-center shrink-0">
            <Phone className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Telefon Direkt</div>
            <div className="font-mono font-bold text-slate-900">{SITE_CONFIG.contact.telephone}</div>
          </div>
        </a>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/49644142956?text=${encodeURIComponent('Guten Tag Herr Demir, ich interessiere mich für eine Stelle bei Bad und Energie.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50/60 hover:bg-emerald-50 text-slate-800 transition-colors border border-emerald-200/60"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#059669] uppercase font-bold">WhatsApp Direkt</div>
            <div className="font-mono font-bold text-slate-900">06441 42956</div>
          </div>
        </a>

        {/* Email */}
        <a
          href={`mailto:${SITE_CONFIG.contact.email}`}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 text-slate-800 transition-colors border border-slate-200/70"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">E Mail</div>
            <div className="font-mono font-bold text-slate-900">{SITE_CONFIG.contact.email}</div>
          </div>
        </a>

        {/* Office Hours */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/50 border border-slate-200/50 text-slate-600">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Arbeitszeiten</div>
            <div className="text-[11px] font-medium text-slate-700">
              Montag bis Donnerstag von 07:00 bis 16:45 Uhr, Freitag von 07:00 bis 13:30 Uhr
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/50 border border-slate-200/50 text-slate-600">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Werkstatt und Büro</div>
            <div className="text-[11px] font-medium text-slate-700">
              Siegmund Hiepe Str. 20, 35578 Wetzlar
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
