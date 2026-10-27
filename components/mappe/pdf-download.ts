/**
 * „PDF herunterladen“ (L4): Speichern, Teilen und die In-App-Browser der sozialen Apps. Klein und ohne react-pdf (steht
 * im Erst-Bundle der Mappe); den Satz lädt MappeTool erst bei Absicht (lib/mappe/pdf/browser.tsx).
 */

// Erkennung der App-Browser teilt die Mappe mit der Danke-Seite (lib/apply/in-app-browser.ts)
export { IN_APP_BROWSER, inAppBrowser, type InAppBrowser } from '@/lib/apply/in-app-browser';

/** Datei speichern: a[download] mit Blob-URL; die URL wird nach einer Minute freigegeben. */
export function herunterladen(blob: Blob, dateiname: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = dateiname;
  link.rel = 'noopener';
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Die PDF als Datei für das Teilen-Menü. */
export function pdfDatei(blob: Blob, dateiname: string): File {
  return new File([blob], dateiname, { type: 'application/pdf' });
}

type Teilen = Pick<Navigator, 'canShare' | 'share'>;

/** Nimmt das Teilen-Menü des Geräts diese Datei an? (Handy ja, die meisten Desktop-Browser nein.) */
export function kannTeilen(datei: File, nav: Partial<Teilen> | undefined = typeof navigator === 'undefined' ? undefined : navigator): boolean {
  if (!nav || typeof nav.canShare !== 'function' || typeof nav.share !== 'function') return false;
  try {
    return nav.canShare({ files: [datei] });
  } catch {
    return false;
  }
}
