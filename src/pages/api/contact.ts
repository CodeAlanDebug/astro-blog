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

// Function to send email using MailChannels (free for Cloudflare Workers)
async function sendEmail(formData: any) {
  const emailData = {
    personalizations: [
      {
        to: [{ email: 'astro@alan.one', name: 'Alan Zheng' }], // Your receiving email
        subject: `Portfolio Contact: ${formData.subject || 'New Message'}`,
      }
    ],
    from: {
      email: 'noreply@alan.one', // Your domain email for sending
      name: 'Portfolio Contact Form'
    },
    content: [
      {
        type: 'text/html',
        value: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Subject:</strong> ${formData.subject || 'No subject'}</p>
          <p><strong>Message:</strong></p>
          <p>${formData.message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><small>Sent from your portfolio contact form at ${new Date().toLocaleString()}</small></p>
        `
      }
    ]
  };

  // MailChannels API (free for Cloudflare Workers)
  // Note: You may need to add SPF records to your domain for MailChannels
  // Add this TXT record to your domain: "v=spf1 a mx include:relay.mailchannels.net ~all"
  const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send email: ${response.status} - ${errorText}`);
  }

  return response;
}

export const POST: APIRoute = async ({ request }) => {
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

    // Send email
    await sendEmail(data);

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
