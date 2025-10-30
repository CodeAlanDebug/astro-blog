import type { APIRoute } from 'astro';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple honeypot and basic validation
function validateFormData(data: any) {
  const errors: string[] = [];
  
  // Check for honeypot field (should be empty)
  if (data.website) {
    errors.push('Spam detected');
  }
  
  // Validate required fields
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!data.message || data.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters');
  }
  
  // Basic length limits
  if (data.name && data.name.length > 100) {
    errors.push('Name too long');
  }
  
  if (data.email && data.email.length > 254) {
    errors.push('Email too long');
  }
  
  if (data.message && data.message.length > 5000) {
    errors.push('Message too long');
  }
  
  return errors;
}

// Function to send email using Cloudflare Email Worker
async function sendEmail(formData: any, env: any) {
  // Use Cloudflare's Email Worker Send API
  // The EMAIL binding should be configured in wrangler.json
  if (!env.EMAIL) {
    throw new Error('Email service not configured. Please bind an Email Worker to your Cloudflare Worker in wrangler.json.');
  }

  try {
    // Create email message
    const message = new EmailMessage(
      env.FROM_EMAIL || 'noreply@example.com',
      env.TO_EMAIL || 'contact@example.com',
      `
From: Portfolio Contact Form <${env.FROM_EMAIL || 'noreply@example.com'}>
To: <${env.TO_EMAIL || 'contact@example.com'}>
Reply-To: ${formData.email}
Subject: Portfolio Contact: ${formData.subject || 'New Message'}
Content-Type: text/html; charset=utf-8

<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    h2 { color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
    .field { margin-bottom: 15px; }
    .field strong { display: inline-block; width: 100px; color: #555; }
    .message { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; color: #777; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>New Contact Form Submission</h2>
    <div class="field">
      <strong>Name:</strong> ${formData.name}
    </div>
    <div class="field">
      <strong>Email:</strong> ${formData.email}
    </div>
    <div class="field">
      <strong>Subject:</strong> ${formData.subject || 'No subject'}
    </div>
    <div class="field">
      <strong>Message:</strong>
      <div class="message">${formData.message.replace(/\n/g, '<br>')}</div>
    </div>
    <div class="footer">
      <p>Sent from your portfolio contact form at ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
`.trim()
    );

    await env.EMAIL.send(message);
  } catch (error) {
    throw new Error(`Failed to send email via Cloudflare Email Worker: ${error}`);
  }
}

// EmailMessage helper class for Cloudflare Email Worker
class EmailMessage {
  constructor(
    public from: string,
    public to: string,
    public rawBody: string
  ) {}
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse form data
    const formData = await request.formData();
    const data = {
      name: formData.get('name')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      subject: formData.get('subject')?.toString() || '',
      message: formData.get('message')?.toString() || '',
      website: formData.get('website')?.toString() || '', // Honeypot field
    };

    // Validate form data
    const errors = validateFormData(data);
    if (errors.length > 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Validation failed',
        errors
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    // Send email using Cloudflare Email Worker
    // Access the runtime environment from locals.runtime.env
    const env = (locals as any)?.runtime?.env || {};
    await sendEmail(data, env);

    return new Response(JSON.stringify({
      success: true,
      message: 'Thank you for your message! I\'ll get back to you soon.'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Sorry, there was an error sending your message. Please try again later.'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
};

// Handle CORS preflight requests
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
};
