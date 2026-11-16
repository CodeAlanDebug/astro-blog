import type { AstroCookieSetOptions } from "astro";

// CSRF `state` for the CMS sign-in (RFC 6749 §10.12). /oauth stores a random
// value in this cookie and sends it to GitHub; /oauth/callback only continues
// when GitHub sends the same value back. The leading underscore keeps this
// file out of Astro's routing.
export const STATE_COOKIE = "oauth_state";

export const STATE_COOKIE_OPTIONS: AstroCookieSetOptions = {
  httpOnly: true,
  secure: true,
  // Lax, not Strict: the cookie has to ride along on GitHub's cross-site
  // top-level redirect back to /oauth/callback.
  sameSite: "lax",
  path: "/oauth",
  maxAge: 10 * 60,
};
