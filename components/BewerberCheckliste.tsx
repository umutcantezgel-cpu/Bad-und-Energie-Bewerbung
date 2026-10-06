'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  AlertCircle,
  Euro,
  Calendar,
  Wrench,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  UploadCloud,
  FileSpreadsheet,
  ExternalLink,
  MapPin,
  Phone,
  User,
  Briefcase,
  FileCheck,
  FileText,
  Layers,
} from 'lucide-react';
import { CandidateDossier } from '@/lib/recruiting-types';

export interface BewerberChecklisteProps {
  dossier: CandidateDossier;
  onNavigateTab: (
    tabId: 'hub' | 'quiz' | 'vault' | 'form' | 'dossier',
    fieldId?: string
  ) => void;
  className?: string;
}

export interface MissingFormField {
  id: string;
  fieldId: string;
  label: string;
  helper: string;
  category: 'contact' | 'qualification' | 'conditions';
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

export interface CategoryGaugeItem {
  id: string;
  label: string;
  percentage: number;
  completed: number;
  total: number;
  statusText: string;
  targetTab: 'hub' | 'quiz' | 'vault' | 'form' | 'dossier';
  targetFieldId?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

export interface ViewModuleProgressItem {
  tabId: 'quiz' | 'vault' | 'form' | 'dossier';
  moduleNumber: string;
  title: string;
  subtitle: string;
  percentage: number;
  statusText: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  color: string;
  badgeClass: string;
}

export interface ProgressGaugeProps {
  dossier: CandidateDossier;
  percentage?: number;
  missingFormFields?: MissingFormField[];
  categories?: CategoryGaugeItem[];
  onNavigateTab: (
    tabId: 'hub' | 'quiz' | 'vault' | 'form' | 'dossier',
    fieldId?: string
  ) => void;
  className?: string;
}

/**
 * ProgressGauge Component
 * Visually displays the completeness degree of the candidate dossier with:
 * - A radial circular SVG gauge showing total completion percentage
 * - Percentage indicators (%-Anzeige) for critical mandatory areas ('Kontaktdaten', 'Berufliche Qualifikation', 'Konditionen & Gehalt')
 * - Direct deep-link connections to all View Modules (Modul 01 Generator, Modul 02 Vault, Modul 03 Formular-Builder, Modul 04 DIN-A4 Dossier)
 * - Direct jump marks (Sprungmarken) linking into FormView input fields with auto-focus
 */
export function ProgressGauge({
  dossier,
  percentage: customPercentage,
  missingFormFields: customMissingFields,
  categories: customCategories,
  onNavigateTab,
  className = '',
}: ProgressGaugeProps) {
  // 1. Evaluate individual field statuses
  const isNameValid = Boolean(dossier.fullName && dossier.fullName.trim().length >= 3);
  const isPhoneValid = Boolean(dossier.phone && dossier.phone.trim().length >= 6);
  const isLocationValid = Boolean(dossier.location && dossier.location.trim().length >= 2);
  const isExperienceValid = Boolean(dossier.experience && dossier.experience.trim().length >= 2);
  const isPositionValid = Boolean(dossier.position && dossier.position.trim().length >= 3);
  const isSalaryValid = Boolean(dossier.salaryExpectation && dossier.salaryExpectation.trim().length >= 3);
  const isStartDateValid = Boolean(dossier.startDate && dossier.startDate.trim().length >= 2);
  const hasSkills = Boolean(dossier.skills && dossier.skills.length >= 3);
  const hasCoverLetter = Boolean(dossier.coverLetter && dossier.coverLetter.trim().length >= 30);
  const hasWorkStyle = Boolean(dossier.workStyle && dossier.workStyle.trim().length >= 10);
  const hasFiles = Boolean(dossier.files && dossier.files.length > 0);
  const hasDiscretion = Boolean(dossier.discretionGuaranteed);

  // 2. Compute missing mandatory fields targeting FormView
  const computedMissingFields: MissingFormField[] = [];

  if (!isNameValid) {
    computedMissingFields.push({
      id: 'fullName',
      fieldId: 'fullName',
      label: 'Vollständiger Name',
      helper: 'Vorname und Nachname für offizielles Bewerberdossier',
      category: 'contact',
      icon: User,
    });
  }

  if (!isPhoneValid) {
    computedMissingFields.push({
      id: 'phone',
      fieldId: 'phone',
      label: 'Telefonnummer oder WhatsApp',
      helper: 'Für direkten Rückruf oder vertraulichen WhatsApp Kontakt',
      category: 'contact',
      icon: Phone,
    });
  }

  if (!isLocationValid) {
    computedMissingFields.push({
      id: 'location',
      fieldId: 'location',
      label: 'Wohnort und Postleitzahl',
      helper: 'Zur Zuweisung regionaler Kundendiensteinsätze',
      category: 'contact',
      icon: MapPin,
    });
  }

  if (!isExperienceValid) {
    computedMissingFields.push({
      id: 'experience',
      fieldId: 'experience',
      label: 'Berufserfahrung',
      helper: 'Praxisjahre im SHK Handwerk für Geselle Meister oder Quereinsteiger',
      category: 'qualification',
      icon: Briefcase,
    });
  }

  if (!isSalaryValid) {
    computedMissingFields.push({
      id: 'salaryExpectation',
      fieldId: 'salaryExpectation',
      label: 'Gehaltsvorstellung bestätigen',
      helper: 'Monatlicher Bruttowunsch in Euro oder Stundenlohn',
      category: 'conditions',
      icon: Euro,
    });
  }

  if (!isStartDateValid) {
    computedMissingFields.push({
      id: 'startDate',
      fieldId: 'startDate',
      label: 'Frühester Starttermin',
      helper: 'Kündigungsfrist oder Sofortstart bei Bad und Energie GmbH',
      category: 'conditions',
      icon: Calendar,
    });
  }

  const missingFields = customMissingFields || computedMissingFields;

  // 3. Category completeness calculations
  const contactPoints = (isNameValid ? 1 : 0) + (isPhoneValid ? 1 : 0) + (isLocationValid ? 1 : 0);
  const contactPercent = Math.round((contactPoints / 3) * 100);

  const qualPoints = (isExperienceValid ? 1 : 0) + (isPositionValid ? 1 : 0) + (hasSkills ? 1 : 0);
  const qualPercent = Math.round((qualPoints / 3) * 100);

  const condPoints = (isSalaryValid ? 1 : 0) + (isStartDateValid ? 1 : 0);
  const condPercent = Math.round((condPoints / 2) * 100);

  const docPercent = hasFiles ? 100 : 0;

  // Total weighted score
  const totalMandatoryPoints = 9;
  const earnedPoints =
    (isNameValid ? 1 : 0) +
    (isPhoneValid ? 1 : 0) +
    (isLocationValid ? 1 : 0) +
    (isExperienceValid ? 1 : 0) +
    (isPositionValid ? 1 : 0) +
    (isSalaryValid ? 1 : 0) +
    (isStartDateValid ? 1 : 0) +
    (hasSkills ? 1 : 0) +
    (hasFiles ? 1 : 0);

  const overallPercentage =
    customPercentage ?? Math.round((earnedPoints / totalMandatoryPoints) * 100);

  // 4. View Modules calculation and links
  const quizProgress = Math.round(
    ((hasSkills ? 40 : 0) + (hasCoverLetter ? 30 : 0) + (hasWorkStyle ? 30 : 0))
  );

  const vaultProgress = hasFiles
    ? Math.min(100, dossier.files.length >= 2 ? 100 : 80)
    : 0;

  const formProgress = Math.round(
    (((isNameValid ? 1 : 0) +
      (isPhoneValid ? 1 : 0) +
      (isLocationValid ? 1 : 0) +
      (isExperienceValid ? 1 : 0) +
      (isSalaryValid ? 1 : 0) +
      (isStartDateValid ? 1 : 0)) /
      6) *
      100
  );

  const dossierProgress = overallPercentage;

  const viewModules: ViewModuleProgressItem[] = [
    {
      tabId: 'quiz',
      moduleNumber: 'Modul 01',
      title: 'Profilfragebogen',
      subtitle: 'Kompetenzen und Anschreiben',
      percentage: quizProgress,
      statusText:
        quizProgress === 100
          ? `${dossier.skills.length} Qualifikationen gewählt`
          : 'Schwerpunkte auswählen',
      icon: Sparkles,
      color: '#0284C7',
      badgeClass: quizProgress === 100 ? 'bg-sky-50 text-sky-800' : 'bg-slate-100 text-slate-700',
    },
    {
      tabId: 'vault',
      moduleNumber: 'Modul 02',
      title: 'Dokumentenablage',
      subtitle: 'Gesellenbrief und Zeugnisse',
      percentage: vaultProgress,
      statusText: hasFiles
        ? `${dossier.files.length} Dokument${dossier.files.length > 1 ? 'e' : ''} verschlüsselt`
        : 'Kein Upload hinterlegt',
      icon: UploadCloud,
      color: '#059669',
      badgeClass:
        vaultProgress === 100
          ? 'bg-emerald-50 text-emerald-800'
          : 'bg-amber-50 text-amber-800',
    },
    {
      tabId: 'form',
      moduleNumber: 'Modul 03',
      title: 'Onlineformular',
      subtitle: 'Stammdaten und Konditionen',
      percentage: formProgress,
      statusText:
        formProgress === 100
          ? 'Alle Pflichtfelder erfasst'
          : `${missingFields.length} Feld${missingFields.length > 1 ? 'er' : ''} offen`,
      icon: FileSpreadsheet,
      color: '#C51E1E',
      badgeClass:
        formProgress === 100
          ? 'bg-emerald-50 text-emerald-800'
          : 'bg-rose-50 text-[#C51E1E]',
    },
    {
      tabId: 'dossier',
      moduleNumber: 'Modul 04',
      title: 'DINA4 Bewerbungsmappe',
      subtitle: 'Ausdruck und Meistersiegel',
      percentage: dossierProgress,
      statusText:
        dossierProgress >= 90
          ? 'Dossier druck und versandbereit'
          : `${overallPercentage}% Reifegrad erreicht`,
      icon: FileText,
      color: '#0A1E3A',
      badgeClass:
        dossierProgress >= 90
          ? 'bg-emerald-50 text-emerald-800'
          : 'bg-slate-100 text-[#0A1E3A]',
    },
  ];

  const categoryGauges: CategoryGaugeItem[] = customCategories || [
    {
      id: 'contact',
      label: 'Kontaktdaten',
      percentage: contactPercent,
      completed: contactPoints,
      total: 3,
      statusText:
        contactPercent === 100
          ? 'Name, Telefon und Wohnort erfasst'
          : `${3 - contactPoints} Pflichtangabe${3 - contactPoints > 1 ? 'n' : ''} fehlt`,
      targetTab: 'form',
      targetFieldId: !isNameValid ? 'fullName' : !isPhoneValid ? 'phone' : 'location',
      icon: UserCheck,
    },
    {
      id: 'qualification',
      label: 'Berufliche Qualifikation',
      percentage: qualPercent,
      completed: qualPoints,
      total: 3,
      statusText:
        qualPercent === 100
          ? 'Erfahrung und Kompetenzen verifiziert'
          : !isExperienceValid
            ? 'Praxisjahre im Formular eintragen'
            : 'Fachkompetenzen auswählen',
      targetTab: !isExperienceValid ? 'form' : 'quiz',
      targetFieldId: !isExperienceValid ? 'experience' : undefined,
      icon: Wrench,
    },
    {
      id: 'conditions',
      label: 'Konditionen und Gehalt',
      percentage: condPercent,
      completed: condPoints,
      total: 2,
      statusText:
        condPercent === 100
          ? 'Gehaltswunsch und Verfügbarkeit klar'
          : !isSalaryValid
            ? 'Wunschgehalt im Formular eintragen'
            : 'Starttermin auswählen',
      targetTab: 'form',
      targetFieldId: !isSalaryValid ? 'salaryExpectation' : 'startDate',
      icon: Euro,
    },
  ];

  // SVG Gauge calculations
  const radius = 64;
  const strokeWidth = 11;
  const circumference = 2 * Math.PI * radius; // ~402.12
  const strokeDashoffset = circumference - (circumference * overallPercentage) / 100;

  const getGaugeColor = () => {
    if (overallPercentage >= 90) {
      return {
        stroke: '#059669',
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        label: 'Vollständig bereit',
      };
    }
    if (overallPercentage >= 65) {
      return {
        stroke: '#0284C7',
        badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
        label: 'Hoher Reifegrad',
      };
    }
    if (overallPercentage >= 40) {
      return {
        stroke: '#D97706',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
        label: 'Angaben unvollständig',
      };
    }
    return {
      stroke: '#C51E1E',
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
      label: 'Basisprofil',
    };
  };

  const { stroke: gaugeAccentColor, badgeBg: gaugeBadgeClass, label: gaugeStatusLabel } =
    getGaugeColor();

  return (
    <div
      className={`bg-gradient-to-br from-white via-slate-50/70 to-slate-100/50 rounded-3xl p-6 sm:p-7 border border-white/90 shadow-[0_6px_28px_-4px_rgba(10,30,58,0.06)] space-y-6 ${className}`}
    >
      {/* 1. Gauge Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Vollständigkeitsprüfung
            </span>
          </div>
          <div className="text-base sm:text-lg font-extrabold text-[#0A1E3A] tracking-tight">
            Vollständigkeitsgrad des Bewerberdossiers
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('form')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-[#0A1E3A] shadow-2xs hover:shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-[#0284C7]" strokeWidth={1.5} />
          <span>Onlineformular öffnen</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
        </button>
      </div>

      {/* 2. Main Row: Radial SVG Gauge + 3 Category Progress Displays */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Circular SVG Radial Gauge */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-2 sm:p-4 border-b lg:border-b-0 lg:border-r border-slate-200/80">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Ambient Glow */}
            <div
              className="absolute inset-4 rounded-full filter blur-xl opacity-20 pointer-events-none transition-all duration-700"
              style={{ backgroundColor: gaugeAccentColor }}
            />

            <svg
              className="w-full h-full -rotate-90 transform"
              viewBox="0 0 160 160"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  {overallPercentage >= 90 ? (
                    <>
                      <stop offset="0%" stopColor="#0284C7" />
                      <stop offset="50%" stopColor="#059669" />
                      <stop offset="100%" stopColor="#10B981" />
                    </>
                  ) : overallPercentage >= 65 ? (
                    <>
                      <stop offset="0%" stopColor="#38BDF8" />
                      <stop offset="60%" stopColor="#0284C7" />
                      <stop offset="100%" stopColor="#0369A1" />
                    </>
                  ) : (
                    <>
                      <stop offset="0%" stopColor="#E11D48" />
                      <stop offset="60%" stopColor="#D97706" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </>
                  )}
                </linearGradient>
              </defs>

              {/* Background Circular Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-slate-200/80"
              />

              {/* Dynamic Animated Stroke */}
              <motion.circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="url(#gaugeGrad)"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.0, ease: 'easeOut' }}
              />
            </svg>

            {/* Central Typography Hub */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[#0A1E3A] tracking-tight">
                {overallPercentage}%
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                Vollständig
              </span>
            </div>
          </div>

          <div className="mt-2 text-center space-y-1">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${gaugeBadgeClass}`}
            >
              {overallPercentage >= 90 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" strokeWidth={1.5} />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" strokeWidth={1.5} />
              )}
              <span>{gaugeStatusLabel}</span>
            </span>
            <p className="text-[11px] text-slate-500 font-medium">
              Echtzeitübertragung in DINA4 Bewerbungsmappe
            </p>
          </div>
        </div>

        {/* Right: Category Progress Bars */}
        <div className="lg:col-span-8 space-y-3.5">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            <span>Pflichtkategorien und Reifegrad</span>
            <span>Status und Direktsprung</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {categoryGauges.map((category) => {
              const CatIcon = category.icon;
              const is100 = category.percentage === 100;
              const progressColor = is100
                ? 'bg-[#059669]'
                : category.percentage >= 50
                  ? 'bg-[#0284C7]'
                  : 'bg-[#C51E1E]';

              return (
                <div
                  key={category.id}
                  className={`p-3.5 rounded-2xl border transition-all duration-150 flex flex-col justify-between ${
                    is100
                      ? 'bg-white/90 border-emerald-200/80 hover:border-emerald-300'
                      : 'bg-white/90 border-slate-200/80 hover:border-[#0284C7]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            is100
                              ? 'bg-emerald-100 text-[#059669]'
                              : 'bg-slate-100 text-[#0A1E3A]'
                          }`}
                        >
                          <CatIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </div>
                        <span className="text-xs font-bold text-slate-900 leading-snug break-words">
                          {category.label}
                        </span>
                      </div>

                      <span
                        className={`text-[11px] font-mono font-extrabold px-1.5 py-0.5 rounded shrink-0 ${
                          is100
                            ? 'bg-emerald-100 text-emerald-800'
                            : category.percentage >= 50
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {category.percentage}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 leading-snug break-words">
                      {category.statusText}
                    </p>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      {category.completed}/{category.total}
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigateTab(category.targetTab, category.targetFieldId)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0284C7] hover:text-[#0369A1] transition-colors cursor-pointer group"
                    >
                      <span>
                        {category.targetTab === 'form'
                          ? is100
                            ? 'Ansehen'
                            : 'Ausfüllen'
                          : 'Öffnen'}
                      </span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Verknüpfte View-Module Deck (Links to all 4 View Modules) */}
      <div className="pt-3 border-t border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0A1E3A]" strokeWidth={1.5} />
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
              Verknüpfung mit den Modulen
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Direkter Absprung in Modul 01 bis 04
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {viewModules.map((module) => {
            const ModIcon = module.icon;
            const isFull = module.percentage === 100;
            return (
              <div
                key={module.tabId}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-[#0284C7] hover:shadow-xs transition-all duration-150 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                      {module.moduleNumber}
                    </span>
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                        isFull
                          ? 'bg-emerald-100 text-emerald-800'
                          : module.percentage >= 50
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {module.percentage}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${module.color}15`, color: module.color }}
                    >
                      <ModIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 leading-snug break-words">
                        {module.title}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-snug break-words">{module.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 font-medium pt-1 leading-snug break-words">
                    {module.statusText}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateTab(module.tabId)}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-bold text-[#0A1E3A] flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <span>{module.title} öffnen</span>
                  <ArrowRight
                    className="w-3 h-3 text-[#0284C7] group-hover:translate-x-0.5 transition-transform"
                    strokeWidth={1.5}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Missing Form Fields Interactive Deck with Direct Anchors / Deep-Links */}
      <div className="pt-2 border-t border-slate-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#0A1E3A]" strokeWidth={1.5} />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Sprungmarken in das Onlineformular
              </span>
            </div>
            <div className="text-sm sm:text-base font-bold text-[#0A1E3A]">
              {missingFields.length === 0
                ? 'Alle Pflichtfelder im Onlineformular vollständig erfasst'
                : `Noch ${missingFields.length} Pflichtfeld${
                    missingFields.length > 1 ? 'er' : ''
                  } mit direktem Tastatur-Fokus anspringen:`}
            </div>
          </div>

          {missingFields.length > 0 && (
            <span className="text-[11px] font-mono text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full self-start sm:self-auto font-semibold">
              Klick springt direkt ins Feld
            </span>
          )}
        </div>

        {missingFields.length === 0 ? (
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3.5">
            <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" strokeWidth={1.5} />
            <div className="space-y-1">
              <div className="text-xs sm:text-sm font-bold text-emerald-950">
                Alle Pflichtangaben für Geschäftsführer Sabri Demir liegen vollständig vor.
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Deine Kontaktdaten, Gehaltserwartung und Verfügbarkeit sind verifiziert und
                übertragen sich automatisch auf das offizielle DINA4 Bewerberdossier.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {missingFields.map((field) => {
              const FieldIcon = field.icon;
              return (
                <button
                  key={field.id}
                  type="button"
                  onClick={() => onNavigateTab('form', field.fieldId)}
                  className="group p-3 rounded-2xl bg-white border border-rose-200/90 hover:border-[#C51E1E] hover:bg-rose-50/30 text-left transition-all duration-150 flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs cursor-pointer"
                  title={`Direkt zu "${field.label}" im Formular springen`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 text-[#C51E1E] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <FieldIcon className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-slate-900 group-hover:text-[#C51E1E] transition-colors truncate">
                        {field.label} *
                      </span>
                      <span className="block text-[11px] text-slate-500 truncate">
                        {field.helper}
                      </span>
                    </div>
                  </div>

                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-[#C51E1E] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * BewerberCheckliste Component (Dashboard / View 1)
 */
export function BewerberCheckliste({
  dossier,
  onNavigateTab,
  className = '',
}: BewerberChecklisteProps) {
  // 1. Evaluate form builder specific mandatory fields
  const isNameMissing = !dossier.fullName || dossier.fullName.trim().length < 3;
  const isPhoneMissing = !dossier.phone || dossier.phone.trim().length < 6;
  const isLocationMissing = !dossier.location || dossier.location.trim().length < 2;
  const isSalaryMissing =
    !dossier.salaryExpectation || dossier.salaryExpectation.trim().length < 3;
  const isStartDateMissing = !dossier.startDate || dossier.startDate.trim().length < 2;

  // 2. Evaluate overall dossier criteria
  const hasDocuments = Boolean(dossier.files && dossier.files.length > 0);
  const hasSalary = !isSalaryMissing;
  const hasStartDate = !isStartDateMissing;
  const hasSkills = Boolean(dossier.skills && dossier.skills.length >= 3);
  const hasContactInfo = !isNameMissing && !isPhoneMissing && !isLocationMissing;
  const hasDiscretion = Boolean(dossier.discretionGuaranteed);

  const checklistItems = [
    {
      id: 'documents',
      category: 'nachweise' as const,
      title: 'Lebenslauf oder Gesellenbrief hochladen',
      requirement: 'Mindestens 1 Dokument (z.B. PDF oder Foto) in der geschützten Dokumentenablage',
      isComplete: hasDocuments,
      valueDisplay: hasDocuments
        ? `${dossier.files.length} Dokument${
            dossier.files.length > 1 ? 'e' : ''
          } hinterlegt (${dossier.files[0].name})`
        : undefined,
      targetTab: 'vault' as const,
      targetFieldId: undefined,
      ctaText: 'Jetzt hochladen',
      icon: UploadCloud,
    },
    {
      id: 'salary',
      category: 'konditionen' as const,
      title: 'Gehaltsvorstellung bestätigen',
      requirement: 'Monatliche Brutto-Vergütung oder Zielgehalt angeben',
      isComplete: hasSalary,
      valueDisplay: hasSalary ? dossier.salaryExpectation : undefined,
      targetTab: 'form' as const,
      targetFieldId: 'salaryExpectation',
      ctaText: 'Gehalt angeben',
      icon: Euro,
    },
    {
      id: 'startDate',
      category: 'konditionen' as const,
      title: 'Verfügbarkeit und Kündigungsfrist',
      requirement: 'Frühestmöglicher Eintrittstermin beim Betrieb in Wetzlar',
      isComplete: hasStartDate,
      valueDisplay: hasStartDate ? dossier.startDate : undefined,
      targetTab: 'form' as const,
      targetFieldId: 'startDate',
      ctaText: 'Termin wählen',
      icon: Calendar,
    },
    {
      id: 'skills',
      category: 'basis' as const,
      title: 'Fachschwerpunkte und Kernkompetenzen',
      requirement:
        'Mindestens 3 handwerkliche Qualifikationen wie Wärmepumpen, Bäder, Führerschein',
      isComplete: hasSkills,
      valueDisplay: hasSkills
        ? `${dossier.skills.length} Qualifikationen ausgewählt`
        : undefined,
      targetTab: 'quiz' as const,
      targetFieldId: undefined,
      ctaText: 'Kompetenzen wählen',
      icon: Wrench,
    },
    {
      id: 'contact',
      category: 'basis' as const,
      title: 'Kontaktdaten und Rückrufkanal',
      requirement: 'Vollständiger Name, Telefon oder WhatsApp und Wohnort',
      isComplete: hasContactInfo,
      valueDisplay: hasContactInfo
        ? `${dossier.fullName} • ${dossier.location} (${dossier.contactPreference.toUpperCase()})`
        : undefined,
      targetTab: 'form' as const,
      targetFieldId: 'fullName',
      ctaText: 'Daten ergänzen',
      icon: UserCheck,
    },
    {
      id: 'discretion',
      category: 'basis' as const,
      title: 'Diskretionsschutz nach § 26 BDSG',
      requirement: 'Vertrauliche Bewerbung ohne Benachrichtigung des aktuellen Arbeitgebers',
      isComplete: hasDiscretion,
      valueDisplay: '100% vertrauliche Bearbeitung durch Geschäftsführung garantiert',
      targetTab: 'form' as const,
      targetFieldId: 'notes',
      ctaText: 'Bestätigen',
      icon: ShieldCheck,
    },
  ];

  const totalCriteria = checklistItems.length;
  const completedCriteria = checklistItems.filter((i) => i.isComplete).length;
  const completionPercentage = Math.round((completedCriteria / totalCriteria) * 100);

  return (
    <div
      className={`glass-panel p-6 sm:p-8 rounded-3xl border border-white/90 shadow-[0_8px_32px_rgba(10,30,58,0.06)] space-y-7 ${className}`}
    >
      {/* 1. Header with Title and Overall Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-slate-500">
              Reifegrad der Bewerbung
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#0A1E3A] tracking-tight">
            Bewerbungscheckliste und Vollständigkeit
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Automatische Prüfung aller Pflichtangaben mit direktem Sprung in die entsprechenden Module.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onNavigateTab('dossier')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A1E3A] bg-white border border-slate-200 hover:border-slate-300 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileCheck className="w-3.5 h-3.5 text-[#0284C7]" strokeWidth={1.5} />
            <span>DINA4 Bewerbungsmappe anzeigen</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* 2. Visual ProgressGauge with %-Anzeigen für Teilbereiche, Module-Deck & Sprungmarken */}
      <ProgressGauge
        dossier={dossier}
        percentage={completionPercentage}
        onNavigateTab={onNavigateTab}
      />

      {/* 3. Detailed Checklist Item Cards */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            Detaillierte Übersicht aller Kriterien
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {completedCriteria} von {totalCriteria} Kriterien erfüllt
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checklistItems.map((item) => {
            const ItemIcon = item.icon;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  item.isComplete
                    ? 'bg-white/80 border-emerald-200/80 hover:border-emerald-300'
                    : 'bg-rose-50/40 border-rose-200/80 hover:border-rose-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      item.isComplete
                        ? 'bg-emerald-100 text-[#059669]'
                        : 'bg-rose-100 text-[#C51E1E]'
                    }`}
                  >
                    {item.isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-[#059669]" strokeWidth={1.5} />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-[#C51E1E]" strokeWidth={1.5} />
                    )}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {item.title}
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          item.isComplete
                            ? 'bg-emerald-100/70 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.isComplete ? 'Erledigt' : 'Offen'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-snug">
                      {item.requirement}
                    </p>

                    {item.valueDisplay && (
                      <div className="text-[11px] font-mono text-slate-700 font-semibold pt-0.5 flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="truncate">{item.valueDisplay}</span>
                      </div>
                    )}
                  </div>
                </div>

                {!item.isComplete && (
                  <div className="pt-3 mt-3 border-t border-rose-100 flex items-center justify-between">
                    <span className="text-[11px] text-rose-700 font-medium">
                      Klicke hier zur Erfassung:
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigateTab(item.targetTab, item.targetFieldId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-xs font-bold text-[#C51E1E] border border-rose-200 hover:bg-rose-50 shadow-2xs transition-colors cursor-pointer"
                    >
                      <span>{item.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
