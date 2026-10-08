'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { buttonVariants } from '@/components/ui/variants';

export interface ApplyAnchorButtonProps {
  /** Id of the embedded flow section. */
  targetId?: string;
  children: ReactNode;
  className?: string;
}

const BUTTON_CLASS = buttonVariants({ size: 'lg', fullWidth: true });

/**
 * Primary „Jetzt bewerben“ in the desktop aside. It jumps to the embedded flow and folds away
 * while that section is on screen, so a viewport never shows two primary actions and the
 * salary card closes up instead of keeping an empty slot. Brings its own top spacing (pt-5),
 * so nothing is left behind when it is folded. Without JS (or IntersectionObserver) it stays.
 */
export function ApplyAnchorButton({ targetId = 'bewerben', children, className }: ApplyAnchorButtonProps) {
  const [flowVisible, setFlowVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setFlowVisible(entry.isIntersecting));
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  return (
    <div
      inert={flowVisible}
      data-folded={flowVisible || undefined}
      className={`grid grid-rows-[1fr] transition-[grid-template-rows,opacity] duration-step ease-standard data-folded:grid-rows-[0fr] data-folded:opacity-0 ${className ?? ''}`}
    >
      {/* -m-1 p-1 leaves room for the focus ring inside the clipping box. */}
      <div className="-m-1 min-h-0 overflow-hidden p-1">
        <div className="pt-5">
          <a href={`#${targetId}`} className={BUTTON_CLASS}>
            {children}
          </a>
        </div>
      </div>
    </div>
  );
}
