import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

export async function allProjects(): Promise<Project[]> {
  const items = await getCollection('projects');
  return items.sort((a, b) => a.data.order - b.data.order);
}

export async function publicProjects(): Promise<Project[]> {
  return (await allProjects()).filter((p) => p.data.visibility === 'public');
}

/** The cards on the homepage, in homeOrder. */
export async function homeProjects(): Promise<Project[]> {
  return (await publicProjects())
    .filter((p) => p.data.homeOrder !== undefined)
    .sort((a, b) => (a.data.homeOrder ?? 0) - (b.data.homeOrder ?? 0));
}

/** Turns a YouTube link into a privacy-friendly embed URL. */
export function youtubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{6,})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0` : null;
}

export const pad = (n: number) => String(n).padStart(2, '0');
