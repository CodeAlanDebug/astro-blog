# Cloudflare + Email Worker Setup

## ✅ Email Configuration Complete

Your contact form is configured to use Cloudflare's Email Worker for sending emails.

## 🚀 Quick Setup Guide

### 1. Enable Email Routing

**YOU DO NOT NEED MX RECORDS OR SPF CONFIGURATION** - Cloudflare Email Worker handles all email infrastructure!

#### Steps to Enable Email Routing:

1. **Log into your Cloudflare Dashboard**
2. **Select your domain**
3. **Navigate to Email > Email Routing**
4. **Click "Enable Email Routing"**
5. **Add a destination address** (where you want to receive contact form emails)
6. **Verify your email address** (Cloudflare will send you a verification email)

### 2. Configure wrangler.json

Update your `wrangler.json` file with your email configuration:

```json
{
  "name": "astro-blog-starter",
  "compatibility_date": "2025-04-01",
  "compatibility_flags": ["nodejs_compat"],
  "main": "./dist/_worker.js/index.js",
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS"
  },
  "send_email": [
    {
      "name": "EMAIL",
      "destination_address": "your-email@example.com"
    }
  ],
  "vars": {
    "TO_EMAIL": "your-email@example.com",
    "FROM_EMAIL": "noreply@yourdomain.com"
  }
}
```

Replace:
- `your-email@example.com` with the email address you verified in Email Routing
- `noreply@yourdomain.com` with an email from your domain (this will be the sender)

### 3. Deploy to Cloudflare

```bash
# Build and deploy your site
npm run build
npm run deploy
```

### 4. Test the Contact Form

1. Visit your live site at `https://yourdomain.com/contact`
2. Fill out the contact form
3. Check your verified destination email for the submission

## 📧 How Cloudflare Email Worker Works

✅ **No email server needed** - Cloudflare handles all email delivery  
✅ **Free for Cloudflare Workers** - No additional costs  
✅ **Works immediately** - Once Email Routing is enabled and verified  
✅ **Reliable delivery** - Enterprise-grade Cloudflare infrastructure  
✅ **No DNS configuration** - MX records are handled automatically  
✅ **No SPF/DKIM setup** - Email authentication is handled by Cloudflare  

## 🔧 Configuration Details

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `TO_EMAIL` | Where contact form submissions are sent | `contact@example.com` |
| `FROM_EMAIL` | Sender email address | `noreply@example.com` |

### Email Worker Binding

The `send_email` binding in `wrangler.json` connects your Worker to Cloudflare's Email Routing service:

```json
"send_email": [
  {
    "name": "EMAIL",
    "destination_address": "your-verified@email.com"
  }
]
```

- `name`: The binding name used in your code (must be "EMAIL")
- `destination_address`: Must match an email address verified in Email Routing

## ✅ Verification

To verify your setup is working:

1. **Check Email Routing Status:**
   - Go to Cloudflare Dashboard > Email > Email Routing
   - Ensure status shows "Active"
   - Verify your destination address shows as "Verified"

2. **Test the Contact Form:**
   - Submit a test message through your contact form
   - Check your destination email
   - Look for an email from your `FROM_EMAIL` address

## 🚨 Troubleshooting

### Email not sending?

1. **Email Routing not enabled**
   - Go to Cloudflare Dashboard > Email > Email Routing
   - Click "Enable Email Routing"

2. **Destination address not verified**
   - Check your email for verification link from Cloudflare
   - Click the link to verify

3. **Wrong binding configuration**
   - Ensure `send_email` in `wrangler.json` has the correct structure
   - Verify `destination_address` matches your verified email

4. **Check Worker logs**
   - Go to Cloudflare Dashboard > Workers & Pages
   - Select your worker
   - View "Logs" tab for errors

### Common Issues:

- **"Email service not configured" error**: Check that `send_email` binding is correctly defined in `wrangler.json`
- **Email not received**: Verify the destination address in both Email Routing and `wrangler.json`
- **"Permission denied" errors**: Ensure Email Routing is enabled for your domain
- **Build errors**: Run `npm run build` to check for TypeScript errors

### Test API endpoint directly:
```bash
curl -X POST https://yourdomain.com/api/contact \
  -F "name=Test User" \
  -F "email=test@example.com" \
  -F "message=Test message from curl"
```

## 🎯 Why This Setup Works

1. **Your site runs on Cloudflare Workers** (via Astro adapter)
2. **Email Routing is enabled** on your Cloudflare domain
3. **Email Worker binding** connects your Worker to Email Routing
4. **No external email service needed** - everything is within Cloudflare
5. **No DNS configuration required** - MX records are automatic

## 📝 Current Features

✅ Contact form built and styled  
✅ API endpoint created (`/src/pages/api/contact.ts`)  
✅ Cloudflare Email Worker integration  
✅ Mobile responsive design  
✅ Spam protection (honeypot)  
✅ Form validation  
✅ CORS handling  

## 🚀 Deploy Commands

```bash
# Build the site
npm run build

# Deploy to Cloudflare Workers
npm run deploy

# Or test locally first (email won't send in local mode)
npm run preview
```

## 🔄 Differences from MailChannels

This setup is simpler and more integrated than the previous MailChannels approach:

| Feature | Email Worker | MailChannels |
|---------|-------------|--------------|
| DNS Setup | Automatic | Manual SPF records required |
| Configuration | Built into Cloudflare | External API |
| Reliability | Cloudflare infrastructure | Third-party service |
| Cost | Free (included) | Free (but separate) |
| Integration | Native dashboard | External |
| Debugging | Cloudflare logs | API errors |

Your contact form will start working as soon as Email Routing is enabled and your destination address is verified!
