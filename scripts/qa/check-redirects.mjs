/**
 * Redirect Chain & Destination Validator
 *
 * Verifies that no redirect destination acts as the source for another redirect
 * (prevents 2-hop chains which Google Search Console flags as redirect errors).
 */

export function validateRedirectMap(redirects) {
  console.log('🔍 Checking for redirect chains and loops...');

  const sourceMap = new Map();
  let errors = 0;

  for (const r of redirects) {
    if (sourceMap.has(r.source)) {
      console.error(`❌ Duplicate redirect source detected: ${r.source}`);
      errors++;
    }
    sourceMap.set(r.source, r.destination);
  }

  for (const [source, destination] of sourceMap.entries()) {
    if (sourceMap.has(destination)) {
      console.error(`❌ Redirect chain detected: ${source} -> ${destination} -> ${sourceMap.get(destination)}`);
      errors++;
    }

    if (destination.endsWith('/') && destination !== '/') {
      console.error(`❌ Trailing slash on redirect destination: ${destination} (causes unnecessary 2nd hop)`);
      errors++;
    }
  }

  if (errors > 0) {
    console.error(`\n🚨 Redirect validation failed with ${errors} error(s).`);
    process.exit(1);
  }

  console.log(`✅ Validated ${redirects.length} redirects. Zero chains or trailing slash errors found.`);
}
