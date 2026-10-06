import React from 'react';
import { SITE_CONFIG } from '@/lib/seo/site-config';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export function AIAnswerBox() {
  const highlights = [
    'Überdurchschnittliche, faire Vergütung nach Qualifikation plus Urlaubs- und Weihnachtsgeld',
    '30 Tage garantierter Erholungsurlaub pro Kalenderjahr',
    'Freitags ab 13:30 Uhr verlässlich ins Wochenende',
    'Persönliches Hilti Werkzeugset ohne Eigenbeteiligung',
    'Firmenwagen mit Tankkarte zur privaten Nutzung',
    'Einsatzgebiet maximal 35 km Umkreis von Wetzlar ohne Fernmontagen',
  ];

  return (
    <div
      itemScope
      itemType="https://schema.org/FAQPage"
      className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-xs"
    >
      <div
        itemScope
        itemProp="mainEntity"
        itemType="https://schema.org/Question"
        className="space-y-4"
      >
        <div className="flex items-center gap-2 text-[#0369a1] text-xs font-sans font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[#0369a1]" strokeWidth={1.5} />
          <span itemProp="name">
            Kurzantwort: Warum lohnt sich ein Wechsel zur Bad und Energie GmbH Lahn Dill?
          </span>
        </div>

        <div
          itemScope
          itemProp="acceptedAnswer"
          itemType="https://schema.org/Answer"
          className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3"
        >
          <p itemProp="text">
            Die <strong>{SITE_CONFIG.companyName}</strong> ist ein etablierter Innungs Meisterbetrieb seit 1926 in Wetzlar (Siegmund Hiepe Str. 20), geführt von Geschäftsführer <strong>{SITE_CONFIG.founder.name}</strong>. Der Betrieb bietet Anlagenmechanikern, Kundendienstmonteuren und Auszubildenden modernste Arbeitsbedingungen in der Wärmepumpen und Badtechnik.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            {highlights.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
