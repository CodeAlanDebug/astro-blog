import type { APIRoute } from "astro";
import { OAUTH_GITHUB_CLIENT_ID, OAUTH_GITHUB_CLIENT_SECRET } from "astro:env/server";

export const prerender = false;

// Only these GitHub accounts may sign in to the CMS. Everyone else gets a
// 403 before any token reaches the browser. (Write access is additionally
// limited by GitHub repo permissions regardless of this list.)
const ALLOWED_GITHUB_LOGINS = ["CodeAlanDebug"];

export const GET: APIRoute = async ({ url }) => {
  const data = {
    code: url.searchParams.get("code"),
    client_id: OAUTH_GITHUB_CLIENT_ID,
    client_secret: OAUTH_GITHUB_CLIENT_SECRET,
  };

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`GitHub OAuth error! status: ${response.status}`);
    }

    const body = await response.json();

    if (body.error || !body.access_token) {
      throw new Error(`GitHub OAuth error: ${body.error_description || body.error || "no access token"}`);
    }

    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${body.access_token}`,
        "User-Agent": "alan-one-cms-oauth",
      },
    });

    if (!userResponse.ok) {
      throw new Error(`GitHub user lookup failed! status: ${userResponse.status}`);
    }

    const user = await userResponse.json();

    if (!ALLOWED_GITHUB_LOGINS.includes(user.login)) {
      return new Response("Access denied: this CMS is restricted to the site owner.", {
        status: 403,
      });
    }

    const content = {
      token: body.access_token,
      provider: "github",
    };

    const script = `
      <script>
        const receiveMessage = (message) => {
          window.opener.postMessage(
            'authorization:${content.provider}:success:${JSON.stringify(content)}',
            message.origin
          );

          window.removeEventListener("message", receiveMessage, false);
        }
        window.addEventListener("message", receiveMessage, false);

        window.opener.postMessage("authorizing:${content.provider}", "*");
      </script>
    `;

    return new Response(script, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err) {
    console.error(err);
    return new Response("Authentication failed.", { status: 500 });
  }
};
