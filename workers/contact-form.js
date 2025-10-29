/**
 * Cloudflare Worker for Contact Form Processing
 * 
 * This worker handles form submissions from the contact page,
 * validates the input, and sends emails using MailChannels API.
 */

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Configuration
const CONFIG = {
  // Email addresses
  RECIPIENT_EMAIL: 'astro@alan.one',
  RECIPIENT_NAME: 'Alan Zheng',
  SENDER_EMAIL: 'noreply@alan.one',
  SENDER_NAME: 'Portfolio Contact Form',
  
  // Validation limits
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 254,
  MIN_MESSAGE_LENGTH: 10,
  MAX_MESSAGE_LENGTH: 5000,
  MAX_SUBJECT_LENGTH: 200,
  
  // CORS
  ALLOWED_ORIGINS: [
    'https://alan.one',
    'https://www.alan.one',
    'http://localhost:4321',
    'http://localhost:8788',
  ],
};

/**
 * Validate form data
 * @param {Object} data - Form data to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
function validateFormData(data) {
  const errors = [];
  
  // Check for honeypot field (should be empty)
  if (data.website) {
    errors.push('Spam detected');
  }
  
  // Validate name
  if (!data.name || data.name.trim().length < CONFIG.MIN_NAME_LENGTH) {
    errors.push(`Name must be at least ${CONFIG.MIN_NAME_LENGTH} characters`);
  } else if (data.name.length > CONFIG.MAX_NAME_LENGTH) {
    errors.push(`Name must not exceed ${CONFIG.MAX_NAME_LENGTH} characters`);
  }
  
  // Validate email
  if (!data.email || !EMAIL_REGEX.test(data.email)) {
    errors.push('Please enter a valid email address');
  } else if (data.email.length > CONFIG.MAX_EMAIL_LENGTH) {
    errors.push(`Email must not exceed ${CONFIG.MAX_EMAIL_LENGTH} characters`);
  }
  
  // Validate message
  if (!data.message || data.message.trim().length < CONFIG.MIN_MESSAGE_LENGTH) {
    errors.push(`Message must be at least ${CONFIG.MIN_MESSAGE_LENGTH} characters`);
  } else if (data.message.length > CONFIG.MAX_MESSAGE_LENGTH) {
    errors.push(`Message must not exceed ${CONFIG.MAX_MESSAGE_LENGTH} characters`);
  }
  
  // Validate subject (optional field)
  if (data.subject && data.subject.length > CONFIG.MAX_SUBJECT_LENGTH) {
    errors.push(`Subject must not exceed ${CONFIG.MAX_SUBJECT_LENGTH} characters`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Send email using MailChannels API
 * @param {Object} formData - Validated form data
 * @returns {Promise<Response>}
 */
