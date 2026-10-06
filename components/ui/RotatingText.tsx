'use client';

import React, { useState, useEffect } from 'react';

export interface RotatingTextProps {
  words: string[];
  interval?: number;
  className?: string;
}

export function RotatingText({
  words,
  interval = 3200,
  className = '',
}: RotatingTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);

    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <span className={`inline-block relative overflow-hidden align-top transition-all duration-300 ${className}`}>
      <span
        key={index}
        className="inline-block transition-transform duration-300 font-extrabold text-[#C51E1E]"
      >
        {words[index]}
      </span>
    </span>
  );
}
