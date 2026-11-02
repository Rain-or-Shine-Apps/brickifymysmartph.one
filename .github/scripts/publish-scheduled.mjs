// Publishes blog posts waiting in blog/_scheduled/ once their date arrives.
//
// Each scheduled post is a pair of files in _scheduled/:
//   <YYYY-MM-DD>-<file>.html          the finished post
//   <YYYY-MM-DD>-<anything>.json      { publish, file, card, replace }
//     publish  date it goes live (UK time)
//     file     published name inside blog/
//     card     .post-card HTML for the top of blog/index.html (optional)
//     replace  [{ file, find, with }] text swaps in already-live files (optional)
//
// The workflow rebuilds sitemap.xml afterwards (build-sitemap.mjs), so posts
// don't need a sitemap entry. An old "sitemap" field in the JSON is ignored.
//
// Run: node .github/scripts/publish-scheduled.mjs [--today YYYY-MM-DD]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const BLOG = path.join(ROOT, 'blog');
const SCHED = path.join(BLOG, '_scheduled');

const arg = process.argv.indexOf('--today');
const today = arg > -1 ? process.argv[arg + 1]
  : new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date());

const read = f => fs.readFileSync(f, 'utf8');
const write = (f, s) => fs.writeFileSync(f, s);

if (!fs.existsSync(SCHED)) { console.log('Nothing scheduled.'); process.exit(0); }

const due = fs.readdirSync(SCHED).filter(f => f.endsWith('.json')).sort()
  .map(f => ({ json: path.join(SCHED, f), ...JSON.parse(read(path.join(SCHED, f))) }))
  .filter(p => p.publish <= today);

if (!due.length) { console.log(`Nothing due on ${today}.`); process.exit(0); }

let failed = false;
for (const p of due) {
  const src = path.join(SCHED, `${p.publish}-${p.file}`);
  const dest = path.join(BLOG, p.file);
  // A crashed earlier run may already have moved the post; carry on with the rest.
  if (fs.existsSync(src)) fs.renameSync(src, dest);
  else if (!fs.existsSync(dest)) { console.error(`MISSING ${src}`); failed = true; continue; }

  if (p.card) {
    const index = path.join(BLOG, 'index.html');
    const marker = '<div class="post-list">\n';
    const html = read(index);
    if (!html.includes(marker)) throw new Error('post-list not found in blog/index.html');
    if (!html.includes(`href="${p.file}" class="post-card"`)) write(index, html.replace(marker, marker + p.card));
  }

  for (const r of p.replace || []) {
    const f = path.join(ROOT, r.file);
    const s = fs.existsSync(f) ? read(f) : '';
    if (s.includes(r.find)) write(f, s.replace(r.find, r.with));
    else if (!s.includes(r.with)) { console.error(`NOT FOUND in ${r.file}: ${r.find.slice(0, 80)}`); failed = true; }
  }

  fs.unlinkSync(p.json);
  console.log(`Published ${p.file} (${p.publish})`);
}
process.exit(failed ? 1 : 0);
