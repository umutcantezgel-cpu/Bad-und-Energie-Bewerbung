'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  MapPin,
  Phone,
  MessageSquare,
  ExternalLink,
  Award,
  FileText,
  Lock,
  Clock,
  Mail,
  CheckCircle2,
  Building2,
  Scale,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp-utils';

export function Footer() {
  const footerWhatsAppUrl = buildWhatsAppUrl(
    'Hallo Herr Demir, ich habe eine Frage zu den offenen Stellen bei Bad und Energie.'
  );

  const handleOpenCookieSettings = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bad_energie_open_cookie_modal'));
    }
  };

  const regionalLocations = [
    { name: 'Wetzlar (Zentrale)', highlighted: true },
    { name: 'Gießen', highlighted: false },
    { name: 'Aßlar', highlighted: false },
    { name: 'Solms', highlighted: false },
    { name: 'Hüttenberg', highlighted: false },
    { name: 'Lahnau', highlighted: false },
    { name: 'Ehringshausen', highlighted: false },
    { name: 'Wettenberg', highlighted: false },
    { name: 'Braunfels', highlighted: false },
  ];

  return (
    <footer
      role="contentinfo"
      className="w-full bg-[#0A1E3A] text-slate-300 mt-20 border-t border-slate-700/50 relative overflow-hidden no-print"
    >
      {/* Subtle Ambient Radial Lighting in Footer Background */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0284C7]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#C51E1E]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        {/* 1. PRE-FOOTER CONVERSION BAR (Exit-Intent Touchpoint) */}
        <section
          aria-label="Unverbindlicher Erstkontakt"
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 lg:p-10 mb-14 shadow-2xl transition-all duration-300 hover:border-white/30"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8">
            {/* Left: Direct Executive Reassurance */}
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
                <span>100 Prozent Diskretion garantiert nach Paragraph 26 Bundesdatenschutzgesetz</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                Lieber erst einmal unverbindlich sprechen?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Kein Lebenslauf nötig. Schreib Geschäftsführer Diplomingenieur Sabri Demir direkt über WhatsApp oder ruf unkompliziert in
                der Werkstatt an. Absolute Diskretion garantiert, kein Anruf beim aktuellen
                Arbeitgeber.
              </p>
            </div>

            {/* Right: Instant Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {/* WhatsApp Direct Contact */}
              <a
                href={footerWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#047857] hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                title="WhatsApp Chat direkt mit Sabri Demir"
              >
                <MessageSquare className="w-4 h-4 text-emerald-50" strokeWidth={1.5} />
                <span>WhatsApp Direktkontakt</span>
              </a>

              {/* Direct Phone Call */}
              <a
                href="tel:0644142956"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                title="Direkt in der Werkstatt anrufen"
              >
                <Phone className="w-4 h-4 text-sky-300" strokeWidth={1.5} />
                <span>(06441) 42956</span>
              </a>
            </div>
          </div>
        </section>

        {/* 2. FOUR-COLUMN MAIN FOOTER GRID */}
        <nav
          aria-label="Footer Navigation"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-12"
        >
          <h2 className="sr-only">Unternehmensdaten, Standorte &amp; Navigation</h2>
          {/* Column 1: Corporate Trust & Accreditation */}
          <div className="space-y-4">
            <div className="space-y-3">
              <Logo
                variant="transparent"
                framing="none"
                size="sm"
                withLink={true}
                withGeoBadge={false}
              />
              <div>
                <strong className="block text-sm font-bold text-white">
                  Bad &amp; Energie GmbH Lahn Dill
                </strong>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  100 Jahre Meisterbetrieb (1926–2026) für Badarchitektur, Wärmepumpen &amp; Haustechnik.
                </p>
              </div>
            </div>

            {/* Accreditations & Badges */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
              <div className="flex items-start gap-2">
                <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>Eingetragen in die Handwerksrolle der Handwerkskammer Wiesbaden</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck
                  className="w-4 h-4 text-[#059669] shrink-0 mt-0.5"
                  strokeWidth={1.5}
                />
                <span>Mitglied der Innung Sanitär Heizung und Klimatechnik Lahn Dill</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2
                  className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5"
                  strokeWidth={1.5}
                />
                <span>Ausgezeichneter Ausbildungsbetrieb im Handwerk</span>
              </div>
            </div>
          </div>

          {/* Column 2: Stellenangebote & Schnelleinstieg */}
          <div className="space-y-3.5">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
              Stellenangebote &amp; Einstieg
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link
                  href="/#stellen"
                  className="hover:text-white transition-colors block leading-snug group"
                >
                  <span className="group-hover:text-sky-300 transition-colors font-medium">
                    Anlagenmechaniker für Sanitär Heizung und Klimatechnik m w d
                  </span>
                  <span className="block text-[11px] text-slate-400 font-mono">
                    Heizung &amp; Sanitär · Vollzeitbeschäftigung
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#stellen"
                  className="hover:text-white transition-colors block leading-snug group"
                >
                  <span className="group-hover:text-sky-300 transition-colors font-medium">
                    Kundendiensttechniker für Wärmepumpensysteme m w d
                  </span>
                  <span className="block text-[11px] text-slate-400 font-mono">
                    Wärmepumpen (Buderus, Bosch, NIBE, Alpha Innotec, Viessmann) · Wetzlar
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#stellen"
                  className="hover:text-white transition-colors block leading-snug group"
                >
                  <span className="group-hover:text-sky-300 transition-colors font-medium">
                    Ausbildung zum Anlagenmechaniker SHK 2026
                  </span>
                  <span className="block text-[11px] text-amber-400 font-mono">
                    Start August 2026 · Feste Übernahmegarantie
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#stellen"
                  className="hover:text-white transition-colors block leading-snug group"
                >
                  <span className="group-hover:text-sky-300 transition-colors font-medium">
                    Quereinsteiger Haustechnik und Montagehelfer
                  </span>
                  <span className="block text-[11px] text-slate-400 font-mono">
                    Mit Führerschein Klasse B (PKW)
                  </span>
                </Link>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                href="/bewerbung"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
              >
                <span>Bewerberportal (Fragebogen, Upload, DINA4 Formular)</span>
                <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
              </Link>
            </div>
          </div>

          {/* Column 3: Einsatzgebiet & Regionaler Radius (Local SEO Anchor) */}
          <div className="space-y-3.5">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
              Einsatzgebiet Mittelhessen (max. 35 km)
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Keine bundesweiten Montagen. Feste Baustellen und Kundendienst im Umkreis von:
            </p>

            {/* Pill-Tags */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {regionalLocations.map((loc) => (
                <span
                  key={loc.name}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                    loc.highlighted
                      ? 'bg-[#132F58] text-sky-200 border border-sky-700/60 font-bold'
                      : 'bg-slate-800/80 text-slate-300 border border-slate-700/50'
                  }`}
                >
                  {loc.name}
                </span>
              ))}
            </div>

            {/* Work Schedule Badge */}
            <div className="pt-2">
              <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                  <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Freitags ab 13:30 Uhr ins Wochenende</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  30 Tage garantierter Erholungsurlaub • Keine Notdienst Pflicht am Wochenende
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Standort & Direktkontakt */}
          <div className="space-y-3.5">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
              Standort und Direktkontakt
            </div>

            <address className="not-italic space-y-3 text-xs">
              <div className="flex items-start gap-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>
                  Siegmund-Hiepe-Str. 20
                  <br />
                  35578 Wetzlar (Hessen)
                </span>
              </div>

              <div className="space-y-1.5 font-mono text-slate-300">
                <a
                  href="tel:0644142956"
                  className="flex items-center gap-2 text-white hover:text-sky-300 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#0284C7] shrink-0" strokeWidth={1.5} />
                  <span>(06441) 42956</span>
                </a>
                <p className="text-[11px] text-slate-400 pl-5.5 font-sans">
                  Montag bis Donnerstag von 07:00 bis 16:45 Uhr, Freitag von 07:00 bis 13:30 Uhr
                </p>

                <a
                  href="mailto:info@bad-energie.de"
                  className="flex items-center gap-2 text-white hover:text-sky-300 transition-colors pt-1"
                >
                  <Mail className="w-3.5 h-3.5 text-[#0284C7] shrink-0" strokeWidth={1.5} />
                  <span>info@bad-energie.de</span>
                </a>
              </div>
            </address>

            {/* Bridge Link to Main Consumer Website */}
            <div className="pt-2 border-t border-slate-800">
              <a
                href="https://bad-energie.de"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors group"
              >
                <span>Zur Kunden Website für Bad und Heizung</span>
                <ExternalLink
                  className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  strokeWidth={1.5}
                />
              </a>
            </div>
          </div>
        </nav>

        {/* 3. BOTTOM LEGAL & COMPLIANCE BAR */}
        <div className="pt-8 border-t border-slate-700/50 flex flex-col lg:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          {/* Left: Copyright & Register data */}
          <div className="space-y-1 text-center lg:text-left">
            <p>© 2026 Bad und Energie GmbH Lahn Dill. Alle Rechte vorbehalten.</p>
            <p className="text-[11px] text-slate-400 font-mono">
              Amtsgericht Wetzlar HRB 2449 • USt ID DE 346 648 448 • Geschäftsführer: Diplomingenieur Sabri Demir
            </p>
          </div>

          {/* Right: Mandatory Legal Links */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-x-6 gap-y-2 text-xs">
            <Link href="/impressum" className="hover:text-white transition-colors">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:text-white transition-colors">
              Datenschutzerklärung
            </Link>
            <Link
              href="/datenschutz#bewerber-datenschutz"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Lock className="w-3 h-3 text-emerald-400" strokeWidth={1.5} />
              <span>Bewerber Datenschutz nach Paragraph 26 BDSG</span>
            </Link>
            <button
              type="button"
              onClick={handleOpenCookieSettings}
              className="hover:text-white transition-colors underline decoration-slate-600 underline-offset-4 cursor-pointer"
            >
              Cookie Einstellungen
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
