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

- Frontmatter: title, year, discipline, tagline, role, client, cardBg, cardFg, cover, problem, solution, videos, gallery (src + alt), order, homeOrder, visibility, tags.
- Body: the story, in markdown.
- `visibility`: `public` shows on /projects. `unlisted` only appears on tailored pages. `private` is for NDA work, password only.
- `homeOrder`: set it to put a project in the homepage stack.
- URLs stay at `/work/[slug]/`, matching the old Framer site.

## Design system (from Framer)

- Black background, white text, white at 50% for body copy, green `#00ff77` accent.
- Manrope (headings and body), DM Mono 300 (labels).
- Type: H1 96, H2 64, H3 32, body 20, small 14. Scales down at 1440, 1024 and 810.
- 8-column grid inside 120px side padding at desktop. Background lines mark the 9 column edges.
- Section labels start with a dot, like `.about`, followed by a rule.
- Square outline buttons with a ↗ arrow. Small circle markers on the right content edge.

## Images

Images still load from framerusercontent.com. Before cancelling Framer, move them into `public/images/` or Cloudflare R2 and update the paths.

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
