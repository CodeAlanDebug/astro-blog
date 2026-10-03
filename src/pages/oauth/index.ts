import type { APIRoute } from "astro";
import { OAUTH_GITHUB_CLIENT_ID } from "astro:env/server";
import { STATE_COOKIE, STATE_COOKIE_OPTIONS } from "./_state";

export const prerender = false;

export const GET: APIRoute = ({ cookies, redirect }) => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const state = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
  cookies.set(STATE_COOKIE, state, STATE_COOKIE_OPTIONS);

  const params = new URLSearchParams({
    client_id: OAUTH_GITHUB_CLIENT_ID,
    scope: "repo,user",
    state,
  });

  return redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`
  );
};
