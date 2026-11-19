# bas.plus

Portfolio of Bas Brouwers, strategic creative director. Rebuilt from the Framer project "portfolio" so Claude can maintain it and make tailored versions for specific jobs and clients.

bas.plus is the primary domain for portfolio, projects and freelance work.

## Stack

- Astro, static output. Projects are a content collection in `src/content/projects/*.md`.
- Hosted on Cloudflare Workers with static assets (`wrangler.jsonc` serves `./dist`, custom 404).
- Cloudflare builds on every push to `main`. Build command `npx astro build`, deploy command `npx wrangler deploy`.
- No CMS, no database.

## Content model

One markdown file per project. This is the single source of truth.

- Frontmatter: title, year, discipline, tagline, role, client, cardBg, cardFg, cover, problem, solution, videos, gallery (src + alt), order, homeOrder, visibility, tags, href.
- `href`: optional outside link, like a playable prototype. Cards open it in a new window instead of `/work/<slug>/`, and the project page shows a "play it" button.
- Body: the story, in markdown.
- `visibility`: `public` shows on /projects. `unlisted` only appears on tailored pages. `private` is for NDA work, password only.
- `homeOrder`: set it to put a project in the homepage stack.
- URLs stay at `/work/[slug]/`, matching the old Framer site.

## Tailored pages

- One file per company in `src/content/tailored/<company>.md`. The file name is the URL: `ramp.md` becomes `bas.plus/ramp`.
- Frontmatter: company, role, roleUrl, accent (their brand colour, replaces the green on that page), favicon (optional, an .svg in `public/favicons/` with `-32.png` and `-180.png` beside it, used on that page and the projects it opens, never on the rest of the site), intro (one paragraph), projects (3 to 5, each a slug plus a one-line why).
- Built by `src/pages/[company].astro`. Noindex, never linked. No menu and no footer links. Project cards open `/work/<slug>/?via=<company>`, which hides the menu there too, shows a back link and keeps the company colour. Contact buttons become an email link. The build fails on a reserved slug, an unknown project or a private project.
- Live: ramp (Principal Brand Designer). Leads with receipt-rush, a game that opens in a new window.
- receipt-rush/cover.jpg: the Figma frame holds a 480px preview copy. `scripts/figma-sync-state.json` pins its hash so the sync keeps the full-size file in the repo. Pasting a new image into that frame replaces it as usual.

## Design system (from Framer)

- Black background, white text, white at 50% for body copy, green `#00ff77` accent.
- Manrope (headings and body), DM Mono 300 (labels).
- Type: H1 96, H2 64, H3 32, body 20, small 14. Scales down at 1440, 1024 and 810.
- 8-column grid inside 120px side padding at desktop. Background lines mark the 9 column edges.
- Section labels start with a dot, like `.about`, followed by a rule.
- Square outline buttons with a ↗ arrow. Small circle markers on the right content edge.

## Images

Figma is where images are managed. The repo holds the published copies.

- Figma file "Portfolio" (key `Q98U6mNyvhUMQIfi2vRMdx`), page "site images". One section per project.
- Every image is a frame named by its slot, like `brand-refresh/gallery-03.png`. The slot is the address: the file lives at `public/images/<slot>` and content refers to `/images/<slot>`.
- `scripts/image-slots.json` lists every slot the site uses. Regenerate it with `npm run images:slots` after adding or removing images in content.
- `.github/workflows/figma-sync.yml` runs hourly and on demand. It runs `scripts/sync-figma.mjs`: reads each frame's original image fill, checks it, writes changed files to `public/images`, commits and pushes. It needs the `FIGMA_TOKEN` repository secret. It fails without publishing when a slot is missing, a frame has no image, names clash or a GIF slot gets a still image.
- To add an image: add the slot path to the project's content, run `npm run images:slots`, then duplicate a frame in Figma and give it the new slot name.
- `scripts/optimise-images.mjs` runs before every build and writes WebP variants (800, 1600, 2400 px, GIFs as animated WebP) to `public/images/_w`. Templates use `img()` from `src/lib/img.ts`. Markdown images go through `src/lib/rehype-images.mjs`. Both are generated, not committed.
- `scripts/framer-to-figma.mjs` and its workflow were the one-off import from Framer. They run again only if `.github/image-jobs.json` is committed.

## Working phases

1. Rebuild as is. (done, pending review)
2. Project inventory and gaps: add unlisted projects, tag every project on four axes (discipline, capability, context, proof for). Propose the tag list first and wait for approval.
3. Main overview: /projects filterable by discipline.
4. Tailored pages at `bas.plus/[company]`: short intro, 3 to 4 projects, CV, contact. Noindex, out of the sitemap, never linked. Reserved slugs: projects, work, about, contact, 404. Then a reusable command: read the role, score projects, propose 3 to 4 with reasons, draft the intro, wait for approval, build and push.

Stop after each phase and wait for Bas's go.

## Writing rules for all new copy

- Short sentences. Use white space. Confident and direct, data-backed where relevant.
- British spelling. Lowercase headings, no title case.
- No em dashes, semicolons, emojis or asterisks. No hook openers.
- Never use: Additionally, Consequently, Hence, However, Moreover, Thus, Adept, Commendable, Dynamic, Exemplary, Innovative, Invaluable, Robust, Vibrant, Aligns, Augment, Facilitate, Maximize, Utilize.
- Never use the phrases "A testament to", "In conclusion" or "It's worth noting".
- Existing project copy came over verbatim from Framer. Don't rewrite it without asking.
