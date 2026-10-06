/**
 * Input & Parameter Sanitization Utilities
 */

export function escapeHTML(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return input.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

export function sanitizeInput(input: unknown, maxLength: number = 5000): string {
  if (typeof input !== 'string') return '';
  return escapeHTML(input.trim().slice(0, maxLength));
}

export function stripHTML(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

export function sanitizeSearchParam(
  param: string | null | undefined,
  maxLength: number = 200
): string {
  if (!param) return '';
  return escapeHTML(param.trim().slice(0, maxLength));
}

export function sanitizeEmail(email: string): string {
  const trimmed = email.trim().toLowerCase().slice(0, 254);
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(trimmed) ? trimmed : '';
}
