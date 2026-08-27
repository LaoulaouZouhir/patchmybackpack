/**
 * URL and Favicon helpers for Patch My Backpack
 */

export function normalizeUrl(url: string): string {
  let clean = url.trim();
  if (!clean) return '';
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }
  return clean;
}

export function getFaviconFromUrl(url: string): string {
  try {
    const clean = normalizeUrl(url);
    if (!clean) return '';
    const domain = new URL(clean).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch {
    return '';
  }
}
