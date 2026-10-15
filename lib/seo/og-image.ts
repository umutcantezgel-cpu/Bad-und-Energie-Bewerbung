import { HERO, HERO_RADIUS_LABEL, heroStats, heroZweitzeile } from '@/components/home/content';
import { COMPANY } from '@/lib/content/company';
import { FACTS } from '@/lib/content/facts';
import { jobMetaTags, jobPath, payLabel } from '@/lib/jobs/format';
import { getActiveJobs, isJobLive } from '@/lib/jobs/registry';
import type { Job } from '@/lib/jobs/schema';
import { SITE_CONFIG } from '@/lib/seo/site-config';

/** Share image as used in `openGraph.images` / `twitter.images`. */
export interface OgImage {
  /** Root-relative (resolved against metadataBase) or absolute. */
  url: string;
  width: number;
  height: number;
  alt: string;
  type?: string;
}

export const OG_IMAGE_SIZE = Object.freeze({ width: 1200, height: 630 });
export const OG_IMAGE_TYPE = 'image/png';

/**
 * Light theme primitives of app/styles/theme.css as plain values (KERN K-006): ImageResponse cannot
 * read CSS variables. Paper left, navy panel right, red only as the supply line and the main button,
 * blue only as the return line; flat surfaces only, never red as a surface. Since E-029 there is no heat
 * image (and no warmth colour): the panel shows the house section from lib/zeichnung (lib/seo/og-haus.ts).
 */
export const OG_COLOR = Object.freeze({
  papier: '#FBF7F0',
  wand: '#F1E9DB',
  navy: '#111D6D',
  tinte: '#111A3B',
  tinte2: '#454C78',
  creme: '#F6F0E4',
  creme2: '#B9C0E8',
  rot: '#D60000',
  rotDruck: '#A80000',
  blau: '#1F57C4',
  weiss: '#FFFFFF',
});

/** Top left of every share image, like the place mark of the home hero (timeless, no anniversary). */
export const OG_EYEBROW = `Seit ${COMPANY.foundingYear} · ${COMPANY.address.city}`;

/** German capitals for the Martian labels (the site sets them via text-etikett). */
export function versal(text: string): string {
  return text.toLocaleUpperCase('de-DE');
}

/** „SHK-Jobs in Wetzlar.“ → ['SHK-Jobs', 'in Wetzlar.']: the h1 breaks after its first word, as on the site. */
export function splitTitle(title: string): [string, string] {
  const [first, ...rest] = title.trim().split(/\s+/);
  return [first, rest.join(' ')];
}

/** Two sentences on two lines („Ehrliches Handwerk.“ / „Flexible Arbeitszeiten.“). */
export function splitSentences(text: string): string[] {
  return text.split(/(?<=\.)\s+/).filter(Boolean);
}

export interface OgMeasure {
  value: string;
  name: string;
}

export interface OgFrameText {
  /** Martian label above the h1. */
  etikett: string;
  /** h1 in one or two lines. */
  title: readonly string[];
  /** Lines below the h1 (since E-029 without the pipe bracket). */
  subline: readonly string[];
  /** Red main action. */
  action: string;
  /** Small line under the button. */
  microcopy: string;
  /** Every string the image renders (for tests and glyph checks). */
  texts: readonly string[];
}

const ACTION = 'Jetzt bewerben';
const plain = (text: string) => text.replace(/ /g, ' ');

export interface OgHomeText extends OgFrameText {
  /** 30 Tage Urlaub · 1926 Gegründet (above the house). */
  measures: readonly OgMeasure[];
  /** 35 km Einsatzgebiet rund um Wetzlar (leader line to the compass mark in the gable; motif E-027). */
  radius: OgMeasure;
}

