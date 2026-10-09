import fs from 'fs';
import path from 'path';

/**
 * JSON-LD integrity check on the prerendered HTML (run after `next build`: bun run test:graph).
 *
 * Scans .next/server/app/**\/*.html and verifies:
 * 1. Every JSON-LD block parses (object, array or @graph).
 * 2. At most 1 AggregateRating per document.
 * 3. FAQPage only on "/" (at most one there), none on any other page.
 * 4. JobPosting only on job pages /jobs/<slug> (ROADMAP §7, §10):
 *    - none on "/", "/jobs", "/bewerbung" or any other page,
 *    - exactly one on every indexable job page, none on a noindex job page ("besetzt"),
 *    - required properties: title, description, datePosted, hiringOrganization (with name),
 *      jobLocation, baseSalary (currency + value), directApply === true,
 *      url identical to the page's <link rel="canonical">.
 * Prerendered redirects (legacy slugs) are skipped.
 */

const APP_OUTPUT_DIR = path.resolve(process.cwd(), '.next/server/app');
const JOB_PAGE = /^\/jobs\/[^/]+$/;
const SCRIPT_RE = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

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

function decodeAttr(value) {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");
}

/** Attributes of every tag with the given name, e.g. all <link> or <meta> tags. */
function tagAttributes(html, tagName) {
  const tags = html.match(new RegExp(`<${tagName}\\b[^>]*>`, 'gi')) ?? [];
  return tags.map((tag) => {
    const attrs = {};
    for (const m of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
      attrs[m[1].toLowerCase()] = decodeAttr(m[2] ?? m[3] ?? '');
    }
    return attrs;
  });
}

function canonicalOf(html) {
  return tagAttributes(html, 'link').find((a) => (a.rel ?? '').split(/\s+/).includes('canonical'))?.href;
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

const nonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

/** Problems of a single JobPosting node; empty when valid. */
function jobPostingProblems(node, canonical) {
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
  return problems;
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
  const fail = (relativePath, message) => {
    console.error(`❌ [${relativePath}] ${message}`);
    errorCount++;
  };

  for (const file of htmlFiles) {
    const relativePath = path.relative(APP_OUTPUT_DIR, file);
    const route = routeOf(relativePath);
    const content = fs.readFileSync(file, 'utf8');
    if (isRedirect(file, content)) continue;
    checked++;

    const nodes = [];
    for (const match of content.matchAll(SCRIPT_RE)) {
      try {
        nodes.push(...flattenNodes(JSON.parse(match[1])));
      } catch (err) {
        fail(relativePath, `Malformed JSON-LD block: ${err.message}`);
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

    const postings = nodes.filter((n) => hasType(n, 'JobPosting'));
    if (!JOB_PAGE.test(route)) {
      if (postings.length > 0) {
        fail(relativePath, `JobPosting is only allowed on /jobs/<slug> (found ${postings.length} on ${route})`);
      }
      continue;
    }

    if (isNoindex(content)) {
      if (postings.length > 0) fail(relativePath, `noindex job page (closed) must not carry JobPosting markup`);
      continue;
    }

    if (postings.length !== 1) {
      fail(relativePath, `Expected exactly 1 JobPosting on ${route}, found ${postings.length}`);
      continue;
    }
    jobPagesWithPosting++;
    const canonical = canonicalOf(content);
    for (const problem of jobPostingProblems(postings[0], canonical)) fail(relativePath, `JobPosting: ${problem}`);
    if (!postings[0].validThrough) console.warn(`⚠️  [${relativePath}] JobPosting without validThrough`);
  }

  if (errorCount > 0) {
    console.error(`\n🚨 Graph integrity check failed with ${errorCount} error(s).`);
    process.exit(1);
  }

  console.log(
    `✅ All ${checked} HTML documents passed JSON-LD graph checks (${jobPagesWithPosting} job pages with a valid JobPosting).`,
  );
}

runGraphCheck();
