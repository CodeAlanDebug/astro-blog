# Contact Form Integration Guide

This guide explains how to integrate the contact form with a Cloudflare Worker for email processing.

## Overview

The contact form can work in two ways:

1. **Option A: Standalone Cloudflare Worker** (Recommended for production)
   - Separate Worker deployment that can be used across multiple sites
   - Independent scaling and deployment
   - Cleaner separation of concerns

2. **Option B: Astro API Endpoint** (Default)
   - Built into the Astro application at `/api/contact`
   - Deployed with the main site
   - Simpler setup for single-site deployments

Both options use **MailChannels** (free for Cloudflare Workers) to send emails.

## Quick Start

### Prerequisites

- Cloudflare account (free tier works)
- Domain with DNS access (for MailChannels SPF records)
- Node.js and npm installed
- Wrangler CLI installed (`npm install -g wrangler` or use local `npx wrangler`)

### Step 1: DNS Configuration (Required for Both Options)

MailChannels requires SPF records on your domain to send emails. Add these DNS records to your domain:

**Required SPF Record:**
```
Type: TXT
Name: @ (or your root domain)
Value: v=spf1 a mx include:relay.mailchannels.net ~all
```

**Optional DKIM Record (improves deliverability):**
```
Type: TXT
Name: mc1._domainkey
Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDYaJKUH6a/2M9FGKSl3bGj6Og8fWXcl+gI5MUn7VPz9p7QKQs6H6dJ6U4Q0iIaOF0pGp8g7XbqU9XvL7FaKJGz7G9LH6dS3l8QUhP9Y9dG6Xq9fK6j+gF6fU6G3+YqL7p5KfK1Qp8XqL6G3fKz1j5qK6bGp8g7XbqU9XvL7FaKJGz7QIDAQAB
```

Wait 5-30 minutes for DNS propagation.

---

## Option A: Standalone Cloudflare Worker (Recommended)

### 1. Deploy the Worker

```bash
# Deploy the contact form worker
wrangler deploy --config wrangler-worker.toml
```

You'll receive a URL like: `https://contact-form-worker.YOUR-SUBDOMAIN.workers.dev`

### 2. Configure the Contact Form

**Create `.env` file:**
```bash
# .env
PUBLIC_CONTACT_WORKER_URL=https://contact-form-worker.YOUR-SUBDOMAIN.workers.dev
```

**Or use Cloudflare Pages environment variables:**
1. Go to Cloudflare Pages → Your project → Settings → Environment variables
2. Add: `PUBLIC_CONTACT_WORKER_URL` with your worker URL
3. Rebuild the site

### 3. Configure Email Addresses

Edit `workers/contact-form.js` and update the email addresses:

```javascript
const CONFIG = {
  RECIPIENT_EMAIL: 'your-email@alan.one',  // Where to receive submissions
  RECIPIENT_NAME: 'Your Name',
  SENDER_EMAIL: 'noreply@alan.one',        // From address (must use your domain)
  SENDER_NAME: 'Portfolio Contact Form',
  // ...
};
```

### 4. Redeploy After Changes

```bash
wrangler deploy --config wrangler-worker.toml
```

### 5. Test the Form

1. Build and deploy your Astro site: `npm run build && npm run deploy`
2. Visit your site's contact page
3. Submit a test message
4. Check the recipient email

### Optional: Custom Route

For a cleaner URL (`https://alan.one/api/contact-worker`), add a route:

**Edit `wrangler-worker.toml`:**
```toml
routes = [
  { pattern = "alan.one/api/contact-worker", zone_name = "alan.one" }
]
```

Then update `.env`:
```bash
PUBLIC_CONTACT_WORKER_URL=https://alan.one/api/contact-worker
```

Redeploy: `wrangler deploy --config wrangler-worker.toml`

---

## Option B: Astro API Endpoint (Default)

This option uses the built-in API endpoint at `/api/contact` that's deployed with your Astro site.

### 1. Configure Email Addresses

Edit `src/pages/api/contact.ts` and update:

```typescript
// Line 49: Your receiving email
to: [{ email: 'your-email@alan.one', name: 'Your Name' }],

// Line 54: Your sending email
email: 'noreply@alan.one',
```

### 2. No Additional Configuration Needed

The form will automatically use `/api/contact` when `PUBLIC_CONTACT_WORKER_URL` is not set.

### 3. Deploy

```bash
npm run build
npm run deploy
```

---

## Testing Locally

### Test the Standalone Worker Locally

```bash
# Start worker in development mode
wrangler dev workers/contact-form.js

# Or with config
wrangler dev --config wrangler-worker.toml
```

This starts a local server at `http://localhost:8787`

**Test with curl:**
```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test",
    "message": "This is a test message"
  }'
```

### Test with the Astro Site

1. Set environment variable:
   ```bash
   # .env
   PUBLIC_CONTACT_WORKER_URL=http://localhost:8787
   ```

2. Start Astro dev server:
   ```bash
   npm run dev
   ```

3. Navigate to `http://localhost:4321/contact`
4. Submit the form

---

## API Reference

### Request

**Method:** `POST`

**Content-Type:** `application/json` or `multipart/form-data`

**Required Fields:**
- `name` (string, 2-100 characters)
- `email` (string, valid email, max 254 characters)
- `message` (string, 10-5000 characters)

