import React from 'react';
import {
  Clock,
  Award,
  Car,
  Smartphone,
  Flame,
  Users,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Wrench,
  ShieldCheck,
  Shield,
  PhoneCall,
  CheckCircle,
  UploadCloud,
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const HeroExpressFunnel = dynamic(
  () => import('@/components/HeroExpressFunnel').then((mod) => mod.HeroExpressFunnel),
  {
    loading: () => (
      <div className="w-full glass-panel-elevated overflow-hidden text-slate-800 relative rounded-3xl min-h-[460px] border border-slate-200/80 shadow-xl bg-white">
        <div className="p-4 sm:p-8 bg-[#0A1E3A] text-white border-b border-slate-800">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/70 border border-red-800/60 rounded-full text-xs font-semibold text-red-300 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C51E1E]" />
            120 Sekunden Expressbewerbung ohne Anschreiben
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Finde heraus, ob Bad und Energie GmbH zu Dir passt
          </h2>
        </div>
        <div className="p-6 sm:p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#C51E1E] border-t-transparent animate-spin mb-3" />
          <p className="text-xs text-slate-500 font-sans">Expressbewerbung lädt...</p>
        </div>
      </div>
    ),
  }
);
import { Logo } from '@/components/Logo';
import { TrustStrip } from '@/components/trust/TrustStrip';
import { ProcessSteps } from '@/components/trust/ProcessSteps';

import { SalaryCalculatorClientWrapper as SalaryCalculator } from '@/components/pricing/SalaryCalculatorClientWrapper';
import { InteractiveMapClientWrapper as InteractiveMap } from '@/components/maps/InteractiveMapClientWrapper';
import { ReviewCarousel } from '@/components/reviews/ReviewCarousel';
import { AIAnswerBox } from '@/components/seo/AIAnswerBox';

import { GoogleReviewsBadge } from '@/components/reviews/GoogleReviewsBadge';
import { DirectContactCard } from '@/components/contact/DirectContactCard';
import { LeadQuickForm } from '@/components/contact/LeadQuickForm';

export const metadata = {
  title: 'Jobs Wetzlar | Heizungsbauer & Monteure | Bad & Energie',
  description:
    'SHK Handwerker Jobs in Wetzlar: Top Vergütung, 30 Tage Urlaub, freitags ab 13:30 Uhr frei & Firmenwagen. Jetzt in 60 Sek. bewerben bei Bad & Energie!',
  alternates: {
    canonical: 'https://karriere.bad-energie.de',
  },
  openGraph: {
    title: 'Jobs Wetzlar | Heizungsbauer & Monteure | Bad & Energie',
    description:
      'SHK Handwerker Jobs in Wetzlar: Top Vergütung, 30 Tage Urlaub, freitags ab 13:30 Uhr frei & Firmenwagen. Jetzt in 60 Sek. bewerben bei Bad & Energie!',
    url: 'https://karriere.bad-energie.de',
    siteName: 'Bad und Energie GmbH Lahn Dill',
    locale: 'de_DE',
    type: 'website',
  },
};

