/** Génère un slug URL depuis un titre */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'evenement';
}

export function uniqueSlug(base: string, existing: string[]): string {
  let slug = slugify(base);
  let n = 1;
  while (existing.includes(slug)) {
    slug = `${slugify(base)}-${n++}`;
  }
  return slug;
}
