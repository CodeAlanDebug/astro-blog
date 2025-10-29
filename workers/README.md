# Cloudflare Contact Form Worker

This directory contains a standalone Cloudflare Worker that processes contact form submissions and sends emails via MailChannels.

## Features

- ✅ Form data validation (name, email, message)
- ✅ Email sending via MailChannels API
- ✅ CORS support for cross-origin requests
- ✅ Honeypot spam protection
- ✅ HTML-formatted emails
- ✅ XSS protection
- ✅ Comprehensive error handling

## Setup Instructions

### 1. Deploy the Worker

Deploy the worker to Cloudflare Workers:

```bash
# Using the worker-specific configuration
wrangler deploy --config wrangler-worker.toml
```

This will deploy your worker and provide you with a URL like:
`https://contact-form-worker.YOUR-SUBDOMAIN.workers.dev`

### 2. Configure DNS Records (for MailChannels)

Add these DNS records to your domain (`alan.one`) to authorize MailChannels to send emails:

**Required SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 a mx include:relay.mailchannels.net ~all
```

**Optional DKIM Record (recommended for better deliverability):**
```
Type: TXT
Name: mc1._domainkey
Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDYaJKUH6a/2M9FGKSl3bGj6Og8fWXcl+gI5MUn7VPz9p7QKQs6H6dJ6U4Q0iIaOF0pGp8g7XbqU9XvL7FaKJGz7G9LH6dS3l8QUhP9Y9dG6Xq9fK6j+gF6fU6G3+YqL7p5KfK1Qp8XqL6G3fKz1j5qK6bGp8g7XbqU9XvL7FaKJGz7QIDAQAB
```

### 3. Configure Custom Route (Optional)

For a cleaner URL, add a route to your Cloudflare zone:

1. Go to Cloudflare Dashboard → Workers & Pages
2. Select your worker
3. Go to Settings → Triggers → Routes
4. Add route: `alan.one/api/contact-worker`

Or update `wrangler-worker.toml`:

```toml
routes = [
  { pattern = "alan.one/api/contact-worker", zone_name = "alan.one" }
]
```

Then redeploy: `wrangler deploy --config wrangler-worker.toml`

### 4. Update Contact Form

Set the environment variable for the contact form:

**Option A: Using .env file**
```bash
# .env
PUBLIC_CONTACT_WORKER_URL=https://contact-form-worker.YOUR-SUBDOMAIN.workers.dev
```

**Option B: Using Cloudflare Pages environment variables**
1. Go to your Cloudflare Pages project
2. Navigate to Settings → Environment variables
3. Add: `PUBLIC_CONTACT_WORKER_URL` = `https://contact-form-worker.YOUR-SUBDOMAIN.workers.dev`

**Option C: Hardcode in astro.config.mjs**
```javascript
export default defineConfig({
  // ... other config
  env: {
    PUBLIC_CONTACT_WORKER_URL: 'https://contact-form-worker.YOUR-SUBDOMAIN.workers.dev'
  }
})
```

### 5. Rebuild and Deploy

```bash
npm run build
npm run deploy
```

## Configuration

### Email Settings

Edit `workers/contact-form.js` to customize:

```javascript
const CONFIG = {
  RECIPIENT_EMAIL: 'astro@alan.one',  // Where to send form submissions
  RECIPIENT_NAME: 'Alan Zheng',
  SENDER_EMAIL: 'noreply@alan.one',   // From address
  SENDER_NAME: 'Portfolio Contact Form',
  // ... other settings
};
```

### CORS Origins

Update allowed origins in `CONFIG.ALLOWED_ORIGINS`:

```javascript
ALLOWED_ORIGINS: [
  'https://alan.one',
  'https://www.alan.one',
  'http://localhost:4321',
  'http://localhost:8788',
],
```

### Using Environment Variables (Advanced)

For more flexibility, you can use Wrangler secrets:

```bash
# Set secrets
wrangler secret put RECIPIENT_EMAIL --config wrangler-worker.toml
wrangler secret put SENDER_EMAIL --config wrangler-worker.toml
```

Then update the worker to use `env.RECIPIENT_EMAIL` instead of hardcoded values.

## Testing

### Local Testing

```bash
# Start local development server
wrangler dev workers/contact-form.js

# Or with the config file
wrangler dev --config wrangler-worker.toml
```

This will start a local server at `http://localhost:8787`

### Test with curl

```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Subject",
    "message": "This is a test message"
  }'
```

### Test from Contact Form

1. Set `PUBLIC_CONTACT_WORKER_URL=http://localhost:8787` in your .env
2. Run `npm run dev` for the Astro site
3. Navigate to the contact page
4. Submit the form

## API Reference

### Endpoint

**POST** `/` (or your configured route)

### Request

**Content-Type:** `application/json` or `multipart/form-data`

**Body (JSON):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Collaboration Opportunity",
  "message": "I'd like to discuss..."
}
```

**Body (FormData):**
```
name: John Doe
email: john@example.com
subject: Collaboration Opportunity
message: I'd like to discuss...
website: (leave empty - honeypot field)
```

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
  "errors": [
    "Name must be at least 2 characters",
    "Please enter a valid email address"
  ]
}
```

**Server Error (500):**
```json
{
  "success": false,
  "message": "Sorry, there was an error sending your message. Please try again later.",
  "error": "Error details..."
}
```

## Troubleshooting

### Emails Not Sending

1. **Check DNS records**: Use `dig TXT alan.one` to verify SPF record
2. **Check MailChannels status**: Visit [MailChannels Status](https://status.mailchannels.com/)
3. **Check worker logs**: `wrangler tail --config wrangler-worker.toml`
4. **Verify CORS**: Check browser console for CORS errors

### CORS Errors

- Ensure your domain is in `ALLOWED_ORIGINS` array
- Check that the worker is deployed and accessible
- Verify the origin header is being sent correctly

### Worker Not Deploying

```bash
# Check for syntax errors
wrangler deploy --config wrangler-worker.toml --dry-run

# View logs
wrangler tail --config wrangler-worker.toml
```

## Security

- ✅ Input validation on all fields
- ✅ Email regex validation
- ✅ Honeypot spam protection
- ✅ XSS protection via HTML escaping
- ✅ CORS restrictions
- ✅ Content-Type validation

### Recommended Additions

Consider adding:
- Rate limiting (using Cloudflare KV or Durable Objects)
- IP-based throttling
- reCAPTCHA integration
- Content filtering for spam keywords

## Cost

- **Cloudflare Workers**: Free tier includes 100,000 requests/day
- **MailChannels**: Free for Cloudflare Workers
- **Total**: $0/month for typical contact form usage

## Alternative to Standalone Worker

If you prefer to keep the API endpoint within your Astro app (using the existing `/api/contact`), you can:

1. Use the existing `src/pages/api/contact.ts`
2. Remove the `PUBLIC_CONTACT_WORKER_URL` configuration
3. The form will use `/api/contact` by default

The standalone worker approach is recommended when:
- You want to decouple the contact form from the main site
- You need the worker to handle traffic from multiple sites
- You want independent scaling and deployment

## Support

For issues or questions:
- Check [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
- Check [MailChannels documentation](https://mailchannels.zendesk.com/hc/en-us)
- Review worker logs: `wrangler tail --config wrangler-worker.toml`
