import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * JSON-LD integrity check on the prerendered HTML (run after `next build`: bun run test:graph).
 *
 * Scans .next/server/app/**\/*.html and verifies:
 * 1. Exactly one JSON-LD block per document (V6-B), and it parses. Its root is
 *    `{ "@context": "https://schema.org", "@graph": [...] }`, the @ids of the graph nodes are unique and
 *    every nested object carrying an @id (a `{ "@id" }` reference or an embedded node such as
 *    hiringOrganization) resolves to a node of the same graph.
 * 2. Global nodes: exactly one Organization, Person, WebSite and LocalBusiness, with the same @ids in every
 *    document; Organization.founder → Person, WebSite.publisher and LocalBusiness.parentOrganization →
 *    Organization.
 * 3. Page node: with a <link rel="canonical"> exactly one WebPage node (WebPage or a subtype) carrying a
 *    `url`; url = canonical, @id = canonical#webpage (URL normal form), name = <title>, description = meta
 *    description, isPartOf → WebSite, about → Organization. Further WebPage subtypes (the FAQPage on "/")
 *    carry no url and point to it via isPartOf. Without canonical (404) no WebPage node at all.
 *    WebPage.breadcrumb exactly when a BreadcrumbList exists: @id canonical#breadcrumb, last item = canonical.
 * 4. At most 1 AggregateRating per document.
 * 5. FAQPage only on "/" (at most one there), none on any other page.
 * 6. noindex documents carry nothing that triggers a rich result (BreadcrumbList, JobPosting, FAQPage).
 * 7. JobPosting only on job pages /jobs/<slug> (ROADMAP §7, §10):
 *    - none on "/", "/jobs", "/bewerbung" or any other page,
 *    - exactly one on every indexable job page, none on a noindex job page ("besetzt"),
 *    - required properties: title, description, datePosted, hiringOrganization (with name),
 *      jobLocation, baseSalary (currency + value), directApply === true,
 *      url identical to the page's <link rel="canonical">, mainEntityOfPage → the WebPage node.
 * Prerendered redirects (legacy slugs) are skipped, and so is _global-error: it replaces the root layout
 * after a crash and is served with status 500, never indexed.
 */

const APP_OUTPUT_DIR = path.resolve(process.cwd(), '.next/server/app');
const JOB_PAGE = /^\/jobs\/[^/]+$/;
const SCRIPT_RE = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
const SKIPPED_ROUTES = new Set(['/_global-error']);
const GLOBAL_TYPES = ['Organization', 'Person', 'WebSite', 'LocalBusiness'];
const RICH_TYPES = ['BreadcrumbList', 'JobPosting', 'FAQPage'];
/** schema.org WebPage and its subtypes. */
const WEB_PAGE_TYPES = [
  'WebPage',
  'AboutPage',
  'CheckoutPage',
  'CollectionPage',
  'ContactPage',
  'FAQPage',
  'ItemPage',
  'MedicalWebPage',
  'ProfilePage',
  'QAPage',
  'RealEstateListing',
  'SearchResultsPage',
];

function findHtmlFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findHtmlFiles(fullPath, files);
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

/** "index.html" → "/", "jobs.html" → "/jobs", "jobs/abc.html" → "/jobs/abc". */
function routeOf(relativePath) {
  const withoutExt = relativePath.split(path.sep).join('/').replace(/\.html$/, '');
  if (withoutExt === 'index') return '/';
  return `/${withoutExt.replace(/\/index$/, '')}`;
}

function decodeEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** Attributes of every tag with the given name, e.g. all <link> or <meta> tags. */
function tagAttributes(html, tagName) {
  const tags = html.match(new RegExp(`<${tagName}\\b[^>]*>`, 'gi')) ?? [];
  return tags.map((tag) => {
    const attrs = {};
    for (const m of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
      attrs[m[1].toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? '');
    }
    return attrs;
  });
}

function canonicalOf(html) {
  return tagAttributes(html, 'link').find((a) => (a.rel ?? '').split(/\s+/).includes('canonical'))?.href;
}

function titleOf(html) {
  const match = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  return match ? decodeEntities(match[1]) : undefined;
}

