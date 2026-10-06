'use client';

import React, { useState, useSyncExternalStore, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Settings, ChevronDown, Check, X } from 'lucide-react';
import Link from 'next/link';

interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
  timestamp: string;
  consentId: string;
}

const STORAGE_KEY = 'bad_energie_cookie_consent_v2';

function subscribeStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('bad_energie_consent_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('bad_energie_consent_change', callback);
  };
}

function getConsentSnapshot(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

function getConsentServerSnapshot(): string | null {
  return null;
}

export function CookieConsent() {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const rawConsent = useSyncExternalStore(
    subscribeStorage,
    getConsentSnapshot,
    getConsentServerSnapshot
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [functional, setFunctional] = useState(false);

  // Global listener to re-open modal from footer or links
  React.useEffect(() => {
    const handleOpenModal = () => setIsModalOpen(true);
    window.addEventListener('bad_energie_open_cookie_modal', handleOpenModal);
    return () => window.removeEventListener('bad_energie_open_cookie_modal', handleOpenModal);
  }, []);

  // Accordion details toggle inside modal
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    necessary: false,
    analytics: false,
    functional: false,
  });

  const parsedConsent: ConsentPreferences | null = React.useMemo(() => {
    if (!rawConsent) return null;
    try {
      return JSON.parse(rawConsent);
    } catch {
      return null;
    }
  }, [rawConsent]);

  const hasInteracted = Boolean(parsedConsent);

  const consentMeta = React.useMemo(() => {
    if (parsedConsent) {
      return {
        id: parsedConsent.consentId || 'CONSENT-WETZLAR-2449-2026',
        time: parsedConsent.timestamp || '2026-10-01 04:10:50 UTC',
      };
    }
    return {
      id: 'CONSENT-WETZLAR-2449-2026',
      time: '2026-10-01 04:10:50 UTC',
    };
  }, [parsedConsent]);

  const saveConsent = useCallback(
    (allowAnalytics: boolean, allowFunctional: boolean) => {
      const pref: ConsentPreferences = {
        necessary: true,
        analytics: allowAnalytics,
        functional: allowFunctional,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        consentId: consentMeta.id,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pref));
        window.dispatchEvent(new Event('bad_energie_consent_change'));
      } catch {
        // ignore in incognito
      }
      setAnalytics(allowAnalytics);
      setFunctional(allowFunctional);
      setIsModalOpen(false);
    },
    [consentMeta.id]
  );

  const handleAcceptAll = () => saveConsent(true, true);
  const handleEssentialOnly = () => saveConsent(false, false);
  const handleSaveSelection = () => saveConsent(analytics, functional);

  const toggleAccordion = (section: string) => {
    setOpenAccordions((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (!isClient) return null;

  return (
    <>
      {/* Floating Re-Open Button when banner is closed */}
      {hasInteracted && !isModalOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-4 left-4 z-40 bg-[#0A1E3A] hover:bg-[#1E293B] text-white p-2.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold shadow-lg border border-slate-700/60 flex items-center gap-2 cursor-pointer no-print focus-visible:ring-2 focus-visible:ring-[#0284C7]"
          aria-label="Datenschutz und Cookie Einstellungen anpassen"
        >
          <Shield className="w-3.5 h-3.5 text-[#059669]" strokeWidth={1.5} />
          <span className="hidden sm:inline">Cookie Einstellungen</span>
          <span className="sm:hidden text-[10px]">Cookies</span>
        </motion.button>
      )}

      {/* Layer 1: Compact Sticky Pill Banner */}
      <AnimatePresence>
        {!hasInteracted && !isModalOpen && (
          <aside
            id="cookie-consent-banner"
            aria-label="Cookie Einwilligung"
            className="fixed bottom-4 sm:bottom-6 inset-x-4 sm:inset-x-auto sm:right-6 sm:max-w-xl z-50 no-print"
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="glass-panel p-5 sm:p-6 text-slate-800 shadow-[0_8px_32px_rgba(10,30,58,0.12)] border border-white/95 relative"
            >
              {/* Subtle top red glow bar */}
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#C51E1E] to-transparent opacity-90" />

              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7] shrink-0">
                    <Lock className="w-4 h-4 text-[#0284C7]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#0A1E3A] tracking-tight flex items-center gap-2">
                      Privatsphäre und Präferenzen
                    </h2>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Bad und Energie GmbH Lahn Dill
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  TDDDG § 25
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Wir nutzen essenzielle Cookies zur Bereitstellung der Website. Für statistische
                Auswertungen und die Optimierung unseres Bewerber-Hubs bitten wir um Ihre
                Zustimmung.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3.5">
                <button
                  type="button"
                  onClick={handleEssentialOnly}
                  className="order-2 sm:order-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
                  Nur essenzielle Cookies
                </button>

                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="order-1 sm:order-2 w-full px-4 py-2.5 rounded-xl btn-crimson-glow text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-white" strokeWidth={1.5} />
                  Alle akzeptieren
                </button>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-xs gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-[#0284C7] hover:text-[#0369A1] font-medium inline-flex items-center gap-1.5 underline underline-offset-4 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Einstellungen anpassen
                </button>

                <div className="flex items-center space-x-3 text-slate-500 text-xs">
                  <Link href="/datenschutz" className="hover:text-slate-900 transition-colors">
                    Datenschutz
                  </Link>
                  <span>·</span>
                  <Link href="/impressum" className="hover:text-slate-900 transition-colors">
                    Impressum
                  </Link>
                </div>
              </div>
            </motion.div>
          </aside>
        )}
      </AnimatePresence>

      {/* Layer 2: Detailed Modal Preference Center */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            id="cookie-consent-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md no-print overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-3xl my-8 flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200 text-slate-800"
            >
              {/* Top Accent Strip */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#0A1E3A] via-[#0284C7] to-[#C51E1E]" />

              {/* Modal Header */}
              <div className="px-6 sm:px-8 pt-6 pb-5 bg-white border-b border-slate-100 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-[#0A1E3A] shrink-0">
                      <Shield className="w-6 h-6 text-[#0A1E3A]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 id="cookie-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                          Datenschutz- & Cookie-Präferenzen
                        </h2>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                          TDDDG / DSGVO
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Bad & Energie GmbH Lahn-Dill • Transparente Verwaltung Ihrer Datenautonomie
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsModalOpen(false)}
                    aria-label="Modal schließen"
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  Wir setzen Technologien ein, um Ihnen ein stabiles Webportal und intuitive Bewerbungsprozesse zu ermöglichen. Sie bestimmen frei, welche optionalen Dienste (z. B. Reichweitenanalyse oder interaktive Kartenansichten) aktiviert werden. Sie können diese Auswahl jederzeit mit Wirkung für die Zukunft ändern.
                </p>
              </div>

              {/* Modal Content Sections */}
              <div className="px-6 sm:px-8 py-5 space-y-4 bg-slate-50/70 max-h-[60vh] overflow-y-auto">
                {/* 1. Technisch Notwendig (Locked) */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
                        <h3 className="text-sm font-bold text-slate-900">
                          Technisch notwendige Dienste
                        </h3>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Essenziell
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Unerlässlich für grundlegende Kernfunktionen der Website, CSRF Schutz, Formulardaten Integrität im SHK Bewerber Dossier und Speicherung Ihrer getroffenen Datenschutzeinstellungen.
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold">
                      <Lock className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Immer aktiv</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleAccordion('necessary')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#0284C7] hover:text-[#0369A1] transition-colors cursor-pointer"
                  >
                    <span>3 Cookies einsehen</span>
                    <ChevronDown
                      className={`w-4 h-4 transform transition-transform ${
                        openAccordions.necessary ? 'rotate-180' : ''
                      }`}
                      strokeWidth={1.5}
                    />
                  </button>

                  {openAccordions.necessary && (
                    <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-200 text-xs mt-2">
                      <table className="w-full text-left">
                        <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="py-2 px-3">Name</th>
                            <th className="py-2 px-3">Anbieter</th>
                            <th className="py-2 px-3">Zweck</th>
                            <th className="py-2 px-3 text-right">Gültigkeit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-600 text-[11px] font-mono">
                          <tr>
                            <td className="py-2 px-3 font-semibold text-slate-900">be_session_id</td>
                            <td className="py-2 px-3 font-sans">Bad & Energie GmbH</td>
                            <td className="py-2 px-3 font-sans">Sitzungsspeicher & State im Bewerber-Hub</td>
                            <td className="py-2 px-3 font-sans text-right">Session</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-semibold text-slate-900">cookie_consent_status</td>
                            <td className="py-2 px-3 font-sans">Bad & Energie GmbH</td>
                            <td className="py-2 px-3 font-sans">Dokumentiert Ihre Auswahl im Präferenzcenter</td>
                            <td className="py-2 px-3 font-sans text-right">12 Monate</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-semibold text-slate-900">csrf_token_auth</td>
                            <td className="py-2 px-3 font-sans">Bad & Energie GmbH</td>
                            <td className="py-2 px-3 font-sans">Prävention gegen Cross-Site-Request-Forgery</td>
                            <td className="py-2 px-3 font-sans text-right">Session</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 2. Analyse & Performance */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
                        <h3 className="text-sm font-bold text-slate-900">
                          Analyse und Performancemessung
                        </h3>
                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                          Optional
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Erlaubt uns die pseudonyme statistische Auswertung der Besuchernutzung. Wir erkennen Ladezeiten Engpässe und vereinfachen Hürden beim Hochladen von Bewerbungsdokumenten. Daten werden nicht für Werbeprofile weitergegeben.
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={analytics}
                      onClick={() => setAnalytics(!analytics)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ${
                        analytics ? 'bg-[#0284C7]' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transform transition duration-200 ${
                          analytics ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleAccordion('analytics')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#0284C7] hover:text-[#0369A1] transition-colors cursor-pointer"
                  >
                    <span>2 Cookies & Tracker einsehen</span>
                    <ChevronDown
                      className={`w-4 h-4 transform transition-transform ${
                        openAccordions.analytics ? 'rotate-180' : ''
                      }`}
                      strokeWidth={1.5}
                    />
                  </button>

                  {openAccordions.analytics && (
                    <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-200 text-xs mt-2">
                      <table className="w-full text-left">
                        <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="py-2 px-3">Name</th>
                            <th className="py-2 px-3">Anbieter</th>
                            <th className="py-2 px-3">Zweck</th>
                            <th className="py-2 px-3 text-right">Gültigkeit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-600 text-[11px] font-mono">
                          <tr>
                            <td className="py-2 px-3 font-semibold text-slate-900">_pk_id</td>
                            <td className="py-2 px-3 font-sans">Matomo / PostHog (EU-Hosting)</td>
                            <td className="py-2 px-3 font-sans">Anonyme Metriken der Seitenaufrufe</td>
                            <td className="py-2 px-3 font-sans text-right">13 Monate</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-semibold text-slate-900">perf_load_metrics</td>
                            <td className="py-2 px-3 font-sans">Bad & Energie GmbH</td>
                            <td className="py-2 px-3 font-sans">Monitoring von Asset-Latenz & Bildkompression</td>
                            <td className="py-2 px-3 font-sans text-right">30 Tage</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 3. Funktionale Erweiterungen & Drittmedien */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#C51E1E]" />
                        <h3 className="text-sm font-bold text-slate-900">
                          Funktionale Erweiterungen & Drittmedien
                        </h3>
                        <span className="text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
                          Optional
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Ermöglicht interaktive Inhalte wie die Anfahrtskarte zu unserem Meisterbetrieb in der Siegmund-Hiepe-Str. 20 (Google Maps) und Videotouren der Sanierungsausstellung.
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={functional}
                      onClick={() => setFunctional(!functional)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ${
                        functional ? 'bg-[#0284C7]' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transform transition duration-200 ${
                          functional ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleAccordion('functional')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#0284C7] hover:text-[#0369A1] transition-colors cursor-pointer"
                  >
                    <span>2 Dienste & Tags einsehen</span>
                    <ChevronDown
                      className={`w-4 h-4 transform transition-transform ${
                        openAccordions.functional ? 'rotate-180' : ''
                      }`}
                      strokeWidth={1.5}
                    />
                  </button>

                  {openAccordions.functional && (
                    <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-200 text-xs mt-2">
                      <table className="w-full text-left">
                        <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="py-2 px-3">Name</th>
                            <th className="py-2 px-3">Anbieter</th>
                            <th className="py-2 px-3">Zweck</th>
                            <th className="py-2 px-3 text-right">Gültigkeit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-600 text-[11px] font-mono">
                          <tr>
                            <td className="py-2 px-3 font-semibold text-slate-900">maps_view_coord</td>
                            <td className="py-2 px-3 font-sans">Google Ireland Ltd.</td>
                            <td className="py-2 px-3 font-sans">Karten-Zentrierung auf Wetzlar / Lahn-Dill-Kreis</td>
                            <td className="py-2 px-3 font-sans text-right">6 Monate</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-semibold text-slate-900">video_embed_state</td>
                            <td className="py-2 px-3 font-sans">Bad & Energie GmbH</td>
                            <td className="py-2 px-3 font-sans">Player Einstellungen für SHK Installationsvideos</td>
                            <td className="py-2 px-3 font-sans text-right">Session</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="px-6 sm:px-8 py-5 bg-white border-t border-slate-100 flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={handleEssentialOnly}
                    className="w-full px-4 py-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Alle ablehnen
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSelection}
                    className="w-full px-4 py-3 rounded-xl text-xs font-bold text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                  >
                    Auswahl speichern
                  </button>
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="w-full px-4 py-3 rounded-xl text-xs font-bold text-white bg-[#C51E1E] hover:bg-[#A51616] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-white" strokeWidth={1.5} />
                    <span>Alle akzeptieren</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span>ID: {consentMeta.id}</span>
                    <span>•</span>
                    <span>{consentMeta.time}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      href="/datenschutz"
                      onClick={() => setIsModalOpen(false)}
                      className="underline hover:text-slate-900"
                    >
                      Datenschutzerklärung
                    </Link>
                    <Link
                      href="/impressum"
                      onClick={() => setIsModalOpen(false)}
                      className="underline hover:text-slate-900"
                    >
                      Impressum
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
