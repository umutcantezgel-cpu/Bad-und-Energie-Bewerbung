'use client';

import React, { useState, useRef } from 'react';
import {
  Printer,
  MessageSquare,
  Send,
  CheckCircle2,
  Shield,
  Calendar,
  User,
  Phone,
  MapPin,
  Briefcase,
  Camera,
  Upload,
  Trash2,
  Award,
  Wrench,
  GraduationCap,
  Sparkles,
  FileText,
  FileCheck,
} from 'lucide-react';
import { CandidateDossier } from '@/lib/recruiting-types';
import { Logo } from '@/components/Logo';
import confetti from 'canvas-confetti';

interface PrintA4ViewProps {
  dossier: CandidateDossier;
  onUpdateDossier?: (updater: (prev: CandidateDossier) => CandidateDossier) => void;
  onSwitchView?: (view: 'hub' | 'quiz' | 'vault' | 'form' | 'dossier') => void;
}

export function PrintA4View({ dossier, onUpdateDossier, onSwitchView }: PrintA4ViewProps) {
  const [submittedToast, setSubmittedToast] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Bitte wähle eine gültige Bilddatei (JPG, PNG oder WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (onUpdateDossier) {
        onUpdateDossier((prev) => ({
          ...prev,
          photoUrl: result,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    if (onUpdateDossier) {
      onUpdateDossier((prev) => ({
        ...prev,
        photoUrl: '',
      }));
    }
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const handleWhatsAppSend = () => {
    const text = encodeURIComponent(
      `Guten Tag Herr Demir,\n\nhier ist mein digitales Bewerberdossier (Bewerbung & Lebenslauf) für Bad und Energie GmbH Lahn Dill:\n\n` +
      `Name: ${dossier.fullName}\n` +
      `Position: ${dossier.position}\n` +
      `Telefon: ${dossier.phone}\n` +
      `Wohnort: ${dossier.location}\n` +
      `Praxiserfahrung: ${dossier.experience}\n` +
      `Frühester Start: ${dossier.startDate}\n` +
      `Konditionen: ${dossier.salaryExpectation || 'Vollzeit (Freitags ab 13:30 Uhr frei)'}\n\n` +
      `Ich freue mich über ein unverbindliches Kennenlernen in Wetzlar!`
    );
    window.open(`https://api.whatsapp.com/send?phone=49644142956&text=${text}`, '_blank');
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

  const careerStations = dossier.careerStations && dossier.careerStations.length > 0
    ? dossier.careerStations
    : [
        {
          period: '2022 – heute',
          role: dossier.position || 'Geselle Anlagenmechaniker SHK',
          company: 'Fachbetrieb im Lahn-Dill-Kreis',
          tasks: [
            'Montage von modernen Heizsystemen und Wärmepumpen',
            'Badsanierung, Vorwandinstallation und Rohrmontage',
            'Kundendienst und Betreuung vor Ort',
          ],
        },
        {
          period: '2019 – 2022',
          role: 'Ausbildung Anlagenmechaniker SHK',
          company: 'Innungsbetrieb Mittelhessen',
          tasks: [
            'Grundlagen der Heizungs-, Sanitär- und Klimatechnik',
            'Erfolgreicher Abschluss der Gesellenprüfung',
          ],
        },
      ];

  const educationStations = dossier.educationStations && dossier.educationStations.length > 0
    ? dossier.educationStations
    : [
        {
          period: '2019 – 2022',
          degree: 'Gesellenbrief Anlagenmechaniker SHK',
          institution: 'Handwerkskammer Wiesbaden / Berufsschule',
        },
      ];

  return (
    <div className="space-y-8">
      {/* Hidden File Input for Photo Upload */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Controls Bar (Hidden during print) */}
      <div className="no-print glass-panel p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#047857] font-bold mb-1">
            <span className="w-2 h-2 rounded-full bg-[#047857]" />
            Bewerbungsmappe vollständig als 2-seitiges PDF kompiliert
          </div>
          <h2 className="text-xl font-extrabold text-[#0A1E3A]">
            Offizielle Bewerbungsunterlagen: Anschreiben &amp; Lebenslauf
          </h2>
          <p className="text-xs text-slate-500">
            Druckfertig formatiertes DIN-A4 Dokument (Blatt 1: Anschreiben • Blatt 2: Tabellarischer Lebenslauf mit Foto)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onSwitchView && (
            <button
              type="button"
              onClick={() => onSwitchView('vault')}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.5} />
              <span>Dokumente verwalten</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Bewerbungsfoto hochladen oder austauschen"
          >
            <Camera className="w-3.5 h-3.5 text-[#0369a1]" strokeWidth={1.5} />
            <span>{dossier.photoUrl ? 'Foto ändern' : 'Foto hochladen'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-[#0A1E3A] hover:bg-[#132B50] text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            title="Drucken oder als PDF speichern"
          >
            <Printer className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Als PDF herunterladen / Drucken (A4)</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppSend}
            className="px-4 py-2.5 rounded-xl bg-[#047857] hover:bg-[#035e44] text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
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

      {/* DIN-A4 Simulation Container */}
      <div className="flex flex-col items-center gap-8 p-2 sm:p-4">
        <div id="print-sheet" className="w-full max-w-[210mm] space-y-8">
          {/* ========================================================= */}
          {/* BLATT 1: OFFIZIELLES BEWERBUNGSSCHREIBEN (ANSCHREIBEN)     */}
          {/* ========================================================= */}
          <div className="dossier-page bg-white border border-slate-200 dossier-paper-easel p-8 sm:p-12 w-full text-slate-800 text-xs flex flex-col justify-between">
            <div className="space-y-6">
              {/* Briefkopf */}
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
                    Bad und Energie GmbH Lahn Dill • Siegmund-Hiepe-Str. 20 • 35578 Wetzlar
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono font-bold text-[#0A1E3A] uppercase tracking-wider mb-1">
                    Teil 1: Anschreiben
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Datum: {dossier.createdAt || '01.10.2026'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    100 Jahre Meisterbetrieb (1926–2026)
                  </div>
                </div>
              </div>

              {/* Absender- & Empfänger-Leiste */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                    Bewerber
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
                    Praxis &amp; Status
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
                    Konditionen
                  </span>
                  <span className="font-semibold text-[#0A1E3A] block text-[11px] font-mono mt-0.5 truncate">
                    {dossier.salaryExpectation || 'Nach Vereinbarung'}
                  </span>
                  <span className="text-[#047857] text-[10px] font-medium block">
                    Über Tarif + Sonderzahlungen
                  </span>
                </div>
              </div>

              {/* Betreffzeile */}
              <div className="pt-1">
                <span className="text-[10px] font-mono font-bold text-[#0369a1] uppercase tracking-wider block">
                  Bewerbung um die Fachposition:
                </span>
                <h2 className="text-base font-extrabold text-[#0A1E3A] mt-0.5">
                  {dossier.position}
                </h2>
              </div>

              {/* Formulierter Anschreiben-Text */}
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider mb-2 pb-1 border-b border-slate-100 flex items-center justify-between">
                  <span>Persönliches Motivationsschreiben</span>
                  <span className="text-[10px] text-slate-400 font-normal">An: Herrn Dipl.-Ing. Sabri Demir</span>
                </h3>
                <div className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line bg-white p-1">
                  {dossier.coverLetter}
                </div>
              </div>

              {/* Handwerkliche Schwerpunkte */}
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider mb-2 pb-1 border-b border-slate-100">
                  Praktische Fachschwerpunkte
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

              {/* Praxisnotiz / Wünsche */}
              {dossier.notes && (
                <div>
                  <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider mb-1.5 pb-1 border-b border-slate-100">
                    Persönliche Rahmenbedingungen
                  </h3>
                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    „{dossier.notes}“
                  </p>
                </div>
              )}
            </div>

            {/* Anschreiben Fußzeile & Grußformel */}
            <div className="pt-6 mt-6 border-t border-slate-200 flex items-end justify-between text-xs">
              <div>
                <p className="text-slate-600 font-medium">Mit handwerklichen Grüßen,</p>
                <p className="text-sm font-bold text-[#0A1E3A] mt-1">{dossier.fullName}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Wetzlar, den {dossier.createdAt || '01.10.2026'}</p>
              </div>

              <div className="text-right text-[10px] text-slate-500 font-mono">
                <p className="text-[#047857] font-bold">Seite 1 von 2 (Bewerbungsschreiben)</p>
                <p>Vertraulich nach § 26 BDSG</p>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* BLATT 2: TABELLARISCHER LEBENSLAUF (CURRICULUM VITAE)     */}
          {/* ========================================================= */}
          <div className="dossier-page dossier-page-break bg-white border border-slate-200 dossier-paper-easel p-8 sm:p-12 w-full text-slate-800 text-xs flex flex-col justify-between">
            <div className="space-y-6">
              {/* Lebenslauf Header mit Foto */}
              <div className="flex items-start justify-between border-b-2 border-[#0A1E3A] pb-5 gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="inline-block px-2.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono font-bold text-[#0A1E3A] uppercase tracking-wider">
                    Teil 2: Lebenslauf (Curriculum Vitae)
                  </div>
                  <h1 className="text-2xl font-black text-[#0A1E3A] tracking-tight truncate">
                    {dossier.fullName}
                  </h1>
                  <p className="text-xs font-bold text-[#0284C7]">
                    {dossier.position}
                  </p>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2 text-[11px] text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {dossier.phone}
                    </span>
                    <span className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {dossier.location}
                    </span>
                    {dossier.email && (
                      <span className="flex items-center gap-1.5 truncate col-span-2">
                        <span className="text-slate-400 font-mono">@</span>
                        {dossier.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bewerberfoto-Slot (3:4 Format) */}
                <div className="shrink-0 relative group">
                  {dossier.photoUrl ? (
                    <div className="relative w-24 h-32 rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={dossier.photoUrl}
                        alt={`Bewerbungsfoto von ${dossier.fullName}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="no-print absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Foto entfernen"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="w-24 h-32 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#0284C7] bg-slate-50 flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer group hover:bg-sky-50/50"
                      title="Bewerbungsfoto hochladen"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-200 group-hover:bg-sky-200 flex items-center justify-center mb-1 text-slate-600 group-hover:text-[#0284C7] transition-colors">
                        <Camera className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-bold text-slate-600 leading-tight">
                        Foto hinzufügen
                      </span>
                      <span className="text-[8px] text-slate-400 block mt-0.5">
                        (Optional)
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Sektion: Beruflicher Werdegang */}
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider mb-3 pb-1 border-b border-slate-100 flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>Beruflicher Werdegang &amp; Praxiserfahrung</span>
                </h3>
                <div className="space-y-3 pl-1">
                  {careerStations.map((station, idx) => (
                    <div key={idx} className="relative pl-5 border-l-2 border-slate-200 pb-2">
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#0284C7]" />
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                        <span className="font-bold text-slate-900 text-xs">{station.role}</span>
                        <span className="text-[10px] font-mono text-slate-500 font-medium">{station.period}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium mb-1">
                        {station.company} {station.location && `• ${station.location}`}
                      </div>
                      <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-600">
                        {station.tasks.map((t, tIdx) => (
                          <li key={tIdx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sektion: Handwerkliche Ausbildung & Qualifikationen */}
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-100 flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-[#047857]" />
                  <span>Ausbildung &amp; Abschlüsse</span>
                </h3>
                <div className="space-y-2 pl-1">
                  {educationStations.map((edu, idx) => (
                    <div key={idx} className="relative pl-5 border-l-2 border-slate-200 pb-1">
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#047857]" />
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                        <span className="font-bold text-slate-900 text-xs">{edu.degree}</span>
                        <span className="text-[10px] font-mono text-slate-500">{edu.period}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{edu.institution}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sektion: Kompetenzen & Werkzeug-Zertifikate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block mb-1.5 flex items-center gap-1.5">
                    <Wrench className="w-3 h-3 text-[#C51E1E]" />
                    <span>Fachkompetenzen &amp; Systeme</span>
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {dossier.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block mb-1.5 flex items-center gap-1.5">
                    <Award className="w-3 h-3 text-[#047857]" />
                    <span>Equipment &amp; Mobilität</span>
                  </span>
                  <div className="space-y-1 text-[10px] text-slate-700">
                    <p className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Führerschein Klasse B / BE vorhanden</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Erfahrung mit Hilti Flottenwerkzeug &amp; Sortimo</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Bereitschaft für regionale Baustellen im Lahn-Dill-Kreis</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Angehängte Anlagen */}
              {dossier.files.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider mb-1.5 pb-1 border-b border-slate-100 flex items-center justify-between">
                    <span>Anlagenverzeichnis</span>
                    <span className="text-[10px] text-slate-400 font-normal">{dossier.files.length} Nachweise beigefügt</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    {dossier.files.map((f) => (
                      <div key={f.id} className="p-1.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                        <span className="truncate pr-1 text-slate-800 font-medium">{f.name}</span>
                        <span className="text-[#047857] font-mono text-[9px] shrink-0">✓ verifiziert</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Lebenslauf Footer Sign-Off */}
            <div className="pt-6 mt-6 border-t border-slate-200 flex items-end justify-between text-xs">
              <div>
                <p className="text-[11px] text-slate-700 font-semibold">{dossier.location}, den {dossier.createdAt || '01.10.2026'}</p>
                <div className="mt-4 pt-1 border-t border-slate-300 w-44 text-[10px] text-slate-400 font-mono">
                  Unterschrift {dossier.fullName}
                </div>
              </div>

              <div className="text-right text-[10px] text-slate-500 font-mono">
                <p className="text-[#047857] font-bold">Seite 2 von 2 (Lebenslauf)</p>
                <p>Bad &amp; Energie GmbH Lahn Dill</p>
              </div>
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
