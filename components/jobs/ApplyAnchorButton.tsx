'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

export interface ApplyAnchorButtonProps {
  /** Id of the embedded flow section. */
  targetId?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Primary „Jetzt bewerben“ in the desktop aside. It jumps to the embedded flow and hides
 * itself while that section is on screen, so a viewport never shows two primary actions.
 * Without JS (or IntersectionObserver) it simply stays visible.
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
    <Button asChild size="lg" fullWidth className={cn(flowVisible && 'invisible', className)}>
      <a href={`#${targetId}`}>{children}</a>
    </Button>
  );
}