/**
 * Content of the root share image: the hero of the home page (HERO, heroZweitzeile, heroStats, facts) for the jobs that
 * are live when it is rendered. It is the default image of every page without its own (/jobs, /bewerbung, the hubs):
 * a fact one of those jobs leaves open (office S5, internship S4) carries „je nach Stelle“ (Prüfung E-029, Runde 3).
 */
export function ogHomeText(stellen: readonly Pick<Job, 'category'>[] = getActiveJobs().filter((job) => isJobLive(job, new Date()))): OgHomeText {
  const heroStatsFuer = heroStats(stellen);
  const stats = heroStatsFuer.map((stat) => ({ value: plain(stat.value), name: stat.label }));
  const index = Math.max(0, heroStatsFuer.findIndex((stat) => stat.factId === 'radius35'));
  const radius = { value: stats[index].value, name: HERO_RADIUS_LABEL };
  const measures = stats.filter((_, i) => i !== index);
  const title = splitTitle(HERO.title);
  const subline = splitSentences(heroZweitzeile(stellen));
  const microcopy = plain(HERO.microcopy);
  const etikett = versal(OG_EYEBROW);
  return {
    etikett,
    title,
    subline,
    action: ACTION,
    microcopy,
    measures,
    radius,
    texts: [etikett, ...title, ...subline, ACTION, microcopy, radius.value, radius.name, ...measures.flatMap((s) => [s.value, s.name])],
  };
}

export interface OgJobText extends Omit<OgFrameText, 'action'> {
  /** Red main action; null for a closed job (no button, no supply line). */
  action: string | null;
  /** h1 font size in px, fitted to the left column (fitTitle). */
  titleSize: number;
  /**
   * Key figure above the house section (a dimension chain since E-029): „Lohn auf Anfrage“ (E-030, never an amount), the employment kind when the job
   * says nothing about pay (school internship), or the closed state.
   */
  salary: { value: string; name: string | null };
  /**
   * Drawing in the navy panel (E-031): the house section by default, the Leitstelle (desk from above, lib/zeichnung/buero)
   * for the office job and the theme page „Büro und Verwaltung“. No supply line to the button there: no water in the office.
   */
  zeichnung?: 'haus' | 'buero';
}

type OgJob = Pick<Job, 'shortTitle' | 'titleShy' | 'pay' | 'employment' | 'location'> & Partial<Pick<Job, 'category'>>;

const SOFT_HYPHEN = '\u00AD';

/** Left column of the share image: width and height the h1 may take (px), and its largest size. */
export const OG_TITLE_BOX = Object.freeze({ width: 556, height: 224, max: 104, lineHeight: 0.96 });
/** Widest mean advance of Bricolage 800 in the job titles (measured: „mechaniker“ 0,532 em). */
const EM_PER_CHAR = 0.54;

export interface FittedTitle {
  lines: string[];
  size: number;
}

/**
 * Breaks a short job title into at most three lines for the h1 of the share image, at spaces, after
 * „/“ and at the soft hyphens the job already carries in `titleShy` (with a visible hyphen), and
 * picks the largest size that fits the box. More lines only when they make the title at least
 * 10 % larger; at equal size, fewer hyphens win.
 */
