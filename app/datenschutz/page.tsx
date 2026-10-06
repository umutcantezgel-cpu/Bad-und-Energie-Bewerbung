'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Lock,
  FileCheck,
  Search,
  Printer,
  Mail,
  Phone,
  ExternalLink,
  ChevronDown,
  Building,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function DatenschutzPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    serverLogs: true,
    sslTls: false,
    contactForms: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = [
    { id: 'verantwortlicher', code: '§ 01', title: 'Verantwortliche Stelle & Kontakt' },
    { id: 'rechtsgrundlagen', code: '§ 02', title: 'Rechtsgrundlagen (Art. 6 DSGVO)' },
    { id: 'datenerfassung', code: '§ 03', title: 'Datenerfassung & Hosting' },
    { id: 'bewerberdaten', code: '§ 04', title: 'Bewerbung und Recruiting nach § 26 BDSG', highlight: true },
    { id: 'cookies-analyse', code: '§ 05', title: 'Cookies, Analyse und Lokale Schriften' },
    { id: 'betroffenenrechte', code: '§ 06', title: 'Ihre Betroffenenrechte Art. 15 bis 21' },
    { id: 'aufsichtsbehoerde', code: '§ 07', title: 'Aufsichtsbehörde (HBDI Hessen)' },
  ];

  const filteredSections = sections.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Regulatory Anchor Strip */}
      <div className="w-full bg-[#0A1E3A] text-white py-3 px-6 lg:px-12 border-b border-slate-800 no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#C51E1E] text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded">
              <Shield className="w-3 h-3 text-white" strokeWidth={1.5} />
              DSGVO und § 26 BDSG RECHTSSTAND
            </span>
            <span className="text-xs text-slate-300 font-mono">
              Dokumentenversion 4.2.1 • Letzte Revision: Oktober 2026
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-300 font-mono">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
              Auditierte Verschlüsselung (TLS 1.3)
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-sky-400" strokeWidth={1.5} />
              Serverstandort Frankfurt am Main (Hessen)
            </span>
          </div>
        </div>
      </div>

      {/* Main Container Frame */}
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-8 lg:py-12">
        {/* Breadcrumb & Header Hero */}
        <div className="mb-10 space-y-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-slate-500 no-print">
            <Link href="/" className="hover:text-[#0A1E3A] transition-colors">
              Startseite
            </Link>
            <span>/</span>
            <span className="text-slate-500">Rechtliches und Compliance</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Datenschutzerklärung</span>
          </nav>

          <div className="border-l-4 border-[#C51E1E] pl-5 py-1">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0A1E3A] uppercase tracking-tight">
              Datenschutzerklärung und Information zur Verarbeitung personenbezogener Daten
            </h1>
            <p className="text-xs sm:text-base text-slate-600 mt-2 max-w-4xl leading-relaxed">
              Transparenz, Datensicherheit und kompromissloser Schutz Ihrer Privatsphäre nach der <strong className="text-slate-900 font-semibold">DSGVO</strong> bei der{' '}
              <strong className="text-slate-900 font-semibold">Bad und Energie GmbH Lahn Dill</strong>, einschließlich der sicheren Verarbeitung sensibler <strong className="text-slate-900 font-semibold">Bewerberdaten</strong> in unserem diskreten Bewerberbereich für Fachhandwerker.
            </p>
          </div>

          {/* Trust & Compliance Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#C51E1E]">
                  Rechtsrahmen
                </span>
                <Building className="w-4 h-4 text-[#0A1E3A]" strokeWidth={1.5} />
              </div>
              <div className="text-base font-bold text-[#0A1E3A]">100% DSGVO & BDSG</div>
              <div className="text-xs text-slate-500 mt-1">
                Strikte Einhaltung bundesdeutscher und hessischer Vorschriften
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#C51E1E]">
                  Schriftarten
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#047857]" strokeWidth={1.5} />
              </div>
              <div className="text-base font-bold text-[#0A1E3A]">100% Lokale Fonts</div>
              <div className="text-xs text-slate-500 mt-1">
                Kein Verbindungsaufbau zu Drittanbietern oder US Servern
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#C51E1E]">
                  Verschlüsselung
                </span>
                <Lock className="w-4 h-4 text-[#0284C7]" strokeWidth={1.5} />
              </div>
              <div className="text-base font-bold text-[#0A1E3A]">256 Bit SSL und TLS</div>
              <div className="text-xs text-slate-500 mt-1">
                Vollständig verschlüsselte Übertragung aller Formulare
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#C51E1E]">
                  Sperrvermerk
                </span>
                <Shield className="w-4 h-4 text-purple-600" strokeWidth={1.5} />
              </div>
              <div className="text-base font-bold text-[#0A1E3A]">§ 26 BDSG Diskretion</div>
              <div className="text-xs text-slate-500 mt-1">
                Garantierter Kündigungsschutz und Sperrvermerk
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Sticky Index + Legal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
          {/* Quick-Jump Sidebar */}
          <aside className="lg:col-span-4 sticky top-28 space-y-5 no-print">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0A1E3A]">
                  Inhaltsverzeichnis & Index
                </span>
                <span className="px-2 py-0.5 bg-[#0A1E3A] text-white font-mono text-[10px] uppercase rounded">
                  7 Abschnitte
                </span>
              </div>

              {/* Filter */}
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Stichwort filtern (z.B. Löschung)..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0A1E3A]"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" strokeWidth={1.5} />
              </div>

              {/* Navigation Rail */}
              <nav className="flex flex-col space-y-1 text-xs">
                {filteredSections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className={`flex items-start gap-2.5 px-3 py-2 rounded-xl transition-all ${
                      sec.highlight
                        ? 'bg-red-50 text-[#C51E1E] font-bold border-l-3 border-[#C51E1E]'
                        : 'text-slate-600 hover:text-[#0A1E3A] hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-mono text-[10px] text-slate-400 shrink-0 mt-0.5">
                      {sec.code}
                    </span>
                    <span className="leading-tight">{sec.title}</span>
                  </a>
                ))}
              </nav>
            </div>

            {/* Quick Assistance Card */}
            <div className="bg-[#0A1E3A] text-white p-5 rounded-3xl border border-slate-800 space-y-3.5 shadow-md">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#C51E1E]" strokeWidth={1.5} />
                <span className="font-mono text-xs font-bold uppercase tracking-wider">
                  Datenschutzauskunft
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sie haben Fragen zur Datenspeicherung im Bewerbungsverfahren oder möchten Ihre Einwilligung widerrufen?
              </p>
              <div className="space-y-1.5 font-mono text-xs text-slate-300">
                <a
                  href="mailto:datenschutz@bad-energie.de"
                  className="flex items-center gap-2 text-white hover:text-sky-300 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#0284C7]" strokeWidth={1.5} />
                  <span>datenschutz@bad-energie.de</span>
                </a>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#0284C7]" strokeWidth={1.5} />
                  <span>06441 42956 Zentrale Wetzlar</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => typeof window !== 'undefined' && window.print()}
                className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-[#0A1E3A] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>PDF drucken oder exportieren</span>
              </button>
            </div>
          </aside>

          {/* Main Legal Body */}
          <main className="lg:col-span-8 space-y-12">
            {/* § 01: VERANTWORTLICHE STELLE */}
            <section id="verantwortlicher" className="scroll-mt-32 space-y-4">
              <div className="flex items-center gap-3 border-b-2 border-[#0A1E3A] pb-2">
                <span className="font-mono text-xs font-bold text-[#C51E1E]">§ 01</span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#0A1E3A] tracking-tight">
                  Verantwortliche Stelle & Kontakt
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Verantwortlicher im Sinne der Datenschutz Grundverordnung DSGVO, sonstiger in den Mitgliedstaaten der Europäischen Union geltenden Datenschutzgesetze und anderer Bestimmungen mit datenschutzrechtlichem Charakter ist:
              </p>

              <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                  <Logo variant="default" framing="card" size="sm" withLink={false} />
                  <span className="hidden sm:inline-block px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] uppercase font-bold rounded">
                    Meisterbetrieb seit 1926
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                      Betriebsdaten
                    </span>
                    <h3 className="text-base font-bold text-[#0A1E3A]">Bad und Energie GmbH Lahn Dill</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Siegmund Hiepe Str. 20<br />
                      35578 Wetzlar im Lahn Dill Kreis
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono pt-1">
                      Handelsregister: Amtsgericht Wetzlar<br />
                      Registernummer: HRB 8459<br />
                      USt-IdNr.: DE 346 648 448
                    </p>
                  </div>

                <div className="space-y-2 md:border-l md:border-slate-100 md:pl-5">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                    Vertretung und Kontakt
                  </span>
                  <p className="text-xs font-bold text-slate-900">
                    Geschäftsführer: Diplomingenieur Sabri Demir
                  </p>
                  <div className="text-xs font-mono space-y-1 text-slate-600 pt-1">
                    <p>Telefon: <span className="font-bold text-slate-900">06441 42956</span></p>
                    <p>Telefax: <span className="font-bold text-slate-900">06441 48781</span></p>
                    <p>E Mail: <a href="mailto:info@bad-energie.de" className="text-[#C51E1E] hover:underline">info@bad-energie.de</a></p>
                  </div>
                </div>
              </div>
            </div>

              <div className="p-4 bg-slate-50 rounded-2xl border-l-4 border-slate-400 space-y-1 text-xs text-slate-600 leading-relaxed">
                <strong className="block font-bold text-slate-800">
                  Gesetzlicher Status zum Datenschutzbeauftragten gem. § 38 BDSG:
                </strong>
                <p>
                  Da in unserem Handwerksbetrieb in der Regel weniger als 20 Personen ständig mit der automatisierten Verarbeitung personenbezogener Daten beschäftigt sind und keine Verarbeitungen vorliegen, die einer Datenschutz Folgenabschätzung gem. Art. 35 DSGVO unterliegen, besteht keine gesetzliche Pflicht zur Benennung eines Datenschutzbeauftragten. Anfragen zum Datenschutz werden direkt von der Geschäftsleitung unter <a href="mailto:datenschutz@bad-energie.de" className="text-[#C51E1E] underline">datenschutz@bad-energie.de</a> beantwortet.
                </p>
              </div>
            </section>

            {/* § 02: RECHTSGRUNDLAGEN */}
            <section id="rechtsgrundlagen" className="scroll-mt-32 space-y-4">
              <div className="flex items-center gap-3 border-b-2 border-[#0A1E3A] pb-2">
                <span className="font-mono text-xs font-bold text-[#C51E1E]">§ 02</span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#0A1E3A] tracking-tight">
                  Rechtsgrundlagen der Verarbeitung (Art. 6 DSGVO)
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Nach Maßgabe des Art. 13 DSGVO teilen wir Ihnen die Rechtsgrundlagen unserer Datenverarbeitungen mit. Sofern die Rechtsgrundlage in dieser Erklärung nicht gesondert genannt wird, gilt Folgendes:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-white rounded-3xl border border-slate-200 flex flex-col justify-between shadow-xs">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] uppercase font-bold rounded mb-2">
                      Art. 6 Abs. 1 lit. a DSGVO
                    </span>
                    <h3 className="text-sm font-bold text-[#0A1E3A]">Einwilligung</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Die betroffene Person hat ihre Einwilligung zu der Verarbeitung der sie betreffenden personenbezogenen Daten für einen oder mehrere bestimmte Zwecke gegeben (z.B. Aufnahme in den Talentpool, optionale Analyse-Cookies).
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-100 font-mono text-[10px] uppercase text-[#C51E1E] font-bold">
                    Jederzeit frei widerruflich
                  </div>
                </div>

                <div className="p-5 bg-white rounded-3xl border border-slate-200 flex flex-col justify-between shadow-xs">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-[#0A1E3A] text-white font-mono text-[10px] uppercase font-bold rounded mb-2">
                      Art. 6 Abs. 1 lit. b DSGVO
                    </span>
                    <h3 className="text-sm font-bold text-[#0A1E3A]">Vertragserfüllung & Anfragen</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Die Verarbeitung ist für die Erfüllung eines Vertrags, dessen Vertragspartei die betroffene Person ist, oder zur Durchführung vorvertraglicher Maßnahmen erforderlich (z.B. Sanitärangebote, Heizungswartung, Aufmaß).
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-100 font-mono text-[10px] uppercase text-[#047857] font-bold">
                    Kerngeschäft Handwerk
                  </div>
                </div>

                <div className="p-5 bg-white rounded-3xl border border-slate-200 flex flex-col justify-between shadow-xs">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] uppercase font-bold rounded mb-2">
                      Art. 6 Abs. 1 lit. c DSGVO
                    </span>
                    <h3 className="text-sm font-bold text-[#0A1E3A]">Rechtliche Verpflichtung</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Die Verarbeitung ist zur Erfüllung einer rechtlichen Verpflichtung erforderlich, der der Verantwortliche unterliegt (insbesondere steuer- und handelsrechtliche Aufbewahrungspflichten nach HGB, AO bis 10 Jahre).
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-100 font-mono text-[10px] uppercase text-[#0A1E3A] font-bold">
                    Gesetzliche Aufbewahrung
                  </div>
                </div>

                <div className="p-5 bg-white rounded-3xl border border-slate-200 flex flex-col justify-between shadow-xs">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] uppercase font-bold rounded mb-2">
                      Art. 6 Abs. 1 lit. f DSGVO
                    </span>
                    <h3 className="text-sm font-bold text-[#0A1E3A]">Berechtigte Interessen</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Die Verarbeitung ist zur Wahrung der berechtigten Interessen des Verantwortlichen erforderlich (z.B. IT-Sicherheit der Webserver, Schutz vor gezielten Angriffen, störungsfreie Bereitstellung unserer Meisterbetrieb-Dienste).
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-100 font-mono text-[10px] uppercase text-slate-500 font-bold">
                    Systemintegrität
                  </div>
                </div>
              </div>
            </section>

            {/* § 03: DATENERFASSUNG & HOSTING */}
            <section id="datenerfassung" className="scroll-mt-32 space-y-4">
              <div className="flex items-center gap-3 border-b-2 border-[#0A1E3A] pb-2">
                <span className="font-mono text-xs font-bold text-[#C51E1E]">§ 03</span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#0A1E3A] tracking-tight">
                  Datenerfassung und Hosting
                </h2>
              </div>

              <div className="space-y-3">
                {/* Accordion 1 */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('serverLogs')}
                    className="w-full p-4.5 bg-slate-50 text-left flex items-center justify-between font-bold text-sm text-[#0A1E3A] hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <span>1. Server Logfiles und Bereitstellung der Website</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${openAccordions.serverLogs ? 'rotate-180' : ''}`}
                      strokeWidth={1.5}
                    />
                  </button>
                  {openAccordions.serverLogs && (
                    <div className="p-5 text-xs text-slate-600 space-y-2 border-t border-slate-100">
                      <p>
                        Der Provider dieser Seiten erhebt und speichert automatisch Informationen in so genannten Server Logdateien, die Ihr Browser automatisch an uns übermittelt:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 font-mono text-[11px]">
                        <li>Browsertyp und Browserversion</li>
                        <li>Verwendetes Betriebssystem</li>
                        <li>Referrer URL (zuvor besuchte Seite)</li>
                        <li>Hostname des zugreifenden Rechners</li>
                        <li>Uhrzeit der Serveranfrage</li>
                        <li>IP Adresse (in gekürzter und anonymisierter Form)</li>
                      </ul>
                      <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between font-mono text-[10px] text-slate-500 mt-2">
                        <span>Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO</span>
                        <span className="text-[#C51E1E] font-bold">Löschfrist: Automatisch nach 7 Tagen</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion 2 */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('sslTls')}
                    className="w-full p-4.5 bg-slate-50 text-left flex items-center justify-between font-bold text-sm text-[#0A1E3A] hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <span>2. SSL und TLS Verschlüsselung mit 256 Bit</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${openAccordions.sslTls ? 'rotate-180' : ''}`}
                      strokeWidth={1.5}
                    />
                  </button>
                  {openAccordions.sslTls && (
                    <div className="p-5 text-xs text-slate-600 space-y-2 border-t border-slate-100">
                      <p>
                        Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte, wie zum Beispiel Bestellanfragen oder Expressbewerbungen, eine SSL und TLS Verschlüsselung mit einer Schlüssellänge von 256 Bit. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[#0A1E3A]">http://</code> auf <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[#0A1E3A]">https://</code> wechselt und an dem Schloss-Symbol in Ihrer Browserzeile. Wenn die Verschlüsselung aktiviert ist, können die Daten, die Sie an uns übermitteln, nicht von Dritten mitgelesen werden.
                      </p>
                    </div>
                  )}
                </div>

                {/* Accordion 3 */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('contactForms')}
                    className="w-full p-4.5 bg-slate-50 text-left flex items-center justify-between font-bold text-sm text-[#0A1E3A] hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <span>3. Kontaktformulare und direkte Anfragen</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${openAccordions.contactForms ? 'rotate-180' : ''}`}
                      strokeWidth={1.5}
                    />
                  </button>
                  {openAccordions.contactForms && (
                    <div className="p-5 text-xs text-slate-600 space-y-2 border-t border-slate-100">
                      <p>
                        Wenn Sie uns per Kontaktformular oder E Mail Anfragen zukommen lassen, werden Ihre Angaben inklusive der Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen).
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* § 04: BEWERBER-HUB & RECRUITING (HIGHLIGHT SECTION) */}
            <section id="bewerberdaten" className="scroll-mt-32 space-y-5">
              <div className="border-2 border-[#C51E1E] bg-white rounded-3xl p-6 sm:p-8 relative shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-[#C51E1E] text-white flex items-center justify-center font-bold">
                      <Shield className="w-5 h-5 text-white" strokeWidth={1.5} />
                    </span>
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#C51E1E] font-bold block">
                        Paragraph 26 BDSG RECHTSVORSCHRIFT
                      </span>
                      <h2 className="text-lg sm:text-xl font-bold text-[#0A1E3A]">
                        Datenschutz im Bewerbungsverfahren und Bewerberportal
                      </h2>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-[#0A1E3A] text-white font-mono text-[10px] uppercase font-bold rounded-lg">
                    Verifiziert Sicher
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 mt-4 leading-relaxed">
                  Wir verarbeiten personenbezogene Daten von Bewerberinnen und Bewerbern m w d ausschließlich im Einklang mit den einschlägigen datenschutzrechtlichen Vorgaben, insbesondere <strong className="text-slate-900 font-semibold">Art. 6 Abs. 1 lit. b DSGVO in Verbindung mit Paragraph 26 Abs. 1 BDSG</strong> (Begründung eines Beschäftigungsverhältnisses).
                </p>

                {/* Sperrvermerk Special Callout */}
                <div className="mt-5 bg-red-50/70 border-l-4 border-[#C51E1E] p-4.5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#C51E1E]" strokeWidth={1.5} />
                    <strong className="text-xs sm:text-sm font-bold text-[#0A1E3A]">
                      Garantierter Sperrvermerk für ungekündigte Fachkräfte
                    </strong>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sofern Sie sich in einem bestehenden, ungekündigten Arbeitsverhältnis befinden und unseren digitalen Expressbereich nutzen, greift unsere uneingeschränkte Diskretionsgarantie. Wir kontaktieren unter keinen Umständen Ihren derzeitigen Arbeitgeber. Eine Kontaktaufnahme unserer Geschäftsleitung erfolgt absolut vertraulich und ausschließlich über Ihre privaten, dezidiert freigegebenen Kanäle (z.B. private Mobilnummer oder diskrete WhatsApp-Terminierung nach Feierabend).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#C51E1E] block mb-2">
                      1. Erfasste Datenkategorien
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C51E1E] mt-1.5 shrink-0" />
                        <span>Stammdaten wie Name, Vorname, Wohnort, Telefon, E Mail</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C51E1E] mt-1.5 shrink-0" />
                        <span>Berufliche Qualifikationen wie Gesellenbrief, Meistertitel, Fachzertifikate</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C51E1E] mt-1.5 shrink-0" />
                        <span>Führerscheinklassen wie Klasse B oder BE für Kundendienstfahrzeuge</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C51E1E] mt-1.5 shrink-0" />
                        <span>Freiwillige Konditionswünsche sowie möglicher Eintrittstermin oder Kündigungsfrist</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#0A1E3A] block mb-2">
                      2. Gesetzliche Löschfristen
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Sollte Ihre Bewerbung nicht zu einer Einstellung führen, werden Ihre Daten <strong>spätestens 6 Monate</strong> nach Bekanntgabe der Absageentscheidung vollständig und unwiederbringlich gelöscht (Art. 17 DSGVO in Verbindung mit Paragraph 15 Abs. 4 AGG zur Abwehr allfälliger Rechtsansprüche).
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <strong className="block font-bold text-[#0A1E3A]">
                      Talentpool der Bad und Energie GmbH
                    </strong>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Eine Speicherung über die sechsmonatigen Frist hinaus (maximal 24 Monate) erfolgt ausschließlich bei expliziter Einwilligung gem. Art. 6 Abs. 1 lit. a DSGVO.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg font-mono text-[10px] whitespace-nowrap text-slate-700 font-semibold">
                    Maximal 24 Monate mit Widerrufsrecht
                  </span>
                </div>
              </div>
            </section>

            {/* § 05: COOKIES, ANALYSE & LOCAL FONTS */}
            <section id="cookies-analyse" className="scroll-mt-32 space-y-4">
              <div className="flex items-center gap-3 border-b-2 border-[#0A1E3A] pb-2">
                <span className="font-mono text-xs font-bold text-[#C51E1E]">§ 05</span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#0A1E3A] tracking-tight">
                  Cookies, Analyse und Lokale Schriften
                </h2>
              </div>

              <div className="border border-slate-200 rounded-3xl p-5 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#047857]" strokeWidth={1.5} />
                    <h3 className="text-sm font-bold text-[#0A1E3A]">
                      Lokales Hosting von Schriftarten ohne US Transfer
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-[#047857] font-mono text-[10px] uppercase font-bold rounded">
                    Kein US Transfer
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Diese Seite nutzt zur einheitlichen Darstellung von Schriftarten lokale Schriftdateien. Diese Schriften sind lokal auf unseren eigenen Servern in der Bundesrepublik Deutschland installiert. Beim Aufruf einer Seite lädt Ihr Browser die benötigten Web Fonts direkt aus unserem Server Cache. Es findet zu keinem Zeitpunkt eine Verbindung zu Servern der Google LLC oder sonstigen Dritten statt. Eine Übertragung Ihrer IP Adresse an externe Server ist <strong className="text-slate-900 font-semibold">vollständig ausgeschlossen</strong>.
                </p>
              </div>

              <div className="border border-slate-200 rounded-3xl p-5 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0284C7]" strokeWidth={1.5} />
                    <h3 className="text-sm font-bold text-[#0A1E3A]">
                      Webanalyse und Cookiesteuerung nach TDDDG Paragraph 25
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] uppercase font-bold rounded">
                    Einwilligung erforderlich
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Wir verwenden Technologien, um das Nutzerverhalten auf unserer Webseite aggregiert zu verstehen und Fehler im digitalen Kundendienst und Bewerberprozess zu beheben. Die Erfassung erfolgt ausschließlich unter Verwendung einer gekürzten und somit anonymisierten IP-Adresse. Nicht technisch notwendige Tracking Cookies werden erst nach Erteilung Ihrer ausdrücklichen Einwilligung im Einwilligungsdialog geladen (Art. 6 Abs. 1 lit. a DSGVO in Verbindung mit Paragraph 25 Abs. 1 TDDDG).
                </p>
              </div>
            </section>

            {/* § 06: BETROFFENENRECHTE */}
            <section id="betroffenenrechte" className="scroll-mt-32 space-y-4">
              <div className="flex items-center gap-3 border-b-2 border-[#0A1E3A] pb-2">
                <span className="font-mono text-xs font-bold text-[#C51E1E]">§ 06</span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#0A1E3A] tracking-tight">
                  Ihre Betroffenenrechte Art. 15 bis 21 DSGVO
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Als betroffene Person stehen Ihnen nach der Datenschutz Grundverordnung umfangreiche Rechte gegenüber der Bad und Energie GmbH zu, die Sie jederzeit kostenfrei und formlos geltend machen können:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    art: 'Art. 15 DSGVO',
                    title: 'Recht auf Auskunft',
                    desc: 'Sie haben das Recht, Auskunft darüber zu verlangen, ob und welche personenbezogenen Daten wir verarbeiten, zu welchem Zweck und an wen diese weitergegeben wurden.',
                  },
                  {
                    art: 'Art. 16 DSGVO',
                    title: 'Recht auf Berichtigung',
                    desc: 'Sie können die unverzügliche Berichtigung oder Vervollständigung fehlerhafter und unrichtiger Daten verlangen, die wir im Rahmen Ihrer Bewerbung führen.',
                  },
                  {
                    art: 'Art. 17 DSGVO',
                    title: 'Recht auf Löschung und Vergessenwerden',
                    desc: 'Sie haben das Recht, die unverzügliche Löschung Ihrer Daten zu fordern, sofern keine gesetzlichen Aufbewahrungspflichten wie HGB oder AO entgegenstehen.',
                  },
                  {
                    art: 'Art. 18 DSGVO',
                    title: 'Recht auf Einschränkung',
                    desc: 'Unter bestimmten gesetzlichen Voraussetzungen können Sie verlangen, dass Ihre Daten für weitere Verarbeitungsschritte gesperrt und nur noch archiviert werden.',
                  },
                  {
                    art: 'Art. 20 DSGVO',
                    title: 'Recht auf Datenübertragbarkeit',
                    desc: 'Sie haben das Recht, Daten, die Sie uns bereitgestellt haben, in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten.',
                  },
                  {
                    art: 'Art. 21 DSGVO',
                    title: 'Widerspruchsrecht',
                    desc: 'Sie können einer Verarbeitung, die auf Art. 6 Abs. 1 lit. f DSGVO beruht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit widersprechen.',
                  },
                ].map((item) => (
                  <div key={item.art} className="p-4.5 bg-white rounded-3xl border border-slate-200 space-y-2 shadow-xs">
                    <span className="font-mono text-[10px] font-bold text-[#C51E1E] uppercase block">
                      {item.art}
                    </span>
                    <h3 className="text-sm font-bold text-[#0A1E3A]">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="p-4.5 bg-[#0A1E3A] text-white rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-400 block">
                    Widerruf erteilter Einwilligungen (Art. 7 Abs. 3 DSGVO)
                  </span>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Sie können erteilte Einwilligungen jederzeit ohne Angabe von Gründen per E Mail widerrufen.
                  </p>
                </div>
                <a
                  href="mailto:datenschutz@bad-energie.de?subject=Widerruf%20Einwilligung%20Datenschutz"
                  className="px-4 py-2 bg-[#C51E1E] hover:bg-[#A51616] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Widerruf absenden
                </a>
              </div>
            </section>

            {/* § 07: AUFSICHTSBEHÖRDE HESSEN */}
            <section id="aufsichtsbehoerde" className="scroll-mt-32 space-y-4">
              <div className="flex items-center gap-3 border-b-2 border-[#0A1E3A] pb-2">
                <span className="font-mono text-xs font-bold text-[#C51E1E]">§ 07</span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#0A1E3A] tracking-tight">
                  Zuständige Aufsichtsbehörde (HBDI Hessen)
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Gemäß Art. 77 DSGVO haben Sie unbeschadet eines anderweitigen verwaltungsrechtlichen oder gerichtlichen Rechtsbehelfs das Recht auf Beschwerde bei einer Datenschutz Aufsichtsbehörde, wenn Sie der Ansicht sind, dass die Verarbeitung der Sie betreffenden personenbezogenen Daten gegen die DSGVO verstößt.
              </p>

              <div className="border border-slate-200 rounded-3xl p-6 bg-white flex flex-col md:flex-row items-start justify-between gap-6 shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#C51E1E] rounded-full" />
                    <h3 className="text-sm font-bold text-[#0A1E3A]">
                      Der Hessische Beauftragte für Datenschutz und Informationsfreiheit (HBDI)
                    </h3>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p>Hausanschrift: Gustav Stresemann Ring 1, 65189 Wiesbaden</p>
                    <p>Postanschrift: Postfach 3163, 65021 Wiesbaden</p>
                  </div>
                  <div className="text-xs font-mono space-y-1 pt-1 text-slate-700">
                    <p>Telefon: <span className="font-bold text-slate-900">+49 611 1408 0</span></p>
                    <p>Telefax: <span className="font-bold text-slate-900">+49 611 1408 900</span></p>
                    <p>E Mail: <span className="text-slate-900">poststelle@datenschutz.hessen.de</span></p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[200px]">
                  <a
                    href="https://datenschutz.hessen.de"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-[#0A1E3A] hover:bg-[#132B50] text-white rounded-xl text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Offizielles HBDI Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </a>
                  <span className="text-[11px] text-slate-500 text-center font-mono">
                    Zuständig für Hessen und Lahn Dill
                  </span>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
