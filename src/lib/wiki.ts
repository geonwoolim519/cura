export function wikiThumb(file: string, width = 960): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;
}

export function wikiFilePage(file: string): string {
  return `https://commons.wikimedia.org/wiki/File:${file.replace(/ /g, "_")}`;
}

export function uid(): string {
  return crypto.randomUUID();
}
