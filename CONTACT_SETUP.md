# Contact Form Setup for alan.one

This contact form is configured to work with Cloudflare Workers and uses MailChannels for sending emails.

## Setup Instructions for alan.one Domain

### 1. Update Email Configuration

Edit `/src/pages/api/contact.ts` and replace the email addresses:

```typescript
// Line 45: Your receiving email
to: [{ email: 'astro@alan.one', name: 'Alan Zheng' }],

// Line 50: Your sending email (from your domain)
email: 'noreply@alan.one',
```

### 2. Configure MailChannels (Free Option for alan.one)

MailChannels is free for Cloudflare Workers. Here's what you need to set up:

#### DNS Records for alan.one:

1. **SPF Record** (Required):
   ```
   Type: TXT
   Name: alan.one (or @)
   Value: v=spf1 a mx include:relay.mailchannels.net ~all
   ```

2. **DKIM Record** (Recommended for better delivery):
   ```
   Type: TXT
   Name: mailchannels._domainkey.alan.one
   Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDYuzG2QkmGEf43a9K4qr49NNJ4YI0TCB8a2w3Wq7EIEyT2eR7EwXqnBH0R9RBGVByoXNthm7w3i1lGcJxp7kJkR8G9wbXqLKx9Q0PnQt9QOCJKKLt5HwV3Hm0wHWA9LNyqzO6Vp9g0WfXx0GN9fYKX9KQhJOqFjh2Hw6W0QIDAQAB
   ```

3. **DMARC Record** (Optional but recommended):
   ```
   Type: TXT
   Name: _dmarc.alan.one
   Value: v=DMARC1; p=none; rua=mailto:dmarc@alan.one
   ```

#### Email Configuration Steps:
1. Log into your domain registrar (where alan.one is registered)
2. Go to DNS management
3. Add the SPF record above
4. Add the DKIM record (optional but recommended)
5. Save changes and wait for DNS propagation (up to 24 hours)

### 3. Alternative Email Services

If you prefer not to use MailChannels, you can replace the email sending function with:

#### Option A: Resend (Recommended)
```bash
npm install resend
```

```typescript
import { Resend } from 'resend';
const resend = new Resend('your-api-key');

// Replace sendEmail function with:
await resend.emails.send({
  from: 'noreply@your-domain.com',
  to: 'your-email@example.com',
  subject: `Portfolio Contact: ${formData.subject || 'New Message'}`,
  html: `<!-- your email template -->`
});
```

#### Option B: SendGrid
```bash
npm install @sendgrid/mail
```

#### Option C: Nodemailer with SMTP

### 4. Environment Variables

For production, consider using environment variables for sensitive data:

```typescript
// In wrangler.toml
[vars]
CONTACT_EMAIL = "your-email@example.com"
FROM_EMAIL = "noreply@your-domain.com"

// In your API route
const contactEmail = env.CONTACT_EMAIL;
```

### 5. Testing

1. Deploy to Cloudflare Workers:
   ```bash
   npm run deploy
   ```

2. Test the contact form on your live site

3. Check your email for submissions

### 6. Form Validation

The form includes:
- ✅ Required field validation
- ✅ Email format validation
- ✅ Length limits
- ✅ Honeypot spam protection
- ✅ Server-side validation
- ✅ Rate limiting (consider adding)

### 7. Additional Security (Optional)

Consider adding:
- Rate limiting per IP
- CAPTCHA for high-traffic sites
- Content filtering for spam keywords

## Troubleshooting

- **Email not sending**: Check SPF records and email configuration
- **CORS errors**: API routes handle CORS automatically
- **Validation errors**: Check form field names match API expectations
- **Build errors**: Ensure TypeScript types are correct

## Development

To test locally:
```bash
npm run preview
```

The form will work in development mode but emails won't send without proper configuration.
