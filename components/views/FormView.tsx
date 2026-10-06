'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, ArrowRight, Camera, User } from 'lucide-react';
import { CandidateDossier, formBuilderSchema, FormBuilderValues } from '@/lib/recruiting-types';

interface FormViewProps {
  dossier: CandidateDossier;
  onUpdateDossier: (updater: (prev: CandidateDossier) => CandidateDossier) => void;
  onSwitchView: (view: 'quiz' | 'vault' | 'form' | 'dossier') => void;
  initialFocusField?: string | null;
}

export function FormView({
  dossier,
  onUpdateDossier,
  onSwitchView,
  initialFocusField,
}: FormViewProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormBuilderValues>({
    resolver: zodResolver(formBuilderSchema),
    defaultValues: {
      fullName: dossier.fullName,
      phone: dossier.phone,
      email: dossier.email,
      location: dossier.location,
      position: dossier.position,
      experience: dossier.experience,
      startDate: dossier.startDate,
      salaryExpectation: dossier.salaryExpectation,
      notes: dossier.notes,
      contactPreference: dossier.contactPreference,
      discretionGuaranteed: dossier.discretionGuaranteed,
    },
  });

  // Deep-link scroll & focus to missing mandatory field
  useEffect(() => {
    if (initialFocusField) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`field-${initialFocusField}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
          el.classList.add('ring-4', 'ring-[#0284C7]/30', 'border-[#0284C7]');
          setTimeout(() => {
            el.classList.remove('ring-4', 'ring-[#0284C7]/30', 'border-[#0284C7]');
          }, 2000);
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [initialFocusField]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        onUpdateDossier((prev) => ({ ...prev, photoUrl: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: FormBuilderValues) => {
    onUpdateDossier((prev) => ({
      ...prev,
      fullName: values.fullName,
      phone: values.phone,
      email: values.email || '',
      location: values.location,
      position: values.position,
      experience: values.experience,
      startDate: values.startDate,
      salaryExpectation: values.salaryExpectation || '',
      notes: values.notes || '',
      contactPreference: values.contactPreference,
      discretionGuaranteed: values.discretionGuaranteed,
    }));
    onSwitchView('dossier');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Online Bewerbungsformular
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Erfasse Stammdaten, Rahmenbedingungen und Wunschtermin. Alle Eingaben synchronisieren sich in Echtzeit mit dem DINA4 Dossier.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8"
      >
        {/* Section 1: Personalia */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
            <span className="w-6 h-6 rounded-md bg-[#0A1E3A] text-white flex items-center justify-center font-bold text-xs font-mono">
              1
            </span>
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
              Persönliche Angaben und Erreichbarkeit
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="field-fullName"
                className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Vollständiger Name *
              </label>
              <input
                id="field-fullName"
                type="text"
                {...register('fullName', {
                  onChange: (e) =>
                    onUpdateDossier((prev) => ({ ...prev, fullName: e.target.value })),
                })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0284C7] focus:border-[#0284C7] outline-none"
              />
              {errors.fullName && (
                <p className="text-red-600 text-[11px] mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="field-phone"
                className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Telefonnummer oder WhatsApp *
              </label>
              <input
                id="field-phone"
                type="tel"
                {...register('phone', {
                  onChange: (e) =>
                    onUpdateDossier((prev) => ({ ...prev, phone: e.target.value })),
                })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0284C7] focus:border-[#0284C7] outline-none"
              />
              {errors.phone && (
                <p className="text-red-600 text-[11px] mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="field-email"
                className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                E Mail Adresse optional
              </label>
              <input
                id="field-email"
                type="email"
                {...register('email', {
                  onChange: (e) =>
                    onUpdateDossier((prev) => ({ ...prev, email: e.target.value })),
                })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0284C7] focus:border-[#0284C7] outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="field-location"
                className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Wohnort und Postleitzahl *
              </label>
              <input
                id="field-location"
                type="text"
                {...register('location', {
                  onChange: (e) =>
                    onUpdateDossier((prev) => ({ ...prev, location: e.target.value })),
                })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0284C7] focus:border-[#0284C7] outline-none"
              />
              {errors.location && (
                <p className="text-red-600 text-[11px] mt-1">{errors.location.message}</p>
              )}
            </div>

            {/* Bewerbungsfoto Mini Picker */}
            <div className="sm:col-span-2 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-14 rounded-xl bg-white border border-slate-300 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                  {dossier.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={dossier.photoUrl} alt="Foto" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-slate-300" strokeWidth={1.5} />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Bewerbungsfoto für tabellarischen Lebenslauf
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {dossier.photoUrl ? 'Foto geladen und im DINA4 Dossier aktiv' : 'Optional · Format 3:4'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-[#0A1E3A] text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#0284C7]" strokeWidth={1.5} />
                  <span>{dossier.photoUrl ? 'Foto ändern' : 'Foto wählen'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
                {dossier.photoUrl && (
                  <button
                    type="button"
                    onClick={() => onUpdateDossier((prev) => ({ ...prev, photoUrl: '' }))}
                    className="text-[11px] text-slate-400 hover:text-red-600 px-2 py-1 cursor-pointer"
                  >
                    Entfernen
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Position & Experience */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
            <span className="w-6 h-6 rounded-md bg-[#0A1E3A] text-white flex items-center justify-center font-bold text-xs font-mono">
              2
            </span>
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
              Berufserfahrung und Rahmenbedingungen
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="field-experience"
                className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Berufserfahrung *
              </label>
              <select
                id="field-experience"
                {...register('experience', {
                  onChange: (e) =>
                    onUpdateDossier((prev) => ({ ...prev, experience: e.target.value })),
                })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0284C7] focus:border-[#0284C7] outline-none bg-white cursor-pointer"
              >
                <option value="4 Jahre Praxis">2 bis 5 Jahre Geselle</option>
                <option value="Über 5 Jahre Praxiserfahrung">Über 5 Jahre erfahrener Profi</option>
                <option value="Meister oder Servicetechniker">Meister oder Servicetechniker</option>
                <option value="Berufseinsteiger oder Azubi">Berufseinsteiger oder Azubi</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="field-startDate"
                className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Frühester Starttermin *
              </label>
              <select
                id="field-startDate"
                {...register('startDate', {
                  onChange: (e) =>
                    onUpdateDossier((prev) => ({ ...prev, startDate: e.target.value })),
                })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0284C7] focus:border-[#0284C7] outline-none bg-white cursor-pointer"
              >
                <option value="In 1 Monat Kündigungsfrist">In 1 Monat Kündigungsfrist</option>
                <option value="Sofort verfügbar">Sofort verfügbar</option>
                <option value="In 2 Monaten">In 2 Monaten</option>
                <option value="Nach individueller Absprache">Nach Absprache</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="field-salaryExpectation"
                className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Wunschkonditionen &amp; Arbeitsmodell (optional)
              </label>
              <input
                id="field-salaryExpectation"
                type="text"
                placeholder="z.B. Vollzeit (Freitag 13:30 Uhr frei), eigener Transporter"
                {...register('salaryExpectation', {
                  onChange: (e) =>
                    onUpdateDossier((prev) => ({ ...prev, salaryExpectation: e.target.value })),
                })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0284C7] focus:border-[#0284C7] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Notes & Discretion */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
            <span className="w-6 h-6 rounded-md bg-[#0A1E3A] text-white flex items-center justify-center font-bold text-xs font-mono">
              3
            </span>
            <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
              Zusätzliche Notizen an den Meister
            </h3>
          </div>

          <textarea
            id="field-notes"
            {...register('notes', {
              onChange: (e) =>
                onUpdateDossier((prev) => ({ ...prev, notes: e.target.value })),
            })}
            rows={3}
            placeholder="Besondere Werkzeugerfahrung, Kälteschein, bevorzugte Arbeitsbereiche..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0369a1] focus:border-[#0369a1] outline-none"
          />

          <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
            <Shield className="w-5 h-5 text-[#047857] shrink-0 mt-0.5" strokeWidth={1.5} />
            <div className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-900 block font-semibold">
                100% vertrauliche Behandlung nach § 26 BDSG garantiert
              </strong>
              Keine Rückfragen beim bisherigen Arbeitgeber. Deine Daten verbleiben ausschließlich bei Sabri Demir und dem Werkstattleiter der Bad und Energie GmbH Lahn Dill.
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onSwitchView('quiz')}
            className="px-5 py-2 text-xs font-semibold text-slate-600 hover:text-[#0A1E3A] cursor-pointer"
          >
            Zurück zum Profilfragebogen
          </button>
          <button
            type="submit"
            className="px-7 py-3 bg-[#C51E1E] hover:bg-[#A51616] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span>Dossier aktualisieren und anzeigen</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </form>
    </div>
  );
}