**Optional Fields:**
- `subject` (string, max 200 characters)
- `website` (string, should be empty - honeypot field)

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Thank you for your message! I'll get back to you soon."
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Name must be at least 2 characters"]
}
```

**Server Error (500):**
```json
{
  "success": false,
  "message": "Sorry, there was an error sending your message.",
  "error": "Error details"
}
```

---

## Customization

### Email Template

Edit the HTML template in `workers/contact-form.js` (or `src/pages/api/contact.ts`):

```javascript
value: `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      /* Your custom styles */
    </style>
  </head>
  <body>
    <!-- Your custom email template -->
  </body>
  </html>
`
```

### Validation Rules

Update the `CONFIG` object in `workers/contact-form.js`:

```javascript
const CONFIG = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_MESSAGE_LENGTH: 10,
  MAX_MESSAGE_LENGTH: 5000,
  // ...
};
```

### CORS Origins

Add allowed origins in `workers/contact-form.js`:

```javascript
ALLOWED_ORIGINS: [
  'https://alan.one',
  'https://www.alan.one',
  'https://preview.alan.one',
  'http://localhost:4321',
],
```

---

## Troubleshooting

### Emails Not Sending

1. **Verify DNS records:**
   ```bash
   dig TXT alan.one
   ```
   Should show SPF record with `include:relay.mailchannels.net`

2. **Check worker logs:**
   ```bash
   wrangler tail --config wrangler-worker.toml
   ```

3. **Test MailChannels directly:**
   ```bash
   curl -X POST https://api.mailchannels.net/tx/v1/send \
     -H "Content-Type: application/json" \
     -d '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"noreply@alan.one"},"subject":"Test","content":[{"type":"text/plain","value":"Test"}]}'
   ```

### CORS Errors

- Ensure your domain is in `ALLOWED_ORIGINS`
- Check browser console for specific CORS error messages
- Verify the worker is responding with CORS headers

### Form Not Submitting

1. Check browser console for errors
2. Verify `PUBLIC_CONTACT_WORKER_URL` is set correctly
3. Test the endpoint directly with curl
4. Check network tab in browser dev tools

### Worker Not Deploying

```bash
# Dry run to check for errors
wrangler deploy --config wrangler-worker.toml --dry-run

# Check syntax
node workers/contact-form.js
```

---

## Security Features

✅ Input validation (length, format, required fields)  
✅ Email regex validation  
✅ Honeypot spam protection  
✅ XSS protection via HTML escaping  
✅ CORS restrictions  
✅ Content-Type validation  

### Recommended Enhancements

- **Rate Limiting:** Use Cloudflare KV to track submissions per IP
- **reCAPTCHA:** Add Google reCAPTCHA v3 for additional spam protection
- **Content Filtering:** Filter out spam keywords
- **Email Verification:** Send confirmation emails to form submitters

---

## Cost Breakdown

| Service | Free Tier | Typical Usage | Cost |
|---------|-----------|---------------|------|
| Cloudflare Workers | 100,000 requests/day | ~100 form submissions/month | $0 |
| MailChannels | Unlimited (via Cloudflare Workers) | ~100 emails/month | $0 |
| Cloudflare Pages | Unlimited | 1 site | $0 |
| **Total** | | | **$0/month** |

---

## Migration Guide

### From Option B (API Endpoint) to Option A (Standalone Worker)

1. Deploy the worker: `wrangler deploy --config wrangler-worker.toml`
2. Set `PUBLIC_CONTACT_WORKER_URL` in your environment
3. Rebuild and redeploy your Astro site
4. Test thoroughly
5. (Optional) Remove `src/pages/api/contact.ts` if no longer needed

### From Option A (Standalone Worker) to Option B (API Endpoint)

1. Remove `PUBLIC_CONTACT_WORKER_URL` from environment variables
2. Ensure `src/pages/api/contact.ts` has correct email addresses
3. Rebuild and redeploy your Astro site
4. (Optional) Delete the worker from Cloudflare dashboard

---

## Advanced Configuration

### Using Environment Variables in Worker

For better security, use Wrangler secrets:

```bash
# Set secrets
wrangler secret put RECIPIENT_EMAIL --config wrangler-worker.toml
wrangler secret put SENDER_EMAIL --config wrangler-worker.toml
```

Update worker code to use `env`:

```javascript
async fetch(request, env, ctx) {
  const recipientEmail = env.RECIPIENT_EMAIL || CONFIG.RECIPIENT_EMAIL;
  // ...
}
```

### Multiple Environments

Create separate configurations:

```toml
# wrangler-worker-staging.toml
name = "contact-form-worker-staging"
# ...

# wrangler-worker-production.toml
name = "contact-form-worker-production"
# ...
```

Deploy to specific environment:

```bash
wrangler deploy --config wrangler-worker-staging.toml
wrangler deploy --config wrangler-worker-production.toml
```

---

## Support & Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [MailChannels Documentation](https://mailchannels.zendesk.com/hc/en-us)
- [Astro Documentation](https://docs.astro.build/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)

## Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review worker logs: `wrangler tail --config wrangler-worker.toml`
3. Test the endpoint directly with curl
4. Check browser console for client-side errors
5. Verify DNS records are properly configured

---

**Recommendation:** For production use, Option A (Standalone Worker) is recommended as it provides better separation of concerns, independent scaling, and can be reused across multiple sites if needed.
