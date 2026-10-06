'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Truck,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Gift,
  ArrowRight,
} from 'lucide-react';
import {
  CraftRole,
  ExperienceLevel,
  ROLE_CONFIGS,
  EXPERIENCE_MODIFIERS,
  CRAFT_ADDONS,
  COMPENSATION_GUARANTEES,
} from './pricing.constants';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { triggerHaptic } from '@/lib/utils/haptics';

export function SalaryCalculator() {
  const [role, setRole] = useState<CraftRole>('anlagenmechaniker');
  const [experience, setExperience] = useState<ExperienceLevel>('mid');
  const [addons, setAddons] = useState<Record<string, boolean>>({
    heatPumpCert: true,
    driversLicenseBE: true,
    cleanWorkStyle: true,
  });

  const toggleAddon = (key: string) => {
    triggerHaptic('light');
    setAddons((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedRole = ROLE_CONFIGS[role];
  const selectedExp = EXPERIENCE_MODIFIERS[experience];

  const base = selectedRole.baseSalary;
  const expBonus = role === 'azubi' ? 0 : selectedExp.bonus;
  const addonsTotal =
    role === 'azubi'
      ? 0
      : Object.entries(addons).reduce((acc, [k, active]) => {
          if (!active) return acc;
          const item = CRAFT_ADDONS[k as keyof typeof CRAFT_ADDONS];
          return acc + (item ? item.bonus : 0);
        }, 0);

  const monthlyTotal = base + expBonus + addonsTotal;
  const yearlyEstimate = Math.round(monthlyTotal * 12.8); // Includes holiday and Christmas allowance

  return (
    <div className="double-bezel-shell max-w-5xl mx-auto">
      <div className="double-bezel-core overflow-hidden flex flex-col lg:flex-row">
        {/* Left Configuration Panel - Golden Ratio Major (61.8%) */}
        <div className="w-full lg:w-[61.8%] p-4 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-100 bg-[#F8FAFC]/40">
        <div className="space-y-6">
          <div>
            <span className="text-[11px] font-mono font-bold text-[#0284C7] uppercase tracking-wider block mb-1">
              Transparenter Handwerker Gehaltsrechner
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#0A1E3A]">
              Kalkuliere Deinen fairen Lohn in Wetzlar
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Keine Schätzungen, keine leeren Versprechen: Berechne Deine monatliche Vergütung bei Bad und Energie.
            </p>
          </div>

          {/* 1. Role Selection */}
          <div>
            <label className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
              1. Wähle Deine angestrebte Rolle:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(
                [
                  { id: 'anlagenmechaniker', label: 'Anlagenmechaniker SHK', icon: Wrench },
                  { id: 'kundendienst', label: 'Kundendienstmonteur', icon: Truck },
                  { id: 'helfer', label: 'Montagehelfer', icon: Sparkles },
                  { id: 'azubi', label: 'Ausbildung SHK 2026', icon: GraduationCap },
                ] as const
              ).map((item) => {
                const IconComponent = item.icon;
                const isSelected = role === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setRole(item.id);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'border-[#0A1E3A] bg-white shadow-xs text-[#0A1E3A] font-bold'
                        : 'border-slate-200 bg-white/70 hover:bg-white text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#0A1E3A] text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <span className="text-xs">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Experience Level */}
          {role !== 'azubi' && (
            <div>
              <label className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
                2. Deine Praxiserfahrung:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: 'junior', label: '1 bis 2 Jahre Praxis' },
                    { id: 'mid', label: '3 bis 5 Jahre Praxis' },
                    { id: 'senior', label: 'Über 5 Jahre Erfahrung' },
                    { id: 'meister', label: 'Meister oder Techniker' },
                  ] as const
                ).map((lvl) => {
                  const isSelected = experience === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setExperience(lvl.id);
                      }}
                      className={`p-2.5 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#0284C7] bg-sky-50 text-[#0A1E3A] font-bold'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Addon Qualifications */}
          {role !== 'azubi' && (
            <div>
              <label className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
                3. Zusatzqualifikationen & Führerschein:
              </label>
              <div className="space-y-2">
                {Object.entries(CRAFT_ADDONS).map(([key, data]) => {
                  const active = Boolean(addons[key]);
                  return (
                    <div
                      key={key}
                      onClick={() => toggleAddon(key)}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer select-none transition-all ${
                        active
                          ? 'border-emerald-300 bg-emerald-50/50 text-emerald-950'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            active
                              ? 'bg-[#059669] border-[#059669] text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {active && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <span>{data.label}</span>
                      </div>
                      <span className="font-mono font-bold text-[#059669]">
                        +{data.bonus} €
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Result Receipt Panel - Golden Ratio Minor (38.2%) */}
      <div className="w-full lg:w-[38.2%] p-4 sm:p-8 lg:p-10 bg-white flex flex-col justify-between space-y-6">
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">
              Kalkuliertes Monatsgehalt
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
              Festvertrag
            </span>
          </div>

          <div>
            <div className="text-3xl xs:text-4xl sm:text-5xl font-black text-[#0A1E3A] font-mono tracking-tight flex items-baseline flex-wrap">
              <AnimatedNumber value={monthlyTotal} />
              <span className="text-base sm:text-lg font-bold text-slate-500 ml-1.5 whitespace-nowrap">€ / Monat</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ca. <span className="font-bold text-slate-700">{yearlyEstimate.toLocaleString('de-DE')} €</span> Jahresbrutto inkl. Weihnachts und Urlaubsgeld
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs text-slate-700">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-[#059669]" strokeWidth={1.5} />
              <span>Garantierte Arbeitskonditionen:</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-600 pl-6 list-disc">
              <li>Freitags ab 13:30 Uhr bezahlt ins Wochenende</li>
              <li>30 Tage garantierter Erholungsurlaub</li>
              <li>Eigenes Hilti Werkzeugset ohne Abzüge</li>
              <li>Servicefahrzeug mit Privatnutzung</li>
            </ul>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href="/bewerbung"
            className="w-full py-3.5 px-5 rounded-2xl bg-[#C51E1E] hover:bg-[#A51616] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm apple-press cursor-pointer"
          >
            <span>Mit diesem Lohnprofil bewerben</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          <p className="text-[10px] text-slate-400 text-center font-mono">
            Bewerbung in 60 Sekunden ohne Lebenslauf bei Bad und Energie
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
