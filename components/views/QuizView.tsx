'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Wrench,
  Zap,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { CandidateDossier } from '@/lib/recruiting-types';

interface QuizViewProps {
  dossier: CandidateDossier;
  onUpdateDossier: (updater: (prev: CandidateDossier) => CandidateDossier) => void;
  onSwitchView: (view: 'quiz' | 'vault' | 'form' | 'dossier') => void;
}

export function QuizView({ dossier, onUpdateDossier, onSwitchView }: QuizViewProps) {
  const [step, setStep] = useState<number>(1);

  const totalQuizSteps = 4;

  const positions = [
    {
      id: 'Anlagenmechaniker SHK m w d Heizung und Sanitärtechnik',
      title: 'Anlagenmechaniker SHK m w d',
      desc: 'Heizungsneubau, Wärmepumpen und Badsanierungen',
      icon: <Wrench className="w-5 h-5 text-[#0284C7]" strokeWidth={1.5} />,
    },
    {
      id: 'Kundendienstmonteur SHK m w d Wärmepumpentechnik',
      title: 'Kundendienstmonteur SHK m w d',
      desc: 'Wartung, Inbetriebnahme Bosch und Brötje, Fehlerdiagnose',
      icon: <Zap className="w-5 h-5 text-[#C51E1E]" strokeWidth={1.5} />,
    },
    {
      id: 'Auszubildender zum Anlagenmechaniker SHK Start 2026',
      title: 'Auszubildender SHK Start 2026',
      desc: 'Zukunftssicherer Ausbildungsplatz mit Meisterbegleitung',
      icon: <GraduationCap className="w-5 h-5 text-[#059669]" strokeWidth={1.5} />,
    },
    {
      id: 'Montagehelfer und Quereinsteiger m w d',
      title: 'Quereinsteiger und Montagehelfer',
      desc: 'Handwerkliches Geschick mit intensiver Einarbeitungsphase',
      icon: <Sparkles className="w-5 h-5 text-amber-500" strokeWidth={1.5} />,
    },
  ];

  const skillOptions = [
    'Wärmepumpen Luft Wasser Bosch und Brötje',
    'Badsanierung und Vorwandinstallation',
    'Gasbrennwert und Heizungsmodernisierung',
    'Trinkwasserhygiene und Filtertechnik CONEL',
    'Störungssuche und elektrische Verdrahtung',
    'Führerschein Klasse B PKW',
  ];

  const styleOptions = [
    {
      title: 'Höchste Ausführungsqualität und Sauberkeit',
      value:
        'Qualitätsorientiert und sauber: Baustellen verlassen wie vorgefunden, exakte Rohrisolierung, zufriedene Kunden.',
      desc: 'Ich lege Wert auf saubere Trassen, akkurate Isolierung und respektvollen Kundenkontakt.',
    },
    {
      title: 'Technologie und Energiewende',
      value:
        'Technikbegeistert und lösungsorientiert: Selbstständige Inbetriebnahme modernster Wärmepumpen und Digitalsteuerung.',
      desc: 'Ich brenne für regenerative Systeme, Hydraulikabgleich und digitale Heizungssteuerungen.',
    },
    {
      title: 'Teamgeist und Zuverlässigkeit',
      value:
        'Teamgeist und Verlässlichkeit: Feste Absprachen, kollegiales Miteinander und pünktlicher Feierabend ohne Chaos.',
      desc: 'Gute Stimmung auf Montage, klare Kommunikation mit dem Meister und verlässliche Absprachen.',
    },
  ];

  const handlePositionChange = (pos: string) => {
    onUpdateDossier((prev) => ({
      ...prev,
      position: pos,
    }));
  };

  const handleSkillToggle = (skill: string) => {
    onUpdateDossier((prev) => {
      const exists = prev.skills.includes(skill);
      return {
        ...prev,
        skills: exists ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
      };
    });
  };

  const handleStyleChange = (styleValue: string) => {
    onUpdateDossier((prev) => {
      const newLetter = `Sehr geehrter Herr Demir,

mit großem Interesse bewerbe ich mich als ${prev.position} bei der Bad und Energie GmbH Lahn Dill in Wetzlar.

Mein handwerklicher Arbeitsstil: ${styleValue}
Meine praktischen Fachschwerpunkte: ${prev.skills.join(', ')}.

Als Handwerker aus der Region schätze ich einen verlässlichen Meisterbetrieb mit direkter Kommunikation, modernem Equipment und geregelten Arbeitszeiten. Über ein vertrauliches Kennenlernen in Wetzlar freue ich mich.

Mit freundlichen Grüßen,
${prev.fullName || 'Alexander Koch'}`;

      return {
        ...prev,
        workStyle: styleValue,
        coverLetter: newLetter,
      };
    });
  };

  const progressPercent = (step / totalQuizSteps) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Interaktiver Profilfragebogen
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Beantworte 3 kurze Fragen zu Deinem Handwerk. Unser System generiert automatisch Dein Profil und Dein Anschreiben.
        </p>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
          <span>
            {step === 1 && 'Schritt 1 von 4: Fachposition und Ausrichtung'}
            {step === 2 && 'Schritt 2 von 4: Praxiserfahrung und Kernkompetenzen'}
            {step === 3 && 'Schritt 3 von 4: Handwerklicher Arbeitsstil und Werte'}
            {step === 4 && 'Schritt 4 von 4: Generiertes Profil und Anschreiben'}
          </span>
          <span className="text-[#0284C7] font-mono tabular-nums">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#C51E1E] to-[#0284C7]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step Body */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Welche Position entspricht Deinem Werdegang?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Wähle Deinen angestrebten Schwerpunkt bei der Bad und Energie GmbH Lahn Dill.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {positions.map((p) => {
                const isSelected = dossier.position === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handlePositionChange(p.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                      isSelected
                        ? 'border-[#0A1E3A] bg-slate-50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-slate-100 shrink-0 mt-0.5">{p.icon}</div>
                    <div className="flex-1">
                      <strong className="block text-sm text-slate-900 font-bold">{p.title}</strong>
                      <span className="text-xs text-slate-500 mt-0.5 block">{p.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-[#0A1E3A] hover:bg-[#132B50] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <span>Weiter zu Praxiserfahrung</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Welche Praxiserfahrung bringst Du mit?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Wähle alle Bereiche aus, in denen Du bereits selbstständig gearbeitet hast.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {skillOptions.map((sk) => {
                const isChecked = dossier.skills.includes(sk);
                return (
                  <div
                    key={sk}
                    onClick={() => handleSkillToggle(sk)}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all select-none ${
                      isChecked
                        ? 'border-[#0284C7] bg-sky-50/60 font-semibold text-[#0A1E3A]'
                        : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        isChecked ? 'bg-[#0284C7] border-[#0284C7] text-white' : 'border-slate-300'
                      }`}
                    >
                      {isChecked && <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />}
                    </div>
                    <span className="text-xs">{sk}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                <span>Zurück</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 bg-[#0A1E3A] hover:bg-[#132B50] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <span>Weiter zu Arbeitsstil</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Was zeichnet Deinen Arbeitsstil aus?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Hieraus formuliert der Generator Dein passgenaues Anschreiben für Sabri Demir.
              </p>
            </div>

            <div className="space-y-3">
              {styleOptions.map((item) => {
                const isSelected = dossier.workStyle === item.value;
                return (
                  <div
                    key={item.title}
                    onClick={() => handleStyleChange(item.value)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                      isSelected
                        ? 'border-[#0A1E3A] bg-slate-50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#0A1E3A] bg-[#0A1E3A]' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <strong className="block text-xs font-bold text-slate-900">
                        {item.title}
                      </strong>
                      <span className="text-xs text-slate-500 mt-0.5 block">{item.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                <span>Zurück</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-2.5 bg-[#C51E1E] hover:bg-[#A51616] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Profil jetzt erstellen</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[#059669] text-xs font-bold">
                  <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
                  Profil erfolgreich generiert
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Dein Bewerbungsprofil für Bad und Energie GmbH
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-[#0284C7] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Neu konfigurieren</span>
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4 text-xs">
              <div>
                <strong className="text-slate-500 font-mono uppercase tracking-wider text-[10px] block">
                  Angestrebte Position
                </strong>
                <p className="font-bold text-[#0A1E3A] text-sm mt-0.5">{dossier.position}</p>
              </div>

              <div>
                <strong className="text-slate-500 font-mono uppercase tracking-wider text-[10px] block">
                  Generiertes Anschreiben
                </strong>
                <div className="p-3.5 bg-white rounded-lg border border-slate-200 text-slate-700 leading-relaxed font-mono text-[11px] whitespace-pre-line mt-1">
                  {dossier.coverLetter}
                </div>
              </div>

              <div>
                <strong className="text-slate-500 font-mono uppercase tracking-wider text-[10px] block">
                  Extrahierte Kernkompetenzen ({dossier.skills.length})
                </strong>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {dossier.skills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => onSwitchView('form')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
                <span>Kontaktdaten im Formular ergänzen</span>
              </button>
              <button
                type="button"
                onClick={() => onSwitchView('dossier')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#C51E1E] hover:bg-[#A51616] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Direkt in die DINA4 Bewerbungsmappe übernehmen</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
