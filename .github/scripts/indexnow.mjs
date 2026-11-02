// Tells IndexNow (Bing, Yandex and others) which pages changed, once they're live.
//
// Takes the commit the site was at before this push, lists the sitemap pages
// changed or deleted since then, waits until GitHub Pages is serving the new
// version, then sends them in a single POST.
//
// Run: node .github/scripts/indexnow.mjs <base-sha> [--dry-run]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { SITE, urlFor, listedPages } from './build-sitemap.mjs';

const KEY = 'e6916781f3e69b8fdd744d70c4d9ad09'; // served at /<KEY>.txt
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).trim();

const base = process.argv[2];
const dryRun = process.argv.includes('--dry-run');
if (!base || /^0+$/.test(base)) { console.log('No base commit; nothing to send.'); process.exit(0); }

const listed = new Map(listedPages().map(p => [p.file, p.url]));
const changed = git('diff', '--name-status', '--no-renames', base, 'HEAD', '--', '*.html')
  .split('\n').filter(Boolean).map(l => l.split('\t'))
  // Deleted pages go too, so search engines learn they're gone.
  .filter(([status, f]) => listed.has(f) || (status === 'D' && !path.basename(f).startsWith('_')))
  .map(([status, f]) => ({ file: f, deleted: status === 'D', url: listed.get(f) || urlFor(f) }));

if (!changed.length) { console.log('No sitemap pages changed.'); process.exit(0); }
console.log(changed.map(c => `${c.deleted ? 'deleted ' : ''}${c.url}`).join('\n'));
if (dryRun) process.exit(0);

// Wait for the deploy: the first changed page must be served byte-for-byte as committed.
const probe = changed.find(c => !c.deleted);
if (probe) {
  const want = fs.readFileSync(path.join(ROOT, probe.file), 'utf8');
  const deadline = Date.now() + 10 * 60 * 1000;
  for (;;) {
    const res = await fetch(`${probe.url}?v=${Date.now()}`, { cache: 'no-store' }).catch(() => null);
    if (res?.ok && (await res.text()) === want) break;
    if (Date.now() > deadline) { console.error(`Timed out waiting for ${probe.url} to go live.`); process.exit(1); }
    await new Promise(r => setTimeout(r, 20000));
  }
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`,
    urlList: changed.map(c => c.url),
  }),
});
console.log(`IndexNow: ${res.status} ${res.statusText}`);
process.exit(res.ok ? 0 : 1);