async function sendEmail(formData) {
  const emailData = {
    personalizations: [
      {
        to: [{ 
          email: CONFIG.RECIPIENT_EMAIL, 
          name: CONFIG.RECIPIENT_NAME 
        }],
        subject: `Portfolio Contact: ${formData.subject || 'New Message'}`,
      }
    ],
    from: {
      email: CONFIG.SENDER_EMAIL,
      name: CONFIG.SENDER_NAME,
    },
    content: [
      {
        type: 'text/html',
        value: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
                color: white;
                padding: 20px;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background: #f9fafb;
                padding: 20px;
                border-radius: 0 0 8px 8px;
              }
              .field {
                margin-bottom: 15px;
                padding: 12px;
                background: white;
                border-radius: 6px;
                border-left: 4px solid #8b5cf6;
              }
              .field strong {
                color: #6366f1;
                display: block;
                margin-bottom: 5px;
              }
              .message-content {
                white-space: pre-wrap;
                word-wrap: break-word;
              }
              .footer {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2 style="margin: 0;">New Contact Form Submission</h2>
            </div>
            <div class="content">
              <div class="field">
                <strong>Name:</strong>
                ${escapeHtml(formData.name)}
              </div>
              <div class="field">
                <strong>Email:</strong>
                <a href="mailto:${escapeHtml(formData.email)}">${escapeHtml(formData.email)}</a>
              </div>
              ${formData.subject ? `
                <div class="field">
                  <strong>Subject:</strong>
                  ${escapeHtml(formData.subject)}
                </div>
              ` : ''}
              <div class="field">
                <strong>Message:</strong>
                <div class="message-content">${escapeHtml(formData.message)}</div>
              </div>
              <div class="footer">
                <p>Sent from your portfolio contact form at ${new Date().toLocaleString('en-US', { 
                  dateStyle: 'full', 
                  timeStyle: 'long' 
                })}</p>
              </div>
            </div>
          </body>
          </html>
        `
      }
    ]
  };

  // Send email via MailChannels
  const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`MailChannels API error: ${response.status} - ${errorText}`);
  }

  return response;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string}
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Check if origin is allowed
 * @param {string} origin - Request origin
 * @returns {boolean}
 */
function isOriginAllowed(origin) {
  if (!origin) return false;
  return CONFIG.ALLOWED_ORIGINS.includes(origin) || 
         origin.endsWith('.pages.dev'); // Allow Cloudflare Pages preview URLs
}

/**
 * Get CORS headers
 * @param {string} origin - Request origin
 * @returns {Object}
 */
function getCorsHeaders(origin) {
  const allowedOrigin = isOriginAllowed(origin) ? origin : CONFIG.ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Create JSON response
 * @param {Object} data - Response data
 * @param {number} status - HTTP status code
 * @param {Object} additionalHeaders - Additional headers
 * @returns {Response}
 */
function jsonResponse(data, status = 200, additionalHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...additionalHeaders,
    },
  });
}

/**
 * Handle POST request
 * @param {Request} request - Incoming request
 * @returns {Promise<Response>}
 */
async function handlePost(request) {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);
  
  try {
    // Parse form data
    const contentType = request.headers.get('Content-Type') || '';
    let formData;
    
    if (contentType.includes('application/json')) {
      // Handle JSON request
      const json = await request.json();
      formData = {
        name: json.name || '',
        email: json.email || '',
        subject: json.subject || '',
        message: json.message || '',
        website: json.website || '',
      };
    } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      // Handle form data
      const form = await request.formData();
      formData = {
        name: form.get('name')?.toString() || '',
        email: form.get('email')?.toString() || '',
        subject: form.get('subject')?.toString() || '',
        message: form.get('message')?.toString() || '',
        website: form.get('website')?.toString() || '',
      };
    } else {
      return jsonResponse(
        {
          success: false,
          message: 'Invalid Content-Type. Expected application/json or form data.',
        },
        400,
        corsHeaders
      );
    }

    // Validate form data
    const validation = validateFormData(formData);
    if (!validation.valid) {
      return jsonResponse(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
        },
        400,
        corsHeaders
      );
    }

    // Send email
    await sendEmail(formData);

    return jsonResponse(
      {
        success: true,
        message: "Thank you for your message! I'll get back to you soon.",
      },
      200,
      corsHeaders
    );

  } catch (error) {
    console.error('Contact form error:', error);
    
    return jsonResponse(
      {
        success: false,
        message: 'Sorry, there was an error sending your message. Please try again later.',
        error: error.message,
      },
      500,
      corsHeaders
    );
  }
}

/**
 * Handle OPTIONS request (CORS preflight)
 * @param {Request} request - Incoming request
 * @returns {Response}
 */
function handleOptions(request) {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);
  
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Main fetch handler
 * @param {Request} request - Incoming request
 * @param {Object} env - Environment bindings
 * @param {Object} ctx - Execution context
 * @returns {Promise<Response>}
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const corsHeaders = getCorsHeaders(origin);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    // Only accept POST requests
    if (request.method === 'POST') {
      return handlePost(request);
    }

    // Method not allowed
    return jsonResponse(
      {
        success: false,
        message: 'Method not allowed. Only POST requests are accepted.',
      },
      405,
      corsHeaders
    );
  }
};
