import { FACTS } from '@/lib/content/facts';
import { SITE_CONFIG } from '@/lib/seo/site-config';
import { TOKENS } from '@/lib/tokens';

/**
 * Wartungsmodus (Inhaber, 14.11.2026: Seite in den Wartungsmodus nehmen; 25.11.2026: wieder heraus, der Schalter
 * steht seitdem auf false).
 *
 * An heißt (proxy.ts):
 * - Jede Seite außer Impressum und Datenschutz zeigt nur die Wartungsseite unten, mit HTTP 503, Retry-After und ohne
 *   Cache. 503 heißt für Suchmaschinen „vorübergehend“: Sie behalten die Seiten im Index. Nach dem Abschalten ist die
 *   Seite sofort wieder da. Vorbehalt: Das gilt nur für eine kurze Pause. Bei mehreren Tagen 503 nimmt Google Seiten
 *   nach und nach aus dem Index; nach dem Abschalten dann die Schritte in docs/operations/betrieb.md, Abschnitt 8,
 *   „Nach dem Ausschalten“ (unter anderem die Indexierung von Hand mit „alles“).
 * - Neue Bewerbungen (POST /api/bewerbung, etwa aus einem noch offenen Tab) lehnt die Seite mit 503 und eigenem Text ab.
 * - Weiter erreichbar: Impressum und Datenschutz (Pflichtangaben), Ergänzungen zu schon abgeschickten Bewerbungen,
 *   /api/status und die übrigen APIs, dazu Feeds, Sitemap, robots.txt, Bilder und Icons (der Matcher in proxy.ts lässt
 *   sie ohnehin aus).
 *
 * Schalter: WARTUNGSMODUS. Er wirkt nur auf Vercel Production; lokal, in der CI und auf Previews bleibt die Seite
 * normal, damit Tests und Vorschauen die echte Seite prüfen. Die Umgebungsvariable WARTUNGSMODUS (an/aus) geht vor:
 * „an“ zeigt die Wartungsseite überall (etwa lokal zum Ansehen), „aus“ schaltet sie in Vercel ohne Code-Änderung ab
 * (wirkt nach einem Redeploy). Ablauf: docs/operations/betrieb.md, Abschnitt 8.
 */
export const WARTUNGSMODUS = false;

/** Retry-After der Wartungsseite in Sekunden: Suchmaschinen fragen nach einer Stunde wieder nach. */
export const WARTUNG_RETRY_AFTER_SEC = 3600;

/** Seiten, die auch im Wartungsmodus normal laufen: die Pflichtangaben. */
const OFFENE_SEITEN: ReadonlySet<string> = new Set(['/impressum', '/datenschutz']);

/** Nimmt neue Bewerbungen an; /api/bewerbung/ergaenzung (zu schon abgeschickten Bewerbungen) läuft weiter. */
const BEWERBUNG_API = '/api/bewerbung';

/** Ob der Wartungsmodus gilt: WARTUNGSMODUS=an|aus geht vor, sonst der Schalter, und der nur auf Vercel Production. */
export function wartungAktiv(env: Readonly<Record<string, string | undefined>> = process.env): boolean {
  const wert = env.WARTUNGSMODUS?.trim().toLowerCase();
  if (wert === 'an') return true;
  if (wert === 'aus') return false;
  return WARTUNGSMODUS && env.VERCEL_ENV === 'production';
}

/** Was der Proxy im Wartungsmodus mit einem Pfad macht: Wartungsseite, neue Bewerbung ablehnen oder durchlassen. */
export function wartungFuer(pathname: string): 'seite' | 'bewerbung' | null {
  if (pathname === BEWERBUNG_API) return 'bewerbung';
  if (pathname.startsWith('/api/') || OFFENE_SEITEN.has(pathname)) return null;
  return 'seite';
}

/** Text für neue Bewerbungen im Wartungsmodus (Vertrag C8, Code SERVICE_UNAVAILABLE; der Flow zeigt den Servertext). */
export const WARTUNG_BEWERBUNG_TEXT =
  'Die Karriereseite ist gerade im Wartungsmodus. Deshalb klappt das Senden gerade nicht. Bitte versuch es später noch einmal.';