export function fitTitle(shortTitle: string, titleShy = ''): FittedTitle {
  const box = OG_TITLE_BOX;
  const shyWords = new Map(
    titleShy
      .split(/\s+/)
      .filter((word) => word.includes(SOFT_HYPHEN))
      .map((word) => [word.replaceAll(SOFT_HYPHEN, ''), word.split(SOFT_HYPHEN)] as const),
  );
  // Pieces with the break that may follow each one: space, hyphen (soft) or none (end).
  const pieces: Array<{ text: string; after: 'space' | 'hyphen' | 'end' }> = [];
  const words = shortTitle.trim().split(/\s+/);
  words.forEach((word, wordIndex) => {
    const parts = shyWords.get(word) ?? [word];
    parts.forEach((part, partIndex) => {
      const lastPart = partIndex === parts.length - 1;
      pieces.push({ text: part, after: !lastPart ? 'hyphen' : wordIndex === words.length - 1 ? 'end' : 'space' });
    });
  });

  const sizeFor = (lines: string[]) =>
    Math.floor(
      Math.min(
        box.max,
        box.width / (Math.max(...lines.map((line) => line.length)) * EM_PER_CHAR),
        box.height / (lines.length * box.lineHeight),
      ),
    );

  const breaks = pieces.map((_, index) => index).slice(0, -1);
  let best: (FittedTitle & { hyphens: number }) | null = null;
  for (let count = 1; count <= 3; count += 1) {
    let bestForCount: (FittedTitle & { hyphens: number }) | null = null;
    for (const cut of combinations(breaks, count - 1)) {
      const lines: string[] = [];
      let line = '';
      let hyphens = 0;
      pieces.forEach((piece, index) => {
        line += piece.text;
        if (cut.includes(index)) {
          if (piece.after === 'hyphen') {
            line += '-';
            hyphens += 1;
          }
          lines.push(line);
          line = '';
        } else if (piece.after === 'space') {
          line += ' ';
        }
      });
      lines.push(line);
      const size = sizeFor(lines);
      if (!bestForCount || size > bestForCount.size || (size === bestForCount.size && hyphens < bestForCount.hyphens)) {
        bestForCount = { lines, size, hyphens };
      }
    }
    if (bestForCount && (!best || bestForCount.size >= best.size * 1.1)) best = bestForCount;
  }
  const chosen = best ?? { lines: [shortTitle], size: sizeFor([shortTitle]), hyphens: 0 };
  return { lines: chosen.lines, size: chosen.size };
}

function combinations<T>(items: readonly T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (items.length < k) return [];
  const [head, ...tail] = items;
  return [...combinations(tail, k - 1).map((rest) => [head, ...rest]), ...combinations(tail, k)];
}

const careerDomain = () => SITE_CONFIG.baseUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');

/**
 * Content of a job share image: label with place and radius, the short title as h1, „(m/w/d)“ and
 * the employment tags below it, „Lohn auf Anfrage“ as the key figure (E-030, job registry only).
 * A closed job says so in the key figure, without button and supply line, and points to the job list.
 */
export function ogJobText(job: OgJob, open: boolean): OgJobText {
  const [kind, place, ...rest] = jobMetaTags(job).map(plain);
  const etikett = versal(`Stelle · ${place}`);
  const fitted = fitTitle(job.shortTitle, job.titleShy);
  // „Ausbildung · 3,5 Jahre“ ohne das Wort, das schon in der h1 steht.
  const tags = job.shortTitle.includes(kind) ? rest : [kind, ...rest];
  const subline = ['(m/w/d)', ...(tags.length > 0 ? [tags.join(' · ')] : [])];
  const lohn = open ? payLabel(job) : null;
  const salary = !open ? { value: 'Stelle besetzt', name: null } : lohn ? { value: lohn, name: null } : { value: kind, name: null };
  const action = open ? ACTION : null;
  const microcopy = open
    ? plain(`Dauert ca. ${FACTS.apply60s.value} Sekunden. ${FACTS.noCvNeeded.short}.`)
    : `Offene Stellen: ${careerDomain()}/jobs`;
  return {
    etikett,
    title: fitted.lines,
    titleSize: fitted.size,
    subline,
    action,
    microcopy,
    salary,
    zeichnung: job.category === 'buero' ? 'buero' : 'haus',
    texts: [etikett, ...fitted.lines, ...subline, ...(action ? [action] : []), microcopy, salary.value, ...(salary.name ? [salary.name] : [])],
  };
}

export interface OgPlaceText extends OgFrameText {
  /** h1 font size in px, fitted to the left column (fitTitle). */
  titleSize: number;
  /** Key figure (dimension chain since E-029): the road distance to the headquarters. */
  distance: { value: string; name: string };
}

