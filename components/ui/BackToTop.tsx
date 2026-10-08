'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { iconButtonVariants } from './IconButton';

/** @deprecated legacy – removed with the old shell */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 450);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0 })}
      aria-label="Zurück an den Anfang"
      tabIndex={visible ? undefined : -1}
      aria-hidden={visible ? undefined : true}
      className={cn(
        iconButtonVariants({ variant: 'secondary' }),
        'fixed right-6 bottom-6 z-30 shadow-sm print-hidden',
        visible ? 'opacity-100' : 'pointer-events-none translate-y-8 opacity-0',
      )}
    >
      <ArrowUp aria-hidden="true" strokeWidth={1.75} className="size-5" />
    </button>
  );
}
