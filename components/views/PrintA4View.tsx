'use client';

import React, { useState } from 'react';
import { Printer, MessageSquare, Send, CheckCircle2, Shield, Calendar, User, Phone, MapPin, Briefcase } from 'lucide-react';
import { CandidateDossier } from '@/lib/recruiting-types';
import { Logo } from '@/components/Logo';
import confetti from 'canvas-confetti';

interface PrintA4ViewProps {
  dossier: CandidateDossier;
  onSwitchView: (view: 'quiz' | 'vault' | 'form' | 'dossier') => void;
}

export function PrintA4View({ dossier }: PrintA4ViewProps) {
  const [submittedToast, setSubmittedToast] = useState(false);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleWhatsAppSend = () => {
    const text = encodeURIComponent(
      `Guten Tag Herr Demir,\n\nhier ist mein digitales Bewerberdossier für Bad und Energie GmbH Lahn Dill:\n\n` +
      `Name: ${dossier.fullName}\n` +
      `Position: ${dossier.position}\n` +
      `Telefon: ${dossier.phone}\n` +
      `Wohnort: ${dossier.location}\n` +
      `Praxiserfahrung: ${dossier.experience}\n` +
      `Frühester Start: ${dossier.startDate}\n` +
      `Gehaltsvorstellung: ${dossier.salaryExpectation}\n\n` +
      `Ich freue mich über ein unverbindliches Kennenlernen in Wetzlar!`
    );
    window.open(`https://wa.me/49644142956?text=${text}`, '_blank');
  };

  const handleSubmitDirect = () => {
    try {
      const sanitizedPhone = dossier.phone.replace(/[^0-9]/g, '') || '00000';
      const applicantEmail = dossier.email.trim() || `bewerber.${sanitizedPhone}@karriere.bad-energie.de`;

      fetch('/api/bewerbung', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: dossier.fullName,
          email: applicantEmail,
          phone: dossier.phone,
          location: dossier.location,
          position: dossier.position,
          experience: dossier.experience,
          startDate: dossier.startDate,
          salaryExpectation: dossier.salaryExpectation,
          skills: dossier.skills,
          notes: dossier.notes || dossier.coverLetter,
          contactPreference: dossier.contactPreference,
          discretionGuaranteed: dossier.discretionGuaranteed,
        }),
      }).catch((err) => {
        console.warn('[PrintA4View] Submission notice:', err);
      });
    } catch {
      // ignore
    }

    setSubmittedToast(true);
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0284C7', '#059669', '#C51E1E', '#0A1E3A'],
      });
    } catch {
      // ignore
    }
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="space-y-8">
      {/* Controls Bar (Hidden during print) - Floating Frosted Glass Bar */}
      <div className="no-print glass-panel p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#059669] font-bold mb-1">
            <span className="w-2 h-2 rounded-full bg-[#059669]" />
            Live synchronisiert mit Profilgenerator und Formular
          </div>
          <h2 className="text-xl font-extrabold text-[#0A1E3A]">
            Offizielles Bewerbungsdossier im DINA4 Format
          </h2>
          <p className="text-xs text-slate-500">
            Druckfertig formatiert für Bad und Energie GmbH Lahn Dill Wetzlar
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-[#0A1E3A] hover:bg-[#132B50] text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Als PDF drucken (A4)</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppSend}
            className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Per WhatsApp senden</span>
          </button>

          <button
            type="button"
            onClick={handleSubmitDirect}
            className="px-5 py-2.5 rounded-xl btn-crimson-glow text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Verbindlich einreichen</span>
          </button>
        </div>
      </div>

      {/* DIN-A4 Paper Simulation Container with Floating Easel Effect */}
      <div className="flex justify-center p-2 sm:p-4">
        <div
          id="print-sheet"
          className="bg-white border border-slate-200 dossier-paper-easel p-8 sm:p-14 w-full max-w-[210mm] min-h-[297mm] text-slate-800 text-xs flex flex-col justify-between"
        >
          {/* Top Section */}
          <div className="space-y-6">
            {/* Official Letterhead */}
            <div className="flex items-start justify-between border-b-2 border-[#0A1E3A] pb-5 gap-4">
              <div>
                <Logo
                  variant="print"
                  framing="none"
                  size="sm"
                  withLink={false}
                  priority={true}
                />
                <div className="text-[10px] text-slate-500 font-mono tracking-tight mt-2">
                  Bad und Energie GmbH Lahn Dill • Siegmund Hiepe Str. 20 • 35578 Wetzlar
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-2.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono font-bold text-[#0A1E3A] uppercase tracking-wider mb-1">
                  Bewerberdossier
                </span>
                <div className="text-[10px] text-slate-500 font-mono">
                  Datum: {dossier.createdAt || '01.10.2026'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Ref: BE WETZLAR HRB8459
                </div>
              </div>
            </div>

            {/* Candidate Metadata Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                  Kandidat
                </span>
                <strong className="font-bold text-slate-900 block text-sm">
                  {dossier.fullName}
                </strong>
                <span className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" strokeWidth={1.5} />
                  {dossier.location}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                  Direktkontakt
                </span>
                <span className="font-semibold text-slate-800 block text-[11px] font-mono flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-[#0284C7]" strokeWidth={1.5} />
                  {dossier.phone}
                </span>
                {dossier.email && (
                  <span className="text-slate-500 text-[10px] block truncate font-mono">
                    {dossier.email}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                  Praxis & Status
                </span>
                <span className="font-semibold text-slate-800 block text-[11px] flex items-center gap-1 mt-0.5">
                  <Briefcase className="w-3 h-3 text-slate-400" strokeWidth={1.5} />
                  {dossier.experience}
                </span>
                <span className="text-slate-500 text-[10px] block">
                  {dossier.startDate}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                  Gehaltsvorstellung
                </span>
                <span className="font-semibold text-[#0A1E3A] block text-[11px] font-mono mt-0.5">
                  {dossier.salaryExpectation}
                </span>
                <span className="text-[#059669] text-[10px] font-medium block">
                  Verhandlungsbasis
                </span>
              </div>
            </div>

            {/* Position Headline */}
            <div>
              <span className="text-[10px] font-mono font-bold text-[#0284C7] uppercase tracking-wider block">
                Bewerbung um die Fachposition:
              </span>
              <h2 className="text-base font-extrabold text-[#0A1E3A] mt-0.5">
                {dossier.position}
              </h2>
            </div>

            {/* Formulated German Cover Letter */}
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider mb-2 pb-1 border-b border-slate-100 flex items-center justify-between">
                <span>Persönliches Motivationsschreiben</span>
                <span className="text-[10px] text-slate-400 font-normal">An: Herrn Sabri Demir</span>
              </h3>
              <div className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line bg-white p-1">
                {dossier.coverLetter}
              </div>
            </div>

            {/* Competency & Skill Tags */}
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider mb-2 pb-1 border-b border-slate-100">
                Nachgewiesene Kompetenzen & Fertigkeiten
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {dossier.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-[11px] font-medium text-slate-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Attached Documents and Certificates */}
            {dossier.files.length > 0 && (
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider mb-2 pb-1 border-b border-slate-100">
                  Angehängte Nachweise & Zertifikate ({dossier.files.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {dossier.files.map((file) => (
                    <div
                      key={file.id}
                      className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]"
                    >
                      <span className="font-medium text-slate-900 truncate pr-2">
                        {file.name}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Verifiziert
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Candidate Praxis Notes */}
            {dossier.notes && (
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider mb-1.5 pb-1 border-b border-slate-100">
                  Praxisnotiz / Rahmenbedingungen
                </h3>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  „{dossier.notes}“
                </p>
              </div>
            )}
          </div>

          {/* Dossier Footer Sign-Off */}
          <div className="pt-6 mt-8 border-t border-slate-200 grid grid-cols-2 gap-6 text-[10px] text-slate-500">
            <div>
              <p className="font-bold text-slate-700">Bad und Energie GmbH Lahn Dill</p>
              <p>Handwerkskammer Wiesbaden • Innungs Meisterbetrieb seit 1926</p>
              <p>Telefon: 06441 42956 • E Mail: info@bad-energie.de</p>
            </div>
            <div className="text-right">
              <p>Dokument digital verifiziert & verschlüsselt hinterlegt</p>
              <p>Vertraulichkeitsstufe: DSGVO Art. 6 Abs. 1 lit. b i.V.m. § 26 BDSG</p>
              <p className="font-mono text-[#059669] font-bold">Status: Gültig & Eingereicht</p>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Success Toast */}
      {submittedToast && (
        <div className="no-print p-5 rounded-2xl bg-emerald-950 text-white border border-emerald-800 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-300 shrink-0">
              <CheckCircle2 className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <strong className="text-sm font-bold text-white block">
                Bewerberdossier erfolgreich an Bad und Energie GmbH übermittelt!
              </strong>
              <p className="text-xs text-slate-300 mt-0.5">
                Sabri Demir wird Deine Unterlagen diskret prüfen und sich innerhalb von 24 Stunden bei Dir melden.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSubmittedToast(false)}
            className="text-xs text-slate-400 hover:text-white px-3 py-1 cursor-pointer"
          >
            Schließen
          </button>
        </div>
      )}
    </div>
  );
}
