import type { ReactNode } from 'react';

/**
 * Pass-through. Metadata and content now live in page.tsx (Server Component). Kept so the
 * generated route types in .next/types stay valid until the cleanup step removes this file.
 */
export default function DatenschutzLayout({ children }: { children: ReactNode }) {
  return children;
}