const ESC: Readonly<Record<string, string>> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (text: string): string => text.replace(/[&<>"]/g, (zeichen) => ESC[zeichen] ?? zeichen);

/*
 * Eigenständiges HTML ohne Layout, Next-Skripte und Stylesheets der Seite: Kopf, Menü und „Jetzt bewerben“ führten nur
 * wieder hierher. Farben wie app/global-error.tsx über Systemfarben (CanvasText), dazu Papier und Nacht als Grund
 * (TOKENS.themeColor = --p-papier, --p-nacht). Das Logo bleibt die Originaldatei, dunkel auf der Papier-Plakette (G8).
 * Abstände und Radien aus der Skala (TOKENS.space, TOKENS.radius).
 */
const PAPIER = TOKENS.themeColor.light;
const NACHT = TOKENS.themeColor.dark;
const R = TOKENS.radius;

const CSS = `
*{box-sizing:border-box}
html{color-scheme:light dark;background:${PAPIER};-webkit-text-size-adjust:100%}
body{margin:0;min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;background:${PAPIER};color:CanvasText;font:17px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
main,footer{width:100%;max-width:40rem;margin:0 auto;padding-left:20px;padding-right:20px}
main{flex:1;display:flex;flex-direction:column;justify-content:center;padding-top:48px;padding-bottom:32px}
.plakette{display:inline-flex;align-self:flex-start;padding:4px;border-radius:${R.r1}px;margin-bottom:48px}
.plakette img{display:block;height:40px;width:auto}
h1{font-size:2rem;line-height:1.15;font-weight:600;letter-spacing:-0.02em;margin:0 0 16px}
h1,h2{text-wrap:balance}
p{margin:0;text-wrap:pretty}
.leise{opacity:.8}
.kasten{margin:32px 0;padding:24px;border:1px solid color-mix(in srgb,CanvasText 18%,transparent);border-radius:${R.r2}px}
.kasten h2{font-size:1em;line-height:1.3;font-weight:600;margin:0 0 8px}
a{color:inherit;text-underline-offset:4px}
.knopf{align-self:flex-start;display:inline-flex;align-items:center;min-height:48px;padding:0 24px;border-radius:${R.voll}px;background:CanvasText;color:${PAPIER};font-weight:600;text-decoration:none}
footer{display:flex;flex-wrap:wrap;gap:24px;padding-top:16px;padding-bottom:32px}
footer a{display:inline-flex;align-items:center;min-height:44px}
@media (min-width:768px){h1{font-size:2.5rem}}
@media screen and (prefers-color-scheme:dark){html,body{background:${NACHT}}.plakette{background:${PAPIER}}.knopf{color:${NACHT}}}
`
  .trim()
  .replace(/\n/g, '');

/** Die Wartungsseite (vollständiges HTML-Dokument). */
export const WARTUNG_HTML = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="${PAPIER}">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="${NACHT}">
<title>Kurze Pause | Bad &amp; Energie Karriere</title>
<link rel="icon" href="/favicon.ico" sizes="any">
<style>${CSS}</style>
</head>
<body>
<main>
<span class="plakette"><img src="/images/bad-energie-lahn-dill-logo-transparent.webp" alt="Bad und Energie GmbH Lahn Dill" width="219" height="40"></span>
<h1>Kurze Pause.</h1>
<p class="leise">Die Karriereseite ist gerade im Wartungsmodus. Schau bald wieder vorbei.</p>
<section class="kasten" aria-labelledby="schon-beworben">
<h2 id="schon-beworben">Schon beworben?</h2>
<p>Wenn du eine Bewerbungsnummer (BE-…) bekommen hast, ist deine Bewerbung da. ${esc(FACTS.quickResponse.long)}</p>
</section>
<a class="knopf" href="${esc(SITE_CONFIG.consumerUrl)}">Zu bad-energie.de</a>
</main>
<footer>
<a href="/impressum">Impressum</a>
<a href="/datenschutz">Datenschutz</a>
</footer>
</body>
</html>
`;
