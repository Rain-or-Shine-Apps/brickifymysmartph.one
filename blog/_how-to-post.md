# Adding a Brickify blog post

Files starting with `_` (this one, `_template.html`, `_case-study-template.html`) are not published by GitHub Pages.

The blog is the **Parenting & phones** pillar of the site (menu: How it works · Parenting & phones · Why Brickify). Posts can be cross-linked from the other two pillar pages.

## What to send Claude

A doc (Google Doc, Word, or pasted text) with:

| Field | Notes |
|---|---|
| Header | The post title |
| Subheader | One or two sentences under the title |
| Summary | ~150 characters for Google and social previews. Optional; Claude will write one from the subheader if missing |
| Date | Publish date. Defaults to the day it goes up |
| Picture | Image file (ideally 1200×675 or wider, landscape) plus a caption if wanted |
| Video | YouTube link, or an MP4 file. Say where in the copy it should go (default: after the first section) |
| Copy | Body text. Headings, bullet lists, quotes and links all carry over |
| Slug | Optional, sets the URL (see below). If left out, Claude picks one and tells you |
| Pillar | How it works, Parenting & phones, Family story, Why Brickify or Christmas. Sets the blog-page filter. Claude picks one if missing |

## Slug = URL

Every post's address is:

```
https://brickifymysmartph.one/blog/<slug>.html
```

The slug rules:
- lowercase letters, numbers and hyphens only (no spaces, apostrophes or other punctuation)
- 3 to 6 words, keeping the keywords people would search for
- written once and never changed after publishing (changing it breaks shared links)

Examples:
- "5 Things in Online Safety You Shouldn't Miss" → `five-things-in-online-safety`
- "How to Make a School Phone Brick-Only" → `school-phone-brick-only`

You can pick the slug yourself to know the URL in advance (e.g. for social posts scheduled ahead of time).

## Steps Claude follows

1. Copy `_template.html` to `<slug>.html` and fill every `{{PLACEHOLDER}}` (title appears in several places, including the JSON-LD block). Keep the `<title>` to 30–60 characters (shorten it there if the headline is longer; no " - Brickify Blog" suffix) and the meta description to 110–160. The byline and author markup are already in the template. Use `<h2>` for every section heading, with no `<h3>` before the first `<h2>`.
2. Save the picture (and any MP4) to `blog/images/`, converted to `.webp` and resized to ~1200px wide.
3. Remove the unused video option, or the whole video block if there's no video.
4. Add a `.post-card` to the top of the list in `blog/index.html` (newest first), copying an existing card. Put the post's main picture in `.post-thumb` with the same `alt` text the post gives it (describe a video poster frame if there's no image alt) and its real `width`/`height`; any shape works, it's shown whole on a coloured panel. The newest card becomes the wide featured one automatically, and card colours cycle pink, teal, brick by position, so nothing else needs changing. No picture? Use `<span class="post-thumb post-thumb-art" aria-hidden="true"><span>…</span></span>` with a short word or number.
   Set the card's pillar: `data-pillar="product|parenting|family|story|christmas"` on the `<a class="post-card">` (space-separate for more than one), and the matching label in `<span class="post-pillar">` next to the date:

   | Key | Label | Pillar |
   |---|---|---|
   | `product` | How it works | How it works |
   | `parenting` | Parenting &amp; phones (as written in the HTML) | Parenting & phones |
   | `family` | Family story | Parenting & phones (family stories and case studies) |
   | `story` | Why Brickify | Why Brickify (the founder's story) |
   | `christmas` | Christmas | seasonal |

   The keys match the `utm_campaign` values in the marketing tracker (`brickify-product` etc.), so don't rename them. A pillar's filter button only appears once it has a post.
5. Nothing to do for the sitemap: the "Sitemap and IndexNow" GitHub Action rebuilds `sitemap.xml` from the pages after every push (and after scheduled posts go out), then tells IndexNow which pages changed. To preview locally: `node .github/scripts/build-sitemap.mjs`. Pull after pushing, as the Action may commit an updated sitemap.
6. Check no `{{` is left: `grep -n "{{" blog/<slug>.html`.
7. Preview locally, then commit and push.

## Optional blocks

- **Critical thinking card:** `.post-aside` (in the template).
- **Step slider:** for a numbered series of pictures with copy. Add `<script src="slider.js" defer></script>` in the head and copy the `.step-slider` block from `enforce-screen-time.html`. All the slide text stays in the page, so search engines still read it.
- **Video shapes:** `.frame` (16:9), `.frame portrait` (9:16 phone video), `.frame tall` (3:4).
- **Useful links list:** `ul.useful-links`.

## Scheduling a post

Give a `Date` in the future and Claude puts the post in `blog/_scheduled/` instead of `blog/`. The `_` keeps it unpublished until the day.

Each scheduled post is two files:
- `_scheduled/<YYYY-MM-DD>-<slug>.html`, the finished post
- `_scheduled/<YYYY-MM-DD>-<slug>.json`, which holds `publish` (the date), `file` (`<slug>.html`), `card` (the `.post-card` HTML for `blog/index.html`, or `null` for no card) and `replace` (optional `{file, find, with}` swaps in posts that are already live, e.g. turning a "Next: opens tomorrow" line into a link)

The GitHub Action `.github/workflows/publish-scheduled.yml` runs at 07:00 UTC every day (7am UK in winter, 8am in summer). It moves anything due into `blog/`, adds the card, applies the swaps, rebuilds the sitemap, then commits and pushes. To publish early or re-run a missed day: GitHub → Actions → "Publish scheduled blog posts" → Run workflow. To test locally with a fake date: `node .github/scripts/publish-scheduled.mjs --today 2026-12-13` (then `git checkout .` to undo).

Images go straight into `blog/images/`. They're unlinked until the post goes live.

## Real family case studies

Use `_case-study-template.html` instead of `_template.html`. Only publish with the family's written agreement, after they've read the final copy. First names only, never a child's surname or school.

What to send Claude: who they are, what was happening before, why they chose Brickify, their phone and profiles, what changed, a quote from the parent, what's next, and a photo they're happy to share.

When it goes live, also:
1. In `blog/index.html`, copy the hidden **Real family** card at the top of the Family stories row, fill it in, link it to the post and delete `hidden`. Real families go before the Example families.
2. Give its post-card `data-pillar="family parenting"` and `<span class="post-pillar">Family story</span>`.
3. Add a card to the Family stories section in `how-it-works.html` (`#families`) with `<span class="family-tag real">Real family</span>`.
4. If they've given a quote, consider a Real family card in "The people behind it" on `why-brickify.html` (hidden until filled in).

The six persona posts (`*-pov.html`) are illustrative and always labelled **Example family**.
