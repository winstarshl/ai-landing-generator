/**
 * Build a Google Fonts stylesheet URL from a font-family name returned by the model.
 * If the family doesn't exist on Google Fonts the request 404s harmlessly and the
 * theme falls back to the system stack.
 */
export function googleFontHref(font: string): string {
  const family = font.trim().replace(/\s+/g, "+");
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%2B/g, "+")}:wght@400;500;600;700;800&display=swap`;
}
