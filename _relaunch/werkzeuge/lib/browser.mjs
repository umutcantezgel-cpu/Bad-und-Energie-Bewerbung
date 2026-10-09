// Gemeinsamer Browser-Kern der Prüfwerkzeuge (Auftrag Abschnitt 11, Grenze G5).
// Jeder Browserlauf geht hierüber: schreibende Anfragen und Tracking-Hosts bekommen Attrappen,
// fremde Hosts werden blockiert, außer sie stehen ausdrücklich auf der Freigabeliste.
import { chromium } from 'playwright';

export const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

/** ANSICHTEN aus Abschnitt 0. */
export const VIEWPORTS = Object.freeze([
  { name: 'm375', width: 375, height: 812, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  { name: 't768', width: 768, height: 1024, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  { name: 'd1440', width: 1440, height: 900, isMobile: false, hasTouch: false, deviceScaleFactor: 1 },
  { name: 'd1920', width: 1920, height: 1080, isMobile: false, hasTouch: false, deviceScaleFactor: 1 },
]);

/** Grundmenge der Plattform (P0, Schritt 3). Pfad → Kurzname für Dateinamen. */
export const GRUNDMENGE = Object.freeze([
  { path: '/', slug: 'start', haupt: true },
  { path: '/jobs', slug: 'stellen', haupt: true },
  { path: '/jobs/anlagenmechaniker-shk-wetzlar', slug: 'stelle-anlagenmechaniker', haupt: true },
  { path: '/jobs/kundendiensttechniker-waermepumpe-wetzlar', slug: 'stelle-kundendienst' },
  { path: '/jobs/obermonteur-projektleiter-shk-wetzlar', slug: 'stelle-obermonteur' },
  { path: '/jobs/ausbildung-anlagenmechaniker-shk-wetzlar', slug: 'stelle-ausbildung' },
  { path: '/bewerbung', slug: 'bewerbung', haupt: true },
  { path: '/bewerbung/danke', slug: 'bewerbung-danke' },
  { path: '/bewerbung/mappe', slug: 'bewerbung-mappe' },
  { path: '/datenschutz', slug: 'datenschutz' },
  { path: '/impressum', slug: 'impressum' },
  { path: '/gibt-es-nicht-404', slug: 'fehler-404' },
]);

/** Seiten des Altstands (main @ f2e7eae). */
export const ALTSEITEN = Object.freeze([
  { path: '/', slug: 'alt-start' },
  { path: '/bewerbung', slug: 'alt-bewerbung' },
  { path: '/bewerbung?tab=quiz', slug: 'alt-bewerbung-quiz' },
  { path: '/bewerbung?tab=vault', slug: 'alt-bewerbung-tresor' },
  { path: '/bewerbung?tab=form', slug: 'alt-bewerbung-formular' },
  { path: '/bewerbung?tab=dossier', slug: 'alt-bewerbung-mappe' },
  { path: '/datenschutz', slug: 'alt-datenschutz' },
  { path: '/impressum', slug: 'alt-impressum' },
  { path: '/gibt-es-nicht-404', slug: 'alt-fehler-404' },
]);

const TRACKING = /(google-analytics|googletagmanager|doubleclick|facebook\.net|connect\.facebook|hotjar|clarity\.ms|plausible|matomo|posthog|segment\.io|vercel-insights|va\.vercel-scripts)/i;
const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Anfragesperre (G5).
 * - Schreibende Methoden: Attrappe. `mocks` kann je Pfad eine Antwort vorgeben, sonst 200 {"ok":true}.
 * - Tracking-Hosts: leere 204-Antwort.
 * - Fremde Hosts: abgebrochen, außer `allowHosts` enthält sie.
 * - Lesende POST-Abfragen gibt nur `allowReadPost` (Liste von Pfaden) einzeln frei.
 * Jede gesperrte Anfrage landet in `log`.
 */
export async function installRequestLock(context, { origin, allowHosts = [], mocks = {}, allowReadPost = [], log = [] } = {}) {
  const own = new URL(origin).host;
  await context.route('**/*', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const method = req.method();
    if (url.protocol === 'data:' || url.protocol === 'blob:') return route.continue();
    if (TRACKING.test(url.host)) {
      log.push({ kind: 'tracking', method, url: req.url() });
      return route.fulfill({ status: 204, body: '' });
    }
    if (url.host !== own && !allowHosts.includes(url.host)) {
      log.push({ kind: 'fremdhost', method, url: req.url() });
      return route.abort('blockedbyclient');
    }
    if (WRITE_METHODS.has(method)) {
      if (method === 'POST' && allowReadPost.includes(url.pathname)) return route.continue();
      const mock = mocks[url.pathname];
      log.push({ kind: 'attrappe', method, url: req.url() });
      if (typeof mock === 'function') return route.fulfill(await mock(req));
      if (mock) return route.fulfill(mock);
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, attrappe: true }) });
    }
    return route.continue();
  });
  return log;
}

