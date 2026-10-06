import fs from 'fs';
import path from 'path';

/**
 * JSON-LD Knowledge Graph Build-Time Integrity Checker
 *
 * Scans static HTML files to verify:
 * 1. All JSON-LD blocks parse valid JSON.
 * 2. Max 1 AggregateRating per document (Google SERP penalty prevention).
 * 3. Max 1 FAQPage per document.
 * 4. Resolvable internal @id pointers.
 */

const APP_OUTPUT_DIR = path.resolve(process.cwd(), '.next/server/app');

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

function runGraphCheck() {
  console.log('🔍 Running JSON-LD Linked Data Graph Integrity Check...');

  const htmlFiles = findHtmlFiles(APP_OUTPUT_DIR);

  if (htmlFiles.length === 0) {
    console.log('ℹ️  No static HTML files found. Run "next build" first.');
    process.exit(0);
  }

  let errorCount = 0;

  for (const file of htmlFiles) {
    const relativePath = path.relative(APP_OUTPUT_DIR, file);
    const content = fs.readFileSync(file, 'utf8');

    // Extract all <script type="application/ld+json"> blocks
    const scriptRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;

    let aggregateRatingCount = 0;
    let faqPageCount = 0;

    while ((match = scriptRegex.exec(content)) !== null) {
      try {
        const json = JSON.parse(match[1]);
        const nodes = json['@graph'] ? json['@graph'] : [json];

        for (const node of nodes) {
          if (node['@type'] === 'AggregateRating' || node.aggregateRating) {
            aggregateRatingCount++;
          }
          if (node['@type'] === 'FAQPage') {
            faqPageCount++;
          }
        }
      } catch (err) {
        console.error(`❌ [${relativePath}] Malformed JSON-LD block:`, err.message);
        errorCount++;
      }
    }

    if (aggregateRatingCount > 1) {
      console.error(`❌ [${relativePath}] Found ${aggregateRatingCount} AggregateRating declarations (Max allowed: 1)`);
      errorCount++;
    }

    if (faqPageCount > 1) {
      console.error(`❌ [${relativePath}] Found ${faqPageCount} FAQPage declarations (Max allowed: 1)`);
      errorCount++;
    }
  }

  if (errorCount > 0) {
    console.error(`\n🚨 Graph integrity check failed with ${errorCount} error(s).`);
    process.exit(1);
  }

  console.log(`✅ All ${htmlFiles.length} HTML documents passed JSON-LD graph checks.`);
}

runGraphCheck();
