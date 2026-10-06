'use client';

import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export interface LeadQuickFormProps {
  variant?: 'card' | 'inline' | 'sheet';
  sourceTag?: string;
  heading?: string;
  subheading?: string;
  submitLabel?: string;
  onSuccess?: () => void;
  className?: string;
}

export function LeadQuickForm({
  variant = 'card',
  sourceTag = 'kontakt formular wetzlar',
  heading = 'Unverbindliche Schnellbewerbung oder Anfrage',
  subheading = 'In 60 Sekunden ausgefüllt. Meister Sabri Demir meldet sich verlässlich bei Ihnen.',
  submitLabel = 'Anfrage jetzt absenden',
  onSuccess,
  className = '',
}: LeadQuickFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    consent: false,
    websiteUrl: '', // Honeypot
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.websiteUrl) {
      setStatus('success');
      return;
    }

    if (!formData.name || !formData.email || !formData.consent) {
      setStatus('error');
      setErrorMessage('Bitte füllen Sie alle Pflichtfelder aus und bestätigen Sie die Datenschutzbestimmungen.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          sourceTag,
          consent: formData.consent,
          websiteUrl: formData.websiteUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Fehler bei der Übermittlung.');
      }

      setStatus('success');
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setStatus('error');
      const errText =
        err instanceof Error
          ? err.message
          : 'Es gab ein Problem bei der Übermittlung. Bitte rufen Sie uns direkt an oder schreiben Sie per WhatsApp.';
      setErrorMessage(errText);
    }
  };

  if (status === 'success') {
    return (
      <div className={`p-8 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center ${className}`}>
        <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-700 mb-4">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Vielen Dank für Ihre Nachricht!</h3>
        <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
          Ihre Angaben wurden sicher übermittelt. Eine Bestätigung ist unterwegs an Ihre E Mail Adresse. Meister Demir meldet sich verlässlich innerhalb von 24 Stunden bei Ihnen.
        </p>
      </div>
    );
  }

  const containerClasses =
    variant === 'card'
      ? 'p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm'
      : variant === 'inline'
        ? 'p-0'
        : 'p-4';

  return (
    <form onSubmit={handleSubmit} className={`${containerClasses} ${className}`}>
      {heading && <h3 className="text-xl font-bold text-slate-900 mb-1">{heading}</h3>}
      {subheading && <p className="text-sm text-slate-600 mb-6">{subheading}</p>}

      {/* Honeypot */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="websiteUrl">Website URL</label>
        <input
          id="websiteUrl"
          type="text"
          value={formData.websiteUrl}
          onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="quickform-name"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Vollständiger Name *
          </label>
          <input
            id="quickform-name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Vorname und Nachname"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="quickform-email"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              E Mail Adresse *
            </label>
            <input
              id="quickform-email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="ihre.adresse@beispiel.de"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label
              htmlFor="quickform-phone"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Telefonnummer
            </label>
            <input
              id="quickform-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="0171 1234567"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="quickform-message"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Ihre Nachricht oder Qualifikation
          </label>
          <textarea
            id="quickform-message"
            rows={3}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Beschreiben Sie kurz Ihr Anliegen oder Ihren handwerklichen Hintergrund..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-start gap-2.5 pt-1">
          <input
            id="privacy-consent-quickform"
            type="checkbox"
            required
            checked={formData.consent}
            onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="privacy-consent-quickform" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
            Ich willige in die Verarbeitung meiner Angaben gemäß der Datenschutzerklärung ein. Diese Einwilligung kann ich jederzeit widerrufen.
          </label>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-medium text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Wird übertragen...</span>
            </>
          ) : (
            <>
              <span>{submitLabel}</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