/** What a place share image needs (lib/places text model and measurement), without importing lib/places here. */
export interface OgPlace {
  /** Etikett of the page („35745 Herborn · Lahn-Dill-Kreis“). */
  etikett: string;
  /** h1 of the page („SHK-Jobs für Herborn“). */
  h1: string;
  distanceKm: number;
  minutes: number;
  /**
   * Second line of the page's subline (placeSubline): the fact flexibleHours, „Je nach Stelle …“ while a shown job
   * leaves it open (office, fakten-abgleich S5). Taken from the page so that both say the same.
   */
  arbeitszeit: string;
}

/**
 * Content of a place share image (E-028): the page's etikett and h1, „Rund 26 Minuten Fahrt.“ and the working-time
 * line of the page below the h1, the road distance as the key figure („27 km“, „bis zum Firmensitz“).
 */
export function ogPlaceText(place: OgPlace): OgPlaceText {
  const etikett = versal(plain(place.etikett));
  const fitted = fitTitle(plain(place.h1));
  const subline = [`Rund ${place.minutes} Minuten Fahrt.`, plain(place.arbeitszeit)];
  const microcopy = plain(`Dauert ca. ${FACTS.apply60s.value} Sekunden. ${FACTS.noCvNeeded.short}.`);
  const distance = { value: `${place.distanceKm} km`, name: 'bis zum Firmensitz' };
  return {
    etikett,
    title: fitted.lines,
    titleSize: fitted.size,
    subline,
    action: ACTION,
    microcopy,
    distance,
    texts: [etikett, ...fitted.lines, ...subline, ACTION, microcopy, distance.value, distance.name],
  };
}

/**
 * Share image of a place page: its own app/einsatzgebiet/[slug]/opengraph-image route with a per-place alt. The
 * query changes with every new measurement (updatedAt), so WhatsApp and Co. fetch the new card.
 */
export function placeOgImage(place: { path: string; name: string; updatedAt: string; distanceKm: number }): OgImage {
  return {
    url: `${place.path}/opengraph-image?v=${place.updatedAt}`,
    ...OG_IMAGE_SIZE,
    type: OG_IMAGE_TYPE,
    alt: `SHK-Jobs für ${place.name}: ${place.distanceKm} km bis zum Firmensitz von ${COMPANY.shortName} in ${COMPANY.address.city}`,
  };
}

/**
 * The root image app/opengraph-image.tsx. Pages without their own image link it explicitly
 * (see generatePageMetadata), so its alt is defined here and imported by the image file.
 */
export const DEFAULT_OG_IMAGE: Readonly<OgImage> = Object.freeze({
  url: '/opengraph-image',
  ...OG_IMAGE_SIZE,
  type: OG_IMAGE_TYPE,
  alt: `${COMPANY.name}: SHK-Jobs in ${COMPANY.address.city}`,
});

/**
 * Share image of a job page: its own app/jobs/[slug]/opengraph-image route with a per-job alt.
 * The page links it explicitly because a file-based image can only have one static alt. The
 * query changes with every edit and when the job closes, so WhatsApp, LinkedIn and Facebook
 * fetch the new card instead of their cached one.
 */
export function jobOgImage(
  job: Pick<Job, 'slug' | 'shortTitle' | 'updatedAt' | 'location' | 'pay'>,
  open: boolean,
): OgImage {
  const salary = open ? payLabel(job) : null;
  const subject = `${job.shortTitle} (m/w/d) bei ${COMPANY.shortName} in ${job.location.city}`;
  return {
    url: `${jobPath(job)}/opengraph-image?v=${job.updatedAt}${open ? '' : '-besetzt'}`,
    ...OG_IMAGE_SIZE,
    type: OG_IMAGE_TYPE,
    alt: open ? (salary ? `${subject}, ${salary}` : subject) : `${subject}: Stelle besetzt`,
  };
}
