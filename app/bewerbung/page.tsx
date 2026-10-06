'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  UploadCloud,
  FileSpreadsheet,
  FileText,
  ChevronRight,
  ShieldCheck,
  Phone,
  CheckCircle2,
  Calendar,
  Clock,
  Car,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const QuizView = dynamic(
  () => import('@/components/views/QuizView').then((mod) => mod.QuizView),
  {
    loading: () => (
      <div className="p-12 text-center text-slate-500 font-sans text-xs">
        Profilfragebogen wird vorbereitet...
      </div>
    ),
  }
);
const VaultView = dynamic(
  () => import('@/components/views/VaultView').then((mod) => mod.VaultView),
  {
    loading: () => (
      <div className="p-12 text-center text-slate-500 font-sans text-xs">
        Dokumentenablage wird vorbereitet...
      </div>
    ),
  }
);
const FormView = dynamic(
  () => import('@/components/views/FormView').then((mod) => mod.FormView),
  {
    loading: () => (
      <div className="p-12 text-center text-slate-500 font-sans text-xs">
        Bewerbungsassistent wird vorbereitet...
      </div>
    ),
  }
);
const PrintA4View = dynamic(
  () => import('@/components/views/PrintA4View').then((mod) => mod.PrintA4View),
  {
    loading: () => (
      <div className="p-12 text-center text-slate-500 font-sans text-xs">
        DINA4 Dossier wird vorbereitet...
      </div>
    ),
  }
);

import { BewerberCheckliste } from '@/components/BewerberCheckliste';
import { CandidateDossier, initialDossierState } from '@/lib/recruiting-types';
import { Logo } from '@/components/Logo';

