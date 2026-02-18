/**
 * Optional email sending via Resend. Configure RESEND_API_KEY in .env to send password-reset emails.
 * Env: RESEND_API_KEY, RESEND_FROM_EMAIL (e.g. "noreply@yourdomain.com" or "Ritwil <noreply@yourdomain.com>")
 */

let resendClient = null;

async function getResendClient() {
  if (resendClient !== null) return resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  try {
    const { Resend } = await import("resend");
    resendClient = new Resend(apiKey);
    return resendClient;
  } catch {
    return null;
  }
}

export async function sendPasswordResetEmail(toEmail, resetLink) {
  const resend = await getResendClient();
  if (!resend) return { sent: false };
  
  const from = process.env.RESEND_FROM_EMAIL || "noreply@ritwil.com";
  
  try {
    await resend.emails.send({
      from,
      to: toEmail,
      subject: "Reset your password",
      text: `Use this link to reset your password (valid for 1 hour):\n\n${resetLink}`,
      html: `<p>Use this link to reset your password (valid for 1 hour):</p><p><a href="${resetLink}">${resetLink}</a></p>`,
    });
    return { sent: true };
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
    return { sent: false };
  }
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}
