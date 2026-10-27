/**
 * HTML escaping for strings that end up in HTML (the e-mail templates): text and quoted attribute values. The slash
 * needs no escaping there; `&#39;` is the shortest form of the apostrophe (mail size, Gmail clips at about 102 KB).
 */

export function escapeHTML(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return input.replace(/[&<>"']/g, (char) => map[char] || char);
}
