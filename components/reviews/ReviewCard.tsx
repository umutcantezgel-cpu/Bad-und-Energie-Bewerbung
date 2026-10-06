'use client';

import React, { useState } from 'react';
import { Star, CheckCircle2, MessageSquare, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { GoogleReview } from '@/lib/data/reviews.data';

interface ReviewCardProps {
  review: GoogleReview;
  showCategoryTag?: boolean;
}

export function ReviewCard({ review, showCategoryTag = true }: ReviewCardProps) {
  const [showResponse, setShowResponse] = useState(false);
  const initial = review.author.charAt(0).toUpperCase();
  const isTeam = review.verifiedSource === 'Mitarbeiter Stimme';

  return (
    <article className="flex flex-col justify-between bg-white/95 backdrop-blur-sm p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-[0_4px_20px_rgba(10,30,58,0.03)] hover:shadow-[0_12px_36px_rgba(10,30,58,0.08)] hover:-translate-y-1 transition-all duration-300 h-full select-none">
      <div>
        {/* Header: Avatar, Name, Metriken */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-2xs shrink-0 ${
                isTeam
                  ? 'bg-[#0284C7]/10 border border-[#0284C7]/20 text-[#0284C7]'
                  : 'bg-emerald-50 border border-emerald-200/80 text-[#059669]'
              }`}
            >
              {initial}
            </div>

            <div>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                <span>{review.author}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {review.role}
              </div>
            </div>
          </div>

          <span className="text-[10px] font-sans font-medium text-slate-400 tabular-nums shrink-0">
            {review.date}
          </span>
        </div>

        {/* Badges & Meta-Leiste */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {review.badge && (
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                isTeam
                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {review.badge}
            </span>
          )}

          {showCategoryTag && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
              {review.category}
            </span>
          )}

          {review.reviewCount && (
            <span className="text-[10px] text-slate-400 font-medium">
              {review.reviewCount} Rezensionen
            </span>
          )}
        </div>

        {/* Sternenbewertung */}
        <div className="flex items-center gap-1.5 text-amber-400 mb-3">
          <div className="flex">
            {[...Array(review.rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-[11px] font-extrabold text-slate-800 ml-1">
            5,0
          </span>
        </div>

        {/* Zitat Text */}
        <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed italic min-h-[4.5rem]">
          „{review.text}“
        </p>

        {/* Inhaber Antwort Akkordeon */}
        {review.ownerResponse && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowResponse(!showResponse);
              }}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0A1E3A] hover:text-[#0284C7] transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>Antwort von Meister Demir</span>
              {showResponse ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {showResponse && (
              <div className="mt-2 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700 leading-relaxed animate-fadeIn">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1 text-[10px]">
                  <span>{review.ownerResponse.author}</span>
                  <span className="text-slate-400 font-normal">{review.ownerResponse.date}</span>
                </div>
                <p className="italic">„{review.ownerResponse.text}“</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer mit verifizierter Herkunft */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-sans font-medium">
        <span className="inline-flex items-center gap-1 text-slate-600 font-semibold">
          <MapPin className="w-3 h-3 text-[#059669]" />
          {review.location}
        </span>
        <span className="font-bold text-[#059669]">
          {review.verifiedSource}
        </span>
      </div>
    </article>
  );
}
