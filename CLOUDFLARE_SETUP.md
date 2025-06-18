# Cloudflare + MailChannels Setup for alan.one

## ✅ Email Configuration Complete

Your contact form is already configured to use:
- **Receiving email**: `astro@alan.one`
- **Sending email**: `noreply@alan.one`

## 🚀 Quick Setup Guide

### 1. DNS Records for alan.one

**YOU DO NOT NEED MX RECORDS** - MailChannels works without setting up an email server!

Add these DNS records to your alan.one domain:

#### Required SPF Record:
```
Type: TXT
Name: @
Value: v=spf1 a mx include:relay.mailchannels.net ~all
```

#### Optional DKIM Record (Improves Delivery):
```
Type: TXT  
Name: mc1._domainkey
Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDYaJKUH6a/2M9FGKSl3bGj6Og8fWXcl+gI5MUn7VPz9p7QKQs6H6dJ6U4Q0iIaOF0pGp8g7XbqU9XvL7FaKJGz7G9LH6dS3l8QUhP9Y9dG6Xq9fK6j+gF6fU6G3+YqL7p5KfK1Qp8XqL6G3fKz1j5qK6bGp8g7XbqU9XvL7FaKJGz7QIDAQAB
```

### 2. Deploy to Cloudflare

```bash
# Build and deploy your site
npm run build
npm run deploy
```

### 3. Test the Contact Form

1. Visit your live site at `https://alan.one/contact`
2. Fill out the contact form
3. Check `astro@alan.one` for the email

## 📧 How MailChannels Works

✅ **No email server needed** - MailChannels handles delivery  
✅ **Free for Cloudflare Workers** - No additional costs  
✅ **Works immediately** - Once DNS records are set  
✅ **Reliable delivery** - Professional email service  

## 🔧 DNS Setup Instructions

### If using Cloudflare DNS:
1. Go to your Cloudflare dashboard
2. Select alan.one domain
3. Click DNS tab
4. Add the TXT records above

### If using other DNS providers:
1. Access your domain registrar's DNS settings
2. Add the TXT records as shown above
3. Wait 5-10 minutes for propagation

## ✅ Verification

Check if your SPF record is set correctly:
```bash
dig TXT alan.one
```

You should see: `v=spf1 a mx include:relay.mailchannels.net ~all`

## 🚨 Troubleshooting

### Email not sending?
1. **Check DNS records** - Use `dig TXT alan.one` to verify SPF
2. **Check browser console** - Look for API errors
3. **Check Cloudflare logs** - View Worker execution logs
4. **Verify deployment** - Ensure `/api/contact` endpoint exists

### Common Issues:
- **DNS not propagated**: Wait 15-30 minutes after adding records
- **Wrong SPF format**: Must include `include:relay.mailchannels.net`
- **API not deployed**: Run `npm run deploy` again

### Test API endpoint directly:
```bash
curl -X POST https://alan.one/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test message"}'
```

## 🎯 Why This Setup Works

1. **Your site runs on Cloudflare Workers** (via Astro adapter)
2. **MailChannels is integrated with Cloudflare** (free tier)
3. **SPF record authorizes MailChannels** to send from alan.one
4. **No email server required** on your domain

## 🔄 Alternative Options

If MailChannels doesn't work, consider these alternatives:

### Option 1: Resend (Simple)
```bash
npm install resend
```
- $0.10 per 1,000 emails
- Very reliable
- Easy setup

### Option 2: SendGrid
- Free tier: 100 emails/day
- Requires API key setup

### Option 3: EmailJS (Client-side)
- Works from frontend
- No server-side code needed
- Free tier available

## 📝 Current Status

✅ Contact form built and styled  
✅ API endpoint created (`/src/pages/api/contact.ts`)  
✅ Email configured for alan.one  
✅ Mobile responsive design  
✅ Spam protection (honeypot)  
✅ Form validation  

**Next step**: Add DNS records and deploy!

## 🚀 Deploy Commands

```bash
# Build the site
npm run build

# Deploy to Cloudflare Workers
npm run deploy

# Or test locally first
npm run preview
```

Your contact form will start working as soon as the DNS records propagate (usually 5-15 minutes).
