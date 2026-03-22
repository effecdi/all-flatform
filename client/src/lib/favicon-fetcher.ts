export function getFaviconUrl(serviceUrl: string | null | undefined): string | null {
  if (!serviceUrl) return null;
  try {
    const domain = new URL(serviceUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return null;
  }
}
