import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Flight log: technical write-ups. One Markdown file per language,
// src/content/notes/<lang>/<slug>.md; the slug is shared across languages.
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    code: z.string().max(4), // flap code shown on the board, e.g. SBA
    project: z.enum(['signbridge-ai', 'datathon-2026', 'dc-energy', 'masal-bahcesi']).optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { notes };
