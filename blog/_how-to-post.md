# Adding a Brickify blog post

Files starting with `_` (this one, `_template.html`) are not published by GitHub Pages.

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
| Pillar | Brickify, Parenting with tech, Personal story or Christmas. Sets the blog-page filter. Claude picks one if missing |

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

1. Copy `_template.html` to `<slug>.html` and fill every `{{PLACEHOLDER}}` (title appears in several places, including the JSON-LD block).
2. Save the picture (and any MP4) to `blog/images/`, converted to `.webp` and resized to ~1200px wide.
3. Remove the unused video option, or the whole video block if there's no video.
4. Add a `.post-card` to the top of the list in `blog/index.html` (newest first), copying an existing card. Put the post's main picture in `.post-thumb` with `alt=""` (the card title already describes it) and its real `width`/`height`; any shape works, it's shown whole on a coloured panel. The newest card becomes the wide featured one automatically, and card colours cycle pink, teal, brick by position, so nothing else needs changing. No picture? Use `<span class="post-thumb post-thumb-art" aria-hidden="true"><span>…</span></span>` with a short word or number.
   Set the card's pillar: `data-pillar="product|parenting|story|christmas"` on the `<a class="post-card">` (space-separate for more than one), and the matching label in `<span class="post-pillar">` next to the date. These keys match the `utm_campaign` values in the marketing tracker (`brickify-product` etc.). A pillar's filter button only appears once it has a post.
5. Add the URL to `/sitemap.xml` next to the other blog entries.
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
- `_scheduled/<YYYY-MM-DD>-<slug>.json`, which holds `publish` (the date), `file` (`<slug>.html`), `sitemap` (the URL), `card` (the `.post-card` HTML for `blog/index.html`, or `null` for no card) and `replace` (optional `{file, find, with}` swaps in posts that are already live, e.g. turning a "Next: opens tomorrow" line into a link)

The GitHub Action `.github/workflows/publish-scheduled.yml` runs at 07:00 UTC every day (7am UK in winter, 8am in summer). It moves anything due into `blog/`, adds the card and sitemap entry, applies the swaps, then commits and pushes. To publish early or re-run a missed day: GitHub → Actions → "Publish scheduled blog posts" → Run workflow. To test locally with a fake date: `node .github/scripts/publish-scheduled.mjs --today 2026-12-13` (then `git checkout .` to undo).

Images go straight into `blog/images/`. They're unlinked until the post goes live.
