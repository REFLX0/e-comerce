/**
 * Canonical form for every email address we store or look up.
 *
 * Emails must be normalized identically on write (register) and on read
 * (login, password reset, admin lookup). They were not: register stored the
 * raw string while login lower-cased it first, so anyone who signed up with an
 * uppercase letter in their address could never log in or reset their password.
 */
export function normalizeEmail(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return value.trim().toLowerCase();
}