function descriptionOf(html) {
  return tagAttributes(html, 'meta').find((a) => (a.name ?? '').toLowerCase() === 'description')?.content;
}

function isNoindex(html) {
  return tagAttributes(html, 'meta').some(
    (a) => /^(robots|googlebot)$/i.test(a.name ?? '') && /\bnoindex\b/i.test(a.content ?? ''),
  );
}

/** Prerendered redirect: meta refresh in the HTML or a 3xx status in Next's sidecar .meta file. */
function isRedirect(file, html) {
  if (tagAttributes(html, 'meta').some((a) => (a['http-equiv'] ?? '').toLowerCase() === 'refresh')) return true;
  const metaFile = file.replace(/\.html$/, '.meta');
  if (!fs.existsSync(metaFile)) return false;
  try {
    const status = JSON.parse(fs.readFileSync(metaFile, 'utf8')).status;
    return typeof status === 'number' && status >= 300 && status < 400;
  } catch {
    return false;
  }
}

function flattenNodes(json) {
  if (Array.isArray(json)) return json.flatMap(flattenNodes);
  if (json && typeof json === 'object' && Array.isArray(json['@graph'])) return json['@graph'].flatMap(flattenNodes);
  return json && typeof json === 'object' ? [json] : [];
}

function hasType(node, type) {
  const t = node['@type'];
  return Array.isArray(t) ? t.includes(type) : t === type;
}

const isWebPage = (node) => WEB_PAGE_TYPES.some((type) => hasType(node, type));
const nonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
/** `#fragment` on a URL in URL normal form, as lib/seo/graph.ts builds it (fragmentId). */
const fragmentId = (url, fragment) => new URL(`#${fragment}`, url).href;
const refTo = (value) => (value && typeof value === 'object' ? value['@id'] : undefined);

/** Every nested object carrying an @id below the graph nodes (references and embedded nodes). */
function nestedIds(value, top = true) {
  if (Array.isArray(value)) return value.flatMap((item) => nestedIds(item, false));
  if (!value || typeof value !== 'object') return [];
  const own = !top && typeof value['@id'] === 'string' ? [value['@id']] : [];
  return [...own, ...Object.values(value).flatMap((child) => nestedIds(child, false))];
}

/** Problems of a single JobPosting node; empty when valid. */
export function jobPostingProblems(node, canonical, pageId) {
  const problems = [];
  for (const key of ['title', 'description', 'datePosted']) {
    if (!nonEmptyString(node[key])) problems.push(`missing ${key}`);
  }
  const org = node.hiringOrganization;
  if (!org || typeof org !== 'object' || !nonEmptyString(org.name)) problems.push('missing hiringOrganization.name');
  const locations = Array.isArray(node.jobLocation) ? node.jobLocation : [node.jobLocation];
  if (!node.jobLocation || locations.some((l) => !l || typeof l !== 'object' || !l.address)) {
    problems.push('missing jobLocation.address');
  }
  const salary = node.baseSalary;
  if (!salary || typeof salary !== 'object' || !nonEmptyString(salary.currency) || !salary.value) {
    problems.push('missing baseSalary (currency + value)');
  }
  if (node.directApply !== true) problems.push('directApply must be true (flow is embedded on the page)');
  if (!canonical) problems.push('page has no <link rel="canonical">');
  else if (node.url !== canonical) problems.push(`url "${node.url}" differs from canonical "${canonical}"`);
  if (!pageId || refTo(node.mainEntityOfPage) !== pageId) {
    problems.push(`mainEntityOfPage must reference the WebPage node "${pageId}"`);
  }
  return problems;
}

/**
 * Graph structure (rules 1–3) of one parsed JSON-LD root against its HTML; returns the problems and the
 * WebPage @id (if any). `globalIds` collects the @ids of the global nodes across documents.
 */
