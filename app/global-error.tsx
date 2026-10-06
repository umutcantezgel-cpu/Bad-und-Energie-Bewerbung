'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root Global Error:', error);
  }, [error]);

  return (
    <html lang="de">
      <body className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-lg text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl">
            !
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            Systemfehler | Bad &amp; Energie Lahn Dill
          </h1>
          <p className="text-xs text-slate-600 mb-6">
            Ein kritischer Systemfehler ist aufgetreten. Bitte lade die Seite neu oder rufe uns direkt an (06441 42956).
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0A1E3A] text-white text-xs font-bold hover:bg-[#132B50] transition-colors cursor-pointer"
          >
            Seite neu laden
          </button>
        </div>
      </body>
    </html>
  );
}
