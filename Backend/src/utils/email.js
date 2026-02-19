/**
 * Email sending via Resend.
 * 
 * Configuration:
 * - RESEND_API_KEY: Your Resend API key (get from https://resend.com/api-keys)
 * - RESEND_FROM_EMAIL: Verified sender email (e.g. "noreply@yourdomain.com" or "Ritwil <noreply@yourdomain.com>")
 * 
 * Domain must be verified in Resend Dashboard: https://resend.com/domains
 */

let resendClient = null;

async function getResendClient() {
  if (resendClient !== null) return resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      console.warn("RESEND_API_KEY not configured. Email functionality disabled.");
    }
    return null;
  }
  try {
    const { Resend } = await import("resend");
    resendClient = new Resend(apiKey);
    return resendClient;
  } catch (error) {
    console.error("Failed to initialize Resend client:", error);
    return null;
  }
}

/**
 * Send password reset email
 * @param {string} toEmail - Recipient email address
 * @param {string} resetLink - Password reset link
 * @returns {Promise<{sent: boolean, error?: string}>}
 */
export async function sendPasswordResetEmail(toEmail, resetLink) {
  const resend = await getResendClient();
  if (!resend) {
    return { sent: false, error: "Resend client not configured" };
  }
  
  const from = process.env.RESEND_FROM_EMAIL || "noreply@ritwil.com";
  
  try {
    const { data, error } = await resend.emails.send({
      from,
      to: toEmail,
      subject: "Reset your password",
      text: `Use this link to reset your password (valid for 1 hour):\n\n${resetLink}`,
      html: `<p>Use this link to reset your password (valid for 1 hour):</p><p><a href="${resetLink}">${resetLink}</a></p>`,
    });

    if (error) {
      console.error("Resend API error:", error);
      return { sent: false, error: error.message || "Failed to send email" };
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("Email sent successfully:", data);
    }

    return { sent: true };
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
    return { 
      sent: false, 
      error: error.message || "Unexpected error sending email" 
    };
  }
}

/**
 * Check if email is configured
 * @returns {boolean}
 */
export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}
