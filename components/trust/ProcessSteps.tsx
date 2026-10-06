'use client';

import React from 'react';
import Link from 'next/link';
import { MessageSquare, Coffee, CheckCircle2, ArrowRight } from 'lucide-react';
import { triggerHaptic } from '@/lib/utils/haptics';

export function ProcessSteps() {
  const steps = [
    {
      num: '01',
      title: 'Kurzer Kontakt in 60 Sekunden',
      desc: 'Beantworte 4 einfache Fragen im Expressformular oder schreibe Meister Sabri Demir direkt per WhatsApp. Kein Anschreiben, kein Lebenslauf erforderlich.',
      icon: MessageSquare,
      highlight: 'Ohne Papierkram',
    },
    {
      num: '02',
      title: 'Kaffee trinken auf Augenhöhe',
      desc: 'Wir treffen uns diskret nach Deinem Feierabend oder am Wochenende in der Werkstatt in Wetzlar. Wir sprechen offen über Lohn, Touren und Deine Wünsche.',
      icon: Coffee,
      highlight: '100% Diskretion',
    },
    {
      num: '03',
      title: 'Fester Vertrag und pünktlich Feierabend',
      desc: 'Du erhältst Deinen unbefristeten Arbeitsvertrag. Am ersten Tag steht Dein persönliches Hilti Werkzeugset und Dein Servicefahrzeug bereit.',
      icon: CheckCircle2,
      highlight: 'Sicherer Start',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[11px] font-sans font-semibold text-[#0284C7] uppercase tracking-wider block mb-1">
          Einfach und ohne Bürokratie
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-[#0A1E3A]">
          In 3 Schritten zu Deinem neuen Handwerker Job
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Wir respektieren Deine Zeit und Deine aktuelle Anstellung. Dein Wechsel zu Bad und Energie bleibt absolut vertraulich.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {steps.map((step) => {
          const IconComp = step.icon;
          return (
            <div
              key={step.num}
              className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xs relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-2xl font-black font-sans tabular-nums text-[#0A1E3A]">
                    {step.num}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-sans font-semibold text-slate-700">
                    {step.highlight}
                  </span>
                </div>

                <div className="w-11 h-11 rounded-2xl bg-sky-50 text-[#0284C7] flex items-center justify-center mb-4">
                  <IconComp className="w-5 h-5" strokeWidth={1.5} />
                </div>

                <h4 className="text-base font-bold text-[#0A1E3A] mb-2">
                  {step.title}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 text-[11px] font-semibold text-[#059669] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Garantierter Schritt</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-2">
        <Link
          href="/bewerbung"
          onClick={() => triggerHaptic('light')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0A1E3A] hover:bg-[#132B50] text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          <span>Jetzt Schritt 1 starten (Bewerbung in 60 Sekunden)</span>
          <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}
