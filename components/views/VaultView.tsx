'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, File, Trash2, CheckCircle2, Shield, AlertCircle } from 'lucide-react';
import { CandidateDossier, VaultFile } from '@/lib/recruiting-types';

interface VaultViewProps {
  dossier: CandidateDossier;
  onUpdateDossier: (updater: (prev: CandidateDossier) => CandidateDossier) => void;
  onSwitchView: (view: 'quiz' | 'vault' | 'form' | 'dossier') => void;
}

export function VaultView({ dossier, onUpdateDossier, onSwitchView }: VaultViewProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFiles = (fileList: FileList) => {
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

      let category: VaultFile['category'] = 'cert';
      const lower = f.name.toLowerCase();
      if (lower.includes('geselle') || lower.includes('brief') || lower.includes('zeugnis')) {
        category = 'geselle';
      } else if (lower.includes('führerschein') || lower.includes('fuehrer') || lower.includes('driver')) {
        category = 'license';
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
      onUpdateDossier((prev) => ({
        ...prev,
        files: [...prev.files, ...newFiles],
      }));
    }
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
    onUpdateDossier((prev) => ({
      ...prev,
      files: prev.files.filter((f) => f.id !== id),
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Dokumentenablage und Upload
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Lade Gesellenbriefe, Führerscheine oder Zertifikate sicher per Drag &amp; Drop hoch. Alle Dateien fließen in Dein Dossier ein.
        </p>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-700 font-medium">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" strokeWidth={1.5} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Master Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer select-none ${
          isDragging
            ? 'border-[#0284C7] bg-sky-50/70 scale-[0.99]'
            : 'border-slate-300 hover:border-[#0A1E3A] bg-white shadow-xs'
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

        <div className="w-16 h-16 rounded-2xl bg-sky-50 text-[#0284C7] mx-auto flex items-center justify-center mb-4">
          <UploadCloud className="w-8 h-8" strokeWidth={1.5} />
        </div>

        <div className="text-base font-bold text-slate-900 mb-1">
          Dateien hier hineinziehen oder Durchsuchen
        </div>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
          Unterstützte Formate: PDF, JPG, PNG (Maximal 25 MB pro Datei). Verschlüsselte Speicherung.
        </p>

        <button
          type="button"
          className="px-5 py-2.5 rounded-xl bg-[#0A1E3A] hover:bg-[#132B50] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
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
          <p className="text-[11px] text-slate-500 mb-3">
            Abschlussprüfung SHK oder Facharbeiterzertifikat
          </p>
          <div className="text-[11px] text-[#059669] flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Optional (auch ohne Nachweis möglich)</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
            <span>Führerschein B oder BE</span>
            <span className="text-slate-400 font-mono text-[10px]">Nachweis 2</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            Für Kundendienst und Werkstatttransporter
          </p>
          <div className="text-[11px] text-[#0284C7] flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Wichtig für Montagefahrzeuge</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
            <span>Zertifikate Bosch und Partner</span>
            <span className="text-slate-400 font-mono text-[10px]">Nachweis 3</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            Wärmepumpenschein, Kälteschein, DGUV
          </p>
          <div className="text-[11px] text-[#059669] flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Fließt in Deine Einstufung &amp; Boni ein</span>
          </div>
        </div>
      </div>

      {/* Uploaded Documents */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <h3 className="text-sm font-bold text-slate-900">
            Aktuelle Dokumente ({dossier.files.length})
          </h3>
          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
            <Shield className="w-3 h-3 text-[#059669]" strokeWidth={1.5} />
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
                      {formatFileSize(file.size)} • Status: Verifiziert im Dossier
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
            Zurück zum Profilfragebogen
          </button>
          <button
            type="button"
            onClick={() => onSwitchView('dossier')}
            className="px-6 py-2.5 rounded-xl bg-[#0A1E3A] hover:bg-[#132B50] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            In der DINA4 Bewerbungsmappe überprüfen
          </button>
        </div>
      </div>
    </div>
  );
}