export default function BewerbungHubPage() {
  const [activeTab, setActiveTab] = useState<'hub' | 'quiz' | 'vault' | 'form' | 'dossier'>('hub');
  const [focusField, setFocusField] = useState<string | null>(null);
  const [dossier, setDossier] = useState<CandidateDossier>(initialDossierState);

  const handleNavigateTab = (
    tabId: 'hub' | 'quiz' | 'vault' | 'form' | 'dossier',
    fieldId?: string
  ) => {
    setActiveTab(tabId);
    if (fieldId) {
      setFocusField(null);
      setTimeout(() => {
        setFocusField(fieldId);
      }, 50);
    } else {
      setFocusField(null);
    }
  };

  // Sync from localStorage and handle URL search parameters
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem('bad_energie_dossier');
        if (saved) {
          setDossier(JSON.parse(saved));
        }
      } catch {
        // ignore
      }

      try {
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const tab = params.get('tab');
          const direct = params.get('direct');
          if (tab === 'vault' || direct === 'true' || tab === 'direct') {
            setActiveTab('vault');
          } else if (tab === 'quiz' || tab === 'form' || tab === 'dossier') {
            setActiveTab(tab);
          }
        }
      } catch {
        // ignore
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const updateDossier = (updater: (prev: CandidateDossier) => CandidateDossier) => {
    setDossier((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem('bad_energie_dossier', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  interface TabItem {
    id: 'hub' | 'quiz' | 'vault' | 'form' | 'dossier';
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    highlight?: boolean;
  }

  const tabs: TabItem[] = [
    { id: 'hub', label: 'Übersicht', icon: Sparkles },
    { id: 'quiz', label: '1. Fragebogen', icon: Sparkles },
    { id: 'vault', label: '2. Dokumente', icon: UploadCloud },
    { id: 'form', label: '3. Formular', icon: FileSpreadsheet },
    { id: 'dossier', label: '4. DINA4 Mappe', icon: FileText, highlight: true },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Sub-Header / Module Navigation Bar - Ultra-Frosted Glass */}
      <section className="bg-white/85 backdrop-blur-2xl border-b border-slate-200/80 sticky top-[58px] sm:top-[64px] z-30 shadow-[0_4px_24px_rgba(10,30,58,0.04)] no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Logo size="xs" variant="transparent" framing="none" withLink={false} />
              <div className="h-7 w-px bg-slate-200/80 hidden sm:block" />
              <div>
                <div className="text-[10px] font-sans uppercase tracking-wider text-slate-500 font-semibold">
                  Bewerbung und Karriereportal Wetzlar
                </div>
                <div className="text-sm sm:text-lg font-extrabold text-[#0A1E3A] leading-snug break-words">
                  {activeTab === 'hub' && 'Übersicht und Vollständigkeitsprüfung'}
                  {activeTab === 'quiz' && 'Schritt 1: Schneller Profilfragebogen'}
                  {activeTab === 'vault' && 'Schritt 2: Dokumente und Zeugnisse hochladen'}
                  {activeTab === 'form' && 'Schritt 3: Strukturiertes Bewerbungsformular'}
                  {activeTab === 'dossier' && 'Schritt 4: DINA4 Bewerbungsmappe zum Ausdrucken'}
                </div>
              </div>
            </div>

            {/* Desktop Tabs with LayoutId Glow */}
            <div className="hidden lg:flex items-center gap-1.5 glass-pill p-1.5 rounded-2xl text-xs font-semibold">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? 'text-[#0A1E3A] font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeGlowTab"
                        className="absolute inset-0 bg-white/95 rounded-xl shadow-[0_2px_12px_rgba(10,30,58,0.08)] border border-white"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      {tab.highlight && <span className="w-1.5 h-1.5 rounded-full bg-[#C51E1E]" />}
                      <Icon className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
                      <span>{tab.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#047857] glass-pill px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
              <span>Paragraph 26 BDSG geschützt</span>
            </div>
          </div>

          {/* Mobile Tab Scroller */}
          <div className="lg:hidden flex items-center gap-1.5 pt-2.5 overflow-x-auto no-scrollbar text-xs font-semibold">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#0A1E3A] text-white shadow-xs'
                      : 'bg-white/80 border border-slate-200 text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <AnimatePresence mode="wait">
          {/* VIEW 0: HUB OVERVIEW */}
          {activeTab === 'hub' && (
            <motion.div
              key="hub-overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-12"
            >
              {/* Hero Banner */}
              <div className="bg-[#0A1E3A] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
                <div className="max-w-3xl space-y-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-300 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#0369a1]" />
                    Bewerbung &amp; Dokumenten-Upload · SHK Karriereportal
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                    Vier einfache Wege zu Deinem neuen SHK Arbeitsplatz
                  </h1>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    Willkommen im SHK Karriereportal: Deine Bewerbung &amp; Dokumenten-Upload gelingen hier in unter zwei Minuten. Vier einfache Wege führen Dich direkt zu Deinem neuen SHK Arbeitsplatz – ob per schneller Express-Bewerbung ohne Lebenslauf, direktem Dokumenten-Upload oder strukturiertem Formular im Meisterteam von Bad &amp; Energie.
                  </p>

                  {/* 2-Wege Entscheidungsbox */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('vault')}
                      className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                          Weg A · Unter 30 Sekunden
                        </span>
                        <UploadCloud className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="text-sm font-bold text-white mb-0.5">
                        Bereits Lebenslauf vorhanden?
                      </div>
                      <p className="text-xs text-slate-300">
                        Direkt PDF &amp; Foto hochladen – kein Fragebogen nötig.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('quiz')}
                      className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider font-mono">
                          Weg B · Interaktiv
                        </span>
                        <Sparkles className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="text-sm font-bold text-white mb-0.5">
                        Kein Lebenslauf zur Hand?
                      </div>
                      <p className="text-xs text-slate-300">
                        4 kurze Fragen – fertiges DINA4 Dossier wird automatisch erstellt.
                      </p>
                    </button>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveTab('quiz')}
                      className="px-6 py-3 rounded-xl btn-crimson-glow text-white font-bold cursor-pointer"
                    >
                      Schnellbewerbung starten
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('vault')}
                      className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold border border-white/20 transition-colors cursor-pointer backdrop-blur-md"
                    >
                      Unterlagen direkt hochladen
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('dossier')}
                      className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold border border-white/20 transition-colors cursor-pointer backdrop-blur-md"
                    >
                      DINA4 Bewerbungsmappe ansehen
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Interactive Bewerber-Checkliste with Micro-Trackers & ProgressGauge */}
              <BewerberCheckliste
                dossier={dossier}
                onNavigateTab={handleNavigateTab}
              />

              {/* 4 Interactive Gateway Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    tabId: 'quiz' as const,
                    badge: 'Schritt 1',
                    title: 'Schneller Profilfragebogen',
                    desc: 'Beantworte 4 kurze Fragen und erstelle direkt Dein Profil für Anlagenmechaniker SHK oder Kundendiensttechniker.',
                    cta: 'Fragebogen öffnen',
                    color: 'text-[#0284C7]',
                    icon: <Sparkles className="w-6 h-6 text-[#0284C7]" strokeWidth={1.5} />,
                  },
                  {
                    tabId: 'vault' as const,
                    badge: 'Schritt 2',
                    title: 'Unterlagen und Zeugnisse',
                    desc: 'Lade vorhandene Zeugnisse, Gesellenbriefe oder Zertifikate ganz einfach und sicher hoch.',
                    cta: 'Unterlagen hochladen',
                    color: 'text-[#047857]',
                    icon: <UploadCloud className="w-6 h-6 text-[#047857]" strokeWidth={1.5} />,
                  },
                  {
                    tabId: 'form' as const,
                    badge: 'Schritt 3',
                    title: 'Online Bewerbungsformular',
                    desc: 'Erfasse persönliche Daten, Praxisschwerpunkte, Wunschkonditionen und Wunschtermin ganz entspannt online.',
                    cta: 'Formular bearbeiten',
                    color: 'text-[#0A1E3A]',
                    icon: <FileSpreadsheet className="w-6 h-6 text-[#0A1E3A]" strokeWidth={1.5} />,
                  },
                  {
                    tabId: 'dossier' as const,
                    badge: 'Schritt 4',
                    title: 'DINA4 Bewerbungsmappe',
                    desc: 'Druckfertige Bewerbungsunterlagen mit allen Angaben für Bad und Energie GmbH Lahn Dill.',
                    cta: 'Bewerbungsmappe öffnen',
                    color: 'text-[#C51E1E]',
                    icon: <FileText className="w-6 h-6 text-[#C51E1E]" strokeWidth={1.5} />,
                  },
                ].map((card) => (
                  <div
                    key={card.tabId}
                    onClick={() => setActiveTab(card.tabId)}
                    className="p-6 rounded-3xl glass-panel shimmer-card hover:-translate-y-1 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-5 group-hover:bg-[#0A1E3A] group-hover:text-white transition-colors">
                        {card.icon}
                      </div>
                      <span className={`text-[10px] font-sans font-bold uppercase tracking-wider block mb-1 ${card.color}`}>
                        {card.badge}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mb-2">{card.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4">{card.desc}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0A1E3A]">
                      <span>{card.cta}</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Regional Assignment Strip */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-5 space-y-2">
                    <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#0284C7]">
                      Regionale Festanstellung
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">
                      Einsätze ohne Fernmontage
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Unsere Monteure sind täglich im Raum Wetzlar, Gießen und dem Lahn Dill Kreis im Einsatz. Keine Hotelübernachtungen, kein unnötiger Fahrstress. Jeden Tag pünktlich Feierabend bei Deiner Familie.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {['Wetzlar', 'Gießen', 'Aßlar', 'Solms', 'Hüttenberg', 'Lahnau', 'Ehringshausen'].map((city) => (
                        <span key={city} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium">
                          {city}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
                    <div>
                      <strong className="block font-bold text-slate-900 mb-1">Betriebsstandort</strong>
                      <p className="text-slate-500">Siegmund-Hiepe-Str. 20, 35578 Wetzlar nahe B49 und A45</p>
                    </div>
                    <div>
                      <strong className="block font-bold text-slate-900 mb-1">Arbeitszeiten</strong>
                      <p className="text-slate-500">Montag bis Donnerstag 07:00 bis 16:45 Uhr, freitags ab 13:30 Uhr Wochenende</p>
                    </div>
                    <div>
                      <strong className="block font-bold text-slate-900 mb-1">Systempartner</strong>
                      <p className="text-slate-500">Buderus, Bosch, NIBE, Alpha Innotec, Viessmann &amp; ELEMENTS</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW 1: QUIZ */}
          {activeTab === 'quiz' && (
            <motion.div
              key="view-quiz"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <QuizView
                dossier={dossier}
                onUpdateDossier={updateDossier}
                onSwitchView={(v) => setActiveTab(v)}
              />
            </motion.div>
          )}

          {/* VIEW 2: VAULT */}
          {activeTab === 'vault' && (
            <motion.div
              key="view-vault"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <VaultView
                dossier={dossier}
                onUpdateDossier={updateDossier}
                onSwitchView={(v) => setActiveTab(v)}
              />
            </motion.div>
          )}

          {/* VIEW 3: FORM */}
          {activeTab === 'form' && (
            <motion.div
              key="view-form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <FormView
                dossier={dossier}
                onUpdateDossier={updateDossier}
                onSwitchView={(v) => setActiveTab(v)}
                initialFocusField={focusField}
              />
            </motion.div>
          )}

          {/* VIEW 4: DOSSIER */}
          {activeTab === 'dossier' && (
            <motion.div
              key="view-dossier"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <PrintA4View
                dossier={dossier}
                onSwitchView={(v) => setActiveTab(v)}
                onUpdateDossier={updateDossier}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
