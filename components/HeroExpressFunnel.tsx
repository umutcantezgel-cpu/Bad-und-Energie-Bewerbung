'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wrench,
  Zap,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Shield,
  Phone,
  Clock,
  Car,
  FileCheck,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

interface FunnelData {
  role: string;
  status: string;
  skills: string[];
  experienceYears: string;
  keyBenefits: string[];
  startDate: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  prefContact: string;
  discretion: boolean;
}

const initialFunnelData: FunnelData = {
  role: 'Anlagenmechaniker SHK m w d',
  status: 'In fester Anstellung',
  skills: [
    'Wärmepumpen Luft Wasser Bosch und Brötje',
    'Moderne Badsanierung und Vorwandtechnik',
    'Führerschein Klasse B PKW',
  ],
  experienceYears: '2 bis 5 Jahre',
  keyBenefits: [
    'Geregelte Arbeitszeiten freitags ab 13:30 Uhr ins Wochenende',
    'Überdurchschnittlicher Lohn und Wertschätzung',
  ],
  startDate: 'In 1 bis 2 Monaten Kündigungsfrist',
  name: '',
  phone: '',
  email: '',
  location: 'Wetzlar und Umgebung',
  prefContact: 'whatsapp',
  discretion: true,
};

export function HeroExpressFunnel() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [data, setData] = useState<FunnelData>(initialFunnelData);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  const totalSteps = 4;

  const handleRoleSelect = (role: string) => {
    setData((prev) => ({ ...prev, role }));
  };

  const handleStatusSelect = (status: string) => {
    setData((prev) => ({ ...prev, status }));
  };

  const toggleSkill = (skill: string) => {
    setData((prev) => {
      const exists = prev.skills.includes(skill);
      return {
        ...prev,
        skills: exists ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
      };
    });
  };

  const toggleBenefit = (benefit: string) => {
    setData((prev) => {
      const exists = prev.keyBenefits.includes(benefit);
      return {
        ...prev,
        keyBenefits: exists
          ? prev.keyBenefits.filter((b) => b !== benefit)
          : [...prev.keyBenefits, benefit],
      };
    });
  };

  const nextStep = () => {
    setValidationError('');
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setValidationError('');
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name.trim() || !data.phone.trim()) {
      setValidationError('Bitte Name und Telefonnummer angeben für die diskrete Rückmeldung.');
      return;
    }

    try {
      // Sync to shared candidate dossier in localStorage
      const existing = localStorage.getItem('bad_energie_dossier');
      let dossier = existing ? JSON.parse(existing) : {};
      dossier = {
        ...dossier,
        fullName: data.name,
        phone: data.phone,
        email: data.email || '',
        location: data.location,
        position: data.role,
        skills: data.skills,
        experience: data.experienceYears,
        startDate: data.startDate,
        discretionGuaranteed: data.discretion,
        contactPreference: data.prefContact,
        createdAt: new Date().toLocaleDateString('de-DE'),
      };
      localStorage.setItem('bad_energie_dossier', JSON.stringify(dossier));

      // Asynchroner POST an die Bewerbungs-API
      const sanitizedPhone = data.phone.replace(/[^0-9]/g, '') || '00000';
      const applicantEmail = data.email.trim() || `bewerber.${sanitizedPhone}@karriere.bad-energie.de`;

      fetch('/api/bewerbung', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: data.name,
          email: applicantEmail,
          phone: data.phone,
          location: data.location,
          position: data.role,
          experience: data.experienceYears,
          startDate: data.startDate,
          skills: data.skills,
          notes: `Ausgewählte Vorteile: ${data.keyBenefits.join(', ')}`,
          contactPreference: data.prefContact,
          discretionGuaranteed: data.discretion,
        }),
      }).catch((apiErr) => {
        console.warn('[ExpressFunnel] Background API dispatch notice:', apiErr);
      });
    } catch {
      // ignore
    }

    setIsSubmitted(true);
    try {
      import('canvas-confetti').then((mod) => {
        const confettiFn = mod.default || mod;
        confettiFn({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0369a1', '#047857', '#C51E1E', '#0A1E3A'],
        });
      });
    } catch {
      // ignore
    }
  };

  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <div id="express-funnel" className="w-full glass-panel-elevated overflow-hidden text-slate-800 relative">
      {/* Funnel Progress Header */}
      <div className="p-4 sm:p-8 bg-[#0A1E3A] text-white border-b border-slate-800 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/70 border border-red-800/60 rounded-full text-xs font-semibold text-red-300 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C51E1E] animate-pulse" />
              120 Sekunden Expressbewerbung ohne Anschreiben
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Finde heraus, ob Bad und Energie GmbH zu Dir passt
            </h2>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[11px] uppercase tracking-wider text-slate-300 font-mono block">
              Fortschritt
            </span>
            <span className="text-base sm:text-lg font-bold text-sky-300 font-mono tabular-nums">
              Schritt {currentStep} von {totalSteps}
            </span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#C51E1E] via-red-500 to-[#0369a1]"
            initial={{ width: '25%' }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* Step Tabs indicator */}
        <div className="grid grid-cols-4 gap-1 sm:gap-2 mt-3 text-[10px] sm:text-[11px] text-center font-medium">
          <span className={currentStep === 1 ? 'text-sky-300 font-bold' : currentStep > 1 ? 'text-emerald-400' : 'text-slate-300'}>
            <span className="hidden sm:inline">1. Position</span>
            <span className="sm:hidden">1. Rolle</span>
          </span>
          <span className={currentStep === 2 ? 'text-sky-300 font-bold' : currentStep > 2 ? 'text-emerald-400' : 'text-slate-300'}>
            <span className="hidden sm:inline">2. Kenntnisse</span>
            <span className="sm:hidden">2. Skills</span>
          </span>
          <span className={currentStep === 3 ? 'text-sky-300 font-bold' : currentStep > 3 ? 'text-emerald-400' : 'text-slate-300'}>
            <span className="hidden sm:inline">3. Konditionen</span>
            <span className="sm:hidden">3. Details</span>
          </span>
          <span className={currentStep === 4 ? 'text-sky-300 font-bold' : 'text-slate-300'}>
            <span className="hidden sm:inline">4. Kontakt</span>
            <span className="sm:hidden">4. Kontakt</span>
          </span>
        </div>
      </div>

      {/* Wizard Body */}
      <div className="p-4 sm:p-8 lg:p-10">
        <AnimatePresence mode="wait">
          {/* STEP 1: TARGET POSITION & STATUS */}
          {currentStep === 1 && !isSubmitted && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Welche Fachrichtung spricht Dich am meisten an?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Wähle Deine angestrebte Rolle bei der Bad und Energie GmbH in Wetzlar.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: 'Anlagenmechaniker SHK m w d',
                    title: 'Anlagenmechaniker SHK m w d',
                    subtitle: 'Heizungsbau, moderne Wärmepumpen und Badsanierungen',
                    icon: <Wrench className="w-5 h-5 text-[#0369a1]" strokeWidth={1.5} />,
                  },
                  {
                    id: 'Kundendiensttechniker Wärmepumpe m w d',
                    title: 'Kundendiensttechniker Wärmepumpe',
                    subtitle: 'Wartung, Inbetriebnahme Bosch und Brötje, Störungsbehebung',
                    icon: <Zap className="w-5 h-5 text-[#C51E1E]" strokeWidth={1.5} />,
                  },
                  {
                    id: 'Auszubildender SHK 2026 m w d',
                    title: 'Auszubildender SHK Start 2026',
                    subtitle: 'Zukunftssicherer Ausbildungsplatz mit Meisterbegleitung',
                    icon: <GraduationCap className="w-5 h-5 text-[#047857]" strokeWidth={1.5} />,
                  },
                  {
                    id: 'Quereinsteiger und Montagehelfer',
                    title: 'Quereinsteiger und Montagehelfer',
                    subtitle: 'Handwerkliches Geschick mit intensiver Einarbeitung',
                    icon: <Sparkles className="w-5 h-5 text-amber-500" strokeWidth={1.5} />,
                  },
                ].map((item) => {
                  const isSelected = data.role === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleRoleSelect(item.id)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between select-none ${
                        isSelected
                          ? 'border-[#0369a1] bg-sky-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="p-2.5 rounded-xl bg-slate-100">{item.icon}</div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-[#0369a1] bg-[#0369a1]' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                      <div>
                        <strong className="block text-sm font-bold text-slate-900">
                          {item.title}
                        </strong>
                        <span className="text-xs text-slate-500 mt-1 block">
                          {item.subtitle}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status Section */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-600 mb-3">
                  Wie ist Dein aktueller Berufsstatus?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    'In fester Anstellung',
                    'Ausgelernter Geselle',
                    'Meister oder Techniker',
                    'Schüler oder Azubi',
                  ].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusSelect(st)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                        data.status === st
                          ? 'bg-[#0A1E3A] text-white border-[#0A1E3A] shadow-sm'
                          : 'border-slate-200 text-slate-700 hover:border-slate-400 bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 rounded-xl bg-[#C51E1E] hover:bg-[#A51616] text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Weiter zu Kenntnissen und Lizenzen</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: EXPERIENCE & LICENSES */}
          {currentStep === 2 && !isSubmitted && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Welche Praxiserfahrung bringst Du mit?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Wähle alle Bereiche aus, in denen Du bereits selbstständig oder mit Kollegen gearbeitet hast.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Wärmepumpen Luft Wasser Bosch und Brötje',
                  'Moderne Badsanierung und Vorwandtechnik',
                  'Gasbrennwert und Heizungsmodernisierung',
                  'Führerschein Klasse B oder BE Transporter',
                  'Trinkwasserhygiene und CONEL Filtertechnik',
                  'Fehlerdiagnose und elektrische Anbindung',
                ].map((sk) => {
                  const isChecked = data.skills.includes(sk);
                  return (
                    <div
                      key={sk}
                      onClick={() => toggleSkill(sk)}
                      className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all select-none ${
                        isChecked
                          ? 'border-[#0369a1] bg-sky-50/60 font-semibold text-[#0A1E3A]'
                          : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isChecked ? 'bg-[#0369a1] border-[#0369a1] text-white' : 'border-slate-300'
                        }`}
                      >
                        {isChecked && <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />}
                      </div>
                      <span className="text-xs">{sk}</span>
                    </div>
                  );
                })}
              </div>

              {/* Experience Years */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-600 mb-3">
                  Wie viele Jahre Praxiserfahrung hast Du insgesamt?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    'Unter 2 Jahren Berufseinstieg',
                    '2 bis 5 Jahre',
                    'Über 5 Jahre Praxiserfahrung',
                  ].map((exp) => (
                    <button
                      key={exp}
                      type="button"
                      onClick={() => setData((prev) => ({ ...prev, experienceYears: exp }))}
                      className={`p-3 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                        data.experienceYears === exp
                          ? 'bg-[#0A1E3A] text-white border-[#0A1E3A]'
                          : 'border-slate-200 text-slate-700 bg-slate-50'
                      }`}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                  <span>Zurück</span>
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 rounded-xl bg-[#C51E1E] hover:bg-[#A51616] text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Weiter zu Wünschen und Arbeitszeiten</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: CANDIDATE MOTIVATION & PREFERENCES */}
          {currentStep === 3 && !isSubmitted && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Was ist Dir an Deinem neuen Arbeitgeber besonders wichtig?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Wähle die Punkte, die für Deine Arbeitszufriedenheit den Ausschlag geben.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    title: 'Geregelte Arbeitszeiten freitags ab 13:30 Uhr ins Wochenende',
                    desc: 'Keine sinnlosen Dauerüberstunden, verlässlicher Feierabend bei der Familie.',
                    icon: <Clock className="w-4 h-4 text-[#0369a1]" strokeWidth={1.5} />,
                  },
                  {
                    title: 'Überdurchschnittlicher Lohn und Wertschätzung',
                    desc: 'Bezahlung über regionalem Handwerkstarif sowie Urlaubsgeld und Weihnachtsgeld.',
                    icon: <FileCheck className="w-4 h-4 text-[#047857]" strokeWidth={1.5} />,
                  },
                  {
                    title: 'Eigener Firmenwagen und Hilti Werkzeug',
                    desc: 'Neuwertige Vollausstattung, keine Weitergabe von abgenutztem Werkzeug.',
                    icon: <Car className="w-4 h-4 text-[#C51E1E]" strokeWidth={1.5} />,
                  },
                  {
                    title: 'Feste Baustellen im Raum Wetzlar und Gießen',
                    desc: 'Reine Regionaleinsätze ohne Fernmontagen oder Hotelübernachtungen.',
                    icon: <Shield className="w-4 h-4 text-purple-600" strokeWidth={1.5} />,
                  },
                ].map((item) => {
                  const isChecked = data.keyBenefits.includes(item.title);
                  return (
                    <div
                      key={item.title}
                      onClick={() => toggleBenefit(item.title)}
                      className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all select-none ${
                        isChecked
                          ? 'border-[#0369a1] bg-sky-50/50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-slate-100 shrink-0 mt-0.5">{item.icon}</div>
                      <div>
                        <strong className="block text-xs sm:text-sm font-bold text-slate-900">
                          {item.title}
                        </strong>
                        <span className="text-xs text-slate-500 leading-relaxed block mt-0.5">
                          {item.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Start Date */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-600 mb-3">
                  Wann könntest Du frühestens bei uns starten?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    'Sofort oder flexibel',
                    'In 1 bis 2 Monaten Kündigungsfrist',
                    'Nach Absprache',
                  ].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setData((prev) => ({ ...prev, startDate: st }))}
                      className={`p-3 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                        data.startDate === st
                          ? 'bg-[#0A1E3A] text-white border-[#0A1E3A]'
                          : 'border-slate-200 text-slate-700 bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                  <span>Zurück</span>
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 rounded-xl bg-[#C51E1E] hover:bg-[#A51616] text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Letzter Schritt: Schneller Kontakt</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: RAPID CONTACT & 1-CLICK DISCRETION */}
          {currentStep === 4 && !isSubmitted && (
            <motion.form
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div>
                <span className="text-xs font-mono font-semibold text-[#047857] uppercase tracking-wider block mb-1">
                  Schnelle Diskretionsgarantie
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Wie dürfen wir Dich unverbindlich kontaktieren?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Kein Lebenslauf nötig. Sabri Demir meldet sich werktags innerhalb von 24 Stunden diskret bei Dir.
                </p>
              </div>

              {validationError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                  {validationError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Dein Vorname und Nachname *
                  </label>
                  <input
                    type="text"
                    required
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    placeholder="z.B. Alexander Koch"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0369a1] focus:border-[#0369a1] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Telefonnummer oder WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={data.phone}
                    onChange={(e) => setData({ ...data, phone: e.target.value })}
                    placeholder="z.B. 0170 8892341"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0369a1] focus:border-[#0369a1] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Wohnort oder PLZ
                  </label>
                  <input
                    type="text"
                    value={data.location}
                    onChange={(e) => setData({ ...data, location: e.target.value })}
                    placeholder="z.B. 35578 Wetzlar"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0369a1] focus:border-[#0369a1] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    E Mail Adresse (für Eingangsbestätigung)
                  </label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    placeholder="z.B. alexander.koch@beispiel.de"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0369a1] focus:border-[#0369a1] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Bevorzugter Kontaktweg
                  </label>
                  <select
                    value={data.prefContact}
                    onChange={(e) => setData({ ...data, prefContact: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0369a1] focus:border-[#0369a1] outline-none bg-white cursor-pointer"
                  >
                    <option value="whatsapp">WhatsApp kurz und unkompliziert</option>
                    <option value="phone">Telefonat nach Feierabend</option>
                    <option value="email">Per E Mail</option>
                  </select>
                </div>
              </div>

              {/* 1-Click Discretion Guarantee Callout */}
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="discretion-check"
                  checked={data.discretion}
                  onChange={(e) => setData({ ...data, discretion: e.target.checked })}
                  className="mt-1 w-4 h-4 text-[#C51E1E] rounded focus:ring-[#C51E1E] cursor-pointer"
                />
                <label htmlFor="discretion-check" className="text-xs text-slate-700 cursor-pointer">
                  <strong className="block font-bold text-slate-900 mb-0.5">
                    Garantierter Sperrvermerk für ungekündigte Fachkräfte
                  </strong>
                  Deine Bewerbung wird streng vertraulich nach § 26 BDSG behandelt. Dein aktueller Arbeitgeber erfährt zu keinem Zeitpunkt von dieser Interessensbekundung.
                </label>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl font-bold text-base text-white btn-crimson-glow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-5 h-5" strokeWidth={1.5} />
                  <span>Unverbindlich anfragen mit Rückmeldung unter 24 Stunden</span>
                </button>

                <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-600 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-[#047857]" strokeWidth={1.5} />
                    100% kostenlos
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-[#047857]" strokeWidth={1.5} />
                    Kein Anschreiben erforderlich
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-[#047857]" strokeWidth={1.5} />
                    DSGVO und § 26 BDSG geschützt
                  </span>
                </div>
              </div>

              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={prevStep}
                  className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Zurück zu Schritt 3
                </button>
              </div>
            </motion.form>
          )}

          {/* SUCCESS STATE */}
          {isSubmitted && (
            <motion.div
              key="step-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="py-10 text-center space-y-5"
            >
              <div className="flex justify-center pb-2">
                <Logo variant="default" framing="card" size="sm" withLink={false} />
              </div>

              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#047857] mx-auto flex items-center justify-center">
                <CheckCircle className="w-10 h-10" strokeWidth={1.5} />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <h3 className="text-2xl font-bold text-slate-900">
                  Vielen Dank, {data.name}!
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Deine Anfrage für die Stelle als <strong>{data.role}</strong> ist sicher und verschlüsselt bei Geschäftsführer Sabri Demir eingegangen.
                </p>
                <p className="text-xs text-slate-500">
                  Wir melden uns innerhalb von 24 Stunden diskret über Deinen Wunschkanal ({data.prefContact === 'whatsapp' ? 'WhatsApp' : 'Telefon'}).
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto text-left space-y-2 text-xs">
                <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block">
                  Erfasstes Profil
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Position:</span>
                  <span className="font-semibold text-slate-900">{data.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Erfahrung:</span>
                  <span className="font-semibold text-slate-900">{data.experienceYears}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Starttermin:</span>
                  <span className="font-semibold text-slate-900">{data.startDate}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/bewerbung"
                  className="px-6 py-3 rounded-xl bg-[#0A1E3A] hover:bg-[#132B50] text-white text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Vollständiges DINA4 Dossier anzeigen</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setCurrentStep(1);
                  }}
                  className="px-4 py-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Neues Profil starten
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
