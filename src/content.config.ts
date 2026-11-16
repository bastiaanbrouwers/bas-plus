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

export const collections = { projects };
