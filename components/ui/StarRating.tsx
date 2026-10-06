import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  className?: string;
  size?: number;
}

export function StarRating({
  rating,
  maxRating = 5,
  className,
  size = 16,
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div
      role="img"
      className={cn('flex items-center gap-1 text-amber-400', className)}
      aria-label={`${rating} von ${maxRating} Sternen`}
    >
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          size={size}
          className="fill-amber-400 text-amber-400"
          strokeWidth={1.5}
        />
      ))}
      {hasHalfStar && (
        <Star
          key="half"
          size={size}
          className="fill-amber-400/50 text-amber-400"
          strokeWidth={1.5}
        />
      )}
      {[...Array(maxRating - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
        <Star
          key={`empty-${i}`}
          size={size}
          className="text-slate-300"
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}
