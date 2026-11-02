// Sets <lastmod> on every sitemap.xml entry to the date its page last changed:
// today if the file has uncommitted edits, otherwise its last commit date.
//
// Run before committing a batch of page edits: node .github/scripts/sitemap-lastmod.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SM = path.join(ROOT, 'sitemap.xml');
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date());
const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).trim();

const lastChanged = file => {
  if (git('status', '--porcelain', '--', file)) return today;
  return git('log', '-1', '--format=%cs', '--', file) || today;
};

const xml = fs.readFileSync(SM, 'utf8').replace(
  /(<url>\s*<loc>https:\/\/brickifymysmartph\.one\/([^<]*)<\/loc>)(\s*<lastmod>[^<]*<\/lastmod>)?/g,
  (_, head, rel) => `${head}\n    <lastmod>${lastChanged(rel || 'index.html')}</lastmod>`
);
fs.writeFileSync(SM, xml);
console.log('sitemap.xml lastmod updated');
