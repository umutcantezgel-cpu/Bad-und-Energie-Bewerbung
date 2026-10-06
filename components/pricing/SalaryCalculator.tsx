'use client';

import React, { useState } from 'react';
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
  Clock,
  Car,
  Smartphone,
  Award,
} from 'lucide-react';
import {
  CraftRole,
  ExperienceLevel,
  ROLE_CONFIGS,
  EXPERIENCE_MODIFIERS,
  CRAFT_ADDONS,
  COMPENSATION_GUARANTEES,
} from './pricing.constants';
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
  const activeAddonCount = Object.values(addons).filter(Boolean).length;

  return (
    <div className="double-bezel-shell max-w-5xl mx-auto">
      <div className="double-bezel-core overflow-hidden flex flex-col lg:flex-row">
        {/* Left Configuration Panel - Golden Ratio Major (61.8%) */}
        <div className="w-full lg:w-[58%] p-5 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-100 bg-[#F8FAFC]/40">
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-sans font-bold text-[#0369a1] uppercase tracking-wider block mb-1">
                Interaktiver Vorteils- &amp; Ausstattungs-Check
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#0A1E3A]">
                Stelle Dein persönliches Mitarbeiter-Paket zusammen
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Wähle Deine Fachrichtung und Praxis: Sieh sofort, welche Ausstattung, Freiheiten und Garantien Du bei Bad &amp; Energie freischaltest.
              </p>
            </div>

            {/* 1. Role Selection */}
            <div>
              <label className="text-xs font-sans font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
                1. Angestrebte Position:
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
                          ? 'bg-white border-[#0A1E3A] ring-2 ring-[#0A1E3A]/10 shadow-sm'
                          : 'bg-white/60 border-slate-200/80 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#0A1E3A] text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-xs font-bold block truncate ${
                            isSelected ? 'text-[#0A1E3A]' : 'text-slate-800'
                          }`}
                        >
                          {item.label}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {ROLE_CONFIGS[item.id].tier}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Experience Level */}
            <div>
              <label className="text-xs font-sans font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
                2. Deine Praxiserfahrung:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(EXPERIENCE_MODIFIERS) as ExperienceLevel[]).map((lvl) => {
                  const isSelected = experience === lvl;
                  const data = EXPERIENCE_MODIFIERS[lvl];
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setExperience(lvl);
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0A1E3A] text-white border-[#0A1E3A] shadow-xs'
                          : 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-[11px] font-bold block leading-snug">{data.badge}</span>
                      <span
                        className={`text-[9px] block mt-0.5 ${
                          isSelected ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        {lvl === 'junior' && '1-2 Jahre'}
                        {lvl === 'mid' && '3-5 Jahre'}
                        {lvl === 'senior' && '> 5 Jahre'}
                        {lvl === 'meister' && 'Meister/Tech.'}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 mt-2 italic">
                {selectedExp.levelDescription}
              </p>
            </div>

            {/* 3. Addons & Specializations */}
            {role !== 'azubi' && (
              <div>
                <label className="text-xs font-sans font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
                  3. Zusätzliche Qualifikationen &amp; Stärken:
                </label>
                <div className="space-y-2">
                  {(Object.keys(CRAFT_ADDONS) as (keyof typeof CRAFT_ADDONS)[]).map((k) => {
                    const data = CRAFT_ADDONS[k];
                    const active = addons[k];
                    return (
                      <div
                        key={k}
                        onClick={() => toggleAddon(k)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                          active
                            ? 'bg-emerald-50/60 border-emerald-300 text-slate-900 shadow-2xs'
                            : 'bg-white border-slate-200/80 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                              active
                                ? 'bg-[#047857] border-[#047857] text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {active && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <span className="font-semibold block">{data.label}</span>
                            <span className="text-[10px] text-slate-500">{data.perk}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-sans font-bold text-[#047857] shrink-0 ml-2">
                          {active ? 'Freigeschaltet' : '+ Hinzufügen'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Result Package Panel - Golden Ratio Minor (42%) */}
        <div className="w-full lg:w-[42%] p-5 sm:p-8 lg:p-10 bg-white flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-sans font-bold uppercase tracking-wider text-slate-500">
                Dein Mitarbeiter-Paket
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-sans">
                Unbefristeter Festvertrag
              </span>
            </div>

            {/* Classification & Tier Headline */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-[#0369a1] text-[11px] font-bold border border-sky-100">
                <Award className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{selectedRole.tier}</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-[#0A1E3A] leading-snug">
                {selectedRole.compensationTier}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Plus volles Urlaubs- und Weihnachtsgeld, pünktlichste Gehaltszahlung am 1. Werktag und regelmäßige Qualitätsboni.
              </p>
            </div>

            {/* Concrete Unlocked Perks List */}
            <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-3 text-xs text-slate-700">
              <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-200/60 pb-2">
                <ShieldCheck className="w-4 h-4 text-[#047857]" strokeWidth={1.5} />
                <span>Freigeschaltete Arbeitsplatz-Vorteile:</span>
              </div>
              <ul className="space-y-2 text-[11px] text-slate-700">
                <li className="flex items-start gap-2">
                  <Car className="w-3.5 h-3.5 text-[#0369a1] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span><strong>Mobilität:</strong> {selectedRole.vehicle}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Wrench className="w-3.5 h-3.5 text-[#C51E1E] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span><strong>Werkzeug:</strong> {selectedRole.tools}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span><strong>Wochenendstart:</strong> Freitags ab 13:30 Uhr bezahlt ins Wochenende</span>
                </li>
                <li className="flex items-start gap-2">
                  <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span><strong>Erholung:</strong> 30 Tage garantierter bezahlter Erholungsurlaub</span>
                </li>
                <li className="flex items-start gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span><strong>Digital:</strong> Dienst-iPad &amp; Smartphone auch für private Nutzung</span>
                </li>
              </ul>
            </div>

            {/* Active Addons Summary */}
            {activeAddonCount > 0 && role !== 'azubi' && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(Object.keys(addons) as (keyof typeof CRAFT_ADDONS)[]).map((k) => {
                  if (!addons[k]) return null;
                  return (
                    <span
                      key={k}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200"
                    >
                      ✓ {CRAFT_ADDONS[k].benefitBadge}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <a
              href="#express-funnel"
              className="w-full py-3.5 px-5 rounded-2xl bg-[#C51E1E] hover:bg-[#A51616] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm apple-press cursor-pointer"
            >
              <span>Dieses Vorteils-Paket sichern (In 60 Sek.)</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </a>
            <p className="text-[10px] text-slate-400 text-center font-sans">
              100% vertraulich · Ohne Anschreiben · Ohne Lebenslauf
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
