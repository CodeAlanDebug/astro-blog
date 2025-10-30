# Contact Form Setup

This contact form is configured to work with Cloudflare Workers and uses Cloudflare's Email Worker for sending emails.

## Setup Instructions

### 1. Update Email Configuration

The contact form uses environment variables for email configuration. Update your `wrangler.json` file to set your email addresses:

```json
{
  "vars": {
    "TO_EMAIL": "your-email@example.com",
    "FROM_EMAIL": "noreply@yourdomain.com"
  }
}
```

### 2. Configure Cloudflare Email Worker

Cloudflare Email Worker allows you to send emails directly from your Worker without external services.

#### Setup Steps:

1. **Enable Email Routing in Cloudflare Dashboard:**
   - Go to your Cloudflare dashboard
   - Select your domain
   - Navigate to Email > Email Routing
   - Enable Email Routing for your domain
   - Add a destination address (where you want to receive emails)
   - Verify your destination address via the email Cloudflare sends you

2. **Configure Email Worker Binding:**

   Update your `wrangler.json` to include the Email Worker binding:

   ```json
   {
     "send_email": [
       {
         "name": "EMAIL",
         "destination_address": "your-email@example.com"
       }
     ]
   }
   ```

3. **DNS Configuration:**

   Cloudflare Email Routing will automatically configure the necessary DNS records (MX records) for your domain. No manual SPF or DKIM configuration is required.

### 3. Deploy to Cloudflare

```bash
# Build and deploy your site
npm run build
npm run deploy
```

### 4. Test the Contact Form

1. Visit your live site at your domain's `/contact` page
2. Fill out the contact form
3. Check your destination email address for the submission

## How Cloudflare Email Worker Works

✅ **No external dependencies** - Built into Cloudflare Workers  
✅ **Free for Cloudflare Workers** - No additional costs  
✅ **Automatic DNS setup** - MX records configured automatically  
✅ **Reliable delivery** - Enterprise-grade email service  
✅ **No SPF/DKIM manual setup** - Cloudflare handles authentication

## Form Validation

The form includes:
- ✅ Required field validation
- ✅ Email format validation
- ✅ Length limits
- ✅ Honeypot spam protection
- ✅ Server-side validation
- ✅ CORS handling

## Troubleshooting

### Email not sending?
1. **Check Email Routing is enabled** - Verify in Cloudflare Dashboard > Email > Email Routing
2. **Verify destination address** - Make sure you clicked the verification link in the email from Cloudflare
3. **Check browser console** - Look for API errors
4. **Check Cloudflare logs** - View Worker execution logs in the dashboard
5. **Verify deployment** - Ensure `/api/contact` endpoint exists

### Common Issues:
- **Email Routing not enabled**: Enable it in your Cloudflare Dashboard
- **Destination address not verified**: Check your email for the verification link from Cloudflare
- **Wrong email binding configuration**: Verify `send_email` in `wrangler.json` matches your setup
- **API not deployed**: Run `npm run deploy` again

### Test API endpoint directly:
```bash
curl -X POST https://yourdomain.com/api/contact \
  -F "name=Test User" \
  -F "email=test@example.com" \
  -F "message=Test message"
```

## Security Features

- **Honeypot field** - Catches basic bots
- **Server-side validation** - All inputs validated on the server
- **CORS protection** - Configured to only accept requests from your domain
- **Rate limiting** - Consider adding rate limiting for high-traffic sites
- **Input sanitization** - HTML in messages is escaped

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `TO_EMAIL` | Email address to receive contact form submissions | `contact@example.com` |
| `FROM_EMAIL` | Email address to use as the sender | `noreply@example.com` |

Set these in your `wrangler.json` file under the `vars` section.

## Development

To test locally:
```bash
npm run preview
```

Note: Email sending will only work when deployed to Cloudflare Workers, not in local development.

## Benefits of Cloudflare Email Worker

Compared to the previous MailChannels setup:
- ✅ **Simpler configuration** - No SPF records to manually configure
- ✅ **Better integration** - Native Cloudflare service
- ✅ **More reliable** - Backed by Cloudflare's infrastructure
- ✅ **Easier debugging** - Integrated with Cloudflare dashboard
- ✅ **No third-party dependencies** - Everything within Cloudflare