export function graphProblems(root, html, globalIds = {}) {
  const problems = [];
  if (!root || typeof root !== 'object' || Array.isArray(root)) return { problems: ['root is not an object'] };
  if (root['@context'] !== 'https://schema.org') problems.push('root @context must be "https://schema.org"');
  if (!Array.isArray(root['@graph'])) return { problems: [...problems, 'root has no @graph'] };

  const graph = root['@graph'];
  const ids = graph.map((node) => node?.['@id']).filter((id) => typeof id === 'string');
  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (duplicates.length > 0) problems.push(`duplicate @id: ${[...new Set(duplicates)].join(', ')}`);
  for (const node of graph) {
    if (node?.['@context'] !== undefined) problems.push(`node ${node['@id'] ?? node['@type']} carries its own @context`);
    for (const ref of nestedIds(node)) {
      if (!ids.includes(ref)) problems.push(`unresolved @id reference "${ref}" in ${node['@id'] ?? node['@type']}`);
    }
  }

  const single = {};
  for (const type of GLOBAL_TYPES) {
    const found = graph.filter((node) => hasType(node, type));
    if (found.length !== 1) problems.push(`expected exactly 1 ${type}, found ${found.length}`);
    single[type] = found[0];
    const id = found[0]?.['@id'];
    if (!nonEmptyString(id)) continue;
    if (globalIds[type] === undefined) globalIds[type] = id;
    else if (globalIds[type] !== id) problems.push(`${type} @id "${id}" differs from "${globalIds[type]}" in other documents`);
  }
  const orgId = single.Organization?.['@id'];
  if (refTo(single.Organization?.founder) !== single.Person?.['@id']) problems.push('Organization.founder must reference the Person node');
  if (refTo(single.WebSite?.publisher) !== orgId) problems.push('WebSite.publisher must reference the Organization');
  if (refTo(single.LocalBusiness?.parentOrganization) !== orgId) {
    problems.push('LocalBusiness.parentOrganization must reference the Organization');
  }
  for (const posting of graph.filter((node) => hasType(node, 'JobPosting'))) {
    if (refTo(posting.hiringOrganization) !== orgId) problems.push('JobPosting.hiringOrganization @id must be the Organization');
  }

  const canonical = canonicalOf(html);
  const pages = graph.filter(isWebPage);
  const withUrl = pages.filter((node) => node.url !== undefined);
  if (!canonical) {
    if (pages.length > 0) problems.push(`no canonical, but ${pages.length} WebPage node(s)`);
    return { problems };
  }
  if (withUrl.length !== 1) {
    problems.push(`expected exactly 1 WebPage node with url, found ${withUrl.length}`);
    return { problems };
  }
  const page = withUrl[0];
  const pageId = page['@id'];
  if (page.url !== canonical) problems.push(`WebPage url "${page.url}" differs from canonical "${canonical}"`);
  if (pageId !== fragmentId(canonical, 'webpage')) problems.push(`WebPage @id "${pageId}" is not canonical#webpage`);
  if (page.name !== titleOf(html)) problems.push(`WebPage name "${page.name}" differs from <title> "${titleOf(html)}"`);
  if (page.description !== descriptionOf(html)) problems.push('WebPage description differs from the meta description');
  if (refTo(page.isPartOf) !== single.WebSite?.['@id']) problems.push('WebPage.isPartOf must reference the WebSite');
  if (refTo(page.about) !== orgId) problems.push('WebPage.about must reference the Organization');
  for (const other of pages.filter((node) => node !== page)) {
    if (refTo(other.isPartOf) !== pageId) problems.push(`${other['@type']} must point to the WebPage via isPartOf`);
  }

  const crumbs = graph.filter((node) => hasType(node, 'BreadcrumbList'));
  if (crumbs.length > 1) problems.push(`expected at most 1 BreadcrumbList, found ${crumbs.length}`);
  if (crumbs.length === 1) {
    const list = crumbs[0];
    if (list['@id'] !== fragmentId(canonical, 'breadcrumb')) problems.push(`BreadcrumbList @id "${list['@id']}" is not canonical#breadcrumb`);
    if (refTo(page.breadcrumb) !== list['@id']) problems.push('WebPage.breadcrumb must reference the BreadcrumbList');
    const items = Array.isArray(list.itemListElement) ? list.itemListElement : [];
    if (items.at(-1)?.item !== canonical) problems.push('the last breadcrumb item must be the canonical URL');
  } else if (page.breadcrumb !== undefined) {
    problems.push('WebPage.breadcrumb without a BreadcrumbList');
  }
  return { problems, pageId };
}

