/**
 * Email sender using Resend (or similar service)
 * Configure RESEND_API_KEY in environment variables
 */

// For now, we'll use a simple implementation
// In production, integrate with Resend, SendGrid, or similar

export async function sendEmail(
  to: string,
  template: { subject: string; html: string; text: string }
): Promise<void> {
  // TODO: Integrate with Resend API
  // For now, log the email (in production, this would actually send)
  
  console.log('📧 Email would be sent:', {
    to,
    subject: template.subject,
    // In production, use Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'Flippin <hello@flippin.co.za>',
    //   to,
    //   subject: template.subject,
    //   html: template.html,
    //   text: template.text,
    // });
  });

  // In development, you might want to actually send emails
  // For now, we'll just log them
  if (process.env.NODE_ENV === 'development') {
    console.log('Email content:', template.text);
  }
}

