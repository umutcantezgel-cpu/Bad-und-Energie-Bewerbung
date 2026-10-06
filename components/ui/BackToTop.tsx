'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/utils/haptics';

export function BackToTop() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 450);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    triggerHaptic('light');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Zurück an den Anfang"
      className={cn(
        'fixed bottom-6 right-6 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-[#0A1E3A] text-white shadow-lg border border-slate-700/50 transition-all duration-300 hover:bg-[#132B50] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#0284C7]',
        showButton ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-8 opacity-0 pointer-events-none'
      )}
    >
      <ArrowUp className="h-5 w-5" strokeWidth={1.5} />
    </button>
  );
}
