'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home, MessageSquare } from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp-utils';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error securely
    console.error('Unhandled Application Error:', error);
  }, [error]);

  const whatsappUrl = buildWhatsAppUrl(
    'Hallo Herr Demir, ich hatte einen technischen Fehler auf der Bewerbungsseite.'
  );

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-lg w-full text-center bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl">
        <div className="inline-flex items-center justify-center p-3.5 bg-amber-50 border border-amber-200 rounded-2xl mb-5">
          <AlertTriangle className="w-10 h-10 text-amber-600" strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1E3A] tracking-tight mb-3">
          Ein unerwarteter Fehler ist aufgetreten
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          Bitte entschuldige die Unannehmlichkeit. Du kannst versuchen, die Seite erneut zu laden, oder direkt mit uns Kontakt aufnehmen.
        </p>

        {error.digest && (
          <div className="mb-6 p-2 rounded-lg bg-slate-100 text-[11px] font-mono text-slate-500">
            Referenz-ID: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs font-bold text-white bg-[#0A1E3A] hover:bg-[#132B50] transition-colors cursor-pointer shadow-md"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
            <span>Erneut versuchen</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" strokeWidth={1.5} />
            <span>Zur Startseite</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
            <span>Technisches Problem direkt via WhatsApp melden</span>
          </a>
        </div>
      </div>
    </div>
  );
}
