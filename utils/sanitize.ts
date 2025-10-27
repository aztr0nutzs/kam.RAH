// A simple sanitizer to prevent basic XSS by stripping HTML tags.
// In a real production application, a more robust library like DOMPurify would be preferable.
export function sanitizeInput(input: string): string {
  const temp = document.createElement('div');
  temp.textContent = input;
  return temp.innerHTML;
}

// Validates that a string is a well-formed HTTP or HTTPS URL.
export function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (_) {
    return false;
  }
}
