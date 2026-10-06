'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquare, X } from 'lucide-react';
import { buildWhatsAppUrl, whatsAppMessageFor } from '@/lib/utils/whatsapp-utils';
import { triggerHaptic } from '@/lib/utils/haptics';

const STORAGE_KEY = 'bad_energie_whatsapp_pos_v2';

export function FloatingWhatsAppWidget() {
  const pathname = usePathname();
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dockSide, setDockSide] = useState<'left' | 'right'>('right');
  const [hasUnread, setHasUnread] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const dragStartRef = useRef<{
    pointerStartX: number;
    pointerStartY: number;
    elemStartX: number;
    elemStartY: number;
    hasMoved: boolean;
    elemWidth: number;
    elemHeight: number;
  }>({
    pointerStartX: 0,
    pointerStartY: 0,
    elemStartX: 0,
    elemStartY: 0,
    hasMoved: false,
    elemWidth: 56,
    elemHeight: 56,
  });

  // Calculate default docked position based on current viewport
  const getDefaultPosition = useCallback((side: 'left' | 'right' = 'right', yRatio: number = 0.8) => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    const vpWidth = window.innerWidth;
    const vpHeight = window.innerHeight;
    const isMobile = vpWidth < 640;
    const size = isMobile ? 48 : 56;
    const margin = isMobile ? 12 : 24;

    const x = side === 'left' ? margin : vpWidth - size - margin;
    // Default Y: bottom clearance of ~96px on desktop (above BackToTop at 24px) or ~88px on mobile
    const defaultY = vpHeight - size - (isMobile ? 88 : 96);
    const y = yRatio !== 0.8 ? Math.max(72, Math.min(vpHeight - size - 80, vpHeight * yRatio)) : defaultY;

    return { x, y };
  }, []);

  // Initialize position from sessionStorage or defaults
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.dockSide === 'left' || parsed.dockSide === 'right')) {
            setDockSide(parsed.dockSide);
            setPosition(getDefaultPosition(parsed.dockSide, parsed.yRatio || 0.8));
            return;
          }
        }
      } catch {
        // Ignore storage errors
      }

      setPosition(getDefaultPosition('right', 0.8));
    }, 0);

    return () => clearTimeout(timer);
  }, [getDefaultPosition]);

  // Window resize handler to keep docked position relative to screen width/height
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return getDefaultPosition(dockSide);
        const vpWidth = window.innerWidth;
        const vpHeight = window.innerHeight;
        const isMobile = vpWidth < 640;
        const size = isMobile ? 48 : 56;
        const margin = isMobile ? 12 : 24;

        const targetX = dockSide === 'left' ? margin : vpWidth - size - margin;
        const clampedY = Math.max(72, Math.min(vpHeight - size - 80, prev.y));
        return { x: targetX, y: clampedY };
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [dockSide, getDefaultPosition]);

  // Trigger unread notification badge after 12 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasUnread(true);
      setShowTooltip(true);
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only respond to primary button (left mouse click or touch)
    if (e.button !== 0) return;

    const targetEl = e.currentTarget;
    const rect = targetEl.getBoundingClientRect();

    dragStartRef.current = {
      pointerStartX: e.clientX,
      pointerStartY: e.clientY,
      elemStartX: position ? position.x : rect.left,
      elemStartY: position ? position.y : rect.top,
      hasMoved: false,
      elemWidth: rect.width || 56,
      elemHeight: rect.height || 56,
    };

    setIsDragging(true);

    try {
      targetEl.setPointerCapture(e.pointerId);
    } catch {
      // Ignore pointer capture fallback
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartRef.current.pointerStartX;
    const deltaY = e.clientY - dragStartRef.current.pointerStartY;

    if (Math.hypot(deltaX, deltaY) > 5) {
      dragStartRef.current.hasMoved = true;
    }

    // 1:1 Synchronous tracking with cursor / touch
    const nextX = dragStartRef.current.elemStartX + deltaX;
    const nextY = dragStartRef.current.elemStartY + deltaY;

    // Viewport containment during drag
    const vpWidth = window.innerWidth;
    const vpHeight = window.innerHeight;
    const widgetW = dragStartRef.current.elemWidth;
    const widgetH = dragStartRef.current.elemHeight;

    const clampedX = Math.max(0, Math.min(vpWidth - widgetW, nextX));
    const clampedY = Math.max(0, Math.min(vpHeight - widgetH, nextY));

    setPosition({ x: clampedX, y: clampedY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore release error
    }

    // Gesture disambiguation: If pointer didn't move past 5px, it's a Tap/Click
    if (!dragStartRef.current.hasMoved) {
      handleOpenChat();
      return;
    }

    // Drag release -> Magnetic Snap to closest edge
    const vpWidth = window.innerWidth;
    const vpHeight = window.innerHeight;
    const widgetW = dragStartRef.current.elemWidth;
    const widgetH = dragStartRef.current.elemHeight;
    const currentX = position?.x ?? 0;
    const currentY = position?.y ?? 0;

    const isMobile = vpWidth < 640;
    const margin = isMobile ? 12 : 24;
    const topSafe = 72; // keep below sticky header
    const bottomSafe = isMobile ? 80 : 96; // keep above BackToTop and mobile bar

    const snapLeft = currentX + widgetW / 2 < vpWidth / 2;
    const targetX = snapLeft ? margin : vpWidth - widgetW - margin;
    const clampedY = Math.max(topSafe, Math.min(vpHeight - widgetH - bottomSafe, currentY));

    setPosition({ x: targetX, y: clampedY });
    setDockSide(snapLeft ? 'left' : 'right');
    triggerHaptic('light');

    // Persist preferred side and relative Y height
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          dockSide: snapLeft ? 'left' : 'right',
          yRatio: clampedY / vpHeight,
        })
      );
    } catch {
      // Ignore storage errors
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
  };

  const handleOpenChat = () => {
    triggerHaptic('light');
    const message = whatsAppMessageFor(pathname || '/');
    const url = buildWhatsAppUrl(message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isDismissed) return null;

  return (
    <div
      className="fixed top-0 left-0 z-40 select-none no-print pointer-events-auto"
      style={{
        transform: position
          ? `translate3d(${position.x}px, ${position.y}px, 0)`
          : 'translate3d(calc(100vw - 80px), calc(100vh - 150px), 0)',
        // Zero latency while dragging; silky spring physics when snapping on release
        transition: isDragging
          ? 'none'
          : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        willChange: isDragging ? 'transform' : 'auto',
      }}
    >
      {/* Tooltip Dialog Bubble (Only on sm+ screens to preserve 100% of mobile viewport space) */}
      {showTooltip && (
        <div
          className={`hidden sm:block absolute bottom-full mb-3 w-64 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xl text-xs text-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
            dockSide === 'left' ? 'left-0' : 'right-0'
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="font-bold text-[#0A1E3A]">
              Frage an Meister Sabri Demir?
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              aria-label="Hinweis schließen"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Schreibe uns vertraulich per WhatsApp. Du kannst diesen Button jederzeit verschieben.
          </p>
        </div>
      )}

      {/* Responsive Draggable Action Circle Button (48px auf Mobile, 56px auf Desktop) */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className={`relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#047857] text-white shadow-xl shadow-emerald-900/25 transition-shadow border-2 border-white ring-4 ring-emerald-500/15 ${
          isDragging
            ? 'cursor-grabbing scale-105 shadow-2xl ring-emerald-500/30'
            : 'cursor-grab hover:scale-105 active:scale-95'
        }`}
        role="button"
        tabIndex={0}
        aria-label="WhatsApp Direktkontakt zu Meister Sabri Demir öffnen (verschiebbar)"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpenChat();
          } else if (e.key === 'Escape') {
            setIsDismissed(true);
          }
        }}
      >
        <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-white pointer-events-none" strokeWidth={1.5} />

        {/* Pulsing Green Indicator */}
        {hasUnread && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 pointer-events-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-full w-full bg-emerald-400 border-2 border-white" />
          </span>
        )}
      </div>
    </div>
  );
}
