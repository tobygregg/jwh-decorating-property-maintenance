# JWH Decorating & Property Maintenance — website

Single-page static site: plain HTML + Tailwind CSS v3 (compiled and committed) + a small vanilla JS file. No frameworks, no runtime CDNs.

## Folder layout

```
index.html              ← the whole site, sections separated by big comment banners
thanks.html             ← shown after the quote form is sent (FormSubmit _next)
404.html                ← GitHub Pages "not found" page (has a <base> tag — see checklist)
assets/css/styles.css   ← compiled Tailwind (don't edit — run npm run build)
assets/js/main.js       ← menu, reveals, hero roller, services explorer, lightbox, form
assets/fonts/           ← Fraunces + Plus Jakarta Sans (woff2, self-hosted) + OFL licences
images/brand/           ← logo.webp (cut out from the Facebook logo) + mark.svg (roller mark)
images/work/            ← job photos, each as name.webp (~1600px) + name-sm.webp (~800px)
images/                 ← favicons, og-image.jpg (1200×630 share card), site.webmanifest
src/input.css           ← Tailwind source, @font-face, hero roller + reveal CSS, keyframes
tailwind.config.js      ← brand colours (with where each came from), fonts, animations
sitemap.xml, robots.txt
_fb-pack/               ← source material from Facebook (not published — underscore folder)
```

## Brand

| Name | Hex | Used for |
|---|---|---|
| `jwhblue` | `#0A4FC2` | Start of the logo gradient — buttons, icons, links, focus rings |
| `teal` | `#01866F` | Middle of the logo gradient — small labels, gradient mid-point |
| `jwhgreen` | `#00A940` | End of the logo gradient — ticks, paint drips, accents |
| `jwhgreen-dark` | `#00813A` | Button gradient end (white text passes contrast) |
| `ink` | `#12231F` | Text, line-art strokes, footer and dark cards (from the badge outline) |
| `muted` | `#53635F` | Body copy on light backgrounds |
| `primer` | `#F6F5F0` | Off-white "undercoat" background for alternate sections |

- **Fonts:** Fraunces (display: headings, with the italic used once in the hero) and Plus Jakarta Sans (body). Both self-hosted from @fontsource under the SIL OFL.
- **Logo:** the Facebook logo is 1426px and sharp, so it was **not redrawn**. It was cut out of its white background (`images/brand/logo.webp`). `images/brand/mark.svg` is a simple roller mark on the badge gradient, used for the favicon because the full badge is unreadable at 16–32px. The larger app icons use the real badge.
- **Graphics:** all line-art (roller, tin, colour fan, brush, spray gun) is inline SVG in `index.html`: flat, 2–3px ink strokes, brand colours. The service icons are one `<symbol>` sprite at the top of `index.html`.

## Hero roller (Toby's design note)

A paint roller works across a bare wall in four strokes (down, up, down, up), and each stroke reveals a real JWH job underneath. It then holds for a few seconds with a caption and paints the next job over the top. The order is Jack's Bar → shopfront → wallpaper, then it repeats.

- To change the photos, edit the `.paint-layer` blocks inside `#paint-stage` in `index.html`. Each block has one `<img>` and a `data-caption`. The JS splits each photo into strips.
- To change the number of strokes, edit `data-strips="4"` on `#paint-stage`.
- The animation pauses when the hero is off-screen or the tab is hidden. With reduced motion turned on, the first photo shows straight away and the roller stays still.

## Editing

- **Text:** everything is in `index.html`. Search for the words you want to change.
- **Colours:** edit `tailwind.config.js`, then run `npm install` (first time only) and `npm run build`. A few hard-coded hex values also sit in the inline SVGs and in `src/input.css` (hero wall texture).
- **Adding a work photo:** save it as `images/work/name.webp` (about 1600px on the long edge) plus `name-sm.webp` (about 800px). Then copy one of the `<button data-lightbox …>` tiles in the *RECENT WORK* section, and set `data-full`, `data-caption`, the `<img>` src, width/height and alt. The lightbox picks it up automatically.
- **Services explorer:** each service is a `<button role="tab">` (in the tab list) plus an `<article role="tabpanel">` with the matching id (`tab-x` ↔ `panel-x`). To add one, copy a pair and change the ids, photo, text and the `data-pick` value. Also add the service to the form's `<select>`.
- **Before/after slider:** not included. The pack has no matching before/after pairs. If John can supply some, they would suit an extra section under Recent work.

## Before going live — checklist

- [ ] Swap `https://tobygregg.github.io/jwh-decorating-property-maintenance/` for the real domain in: canonical, `og:url`, `og:image`, `twitter:image`, JSON-LD (`url`, `logo`, `image`), `sitemap.xml`, `robots.txt` and the form's `_next`.
- [ ] Change `<base href="/jwh-decorating-property-maintenance/">` in `404.html` to `<base href="/">` on the new domain.
- [ ] **When the client goes ahead, switch the form from Toby's email to the client's** (`action="https://formsubmit.co/…"` in `index.html`, probably jwhutch87@gmail.com), remove "(website draft)" from `_subject`, and send one test enquiry to activate FormSubmit.
- [ ] Confirm the phone (07911 747461), email (jwhutch87@gmail.com) and WhatsApp with John.
- [ ] Confirm John is happy to show **3 Ashanti cottages, GY1 1ND** in the footer and JSON-LD. It is listed on his Facebook page, but it may be a home address.
- [ ] Get John to sign off the services wording and the "what's included" lists. These are built from his posts and normal decorating scope. In particular, check that he does exterior work, wallpapering and spraying for customers, and what "property maintenance" covers for him.
- [ ] Check the shopfront photo (the Facebook cover, Christies) is JWH's own work. It is used in the hero, the exterior service and the gallery.
- [ ] The Moores Hotel / Jack's Bar photos came from the Sarnia Hotels Group post and look professionally shot (Sarah Froome Photography is credited in that post). Check they are OK to use on JWH's site.
- [ ] Ask John for more photos (exteriors, homes, spraying, before/afters). The spray-finishing service has an illustration instead of a photo for now.

**Assumptions made:** "team of experienced decorators" (the posts mention a team of six, but it's left unnumbered as it changes); "working from 7:30, Monday to Friday" comes from the hiring posts; "haven't missed a deadline to date" is John's own words.

**Left out on purpose:** the hiring posts and Guernsey Press job ad (Posts 1, 4, 5, 9), the "Location, location, location" post caption, review/follower numbers, and the Belvedere House thank-you email (name redacted; with only one written review, a testimonials section wasn't justified). No FAQ, because the pack doesn't answer enough real customer questions.

## Source

Built from the Facebook pack in `_fb-pack/` (BRIEF.md, data.json, images). The folder starts with an underscore so GitHub Pages does not publish it on the live site.
