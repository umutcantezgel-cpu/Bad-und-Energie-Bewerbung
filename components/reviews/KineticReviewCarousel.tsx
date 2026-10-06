'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  ArrowLeftRight,
  Sparkles,
  Gauge,
  Sliders,
  RotateCcw,
  Users,
  Award,
} from 'lucide-react';
import {
  GoogleReview,
  googleCustomerReviews,
  teamRecruitingReviews,
  googleOverviewStats,
} from '@/lib/data/reviews.data';
import { ReviewCard } from './ReviewCard';
import { triggerHaptic } from '@/lib/utils/haptics';

interface KineticCarouselLaneProps {
  items: GoogleReview[];
  initialDirection?: 'left' | 'right';
  baseVelocity?: number;
  laneTitle?: string;
  laneSubtitle?: string;
  laneBadge?: string;
  activeFilter?: string;
}

function KineticCarouselLane({
  items,
  initialDirection = 'left',
  baseVelocity = -1.0,
  laneTitle,
  laneSubtitle,
  laneBadge,
  activeFilter = 'Alle',
}: KineticCarouselLaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);

  // Physik & Bewegungswerte
  const xRef = useRef(0);
  const velocityRef = useRef(initialDirection === 'left' ? baseVelocity : -baseVelocity);
  const baseSpeedRef = useRef(initialDirection === 'left' ? baseVelocity : -baseVelocity);
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const singleSetWidthRef = useRef(0);
  const dragStartRef = useRef({ x: 0, time: 0 });
  const lastPointerRef = useRef({ x: 0, time: 0 });
  const velocityHistoryRef = useRef<{ dx: number; dt: number }[]>([]);
  const hasMovedSignificantlyRef = useRef(false);

  // Reaktive Zustände für das Apple HUD
  const [isPaused, setIsPaused] = useState(false);
  const [currentSpeedLevel, setCurrentSpeedLevel] = useState<number>(1);
  const [direction, setDirection] = useState<'left' | 'right'>(initialDirection);
  const [isSpinningFast, setIsSpinningFast] = useState(false);

  // Gefilterte Einträge
  const filteredItems = activeFilter === 'Alle'
    ? items
    : items.filter((item) => item.category === activeFilter);

  // Falls nach Filterung zu wenige Einträge da sind, mit items auffüllen
  const displayItems = filteredItems.length > 0 ? filteredItems : items;

  // Messung der Set-Breite
  const measureSetWidth = useCallback(() => {
    if (setRef.current) {
      const width = setRef.current.offsetWidth;
      if (width > 0) {
        singleSetWidthRef.current = width;
      }
    }
  }, []);

  useEffect(() => {
    measureSetWidth();
    const handleResize = () => measureSetWidth();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [measureSetWidth, displayItems]);

  // High Performance RequestAnimationFrame Physik Schleife
  useEffect(() => {
    let animationFrameId: number;
    const friction = 0.965; // Sanfte Reibungsdämpfung für den Schnelldurchlauf
    const minFlingVelocity = 0.15;

    const tick = () => {
      // Wenn der Nutzer aktiv mit der Maus/Finger zieht, wird die Position direkt gesteuert
      if (!isDraggingRef.current) {
        const isHovered = isHoveredRef.current;
        const targetBaseSpeed = isPaused
          ? 0
          : isHovered
            ? 0
            : (direction === 'left' ? baseSpeedRef.current : Math.abs(baseSpeedRef.current));

        // Schleuder-Physik (Inertia & Momentum Damping)
        const currentV = velocityRef.current;
        const isAboveBase = Math.abs(currentV) > Math.abs(targetBaseSpeed) + 0.2;

        if (isAboveBase) {
          // Reibung anwenden wie bei einem physikalischen Trägheitslauf
          velocityRef.current = currentV * friction;
          if (Math.abs(velocityRef.current) > 8) {
            setIsSpinningFast(true);
          } else {
            setIsSpinningFast(false);
          }
        } else {
          // Sanfte Annäherung (Lerp) an die Ziel-Basisgeschwindigkeit
          const lerpFactor = isHovered || isPaused ? 0.12 : 0.05;
          velocityRef.current += (targetBaseSpeed - currentV) * lerpFactor;
          setIsSpinningFast(false);
        }

        // Translation anwenden
        xRef.current += velocityRef.current;
      }

      // Nahtloses Unendliches Wrapping (Infinite Virtual Reel)
      const setWidth = singleSetWidthRef.current;
      if (setWidth > 0) {
        if (xRef.current <= -setWidth) {
          xRef.current += setWidth;
        } else if (xRef.current >= 0) {
          xRef.current -= setWidth;
        }
      }

      // Direkte GPU-beschleunigte Zuweisung
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${xRef.current}px, 0, 0)`;
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [direction, isPaused]);

  // Pointer Events für Drag & Kinetic Scroll
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Nur linke Maustaste oder Touch
    if (e.button !== 0) return;

    isDraggingRef.current = true;
    hasMovedSignificantlyRef.current = false;
    dragStartRef.current = { x: e.clientX, time: performance.now() };
    lastPointerRef.current = { x: e.clientX, time: performance.now() };
    velocityHistoryRef.current = [];

    // Pointer fangen für unterbrechungsfreies Ziehen auch außerhalb des Containers
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Fallback falls PointerCapture nicht verfügbar ist
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const now = performance.now();
    const dx = e.clientX - lastPointerRef.current.x;
    const dt = Math.max(1, now - lastPointerRef.current.time);

    if (Math.abs(e.clientX - dragStartRef.current.x) > 6) {
      hasMovedSignificantlyRef.current = true;
    }

    // 1:1 Direkte Manipulation
    xRef.current += dx;

    // Rolling History für Schwungberechnung erfassen
    velocityHistoryRef.current.push({ dx, dt });
    if (velocityHistoryRef.current.length > 5) {
      velocityHistoryRef.current.shift();
    }

    lastPointerRef.current = { x: e.clientX, time: now };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignorieren
    }

    // Schleuder-Geschwindigkeit aus den letzten Bewegungen berechnen (Fling Physics)
    const history = velocityHistoryRef.current;
    if (history.length > 0) {
      let totalDx = 0;
      let totalDt = 0;
      for (const entry of history) {
        totalDx += entry.dx;
        totalDt += entry.dt;
      }
      const avgVelocity = totalDt > 0 ? (totalDx / totalDt) * 16.6 : 0;

      // Dynamischer Schwung-Impuls Multiplikator
      const flingImpulse = avgVelocity * 1.5;
      const clampedVelocity = Math.max(-32, Math.min(32, flingImpulse));

      if (Math.abs(clampedVelocity) > 2) {
        triggerHaptic('medium');
        velocityRef.current = clampedVelocity;
      }
    }
  };

  // Schnelldurchlauf Impuls per Knopfdruck
  const triggerFastScroll = () => {
    triggerHaptic('medium');
    // Wir beschleunigen das Karussell in die aktuelle Richtung
    const spinSpeed = direction === 'left' ? -28 : 28;
    velocityRef.current = spinSpeed;
    setIsPaused(false);
  };

  // Richtung wechseln
  const toggleDirection = () => {
    triggerHaptic('light');
    const newDir = direction === 'left' ? 'right' : 'left';
    setDirection(newDir);
    velocityRef.current = newDir === 'left' ? -Math.abs(velocityRef.current) : Math.abs(velocityRef.current);
  };

  // Geschwindigkeit verändern (1x, 1.5x, 2.2x)
  const cycleSpeed = () => {
    triggerHaptic('light');
    const nextSpeed = currentSpeedLevel === 1 ? 1.6 : currentSpeedLevel === 1.6 ? 2.4 : 1;
    setCurrentSpeedLevel(nextSpeed);
    baseSpeedRef.current = -1.0 * nextSpeed;
    if (!isPaused && !isHoveredRef.current) {
      velocityRef.current = direction === 'left' ? -1.0 * nextSpeed : 1.0 * nextSpeed;
    }
  };

  // Hover Pause
  const handleMouseEnter = () => {
    isHoveredRef.current = true;
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
  };

  return (
    <div className="relative mb-12 last:mb-0">
      {/* Kopfzeile der Spur mit Apple HUD Steuerung */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 px-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {laneBadge && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0284C7]/10 text-[#0284C7] border border-[#0284C7]/20">
                {laneBadge}
              </span>
            )}
            {isSpinningFast && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-[#0284C7] border border-sky-300 animate-pulse">
                <Sparkles className="w-3 h-3 text-[#0284C7]" />
                Schnelldurchlauf aktiv
              </span>
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#0A1E3A] tracking-tight">
            {laneTitle}
          </h3>
          {laneSubtitle && (
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {laneSubtitle}
            </p>
          )}
        </div>

        {/* Interaktives Steuerungs Cockpit (Steuerungs-HUD) */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Schnelldurchlauf Knopf */}
          <button
            type="button"
            onClick={triggerFastScroll}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-linear-to-r from-[#0284C7] to-[#0A1E3A] text-white text-xs font-bold shadow-[0_4px_16px_rgba(2,132,199,0.25)] hover:shadow-[0_6px_22px_rgba(2,132,199,0.35)] hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer"
            title="Mitarbeiter- und Kundenstimmen im schnellen Durchlauf anzeigen"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-200 animate-spin" style={{ animationDuration: '3s' }} />
            <span>Schnelldurchlauf</span>
          </button>

          {/* Richtungswechsler */}
          <button
            type="button"
            onClick={toggleDirection}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs hover:bg-slate-50 active:scale-[0.97] transition-all cursor-pointer"
            title="Laufrichtung wechseln (Links / Rechts)"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#0284C7]" />
            <span className="hidden sm:inline">
              {direction === 'left' ? 'Von rechts nach links' : 'Von links nach rechts'}
            </span>
          </button>

          {/* Geschwindigkeits Joystick */}
          <button
            type="button"
            onClick={cycleSpeed}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs hover:bg-slate-50 active:scale-[0.97] transition-all cursor-pointer"
            title="Geschwindigkeit anpassen"
          >
            <Gauge className="w-3.5 h-3.5 text-[#059669]" />
            <span>{currentSpeedLevel}x Tempo</span>
          </button>

          {/* Pause / Play Knopf */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setIsPaused(!isPaused);
            }}
            className="w-9 h-9 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-[0.97] transition-all shadow-2xs cursor-pointer"
            title={isPaused ? 'Karussell starten' : 'Karussell anhalten'}
          >
            {isPaused ? (
              <Play className="w-4 h-4 fill-slate-700 ml-0.5" />
            ) : (
              <Pause className="w-4 h-4 fill-slate-700" />
            )}
          </button>
        </div>
      </div>

      {/* Karussell Container mit Pointer Capture */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative overflow-hidden cursor-grab active:cursor-grabbing select-none py-2 -my-2 touch-pan-y"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)',
        }}
      >
        {/* Hardware-beschleunigter Endlos-Track mit 3 identischen Klon-Sets für nahtloses Wrapping */}
        <div
          ref={trackRef}
          className="flex will-change-transform py-3"
          style={{ width: 'max-content' }}
        >
          {/* Set 1: Primäres Set (zur Breitenmessung) */}
          <div ref={setRef} className="flex gap-5 shrink-0 pr-5">
            {displayItems.map((review, idx) => (
              <div
                key={`s1-${review.id}-${idx}`}
                className="w-[320px] sm:w-[380px] lg:w-[410px] shrink-0"
              >
                <ReviewCard review={review} />
              </div>
            ))}
          </div>

          {/* Set 2: Zweites Klon-Set */}
          <div className="flex gap-5 shrink-0 pr-5">
            {displayItems.map((review, idx) => (
              <div
                key={`s2-${review.id}-${idx}`}
                className="w-[320px] sm:w-[380px] lg:w-[410px] shrink-0"
              >
                <ReviewCard review={review} />
              </div>
            ))}
          </div>

          {/* Set 3: Drittes Klon-Set */}
          <div className="flex gap-5 shrink-0 pr-5">
            {displayItems.map((review, idx) => (
              <div
                key={`s3-${review.id}-${idx}`}
                className="w-[320px] sm:w-[380px] lg:w-[410px] shrink-0"
              >
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kleiner haptischer Interaktionshinweis unten */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-2 mt-2">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] animate-ping" />
          Tipp: Greife die Karten mit der Maus oder dem Finger und schleudere sie nach links oder rechts!
        </span>
        <span className="hidden sm:inline">
          Beim Daraufzeigen pausiert die Bewegung automatisch
        </span>
      </div>
    </div>
  );
}

export function KineticReviewCarousel() {
  const [activeTag, setActiveTag] = useState<string>('Alle');
  const [activeTab, setActiveTab] = useState<'both' | 'google' | 'team'>('both');

  const handleTagClick = (tag: string) => {
    triggerHaptic('light');
    setActiveTag(tag);
  };

  return (
    <div className="space-y-8">
      {/* Oberes Apple Kontrollsegment: Filter Chips & Modus Umschalter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-[0_4px_24px_rgba(10,30,58,0.03)]">
        {/* Ansichts Umschalter (Tabs) */}
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80 self-start">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('both');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'both'
                ? 'bg-white text-[#0A1E3A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Doppelspur (Kunden & Team)
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('google');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'google'
                ? 'bg-white text-[#0A1E3A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Google Kundenstimmen (5,0)
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('team');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'team'
                ? 'bg-white text-[#0A1E3A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Team & Meisterstimmen
          </button>
        </div>

        {/* Echte Google Filter Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5" />
            Themen:
          </span>
          {googleOverviewStats.filterTags.map((tag) => {
            const isSelected = activeTag === tag.label;
            return (
              <button
                key={tag.label}
                type="button"
                onClick={() => handleTagClick(tag.label)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0A1E3A] text-white border-[#0A1E3A] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{tag.label}</span>
                <span className={`ml-1 text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  {tag.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Spur 1: Echte Google Kundenrezensionen */}
      {(activeTab === 'both' || activeTab === 'google') && (
        <KineticCarouselLane
          items={googleCustomerReviews}
          initialDirection="left"
          baseVelocity={-1.0}
          laneBadge="Verifizierte Google Bewertungen"
          laneTitle="Echte Kundenstimmen aus Mittelhessen"
          laneSubtitle="5,0 von 5 Sternen bei 24 Rezensionen mit persönlicher Inhaber Antwort von Meister Demir"
          activeFilter={activeTag}
        />
      )}

      {/* Spur 2: Echte Stimmen aus dem Handwerkerteam */}
      {(activeTab === 'both' || activeTab === 'team') && (
        <KineticCarouselLane
          items={teamRecruitingReviews}
          initialDirection="right"
          baseVelocity={-0.85}
          laneBadge="Bewerber & Montage Praxis"
          laneTitle="Warum unser Meisterteam gerne hier arbeitet"
          laneSubtitle="Keine Fernmontage, pünktlich Feierabend um 13:30 Uhr freitags und echte Hilti Ausrüstung"
          activeFilter={activeTag}
        />
      )}
    </div>
  );
}
