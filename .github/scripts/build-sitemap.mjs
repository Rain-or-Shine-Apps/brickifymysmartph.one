// Builds sitemap.xml from the pages themselves, so it can't drift from the site.
//
// A page is listed when it isn't a template (_*.html), isn't noindex, and its
// canonical URL is its own address (or its folder, for index.html). <lastmod> is the date the page itself last
// changed: its last commit date, or today if it has uncommitted edits.
// CI needs full history for this (actions/checkout with fetch-depth: 0).
//
// Run: node .github/scripts/build-sitemap.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const SITE = 'https://brickifymysmartph.one';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date());
const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).trim();

export const urlFor = file => `${SITE}/${file}`;

// Pages that belong in the sitemap, as { file, url } where url is the page's canonical.
export function listedPages() {
  return git('ls-files', '--cached', '--others', '--exclude-standard', '*.html')
    .split('\n').filter(Boolean)
    .filter(f => !path.basename(f).startsWith('_') && !f.includes('/_') && !f.startsWith('supabase/'))
    .map(file => {
      const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
      if (/<meta name="robots" content="[^"]*noindex/i.test(html)) return null;
      const url = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
      const own = urlFor(file);
      return url === own || url === own.replace(/index\.html$/, '') ? { file, url } : null;
    })
    .filter(Boolean);
}

const lastChanged = file =>
  git('status', '--porcelain', '--', file) ? today : (git('log', '-1', '--format=%cs', '--', file) || today);

// Homepage first, then top-level pages, then each folder, alphabetically.
const order = f => (f === 'index.html' ? '0' : f.includes('/') ? '2' + f : '1' + f);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const pages = listedPages().sort((a, b) => order(a.file).localeCompare(order(b.file)));
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + pages.map(p => `  <url>\n    <loc>${p.url}</loc>\n    <lastmod>${lastChanged(p.file)}</lastmod>\n  </url>\n`).join('')
    + '</urlset>\n';
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
  console.log(`sitemap.xml: ${pages.length} pages`);
}