/** Startet Chromium im vollen Modus (nicht die Headless-Shell). */
export async function launch({ headless = true } = {}) {
  return chromium.launch({ executablePath: CHROME, headless, args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'] });
}

/**
 * Neuer Kontext mit Ansicht, Farbschema, Bewegungspräferenz und Anfragesperre.
 * `userAgent` nur für den Altstand (ENTSCHEIDUNGEN E-006), nie für die Plattform.
 */
export async function newContext(browser, { origin, viewport, colorScheme = 'light', reducedMotion = 'no-preference', forcedColors = 'none', javaScriptEnabled = true, userAgent, mocks, allowHosts, log } = {}) {
  const vp = viewport ?? VIEWPORTS[2];
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.deviceScaleFactor,
    isMobile: vp.isMobile,
    hasTouch: vp.hasTouch,
    colorScheme,
    reducedMotion,
    forcedColors,
    javaScriptEnabled,
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
    ...(userAgent ? { userAgent } : {}),
  });
  const requestLog = log ?? [];
  await installRequestLock(context, { origin, mocks, allowHosts, log: requestLog });
  return { context, requestLog };
}

/** Sammelt Konsolenfehler und Seitenfehler einer Seite. */
export function collectErrors(page) {
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push({ kind: 'console', text: msg.text() });
  });
  page.on('pageerror', (err) => errors.push({ kind: 'pageerror', text: String(err?.message ?? err) }));
  return errors;
}

/** Scrollt schrittweise bis zum Ende und zurück, damit Auftritte und Lazy-Inhalte ausgelöst werden. */
export async function scrollThrough(page, { step = 0.8, pauseMs = 120 } = {}) {
  await page.evaluate(async ({ step, pauseMs }) => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const h = () => document.documentElement.scrollHeight;
    // scroll-behavior: smooth der Seite würde sonst jeden Sprung abbremsen (nur ~70 % Abdeckung, P0-SLOP-01).
    const go = (top) => window.scrollTo({ top, left: 0, behavior: 'instant' });
    let y = 0;
    while (y < h() - innerHeight) {
      y += Math.round(innerHeight * step);
      go(y);
      await sleep(pauseMs);
    }
    await sleep(pauseMs * 2);
    go(0);
    await sleep(pauseMs);
  }, { step, pauseMs });
}

/** Horizontaler Überlauf und abgeschnittener Text (Ebene 3). */
export async function overflowReport(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const horizontal = doc.scrollWidth > doc.clientWidth + 1;
    const clipped = [];
    for (const el of document.querySelectorAll('h1,h2,h3,h4,p,a,button,label,li,dt,dd,span,td,th')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      if (el.closest('[aria-hidden="true"],.sr-only,[hidden]')) continue;
      // Inhalte horizontaler Scroll-Container (z. B. Bewertungsband) sind erreichbar, nicht abgeschnitten.
      let inScroller = false;
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        const ox = getComputedStyle(a).overflowX;
        if (ox === 'auto' || ox === 'scroll') { inScroller = true; break; }
      }
      if (inScroller) continue;
      const clipX = (cs.overflowX === 'hidden' || cs.overflowX === 'clip') && el.scrollWidth > el.clientWidth + 1 && cs.textOverflow !== 'ellipsis';
      const r = el.getBoundingClientRect();
      const offRight = r.right > doc.clientWidth + 1 && r.width > 0;
      if (clipX || offRight) clipped.push({ tag: el.tagName.toLowerCase(), text: (el.textContent || '').trim().slice(0, 60), clipX, offRight: offRight ? Math.round(r.right - doc.clientWidth) : 0 });
      if (clipped.length >= 25) break;
    }
    return { horizontal, scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, clipped };
  });
}
