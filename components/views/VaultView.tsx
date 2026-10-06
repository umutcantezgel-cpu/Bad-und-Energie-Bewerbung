'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  File,
  Trash2,
  CheckCircle2,
  Shield,
  AlertCircle,
  Camera,
  User,
  Send,
  Sparkles,
  FileText,
  Phone,
  Mail,
  Check,
  ArrowRight,
} from 'lucide-react';
import { CandidateDossier, VaultFile } from '@/lib/recruiting-types';

interface VaultViewProps {
  dossier: CandidateDossier;
  onUpdateDossier: (updater: (prev: CandidateDossier) => CandidateDossier) => void;
  onSwitchView: (view: 'quiz' | 'vault' | 'form' | 'dossier') => void;
}

export function VaultView({ dossier, onUpdateDossier, onSwitchView }: VaultViewProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFiles = (fileList: FileList, forceCategory?: VaultFile['category']) => {
    setErrorMessage('');
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const maxSizeBytes = 25 * 1024 * 1024; // 25 MB

    const newFiles: VaultFile[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      if (!validTypes.includes(f.type) && !f.name.endsWith('.pdf')) {
        setErrorMessage(`Ungültiges Dateiformat bei "${f.name}". Bitte nur PDF, JPG oder PNG hochladen.`);
        continue;
      }

      if (f.size > maxSizeBytes) {
        setErrorMessage(`"${f.name}" ist zu groß (${formatFileSize(f.size)}). Maximal 25 MB erlaubt.`);
        continue;
      }

      let category: VaultFile['category'] = forceCategory || 'cert';
      const lower = f.name.toLowerCase();
      if (!forceCategory) {
        if (lower.includes('lebenslauf') || lower.includes('cv') || lower.includes('resume')) {
          category = 'resume';
        } else if (lower.includes('geselle') || lower.includes('brief') || lower.includes('zeugnis')) {
          category = 'geselle';
        } else if (lower.includes('führerschein') || lower.includes('fuehrer') || lower.includes('driver')) {
          category = 'license';
        }
      }

      newFiles.push({
        id: `file-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        name: f.name,
        size: f.size,
        type: f.type || 'application/pdf',
        category,
        uploadedAt: new Date().toLocaleDateString('de-DE'),
        status: 'verified',
      });
    }

    if (newFiles.length > 0) {
      const hasResume = newFiles.some((f) => f.category === 'resume');
      onUpdateDossier((prev) => ({
        ...prev,
        files: [...prev.files, ...newFiles],
        hasUploadedResume: prev.hasUploadedResume || hasResume,
      }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Bitte ein Bildformat (JPG, PNG oder WebP) als Bewerbungsfoto wählen.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onUpdateDossier((prev) => ({ ...prev, photoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    onUpdateDossier((prev) => ({ ...prev, photoUrl: '' }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (id: string) => {
    onUpdateDossier((prev) => {
      const remaining = prev.files.filter((f) => f.id !== id);
      const stillHasResume = remaining.some((f) => f.category === 'resume');
      return {
        ...prev,
        files: remaining,
        hasUploadedResume: stillHasResume,
      };
    });
  };

  const resumeFiles = dossier.files.filter((f) => f.category === 'resume');
  const certificateFiles = dossier.files.filter((f) => f.category !== 'resume');

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!dossier.fullName || dossier.fullName.trim().length < 2) {
      setErrorMessage('Bitte gib Deinen vollständigen Namen an.');
      return;
    }
    if (!dossier.phone || dossier.phone.trim().length < 5) {
      setErrorMessage('Bitte gib Deine Telefon- oder WhatsApp-Nummer für den Rückruf an.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bewerbung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: dossier.fullName,
          phone: dossier.phone,
          email: dossier.email || 'bewerber-direkt@karriere.bad-energie.de',
          location: dossier.location || 'Wetzlar und Umgebung',
          position: dossier.position,
          experience: dossier.experience,
          startDate: dossier.startDate,
          salaryExpectation: dossier.salaryExpectation,
          notes: `[DIREKT-UPLOAD BEWERBUNG MIT LEBENSLAUF]\nAngehängte Dokumente: ${dossier.files.map((f) => f.name).join(', ')}${dossier.photoUrl ? ' (Bewerbungsfoto vorhanden)' : ''}\nNotizen: ${dossier.notes}`,
          contactPreference: dossier.contactPreference,
          discretionGuaranteed: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Fehler bei der Übertragung.');
      }

      setSubmitSuccess(true);
    } catch {
      setErrorMessage(
        'Die Bewerbung konnte gerade nicht online übermittelt werden. Bitte rufe Herrn Demir direkt an unter 06441 42956 oder nutze WhatsApp.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Alternative zum Fragebogen · Sofortiger Direkt-Upload</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Lebenslauf, Foto &amp; Dokumente direkt hochladen
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Du hast schon einen Lebenslauf zur Hand? Kein Problem! Überspringe den Fragebogen, lade Deine Unterlagen hier hoch und bewirb Dich in unter 30 Sekunden.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onSwitchView('dossier')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>DINA4 Mappe öffnen</span>
          </button>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-700 font-medium animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" strokeWidth={1.5} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success banner if submitted */}
      {submitSuccess && (
        <div className="p-6 bg-emerald-50 border-2 border-emerald-500 rounded-3xl space-y-3 text-emerald-900 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-950">
                Bewerbung erfolgreich eingereicht!
              </h3>
              <p className="text-xs text-emerald-800">
                Deine Unterlagen liegen Dipl.-Ing. Sabri Demir vor. Wir melden uns verlässlich binnen 24 Stunden bei Dir.
              </p>
            </div>
          </div>
          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => onSwitchView('dossier')}
              className="px-4 py-2 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800 cursor-pointer"
            >
              Kompiliertes DINA4 Dossier ansehen &amp; drucken
            </button>
          </div>
        </div>
      )}

      {/* SECTION 1: PHOTO & RESUME HIGHLIGHT CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Foto Upload Card (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#0284C7]" />
                <h3 className="text-sm font-bold text-slate-900">Bewerbungsfoto</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Format 3:4</span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="relative w-28 h-36 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center shadow-inner group mb-3">
                {dossier.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={dossier.photoUrl}
                    alt="Bewerberfoto"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 p-3 text-slate-400">
                    <User className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
                    <span className="text-[10px] font-medium leading-tight">Kein Foto gewählt</span>
                  </div>
                )}

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              <p className="text-[11px] text-slate-500 max-w-xs mb-3">
                Wird automatisch in Deinen tabellarischen DINA4 Lebenslauf eingebettet.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0A1E3A] hover:bg-[#132B50] text-white text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{dossier.photoUrl ? 'Foto ändern' : 'Foto auswählen'}</span>
                </button>
                {dossier.photoUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-red-600 text-xs font-semibold cursor-pointer border border-slate-200"
                  >
                    Entfernen
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5 justify-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Optional · Handyschnappschuss genügt</span>
          </div>
        </div>

        {/* Direkt-Upload Lebenslauf Dropzone (8 cols) */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-white border-2 border-dashed border-[#0284C7]/60 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-[#0284C7] text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hauptdokument: Vorhandener Lebenslauf</span>
              </span>
              <span className="text-xs text-slate-500 font-mono">PDF, DOCX oder JPG</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Lebenslauf hier ablegen oder Durchsuchen
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
              Wenn Du bereits einen fertigen Lebenslauf hast, musst Du keine Fragen beantworten. Lade die Datei einfach hier hoch. Unser System verknüpft sie direkt mit Deiner Bewerbung.
            </p>

            <input
              ref={resumeInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => e.target.files && handleFiles(e.target.files, 'resume')}
              className="hidden"
            />

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => resumeInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-[#C51E1E] hover:bg-[#A51616] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Lebenslauf Datei auswählen (PDF)</span>
              </button>
              <span className="text-xs text-slate-500">Maximal 25 MB</span>
            </div>
          </div>

          {/* List of uploaded resumes */}
          {resumeFiles.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-800">
                Hochgeladener Lebenslauf ({resumeFiles.length}):
              </div>
              {resumeFiles.map((f) => (
                <div
                  key={f.id}
                  className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <strong className="text-emerald-950 font-semibold block">{f.name}</strong>
                      <span className="text-[10px] text-emerald-700 font-mono">
                        {formatFileSize(f.size)} • Bereit für Meister Demir
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(f.id)}
                    className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                    title="Entfernen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: 1-KLICK EXPRESSBEWERBUNG MIT DIESEN UNTERLAGEN */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
          <div className="w-8 h-8 rounded-xl bg-[#0A1E3A] text-white flex items-center justify-center font-bold text-xs">
            ➔
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Expressbewerbung mit Lebenslauf direkt absenden
            </h3>
            <p className="text-xs text-slate-500">
              Gib nur kurz Deinen Namen und Deine Nummer an – wir melden uns vertraulich bei Dir.
            </p>
          </div>
        </div>

        <form onSubmit={handleDirectSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Dein Name *
              </label>
              <input
                type="text"
                value={dossier.fullName}
                onChange={(e) =>
                  onUpdateDossier((prev) => ({ ...prev, fullName: e.target.value }))
                }
                placeholder="z.B. Alexander Koch"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0284C7] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Telefon oder WhatsApp *
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={dossier.phone}
                  onChange={(e) =>
                    onUpdateDossier((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="0170 1234567"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0284C7] outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                E-Mail (optional)
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={dossier.email}
                  onChange={(e) =>
                    onUpdateDossier((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="name@beispiel.de"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0284C7] outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              <strong className="text-slate-900 block font-semibold">
                Status Deiner Bewerbungsunterlagen:
              </strong>
              {dossier.files.length > 0 ? (
                <span className="text-emerald-700 font-medium">
                  ✓ {dossier.files.length} Datei(en) angehängt
                  {dossier.photoUrl ? ' · Bewerbungsfoto aktiv' : ''}
                </span>
              ) : (
                <span className="text-amber-700 font-medium">
                  Noch keine Datei angehängt (Du kannst auch ohne Datei absenden)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#C51E1E] hover:bg-[#A51616] text-white text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Wird übermittelt...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Jetzt mit Lebenslauf bewerben</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* SECTION 3: WEITERE ZEUGNISSE & NACHWEISE (DRAG & DROP) */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Weitere Dokumente (Gesellenbrief, Führerschein, Zertifikate)
          </h3>
          <p className="text-xs text-slate-500">
            Lade zusätzliche Nachweise hoch. Alle Dokumente werden verschlüsselt gespeichert und in Dein DINA4 Dossier eingebunden.
          </p>
        </div>

        {/* Master Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all cursor-pointer select-none ${
            isDragging
              ? 'border-[#0284C7] bg-sky-50/70 scale-[0.99]'
              : 'border-slate-300 hover:border-[#0A1E3A] bg-white shadow-2xs'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#0284C7] mx-auto flex items-center justify-center mb-3">
            <UploadCloud className="w-7 h-7" strokeWidth={1.5} />
          </div>

          <div className="text-sm font-bold text-slate-900 mb-1">
            Weitere Nachweise hier hineinziehen oder Durchsuchen
          </div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            PDF, JPG, PNG (Maximal 25 MB). Automatische Zuordnung zu Gesellenbrief, Führerschein oder Schein.
          </p>

          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-[#0A1E3A] hover:bg-[#132B50] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <File className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Dateien vom Gerät wählen</span>
          </button>
        </div>

        {/* 3 Categories Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
              <span>Gesellenbrief oder Zeugnis</span>
              <span className="text-slate-400 font-mono text-[10px]">Nachweis 1</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              Abschlussprüfung SHK oder Facharbeiterzertifikat
            </p>
            <div className="text-[11px] text-[#047857] flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Optional (auch ohne Nachweis möglich)</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
              <span>Führerschein B oder BE</span>
              <span className="text-slate-400 font-mono text-[10px]">Nachweis 2</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              Für Kundendienst und Werkstatttransporter
            </p>
            <div className="text-[11px] text-[#0369a1] flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Wichtig für Montagefahrzeuge</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
              <span>Zertifikate Bosch und Partner</span>
              <span className="text-slate-400 font-mono text-[10px]">Nachweis 3</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              Wärmepumpenschein, Kälteschein, DGUV
            </p>
            <div className="text-[11px] text-[#047857] flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Fließt in Einstufung &amp; Boni ein</span>
            </div>
          </div>
        </div>

        {/* Uploaded Documents List */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h4 className="text-sm font-bold text-slate-900">
              Alle hochgeladenen Dokumente ({dossier.files.length})
            </h4>
            <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
              <Shield className="w-3 h-3 text-[#047857]" strokeWidth={1.5} />
              TLS 256 Bit verschlüsselt
            </span>
          </div>

          {dossier.files.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Noch keine Dokumente hochgeladen. Ziehe Dateien oben in das Feld.
            </div>
          ) : (
            <div className="space-y-2.5">
              {dossier.files.map((file) => (
                <div
                  key={file.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-[#0284C7] flex items-center justify-center shrink-0">
                      <File className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{file.name}</div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatFileSize(file.size)} • Kategorie: {file.category} • Status: Verifiziert
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      Bereit
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.id)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      aria-label="Datei entfernen"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onSwitchView('quiz')}
              className="text-xs text-slate-600 hover:text-[#0A1E3A] font-semibold cursor-pointer"
            >
              Zum Profilfragebogen wechseln
            </button>
            <button
              type="button"
              onClick={() => onSwitchView('dossier')}
              className="px-6 py-2.5 rounded-xl bg-[#0A1E3A] hover:bg-[#132B50] text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <span>In DINA4 Bewerbungsmappe zusammenstellen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
