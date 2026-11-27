export const SUPPORT_EMAIL = "support@paperstreetapp.com";

const EMAIL = /[^\s@"]+@[^\s@"]+\.[a-z]{2,}/gi;

export function findDisallowedEmails(text: string): string[] {
  let found = text.match(EMAIL) ?? [];
  return found.filter((address) => address.toLowerCase() !== SUPPORT_EMAIL);
}
