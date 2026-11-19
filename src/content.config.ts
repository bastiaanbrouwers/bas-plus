import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const image = z.object({
  src: z.string(),
  alt: z.string().default(''),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    year: z.string(),
    discipline: z.string(),
    // The one-line description under the title
    tagline: z.string(),
    role: z.string().optional(),
    client: z.string().optional(),
    // Card colours on the overview pages
    cardBg: z.string().default('#ffffff'),
    cardFg: z.string().default('#000000'),
    cover: z.string(),
    problem: z.string().optional(),
    solution: z.string().optional(),
    videos: z.array(z.string()).default([]),
    gallery: z.array(image).default([]),
    // Order on the overview, lower comes first
    order: z.number(),
    // Position in the homepage stack. Leave out to keep it off the homepage.
    homeOrder: z.number().optional(),
    // public: main projects page. unlisted: tailored pages only. private: password only.
    visibility: z.enum(['public', 'unlisted', 'private']).default('public'),
    // Optional outside link, like a playable prototype. Cards open it in a new window instead of /work/<slug>/.
    href: z.string().url().optional(),
    // Phase 2 fills these
    tags: z
      .object({
        discipline: z.array(z.string()).default([]),
        capability: z.array(z.string()).default([]),
        context: z.array(z.string()).default([]),
        proofFor: z.array(z.string()).default([]),
      })
      .default({ discipline: [], capability: [], context: [], proofFor: [] }),
  }),
});

// Tailored pages at bas.plus/[company]. Noindex, out of the sitemap, never linked.
const tailored = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tailored' }),
  schema: z.object({
    company: z.string(),
    role: z.string(),
    roleUrl: z.string().url().optional(),
    // The company's brand colour. Replaces the green accent on this page.
    accent: z.string(),
    intro: z.string(),
    // Optional favicon for this page only, like /favicons/ramp.svg. The rest of the site keeps its own.
    favicon: z.string().optional(),
    projects: z
      .array(z.object({ slug: z.string(), why: z.string() }))
      .min(3)
      .max(5),
  }),
});

export const collections = { projects, tailored };
