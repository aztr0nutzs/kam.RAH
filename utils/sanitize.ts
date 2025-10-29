/**
 * A very simple sanitizer to prevent basic HTML injection.
 * This is NOT a substitute for a proper XSS library (like DOMPurify)
 * if you plan to render content as HTML.
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string' || !input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};