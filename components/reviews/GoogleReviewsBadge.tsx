import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import { googleOverviewStats } from '@/lib/data/reviews.data';

interface GoogleReviewsBadgeProps {
  rating?: number;
  count?: number;
  interactive?: boolean;
}

export function GoogleReviewsBadge({
  rating = googleOverviewStats.averageRating,
  count = googleOverviewStats.totalReviews,
}: GoogleReviewsBadgeProps) {
  return (
    <div className="inline-flex items-center gap-3.5 rounded-full bg-white/95 backdrop-blur-md px-5 py-2.5 border border-slate-200/90 shadow-[0_4px_20px_rgba(10,30,58,0.04)] hover:shadow-[0_8px_30px_rgba(10,30,58,0.08)] transition-all">
      {/* Offizielles Google G Badge */}
      <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200/80 shadow-2xs shrink-0">
        <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#059669] ring-2 ring-white animate-pulse" />
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-900 text-sm font-sans tracking-tight">
            {rating.toFixed(1)}
          </span>
          <div className="flex text-amber-400 gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-[11px] font-bold text-slate-700 font-sans">
            Exzellent
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 font-sans">
          <span>{count} Berichte auf Google</span>
          <span>•</span>
          <span className="text-[#059669] font-semibold flex items-center gap-0.5">
            <ShieldCheck className="w-3 h-3 inline" />
            100% Empfehlung
          </span>
        </div>
      </div>
    </div>
  );
}