function runGraphCheck() {
  console.log('🔍 Running JSON-LD Linked Data Graph Integrity Check...');

  const htmlFiles = findHtmlFiles(APP_OUTPUT_DIR);

  if (htmlFiles.length === 0) {
    console.log('ℹ️  No static HTML files found. Run "next build" first.');
    process.exit(0);
  }

  let errorCount = 0;
  let checked = 0;
  let jobPagesWithPosting = 0;
  let webPages = 0;
  const globalIds = {};
  const fail = (relativePath, message) => {
    console.error(`❌ [${relativePath}] ${message}`);
    errorCount++;
  };

  for (const file of htmlFiles) {
    const relativePath = path.relative(APP_OUTPUT_DIR, file);
    const route = routeOf(relativePath);
    const content = fs.readFileSync(file, 'utf8');
    if (isRedirect(file, content) || SKIPPED_ROUTES.has(route)) continue;
    checked++;

    const blocks = [...content.matchAll(SCRIPT_RE)];
    if (blocks.length !== 1) fail(relativePath, `Expected exactly 1 JSON-LD block, found ${blocks.length}`);

    const nodes = [];
    let pageId;
    for (const match of blocks) {
      let root;
      try {
        root = JSON.parse(match[1]);
      } catch (err) {
        fail(relativePath, `Malformed JSON-LD block: ${err.message}`);
        continue;
      }
      nodes.push(...flattenNodes(root));
      const result = graphProblems(root, content, globalIds);
      for (const problem of result.problems) fail(relativePath, `Graph: ${problem}`);
      if (result.pageId) {
        pageId = result.pageId;
        webPages++;
      }
    }

    const aggregateRatingCount = nodes.filter((n) => hasType(n, 'AggregateRating') || n.aggregateRating).length;
    if (aggregateRatingCount > 1) {
      fail(relativePath, `Found ${aggregateRatingCount} AggregateRating declarations (Max allowed: 1)`);
    }

    const faqPageCount = nodes.filter((n) => hasType(n, 'FAQPage')).length;
    if (route === '/' && faqPageCount > 1) {
      fail(relativePath, `Found ${faqPageCount} FAQPage declarations (Max allowed: 1)`);
    } else if (route !== '/' && faqPageCount > 0) {
      fail(relativePath, `FAQPage is only allowed on "/" (found ${faqPageCount} on ${route})`);
    }

    const noindex = isNoindex(content);
    if (noindex) {
      const rich = nodes.filter((n) => RICH_TYPES.some((type) => hasType(n, type)));
      if (rich.length > 0) fail(relativePath, `noindex page must not carry ${rich.map((n) => n['@type']).join(', ')}`);
    }

    const postings = nodes.filter((n) => hasType(n, 'JobPosting'));
    if (!JOB_PAGE.test(route)) {
      if (postings.length > 0) {
        fail(relativePath, `JobPosting is only allowed on /jobs/<slug> (found ${postings.length} on ${route})`);
      }
      continue;
    }

    if (noindex) {
      if (postings.length > 0) fail(relativePath, `noindex job page (closed) must not carry JobPosting markup`);
      continue;
    }

    if (postings.length !== 1) {
      fail(relativePath, `Expected exactly 1 JobPosting on ${route}, found ${postings.length}`);
      continue;
    }
    jobPagesWithPosting++;
    const canonical = canonicalOf(content);
    for (const problem of jobPostingProblems(postings[0], canonical, pageId)) fail(relativePath, `JobPosting: ${problem}`);
    if (!postings[0].validThrough) console.warn(`⚠️  [${relativePath}] JobPosting without validThrough`);
  }

  if (errorCount > 0) {
    console.error(`\n🚨 Graph integrity check failed with ${errorCount} error(s).`);
    process.exit(1);
  }

  console.log(
    `✅ All ${checked} HTML documents passed JSON-LD graph checks: one @graph each, ${webPages} WebPage nodes = canonical, ` +
      `${jobPagesWithPosting} job pages with a valid JobPosting, global @ids ${JSON.stringify(globalIds)}.`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runGraphCheck();
