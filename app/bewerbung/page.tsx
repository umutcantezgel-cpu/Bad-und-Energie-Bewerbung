import { BEWERBUNG_METADATA, BewerbungSeite } from '@/components/apply/seite/BewerbungSeite';

export const metadata = BEWERBUNG_METADATA;
/**
 * Statisch, stündlich neu (Ablauf von Stellen über validThrough). ?stelle=, den Unterlagen-Hinweis und Altlinks wie
 * ?tab=dossier entscheidet proxy.ts vor dem Cache (lib/apply/vorauswahl.ts); hier kommt nur an, was die statische
 * Seite bekommt (ohne Vorauswahl, auch mit utm_*, ref oder herkunft).
 */
export const revalidate = 3600;
/** Wächter: Liest jemand wieder searchParams, headers oder cookies, bricht der Build, statt die Seite still dynamisch zu machen. */
export const dynamic = 'error';

export default function BewerbungPage() {
  return <BewerbungSeite />;
}
