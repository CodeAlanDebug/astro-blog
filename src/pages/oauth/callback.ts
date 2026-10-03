import type { APIRoute } from "astro";
import {
  OAUTH_GITHUB_CLIENT_ID,
  OAUTH_GITHUB_CLIENT_SECRET,
} from "astro:env/server";
import { STATE_COOKIE, STATE_COOKIE_OPTIONS } from "./_state";

export const prerender = false;

// Only these GitHub accounts may sign in to the CMS. Everyone else gets a
// 403 before any token reaches the browser. (Write access is additionally
// limited by GitHub repo permissions regardless of this list.)
const ALLOWED_GITHUB_LOGINS = ["CodeAlanDebug"];

export const GET: APIRoute = async ({ url, cookies }) => {
  // The state cookie is single-use: read it, then clear it whatever happens.
  const expectedState = cookies.get(STATE_COOKIE)?.value;
  cookies.delete(STATE_COOKIE, STATE_COOKIE_OPTIONS);

  // Reject callbacks that don't belong to a sign-in this browser started at
  // /oauth, before the code is sent to GitHub.
  if (!expectedState || url.searchParams.get("state") !== expectedState) {
    return new Response(
      "Sign-in request expired or invalid. Please try again.",
      {
        status: 400,
      }
    );
  }

  const data = {
    code: url.searchParams.get("code"),
    client_id: OAUTH_GITHUB_CLIENT_ID,
    client_secret: OAUTH_GITHUB_CLIENT_SECRET,
  };

  try {
    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub OAuth error! status: ${response.status}`);
    }

    const body = (await response.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (body.error || !body.access_token) {
      throw new Error(
        `GitHub OAuth error: ${body.error_description || body.error || "no access token"}`
      );
    }

    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${body.access_token}`,
        "User-Agent": "alan-one-cms-oauth",
      },
    });

    if (!userResponse.ok) {
      throw new Error(
        `GitHub user lookup failed! status: ${userResponse.status}`
      );
    }

    const user = (await userResponse.json()) as { login?: string };

    if (!user.login || !ALLOWED_GITHUB_LOGINS.includes(user.login)) {
      return new Response(
        "Access denied: this CMS is restricted to the site owner.",
        {
          status: 403,
        }
      );
    }

    const content = {
      token: body.access_token,
      provider: "github",
    };

    // Handshake with the CMS, which opens this popup from /admin on this same
    // origin. Only that window may receive the token: any page can open
    // /oauth in a popup, so a cross-origin opener must get nothing back.
    const script = `
      <script>
        const receiveMessage = (message) => {
          if (
            message.source !== window.opener ||
            message.origin !== window.location.origin ||
            message.data !== "authorizing:${content.provider}"
          ) {
            return;
          }

          window.opener?.postMessage(
            'authorization:${content.provider}:success:${JSON.stringify(content)}',
            window.location.origin
          );

          window.removeEventListener("message", receiveMessage, false);
        }
        window.addEventListener("message", receiveMessage, false);

        window.opener?.postMessage("authorizing:${content.provider}", window.location.origin);
      </script>
    `;

    return new Response(script, {
      headers: { "Content-Type": "text/html", "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error(err);
    return new Response("Authentication failed.", { status: 500 });
  }
};
