import type { APIRoute } from 'astro';

// Ensure this route is server-rendered, not pre-rendered
export const prerender = false;

// TypeScript interfaces for type safety
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
}

interface Env {
  SEND_EMAIL?: SendEmail;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Improved email validation regex (RFC 5322 compliant)
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Rate limiting storage (in-memory, resets on worker restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// HTML entity escaping to prevent XSS attacks
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Sanitize email header to prevent email header injection
function sanitizeEmailHeader(value: string): string {
  // Remove any newline characters that could be used for header injection
  return value.replace(/[\r\n]/g, '').trim();
}

// Rate limiting: max 5 requests per IP per 15 minutes
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 });
    return true;
  }

  if (limit.count >= 5) {
    return false;
  }

  limit.count++;
  return true;
}

// Simple honeypot and basic validation
function validateFormData(data: ContactFormData): ValidationResult {
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

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Function to send email using Cloudflare Email Routing
async function sendEmail(formData: ContactFormData, sendEmailBinding: SendEmail) {
  // Escape all user inputs to prevent XSS
  const safeName = escapeHtml(formData.name);
  const safeEmail = escapeHtml(formData.email);
  const safeSubject = escapeHtml(formData.subject || 'No subject');
  const safeMessage = escapeHtml(formData.message).replace(/\n/g, '<br>');

  const plainTextMessage = formData.message;
  const boundary = `boundary-${Date.now()}`;
  const timestamp = new Date().toLocaleString();

  // Sanitize email headers to prevent injection attacks
  const sanitizedEmail = sanitizeEmailHeader(formData.email);
  const sanitizedSubject = sanitizeEmailHeader(formData.subject || 'No subject');

  // Generate a unique Message-ID using a cryptographically secure random UUID
  const messageId = `<${(typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : require('crypto').randomUUID())}@alan.one>`;

  // Create RFC 5322 formatted email (MIME message)
  const emailContent = [
    `From: Portfolio Contact Form <noreply@alan.one>`,
    `To: Alan Zheng <hey@alanszheng.com>`,
    `Reply-To: ${sanitizedEmail}`,
    `Subject: Portfolio Contact: ${sanitizedSubject}`,
    `Message-ID: ${messageId}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    `Date: ${new Date().toUTCString()}`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset=utf-8`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    `New Contact Form Submission`,
    ``,
    `Name: ${formData.name}`,
    `Email: ${formData.email}`,
    `Subject: ${formData.subject || 'No subject'}`,
    ``,
    `Message:`,
    `${plainTextMessage}`,
    ``,
    `---`,
    `Sent from your portfolio contact form at ${timestamp}`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=utf-8`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    `<html>`,
    `<body>`,
    `<h2>New Contact Form Submission</h2>`,
    `<p><strong>Name:</strong> ${safeName}</p>`,
    `<p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>`,
    `<p><strong>Subject:</strong> ${safeSubject}</p>`,
    `<p><strong>Message:</strong></p>`,
    `<p>${safeMessage}</p>`,
    `<hr>`,
    `<p><small>Sent from your portfolio contact form at ${timestamp}</small></p>`,
    `</body>`,
    `</html>`,
    ``,
    `--${boundary}--`,
  ].join('\r\n');

  try {
    // Use Cloudflare Email Routing Send API
    // EmailMessage expects: from (string), to (string), raw (string | ReadableStream)
    const { EmailMessage } = await import('cloudflare:email');
    const message = new EmailMessage(
      'noreply@alan.one',
      'hey@alanszheng.com',
      emailContent
    );

    await sendEmailBinding.send(message);
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const POST: APIRoute = async ({ request, clientAddress, locals }) => {
  // Allowed origin for CORS (update this to your actual domain)
  const allowedOrigin = 'https://alan.one';

  try {
    // Get the email binding from runtime
    const runtime = locals.runtime as { env: Env };
    const sendEmailBinding = runtime?.env?.SEND_EMAIL;

    if (!sendEmailBinding) {
      console.error('SEND_EMAIL binding not found');
      return new Response(JSON.stringify({
        success: false,
        message: 'Email service is not configured. Please contact the administrator.'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': allowedOrigin,
        }
      });
    }

    // Rate limiting check
    const clientIp = clientAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Too many requests. Please try again later.'
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': allowedOrigin,
          'Retry-After': '900', // 15 minutes in seconds
        }
      });
    }

    // Parse form data
    const formData = await request.formData();
    const data: ContactFormData = {
      name: formData.get('name')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      subject: formData.get('subject')?.toString() || '',
      message: formData.get('message')?.toString() || '',
      website: formData.get('website')?.toString() || '', // Honeypot field
    };

    // Validate form data
    const validation = validateFormData(data);
    if (!validation.isValid) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    // Send email
    await sendEmail(data, sendEmailBinding);

    return new Response(JSON.stringify({
      success: true,
      message: 'Thank you for your message! I\'ll get back to you soon.'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowedOrigin,
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
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
};

// Handle CORS preflight requests
export const OPTIONS: APIRoute = async () => {
  const allowedOrigin = 'https://alan.one';

  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
};