export default function HomePage() {
  const benefits = [
    {
      title: 'Früher Feierabend am Freitag',
      desc: 'Montag bis Donnerstag von 07:00 bis 16:45 Uhr und freitags bereits ab 13:30 Uhr direkt ins verdiente Wochenende. Keine unbezahlten Überstunden.',
      icon: <Clock className="w-6 h-6 text-[#0369a1]" strokeWidth={1.5} />,
      accent: 'border-blue-100',
    },
    {
      title: '30 Tage Urlaub und Top Vergütung',
      desc: 'Volle 30 Arbeitstage für echte Erholung. Dazu eine Vergütung deutlich über dem regionalen Handwerkstarif, pünktlichste Auszahlung sowie Urlaubs und Weihnachtsgeld.',
      icon: <Award className="w-6 h-6 text-[#047857]" strokeWidth={1.5} />,
      accent: 'border-emerald-100',
    },
    {
      title: 'Hilti Werkzeug und eigener Firmenwagen',
      desc: 'Neuwertig ausgestattete Servicefahrzeuge mit Qualitätswerkzeug von Hilti und Wiha. Vollständige Arbeitskleidung und Schutzausrüstung werden gestellt.',
      icon: <Car className="w-6 h-6 text-[#C51E1E]" strokeWidth={1.5} />,
      accent: 'border-red-100',
    },
    {
      title: 'Eigenes iPad und Smartphone',
      desc: 'Digitale Auftragsabwicklung ohne Zettelwirtschaft. Dein Firmen Smartphone und Tablet darfst Du selbstverständlich auch für private Zwecke nutzen.',
      icon: <Smartphone className="w-6 h-6 text-[#0369a1]" strokeWidth={1.5} />,
      accent: 'border-blue-100',
    },
    {
      title: 'Zukunftssicher mit modernen Wärmepumpen',
      desc: 'Regelmäßige bezahlte Werkszertifizierungen für moderne Wärmepumpen von Buderus, Bosch, NIBE, Alpha Innotec und Viessmann.',
      icon: <Flame className="w-6 h-6 text-amber-500" strokeWidth={1.5} />,
      accent: 'border-amber-100',
    },
    {
      title: 'Familiäres Meisterteam auf Augenhöhe',
      desc: '100 Jahre Meisterbetrieb (1926–2026). Bei uns bist Du keine Nummer, sondern geschätzter Kollege. Regelmäßige Teamevents und Sommergrillen im Lahn Dill Kreis.',
      icon: <Users className="w-6 h-6 text-purple-600" strokeWidth={1.5} />,
      accent: 'border-purple-100',
    },
  ];

  const locations = [
    { name: 'Wetzlar (Firmensitz)', highlighted: true },
    { name: 'Gießen' },
    { name: 'Aßlar' },
    { name: 'Solms' },
    { name: 'Hüttenberg' },
    { name: 'Lahnau' },
    { name: 'Ehringshausen' },
    { name: 'Wettenberg' },
    { name: 'Biebertal' },
    { name: 'Hohenahr' },
  ];

  const faqs = [
    {
      q: 'Wie läuft der diskrete Wechsel ab, wenn ich noch bei einem anderen Betrieb angestellt bin?',
      a: 'Absolute Diskretion ist für uns selbstverständlich. Wir kontaktieren unter keinen Umständen Deinen derzeitigen Arbeitgeber. Ein unverbindliches Kennenlernen findet diskret nach Feierabend oder am Wochenende statt. Auch bei Kündigungsfristen unterstützen wir Dich transparent.',
    },
    {
      q: 'Brauche ich ein Anschreiben oder einen Lebenslauf für den ersten Kontakt?',
      a: 'Nein! Für den ersten Schritt reicht unser Express Fragebogen in zwei Minuten völlig aus. Wir benötigen vorab keine Anschreiben oder formalen Mappen. Ein kurzes Telefonat auf Augenhöhe und ein Kaffee in Wetzlar sind uns lieber als Papierkram.',
    },
    {
      q: 'Welche Heizsysteme und Sanitäranlagen montieren wir hauptsächlich?',
      a: 'Unser Schwerpunkt liegt auf modernen Wärmepumpen von Buderus, Bosch, NIBE, Alpha Innotec und Viessmann, Fußbodenheizungen und schlüsselfertigen Badsanierungen in enger Partnerschaft mit ELEMENTS, VIGOUR, Kermi und Geberit.',
    },
    {
      q: 'Darf das Firmenfahrzeug mit nach Hause genommen werden?',
      a: 'Ja. Je nach Aufgabenbereich und Absprache kann Dein persönliches, modern ausgestattetes Servicefahrzeug für die direkte Anfahrt von Deinem Wohnort zur Baustelle genutzt werden. Auch Smartphone und Tablet sind für die private Nutzung freigeschaltet.',
    },
    {
      q: 'Gibt es bei Bad und Energie Fernmontagen oder Notdienst Zwang?',
      a: 'Nein. Unsere Baustellen liegen ausnahmslos in Wetzlar, Gießen und dem Lahn Dill Kreis. Du bist jeden Nachmittag pünktlich zu Hause. Wochenendarbeit ist ausgeschlossen. Freitags ist ab 13:30 Uhr Wochenende.',
    },
  ];

  return (
    <div className="w-full">
      {/* HERO SECTION - LIGHT LUXURY PORCELAIN CANVAS & GOLDEN RATIO ARCHITECTURE */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#F8FAFC] to-[#F1F5F9] text-slate-900 pt-10 pb-24 sm:pt-16 sm:pb-32 border-b border-slate-200/80">
        {/* Ambient atmospheric light halos */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#0369a1]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 bg-[#C51E1E]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr] gap-10 lg:gap-14 items-center">
            {/* Left Content - The Golden Ratio Major (61.8%) */}
            <div className="space-y-6 lg:space-y-7">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/95 border border-slate-200/90 shadow-2xs text-xs font-semibold text-[#0A1E3A]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>100 Jahre Meisterbetrieb (1926–2026) • Offene Stellenangebote in Wetzlar</span>
              </div>

              <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0A1E3A] leading-[1.14] text-balance">
                Ehrliches Handwerk. Erstklassiger Lohn.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C51E1E] via-[#0A1E3A] to-[#0369a1] block mt-1.5 sm:mt-2">
                  Pünktlich Feierabend im Meisterteam.
                </span>
              </h1>

              <p className="text-sm sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Attraktive Jobs in Wetzlar für erfahrene Heizungsbauer und engagierte Monteure: Ehrliches Handwerk, erstklassiger Lohn und pünktlich Feierabend im Meisterteam – erlebe genau das bei Bad &amp; Energie. Bewerbung in unter <strong className="text-[#0A1E3A] whitespace-nowrap">60 Sekunden</strong> – ohne Anschreiben, ohne Lebenslauf, mit garantierter persönlicher Rückmeldung binnen 24 Stunden.
              </p>

              {/* 4 Quantitative USP Badges - Symmetrical 2x2 Mobile / 4-Col Desktop Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-2">
                <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#0369a1]/60 transition-colors h-full flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans font-semibold uppercase tracking-wider">Wochenendstart</span>
                    <strong className="text-[#0A1E3A] text-xs sm:text-sm font-bold block mt-0.5 leading-snug">Freitags ab 13:30 Uhr</strong>
                  </div>
                  <span className="text-[10px] text-emerald-800 font-medium block mt-2">Pünktlicher Feierabend</span>
                </div>
                <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#0369a1]/60 transition-colors h-full flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans font-semibold uppercase tracking-wider">Erholungsurlaub</span>
                    <strong className="text-[#0A1E3A] text-xs sm:text-sm font-bold block mt-0.5 leading-snug">30 Tage garantiert</strong>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium block mt-2">Plus Urlaubsgeld</span>
                </div>
                <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#0369a1]/60 transition-colors h-full flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans font-semibold uppercase tracking-wider">Ausstattung</span>
                    <strong className="text-[#0A1E3A] text-xs sm:text-sm font-bold block mt-0.5 leading-snug">Hilti &amp; Firmenwagen</strong>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium block mt-2">Ab Wohnort nutzbar</span>
                </div>
                <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#0369a1]/60 transition-colors h-full flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans font-semibold uppercase tracking-wider">Rückmeldung</span>
                    <strong className="text-[#0A1E3A] text-xs sm:text-sm font-bold block mt-0.5 leading-snug">Binnen 24 Stunden</strong>
                  </div>
                  <span className="text-[10px] text-emerald-800 font-medium block mt-2">100 Prozent diskret</span>
                </div>
              </div>

              {/* Action Buttons - Responsive Full-Width Mobile / Auto Desktop */}
              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <a
                  href="#express-funnel"
                  className="group inline-flex items-center justify-center gap-3 pl-6 pr-2.5 py-3 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[#C51E1E] to-[#DC2626] hover:from-[#B01717] hover:to-[#C51E1E] shadow-[0_6px_20px_rgba(197,30,30,0.35)] hover:shadow-[0_8px_28px_rgba(197,30,30,0.45)] apple-press transition-all cursor-pointer text-center"
                >
                  <span>Jetzt in 60 Sekunden bewerben</span>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>
                </a>
                <Link
                  href="/bewerbung?tab=vault"
                  className="px-5 py-3 rounded-full text-xs sm:text-sm font-bold bg-white hover:bg-slate-50 text-[#0A1E3A] border border-slate-200/90 shadow-2xs apple-press transition-all flex items-center justify-center gap-2 text-center"
                >
                  <UploadCloud className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
                  <span>Lebenslauf direkt hochladen</span>
                </Link>
                <Link
                  href="/bewerbung"
                  className="px-5 py-3 rounded-full text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center justify-center gap-2 text-center"
                >
                  <Sparkles className="w-4 h-4 text-[#0369a1]" strokeWidth={1.5} />
                  <span>Bewerberportal</span>
                </Link>
              </div>
            </div>

            {/* Right Card: Meister Sabri Demir Statement - The Golden Ratio Minor (38.2%) with Double-Bezel Craft */}
            <div>
              <div className="double-bezel-shell">
                <div className="double-bezel-core p-6 sm:p-8 space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#0A1E3A] flex items-center justify-center font-bold text-white text-sm font-sans shadow-md">
                        SD
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#0A1E3A]">Diplomingenieur Sabri Demir</div>
                        <p className="text-xs text-slate-500">Inhaber und Werkstattleitung</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Direkte Betreuung
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    „Wir suchen keine standardisierten Bewerbungsmappen mit perfekten Zeugnissen, sondern echte Handwerker und Macher, die ihr Handwerk schätzen und in einem verlässlichen, kollegialen Team ohne Hektik arbeiten wollen.“
                  </p>

                  <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs text-slate-700">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.5} />
                      <span className="font-medium">100 Prozent diskrete Kontaktaufnahme ohne Risiko</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.5} />
                      <span className="font-medium">Feste Baustellen im Lahn Dill Kreis (keine Montagen)</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.5} />
                      <span className="font-medium">Zertifizierter Fachpartner für Buderus, Bosch, NIBE, Alpha Innotec &amp; Viessmann</span>
                    </div>
                    <div className="flex items-start gap-2.5 pt-1 border-t border-slate-200/60">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span className="text-[11px] leading-relaxed">
                        <strong>Meilenstein 2026:</strong> Neuer Hauptstandort Siegmund-Hiepe-Str. 20 (Wetzlar) mit modernem Büro, großem Lager &amp; 15 Mitarbeitern. Führender Wärmepumpen-Spezialist &amp; Fachbetrieb des Lahn-Dill-Kreises.
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 pt-1 text-center font-sans tabular-nums">
                    <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                      <div className="text-base font-extrabold text-[#0A1E3A]">100 J.</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">1926–2026</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                      <div className="text-base font-extrabold text-[#0A1E3A]">15</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Mitarbeiter</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                      <div className="text-base font-extrabold text-[#047857]">100%</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Innungsbetrieb</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPRESS FUNNEL EMBED SECTION */}
      <section id="express-funnel" className="relative -mt-12 sm:-mt-16 z-20 max-w-5xl mx-auto px-4 sm:px-6">
        <HeroExpressFunnel />
      </section>

      {/* TRUST STRIP SECTION */}
      <section className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-4">
        <TrustStrip />
      </section>

      {/* OFFENE STELLEN SECTION (#stellen) */}
      <section id="stellen" className="py-24 sm:py-32 border-t border-slate-200/60 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#C51E1E]">
                  Aktuelle Stellen • Wetzlar und Lahn Dill Kreis
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1E3A] tracking-tight">
                Offene Stellen im Meisterteam
              </h2>
              <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-2xl leading-relaxed">
                Wähle Deinen persönlichen Schwerpunkt. Alle Stellen bieten geregelte Arbeitszeiten (freitags ab 13:30 Uhr ins verdiente Wochenende), 30 Tage garantierten Erholungsurlaub und hochwertige Hilti Vollausstattung.
              </p>
            </div>

            <Link
              href="/bewerbung"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-[#0A1E3A] shadow-2xs hover:border-[#0369a1] apple-press transition-all self-start sm:self-auto"
            >
              <span>Zum 4 Wege Bewerberportal</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0369a1]" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            {/* Position 1: Anlagenmechaniker SHK */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(10,30,58,0.04)] hover:shadow-[0_16px_40px_rgba(10,30,58,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-sans font-semibold uppercase bg-sky-50 text-sky-800 border border-sky-200">
                    Stelle 01 · Vollzeit
                  </span>
                  <span className="text-xs font-sans font-bold text-emerald-800">
                    Über Tarif · Nach Qualifikation
                  </span>
                </div>

                <div className="min-h-[5.5rem] flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    Anlagenmechaniker SHK für Wärmepumpen &amp; Heizungstechnik m w d
                  </h3>
                  <p className="text-xs font-sans text-slate-500 mt-1">
                    Buderus, Bosch, NIBE, Alpha Innotec, Viessmann &amp; Badarchitektur
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed min-h-[3.25rem]">
                  Montage moderner Wärmepumpensysteme und exklusiver Bäder im regionalen Umkreis Wetzlar und Gießen (max. 35 km). Fester Transporter mit Hilti Flotte und Sortimo Regalsystem.
                </p>

                <div className="space-y-2 pt-2 text-xs text-slate-700 min-h-[6.5rem]">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#047857] shrink-0" strokeWidth={1.5} />
                    <span>Lokale Baustellen im 35 km Umkreis · Fester Feierabend bei der Familie</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#047857] shrink-0" strokeWidth={1.5} />
                    <span>30 Arbeitstage bezahlte Erholung · Zuverlässiges Urlaubs- &amp; Weihnachtsgeld</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#047857] shrink-0" strokeWidth={1.5} />
                    <span>Eigener Transporter mit Sortimo-Ausbau · Direkte Fahrt ab Haustür</span>
                  </div>
                </div>
              </div>

              <a
                href="#express-funnel"
                className="w-full py-3.5 px-4 rounded-2xl bg-[#C51E1E] hover:bg-[#B01717] text-white text-xs font-bold text-center transition-all flex items-center justify-center gap-2 shadow-sm apple-press"
              >
                <span>Als Anlagenmechaniker in 60 Sekunden bewerben</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </a>
            </div>

            {/* Position 2: Kundendiensttechniker Wärmepumpe */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(10,30,58,0.04)] hover:shadow-[0_16px_40px_rgba(10,30,58,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-sans font-semibold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Stelle 02 · Spezialist
                  </span>
                  <span className="text-xs font-sans font-bold text-emerald-800">
                    Über Tarif · Top Facharbeiterlohn
                  </span>
                </div>

                <div className="min-h-[5.5rem] flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    Kundendiensttechniker SHK / Servicemonteur m w d
                  </h3>
                  <p className="text-xs font-sans text-slate-500 mt-1">
                    Wartung, Diagnose &amp; Liegenschaften Lahn-Dill-Kreis
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed min-h-[3.25rem]">
                  Inbetriebnahme, Wartung und hydraulischer Abgleich modernster Wärmepumpensysteme sowie Betreuung öffentlicher Liegenschaften. Eigenes Servicefahrzeug, iPad und Smartphone.
                </p>

                <div className="space-y-2 pt-2 text-xs text-slate-700 min-h-[6.5rem]">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#047857] shrink-0" strokeWidth={1.5} />
                    <span>Werkszertifizierungen bei Buderus, Bosch &amp; NIBE (7 Jahre Garantie) bezahlt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#047857] shrink-0" strokeWidth={1.5} />
                    <span>Dienst-iPad &amp; Smartphone uneingeschränkt auch privat nutzbar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#047857] shrink-0" strokeWidth={1.5} />
                    <span>Freie Wochenenden · Keine Notdienstverpflichtung samstags &amp; sonntags</span>
                  </div>
                </div>
              </div>

              <a
                href="#express-funnel"
                className="w-full py-3.5 px-4 rounded-2xl bg-[#C51E1E] hover:bg-[#B01717] text-white text-xs font-bold text-center transition-all flex items-center justify-center gap-2 shadow-sm apple-press"
              >
                <span>Als Kundendiensttechniker direkt bewerben</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </a>
            </div>

            {/* Position 3: Obermonteur / Projektleiter SHK */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(10,30,58,0.04)] hover:shadow-[0_16px_40px_rgba(10,30,58,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-sans font-semibold uppercase bg-purple-50 text-purple-800 border border-purple-200">
                    Stelle 03 · Führungskraft
                  </span>
                  <span className="text-xs font-sans font-bold text-emerald-800">
                    Über Tarif · Führungszulage
                  </span>
                </div>

                <div className="min-h-[5.5rem] flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    Obermonteur / Projektleiter SHK &amp; Badsanierung m w d
                  </h3>
                  <p className="text-xs font-sans text-slate-500 mt-1">
                    Baustellenleitung, Komplettbäder &amp; regenerative Großanlagen
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed min-h-[3.25rem]">
                  Eigenverantwortliche Leitung anspruchsvoller Badsanierungen und moderner Heizungsprojekte im Lahn-Dill-Kreis. Direkte Abstimmung mit Dipl.-Ing. Sabri Demir auf Augenhöhe.
                </p>

                <div className="space-y-2 pt-2 text-xs text-slate-700 min-h-[6.5rem]">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#047857] shrink-0" strokeWidth={1.5} />
                    <span>Hohe Eigenverantwortung &amp; modernste digitale Baustellendokumentation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#047857] shrink-0" strokeWidth={1.5} />
                    <span>Erstklassiges Firmenfahrzeug mit 1%-Privatnutzung und Tankkarte</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#047857] shrink-0" strokeWidth={1.5} />
                    <span>Freitags pünktlich ab 13:30 Uhr bezahlt ins freie Wochenende</span>
                  </div>
                </div>
              </div>

              <a
                href="#express-funnel"
                className="w-full py-3.5 px-4 rounded-2xl bg-[#C51E1E] hover:bg-[#B01717] text-white text-xs font-bold text-center transition-all flex items-center justify-center gap-2 shadow-sm apple-press"
              >
                <span>Als Obermonteur / Projektleiter bewerben</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </a>
            </div>

            {/* Position 4: Azubi 2026 */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(10,30,58,0.04)] hover:shadow-[0_16px_40px_rgba(10,30,58,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-sans font-semibold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                    Stelle 04 · Start August 2026
                  </span>
                  <span className="text-xs font-sans font-bold text-emerald-700">
                    Attraktive Vergütung · Übernahme
                  </span>
                </div>

                <div className="min-h-[5.5rem] flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    Ausbildung zum Anlagenmechaniker SHK 2026 m w d
                  </h3>
                  <p className="text-xs font-sans text-slate-500 mt-1">
                    100 Jahre Ausbildungstradition mit Meisterbetreuung
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed min-h-[3.25rem]">
                  Lerne von erfahrenen Meistern und Gesellen. Zukunftssichere Handwerksausbildung mit zukunftsgewandter Klimatechnik, Wärmepumpen und modernem Sanitärdesign.
                </p>

                <div className="space-y-2 pt-2 text-xs text-slate-700 min-h-[6.5rem]">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#047857] shrink-0" strokeWidth={1.5} />
                    <span>Eigenes persönliches Azubi Werkzeugset von Hilti ab Tag 1 geschenkt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#047857] shrink-0" strokeWidth={1.5} />
                    <span>Zuschuss zum Führerschein und Fahrtkostenzuschuss zur Berufsschule</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#047857] shrink-0" strokeWidth={1.5} />
                    <span>Garantierte Festübernahme nach erfolgreicher Gesellenprüfung</span>
                  </div>
                </div>
              </div>

              <a
                href="#express-funnel"
                className="w-full py-3.5 px-4 rounded-2xl bg-[#C51E1E] hover:bg-[#B01717] text-white text-xs font-bold text-center transition-all flex items-center justify-center gap-2 shadow-sm apple-press"
              >
                <span>Bewerbung als Auszubildender starten</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* VORTEILS- & AUSSTATTUNGS-CHECK SECTION (#karriere-paket & #gehalt) */}
      <section id="karriere-paket" className="py-20 sm:py-24 border-t border-white/60 scroll-mt-20">
        <div id="gehalt" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#0369a1] block mb-2">
              Dein Karriere-Paket &amp; Ausstattungs-Check
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1E3A] tracking-tight">
              Welche Vorteile schaltest Du bei Bad &amp; Energie frei?
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
              Wähle Deine Fachrichtung und Praxiserfahrung – entdecke sofort Dein persönliches Mitarbeiter-Paket mit Hilti Vollausstattung, Firmenwagen und Urlaubsanspruch.
            </p>
          </div>
          <SalaryCalculator />
        </div>
      </section>

      {/* BENEFITS SECTION (#benefits & #vorteile) */}
      <section id="benefits" className="py-24 sm:py-32 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#C51E1E] block mb-2">
              Warum Bad & Energie GmbH
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1E3A] tracking-tight">
              Warum Handwerker aus Wetzlar & Gießen gern zu uns wechseln
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
              Wir wissen, dass Spitzenleistung nur mit besten Rahmenbedingungen, Respekt und verlässlichen Zusagen funktioniert.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {benefits.map((item) => (
              <div
                key={item.title}
                className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_20px_rgba(10,30,58,0.03)] hover:shadow-[0_16px_36px_rgba(10,30,58,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 shadow-2xs">
                    {item.icon}
                  </div>
                  <div className="text-lg font-bold text-slate-900 mb-2">{item.title}</div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WERKZEUG & FUHRPARK SECTION (#ausstattung) */}
      <section id="ausstattung" className="py-24 sm:py-28 border-t border-white/60 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#0369a1] block mb-2">
              Keine Kompromisse beim Equipment
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1E3A] tracking-tight">
              Werkzeug &amp; Fuhrpark: Nur das Beste für Dein Handwerk
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
              Schlechtes Werkzeug kostet Nerven und Zeit. Bei Bad &amp; Energie GmbH arbeitest Du mit neuwertiger Profi Ausrüstung namhafter Hersteller.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_20px_rgba(10,30,58,0.03)] hover:shadow-[0_16px_36px_rgba(10,30,58,0.07)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#C51E1E] border border-red-100 flex items-center justify-center font-bold shadow-2xs">
                  <Wrench className="w-6 h-6 text-[#C51E1E]" strokeWidth={1.5} />
                </div>
                <div className="text-base font-bold text-slate-900 min-h-[2.5rem] flex items-center">
                  Hilti 22V Akku Flotte
                </div>
                <p className="text-xs text-slate-600 leading-relaxed min-h-[4rem]">
                  Persönlicher Akku Bohrhammer, Säbelsäge und elektrohydraulische Presszangen (Viega &amp; Geberit). Kein Leihen, kein Warten.
                </p>
              </div>
              <div className="pt-3 text-[11px] font-sans font-medium text-slate-500 border-t border-slate-100">
                100% Hilti Flottenmanagement
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_20px_rgba(10,30,58,0.03)] hover:shadow-[0_16px_36px_rgba(10,30,58,0.07)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0369a1] border border-sky-100 flex items-center justify-center font-bold shadow-2xs">
                  <Car className="w-6 h-6 text-[#0369a1]" strokeWidth={1.5} />
                </div>
                <div className="text-base font-bold text-slate-900 min-h-[2.5rem] flex items-center">
                  Sortimo Servicefahrzeug
                </div>
                <p className="text-xs text-slate-600 leading-relaxed min-h-[4rem]">
                  Moderner Transporter mit ergonomischer Sortimo Fahrzeugeinrichtung. Nach Absprache feste Mitnahme nach Hause für direkte Baustellenanfahrt.
                </p>
              </div>
              <div className="pt-3 text-[11px] font-sans font-medium text-slate-500 border-t border-slate-100">
                Direkte Anfahrt ab Wohnort möglich
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_20px_rgba(10,30,58,0.03)] hover:shadow-[0_16px_36px_rgba(10,30,58,0.07)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold shadow-2xs">
                  <Flame className="w-6 h-6 text-amber-600" strokeWidth={1.5} />
                </div>
                <div className="text-base font-bold text-slate-900 min-h-[2.5rem] flex items-center">
                  Bosch Messtechnik
                </div>
                <p className="text-xs text-slate-600 leading-relaxed min-h-[4rem]">
                  Digitale Abgasmessgeräte, Spülkompressoren und Kältemittel Füllstationen für moderne Wärmepumpen (Buderus Logatherm, Bosch Compress, NIBE &amp; Viessmann).
                </p>
              </div>
              <div className="pt-3 text-[11px] font-sans font-medium text-slate-500 border-t border-slate-100">
                Regelmäßige Werkskalibrierung
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_20px_rgba(10,30,58,0.03)] hover:shadow-[0_16px_36px_rgba(10,30,58,0.07)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold shadow-2xs">
                  <Smartphone className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
                </div>
                <div className="text-base font-bold text-slate-900 min-h-[2.5rem] flex items-center">
                  iPad &amp; Smartphone
                </div>
                <p className="text-xs text-slate-600 leading-relaxed min-h-[4rem]">
                  Digitale Auftragsabwicklung ohne lästige Zettel. Dein Dienst Smartphone und Tablet darfst Du uneingeschränkt auch privat nutzen.
                </p>
              </div>
              <div className="pt-3 text-[11px] font-sans font-medium text-slate-500 border-t border-slate-100">
                Inklusive Datenflat &amp; privater Nutzung
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABLAUF & DISKRETION SECTION (#wechsel-prozess) */}
      <section id="wechsel-prozess" className="py-24 sm:py-28 border-t border-white/60 bg-gradient-to-b from-transparent via-slate-50/60 to-transparent scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProcessSteps />

          {/* Direct CTA Bar */}
          <div className="mt-12 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
              </div>
              <div>
                <strong className="block text-sm text-slate-900">
                  Bereit für den diskreten ersten Schritt?
                </strong>
                <p className="text-xs text-slate-500">
                  Nutze jetzt die Expressbewerbung in 60 Sekunden ohne Anschreiben und ohne Lebenslauf.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-stretch sm:self-auto">
              <a
                href="#express-funnel"
                className="px-6 py-3 rounded-xl bg-[#C51E1E] hover:bg-[#A51616] text-white text-xs font-bold text-center transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0"
              >
                <span>Jetzt Expressbewerbung starten</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* REGIONAL GEO-TARGETING SECTION */}
      <section id="einsatzgebiet" className="py-20 border-t border-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#0369a1] block mb-2">
              Lokale Einsätze ohne Fernmontage
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A1E3A] tracking-tight">
              Dein Einsatzgebiet im Herzen Mittelhessens
            </h2>
            <p className="text-slate-600 mt-2 text-sm leading-relaxed">
              Keine kilometerlangen Fahrten oder Hotelübernachtungen. Du arbeitest direkt vor der Haustür in Wetzlar, Gießen und dem Lahn Dill Kreis und bist jeden Abend pünktlich zu Hause.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto mb-12">
            {locations.map((loc) => (
              <span
                key={loc.name}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  loc.highlighted
                    ? 'bg-[#0A1E3A] text-white shadow-sm'
                    : 'glass-pill text-slate-700'
                }`}
              >
                {loc.name}
              </span>
            ))}
          </div>

          {/* Regional Hub Card */}
          <div className="glass-panel p-6 sm:p-10 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/60">
              <div>
                <div className="text-base font-bold text-slate-900">
                  Zentrale Werkstatt &amp; Logistiklager
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Siegmund-Hiepe-Str. 20, 35578 Wetzlar
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#047857] bg-emerald-50/80 px-3 py-1.5 rounded-lg border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-[#047857]" />
                <span>Optimal angebunden via B49 &amp; A45</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-xs sm:text-sm text-slate-700">
              <div>
                <strong className="block text-[#0A1E3A] font-bold mb-1">Kurze Rüstzeiten</strong>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Morgens Material direkt am Lager einladen oder direkte Anfahrt zur Baustelle bei Großprojekten.
                </p>
              </div>
              <div>
                <strong className="block text-[#0A1E3A] font-bold mb-1">Feste Partner Ausstellungen</strong>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enge Kooperation mit ELEMENTS Wetzlar &amp; Gießen für exklusive Bäder &amp; Armaturen.
                </p>
              </div>
              <div>
                <strong className="block text-[#0A1E3A] font-bold mb-1">Qualitätsprodukte</strong>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Buderus, Bosch Home Comfort, NIBE, Alpha Innotec, Viessmann, VIGOUR, Kermi &amp; Keuco.
                </p>
              </div>
            </div>

            {/* Offizielle Meilenstein 2026 Story Box */}
            <div className="mt-8 p-6 sm:p-7 rounded-2xl bg-sky-50/70 border border-sky-200/90 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0369a1] uppercase tracking-wider">
                <Award className="w-4 h-4 text-[#0369a1]" strokeWidth={1.5} />
                <span>Offizieller Meilenstein 2026 &amp; Standortverlagerung Wetzlar</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                „Meilenstein 2026: Durch das stetige Wachstum unseres Betriebes war ein Umzug in eine neue und größere Betriebsstätte unausweichlich. Der Hauptstandort wurde in die <strong>Siegmund-Hiepe-Str. 20 in Wetzlar</strong> verlagert für ein moderneres Büro und ein größeres Lager. Die Bad &amp; Energie GmbH hat sich zum führenden Spezialisten für Wärmepumpen in der Region etabliert. Zusätzlich besteht die Partnerschaft als Fachbetrieb für den Lahn-Dill-Kreis zur Betreuung und Instandhaltung öffentlicher Einrichtungen. Zurzeit sind <strong>15 Mitarbeiter</strong> im Betrieb tätig und arbeiten stetig daran, die Heizungen und Bäder der Kunden zu modernisieren. Dabei gilt: <em>‚Schöner Wohnen mit Top-Qualität‘</em>.“
              </p>
            </div>
          </div>

          {/* Interactive Geographic Map Dominance & Regional Route Central */}
          <div className="max-w-7xl mx-auto mt-14">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-sans font-semibold text-[#0369a1] uppercase tracking-wider block mb-1">
                  Mittelhessen · Maximal 35 km Radius · Garantiert keine Fernmontage
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0A1E3A] tracking-tight">
                  Interaktive Standort- &amp; Einsatzgebietskarte
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                  Erkunde unser Einsatzgebiet im Lahn-Dill-Kreis und berechne Deine persönliche Fahrzeit zur Werkstatt in Wetzlar. Bei uns bist Du jeden Tag pünktlich zum Feierabend zu Hause.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-xs font-semibold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>35578 Wetzlar Firmensitz</span>
                </div>
              </div>
            </div>

            {/* Expansive Interactive Map with Full Height & Space */}
            <InteractiveMap height="640px" />

            {/* Accompanying Regional Dominance & Node Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0A1E3A] mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0369a1]" />
                  <span>35 km Einsatzgrenze</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Keine Hotelübernachtungen, keine Fernbaustellen. Alle Kunden und Projekte befinden sich in Wetzlar, Gießen und direktem Umland.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0A1E3A] mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#047857]" />
                  <span>Fahrtzeit &amp; Fuhrpark</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Moderner Werkstattwagen mit Tankkarte. Nach Absprache feste Mitnahme für den direkten Arbeitsweg.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0A1E3A] mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C51E1E]" />
                  <span>Pünktlicher Feierabend</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Feste Arbeitszeiten unter der Woche und freitags ab 13:30 Uhr bezahlter Übergang ins freie Wochenende.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BEWERTUNGEN & ERFAHRUNGEN SECTION (#bewertungen) */}
      <section id="bewertungen" className="py-20 sm:py-24 border-t border-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#0369a1] block mb-2">
                Authentische Einblicke
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1E3A] tracking-tight">
                Was Kolleginnen und Kunden sagen
              </h2>
            </div>
            <GoogleReviewsBadge rating={5.0} count={24} />
          </div>
          <ReviewCarousel />
        </div>
      </section>

      {/* SEMANTISCHE AI ANTWORTEN SECTION */}
      <section className="py-12 border-t border-white/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <AIAnswerBox />
        </div>
      </section>

      {/* DIREKTKONTAKT & SCHNELLANFRAGE SECTION (#kontakt) */}
      <section id="kontakt" className="py-20 border-t border-white/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#C51E1E] block mb-2">
              Persönlicher Austausch
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1E3A] tracking-tight">
              Sprich direkt mit Meister Sabri Demir
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
              Ob Fragen zu den Stellen, Konditionen oder eine unverbindliche Anfrage: Wir stehen Dir ohne bürokratische Hürden zur Verfügung.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5">
              <DirectContactCard />
            </div>
            <div className="lg:col-span-7">
              <LeadQuickForm />
            </div>
          </div>
        </div>
      </section>

      {/* ACCORDION FAQ SECTION */}
      <section id="faq" className="py-20 border-t border-white/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#C51E1E] block mb-2">
              Häufige Fragen
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A1E3A] tracking-tight">
              Alles Wichtige zum Bewerbungsprozess
            </h2>
            <p className="text-slate-600 mt-2 text-sm">
              Offene Antworten auf Fragen, die Monteuren und Gesellen wichtig sind.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group glass-panel p-5 [&_summary::-webkit-details-marker]:hidden transition-all hover:shadow-md"
              >
                <summary className="flex items-center justify-between cursor-pointer font-bold text-slate-900 text-sm sm:text-base">
                  <span>{faq.q}</span>
                  <span className="ml-4 shrink-0 transition group-open:-rotate-180 text-[#0369a1]">
                    <ChevronDown className="w-5 h-5" strokeWidth={1.5} />
                  </span>
                </summary>
                <div className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>

          {/* Quick Callout Action - Light Luxury Double-Bezel Architecture */}
          <div className="mt-14 double-bezel-shell">
            <div className="double-bezel-core p-8 sm:p-12 text-center space-y-4 shadow-sm">
              <span className="px-3.5 py-1 rounded-full text-xs font-sans font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block">
                100% Unverbindlich · Kein Risiko · Keine Verpflichtung
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#0A1E3A] tracking-tight">
                Bereit für ein faires Angebot mit echter handwerklicher Wertschätzung?
              </p>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
                Nutze jetzt unsere Expressbewerbung in unter 60 Sekunden oder das 4 Wege Bewerberportal und lass uns ganz ungezwungen herausfinden, ob wir zueinander passen.
              </p>
              <div className="pt-3 flex flex-wrap justify-center gap-3.5">
                <a
                  href="#express-funnel"
                  className="group inline-flex items-center gap-3 pl-6 pr-2.5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[#C51E1E] to-[#DC2626] hover:from-[#B01717] hover:to-[#C51E1E] shadow-[0_6px_20px_rgba(197,30,30,0.35)] hover:shadow-[0_8px_28px_rgba(197,30,30,0.45)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <span>Expressbewerbung starten</span>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>
                </a>
                <Link
                  href="/bewerbung"
                  className="px-6 py-3 rounded-full font-bold text-xs sm:text-sm text-[#0A1E3A] bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#0369a1]" strokeWidth={1.5} />
                  <span>Zum 4 Wege Bewerberportal</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
